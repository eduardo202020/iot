import { arColors } from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { getArArtworkExperience } from "@/lib/ar-artwork-experiences";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type ViroModule = typeof import("@reactvision/react-viro");
type RuntimeState = "loading" | "ready" | "permission" | "unsupported" | "native-missing";
type PlacementState = "detecting" | "placed";
type ModelLoadState = "idle" | "loading" | "ready" | "error";
type ArDiagnosticPayload = Record<string, unknown>;

const trackingStateLabels: Record<string, string> = {
  "1": "tracking no disponible",
  "2": "tracking limitado",
  "3": "tracking normal",
};

const trackingReasonLabels: Record<string, string> = {
  "1": "sin razon",
  "2": "movimiento excesivo",
  "3": "pocos puntos visuales",
};

type ArtworkArSceneProps = {
  modelAsset: number;
  modelBaseScale: [number, number, number];
  modelLabel: string;
  modelRotation: [number, number, number];
  modelScaleMultiplier: number;
  modelTitle: string;
  modelYOffset: number;
  onArDiagnostic: (event: string, payload?: ArDiagnosticPayload) => void;
  onModelLoadStateChange: (state: ModelLoadState, message?: string) => void;
  onPlacementStateChange: (state: PlacementState) => void;
  onTrackingStateChange: (state: string, reason?: string) => void;
  resetSignal: number;
};

function multiplyScale(
  scale: [number, number, number],
  multiplier: number,
): [number, number, number] {
  return [
    Number((scale[0] * multiplier).toFixed(4)),
    Number((scale[1] * multiplier).toFixed(4)),
    Number((scale[2] * multiplier).toFixed(4)),
  ];
}

function formatTrackingLabel(state: string, reason?: string) {
  const stateLabel = trackingStateLabels[state] ?? `tracking ${state}`;
  if (state === "3") {
    return stateLabel;
  }

  const reasonLabel = reason ? trackingReasonLabels[reason] ?? `razon ${reason}` : "";

  return reasonLabel ? `${stateLabel} · ${reasonLabel}` : stateLabel;
}

function safeStringifyDiagnostic(payload: ArDiagnosticPayload) {
  try {
    return JSON.stringify(payload);
  } catch {
    return JSON.stringify({
      event: payload.event ?? "unknown",
      error: "No se pudo serializar el diagnostico AR.",
    });
  }
}

function createArtworkArScene(viro: ViroModule) {
  const {
    Viro3DObject,
    ViroARScene,
    ViroAmbientLight,
    ViroDirectionalLight,
    ViroNode,
  } = viro;

  return function ArtworkArScene(sceneProps: {
    sceneNavigator?: { viroAppProps?: ArtworkArSceneProps };
  }) {
    const appProps = sceneProps.sceneNavigator?.viroAppProps;
    const appPropsRef = useRef(appProps);
    const lastResetSignalRef = useRef<number | null>(null);
    const resetSignal = appProps?.resetSignal;
    appPropsRef.current = appProps;

    useEffect(() => {
      const currentAppProps = appPropsRef.current;
      if (!currentAppProps || resetSignal === undefined) {
        return;
      }
      if (lastResetSignalRef.current === resetSignal) {
        return;
      }

      lastResetSignalRef.current = resetSignal;
      currentAppProps.onPlacementStateChange("placed");
      currentAppProps.onModelLoadStateChange("idle");
    }, [resetSignal]);

    if (!appProps) {
      return <ViroARScene />;
    }

    const modelScale = multiplyScale(appProps.modelBaseScale, appProps.modelScaleMultiplier);

    return (
      <ViroARScene
        anchorDetectionTypes={["PlanesHorizontal", "PlanesVertical"]}
        onAmbientLightUpdate={(ambientLightInfo) => {
          appProps.onArDiagnostic("ambientLight", ambientLightInfo as ArDiagnosticPayload);
        }}
        onCameraTransformUpdate={(cameraTransform) => {
          appProps.onArDiagnostic("cameraTransform", {
            forward: cameraTransform.forward,
            position: cameraTransform.position,
            rotation: cameraTransform.rotation,
            up: cameraTransform.up,
          });
        }}
        onPlatformUpdate={(platformInfo) => {
          appProps.onArDiagnostic("platform", platformInfo as ArDiagnosticPayload);
        }}
        onTrackingUpdated={(state, reason) => {
          const nextState = String(state);
          const nextReason = reason ? String(reason) : undefined;
          appProps.onTrackingStateChange(nextState, nextReason);
          appProps.onArDiagnostic("tracking", {
            label: formatTrackingLabel(nextState, nextReason),
            reason: nextReason ?? null,
            state: nextState,
          });
        }}
      >
        <ViroAmbientLight color="#FFFFFF" intensity={720} />
        <ViroDirectionalLight color="#FFFFFF" direction={[0, -1, -0.35]} intensity={620} />

        <ViroNode
          dragType="FixedToWorld"
          position={[0, appProps.modelYOffset - 0.15, -1.2]}
          rotation={appProps.modelRotation}
          scale={modelScale}
        >
          <Viro3DObject
            onError={(event) => {
              const errorMessage =
                event.nativeEvent?.error instanceof Error
                  ? event.nativeEvent.error.message
                  : "No se pudo cargar el modelo GLB.";
              appProps.onArDiagnostic("modelError", {
                error: errorMessage,
                label: appProps.modelLabel,
                title: appProps.modelTitle,
              });
              appProps.onModelLoadStateChange("error", errorMessage);
            }}
            onLoadEnd={(event) => {
              const succeeded = event.nativeEvent?.success;
              appProps.onArDiagnostic("modelLoadEnd", {
                label: appProps.modelLabel,
                success: succeeded ?? null,
                title: appProps.modelTitle,
              });
              appProps.onModelLoadStateChange(
                succeeded === false ? "error" : "ready",
                succeeded === false ? "El modelo no termino de cargar." : undefined,
              );
            }}
            onLoadStart={() => {
              appProps.onArDiagnostic("modelLoadStart", {
                label: appProps.modelLabel,
                title: appProps.modelTitle,
              });
              appProps.onModelLoadStateChange("loading");
            }}
            source={appProps.modelAsset}
            type="GLB"
          />
        </ViroNode>
      </ViroARScene>
    );
  };
}

export default function ArViroActivoScreen() {
  const insets = useSafeAreaInsets();
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const { currentArtwork, currentArtworkId, findArtworkById, selectArtwork } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;
  const resolvedArtworkId = artwork?.id;
  const [viroRuntime, setViroRuntime] = useState<ViroModule | null>(null);
  const [runtimeState, setRuntimeState] = useState<RuntimeState>("loading");
  const [runtimeMessage, setRuntimeMessage] = useState("Preparando ARCore/ARKit...");
  const [trackingState, setTrackingState] = useState("iniciando");
  const [placementState, setPlacementState] = useState<PlacementState>("detecting");
  const [modelLoadState, setModelLoadState] = useState<ModelLoadState>("idle");
  const [modelMessage, setModelMessage] = useState("");
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [rotationY, setRotationY] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const lastTrackingLabelRef = useRef(trackingState);
  const lastDiagnosticAtRef = useRef<Record<string, number>>({});

  const arExperience = useMemo(
    () => getArArtworkExperience(artwork?.id),
    [artwork?.id],
  );
  const arScene = useMemo(
    () => (viroRuntime ? createArtworkArScene(viroRuntime) : null),
    [viroRuntime],
  );
  const handleModelLoadStateChange = useCallback(
    (state: ModelLoadState, message = "") => {
      setModelLoadState((current) => (current === state ? current : state));
      setModelMessage((current) => (current === message ? current : message));
    },
    [],
  );
  const handlePlacementStateChange = useCallback((state: PlacementState) => {
    setPlacementState((current) => (current === state ? current : state));
  }, []);
  const handleTrackingStateChange = useCallback((state: string, reason?: string) => {
    const nextLabel = formatTrackingLabel(state, reason);
    if (lastTrackingLabelRef.current === nextLabel) {
      return;
    }

    lastTrackingLabelRef.current = nextLabel;
    setTrackingState(nextLabel);
  }, []);
  const handleArDiagnostic = useCallback(
    (event: string, payload: ArDiagnosticPayload = {}) => {
      const now = Date.now();
      const throttleMs =
        event === "cameraTransform" || event === "ambientLight" || event === "tracking"
          ? 1200
          : 0;
      const lastAt = lastDiagnosticAtRef.current[event] ?? 0;
      if (throttleMs > 0 && now - lastAt < throttleMs) {
        return;
      }

      lastDiagnosticAtRef.current[event] = now;
      console.log(
        "[MuseIQ][AR_VIRO]",
        safeStringifyDiagnostic({
          event,
          ...payload,
        }),
      );
    },
    [],
  );
  const viroAppProps = useMemo<ArtworkArSceneProps>(
    () => ({
      modelAsset: arExperience.asset,
      modelBaseScale: arExperience.scale,
      modelLabel: arExperience.label,
      modelRotation: [
        arExperience.rotation[0],
        arExperience.rotation[1] + rotationY,
        arExperience.rotation[2],
      ],
      modelScaleMultiplier: scaleMultiplier,
      modelTitle: artwork?.title ?? "Obra AR",
      modelYOffset: arExperience.modelYOffset,
      onArDiagnostic: handleArDiagnostic,
      onModelLoadStateChange: handleModelLoadStateChange,
      onPlacementStateChange: handlePlacementStateChange,
      onTrackingStateChange: handleTrackingStateChange,
      resetSignal,
    }),
    [
      arExperience.asset,
      arExperience.label,
      arExperience.modelYOffset,
      arExperience.rotation,
      arExperience.scale,
      artwork?.title,
      handleArDiagnostic,
      handleModelLoadStateChange,
      handlePlacementStateChange,
      handleTrackingStateChange,
      resetSignal,
      rotationY,
      scaleMultiplier,
    ],
  );
  const initialScene = useMemo<{ scene: () => JSX.Element }>(
    () => ({
      scene: (arScene ?? (() => <></>)) as unknown as () => JSX.Element,
    }),
    [arScene],
  );

  useEffect(() => {
    if (resolvedArtworkId && currentArtworkId !== resolvedArtworkId) {
      selectArtwork(resolvedArtworkId);
    }
  }, [currentArtworkId, resolvedArtworkId, selectArtwork]);

  useEffect(() => {
    if (!resolvedArtworkId) {
      return;
    }

    let isMounted = true;

    const prepareViroRuntime = async () => {
      try {
        handleArDiagnostic("runtimeImportStart");
        const viro = await import("@reactvision/react-viro");
        if (!isMounted) {
          return;
        }

        handleArDiagnostic("runtimeImportEnd", {
          hasNavigator: Boolean(viro.ViroARSceneNavigator),
          hasScene: Boolean(viro.ViroARScene),
        });
        setViroRuntime(viro);
        setRuntimeMessage("Solicitando permiso de camara...");

        const permissions = await viro.requestRequiredPermissions(["camera"]);
        if (!isMounted) {
          return;
        }

        handleArDiagnostic("permissions", permissions as unknown as ArDiagnosticPayload);
        if (!permissions.camera) {
          setRuntimeState("permission");
          setRuntimeMessage("La experiencia AR necesita permiso de camara.");
          return;
        }

        setRuntimeMessage("Verificando soporte AR del dispositivo...");
        const support = await viro.isARSupportedOnDevice();
        if (!isMounted) {
          return;
        }

        handleArDiagnostic("support", support as unknown as ArDiagnosticPayload);
        setRuntimeState(support.isARSupported ? "ready" : "unsupported");
        setRuntimeMessage(
          support.isARSupported
            ? "Apunta al piso o una mesa y toca el plano detectado."
            : "Este dispositivo no reporta soporte ARCore/ARKit disponible.",
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error && error.message
            ? error.message
            : "No se pudo iniciar el modulo nativo de AR.";
        setRuntimeState(
          message.includes("UNSUPPORTED") || message.includes("UNKNOWN")
            ? "unsupported"
            : "native-missing",
        );
        handleArDiagnostic("runtimeError", { message });
        setRuntimeMessage(
          message.includes("UNSUPPORTED") || message.includes("UNKNOWN")
            ? "ARCore no esta disponible o aun no pudo confirmar soporte en este dispositivo."
            : "Recompila el dev client para incluir @reactvision/react-viro.",
        );
      }
    };

    prepareViroRuntime();

    return () => {
      isMounted = false;
    };
  }, [handleArDiagnostic, resolvedArtworkId]);

  useEffect(() => {
    handleArDiagnostic("screenState", {
      artworkId: resolvedArtworkId ?? null,
      model: arExperience.label,
      modelLoadState,
      modelMessage: modelMessage || null,
      runtimeState,
      trackingState,
    });
  }, [
    arExperience.label,
    handleArDiagnostic,
    modelLoadState,
    modelMessage,
    resolvedArtworkId,
    runtimeState,
    trackingState,
  ]);

  const canRenderAr = Boolean(resolvedArtworkId && runtimeState === "ready" && viroRuntime && arScene);
  const ViroARSceneNavigator = viroRuntime?.ViroARSceneNavigator;
  const placementLabel =
    placementState === "placed" ? "Modelo frente a camara" : "Preparando escena";
  const modelStatusLabel =
    modelLoadState === "ready"
      ? arExperience.label
      : modelLoadState === "error"
        ? modelMessage || "Error al cargar GLB"
        : modelLoadState === "loading"
          ? "Cargando GLB..."
          : "Esperando ubicacion";

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
            <Text style={styles.emptyTitle}>Obra AR no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {canRenderAr && ViroARSceneNavigator ? (
        <View style={styles.viroLayer}>
          <ViroARSceneNavigator
            autofocus
            key={artwork.id}
            initialScene={initialScene}
            initialSceneKey={`${artwork.id}-${resetSignal}`}
            provider="none"
            videoQuality="High"
            viroAppProps={viroAppProps}
          />
        </View>
      ) : (
        <View style={styles.runtimeState}>
          <ActivityIndicator color={arColors.primary} size="large" />
          <Text style={styles.runtimeTitle}>
            {runtimeState === "loading"
              ? "Preparando AR"
              : runtimeState === "permission"
                ? "Permiso pendiente"
                : runtimeState === "unsupported"
                  ? "AR no disponible"
                  : "Dev client pendiente"}
          </Text>
          <Text style={styles.runtimeMessage}>{runtimeMessage}</Text>
        </View>
      )}

      <SafeAreaView style={styles.safeArea}>
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
          <Text numberOfLines={1} style={styles.infoKicker}>AR real · ViroReact</Text>
          <Text numberOfLines={2} style={styles.artworkTitle}>{artwork.title}</Text>
          <Text numberOfLines={1} style={styles.infoMeta}>{placementLabel}</Text>
          <Text numberOfLines={1} style={styles.infoMeta}>Tracking: {trackingState}</Text>
          <Text numberOfLines={1} style={styles.infoMeta}>{modelStatusLabel}</Text>
        </View>

        <View style={styles.controlsPanel}>
          <Pressable
            onPress={() => {
              setPlacementState("detecting");
              setModelLoadState("idle");
              setResetSignal((value) => value + 1);
            }}
            style={({ pressed }) => [styles.controlButton, pressed ? styles.pressed : null]}
          >
            <Ionicons color="#FFFFFF" name="scan-outline" size={18} />
            <Text style={styles.controlText}>Recolocar</Text>
          </Pressable>

          <View style={styles.scaleGroup}>
            <Pressable
              onPress={() => setScaleMultiplier((value) => Math.max(0.45, value - 0.12))}
              style={({ pressed }) => [styles.roundControl, pressed ? styles.pressed : null]}
            >
              <Ionicons color="#FFFFFF" name="remove" size={19} />
            </Pressable>
            <Text style={styles.scaleText}>{Math.round(scaleMultiplier * 100)}%</Text>
            <Pressable
              onPress={() => setScaleMultiplier((value) => Math.min(2.2, value + 0.12))}
              style={({ pressed }) => [styles.roundControl, pressed ? styles.pressed : null]}
            >
              <Ionicons color="#FFFFFF" name="add" size={19} />
            </Pressable>
          </View>

          <Pressable
            onPress={() => setRotationY((value) => value + 20)}
            style={({ pressed }) => [styles.controlButton, pressed ? styles.pressed : null]}
          >
            <Ionicons color="#FFFFFF" name="refresh-outline" size={18} />
            <Text style={styles.controlText}>Girar</Text>
          </Pressable>
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
  runtimeState: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    gap: 14,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  runtimeTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  runtimeMessage: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    maxWidth: 340,
    textAlign: "center",
  },
  viroLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
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
    backgroundColor: "rgba(5,8,13,0.7)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 20,
    borderWidth: 1,
    left: 92,
    maxWidth: 330,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "absolute",
    right: 18,
    zIndex: 24,
  },
  infoKicker: {
    color: arColors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  artworkTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 21,
    marginBottom: 6,
  },
  infoMeta: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 16,
  },
  controlsPanel: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(5,8,13,0.7)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    borderWidth: 1,
    bottom: 22,
    flexDirection: "row",
    gap: 10,
    padding: 8,
    position: "absolute",
    zIndex: 24,
  },
  controlButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    minHeight: 42,
    paddingHorizontal: 13,
  },
  controlText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  scaleGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  roundControl: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  scaleText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    minWidth: 36,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
