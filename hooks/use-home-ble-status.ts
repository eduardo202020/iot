import { useBleScanner } from "@/hooks/use-ble-scanner";
import { useEffect, useMemo } from "react";

export function useHomeBleStatus() {
  const scanner = useBleScanner();

  useEffect(() => {
    // Home is the entry point for the contextual experience, so it must keep
    // the physical BLE scanner active without requiring the technical drawer.
    void scanner.startScanning();

    return () => {
      scanner.stopScanning();
    };
  }, [scanner.startScanning, scanner.stopScanning]);

  // Home uses physical BLE readings for the MVP. The HTTP simulator remains a
  // separate development tool and cannot override the visitor's real context.
  const dominantBeacon = scanner.beacons[0];
  const beacons = useMemo(() => scanner.beacons, [scanner.beacons]);

  const bleStatusLabel = useMemo(() => {
    if (dominantBeacon) {
      return `${dominantBeacon.roomId} · M${dominantBeacon.beaconNode}`;
    }

    if (scanner.error) {
      return `error · ${scanner.error}`;
    }

    return scanner.isScanning ? "esperando senal" : "BLE en pausa";
  }, [dominantBeacon, scanner.error, scanner.isScanning]);

  const bleSignalLabel = useMemo(() => {
    if (dominantBeacon) {
      return "Senal estable";
    }

    if (scanner.error) {
      return "Error BLE";
    }

    return scanner.isScanning ? "Buscando sala" : "BLE opcional";
  }, [dominantBeacon, scanner.error, scanner.isScanning]);

  return {
    ...scanner,
    beacons,
    dominantBeacon,
    bleSignalLabel,
    bleStatusLabel,
  };
}
