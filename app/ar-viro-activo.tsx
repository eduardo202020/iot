import { ArArtifactModel, arColors } from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { getArArtworkExperience } from "@/lib/ar-artwork-experiences";
import { hasArtworkModelAsset } from "@/lib/artwork-models";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_AR_ARTWORK_ID = "obra-1-1-L";
const INITIAL_MODEL_ZOOM = 1.22;
const INTRO_MODEL_ROTATION_RADIANS = Math.PI * 4;
const INTRO_MODEL_ROTATION_SPEED = 0.018;
const pinchZoomIcon = require("@/pinch_zoom.svg");
const progressActivityIcon = require("@/progress_activity.svg");

type ArMvpLogPayload = Record<string, unknown>;
type ModelStatus = "loading" | "ready" | "error";
type ContextualActionButtonProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: "default" | "primary";
};

function safeStringify(payload: ArMvpLogPayload) {
  try {
    return JSON.stringify(payload);
  } catch {
    return JSON.stringify({ event: "log-error" });
  }
}

function ContextualActionButton({
  iconName,
  label,
  onPress,
  variant = "default",
}: ContextualActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.contextualAction,
        variant === "primary" ? styles.contextualActionPrimary : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Ionicons
        color={variant === "primary" ? "#03131E" : "#FFFFFF"}
        name={iconName}
        size={20}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.contextualActionLabel,
          variant === "primary" ? styles.contextualActionLabelPrimary : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function ArViroActivoScreen() {
  const insets = useSafeAreaInsets();
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    currentArtworkId,
    findArtworkById,
    repeatArtworkNarration,
    selectArtwork,
  } = useMuseIQ();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>("loading");
  const [hasShownGestureHint, setHasShownGestureHint] = useState(false);
  const gesturePulse = useRef(new Animated.Value(0)).current;
  const loadingSpin = useRef(new Animated.Value(0)).current;
  const permissionRequestedRef = useRef(false);

  const requestedArtwork = artworkId ? findArtworkById(artworkId) : null;
  const fallbackArtwork = findArtworkById(DEFAULT_AR_ARTWORK_ID);
  const artwork = requestedArtwork ?? currentArtwork ?? fallbackArtwork;
  const resolvedArtworkId = artwork?.id ?? DEFAULT_AR_ARTWORK_ID;
  const hasModelAsset = hasArtworkModelAsset(resolvedArtworkId);
  const arModel = useMemo(
    () => getArArtworkExperience(resolvedArtworkId),
    [resolvedArtworkId],
  );

  const logArMvp = useCallback((event: string, payload: ArMvpLogPayload = {}) => {
    console.log("[MuseIQ][AR_MVP]", safeStringify({ event, ...payload }));
  }, []);

  useEffect(() => {
    if (!resolvedArtworkId || currentArtworkId === resolvedArtworkId) {
      return;
    }

    selectArtwork(resolvedArtworkId);
  }, [currentArtworkId, resolvedArtworkId, selectArtwork]);

  useEffect(() => {
    if (!artwork || hasModelAsset) {
      return;
    }

    router.replace({
      pathname: "/modelo-3d-no-disponible",
      params: { artworkId: artwork.id },
    } as never);
  }, [artwork, hasModelAsset]);

  useEffect(() => {
    if (!cameraPermission || cameraPermission.granted || !cameraPermission.canAskAgain) {
      return;
    }
    if (permissionRequestedRef.current) {
      return;
    }

    permissionRequestedRef.current = true;
    requestCameraPermission().catch(() => {
      logArMvp("cameraPermissionRequestError");
    });
  }, [cameraPermission, logArMvp, requestCameraPermission]);

  useEffect(() => {
    logArMvp("screenState", {
      artworkId: resolvedArtworkId,
      cameraGranted: cameraPermission?.granted ?? null,
      cameraReady,
      mode: "camera-overlay-glb",
      model: arModel.label,
      modelStatus,
      zoom: INITIAL_MODEL_ZOOM,
    });
  }, [
    arModel.label,
    cameraPermission?.granted,
    cameraReady,
    logArMvp,
    modelStatus,
    resolvedArtworkId,
  ]);

  const handleCameraReady = useCallback(() => {
    setCameraReady(true);
    logArMvp("cameraReady", { mode: "camera-overlay-glb" });
  }, [logArMvp]);

  const handleExplore = useCallback(() => {
    router.replace("/home" as never);
  }, []);

  const handleAsk = useCallback(() => {
    selectArtwork(resolvedArtworkId);
    router.push({
      pathname: "/pregunta-voz-modal",
      params: { artworkId: resolvedArtworkId },
    } as never);
  }, [resolvedArtworkId, selectArtwork]);

  const handleListen = useCallback(() => {
    selectArtwork(resolvedArtworkId);
    repeatArtworkNarration();
  }, [repeatArtworkNarration, resolvedArtworkId, selectArtwork]);

  const handleScan = useCallback(() => {
    router.replace("/ar-qr" as never);
  }, []);

  const canShowCamera = cameraPermission?.granted;
  const showModelLoading = Boolean(canShowCamera && modelStatus === "loading");
  const showGestureHint = Boolean(
    cameraReady && canShowCamera && modelStatus === "ready" && !hasShownGestureHint,
  );

  useEffect(() => {
    if (modelStatus === "loading") {
      setHasShownGestureHint(false);
    }
  }, [modelStatus]);

  useEffect(() => {
    if (!showGestureHint) {
      gesturePulse.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(gesturePulse, {
          duration: 850,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(gesturePulse, {
          duration: 850,
          easing: Easing.in(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    const timeout = setTimeout(() => {
      setHasShownGestureHint(true);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [gesturePulse, showGestureHint]);

  useEffect(() => {
    if (!showModelLoading) {
      loadingSpin.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(loadingSpin, {
        duration: 900,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [loadingSpin, showModelLoading]);

  if (!artwork) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <Pressable onPress={() => router.back()} style={styles.backOnly}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
          </Pressable>
          <View style={styles.emptyState}>
            <Ionicons color={musePalette.primary} name="cube-outline" size={42} />
            <Text style={styles.emptyTitle}>Obra 3D no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!hasModelAsset) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <Pressable onPress={() => router.back()} style={styles.backOnly}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
          </Pressable>
          <View style={styles.emptyState}>
            <Ionicons color={musePalette.primary} name="cube-outline" size={42} />
            <Text style={styles.emptyTitle}>Preparando fallback 3D...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {canShowCamera ? (
        <CameraView
          autofocus="on"
          facing="back"
          onCameraReady={handleCameraReady}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={styles.cameraFallback}>
          <Ionicons color={arColors.primary} name="camera-outline" size={40} />
          <Text style={styles.cameraFallbackTitle}>Camara requerida</Text>
          <Text style={styles.cameraFallbackText}>
            Activa el permiso para ver el modelo sobre el entorno real.
          </Text>
          <Pressable
            onPress={() => requestCameraPermission()}
            style={({ pressed }) => [styles.permissionButton, pressed ? styles.pressed : null]}
          >
            <Text style={styles.permissionButtonText}>Permitir camara</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.cameraScrim} pointerEvents="none" />

      <View style={styles.modelStage}>
        <ArArtifactModel
          artworkId={resolvedArtworkId}
          autoRotate
          externalZoom={INITIAL_MODEL_ZOOM}
          introRotationRadians={INTRO_MODEL_ROTATION_RADIANS}
          introRotationSpeed={INTRO_MODEL_ROTATION_SPEED}
          interactive
          modelVariant="ar"
          onModelStatusChange={setModelStatus}
          showStatus={false}
          style={styles.modelOverlay}
        />
      </View>

      {showModelLoading ? (
        <View style={styles.modelLoading} pointerEvents="none">
          <Animated.View
            style={{
              transform: [
                {
                  rotate: loadingSpin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            <Image contentFit="contain" source={progressActivityIcon} style={styles.modelLoadingIcon} />
          </Animated.View>
        </View>
      ) : null}

      {showGestureHint ? (
        <Animated.View
          accessibilityLabel="Pellizca y arrastra para manipular el modelo"
          pointerEvents="none"
          style={[
            styles.gestureHint,
            {
              opacity: gesturePulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.84, 1],
              }),
              transform: [
                {
                  scale: gesturePulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.12],
                  }),
                },
              ],
            },
          ]}
        >
          <Image contentFit="contain" source={pinchZoomIcon} style={styles.gestureIcon} />
        </Animated.View>
      ) : null}

      <SafeAreaView style={styles.hudLayer} pointerEvents="box-none">
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

        <View style={[styles.infoCard, { top: insets.top + 10 }]}>
          <Text numberOfLines={2} style={styles.artworkTitle}>{artwork.title}</Text>
        </View>

        <View style={[styles.contextualBar, { bottom: insets.bottom + 10 }]}>
          <ContextualActionButton
            iconName="compass-outline"
            label="Explorar"
            onPress={handleExplore}
          />
          <ContextualActionButton
            iconName="volume-high-outline"
            label="Escuchar"
            onPress={handleListen}
          />
          <ContextualActionButton
            iconName="chatbubble-ellipses-outline"
            label="Preguntar"
            onPress={handleAsk}
            variant="primary"
          />
          <ContextualActionButton
            iconName="qr-code-outline"
            label="Escanear"
            onPress={handleScan}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  cameraFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#05080D",
    gap: 12,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  cameraFallbackTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },
  cameraFallbackText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    maxWidth: 320,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: arColors.primary,
    borderRadius: 999,
    marginTop: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  permissionButtonText: {
    color: "#041018",
    fontSize: 13,
    fontWeight: "900",
  },
  cameraScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  modelStage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8,
  },
  modelOverlay: {
    backgroundColor: "transparent",
    height: "100%",
    width: "100%",
  },
  modelLoading: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: -29,
    position: "absolute",
    top: "50%",
    zIndex: 18,
  },
  modelLoadingIcon: {
    height: 58,
    width: 58,
  },
  gestureHint: {
    alignItems: "center",
    alignSelf: "center",
    height: 328,
    justifyContent: "center",
    marginTop: -164,
    position: "absolute",
    top: "50%",
    width: 328,
    zIndex: 24,
  },
  gestureIcon: {
    height: 216,
    width: 216,
  },
  hudLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 60,
  },
  backOnly: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.62)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    left: 22,
    position: "absolute",
    top: 22,
    width: 58,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.58)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    left: 22,
    position: "absolute",
    width: 58,
    zIndex: 30,
  },
  infoCard: {
    backgroundColor: "rgba(5,8,13,0.66)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    borderWidth: 1,
    left: 92,
    maxWidth: 338,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "absolute",
    right: 18,
    zIndex: 24,
  },
  artworkTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 21,
    textAlign: "center",
  },
  contextualBar: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(5,8,13,0.76)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    left: 16,
    padding: 8,
    position: "absolute",
    right: 16,
    zIndex: 42,
  },
  contextualAction: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 4,
  },
  contextualActionPrimary: {
    backgroundColor: arColors.primary,
    borderColor: arColors.primary,
  },
  contextualActionLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  contextualActionLabelPrimary: {
    color: "#03131E",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
