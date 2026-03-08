import { Buffer } from 'buffer';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';

const SERVICE_UUID = '0000A100-0000-1000-8000-00805F9B34FB';
const CHAR_UUID_RX = '0000A101-0000-1000-8000-00805F9B34FB';
const CHAR_UUID_TX = '0000A102-0000-1000-8000-00805F9B34FB';
const TARGET_DEVICE_NAME = 'ESP32-Bidir';
const SCAN_TIMEOUT_MS = 12000;

const bleManager = new BleManager();

export interface MessageLog {
    id: string;
    direction: 'tx' | 'rx' | 'system';
    kind?: 'text' | 'button' | 'binary';
    text: string;
    ts: number;
}

export interface ScannedDevice {
    id: string;
    name: string;
    rssi: number | null;
    isTarget: boolean;
    hasServiceUuid: boolean;
}

const nextLogId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function useBleBidirectional() {
    const [bleState, setBleState] = useState<State | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<MessageLog[]>([]);
    const [buttonEventCount, setButtonEventCount] = useState(0);
    const [scannedDevices, setScannedDevices] = useState<ScannedDevice[]>([]);

    const monitorRef = useRef<Subscription | null>(null);
    const connectedDeviceIdRef = useRef<string | null>(null);
    const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastKnownDeviceIdRef = useRef<string | null>(null);
    const isConnectingRef = useRef(false);
    const scannedDeviceMapRef = useRef<Map<string, Device>>(new Map());

    const appendLog = useCallback((direction: MessageLog['direction'], text: string) => {
        setMessages((prev) => [
            {
                id: nextLogId(),
                direction,
                kind: direction === 'rx' ? 'text' : undefined,
                text,
                ts: Date.now(),
            },
            ...prev,
        ].slice(0, 80));
    }, []);

    const appendRxLog = useCallback((kind: MessageLog['kind'], text: string) => {
        setMessages((prev) => [
            {
                id: nextLogId(),
                direction: 'rx',
                kind,
                text,
                ts: Date.now(),
            },
            ...prev,
        ].slice(0, 80));

        if (kind === 'button') {
            setButtonEventCount((count) => count + 1);
        }
    }, []);

    const classifyIncomingText = useCallback((value: string): MessageLog['kind'] => {
        const normalized = value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        if (normalized.includes('boton') || normalized.includes('button')) {
            return 'button';
        }

        return 'text';
    }, []);

    const requestAndroidPermissions = useCallback(async (): Promise<boolean> => {
        if (Platform.OS !== 'android') return true;

        if (Platform.Version >= 31) {
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
        }

        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }, []);

    const cleanupMonitor = useCallback(() => {
        try {
            monitorRef.current?.remove();
        } catch {
            // Algunas versiones de ble-plx pueden fallar al remover suscripciones en condiciones de carrera.
        }

        monitorRef.current = null;
    }, []);

    const clearScanTimeout = useCallback(() => {
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }
    }, []);

    const normalizeText = useCallback((value: string) => {
        return value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }, []);

    const isTargetDevice = useCallback((device: Device) => {
        const name = (device.name ?? device.localName ?? '').trim();
        const normalizedName = normalizeText(name);
        const normalizedTarget = normalizeText(TARGET_DEVICE_NAME);
        const hasServiceUuid = (device.serviceUUIDs ?? [])
            .some((uuid) => normalizeText(uuid).includes(normalizeText('0000A100')));

        if (hasServiceUuid) return true;

        if (normalizedName === normalizedTarget) return true;
        if (normalizedName.includes(normalizedTarget)) return true;
        if (normalizedName.includes('esp32') && normalizedName.includes('bidir')) return true;
        if (lastKnownDeviceIdRef.current && device.id === lastKnownDeviceIdRef.current) return true;

        return false;
    }, [normalizeText]);

    const disconnect = useCallback(async () => {
        try {
            bleManager.stopDeviceScan();
            clearScanTimeout();
            cleanupMonitor();
            isConnectingRef.current = false;

            if (connectedDevice) {
                await bleManager.cancelDeviceConnection(connectedDevice.id);
            }

            setConnectedDevice(null);
            connectedDeviceIdRef.current = null;
            setIsScanning(false);
            setIsConnecting(false);
            appendLog('system', 'Desconectado');
        } catch {
            // No-op: si ya estaba desconectado no bloqueamos el flujo.
        }
    }, [appendLog, clearScanTimeout, cleanupMonitor, connectedDevice]);

    const connectToCandidate = useCallback(async (device: Device) => {
        if (isConnectingRef.current) return;

        isConnectingRef.current = true;
        bleManager.stopDeviceScan();
        clearScanTimeout();
        setIsScanning(false);
        setIsConnecting(true);

        const name = (device.name ?? device.localName ?? TARGET_DEVICE_NAME).trim();

        try {
            appendLog('system', `Conectando a ${name} (${device.id})...`);
            const connected = await bleManager.connectToDevice(device.id, { autoConnect: false });
            const discovered = await connected.discoverAllServicesAndCharacteristics();

            cleanupMonitor();

            monitorRef.current = discovered.monitorCharacteristicForService(
                SERVICE_UUID,
                CHAR_UUID_TX,
                (monitorError, characteristic) => {
                    if (monitorError) {
                        setError(monitorError.message);
                        appendLog('system', `Error de notificaciones: ${monitorError.message}`);
                        return;
                    }

                    const encoded = characteristic?.value;
                    if (!encoded) return;

                    try {
                        const raw = Buffer.from(encoded, 'base64');
                        const decoded = raw.toString('utf-8');
                        const kind = classifyIncomingText(decoded);
                        appendRxLog(kind, decoded);
                    } catch {
                        appendRxLog('binary', '(mensaje recibido no UTF-8)');
                    }
                }
            );

            setConnectedDevice(discovered);
            connectedDeviceIdRef.current = discovered.id;
            lastKnownDeviceIdRef.current = discovered.id;
            appendLog('system', 'Conectado y suscrito a notificaciones');
        } catch (connectError) {
            const message = connectError instanceof Error ? connectError.message : 'Error de conexion';
            setError(message);
            appendLog('system', message);
            setConnectedDevice(null);
            connectedDeviceIdRef.current = null;
        } finally {
            setIsConnecting(false);
            isConnectingRef.current = false;
        }
    }, [appendLog, appendRxLog, classifyIncomingText, cleanupMonitor, clearScanTimeout]);

    const connectToDeviceId = useCallback(async (deviceId: string) => {
        const known = scannedDeviceMapRef.current.get(deviceId);
        if (known) {
            await connectToCandidate(known);
            return;
        }

        await connectToCandidate({ id: deviceId } as Device);
    }, [connectToCandidate]);

    const startScanAndConnect = useCallback(async () => {
        setError(null);

        const hasPermissions = await requestAndroidPermissions();
        if (!hasPermissions) {
            setError('No se otorgaron permisos BLE.');
            return;
        }

        if (bleState !== 'PoweredOn') {
            setError('Bluetooth no esta encendido.');
            return;
        }

        setIsScanning(true);
        isConnectingRef.current = false;
        scannedDeviceMapRef.current.clear();
        setScannedDevices([]);
        appendLog('system', `Buscando ${TARGET_DEVICE_NAME}...`);

        clearScanTimeout();
        scanTimeoutRef.current = setTimeout(() => {
            bleManager.stopDeviceScan();
            setIsScanning(false);

            const lastKnownId = lastKnownDeviceIdRef.current;
            if (lastKnownId) {
                appendLog('system', 'No aparecio en scan. Probando reconexion por ultimo ID conocido...');
                connectToCandidate({ id: lastKnownId } as Device);
                return;
            }

            appendLog('system', 'No se encontro el dispositivo en 12s. Acercalo y verifica advertising.');
        }, SCAN_TIMEOUT_MS);

        bleManager.startDeviceScan(null, { allowDuplicates: false }, async (scanError, device) => {
            if (scanError) {
                setError(scanError.message);
                setIsScanning(false);
                clearScanTimeout();
                appendLog('system', `Error de escaneo: ${scanError.message}`);
                return;
            }

            if (!device) return;

            scannedDeviceMapRef.current.set(device.id, device);
            setScannedDevices(() => {
                const list = Array.from(scannedDeviceMapRef.current.values()).map((entry) => {
                    const name = (entry.name ?? entry.localName ?? '').trim();
                    const hasServiceUuid = (entry.serviceUUIDs ?? [])
                        .some((uuid) => normalizeText(uuid).includes(normalizeText('0000A100')));

                    return {
                        id: entry.id,
                        name: name || '(sin nombre)',
                        rssi: entry.rssi ?? null,
                        isTarget: isTargetDevice(entry),
                        hasServiceUuid,
                    } satisfies ScannedDevice;
                });

                return list
                    .sort((a, b) => {
                        if (a.isTarget !== b.isTarget) return a.isTarget ? -1 : 1;
                        return (b.rssi ?? -999) - (a.rssi ?? -999);
                    })
                    .slice(0, 20);
            });

            if (!isTargetDevice(device)) return;

            await connectToCandidate(device);
        });
    }, [appendLog, bleState, clearScanTimeout, connectToCandidate, isTargetDevice, normalizeText, requestAndroidPermissions]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!connectedDevice) {
                setError('No hay dispositivo conectado.');
                return;
            }

            const trimmed = text.trim();
            if (!trimmed) return;

            try {
                const payload = Buffer.from(trimmed, 'utf-8').toString('base64');

                await connectedDevice.writeCharacteristicWithResponseForService(
                    SERVICE_UUID,
                    CHAR_UUID_RX,
                    payload
                );

                appendLog('tx', trimmed);
            } catch (writeError) {
                const message = writeError instanceof Error ? writeError.message : 'Error al enviar mensaje';
                setError(message);
                appendLog('system', message);
            }
        },
        [appendLog, connectedDevice]
    );

    const clearMessages = useCallback(() => {
        setMessages([]);
        setButtonEventCount(0);
    }, []);

    useEffect(() => {
        connectedDeviceIdRef.current = connectedDevice?.id ?? null;
    }, [connectedDevice]);

    useEffect(() => {
        const stateSub = bleManager.onStateChange((state) => {
            setBleState(state);
        }, true);

        return () => {
            stateSub.remove();
            bleManager.stopDeviceScan();
            clearScanTimeout();
            cleanupMonitor();
            const connectedId = connectedDeviceIdRef.current;
            if (connectedId) {
                bleManager.cancelDeviceConnection(connectedId).catch(() => undefined);
            }
        };
    }, [cleanupMonitor, clearScanTimeout]);

    return {
        bleState,
        isScanning,
        isConnecting,
        connectedDevice,
        error,
        messages,
        buttonEventCount,
        scannedDevices,
        targetDeviceName: TARGET_DEVICE_NAME,
        serviceUuid: SERVICE_UUID,
        startScanAndConnect,
        connectToDeviceId,
        sendMessage,
        disconnect,
        clearMessages,
    };
}
