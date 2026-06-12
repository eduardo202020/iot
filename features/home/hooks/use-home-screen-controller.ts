import { useHomeBleStatus } from "@/hooks/use-home-ble-status";
import { useHomeSensors } from "@/hooks/use-home-sensors";
import { getArtworkImageSource } from "@/lib/artwork-images";
import {
  getAllRoomImmersiveExperiences,
  getRoomImmersiveExperiences,
} from "@/lib/room-experiences";
import {
  MVP_IMMERSIVE_ROOM_ID,
  museumMock,
  type ArtworkMock,
} from "@/datos";
import {
  getArResourceById,
  getArResourcesForArtwork,
  getDefaultArResourceForArtwork,
} from "@/lib/museum-structure";
import type { RoomImmersiveExperience } from "@/lib/immersive-experience-types";
import type { BeaconData } from "@/types/beacon";
import { useMuseIQ } from "@/providers/museiq-provider";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

type ActiveSheet = "explore" | "immersive" | "qr" | null;

const fallbackImmersiveRoom = museumMock.rooms.find(
  (room) => room.id === MVP_IMMERSIVE_ROOM_ID,
);

function parseHeadingDegrees(headingState?: string | null) {
  const match = headingState?.match(/-?\d+/);
  if (!match) {
    return undefined;
  }

  const rawDegrees = Number(match[0]);
  if (!Number.isFinite(rawDegrees)) {
    return undefined;
  }

  return ((rawDegrees % 360) + 360) % 360;
}

function getPreferredColumnFromHeading(headingState?: string | null) {
  const headingDegrees = parseHeadingDegrees(headingState);
  if (headingDegrees === undefined) {
    return undefined;
  }

  return headingDegrees >= 180 ? "izquierda" : "derecha";
}

function getLikelyArtworkFromRoom(
  roomArtworks: ArtworkMock[],
  beacon?: BeaconData,
  headingState?: string | null,
) {
  if (roomArtworks.length === 0) {
    return undefined;
  }

  if (beacon?.artworkId) {
    const exactArtwork = roomArtworks.find((artwork) => artwork.id === beacon.artworkId);
    if (exactArtwork) {
      return exactArtwork;
    }
  }

  const rowCandidates = beacon?.beaconNode
    ? roomArtworks.filter((artwork) => artwork.row === beacon.beaconNode)
    : [];
  const candidates = rowCandidates.length > 0 ? rowCandidates : roomArtworks;
  const preferredColumn = getPreferredColumnFromHeading(headingState);

  if (preferredColumn) {
    const columnCandidate = candidates.find(
      (artwork) => artwork.colName === preferredColumn,
    );

    if (columnCandidate) {
      return columnCandidate;
    }
  }

  return candidates[0];
}

export function useHomeScreenController() {
  const isFocused = useIsFocused();
  const {
    currentArtwork,
    currentRoom,
    currentArtworkId,
    debugModeEnabled,
    findArtworkById,
    findRoomById,
    getArtworksForRoom,
    homeQuickActionsVisible,
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
  } = useHomeSensors(isFocused);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [dismissedImmersiveRoomId, setDismissedImmersiveRoomId] = useState<string | null>(null);
  const [dismissedSuggestionId, setDismissedSuggestionId] = useState<string | null>(null);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isSensorPanelOpen, setIsSensorPanelOpen] = useState(false);
  const lastAppliedRoomIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isFocused || !dominantBeacon?.roomId) {
      return;
    }

    if (
      lastAppliedRoomIdRef.current === dominantBeacon.roomId &&
      currentRoom?.id === dominantBeacon.roomId
    ) {
      return;
    }

    lastAppliedRoomIdRef.current = dominantBeacon.roomId;
    setCurrentRoomById(dominantBeacon.roomId);
  }, [currentRoom?.id, dominantBeacon?.roomId, isFocused, setCurrentRoomById]);

  const detectedRoom = useMemo(() => {
    if (!dominantBeacon?.roomId) {
      return null;
    }

    const providerRoom = findRoomById(dominantBeacon.roomId);
    if (providerRoom) {
      return providerRoom;
    }

    if (dominantBeacon.roomId === MVP_IMMERSIVE_ROOM_ID) {
      return fallbackImmersiveRoom ?? null;
    }

    return currentRoom ?? null;
  }, [currentRoom, dominantBeacon?.roomId, findRoomById]);

  const isRoomDetected = Boolean(detectedRoom);
  const activeRoom = detectedRoom ?? currentRoom;
  const roomArtworks = useMemo(
    () => (activeRoom ? getArtworksForRoom(activeRoom.id) : []),
    [activeRoom, getArtworksForRoom],
  );
  const roomImmersiveExperiences = useMemo(
    () => (activeRoom ? getRoomImmersiveExperiences(activeRoom.id) : []),
    [activeRoom],
  );
  const immersiveExperiences = activeRoom
    ? roomImmersiveExperiences
    : getAllRoomImmersiveExperiences();
  const isImmersiveRoom =
    isRoomDetected &&
    Boolean(activeRoom) &&
    (activeRoom?.id === MVP_IMMERSIVE_ROOM_ID ||
      (roomArtworks.length === 0 && immersiveExperiences.length > 0));
  const suggestedArtwork = useMemo(() => {
    if (roomArtworks.length > 0) {
      return getLikelyArtworkFromRoom(
        roomArtworks,
        dominantBeacon,
        headingState,
      );
    }

    return isRoomDetected ? undefined : currentArtwork;
  }, [currentArtwork, dominantBeacon, headingState, isRoomDetected, roomArtworks]);
  const suggestedArtworkImageSource = getArtworkImageSource(suggestedArtwork?.image);
  const suggestedArtworkResources = useMemo(
    () =>
      getArResourcesForArtwork(suggestedArtwork?.id).map((resource) => ({
        ...resource,
        modelTitle:
          findArtworkById(resource.modelArtworkId)?.title ?? resource.title,
      })),
    [findArtworkById, suggestedArtwork?.id],
  );
  const hasNearbySuggestion = isRoomDetected && !isImmersiveRoom && Boolean(suggestedArtwork);
  const isSuggestionDismissed =
    Boolean(suggestedArtwork?.id) && dismissedSuggestionId === suggestedArtwork?.id;
  const shouldShowSuggestionCta = hasNearbySuggestion && !isSuggestionDismissed;
  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = activeRoom?.name ?? "Buscando sala";
  const activeRoomId = activeRoom?.id;
  const topRoomLabel = isRoomDetected ? roomName : "Reconociendo sala";
  const centralLabel = isImmersiveRoom
    ? "Entrar VR"
    : shouldShowSuggestionCta
      ? "Ver sugerencia"
      : "Preguntar";

  useEffect(() => {
    console.log("[MuseIQ][HOME_FLOW]", JSON.stringify({
      activeRoomId,
      activeSheet,
      beaconNode: dominantBeacon?.beaconNode ?? null,
      beaconRoomId: dominantBeacon?.roomId ?? null,
      beaconSource: dominantBeacon?.source ?? "ble",
      isImmersiveRoom,
      isRoomDetected,
      resourceCount: suggestedArtworkResources.length,
      shouldShowSuggestionCta,
      suggestedArtworkId: suggestedArtwork?.id ?? null,
    }));
  }, [
    activeRoomId,
    activeSheet,
    dominantBeacon?.beaconNode,
    dominantBeacon?.roomId,
    dominantBeacon?.source,
    isImmersiveRoom,
    isRoomDetected,
    suggestedArtworkResources.length,
    shouldShowSuggestionCta,
    suggestedArtwork?.id,
  ]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    if (!hasNearbySuggestion || !suggestedArtwork?.id || isSuggestionDismissed) {
      setIsSuggestionVisible(false);
      return;
    }

    if (activeSheet) {
      return;
    }

    setIsSuggestionVisible(true);
  }, [
    activeSheet,
    hasNearbySuggestion,
    isFocused,
    isSuggestionDismissed,
    suggestedArtwork?.id,
  ]);

  useEffect(() => {
    if (!isRoomDetected || !activeRoomId) {
      return;
    }

    if (!isImmersiveRoom) {
      setActiveSheet((value) => (value === "immersive" ? null : value));
      setDismissedImmersiveRoomId(null);
      return;
    }

    if (
      immersiveExperiences.length === 0 ||
      dismissedImmersiveRoomId === activeRoomId
    ) {
      return;
    }

    setIsSuggestionVisible(false);
    setActiveSheet("immersive");
  }, [
    activeRoomId,
    dismissedImmersiveRoomId,
    immersiveExperiences.length,
    isImmersiveRoom,
    isRoomDetected,
  ]);

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
    if (isImmersiveRoom) {
      setActiveSheet("immersive");
      return;
    }

    if (shouldShowSuggestionCta) {
      setIsSuggestionVisible(true);
      return;
    }

    openCentralQuestion();
  };

  const handleViewSuggestedAr = (resourceId?: string) => {
    if (!suggestedArtwork?.id) {
      return;
    }

    const resource =
      getArResourceById(resourceId) ??
      getDefaultArResourceForArtwork(suggestedArtwork.id);
    const targetArtworkId = resource?.modelArtworkId ?? suggestedArtwork.id;

    selectArtwork(targetArtworkId);
    router.push({
      pathname: "/ar-viro-activo",
      params: {
        artworkId: targetArtworkId,
        resourceId: resource?.id,
        sourceArtworkId: suggestedArtwork.id,
      },
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
    if (isImmersiveRoom && activeRoomId) {
      setDismissedImmersiveRoomId(activeRoomId);
    }

    setActiveSheet(null);
  };

  const openImmersivePrompt = () => {
    if (immersiveExperiences.length === 0) {
      return;
    }

    setDismissedImmersiveRoomId(null);
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
    const artwork = suggestedArtwork ?? (isRoomDetected ? undefined : currentArtwork);
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
    homeQuickActionsVisible,
    dismissImmersivePrompt,
    isArtworkNarrationPlaying,
    isImmersiveRoom,
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
    suggestedArtworkResources,
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
