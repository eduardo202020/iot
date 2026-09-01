import type { ArtworkMock } from "@/datos";
import { useMuseIQ } from "@/providers/museiq-provider";
import { router } from "expo-router";

export function useExploreScreenController() {
  const {
    artworks,
    currentArtworkId,
    currentRoom,
    getArtworksForRoom,
    museumProfile,
    rooms,
    selectArtwork,
    setCurrentRoomById,
    visitedArtworkIds,
  } = useMuseIQ();

  const contentRooms = rooms.filter((room) => getArtworksForRoom(room.id).length > 0);
  const visibleRoom =
    contentRooms.find((room) => room.id === currentRoom?.id) ?? contentRooms[0];
  const roomArtworks = visibleRoom ? getArtworksForRoom(visibleRoom.id) : [];
  const visitedInRoom = roomArtworks.filter((artwork) =>
    visitedArtworkIds.includes(artwork.id),
  ).length;
  const roomSummaries = contentRooms.map((room) => {
    const artworksInRoom = getArtworksForRoom(room.id);
    return {
      roomId: room.id,
      total: artworksInRoom.length,
      visited: artworksInRoom.filter((artwork) => visitedArtworkIds.includes(artwork.id)).length,
    };
  });

  const openArtworkDetail = (artwork: ArtworkMock) => {
    selectArtwork(artwork.id);
    router.push({
      pathname: "/artwork-detail",
      params: { artworkId: artwork.id },
    } as never);
  };

  const openArtworkChat = (artwork: ArtworkMock) => {
    selectArtwork(artwork.id);
    router.push({
      pathname: "/pregunta-voz-modal",
      params: { artworkId: artwork.id },
    } as never);
  };

  return {
    artworks,
    currentArtworkId,
    museumProfile,
    roomArtworks,
    roomSummaries,
    rooms: contentRooms,
    setCurrentRoomById,
    visibleRoom,
    visitedArtworkIds,
    visitedInRoom,
    openArtworkChat,
    openArtworkDetail,
  };
}
