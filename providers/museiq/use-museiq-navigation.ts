import type { ArtworkMock, RouteStepMock, RoomMock } from "@/datos";
import { recordAnalyticsEvent, type AnalyticsSummary } from "@/lib/museum-database";
import { router } from "expo-router";
import { Dispatch, SetStateAction } from "react";

type UseMuseIQNavigationParams = {
  artworks: ArtworkMock[];
  currentArtworkId: string;
  findArtworkById: (artworkId?: string) => ArtworkMock | undefined;
  findRoomById: (roomId?: string) => RoomMock | undefined;
  getArtworksForRoom: (roomId: string) => ArtworkMock[];
  getFreshAnalyticsSummary: () => Promise<AnalyticsSummary>;
  route: RouteStepMock[];
  setAnalyticsSummary: Dispatch<SetStateAction<AnalyticsSummary>>;
  setCurrentArtworkId: Dispatch<SetStateAction<string>>;
  setCurrentRoomId: Dispatch<SetStateAction<string>>;
  setCurrentZoneLabel: Dispatch<SetStateAction<string>>;
  setVisitedArtworkIds: Dispatch<SetStateAction<string[]>>;
  speakArtwork: (artworkId: string) => void;
};

export function useMuseIQNavigation({
  artworks,
  currentArtworkId,
  findArtworkById,
  findRoomById,
  getArtworksForRoom,
  getFreshAnalyticsSummary,
  route,
  setAnalyticsSummary,
  setCurrentArtworkId,
  setCurrentRoomId,
  setCurrentZoneLabel,
  setVisitedArtworkIds,
  speakArtwork,
}: UseMuseIQNavigationParams) {
  const markVisited = (artworkId: string) => {
    setVisitedArtworkIds((previous) => {
      const deduped = previous.filter((value) => value !== artworkId);
      return [...deduped, artworkId];
    });
  };

  const selectArtwork = (artworkId: string) => {
    if (artworkId === currentArtworkId) {
      return;
    }

    const artwork = findArtworkById(artworkId);
    if (!artwork) {
      return;
    }

    setCurrentArtworkId(artworkId);
    setCurrentRoomId(artwork.roomId);
    markVisited(artworkId);
    recordAnalyticsEvent({
      eventType: "artwork_selected",
      artworkId: artwork.id,
      roomId: artwork.roomId,
      metadata: { title: artwork.title },
    })
      .then(getFreshAnalyticsSummary)
      .then(setAnalyticsSummary)
      .catch(() => undefined);
  };

  const goToRelativeArtwork = (direction: -1 | 1) => {
    if (artworks.length === 0) {
      return;
    }

    const routeIndex = route.findIndex((step) => step.artworkId === currentArtworkId);
    const nextRouteStep = routeIndex >= 0 ? route[routeIndex + direction] : undefined;

    if (nextRouteStep) {
      selectArtwork(nextRouteStep.artworkId);
      speakArtwork(nextRouteStep.artworkId);
      return;
    }

    const currentIndex = artworks.findIndex(
      (artwork) => artwork.id === currentArtworkId,
    );
    const fallbackArtwork =
      direction === 1
        ? artworks[currentIndex + 1] ?? artworks[0]
        : artworks[currentIndex - 1] ?? artworks[artworks.length - 1];

    if (fallbackArtwork) {
      selectArtwork(fallbackArtwork.id);
      speakArtwork(fallbackArtwork.id);
    }
  };

  const goToNextArtwork = () => {
    goToRelativeArtwork(1);
  };

  const goToPreviousArtwork = () => {
    goToRelativeArtwork(-1);
  };

  const repeatArtworkNarration = () => {
    speakArtwork(currentArtworkId);
  };

  const continueVisit = (visitedArtworkIds: string[]) => {
    const lastArtworkId =
      visitedArtworkIds[visitedArtworkIds.length - 1] ?? currentArtworkId;
    selectArtwork(lastArtworkId);
    router.push("/" as never);
  };

  const setCurrentRoomById = (roomId: string) => {
    const room = findRoomById(roomId);
    if (!room) {
      return;
    }

    setCurrentRoomId(roomId);
    setCurrentZoneLabel(room.zoneLabelDefault);
    const firstArtwork = getArtworksForRoom(roomId)[0];
    if (firstArtwork) {
      setCurrentArtworkId(firstArtwork.id);
    }
  };

  return {
    continueVisit,
    goToNextArtwork,
    goToPreviousArtwork,
    repeatArtworkNarration,
    selectArtwork,
    setCurrentRoomById,
  };
}
