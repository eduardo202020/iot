import type { BeaconData } from '@/types/beacon';
import { BEACON_SERVICE_UUID } from '@/types/beacon';
import { useCallback, useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';

const bleManager = new BleManager();

export function useBleScanner() {
    const [beacons, setBeacons] = useState<Map<string, BeaconData>>(new Map());
    const [isScanning, setIsScanning] = useState(false);
    const [bleState, setBleState] = useState<State | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Parsear Service Data del beacon
    const parseServiceData = useCallback((serviceData: string): Partial<BeaconData> | null => {
        try {
            // El Service Data viene en base64, lo decodificamos
            const buffer = Buffer.from(serviceData, 'base64');

            // Formato: Room ID (variable) + BEACON_NODE (1) + FW_MAJOR (1) + FW_MINOR (1) + BATTERY_MV (2)
            // Necesitamos al menos 5 bytes después del Room ID
            if (buffer.length < 5) {
                return null;
            }

            // Los últimos 5 bytes son: beaconNode, fwMajor, fwMinor, battery (2 bytes)
            const beaconNode = buffer[buffer.length - 5];
            const firmwareMajor = buffer[buffer.length - 4];
            const firmwareMinor = buffer[buffer.length - 3];

            // Battery en little-endian (2 bytes)
            const batteryMv = buffer.readUInt16LE(buffer.length - 2);

            // Room ID es todo lo que queda al principio
            const roomId = buffer.slice(0, buffer.length - 5).toString('utf-8');

            return {
                roomId,
                beaconNode,
                firmwareMajor,
                firmwareMinor,
                firmwareVersion: `${firmwareMajor}.${firmwareMinor}`,
                battery: batteryMv,
                id: `${roomId}-B${beaconNode.toString().padStart(2, '0')}`,
            };
        } catch (err) {
            console.error('Error parseando Service Data:', err);
            return null;
        }
    }, []);

    // Procesar dispositivo BLE detectado
    const processDevice = useCallback((device: Device) => {
        if (!device.serviceData) return;

        // Buscar el Service Data con nuestro UUID
        const serviceDataEntry = Object.entries(device.serviceData).find(
            ([uuid]) => uuid.toLowerCase() === BEACON_SERVICE_UUID.toLowerCase()
        );

        if (!serviceDataEntry) return;

        const [_, serviceData] = serviceDataEntry;
        const parsedData = parseServiceData(serviceData);

        if (!parsedData || !parsedData.id) return;

        const beaconData: BeaconData = {
            id: parsedData.id,
            roomId: parsedData.roomId || '',
            beaconNode: parsedData.beaconNode || 0,
            rssi: device.rssi || -100,
            txPower: device.txPowerLevel || -12,
            firmwareVersion: parsedData.firmwareVersion || '0.0',
            firmwareMajor: parsedData.firmwareMajor || 0,
            firmwareMinor: parsedData.firmwareMinor || 0,
            battery: parsedData.battery || 0,
            lastSeen: Date.now(),
            deviceAddress: device.id,
        };

        setBeacons((prev) => {
            const updated = new Map(prev);
            updated.set(beaconData.id, beaconData);
            return updated;
        });
    }, [parseServiceData]);

    // Solicitar permisos en Android
    const requestAndroidPermissions = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') return true;

        try {
            if (Platform.Version >= 31) {
                // Android 12+
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);

                return (
                    granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
                );
            } else {
                // Android 11 y anteriores
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );

                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (err) {
            console.error('Error solicitando permisos:', err);
            return false;
        }
    };

    // Iniciar escaneo
    const startScanning = useCallback(async () => {
        try {
            setError(null);

            // Verificar permisos
            const hasPermissions = await requestAndroidPermissions();
            if (!hasPermissions) {
                setError('Permisos de Bluetooth denegados');
                Alert.alert(
                    'Permisos requeridos',
                    'MuseIQ necesita permisos de Bluetooth y ubicación para escanear beacons.'
                );
                return;
            }

            // Verificar estado de Bluetooth
            const state = await bleManager.state();
            if (state !== 'PoweredOn') {
                setError('Bluetooth no está encendido');
                Alert.alert('Bluetooth desactivado', 'Por favor activa el Bluetooth para escanear beacons.');
                return;
            }

            setIsScanning(true);

            // Iniciar escaneo
            bleManager.startDeviceScan(
                null, // Escanear todos los dispositivos
                {
                    allowDuplicates: true, // Permitir duplicados para actualizar RSSI
                },
                (error, device) => {
                    if (error) {
                        console.error('Error escaneando:', error);
                        setError(error.message);
                        return;
                    }

                    if (device) {
                        processDevice(device);
                    }
                }
            );
        } catch (err) {
            console.error('Error iniciando escaneo:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setIsScanning(false);
        }
    }, [processDevice]);

    // Detener escaneo
    const stopScanning = useCallback(() => {
        bleManager.stopDeviceScan();
        setIsScanning(false);
    }, []);

    // Limpiar beacons antiguos (no vistos en los últimos 5 segundos)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setBeacons((prev) => {
                const updated = new Map(prev);
                let hasChanges = false;

                for (const [id, beacon] of updated.entries()) {
                    if (now - beacon.lastSeen > 5000) {
                        updated.delete(id);
                        hasChanges = true;
                    }
                }

                return hasChanges ? updated : prev;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Monitorear estado de Bluetooth
    useEffect(() => {
        const subscription = bleManager.onStateChange((state) => {
            setBleState(state);
            if (state !== 'PoweredOn' && isScanning) {
                stopScanning();
            }
        }, true);

        return () => subscription.remove();
    }, [isScanning, stopScanning]);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            if (isScanning) {
                bleManager.stopDeviceScan();
            }
        };
    }, [isScanning]);

    return {
        beacons: Array.from(beacons.values()).sort((a, b) => b.rssi - a.rssi), // Ordenar por señal más fuerte
        isScanning,
        bleState,
        error,
        startScanning,
        stopScanning,
    };
}
