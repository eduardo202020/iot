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
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const cabezaCardMarker = require("@/assets/images/ar-markers/cabeza.jpg");

type ViroModule = typeof import("@reactvision/react-viro");
type RuntimeState = "loading" | "ready" | "permission" | "unsupported" | "native-missing";
type PlacementState = "detecting" | "placed";
type ModelLoadState = "idle" | "loading" | "ready" | "error";
type ArDiagnosticPayload = Record<string, unknown>;
type Vector3 = [number, number, number];
type ViroImageTargetSource = ImageSourcePropType | string;
type ArImageMarkerConfig = {
  asset: ViroImageTargetSource;
  physicalWidthMeters: number;
  targetName: string;
};
const CAMERA_PREVIEW_DISTANCE_METERS = 1.12;
const MARKER_GATED_CAMERA_DISTANCE_METERS = 1.05;
const MARKER_MODEL_LIFT_METERS = 0.012;
const MARKER_MODEL_SCALE_MULTIPLIER = 0.08;

const imageMarkerTargets: Record<string, ArImageMarkerConfig> = {
  "obra-1-1-L": {
    asset: cabezaCardMarker,
    // Card visual de prueba mostrada en la PC con ancho fisico de 5 cm.
    physicalWidthMeters: 0.05,
    targetName: "museiq-obra-1-1-L-cabeza-card",
  },
};

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
  markerConfig?: ArImageMarkerConfig;
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

function asVector3(value: unknown, fallback: Vector3): Vector3 {
  if (!Array.isArray(value) || value.length < 3) {
    return fallback;
  }

  return [
    Number(value[0]) || 0,
    Number(value[1]) || 0,
    Number(value[2]) || 0,
  ];
}

function formatVector3(value: Vector3): Vector3 {
  return [
    Number(value[0].toFixed(4)),
    Number(value[1].toFixed(4)),
    Number(value[2].toFixed(4)),
  ];
}

function vectorLength(value: Vector3) {
  return Math.sqrt(value[0] ** 2 + value[1] ** 2 + value[2] ** 2);
}

function distanceBetween(first: Vector3, second: Vector3) {
  return vectorLength([
    first[0] - second[0],
    first[1] - second[1],
    first[2] - second[2],
  ]);
}

function summarizeMarkerAnchor(anchor: unknown) {
  const anchorMap = (anchor ?? {}) as Record<string, unknown>;

  return {
    anchorId: typeof anchorMap.anchorId === "string" ? anchorMap.anchorId : null,
    position: formatVector3(asVector3(anchorMap.position, [0, 0, 0])),
    rotation: formatVector3(asVector3(anchorMap.rotation, [0, 0, 0])),
    scale: formatVector3(asVector3(anchorMap.scale, [1, 1, 1])),
    trackingMethod:
      typeof anchorMap.trackingMethod === "string" ? anchorMap.trackingMethod : null,
    type: typeof anchorMap.type === "string" ? anchorMap.type : null,
  };
}

function createArtworkArScene(viro: ViroModule) {
  const {
    Viro3DObject,
    ViroARCamera,
    ViroARImageMarker,
    ViroARScene,
    ViroARTrackingTargets,
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
    const lastCameraPositionRef = useRef<Vector3 | null>(null);
    const lastTrackingStateRef = useRef<string>("1");
    const registeredMarkerTargetRef = useRef("");
    const hasCapturedMarkerRef = useRef(false);
    const [isMarkerTargetReady, setIsMarkerTargetReady] = useState(false);
    const [isArSessionReadyForMarkers, setIsArSessionReadyForMarkers] = useState(false);
    const [hasCapturedMarker, setHasCapturedMarker] = useState(false);
    const resetSignal = appProps?.resetSignal;
    appPropsRef.current = appProps;
    const markerTargetName = appProps?.markerConfig?.targetName;
    const markerTargetAsset = appProps?.markerConfig?.asset;
    const markerPhysicalWidthMeters = appProps?.markerConfig?.physicalWidthMeters;

    useEffect(() => {
      const currentAppProps = appPropsRef.current;
      if (!currentAppProps?.markerConfig) {
        setIsMarkerTargetReady(false);
        setIsArSessionReadyForMarkers(false);
        hasCapturedMarkerRef.current = false;
        setHasCapturedMarker(false);
        return;
      }
      if (!isArSessionReadyForMarkers) {
        setIsMarkerTargetReady(false);
        return;
      }
      if (registeredMarkerTargetRef.current === currentAppProps.markerConfig.targetName) {
        setIsMarkerTargetReady(true);
        return;
      }

      ViroARTrackingTargets.createTargets({
        [currentAppProps.markerConfig.targetName]: {
          orientation: "Up",
          physicalWidth: currentAppProps.markerConfig.physicalWidthMeters,
          source: currentAppProps.markerConfig.asset,
          type: "Image",
        },
      });
      registeredMarkerTargetRef.current = currentAppProps.markerConfig.targetName;
      setIsMarkerTargetReady(true);
      currentAppProps.onArDiagnostic("imageMarkerTargetRegistered", {
        markerAssetType: typeof currentAppProps.markerConfig.asset,
        markerPhysicalWidthMeters: currentAppProps.markerConfig.physicalWidthMeters,
        markerSurface: "pc-screen",
        mode: "card-image-marker",
        targetName: currentAppProps.markerConfig.targetName,
      });
    }, [
      isArSessionReadyForMarkers,
      markerPhysicalWidthMeters,
      markerTargetAsset,
      markerTargetName,
      ViroARTrackingTargets,
    ]);

    useEffect(() => {
      const currentAppProps = appPropsRef.current;
      if (!currentAppProps || resetSignal === undefined) {
        return;
      }
      if (lastResetSignalRef.current === resetSignal) {
        return;
      }

      lastResetSignalRef.current = resetSignal;
      lastCameraPositionRef.current = null;
      setIsArSessionReadyForMarkers(false);
      hasCapturedMarkerRef.current = false;
      setHasCapturedMarker(false);
      currentAppProps.onPlacementStateChange(currentAppProps.markerConfig ? "detecting" : "placed");
      currentAppProps.onModelLoadStateChange("idle");
      currentAppProps.onArDiagnostic("cameraLockedPreviewReset", {
        distanceMeters: currentAppProps.markerConfig
          ? MARKER_GATED_CAMERA_DISTANCE_METERS
          : CAMERA_PREVIEW_DISTANCE_METERS,
        mode: currentAppProps.markerConfig ? "card-image-marker" : "camera-locked-preview",
        resetSignal,
      });
    }, [resetSignal]);

    if (!appProps) {
      return <ViroARScene />;
    }

    const modelScale = multiplyScale(appProps.modelBaseScale, appProps.modelScaleMultiplier);
    const markerModelScale = multiplyScale(
      appProps.modelBaseScale,
      appProps.modelScaleMultiplier * MARKER_MODEL_SCALE_MULTIPLIER,
    );
    const sceneMode = appProps.markerConfig ? "card-image-marker" : "camera-locked-preview";
    const shouldRenderMarker = Boolean(
      appProps.markerConfig && isMarkerTargetReady && isArSessionReadyForMarkers && !hasCapturedMarker,
    );
    const shouldRenderMarkerGatedCameraModel = Boolean(appProps.markerConfig && hasCapturedMarker);

    return (
      <ViroARScene
        onAmbientLightUpdate={(ambientLightInfo) => {
          appProps.onArDiagnostic("ambientLight", ambientLightInfo as ArDiagnosticPayload);
        }}
        onCameraTransformUpdate={(cameraTransform) => {
          const nextCameraTransform = {
            forward: asVector3(cameraTransform.forward, [0, 0, -1]),
            position: asVector3(cameraTransform.position, [0, 0, 0]),
            rotation: asVector3(cameraTransform.rotation, [0, 0, 0]),
            up: asVector3(cameraTransform.up, [0, 1, 0]),
          };
          const lastCameraPosition = lastCameraPositionRef.current;
          const cameraDeltaMeters = lastCameraPosition
            ? distanceBetween(lastCameraPosition, nextCameraTransform.position)
            : 0;

          lastCameraPositionRef.current = nextCameraTransform.position;

          appProps.onArDiagnostic("cameraTransform", {
            deltaMeters: Number(cameraDeltaMeters.toFixed(4)),
            forward: formatVector3(nextCameraTransform.forward),
            mode: sceneMode,
            position: formatVector3(nextCameraTransform.position),
            rotation: formatVector3(nextCameraTransform.rotation),
            trackingState: lastTrackingStateRef.current,
            up: formatVector3(nextCameraTransform.up),
          });
        }}
        onPlatformUpdate={(platformInfo) => {
          if (appProps.markerConfig && !isArSessionReadyForMarkers) {
            setIsArSessionReadyForMarkers(true);
            appProps.onArDiagnostic("arSessionReadyForMarkers", {
              mode: sceneMode,
              reason: "platform-update",
            });
          }
          appProps.onArDiagnostic("platform", platformInfo as ArDiagnosticPayload);
        }}
        onTrackingUpdated={(state, reason) => {
          const nextState = String(state);
          const nextReason = reason ? String(reason) : undefined;
          const previousState = lastTrackingStateRef.current;
          if (appProps.markerConfig && !isArSessionReadyForMarkers) {
            setIsArSessionReadyForMarkers(true);
            appProps.onArDiagnostic("arSessionReadyForMarkers", {
              mode: sceneMode,
              reason: "tracking-update",
            });
          }
          lastTrackingStateRef.current = nextState;
          appProps.onTrackingStateChange(nextState, nextReason);
          appProps.onArDiagnostic("tracking", {
            label: formatTrackingLabel(nextState, nextReason),
            mode: sceneMode,
            previousState,
            reason: nextReason ?? null,
            state: nextState,
          });
        }}
      >
        <ViroAmbientLight color="#FFFFFF" intensity={720} />
        <ViroDirectionalLight color="#FFFFFF" direction={[0, -1, -0.35]} intensity={620} />

        {shouldRenderMarker && appProps.markerConfig ? (
          <ViroARImageMarker
            target={appProps.markerConfig.targetName}
            onAnchorFound={(anchor) => {
              hasCapturedMarkerRef.current = true;
              setHasCapturedMarker(true);
              appProps.onPlacementStateChange("placed");
              appProps.onArDiagnostic("imageMarkerFound", {
                ...summarizeMarkerAnchor(anchor),
                cameraDistanceMeters: MARKER_GATED_CAMERA_DISTANCE_METERS,
                captureStrategy: "camera-locked-after-first-detection",
                modelScaleMode: "camera-preview-scale",
                mode: "card-image-marker",
                targetName: appProps.markerConfig?.targetName,
              });
            }}
            onAnchorRemoved={() => {
              if (hasCapturedMarkerRef.current) {
                appProps.onArDiagnostic("imageMarkerRemovedAfterCapture", {
                  mode: "card-image-marker",
                  targetName: appProps.markerConfig?.targetName,
                });
                return;
              }

              appProps.onPlacementStateChange("detecting");
              appProps.onArDiagnostic("imageMarkerRemoved", {
                mode: "card-image-marker",
                targetName: appProps.markerConfig?.targetName,
              });
            }}
            onAnchorUpdated={(anchor) => {
              appProps.onArDiagnostic("imageMarkerUpdated", {
                ...summarizeMarkerAnchor(anchor),
                captureStrategy: "pending-first-detection",
                mode: "card-image-marker",
                targetName: appProps.markerConfig?.targetName,
              });
            }}
          >
            <ViroNode
              position={[0, MARKER_MODEL_LIFT_METERS, 0]}
              rotation={appProps.modelRotation}
              scale={markerModelScale}
            />
          </ViroARImageMarker>
        ) : shouldRenderMarkerGatedCameraModel ? (
          <ViroARCamera>
            <ViroNode
              position={[0, appProps.modelYOffset, -MARKER_GATED_CAMERA_DISTANCE_METERS]}
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
                    mode: "marker-gated-camera-preview",
                    title: appProps.modelTitle,
                  });
                  appProps.onModelLoadStateChange("error", errorMessage);
                }}
                onLoadEnd={(event) => {
                  const succeeded = event.nativeEvent?.success;
                  appProps.onArDiagnostic("modelLoadEnd", {
                    distanceMeters: MARKER_GATED_CAMERA_DISTANCE_METERS,
                    label: appProps.modelLabel,
                    mode: "marker-gated-camera-preview",
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
                    distanceMeters: MARKER_GATED_CAMERA_DISTANCE_METERS,
                    label: appProps.modelLabel,
                    mode: "marker-gated-camera-preview",
                    title: appProps.modelTitle,
                  });
                  appProps.onModelLoadStateChange("loading");
                }}
                source={appProps.modelAsset}
                type="GLB"
              />
            </ViroNode>
          </ViroARCamera>
        ) : appProps.markerConfig ? (
          <ViroNode
            position={[0, 0, -1]}
            scale={[0.001, 0.001, 0.001]}
          />
        ) : (
          <ViroARCamera>
            <ViroNode
              position={[0, appProps.modelYOffset, -CAMERA_PREVIEW_DISTANCE_METERS]}
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
                    distanceMeters: CAMERA_PREVIEW_DISTANCE_METERS,
                    label: appProps.modelLabel,
                    mode: "camera-locked-preview",
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
                    distanceMeters: CAMERA_PREVIEW_DISTANCE_METERS,
                    label: appProps.modelLabel,
                    mode: "camera-locked-preview",
                    title: appProps.modelTitle,
                  });
                  appProps.onModelLoadStateChange("loading");
                }}
                source={appProps.modelAsset}
                type="GLB"
              />
            </ViroNode>
          </ViroARCamera>
        )}
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
  const markerConfig = resolvedArtworkId ? imageMarkerTargets[resolvedArtworkId] : undefined;
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
        event === "cameraTransform"
          ? 900
          : event === "ambientLight" || event === "tracking" || event === "imageMarkerUpdated"
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
      markerConfig,
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
      markerConfig,
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
            ? "Apunta la camara a la card visual de 5 cm para anclar el modelo."
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
    markerConfig
      ? placementState === "placed"
        ? "Modelo visible tras detectar card"
        : "Busca la card visual"
      : placementState === "placed"
        ? "Modelo fijo frente a camara"
        : "Buscando camara AR";
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
            numberOfTrackedImages={markerConfig ? 1 : undefined}
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
