import { useHomeBleStatus } from "@/hooks/use-home-ble-status";
import { useHomeSensors } from "@/hooks/use-home-sensors";
import type { SensorBeaconReading } from "@/components/museiq/home/sensor-panel";
import { getArtworkImageSource } from "@/lib/artwork-images";
import {
  getAllRoomImmersiveExperiences,
  getRoomImmersiveExperiences,
} from "@/lib/room-experiences";
import {
  MVP_NORMAL_ROOM_ID,
  MVP_IMMERSIVE_ROOM_ID,
  museumMock,
  type ArtworkMock,
} from "@/datos";
import {
  getArResourceById,
  getArResourcesForArtwork,
  getDefaultArResourceForArtwork,
  MVP_NORMAL_ROOM_ZONES,
  type NormalRoomZone,
} from "@/lib/museum-structure";
import type { RoomImmersiveExperience } from "@/lib/immersive-experience-types";
import type { BeaconData } from "@/types/beacon";
import { useMuseIQ } from "@/providers/museiq-provider";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

type ActiveSheet = "explore" | "immersive" | "qr" | null;
const SUGGESTION_AUTO_NARRATION_DELAY_MS = 3600;

const fallbackImmersiveRoom = museumMock.rooms.find(
  (room) => room.id === MVP_IMMERSIVE_ROOM_ID,
);
const fallbackNormalRoom = museumMock.rooms.find(
  (room) => room.id === MVP_NORMAL_ROOM_ID,
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

function getBeaconReading(beacon: BeaconData): SensorBeaconReading {
  const room = beacon.roomId === MVP_IMMERSIVE_ROOM_ID ? "Sala VR" : beacon.roomId.replace("_", " ");
  const zone = beacon.zoneId ?? `Nodo ${beacon.beaconNode}`;

  return {
    id: beacon.id,
    label: `${room} · ${zone}`,
    rssi: beacon.rssi,
  };
}

function createManualBeacon(zone: NormalRoomZone): BeaconData {
  return {
    battery: 0,
    beaconNode: zone.beaconNode,
    deviceAddress: "MANUAL:HOME",
    firmwareMajor: 0,
    firmwareMinor: 0,
    firmwareVersion: "manual",
    id: `MANUAL-${zone.zoneId}`,
    isActive: true,
    lastSeen: Date.now(),
    rssi: 0,
    roomId: zone.roomId,
    source: "manual",
    txPower: 0,
    txPowerPayload: 0,
    artworkId: zone.artworkId,
    zoneId: zone.zoneId,
    zoneLabel: zone.label,
  };
}

function getZoneIndexForBeacon(beacon?: BeaconData) {
  if (!beacon || beacon.roomId !== MVP_NORMAL_ROOM_ID) {
    return undefined;
  }

  const index = MVP_NORMAL_ROOM_ZONES.findIndex(
    (zone) => zone.artworkId === beacon.artworkId || zone.beaconNode === beacon.beaconNode,
  );

  return index >= 0 ? index : undefined;
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
    playArtworkNarration,
    repeatArtworkNarration,
    selectArtwork,
    setCurrentRoomById,
    settings,
    visitedArtworkIds,
  } = useMuseIQ();
  const {
    beacons,
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
  const [manualZoneIndex, setManualZoneIndex] = useState<number | null>(null);
  const autoNarratedSuggestionIdsRef = useRef<Set<string>>(new Set());
  const lastAppliedRoomIdRef = useRef<string | null>(null);

  const physicalZoneIndex = getZoneIndexForBeacon(dominantBeacon);
  const activeManualZoneIndex = manualZoneIndex ?? physicalZoneIndex ?? 0;
  const manualZone = MVP_NORMAL_ROOM_ZONES[activeManualZoneIndex];
  const effectiveBeacon = useMemo(
    () => (manualZoneIndex === null ? dominantBeacon : createManualBeacon(manualZone)),
    [dominantBeacon, manualZone, manualZoneIndex],
  );

  const moveManualZone = (direction: -1 | 1) => {
    setManualZoneIndex((currentIndex) => {
      const baseIndex = currentIndex ?? physicalZoneIndex ?? 0;
      return (baseIndex + direction + MVP_NORMAL_ROOM_ZONES.length) % MVP_NORMAL_ROOM_ZONES.length;
    });
  };

  useEffect(() => {
    if (!isFocused || !effectiveBeacon?.roomId) {
      return;
    }

    if (
      lastAppliedRoomIdRef.current === effectiveBeacon.roomId &&
      currentRoom?.id === effectiveBeacon.roomId
    ) {
      return;
    }

    lastAppliedRoomIdRef.current = effectiveBeacon.roomId;
    setCurrentRoomById(effectiveBeacon.roomId);
  }, [currentRoom?.id, effectiveBeacon?.roomId, isFocused, setCurrentRoomById]);

  const detectedRoom = useMemo(() => {
    if (!effectiveBeacon?.roomId) {
      return null;
    }

    const providerRoom = findRoomById(effectiveBeacon.roomId);
    if (providerRoom) {
      return providerRoom;
    }

    if (effectiveBeacon.roomId === MVP_IMMERSIVE_ROOM_ID) {
      return fallbackImmersiveRoom ?? null;
    }

    return currentRoom ?? null;
  }, [currentRoom, effectiveBeacon?.roomId, findRoomById]);

  const isRoomDetected = Boolean(detectedRoom);
  const activeRoom = detectedRoom ?? currentRoom;
  const roomArtworks = useMemo(
    () => (activeRoom ? getArtworksForRoom(activeRoom.id) : []),
    [activeRoom, getArtworksForRoom],
  );
  const normalRoomArtworks = useMemo(
    () => getArtworksForRoom(MVP_NORMAL_ROOM_ID),
    [getArtworksForRoom],
  );
  const roomImmersiveExperiences = useMemo(
    () => (activeRoom ? getRoomImmersiveExperiences(activeRoom.id) : []),
    [activeRoom],
  );
  const mvpImmersiveExperiences = useMemo(
    () => getRoomImmersiveExperiences(MVP_IMMERSIVE_ROOM_ID),
    [],
  );
  const isImmersiveRoom =
    isRoomDetected &&
    Boolean(activeRoom) &&
    (activeRoom?.id === MVP_IMMERSIVE_ROOM_ID ||
      (roomArtworks.length === 0 && roomImmersiveExperiences.length > 0));
  const immersiveExperiences = isImmersiveRoom
    ? roomImmersiveExperiences
    : mvpImmersiveExperiences.length > 0
      ? mvpImmersiveExperiences
      : getAllRoomImmersiveExperiences();
  const suggestedArtwork = useMemo(() => {
    if (roomArtworks.length > 0) {
      return getLikelyArtworkFromRoom(
        roomArtworks,
        effectiveBeacon,
        headingState,
      );
    }

    return isRoomDetected ? undefined : currentArtwork;
  }, [currentArtwork, effectiveBeacon, headingState, isRoomDetected, roomArtworks]);
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
  const immersiveRoomName = isImmersiveRoom
    ? roomName
    : fallbackImmersiveRoom?.name ?? "Sala VR";
  const exploreRoomArtworks = roomArtworks.length > 0 ? roomArtworks : normalRoomArtworks;
  const exploreRoomName =
    roomArtworks.length > 0 ? roomName : fallbackNormalRoom?.name ?? "Sala 1";
  const activeRoomId = activeRoom?.id;
  const topRoomLabel = isRoomDetected ? roomName : "Reconociendo sala";
  const homeBeaconReadings = useMemo(
    () => beacons.filter((beacon) => beacon.isActive).map(getBeaconReading),
    [beacons],
  );
  const centralLabel = isImmersiveRoom
    ? "Entrar VR"
    : shouldShowSuggestionCta
      ? "Ver sugerencia"
      : "Preguntar";

  useEffect(() => {
    console.log("[MuseIQ][HOME_FLOW]", JSON.stringify({
      activeRoomId,
      activeSheet,
      beaconNode: effectiveBeacon?.beaconNode ?? null,
      beaconRoomId: effectiveBeacon?.roomId ?? null,
      beaconSource: effectiveBeacon?.source ?? "ble",
      manualZoneIndex,
      isImmersiveRoom,
      isRoomDetected,
      resourceCount: suggestedArtworkResources.length,
      shouldShowSuggestionCta,
      suggestedArtworkId: suggestedArtwork?.id ?? null,
    }));
  }, [
    activeRoomId,
    activeSheet,
    effectiveBeacon?.beaconNode,
    effectiveBeacon?.roomId,
    effectiveBeacon?.source,
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
    manualZoneIndex,
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

  useEffect(() => {
    const suggestedArtworkId = suggestedArtwork?.id;

    if (
      !isFocused ||
      !settings.autoPlay ||
      activeSheet ||
      activeRoomId !== MVP_NORMAL_ROOM_ID ||
      !isSuggestionVisible ||
      !shouldShowSuggestionCta ||
      !suggestedArtworkId ||
      autoNarratedSuggestionIdsRef.current.has(suggestedArtworkId)
    ) {
      return undefined;
    }

    const timer = setTimeout(() => {
      autoNarratedSuggestionIdsRef.current.add(suggestedArtworkId);
      selectArtwork(suggestedArtworkId);
      playArtworkNarration(suggestedArtworkId);
      console.log("[MuseIQ][AUDIO_FLOW]", JSON.stringify({
        artworkId: suggestedArtworkId,
        event: "autoNarrationStarted",
        roomId: activeRoomId,
        trigger: "normal-room-zone-dwell",
      }));
    }, SUGGESTION_AUTO_NARRATION_DELAY_MS);

    return () => clearTimeout(timer);
  }, [
    activeRoomId,
    activeSheet,
    isFocused,
    isSuggestionVisible,
    playArtworkNarration,
    selectArtwork,
    settings.autoPlay,
    shouldShowSuggestionCta,
    suggestedArtwork?.id,
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

  const handleListenSuggestedArtwork = () => {
    if (!suggestedArtwork?.id) {
      return;
    }

    autoNarratedSuggestionIdsRef.current.add(suggestedArtwork.id);
    selectArtwork(suggestedArtwork.id);
    playArtworkNarration(suggestedArtwork.id);
  };

  const handleAskSuggestedArtwork = () => {
    if (!suggestedArtwork?.id) {
      openCentralQuestion();
      return;
    }

    selectArtwork(suggestedArtwork.id);
    router.push({
      pathname: "/pregunta-voz-modal",
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
    exploreRoomArtworks,
    exploreRoomName,
    repeatArtworkNarration,
    roomArtworks,
    roomName,
    immersiveExperiences,
    immersiveRoomName,
    sensorPanelProps: {
      accelerometerStatus,
      beaconReadings: homeBeaconReadings,
      bleStatus: bleError ? `error - ${bleError}` : bleStatusLabel,
      compassStatus,
      headingState,
      isOpen: isSensorPanelOpen,
      isManualZoneActive: manualZoneIndex !== null,
      movementState,
      manualZoneLabel: `${manualZone.zoneId} · ${manualZone.label}`,
      onNextManualZone: () => moveManualZone(1),
      onPreviousManualZone: () => moveManualZone(-1),
      onToggle: () => setIsSensorPanelOpen((value) => !value),
      onUsePhysicalBeacon: () => setManualZoneIndex(null),
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
    handleAskSuggestedArtwork,
    handleExploreOtherSuggestions,
    handleMockQrScan,
    handleListenSuggestedArtwork,
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
