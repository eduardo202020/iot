import type { BeaconData } from "@/types/beacon";
import Constants from "expo-constants";
import { useEffect, useMemo, useRef, useState } from "react";

type SimulatedBeaconPayload = Partial<BeaconData> & {
  artworkId?: string;
  beaconNode?: number;
  qrCodes?: string[];
  roomId?: string;
  zoneId?: string;
  zoneLabel?: string;
};

type SimulatedLocationState = {
  beacon?: SimulatedBeaconPayload | null;
  enabled?: boolean;
  message?: string;
  updatedAt?: number;
};

const POLL_INTERVAL_MS = 800;
const STALE_AFTER_MS = 6_000;

function getMetroHost() {
  const constantsWithExtras = Constants as typeof Constants & {
    expoConfig?: {
      extra?: {
        museIqBleSimUrl?: string;
      };
      hostUri?: string;
    };
    manifest2?: {
      extra?: {
        expoClient?: {
          hostUri?: string;
        };
      };
    };
  };

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    constantsWithExtras.manifest2?.extra?.expoClient?.hostUri ??
    "";

  return hostUri.split(":")[0];
}

function normalizeBridgeUrl(rawUrl?: string) {
  const url = rawUrl?.trim();
  const metroHost = getMetroHost();

  if (url) {
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      return metroHost
        ? url.replace("localhost", metroHost).replace("127.0.0.1", metroHost)
        : url;
    }

    return url.replace(/\/$/, "");
  }

  return metroHost ? `http://${metroHost}:8787` : "";
}

function resolveBridgeUrl() {
  const constantsWithExtras = Constants as typeof Constants & {
    expoConfig?: {
      extra?: {
        museIqBleSimUrl?: string;
      };
    };
  };

  return normalizeBridgeUrl(
    constantsWithExtras.expoConfig?.extra?.museIqBleSimUrl ??
      process.env.EXPO_PUBLIC_MUSEIQ_BLE_SIM_URL,
  );
}

function toBeaconData(payload: SimulatedBeaconPayload, updatedAt: number): BeaconData | null {
  if (!payload.roomId || typeof payload.beaconNode !== "number") {
    return null;
  }

  const beaconNode = payload.beaconNode;
  const roomId = payload.roomId;

  return {
    battery: payload.battery ?? 3700,
    beaconNode,
    deviceAddress: payload.deviceAddress ?? `SIM:${roomId}:${beaconNode}`,
    firmwareMajor: payload.firmwareMajor ?? 1,
    firmwareMinor: payload.firmwareMinor ?? 0,
    firmwareVersion: payload.firmwareVersion ?? "sim",
    id: payload.id ?? `${roomId}-SIM-${String(beaconNode).padStart(2, "0")}`,
    isActive: true,
    lastSeen: updatedAt,
    rssi: payload.rssi ?? -42,
    roomId,
    source: "simulator",
    txPower: payload.txPower ?? -8,
    txPowerPayload: payload.txPowerPayload ?? -8,
    artworkId: payload.artworkId,
    qrCodes: payload.qrCodes,
    zoneId: payload.zoneId,
    zoneLabel: payload.zoneLabel,
  };
}

export function useSimulatedBleLocation() {
  const bridgeUrl = useMemo(resolveBridgeUrl, []);
  const [snapshot, setSnapshot] = useState<SimulatedLocationState | null>(null);
  const lastSuccessAtRef = useRef(0);

  useEffect(() => {
    if (!bridgeUrl) {
      return undefined;
    }

    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const response = await fetch(`${bridgeUrl}/state`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as SimulatedLocationState;
        if (isMounted) {
          setSnapshot(payload);
          lastSuccessAtRef.current = Date.now();
        }
      } catch {
        if (isMounted && Date.now() - lastSuccessAtRef.current > STALE_AFTER_MS) {
          setSnapshot(null);
        }
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [bridgeUrl]);

  const dominantBeacon = useMemo(() => {
    if (!snapshot?.enabled || !snapshot.beacon) {
      return null;
    }

    const updatedAt = snapshot.updatedAt ?? Date.now();
    if (Date.now() - updatedAt > STALE_AFTER_MS) {
      return null;
    }

    return toBeaconData(snapshot.beacon, updatedAt);
  }, [snapshot]);

  return {
    bridgeUrl,
    dominantBeacon,
    isConnected: Boolean(snapshot),
    isSimulated: Boolean(dominantBeacon),
    message: snapshot?.message,
  };
}
