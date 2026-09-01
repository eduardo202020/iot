import cabezaClavaGlb from "@/assets/models/cabeza_clava.glb";
import mvpAribaloIncaGlb from "@/assets/models/catalog/mvp/aribalo_inca.glb";
import mvpAsientoIncaGlb from "@/assets/models/catalog/mvp/asiento_del_inca.glb";
import mvpBotellaChavinGlb from "@/assets/models/catalog/mvp/botella_chavin_204002.glb";
import mvpBotellaChimuGlb from "@/assets/models/catalog/mvp/botella_chimu_lambayeque.glb";
import mvpMusicoMocheGlb from "@/assets/models/catalog/mvp/musico_moche.glb";
import mvpObeliscoTelloGlb from "@/assets/models/catalog/mvp/obelisco_tello.glb";
import bustoJoseSanMartinGlb from "@/assets/models/catalog/uni-mvp/busto_jose_san_martin.glb";
import bustoMiguelGrauGlb from "@/assets/models/catalog/uni-mvp/busto_miguel_grau.glb";
import escritorioHistoricoGlb from "@/assets/models/catalog/uni-mvp/escritorio_historico_uni.glb";
import maquinaEscribirGlb from "@/assets/models/catalog/uni-mvp/maquina_de_escribir_underwood.glb";
import azuritaGlb from "@/assets/models/catalog/uni-mvp/minerals/azurita.glb";
import bornitaGlb from "@/assets/models/catalog/uni-mvp/minerals/bornita.glb";
import esfaleritaGlb from "@/assets/models/catalog/uni-mvp/minerals/esfalerita.glb";
import galenaGlb from "@/assets/models/catalog/uni-mvp/minerals/galena.glb";
import magnetitaGlb from "@/assets/models/catalog/uni-mvp/minerals/magnetita.glb";
import malaquitaGlb from "@/assets/models/catalog/uni-mvp/minerals/malaquita.glb";
import oroGlb from "@/assets/models/catalog/uni-mvp/minerals/oro.glb";
import piritaGlb from "@/assets/models/catalog/uni-mvp/minerals/pirita.glb";
import plataGlb from "@/assets/models/catalog/uni-mvp/minerals/plata.glb";
import wolframitaGlb from "@/assets/models/catalog/uni-mvp/minerals/wolframita.glb";

export type ArtworkModelDescriptor = {
  asset: number;
  label: string;
};

export const DEFAULT_ARTWORK_MODEL: ArtworkModelDescriptor = {
  asset: cabezaClavaGlb,
  label: "cabeza_clava.glb",
};

// The MVP exposes one primary 3D model for every catalog item in its three rooms.
const artworkModelMap: Record<string, ArtworkModelDescriptor> = {
  "obra-1-1-L": {
    asset: escritorioHistoricoGlb,
    label: "escritorio_historico_uni.glb",
  },
  "obra-1-1-C": {
    asset: maquinaEscribirGlb,
    label: "maquina_de_escribir_underwood.glb",
  },
  "obra-1-1-R": {
    asset: bustoMiguelGrauGlb,
    label: "busto_miguel_grau.glb",
  },
  "obra-1-2-L": {
    asset: bustoJoseSanMartinGlb,
    label: "busto_jose_san_martin.glb",
  },
  "obra-1-2-C": {
    asset: malaquitaGlb,
    label: "malaquita.glb",
  },
  "obra-1-2-R": {
    asset: mvpAribaloIncaGlb,
    label: "aribalo_inca.glb",
  },
  "mineral-bornita": { asset: bornitaGlb, label: "bornita.glb" },
  "mineral-esfalerita": { asset: esfaleritaGlb, label: "esfalerita.glb" },
  "mineral-magnetita": { asset: magnetitaGlb, label: "magnetita.glb" },
  "mineral-wolframita": { asset: wolframitaGlb, label: "wolframita.glb" },
  "mineral-azurita": { asset: azuritaGlb, label: "azurita.glb" },
  "mineral-galena": { asset: galenaGlb, label: "galena.glb" },
  "mineral-oro": { asset: oroGlb, label: "oro.glb" },
  "mineral-pirita": { asset: piritaGlb, label: "pirita.glb" },
  "mineral-plata": { asset: plataGlb, label: "plata.glb" },
  "cultura-musico-moche": { asset: mvpMusicoMocheGlb, label: "musico_moche.glb" },
  "cultura-botella-chimu": { asset: mvpBotellaChimuGlb, label: "botella_chimu_lambayeque.glb" },
  "cultura-asiento-inca": { asset: mvpAsientoIncaGlb, label: "mvp_asiento_del_inca.glb" },
  "cultura-botella-chavin": { asset: mvpBotellaChavinGlb, label: "botella_chavin_204002.glb" },
  "cultura-obelisco-tello": { asset: mvpObeliscoTelloGlb, label: "obelisco_tello.glb" },
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
