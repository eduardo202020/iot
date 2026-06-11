import {
    defaultPermissionStatuses,
    type ArtworkMock,
    type FAQItem,
    type MuseumInfo,
    type RouteStepMock,
    type RoomMock,
} from "@/datos";
import {
  getAnalyticsSummary,
  recordAnalyticsEvent,
  setVisitorPreference,
  type AnalyticsSummary,
} from "@/lib/museum-database";
import {
  defaultAnalyticsSummary,
  defaultPermissionCatalog,
  defaultSettings,
} from "@/providers/museiq/constants";
import { getRouteProgressLabel } from "@/providers/museiq/helpers";
import { useMuseIQAnalyticsFavorites } from "@/providers/museiq/use-museiq-analytics-favorites";
import { useArtworkNarration } from "@/providers/museiq/use-artwork-narration";
import { useMuseIQBootstrap } from "@/providers/museiq/use-museiq-bootstrap";
import { useMuseIQNavigation } from "@/providers/museiq/use-museiq-navigation";
import { useMuseIQPermissions } from "@/providers/museiq/use-museiq-permissions";
import type {
  MuseIQContextValue,
  PermissionCatalog,
  SettingsState,
} from "@/providers/museiq/types";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useMemo,
    useState,
} from "react";

const MuseIQContext = createContext<MuseIQContextValue | null>(null);

export function MuseIQProvider({ children }: PropsWithChildren) {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [museumProfile, setMuseumProfile] = useState<MuseumInfo | null>(null);
  const [rooms, setRooms] = useState<RoomMock[]>([]);
  const [artworks, setArtworks] = useState<ArtworkMock[]>([]);
  const [route, setRoute] = useState<RouteStepMock[]>([]);
  const [helpFaq, setHelpFaq] = useState<FAQItem[]>([]);
  const [voicePrompts, setVoicePrompts] = useState<string[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionCatalog>(
    defaultPermissionCatalog,
  );
  const [permissionsAccepted, setPermissionsAccepted] = useState(false);
  const [permissions, setPermissions] = useState(defaultPermissionStatuses);
  const [settings, setSettings] = useState(defaultSettings);
  const [currentArtworkId, setCurrentArtworkId] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [currentZoneLabel, setCurrentZoneLabel] = useState(
    "cerca de la entrada",
  );
  const [visitedArtworkIds, setVisitedArtworkIds] = useState<string[]>([]);
  const [favoriteArtworkIds, setFavoriteArtworkIds] = useState<string[]>([]);
  const [hasCompletedWelcome, setHasCompletedWelcome] = useState(false);
  const [debugModeEnabled, setDebugModeEnabledState] = useState(false);
  const [homeQuickActionsVisible, setHomeQuickActionsVisibleState] = useState(true);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary>(
    defaultAnalyticsSummary
  );

  const findArtworkById = (artworkId?: string) =>
    artworks.find((artwork) => artwork.id === artworkId);
  const findRoomById = (roomId?: string) =>
    rooms.find((room) => room.id === roomId);
  const getArtworksForRoom = (roomId: string) =>
    artworks
      .filter((artwork) => artwork.roomId === roomId)
      .sort((a, b) => a.order - b.order);

  const currentArtwork = findArtworkById(currentArtworkId);
  const currentRoom = findRoomById(currentRoomId);
  const currentRouteStep = useMemo(
    () => route.find((step) => step.artworkId === currentArtworkId),
    [currentArtworkId, route],
  );
  const routeProgress = currentRouteStep?.sequence ?? 0;
  const routeTotal = route.length;
  const routeProgressLabel = getRouteProgressLabel(routeProgress, routeTotal);
  const allPermissionsGranted = Object.values(permissions).every(
    (status) => status === "granted",
  );
  const { isArtworkNarrationPlaying, speakArtwork, stopArtworkNarration } =
    useArtworkNarration({
      findArtworkById,
      settings,
    });
  const { requestAllPermissions, declinePermissions } = useMuseIQPermissions({
    setPermissions,
    setPermissionsAccepted,
  });
  const { refreshAnalyticsSummary, toggleFavoriteArtwork } =
    useMuseIQAnalyticsFavorites({
      findArtworkById,
      setAnalyticsSummary,
      setFavoriteArtworkIds,
    });
  const {
    continueVisit: continueVisitWithHistory,
    goToNextArtwork,
    goToPreviousArtwork,
    repeatArtworkNarration,
    selectArtwork,
    setCurrentRoomById,
  } = useMuseIQNavigation({
    artworks,
    currentArtworkId,
    findArtworkById,
    findRoomById,
    getArtworksForRoom,
    getFreshAnalyticsSummary: getAnalyticsSummary,
    route,
    setAnalyticsSummary,
    setCurrentArtworkId,
    setCurrentRoomId,
    setCurrentZoneLabel,
    setVisitedArtworkIds,
    speakArtwork,
  });
  const { resetVisitorExperience } = useMuseIQBootstrap({
    setAnalyticsSummary,
    setArtworks,
    setCurrentArtworkId,
    setCurrentRoomId,
    setCurrentZoneLabel,
    setDebugModeEnabledState,
    setFavoriteArtworkIds,
    setHomeQuickActionsVisible: setHomeQuickActionsVisibleState,
    setHasCompletedWelcome,
    setHelpFaq,
    setIsDatabaseReady,
    setMuseumProfile,
    setPermissionCatalog,
    setPermissions,
    setPermissionsAccepted,
    setRooms,
    setRoute,
    setSettings,
    setVoicePrompts,
    setVisitedArtworkIds,
    stopArtworkNarration,
  });

  const continueVisit = () => {
    continueVisitWithHistory(visitedArtworkIds);
  };

  const completeWelcome = () => {
    setHasCompletedWelcome(true);
    setVisitorPreference("welcome_completed", "true").catch(() => undefined);
    recordAnalyticsEvent({
      eventType: "welcome_completed",
      artworkId: currentArtworkId || null,
      roomId: currentRoomId || null,
    })
      .then(() => getAnalyticsSummary())
      .then(setAnalyticsSummary)
      .catch(() => undefined);
  };

  const setDebugModeEnabled = (enabled: boolean) => {
    setDebugModeEnabledState(enabled);
    setVisitorPreference("debug_mode_enabled", enabled ? "true" : "false").catch(
      () => undefined,
    );
  };

  const setHomeQuickActionsVisible = (visible: boolean) => {
    setHomeQuickActionsVisibleState(visible);
    setVisitorPreference("home_quick_actions_visible", visible ? "true" : "false").catch(
      () => undefined,
    );
  };

  const updateSettings = (patch: Partial<SettingsState>) => {
    setSettings((previous) => ({ ...previous, ...patch }));
  };

  const value = useMemo<MuseIQContextValue>(
    () => ({
      isDatabaseReady,
      museumProfile,
      rooms,
      artworks,
      route,
      helpFaq,
      voicePrompts,
      permissionCatalog,
      currentArtworkId,
      currentRoomId,
      currentZoneLabel,
      currentRouteStep,
      routeProgress,
      routeTotal,
      routeProgressLabel,
      hasCompletedWelcome,
      debugModeEnabled,
      homeQuickActionsVisible,
      permissionsAccepted,
      permissions,
      settings,
      visitedArtworkIds,
      favoriteArtworkIds,
      currentArtwork,
      currentRoom,
      isArtworkNarrationPlaying,
      analyticsSummary,
      allPermissionsGranted,
      requestAllPermissions,
      declinePermissions,
      selectArtwork,
      goToNextArtwork,
      goToPreviousArtwork,
      repeatArtworkNarration,
      playArtworkNarration: speakArtwork,
      stopArtworkNarration,
      continueVisit,
      completeWelcome,
      setDebugModeEnabled,
      setHomeQuickActionsVisible,
      toggleFavoriteArtwork,
      updateSettings,
      setCurrentRoomById,
      setCurrentZoneLabel,
      refreshAnalyticsSummary,
      resetVisitorExperience,
      findArtworkById,
      findRoomById,
      getArtworksForRoom,
    }),
    [
      artworks,
      allPermissionsGranted,
      currentArtwork,
      currentArtworkId,
      currentRoom,
      currentRoomId,
      currentRouteStep,
      currentZoneLabel,
      debugModeEnabled,
      favoriteArtworkIds,
      hasCompletedWelcome,
      helpFaq,
      homeQuickActionsVisible,
      isArtworkNarrationPlaying,
      isDatabaseReady,
      museumProfile,
      analyticsSummary,
      permissions,
      permissionCatalog,
      permissionsAccepted,
      route,
      routeProgress,
      routeProgressLabel,
      routeTotal,
      rooms,
      settings,
      visitedArtworkIds,
      voicePrompts,
    ],
  );

  return (
    <MuseIQContext.Provider value={value}>{children}</MuseIQContext.Provider>
  );
}

export function useMuseIQ() {
  const context = useContext(MuseIQContext);

  if (!context) {
    throw new Error("useMuseIQ must be used within MuseIQProvider");
  }

  return context;
}
