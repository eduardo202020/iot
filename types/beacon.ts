/**
 * Tipos para beacons BLE de salas
 * Basado en el formato del proyecto Python IoT
 */

export interface BeaconData {
    // Identificadores
    id: string; // ID completo del beacon (ej: "SALA_2-B02")
    roomId: string; // ID de la sala (ej: "SALA_2")
    beaconNode: number; // Número del beacon en la sala (ej: 2)

    // Datos de señal
    rssi: number; // Intensidad de señal en dBm (ej: -65)
    txPower: number; // Potencia de transmisión en dBm (ej: -12)

    // Información del dispositivo
    firmwareVersion: string; // Versión del firmware (ej: "1.0")
    firmwareMajor: number; // Versión major
    firmwareMinor: number; // Versión minor
    battery: number; // Voltaje de batería en mV (ej: 3700)

    // Metadatos
    lastSeen: number; // Timestamp de última detección
    deviceAddress: string; // Dirección MAC del dispositivo BLE
}

export interface BeaconServiceData {
    roomId: string;
    beaconNode: number;
    firmwareMajor: number;
    firmwareMinor: number;
    batteryMv: number;
}

// UUIDs del servicio BLE
export const BEACON_SERVICE_UUID = '0000A00A-0000-1000-8000-00805F9B34FB';
export const BEACON_ID_CHARACTERISTIC = '0000A00B-0000-1000-8000-00805F9B34FB';
export const BEACON_TX_CHARACTERISTIC = '0000A00C-0000-1000-8000-00805F9B34FB';
