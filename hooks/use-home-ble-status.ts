import { useBleScanner } from "@/hooks/use-ble-scanner";
import { useSimulatedBleLocation } from "@/hooks/use-simulated-ble-location";
import { useEffect, useMemo } from "react";

export function useHomeBleStatus() {
  const scanner = useBleScanner();
  const simulatedLocation = useSimulatedBleLocation();

  useEffect(() => {
    // Home is the entry point for the contextual experience, so it must keep
    // the physical BLE scanner active without requiring the technical drawer.
    void scanner.startScanning();

    return () => {
      scanner.stopScanning();
    };
  }, [scanner.startScanning, scanner.stopScanning]);

  // The simulator can override the dominant reading only after an explicit
  // harness opt-in. Physical BLE remains active as the default and fallback.
  const dominantBeacon =
    simulatedLocation.isHarnessModeEnabled && simulatedLocation.dominantBeacon
      ? simulatedLocation.dominantBeacon
      : scanner.beacons[0];
  const beacons = useMemo(() => {
    if (
      !simulatedLocation.isHarnessModeEnabled ||
      !simulatedLocation.dominantBeacon
    ) {
      return scanner.beacons;
    }

    return [
      simulatedLocation.dominantBeacon,
      ...scanner.beacons.filter(
        (beacon) => beacon.id !== simulatedLocation.dominantBeacon?.id,
      ),
    ];
  }, [
    scanner.beacons,
    simulatedLocation.dominantBeacon,
    simulatedLocation.isHarnessModeEnabled,
  ]);

  const bleStatusLabel = useMemo(() => {
    if (dominantBeacon) {
      if (dominantBeacon.source === "simulator") {
        const zoneLabel =
          dominantBeacon.zoneId ?? `M${dominantBeacon.beaconNode}`;
        return `harness · ${dominantBeacon.roomId} · ${zoneLabel}`;
      }

      return `${dominantBeacon.roomId} · M${dominantBeacon.beaconNode}`;
    }

    if (simulatedLocation.isHarnessModeEnabled && simulatedLocation.isConnected) {
      return "harness · sin ubicacion";
    }

    if (scanner.error) {
      return `error · ${scanner.error}`;
    }

    return scanner.isScanning ? "esperando senal" : "BLE en pausa";
  }, [
    dominantBeacon,
    scanner.error,
    scanner.isScanning,
    simulatedLocation.isConnected,
    simulatedLocation.isHarnessModeEnabled,
  ]);

  const bleSignalLabel = useMemo(() => {
    if (dominantBeacon) {
      return dominantBeacon.source === "simulator"
        ? dominantBeacon.zoneLabel ?? "Harness activo"
        : "Senal estable";
    }

    if (simulatedLocation.isHarnessModeEnabled) {
      return simulatedLocation.isConnected
        ? "Harness sin ubicacion"
        : "Conectando harness";
    }

    if (scanner.error) {
      return "Error BLE";
    }

    return scanner.isScanning ? "Buscando sala" : "BLE opcional";
  }, [
    dominantBeacon,
    scanner.error,
    scanner.isScanning,
    simulatedLocation.isConnected,
    simulatedLocation.isHarnessModeEnabled,
  ]);

  return {
    ...scanner,
    beacons,
    dominantBeacon,
    bleSignalLabel,
    bleStatusLabel,
    harnessBridgeUrl: simulatedLocation.bridgeUrl,
    isHarnessConnected: simulatedLocation.isConnected,
    isHarnessModeEnabled: simulatedLocation.isHarnessModeEnabled,
  };
}
