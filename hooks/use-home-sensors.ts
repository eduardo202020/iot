import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export function useHomeSensors(enabled = true) {
  const [accelerometerStatus, setAccelerometerStatus] = useState("cargando");
  const [compassStatus, setCompassStatus] = useState("cargando");
  const [stepCountStatus, setStepCountStatus] = useState("cargando");
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [movementState, setMovementState] = useState("--");
  const [headingState, setHeadingState] = useState<string | null>(null);

  const fallbackStepCountRef = useRef(0);
  const nativeStepSeenRef = useRef(false);
  const lastEstimatedStepAtRef = useRef(0);
  const lastHeadingRef = useRef<string | null>(null);
  const smoothedMagnitudeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setAccelerometerStatus("pausado");
      setCompassStatus("pausado");
      setMovementState("--");
      setHeadingState(null);
      smoothedMagnitudeRef.current = null;
      lastHeadingRef.current = null;
      return;
    }

    let isMounted = true;
    let accelerometerSubscription: { remove: () => void } | null = null;
    let magnetometerSubscription: { remove: () => void } | null = null;

    const startCompassTracking = async () => {
      try {
        const sensorsModule = await import("expo-sensors");
        const Accelerometer = sensorsModule.Accelerometer;
        const Magnetometer = sensorsModule.Magnetometer;

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        const magnetometerAvailable = await Magnetometer.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        setAccelerometerStatus(
          accelerometerAvailable ? "activo" : "no disponible",
        );
        setCompassStatus(magnetometerAvailable ? "activo" : "no disponible");

        if (accelerometerAvailable) {
          let smoothedDelta = 0;

          Accelerometer.setUpdateInterval(250);
          accelerometerSubscription = Accelerometer.addListener((reading) => {
            const x = reading.x ?? 0;
            const y = reading.y ?? 0;
            const z = reading.z ?? 0;
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            const previousSmoothedMagnitude = smoothedMagnitudeRef.current;
            const nextSmoothedMagnitude =
              previousSmoothedMagnitude === null
                ? magnitude
                : previousSmoothedMagnitude * 0.75 + magnitude * 0.25;
            smoothedMagnitudeRef.current = nextSmoothedMagnitude;

            if (previousSmoothedMagnitude === null) {
              return;
            }

            const delta = Math.abs(magnitude - previousSmoothedMagnitude);
            smoothedDelta = smoothedDelta * 0.8 + delta * 0.2;

            if (!isMounted) {
              return;
            }

            const nextMovementState =
              smoothedDelta > 0.06 ? "en movimiento" : "quieto";
            setMovementState((current) =>
              current === nextMovementState ? current : nextMovementState,
            );

            const now = Date.now();
            const canEstimateFallbackStep =
              !nativeStepSeenRef.current &&
              smoothedDelta > 0.09 &&
              now - lastEstimatedStepAtRef.current > 450;

            if (canEstimateFallbackStep) {
              fallbackStepCountRef.current += 1;
              lastEstimatedStepAtRef.current = now;
              setStepCount(fallbackStepCountRef.current);
              setStepCountStatus("estimado por movimiento");
            }
          });
        }

        if (!magnetometerAvailable) {
          return;
        }

        Magnetometer.setUpdateInterval(500);
        magnetometerSubscription = Magnetometer.addListener((reading) => {
          const rawHeading =
            Math.atan2(reading.y ?? 0, reading.x ?? 0) * (180 / Math.PI);
          const normalized = (rawHeading - 90 + 360) % 360;
          const nextHeading = `${Math.round(normalized)}°`;

          if (isMounted && lastHeadingRef.current !== nextHeading) {
            lastHeadingRef.current = nextHeading;
            setHeadingState(nextHeading);
          }
        });
      } catch {
        if (isMounted) {
          setAccelerometerStatus("error");
          setCompassStatus("error");
          setMovementState("--");
          setHeadingState(null);
        }
      }
    };

    startCompassTracking().catch(() => {
      if (isMounted) {
        setAccelerometerStatus("error");
        setCompassStatus("error");
        setMovementState("--");
        setHeadingState(null);
      }
    });

    return () => {
      isMounted = false;
      accelerometerSubscription?.remove();
      magnetometerSubscription?.remove();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setStepCountStatus("pausado");
      setStepCount(null);
      return;
    }

    let isMounted = true;
    let pedometerSubscription: { remove: () => void } | null = null;

    const startStepTracking = async () => {
      try {
        const sensorsModule = await import("expo-sensors");
        const Pedometer = sensorsModule.Pedometer;
        const permissionResponse = await Pedometer.getPermissionsAsync();

        if (!permissionResponse.granted) {
          if (isMounted) {
            setStepCountStatus("opcional");
            setStepCount(null);
          }
          return;
        }

        const pedometerAvailable = await Pedometer.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        setStepCountStatus(pedometerAvailable ? "activo" : "no disponible");

        if (!pedometerAvailable) {
          return;
        }

        if (Platform.OS === "ios") {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          try {
            const initialCount = await Pedometer.getStepCountAsync(
              startOfDay,
              new Date(),
            );

            if (isMounted) {
              setStepCount(initialCount.steps);
              setStepCountStatus("activo");
            }
          } catch {
            if (isMounted) {
              setStepCount(null);
              setStepCountStatus("esperando lectura");
            }
          }
        } else if (isMounted) {
          setStepCount(null);
          setStepCountStatus("activo · esperando pasos");
        }

        pedometerSubscription = Pedometer.watchStepCount((result) => {
          if (isMounted) {
            nativeStepSeenRef.current = true;
            setStepCount(result.steps);
            setStepCountStatus("activo");
          }
        });
      } catch {
        if (isMounted) {
          setStepCountStatus("error");
          setStepCount(null);
        }
      }
    };

    startStepTracking().catch(() => {
      if (isMounted) {
        setStepCountStatus("error");
        setStepCount(null);
      }
    });

    return () => {
      isMounted = false;
      pedometerSubscription?.remove();
    };
  }, [enabled]);

  return {
    accelerometerStatus,
    compassStatus,
    headingState,
    movementState,
    stepCount,
    stepCountStatus,
  };
}
