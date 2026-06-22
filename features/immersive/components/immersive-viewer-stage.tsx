import {
  CabezaClavaModelView,
  type ImmersiveTourSegmentState,
} from "@/components/museiq/cabeza-clava-model-view";
import { arColors } from "@/components/museiq/ar-flow";
import {
  VR_FRAME_HEIGHT_RATIO,
  VR_FRAME_WIDTH_RATIO,
} from "@/features/immersive/constants";
import type {
  ImmersiveModelKey,
  ImmersiveModelOption,
  MotionPermissionState,
} from "@/features/immersive/types";
import type { ImmersiveTourDefinition } from "@/lib/immersive-tours";
import type { SkyTextureAsset } from "@/lib/sky-assets";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";

type ImmersiveViewerStageProps = {
  activeModel: ImmersiveModelOption;
  activeModelKey: ImmersiveModelKey;
  hasGuidedTour: boolean;
  modelCanMount: boolean;
  motionPermissionState: MotionPermissionState;
  onTourSegmentChange: (segment: ImmersiveTourSegmentState | null) => void;
  skyTextureAsset: SkyTextureAsset;
  tour?: ImmersiveTourDefinition;
  tourCanPlay: boolean;
  windowHeight: number;
  windowWidth: number;
};

export function ImmersiveViewerStage({
  activeModel,
  activeModelKey,
  hasGuidedTour,
  modelCanMount,
  motionPermissionState,
  onTourSegmentChange,
  skyTextureAsset,
  tour,
  tourCanPlay,
  windowHeight,
  windowWidth,
}: ImmersiveViewerStageProps) {
  const usesLandscapeFallback = Platform.OS === "android" && windowWidth < windowHeight;
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
    <View style={viewerStageStyle}>
      {modelCanMount ? (
        <CabezaClavaModelView
          key={`${framedViewerWidth}x${framedViewerHeight}-${
            motionPermissionState === "granted" ? "tracked" : "manual"
          }-${activeModelKey}`}
          headTracking={motionPermissionState === "granted"}
          headTrackingPaused={hasGuidedTour && !tourCanPlay}
          immersiveSubject={activeModelKey === "clava" ? "object" : "space"}
          immersiveTour={activeModelKey === "clava" ? undefined : tour}
          interactive={motionPermissionState !== "granted"}
          modelAsset={activeModel.asset}
          modelLabel={activeModel.label}
          onTourSegmentChange={onTourSegmentChange}
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
    </View>
  );
}

const styles = StyleSheet.create({
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
});
