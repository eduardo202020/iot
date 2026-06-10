import { useHomeBleStatus } from "@/hooks/use-home-ble-status";
import { useHomeSensors } from "@/hooks/use-home-sensors";
import { getArtworkImageSource } from "@/lib/artwork-images";
import {
  getAllRoomImmersiveExperiences,
  getRoomImmersiveExperiences,
} from "@/lib/room-experiences";
import type { RoomImmersiveExperience } from "@/lib/immersive-experience-types";
import { useMuseIQ } from "@/providers/museiq-provider";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

type ActiveSheet = "explore" | "immersive" | "qr" | null;

export function useHomeScreenController() {
  const isFocused = useIsFocused();
  const {
    currentArtwork,
    currentRoom,
    currentArtworkId,
    debugModeEnabled,
    findRoomById,
    getArtworksForRoom,
    isArtworkNarrationPlaying,
    museumProfile,
    repeatArtworkNarration,
    selectArtwork,
    setCurrentRoomById,
    visitedArtworkIds,
  } = useMuseIQ();
  const {
    bleStatusLabel,
    dominantBeacon,
    error: bleError,
  } = useHomeBleStatus();
  const {
    accelerometerStatus,
    compassStatus,
    headingState,
    movementState,
    stepCount,
    stepCountStatus,
  } = useHomeSensors(debugModeEnabled && isFocused);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [dismissedSuggestionId, setDismissedSuggestionId] = useState<string | null>(null);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isSensorPanelOpen, setIsSensorPanelOpen] = useState(false);

  useEffect(() => {
    if (dominantBeacon?.roomId) {
      setCurrentRoomById(dominantBeacon.roomId);
    }
  }, [dominantBeacon?.roomId, setCurrentRoomById]);

  const detectedRoom = useMemo(() => {
    if (!dominantBeacon?.roomId) {
      return null;
    }

    return findRoomById(dominantBeacon.roomId) ?? currentRoom ?? null;
  }, [currentRoom, dominantBeacon?.roomId, findRoomById]);

  const isRoomDetected = Boolean(detectedRoom);
  const activeRoom = detectedRoom ?? currentRoom;
  const roomArtworks = activeRoom ? getArtworksForRoom(activeRoom.id) : [];
  const suggestedArtwork = roomArtworks[0] ?? currentArtwork;
  const suggestedArtworkImageSource = getArtworkImageSource(suggestedArtwork?.image);
  const hasNearbySuggestion = isRoomDetected && Boolean(suggestedArtwork);
  const isSuggestionDismissed =
    Boolean(suggestedArtwork?.id) && dismissedSuggestionId === suggestedArtwork?.id;
  const shouldShowSuggestionCta = hasNearbySuggestion && !isSuggestionDismissed;
  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = activeRoom?.name ?? "Buscando sala";
  const topRoomLabel = isRoomDetected ? roomName : "Reconociendo sala";
  const centralLabel = shouldShowSuggestionCta ? "Ver sugerencia" : "Preguntar";
  const roomImmersiveExperiences = getRoomImmersiveExperiences(activeRoom?.id);
  const immersiveExperiences =
    roomImmersiveExperiences.length > 0
      ? roomImmersiveExperiences
      : getAllRoomImmersiveExperiences();

  useEffect(() => {
    if (!hasNearbySuggestion || !suggestedArtwork?.id || isSuggestionDismissed) {
      setIsSuggestionVisible(false);
      return;
    }

    setIsSuggestionVisible(true);
  }, [hasNearbySuggestion, isSuggestionDismissed, suggestedArtwork?.id]);

  const openCentralQuestion = () => {
    router.push({
      pathname: "/pregunta-voz-modal",
      params: currentArtwork?.id ? { artworkId: currentArtwork.id } : {},
    } as never);
  };

  const dismissSuggestion = () => {
    if (suggestedArtwork?.id) {
      setDismissedSuggestionId(suggestedArtwork.id);
    }
    setIsSuggestionVisible(false);
  };

  const handleCentralAction = () => {
    if (shouldShowSuggestionCta) {
      setIsSuggestionVisible(true);
      return;
    }

    openCentralQuestion();
  };

  const handleViewSuggestedAr = () => {
    if (!suggestedArtwork?.id) {
      return;
    }

    selectArtwork(suggestedArtwork.id);
    setDismissedSuggestionId(suggestedArtwork.id);
    setIsSuggestionVisible(false);
    router.push({
      pathname: "/ar-viro-activo",
      params: { artworkId: suggestedArtwork.id },
    } as never);
  };

  const handleExploreOtherSuggestions = () => {
    dismissSuggestion();
    setActiveSheet("explore");
  };

  const openExploreSheet = () => {
    setIsSuggestionVisible(false);
    setActiveSheet("explore");
  };

  const openQrScanner = () => {
    setIsSuggestionVisible(false);
    setActiveSheet(null);
    setIsTorchOn(false);
    router.push("/ar-qr" as never);
  };

  const closeQrScanner = () => {
    setIsTorchOn(false);
    setActiveSheet(null);
  };

  const dismissImmersivePrompt = () => {
    setActiveSheet(null);
  };

  const openImmersivePrompt = () => {
    if (immersiveExperiences.length === 0) {
      return;
    }

    setActiveSheet("immersive");
  };

  const openImmersiveExperience = (experience: RoomImmersiveExperience) => {
    if (!experience) {
      return;
    }

    setActiveSheet(null);
    router.push({
      pathname: "/cargando-inmersivo",
      params: { experienceId: experience.id },
    } as never);
  };

  const openArMvp = () => {
    setActiveSheet(null);
    setIsTorchOn(false);
    router.push("/ar-qr" as never);
  };

  const openManualCodeEntry = () => {
    setActiveSheet(null);
    setIsTorchOn(false);
    router.push("/codigo-manual" as never);
  };

  const handleMockQrScan = () => {
    const artwork = suggestedArtwork ?? currentArtwork;
    if (!artwork) {
      return;
    }

    selectArtwork(artwork.id);
    setActiveSheet(null);
    setIsTorchOn(false);
    router.push({
      pathname: "/obra-identificada",
      params: { artworkId: artwork.id },
    } as never);
  };

  const openArtworkDetail = (artworkId: string) => {
    selectArtwork(artworkId);
    setActiveSheet(null);
    router.push({
      pathname: "/artwork-detail",
      params: { artworkId },
    } as never);
  };

  return {
    activeSheet,
    artworkTitleForQr: suggestedArtwork?.title ?? "Obra del museo",
    centralLabel,
    currentArtworkId,
    debugModeEnabled,
    dismissImmersivePrompt,
    isArtworkNarrationPlaying,
    isRoomDetected,
    isSensorPanelOpen,
    isSuggestionVisible,
    isTorchOn,
    museumName,
    repeatArtworkNarration,
    roomArtworks,
    roomName,
    immersiveExperiences,
    sensorPanelProps: {
      accelerometerStatus,
      bleStatus: bleError ? `error - ${bleError}` : bleStatusLabel,
      compassStatus,
      headingState,
      isOpen: isSensorPanelOpen,
      movementState,
      onToggle: () => setIsSensorPanelOpen((value) => !value),
      stepCount,
      stepCountStatus,
    },
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
    openArtworkDetail,
    openExploreSheet,
    openImmersivePrompt,
    openImmersiveExperience,
    openArMvp,
    openManualCodeEntry,
    openQrScanner,
    setIsTorchOn,
    dismissSuggestion,
  };
}
