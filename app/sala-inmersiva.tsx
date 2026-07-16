import type { ImmersiveTourSegmentState } from "@/components/museiq/cabeza-clava-model-view";
import { HeadsetCountdownOverlay } from "@/features/immersive/components/headset-countdown-overlay";
import { ImmersiveEmptyState } from "@/features/immersive/components/immersive-empty-state";
import { ImmersiveTopControls } from "@/features/immersive/components/immersive-top-controls";
import { ImmersiveViewerStage } from "@/features/immersive/components/immersive-viewer-stage";
import { MotionPermissionOverlay } from "@/features/immersive/components/motion-permission-overlay";
import { useHeadsetCountdown } from "@/features/immersive/hooks/use-headset-countdown";
import { useImmersiveEnvironmentAssets } from "@/features/immersive/hooks/use-immersive-environment-assets";
import { useImmersiveLandscapeLock } from "@/features/immersive/hooks/use-immersive-landscape-lock";
import { useImmersiveModelMount } from "@/features/immersive/hooks/use-immersive-model-mount";
import { useImmersiveMotionPermission } from "@/features/immersive/hooks/use-immersive-motion-permission";
import { useImmersiveTourNarration } from "@/features/immersive/hooks/use-immersive-tour-narration";
import { getImmersiveExperience, getRoomImmersiveExperience } from "@/lib/room-experiences";
import { getCurrentSkyTextureAsset } from "@/lib/sky-assets";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function SalaInmersivaScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { experienceId, roomId } = useLocalSearchParams<{
    experienceId?: string;
    roomId?: string;
  }>();
  const experience = getImmersiveExperience(experienceId) ?? getRoomImmersiveExperience(roomId);
  const [skyTextureAsset] = useState(() => getCurrentSkyTextureAsset());
  const [activeTourSegment, setActiveTourSegment] =
    useState<ImmersiveTourSegmentState | null>(null);
  const hasGuidedTour = Boolean(experience?.tour?.points.length);

  useImmersiveLandscapeLock(Boolean(experience));

  const {
    motionPermissionState,
    requestMotionPermission,
    setMotionPermissionState,
  } = useImmersiveMotionPermission();
  const sensorModelCanMount = useImmersiveModelMount({
    enabled: Boolean(experience),
    motionPermissionState,
    windowHeight,
    windowWidth,
  });
  const {
    environmentAssetsError,
    environmentAssetsReady,
    environmentAssetsState,
  } = useImmersiveEnvironmentAssets({
    enabled: Boolean(experience),
    skyTextureAsset,
  });
  const modelCanMount = sensorModelCanMount && environmentAssetsReady;

  const resetTourSegment = useCallback(() => {
    setActiveTourSegment(null);
  }, []);

  const { tourCanPlay, tourCountdown } = useHeadsetCountdown({
    experienceId: experience?.id,
    hasGuidedTour,
    modelCanMount,
    onResetTourSegment: resetTourSegment,
  });
  const activeNarration = tourCanPlay ? activeTourSegment?.narration : undefined;
  const activeNarrationKey =
    activeNarration?.text && activeTourSegment
      ? `${experience?.id ?? "immersive"}:${activeTourSegment.pointId}`
      : null;

  useImmersiveTourNarration({
    activeNarration,
    activeNarrationKey,
    tourCanPlay,
  });

  const handleRequestMotionPermission = useCallback(() => {
    requestMotionPermission().catch(() => {
      setMotionPermissionState("unavailable");
    });
  }, [requestMotionPermission, setMotionPermissionState]);

  if (!experience) {
    return <ImmersiveEmptyState />;
  }

  const activeModel = {
    asset: experience.modelAsset,
    label: experience.modelLabel,
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ImmersiveViewerStage
        activeModel={activeModel}
        environmentAssetsError={environmentAssetsError}
        environmentAssetsState={environmentAssetsState}
        hasGuidedTour={hasGuidedTour}
        modelCanMount={modelCanMount}
        motionPermissionState={motionPermissionState}
        onTourSegmentChange={setActiveTourSegment}
        skyTextureAsset={skyTextureAsset}
        tour={experience.tour}
        tourCanPlay={tourCanPlay}
        windowHeight={windowHeight}
        windowWidth={windowWidth}
      />

      {modelCanMount && hasGuidedTour && !tourCanPlay ? (
        <HeadsetCountdownOverlay countdown={tourCountdown} />
      ) : null}

      <SafeAreaView edges={["top", "left", "right"]} style={styles.overlaySafeArea}>
        <ImmersiveTopControls
          onBack={() => router.back()}
          topInset={insets.top}
        />
        <MotionPermissionOverlay
          motionPermissionState={motionPermissionState}
          onRequestMotionPermission={handleRequestMotionPermission}
        />
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
});
