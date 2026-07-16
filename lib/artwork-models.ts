import cabezaClavaGlb from "@/assets/models/cabeza_clava.glb";
import mvpAribaloIncaGlb from "@/assets/models/catalog/mvp/aribalo_inca.glb";
import mvpAsientoIncaGlb from "@/assets/models/catalog/mvp/asiento_del_inca.glb";
import mvpBotellaChavinGlb from "@/assets/models/catalog/mvp/botella_chavin_204002.glb";
import mvpBotellaChimuLambayequeGlb from "@/assets/models/catalog/mvp/botella_chimu_lambayeque.glb";
import mvpMusicoMocheGlb from "@/assets/models/catalog/mvp/musico_moche.glb";
import mvpObeliscoTelloGlb from "@/assets/models/catalog/mvp/obelisco_tello.glb";

export type ArtworkModelDescriptor = {
  asset: number;
  label: string;
};

export const DEFAULT_ARTWORK_MODEL: ArtworkModelDescriptor = {
  asset: cabezaClavaGlb,
  label: "cabeza_clava.glb",
};

// The current museum MVP exposes one primary 3D model per zone in Sala 1.
const artworkModelMap: Record<string, ArtworkModelDescriptor> = {
  "obra-1-1-L": {
    asset: mvpMusicoMocheGlb,
    label: "musico_moche.glb",
  },
  "obra-1-1-C": {
    asset: mvpBotellaChimuLambayequeGlb,
    label: "botella_chimu_lambayeque.glb",
  },
  "obra-1-1-R": {
    asset: mvpAribaloIncaGlb,
    label: "aribalo_inca.glb",
  },
  "obra-1-2-L": {
    asset: mvpAsientoIncaGlb,
    label: "mvp_asiento_del_inca.glb",
  },
  "obra-1-2-C": {
    asset: mvpBotellaChavinGlb,
    label: "botella_chavin_204002.glb",
  },
  "obra-1-2-R": {
    asset: mvpObeliscoTelloGlb,
    label: "obelisco_tello.glb",
  },
};

export const ARTWORK_MODEL_IDS = Object.keys(artworkModelMap);

export function getArtworkModelAssetForArtwork(artworkId?: string): ArtworkModelDescriptor {
  if (!artworkId) {
    return DEFAULT_ARTWORK_MODEL;
  }

  return artworkModelMap[artworkId] ?? DEFAULT_ARTWORK_MODEL;
}

export function hasArtworkModelAsset(artworkId?: string) {
  return Boolean(artworkId && artworkModelMap[artworkId]);
}
