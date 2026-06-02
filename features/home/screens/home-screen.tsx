import { SensorPanel } from "@/components/museiq/home/sensor-panel";
import { QrScannerOverlay } from "@/components/museiq/home/qr-scanner-overlay";
import { HomeBottomHud, HomeTopHud } from "@/features/home/components/home-hud";
import { HomeExploreSheet } from "@/features/home/components/home-explore-sheet";
import { HomeImmersiveSheet } from "@/features/home/components/home-immersive-sheet";
import { HomeSceneState } from "@/features/home/components/home-scene-state";
import { useHomeScreenController } from "@/features/home/hooks/use-home-screen-controller";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { openDrawer } = useLocalSearchParams<{ openDrawer?: string }>();
  const {
    activeSheet,
    artworkTitleForQr,
    centralLabel,
    currentArtworkId,
    debugModeEnabled,
    dismissImmersivePrompt,
    dismissSuggestion,
    immersiveExperiences,
    isArtworkNarrationPlaying,
    isRoomDetected,
    isSuggestionVisible,
    isTorchOn,
    museumName,
    openArtworkDetail,
    openArMvp,
    openExploreSheet,
    openImmersivePrompt,
    openImmersiveExperience,
    openManualCodeEntry,
    openQrScanner,
    repeatArtworkNarration,
    roomArtworks,
    roomName,
    sensorPanelProps,
    setIsTorchOn,
    shouldShowSuggestionCta,
    suggestedArtwork,
    suggestedArtworkImageSource,
    topRoomLabel,
    visitedArtworkIds,
    closeQrScanner,
    handleCentralAction,
    handleExploreOtherSuggestions,
    handleMockQrScan,
    handleViewSuggestedAr,
  } = useHomeScreenController();

  useEffect(() => {
    if (openDrawer !== "1") {
      return;
    }

    const timer = setTimeout(() => {
      navigation.dispatch(DrawerActions.openDrawer());
      router.replace("/home" as never);
    }, 0);

    return () => clearTimeout(timer);
  }, [navigation, openDrawer]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={require("@/assets/images/fondo.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <View style={styles.cameraShade} />
      <SafeAreaView style={styles.safeArea}>
        <HomeTopHud
          isArtworkNarrationPlaying={isArtworkNarrationPlaying}
          onOpenArMvp={openArMvp}
          onOpenImmersiveTest={openImmersivePrompt}
          onOpenDrawer={() => navigation.dispatch(DrawerActions.openDrawer())}
          onRepeatArtworkNarration={repeatArtworkNarration}
          topRoomLabel={topRoomLabel}
        />

        {activeSheet === "qr" ? (
          <QrScannerOverlay
            artworkTitle={artworkTitleForQr}
            isTorchOn={isTorchOn}
            museumName={museumName}
            onCancel={closeQrScanner}
            onManualEntry={openManualCodeEntry}
            onMockScan={handleMockQrScan}
            onToggleTorch={() => setIsTorchOn((value) => !value)}
            roomName={roomName}
          />
        ) : (
          <>
            <HomeSceneState
              isRoomDetected={isRoomDetected}
              isSuggestionVisible={isSuggestionVisible}
              onCloseSuggestion={dismissSuggestion}
              onExploreOtherSuggestions={handleExploreOtherSuggestions}
              onViewSuggestedAr={handleViewSuggestedAr}
              roomName={roomName}
              shouldShowSuggestionCta={shouldShowSuggestionCta}
              suggestedArtwork={suggestedArtwork}
              suggestedArtworkImageSource={suggestedArtworkImageSource}
            />
            <HomeBottomHud
              centralLabel={centralLabel}
              onCentralAction={handleCentralAction}
              onExplore={openExploreSheet}
              onOpenQr={openQrScanner}
              shouldShowSuggestionCta={shouldShowSuggestionCta}
            />
          </>
        )}
      </SafeAreaView>

      {activeSheet === "explore" ? (
        <HomeExploreSheet
          currentArtworkId={currentArtworkId}
          isRoomDetected={isRoomDetected}
          onArtworkPress={openArtworkDetail}
          onClose={closeQrScanner}
          roomArtworks={roomArtworks}
          roomName={roomName}
          visitedArtworkIds={visitedArtworkIds}
        />
      ) : null}

      {activeSheet === "immersive" && immersiveExperiences.length > 0 ? (
        <HomeImmersiveSheet
          experiences={immersiveExperiences}
          onClose={dismissImmersivePrompt}
          onEnter={openImmersiveExperience}
          roomName={roomName}
        />
      ) : null}

      {debugModeEnabled ? <SensorPanel {...sensorPanelProps} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  cameraShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.22)",
  },
  safeArea: {
    flex: 1,
  },
});
