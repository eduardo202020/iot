import { useBleScanner } from "@/hooks/use-ble-scanner";
import { useSimulatedBleLocation } from "@/hooks/use-simulated-ble-location";
import { useMemo } from "react";

export function useHomeBleStatus() {
  const scanner = useBleScanner();
  const simulator = useSimulatedBleLocation();

  const dominantBeacon = simulator.dominantBeacon ?? scanner.beacons[0];
  const beacons = useMemo(() => {
    if (!simulator.dominantBeacon) {
      return scanner.beacons;
    }

    return [
      simulator.dominantBeacon,
      ...scanner.beacons.filter((beacon) => beacon.id !== simulator.dominantBeacon?.id),
    ];
  }, [scanner.beacons, simulator.dominantBeacon]);

  const bleStatusLabel = useMemo(() => {
    if (dominantBeacon) {
      if (dominantBeacon.source === "simulator") {
        return `sim · ${dominantBeacon.roomId} · ${dominantBeacon.zoneId ?? `M${dominantBeacon.beaconNode}`}`;
      }

      return `${dominantBeacon.roomId} · M${dominantBeacon.beaconNode}`;
    }

    if (scanner.error) {
      return `error · ${scanner.error}`;
    }

    return scanner.isScanning ? "esperando senal" : "BLE en pausa";
  }, [dominantBeacon, scanner.error, scanner.isScanning]);

  const bleSignalLabel = useMemo(() => {
    if (dominantBeacon) {
      if (dominantBeacon.source === "simulator") {
        return dominantBeacon.zoneLabel ?? "Simulador activo";
      }

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
    isBleSimulated: simulator.isSimulated,
    simulatedBridgeUrl: simulator.bridgeUrl,
  };
}
