import { defaultPermissionStatuses } from "@/datos";
import {
  getAnalyticsSummary,
  getMuseumSnapshot,
  getVisitorPreference,
  resetVisitorSessionData,
  type AnalyticsSummary,
} from "@/lib/museum-database";
import { defaultSettings } from "@/providers/museiq/constants";
import {
  getInitialMuseumSelection,
  parseFavoriteArtworkIds,
} from "@/providers/museiq/helpers";
import type { PermissionCatalog, SettingsState } from "@/providers/museiq/types";
import { Dispatch, SetStateAction, useEffect } from "react";

type Snapshot = Awaited<ReturnType<typeof getMuseumSnapshot>>;

type UseMuseIQBootstrapParams = {
  setAnalyticsSummary: Dispatch<SetStateAction<AnalyticsSummary>>;
  setArtworks: Dispatch<SetStateAction<Snapshot["artworks"]>>;
  setCurrentArtworkId: Dispatch<SetStateAction<string>>;
  setCurrentRoomId: Dispatch<SetStateAction<string>>;
  setCurrentZoneLabel: Dispatch<SetStateAction<string>>;
  setDebugModeEnabledState: Dispatch<SetStateAction<boolean>>;
  setFavoriteArtworkIds: Dispatch<SetStateAction<string[]>>;
  setHomeQuickActionsVisible: Dispatch<SetStateAction<boolean>>;
  setHasCompletedWelcome: Dispatch<SetStateAction<boolean>>;
  setHelpFaq: Dispatch<SetStateAction<Snapshot["helpFaq"]>>;
  setIsDatabaseReady: Dispatch<SetStateAction<boolean>>;
  setMuseumProfile: Dispatch<SetStateAction<Snapshot["museumProfile"]>>;
  setPermissionCatalog: Dispatch<SetStateAction<PermissionCatalog>>;
  setPermissions: Dispatch<SetStateAction<typeof defaultPermissionStatuses>>;
  setPermissionsAccepted: Dispatch<SetStateAction<boolean>>;
  setRooms: Dispatch<SetStateAction<Snapshot["rooms"]>>;
  setRoute: Dispatch<SetStateAction<Snapshot["route"]>>;
  setSettings: Dispatch<SetStateAction<SettingsState>>;
  setVoicePrompts: Dispatch<SetStateAction<string[]>>;
  setVisitedArtworkIds: Dispatch<SetStateAction<string[]>>;
  stopArtworkNarration: () => Promise<void>;
};

export function useMuseIQBootstrap({
  setAnalyticsSummary,
  setArtworks,
  setCurrentArtworkId,
  setCurrentRoomId,
  setCurrentZoneLabel,
  setDebugModeEnabledState,
  setFavoriteArtworkIds,
  setHomeQuickActionsVisible,
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
}: UseMuseIQBootstrapParams) {
  useEffect(() => {
    let isMounted = true;

    const loadMuseum = async () => {
      const snapshot = await getMuseumSnapshot();
      if (!isMounted) {
        return;
      }

      setMuseumProfile(snapshot.museumProfile);
      setRooms(snapshot.rooms);
      setArtworks(snapshot.artworks);
      setRoute(snapshot.route);
      setHelpFaq(snapshot.helpFaq);
      setVoicePrompts(snapshot.voicePrompts);
      setPermissionCatalog(snapshot.permissionCatalog);

      const [
        welcomePreference,
        debugPreference,
        quickActionsPreference,
        favoritePreference,
      ] = await Promise.all([
        getVisitorPreference("welcome_completed"),
        getVisitorPreference("debug_mode_enabled"),
        getVisitorPreference("home_quick_actions_visible"),
        getVisitorPreference("favorite_artwork_ids"),
      ]);
      setHasCompletedWelcome(welcomePreference === "true");
      setDebugModeEnabledState(debugPreference === "true");
      setHomeQuickActionsVisible(quickActionsPreference !== "false");
      setFavoriteArtworkIds(parseFavoriteArtworkIds(favoritePreference));

      const { initialArtwork, initialRoom } = getInitialMuseumSelection({
        artworks: snapshot.artworks,
        route: snapshot.route,
        rooms: snapshot.rooms,
      });

      if (initialArtwork) {
        setCurrentArtworkId(initialArtwork.id);
        setVisitedArtworkIds([initialArtwork.id]);
      }

      if (initialRoom) {
        setCurrentRoomId(initialRoom.id);
        setCurrentZoneLabel(initialRoom.zoneLabelDefault);
      }

      const analytics = await getAnalyticsSummary();
      if (isMounted) {
        setAnalyticsSummary(analytics);
      }

      setIsDatabaseReady(true);
    };

    loadMuseum().catch((error) => {
      console.error("Error loading museum from SQLite:", error);
    });

    return () => {
      isMounted = false;
    };
  }, [
    setAnalyticsSummary,
    setArtworks,
    setCurrentArtworkId,
    setCurrentRoomId,
    setCurrentZoneLabel,
    setDebugModeEnabledState,
    setFavoriteArtworkIds,
    setHomeQuickActionsVisible,
    setHasCompletedWelcome,
    setHelpFaq,
    setIsDatabaseReady,
    setMuseumProfile,
    setPermissionCatalog,
    setRooms,
    setRoute,
    setVoicePrompts,
    setVisitedArtworkIds,
  ]);

  const resetVisitorExperience = async () => {
    await stopArtworkNarration();
    await resetVisitorSessionData();

    const snapshot = await getMuseumSnapshot();
    const { initialArtwork, initialRoom } = getInitialMuseumSelection({
      artworks: snapshot.artworks,
      route: snapshot.route,
      rooms: snapshot.rooms,
    });

    setHasCompletedWelcome(false);
    setDebugModeEnabledState(false);
    setHomeQuickActionsVisible(true);
    setPermissionsAccepted(false);
    setPermissions(defaultPermissionStatuses);
    setSettings(defaultSettings);
    setFavoriteArtworkIds([]);
    setVisitedArtworkIds(initialArtwork ? [initialArtwork.id] : []);
    setCurrentArtworkId(initialArtwork?.id ?? "");
    setCurrentRoomId(initialRoom?.id ?? "");
    setCurrentZoneLabel(initialRoom?.zoneLabelDefault ?? "cerca de la entrada");
    setAnalyticsSummary(await getAnalyticsSummary());
  };

  return {
    resetVisitorExperience,
  };
}
