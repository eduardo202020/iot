import type {
  MotionCapabilities,
  MotionPermissionState,
} from "@/features/immersive/types";
import { logVr, warnVr } from "@/features/immersive/utils/vr-logging";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export function useImmersiveMotionPermission() {
  const [, setMotionCapabilities] = useState<MotionCapabilities>({
    accelerometerAvailable: null,
    deviceMotionAvailable: null,
    gyroscopeAvailable: null,
    magnetometerAvailable: null,
  });
  const [motionPermissionState, setMotionPermissionState] =
    useState<MotionPermissionState>("checking");

  const requestMotionPermission = useCallback(async () => {
    try {
      const sensorsModule = await import("expo-sensors");
      const Accelerometer = sensorsModule.Accelerometer;
      const DeviceMotion = sensorsModule.DeviceMotion;
      const Gyroscope = sensorsModule.Gyroscope;
      const Magnetometer = sensorsModule.Magnetometer;
      const MagnetometerUncalibrated = sensorsModule.MagnetometerUncalibrated;

      if (Platform.OS === "android") {
        const [
          accelerometerAvailable,
          deviceMotionAvailable,
          gyroscopeAvailable,
          magnetometerAvailable,
          uncalibratedMagnetometerAvailable,
        ] = await Promise.all([
          Accelerometer.isAvailableAsync().catch(() => false),
          DeviceMotion.isAvailableAsync().catch(() => false),
          Gyroscope.isAvailableAsync().catch(() => false),
          Magnetometer.isAvailableAsync().catch(() => false),
          MagnetometerUncalibrated.isAvailableAsync().catch(() => false),
        ]);
        const anyMagnetometerAvailable =
          magnetometerAvailable || uncalibratedMagnetometerAvailable;
        setMotionCapabilities({
          accelerometerAvailable,
          deviceMotionAvailable,
          gyroscopeAvailable,
          magnetometerAvailable: anyMagnetometerAvailable,
        });

        setMotionPermissionState(
          deviceMotionAvailable ||
            gyroscopeAvailable ||
            (accelerometerAvailable && anyMagnetometerAvailable)
            ? "granted"
            : "unavailable",
        );
        return;
      }

      const available = await DeviceMotion.isAvailableAsync();

      if (!available) {
        setMotionPermissionState("unavailable");
        return;
      }

      const permissions = await DeviceMotion.getPermissionsAsync();
      if (permissions.granted) {
        setMotionPermissionState("granted");
        return;
      }

      if (!permissions.canAskAgain) {
        setMotionPermissionState("blocked");
        return;
      }

      const nextPermissions = await DeviceMotion.requestPermissionsAsync();
      setMotionPermissionState(nextPermissions.granted ? "granted" : "blocked");
    } catch {
      setMotionPermissionState("unavailable");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkMotionPermission = async () => {
      try {
        logVr("[MuseIQ][VR] Iniciando chequeo de sensores");
        const sensorsModule = await import("expo-sensors");
        const Accelerometer = sensorsModule.Accelerometer;
        const DeviceMotion = sensorsModule.DeviceMotion;
        const Gyroscope = sensorsModule.Gyroscope;
        const Magnetometer = sensorsModule.Magnetometer;
        const MagnetometerUncalibrated = sensorsModule.MagnetometerUncalibrated;

        if (Platform.OS === "android") {
          const [
            accelerometerAvailable,
            deviceMotionAvailable,
            gyroscopeAvailable,
            magnetometerAvailable,
            uncalibratedMagnetometerAvailable,
          ] = await Promise.all([
            Accelerometer.isAvailableAsync().catch(() => false),
            DeviceMotion.isAvailableAsync().catch(() => false),
            Gyroscope.isAvailableAsync().catch(() => false),
            Magnetometer.isAvailableAsync().catch(() => false),
            MagnetometerUncalibrated.isAvailableAsync().catch(() => false),
          ]);
          const anyMagnetometerAvailable =
            magnetometerAvailable || uncalibratedMagnetometerAvailable;
          setMotionCapabilities({
            accelerometerAvailable,
            deviceMotionAvailable,
            gyroscopeAvailable,
            magnetometerAvailable: anyMagnetometerAvailable,
          });
          logVr("[MuseIQ][VR] Sensores Android", {
            accelerometerAvailable,
            deviceMotionAvailable,
            gyroscopeAvailable,
            magnetometerAvailable,
            uncalibratedMagnetometerAvailable,
          });

          if (!isMounted) {
            return;
          }

          setMotionPermissionState(
            deviceMotionAvailable ||
              gyroscopeAvailable ||
              (accelerometerAvailable && anyMagnetometerAvailable)
              ? "granted"
              : "unavailable",
          );
          return;
        }

        const available = await DeviceMotion.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        if (!available) {
          setMotionPermissionState("unavailable");
          return;
        }

        const permissions = await DeviceMotion.getPermissionsAsync();
        if (!isMounted) {
          return;
        }

        if (permissions.granted) {
          setMotionPermissionState("granted");
          return;
        }

        setMotionPermissionState(permissions.canAskAgain ? "prompt" : "blocked");
      } catch (error) {
        warnVr("[MuseIQ][VR] Error al chequear sensores", error);
        if (isMounted) {
          setMotionPermissionState("unavailable");
        }
      }
    };

    checkMotionPermission().catch(() => {
      if (isMounted) {
        setMotionPermissionState("unavailable");
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    motionPermissionState,
    requestMotionPermission,
    setMotionPermissionState,
  };
}
