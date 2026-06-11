import type {
  ArtworkMock,
  FAQItem,
  MuseumInfo,
  RouteStepMock,
  RoomMock,
} from "@/datos";
import type { AnalyticsSummary } from "@/lib/museum-database";

export type PermissionKey =
  | "bluetooth"
  | "physicalActivity"
  | "location"
  | "microphone";

export interface SettingsState {
  voiceRate: number;
  autoPlay: boolean;
  subtitles: boolean;
  highContrast: boolean;
  vibrations: boolean;
  visualConfirmations: boolean;
}

export type PermissionCatalog = Record<
  PermissionKey,
  { title: string; description: string }
>;

export interface MuseIQContextValue {
  isDatabaseReady: boolean;
  museumProfile: MuseumInfo | null;
  rooms: RoomMock[];
  artworks: ArtworkMock[];
  route: RouteStepMock[];
  helpFaq: FAQItem[];
  voicePrompts: string[];
  permissionCatalog: PermissionCatalog;
  currentArtworkId: string;
  currentRoomId: string;
  currentZoneLabel: string;
  currentRouteStep: RouteStepMock | undefined;
  routeProgress: number;
  routeTotal: number;
  routeProgressLabel: string;
  hasCompletedWelcome: boolean;
  debugModeEnabled: boolean;
  homeQuickActionsVisible: boolean;
  permissionsAccepted: boolean;
  permissions: Record<
    PermissionKey,
    "pending" | "granted" | "denied" | "blocked"
  >;
  settings: SettingsState;
  visitedArtworkIds: string[];
  favoriteArtworkIds: string[];
  currentArtwork: ArtworkMock | undefined;
  currentRoom: RoomMock | undefined;
  isArtworkNarrationPlaying: boolean;
  analyticsSummary: AnalyticsSummary;
  allPermissionsGranted: boolean;
  requestAllPermissions: () => Promise<boolean>;
  declinePermissions: () => void;
  selectArtwork: (artworkId: string) => void;
  goToNextArtwork: () => void;
  goToPreviousArtwork: () => void;
  repeatArtworkNarration: () => void;
  continueVisit: () => void;
  completeWelcome: () => void;
  setDebugModeEnabled: (enabled: boolean) => void;
  setHomeQuickActionsVisible: (visible: boolean) => void;
  toggleFavoriteArtwork: (artworkId: string) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  setCurrentRoomById: (roomId: string) => void;
  setCurrentZoneLabel: (label: string) => void;
  refreshAnalyticsSummary: () => Promise<void>;
  resetVisitorExperience: () => Promise<void>;
  findArtworkById: (artworkId?: string) => ArtworkMock | undefined;
  findRoomById: (roomId?: string) => RoomMock | undefined;
  getArtworksForRoom: (roomId: string) => ArtworkMock[];
}
