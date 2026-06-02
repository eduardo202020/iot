import type { ArtworkTabKey } from "@/components/museiq/artwork/artwork-tabs";
import { getCultureLabel } from "@/features/artwork/utils/get-culture-label";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { router } from "expo-router";
import { useEffect, useState } from "react";

type UseArtworkScreenControllerParams = {
  artworkId?: string;
  tab?: ArtworkTabKey;
};

export function useArtworkScreenController({
  artworkId,
  tab,
}: UseArtworkScreenControllerParams) {
  const {
    currentArtwork,
    currentRoom,
    findArtworkById,
    findRoomById,
    museumProfile,
    selectArtwork,
  } = useMuseIQ();
  const [activeTab, setActiveTab] = useState<ArtworkTabKey>("details");
  const artwork = findArtworkById(artworkId) ?? currentArtwork;
  const room = findRoomById(artwork?.roomId) ?? currentRoom;

  useEffect(() => {
    if (tab === "details") {
      setActiveTab(tab);
    }
  }, [tab]);

  const imageSource = getArtworkImageSource(artwork?.image);
  const roomName = room?.name ?? "Sala por confirmar";
  const cultureLabel = artwork
    ? getCultureLabel(artwork.period, artwork.author)
    : "Cultura por confirmar";
  const museumName = museumProfile?.name ?? "MuseIQ";

  const openAr = () => {
    if (!artwork) {
      return;
    }

    selectArtwork(artwork.id);
    router.push({
      pathname: "/ar-viro-activo",
      params: { artworkId: artwork.id },
    } as never);
  };

  const openQuestion = () => {
    if (!artwork) {
      return;
    }

    selectArtwork(artwork.id);
    router.push({
      pathname: "/pregunta-voz-modal",
      params: { artworkId: artwork.id },
    } as never);
  };

  const openImages = () => {
    if (!artwork) {
      return;
    }

    router.push({
      pathname: "/artwork-images",
      params: { artworkId: artwork.id },
    } as never);
  };

  const handleDetailTabSelect = (nextTab: ArtworkTabKey) => {
    if (nextTab === "images") {
      openImages();
      return;
    }

    setActiveTab(nextTab);
  };

  const handleImagesTabSelect = (nextTab: ArtworkTabKey) => {
    if (!artwork || nextTab === "images") {
      return;
    }

    router.replace({
      pathname: "/artwork-detail",
      params: { artworkId: artwork.id, tab: nextTab },
    } as never);
  };

  return {
    activeTab,
    artwork,
    cultureLabel,
    imageSource,
    museumName,
    roomName,
    openAr,
    openImages,
    openQuestion,
    handleDetailTabSelect,
    handleImagesTabSelect,
  };
}
