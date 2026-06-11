import {
  CabezaClavaModelView,
  type ImmersiveTourSegmentState,
} from "@/components/museiq/cabeza-clava-model-view";
import { arColors } from "@/components/museiq/ar-flow";
import cabezaClavaTestGlb from "@/assets/models/cabeza_clava-2.glb";
import { getImmersiveExperience, getRoomImmersiveExperience } from "@/lib/room-experiences";
import { getImmersiveNarrationCaptions } from "@/lib/immersive-tours";
import { getCurrentSkyTextureAsset } from "@/lib/sky-assets";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type MotionPermissionState = "checking" | "granted" | "prompt" | "blocked" | "unavailable";
type MotionCapabilities = {
  accelerometerAvailable: boolean | null;
  deviceMotionAvailable: boolean | null;
  gyroscopeAvailable: boolean | null;
  magnetometerAvailable: boolean | null;
};
type ImmersiveModelKey = "room" | "clava";

const IMMERSIVE_TEST_MODEL = {
  asset: cabezaClavaTestGlb,
  label: "cabeza_clava-2.glb",
};

const ENABLE_VR_TERMINAL_LOGS = false;
const HEADSET_COUNTDOWN_SECONDS = 5;
const VR_FRAME_HEIGHT_RATIO = 1;
const VR_FRAME_WIDTH_RATIO = 0.84;
const NARRATION_DEFAULT_RATE = 0.88;

function logVr(...args: Parameters<typeof console.log>) {
  if (ENABLE_VR_TERMINAL_LOGS) {
    console.log(...args);
  }
}

function warnVr(...args: Parameters<typeof console.warn>) {
  if (ENABLE_VR_TERMINAL_LOGS) {
    console.warn(...args);
  }
}

export default function SalaInmersivaScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { experienceId, roomId } = useLocalSearchParams<{
    experienceId?: string;
    roomId?: string;
  }>();
  const experience = getImmersiveExperience(experienceId) ?? getRoomImmersiveExperience(roomId);
  const [, setMotionCapabilities] = useState<MotionCapabilities>({
    accelerometerAvailable: null,
    deviceMotionAvailable: null,
    gyroscopeAvailable: null,
    magnetometerAvailable: null,
  });
  const [motionPermissionState, setMotionPermissionState] =
    useState<MotionPermissionState>("checking");
  const [activeModelKey, setActiveModelKey] = useState<ImmersiveModelKey>("room");
  const [modelCanMount, setModelCanMount] = useState(false);
  const [, setNativeLandscapeLockReady] = useState(false);
  const [tourCanPlay, setTourCanPlay] = useState(false);
  const [tourCountdown, setTourCountdown] = useState(HEADSET_COUNTDOWN_SECONDS);
  const [activeTourSegment, setActiveTourSegment] =
    useState<ImmersiveTourSegmentState | null>(null);
  const lastSpokenSegmentKeyRef = useRef<string | null>(null);
  const hasGuidedTour = activeModelKey === "room" && Boolean(experience?.tour?.points.length);
  const activeNarration =
    tourCanPlay && activeModelKey === "room" ? activeTourSegment?.narration : undefined;
  const activeCaptions = useMemo(
    () => getImmersiveNarrationCaptions(activeNarration),
    [activeNarration],
  );
  const activeCaptionIndex =
    activeCaptions.length > 0 && activeTourSegment
      ? Math.min(
          activeCaptions.length - 1,
          Math.max(0, Math.floor(activeTourSegment.progress * activeCaptions.length)),
        )
      : -1;
  const activeNarrationKey =
    activeNarration?.text && activeTourSegment
      ? `${experience?.id ?? "immersive"}:${activeTourSegment.pointId}`
      : null;
  const shouldShowStereoCaptions =
    activeCaptions.length > 0 && tourCanPlay && activeModelKey === "room";

  const renderStereoCaption = (eyeKey: "left" | "right") => (
    <View key={eyeKey} style={styles.stereoCaptionEye}>
      <View style={styles.stereoCaptionContent}>
        {activeNarration?.title ? (
          <Text numberOfLines={1} style={styles.stereoCaptionTitle}>
            {activeNarration.title}
          </Text>
        ) : null}
        <Text numberOfLines={3} style={styles.stereoCaptionText}>
          {activeCaptions.map((caption, index) => (
            <Text
              key={`${activeTourSegment?.pointId ?? "caption"}-${eyeKey}-${index}`}
              style={index === activeCaptionIndex ? styles.stereoCaptionTextActive : undefined}
            >
              {caption}
              {index < activeCaptions.length - 1 ? " " : ""}
            </Text>
          ))}
        </Text>
      </View>
    </View>
  );

  useEffect(() => {
    if (!experience) {
      return;
    }

    let isMounted = true;
    let screenOrientationModule: {
      OrientationLock: { LANDSCAPE: number; PORTRAIT_UP: number };
      lockAsync: (lock: number) => Promise<void>;
    } | null = null;

    const lockLandscape = async () => {
      try {
        const loadedModule = await import("expo-screen-orientation");
        screenOrientationModule = loadedModule;
        await loadedModule.lockAsync(loadedModule.OrientationLock.LANDSCAPE);
        if (isMounted) {
          setNativeLandscapeLockReady(true);
        }
      } catch (error) {
        warnVr("[MuseIQ][VR] No se pudo bloquear landscape nativo", error);
        if (isMounted) {
          setNativeLandscapeLockReady(false);
        }
      }
    };

    lockLandscape().catch((error) => {
      warnVr("[MuseIQ][VR] No se pudo bloquear landscape nativo", error);
      if (isMounted) {
        setNativeLandscapeLockReady(false);
      }
    });

    return () => {
      isMounted = false;
      setNativeLandscapeLockReady(false);
      screenOrientationModule
        ?.lockAsync(screenOrientationModule.OrientationLock.PORTRAIT_UP)
        .catch((error) => {
          warnVr("[MuseIQ][VR] No se pudo restaurar portrait", error);
        });
    };
  }, [experience]);

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

  useEffect(() => {
    setModelCanMount(false);

    if (!experience || motionPermissionState === "checking") {
      return;
    }

    const timeout = setTimeout(() => {
      logVr("[MuseIQ][VR] Montando visor 3D inmersivo");
      setModelCanMount(true);
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [experience, motionPermissionState, windowHeight, windowWidth]);

  useEffect(() => {
    if (!hasGuidedTour) {
      setTourCanPlay(true);
      setTourCountdown(0);
      setActiveTourSegment(null);
      return;
    }

    if (!modelCanMount) {
      setTourCanPlay(false);
      setTourCountdown(HEADSET_COUNTDOWN_SECONDS);
      setActiveTourSegment(null);
      return;
    }

    setTourCanPlay(false);
    setTourCountdown(HEADSET_COUNTDOWN_SECONDS);

    const interval = setInterval(() => {
      setTourCountdown((currentCountdown) => {
        if (currentCountdown <= 1) {
          clearInterval(interval);
          setTourCanPlay(true);
          return 0;
        }

        return currentCountdown - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [experience?.id, hasGuidedTour, modelCanMount]);

  useEffect(() => {
    if (!tourCanPlay || activeModelKey !== "room" || !activeNarrationKey || !activeNarration) {
      lastSpokenSegmentKeyRef.current = null;
      Speech.stop().catch(() => undefined);
      return;
    }

    if (lastSpokenSegmentKeyRef.current === activeNarrationKey) {
      return;
    }

    let isCancelled = false;
    lastSpokenSegmentKeyRef.current = activeNarrationKey;

    const speakSegment = async () => {
      try {
        await Speech.stop();
        if (isCancelled) {
          return;
        }

        Speech.speak(activeNarration.text, {
          language: "es-PE",
          pitch: 1,
          rate: activeNarration.speechRate ?? NARRATION_DEFAULT_RATE,
          onDone: () => {
            if (!isCancelled) {
              // Keep subtitles visible until the tour moves to the next segment.
            }
          },
          onError: () => undefined,
          onStopped: () => undefined,
        });
      } catch {
        // La narracion es complementaria: si TTS falla, el tour y subtitulos continuan.
      }
    };

    speakSegment();

    return () => {
      isCancelled = true;
    };
  }, [activeModelKey, activeNarration, activeNarrationKey, tourCanPlay]);

  useEffect(() => {
    return () => {
      Speech.stop().catch(() => undefined);
    };
  }, []);

  if (!experience) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView edges={["top", "left", "right"]} style={styles.overlaySafeArea}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Experiencia inmersiva no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const usesLandscapeFallback = Platform.OS === "android" && windowWidth < windowHeight;
  const activeModel =
    activeModelKey === "clava"
      ? IMMERSIVE_TEST_MODEL
      : {
          asset: experience.modelAsset,
          label: experience.modelLabel,
        };
  const skyTextureAsset = getCurrentSkyTextureAsset();
  const effectiveViewerWidth = usesLandscapeFallback ? windowHeight : windowWidth;
  const effectiveViewerHeight = usesLandscapeFallback ? windowWidth : windowHeight;
  const framedViewerWidth = Math.round(effectiveViewerWidth * VR_FRAME_WIDTH_RATIO);
  const framedViewerHeight = Math.round(effectiveViewerHeight * VR_FRAME_HEIGHT_RATIO);
  const viewerStageStyle = usesLandscapeFallback
    ? [
        styles.viewerStage,
        styles.viewerStageLandscapeFallback,
        {
          height: framedViewerHeight,
          left: (windowWidth - framedViewerWidth) / 2,
          top: (windowHeight - framedViewerHeight) / 2,
          width: framedViewerWidth,
        },
      ]
    : [
        styles.viewerStage,
        {
          bottom: "auto" as const,
          height: framedViewerHeight,
          left: (windowWidth - framedViewerWidth) / 2,
          right: "auto" as const,
          top: (windowHeight - framedViewerHeight) / 2,
          width: framedViewerWidth,
        },
      ];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={viewerStageStyle}>
        {modelCanMount ? (
          <CabezaClavaModelView
            key={`${framedViewerWidth}x${framedViewerHeight}-${
              motionPermissionState === "granted" ? "tracked" : "manual"
            }-${activeModelKey}`}
            headTracking={motionPermissionState === "granted"}
            headTrackingPaused={hasGuidedTour && !tourCanPlay}
            immersiveSubject={activeModelKey === "clava" ? "object" : "space"}
            immersiveTour={activeModelKey === "clava" ? undefined : experience.tour}
            interactive={motionPermissionState !== "granted"}
            modelAsset={activeModel.asset}
            modelLabel={activeModel.label}
            onTourSegmentChange={setActiveTourSegment}
            skyTextureAsset={skyTextureAsset}
            stereo
            style={styles.model}
            tourPlaybackPaused={hasGuidedTour && !tourCanPlay}
            viewMode="immersive"
          />
        ) : (
          <View style={styles.modelBootOverlay}>
            <ActivityIndicator color={arColors.primary} size="small" />
            <Text style={styles.modelBootText}>Inicializando sensores</Text>
          </View>
        )}
        {shouldShowStereoCaptions ? (
          <View pointerEvents="none" style={styles.stereoCaptionLayer}>
            {renderStereoCaption("left")}
            {renderStereoCaption("right")}
          </View>
        ) : null}
      </View>

      {modelCanMount && hasGuidedTour && !tourCanPlay ? (
        <View pointerEvents="none" style={styles.headsetCountdownOverlay}>
          <View style={styles.headsetCountdownCard}>
            <Text style={styles.headsetCountdownKicker}>Prepara el visor</Text>
            <Text style={styles.headsetCountdownNumber}>{tourCountdown}</Text>
            <Text style={styles.headsetCountdownText}>
              Ponte el headset. El recorrido iniciara automaticamente.
            </Text>
          </View>
        </View>
      ) : null}

      <SafeAreaView edges={["top", "left", "right"]} style={styles.overlaySafeArea}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { top: insets.top + 10 },
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
        </Pressable>
        <View style={[styles.modelToggle, { top: insets.top + 10 }]}>
          <Pressable
            onPress={() => setActiveModelKey("room")}
            style={({ pressed }) => [
              styles.modelToggleOption,
              activeModelKey === "room" ? styles.modelToggleOptionActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text
              style={[
                styles.modelToggleLabel,
                activeModelKey === "room" ? styles.modelToggleLabelActive : null,
              ]}
            >
              Sala
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveModelKey("clava")}
            style={({ pressed }) => [
              styles.modelToggleOption,
              activeModelKey === "clava" ? styles.modelToggleOptionActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text
              style={[
                styles.modelToggleLabel,
                activeModelKey === "clava" ? styles.modelToggleLabelActive : null,
              ]}
            >
              Clava
            </Text>
          </Pressable>
        </View>

        {motionPermissionState !== "granted" ? (
          <View pointerEvents="box-none" style={styles.permissionOverlay}>
            <View style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>Permiso de movimiento</Text>
              <Text style={styles.permissionBody}>
                {motionPermissionState === "checking"
                  ? "Verificando sensores para activar el visor inmersivo."
                  : motionPermissionState === "blocked"
                    ? "El permiso fue bloqueado. Activalo desde ajustes para mover la vista con tu cabeza."
                  : motionPermissionState === "unavailable"
                      ? "Este dispositivo no expone Device Motion, Gyroscope ni el combo Accelerometer + Magnetometer para la experiencia inmersiva."
                      : "Activa el permiso de movimiento para que el visor responda a tu cabeza en Android."}
              </Text>
              {motionPermissionState === "checking" ? (
                <ActivityIndicator color={arColors.primary} size="small" />
              ) : motionPermissionState === "prompt" ? (
                <Pressable
                  onPress={() => {
                    requestMotionPermission().catch(() => {
                      setMotionPermissionState("unavailable");
                    });
                  }}
                  style={({ pressed }) => [
                    styles.permissionButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Ionicons color="#03131E" name="compass-outline" size={18} />
                  <Text style={styles.permissionButtonLabel}>Activar movimiento</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
    overflow: "hidden",
  },
  overlaySafeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: arColors.glassBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    left: 22,
    position: "absolute",
    width: 58,
    zIndex: 30,
  },
  modelToggle: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.76)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    minHeight: 36,
    padding: 4,
    position: "absolute",
    right: 22,
    zIndex: 32,
  },
  modelToggleOption: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 28,
    minWidth: 58,
    paddingHorizontal: 10,
  },
  modelToggleOptionActive: {
    backgroundColor: arColors.primary,
  },
  modelToggleLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
  },
  modelToggleLabelActive: {
    color: "#03131E",
  },
  viewerStage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  viewerStageLandscapeFallback: {
    bottom: "auto",
    right: "auto",
    transform: [{ rotate: "90deg" }],
  },
  model: {
    ...StyleSheet.absoluteFillObject,
  },
  modelBootOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  modelBootText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  headsetCountdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "center",
    zIndex: 24,
  },
  headsetCountdownCard: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.84)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 28,
    borderWidth: 1,
    gap: 8,
    maxWidth: 280,
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  headsetCountdownKicker: {
    color: arColors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  headsetCountdownNumber: {
    color: "#FFFFFF",
    fontSize: 58,
    fontWeight: "900",
    lineHeight: 64,
  },
  headsetCountdownText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    textAlign: "center",
  },
  stereoCaptionLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "flex-end",
    flexDirection: "row",
    paddingBottom: 20,
    zIndex: 26,
  },
  stereoCaptionEye: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 18,
  },
  stereoCaptionContent: {
    maxWidth: 360,
    width: "100%",
  },
  stereoCaptionTitle: {
    color: arColors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.92)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 5,
    textTransform: "uppercase",
  },
  stereoCaptionText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.96)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 6,
  },
  stereoCaptionTextActive: {
    color: "#FFD65A",
  },
  permissionOverlay: {
    alignItems: "center",
    bottom: 28,
    left: 18,
    position: "absolute",
    right: 18,
    zIndex: 40,
  },
  permissionCard: {
    alignItems: "center",
    backgroundColor: "rgba(7,10,15,0.9)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    maxWidth: 480,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: "100%",
  },
  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  permissionBody: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    textAlign: "center",
  },
  permissionButton: {
    alignItems: "center",
    backgroundColor: arColors.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 18,
  },
  permissionButtonLabel: {
    color: "#03131E",
    fontSize: 14,
    fontWeight: "900",
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
