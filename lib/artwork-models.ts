import cabezaClavaGlb from "@/assets/models/cabeza_clava.glb";
import bastonMochicaGlb from "@/assets/models/catalog/baston_mochica.glb";
import batanGlb from "@/assets/models/catalog/batan.glb";
import botellaChimuGlb from "@/assets/models/catalog/botella_de_ceramica_del_estilo_chimu.glb";
import botellaEscultoricaGlb from "@/assets/models/catalog/botella_escultorica.glb";
import botellaLambayequeGlb from "@/assets/models/catalog/botella_de_ceramica_de_estilo_lambayeque.glb";
import ceramicaOrnitomorfaMocheGlb from "@/assets/models/catalog/ceramica_ornitomorfa_moche.glb";
import chavinFigEnteraGlb from "@/assets/models/catalog/chavin-fig-entera.glb";
import esculturaTalladaGlb from "@/assets/models/catalog/escultura_tallada.glb";
import estatuaGiganteDeIncaGlb from "@/assets/models/catalog/estatua_gigante_de_inca.glb";
import gateOfTheSunGlb from "@/assets/models/catalog/gate_of_the_sun_tiwanaku.glb";
import huacoRetratoMochicaGlb from "@/assets/models/catalog/huaco_retrato_mochica.glb";
import incaPhotogrammetryGlb from "@/assets/models/catalog/inca_photogrammetry.glb";
import portadaGlb from "@/assets/models/catalog/portada.glb";
import recipienteChavinGlb from "@/assets/models/catalog/recipiente_chavin.glb";
import s20v112aGlb from "@/assets/models/catalog/s20-v112a.glb";
import stirrupVesselBirdGlb from "@/assets/models/catalog/stirrup_vessel_in_form_of_a_bird.glb";
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

const artworkModelMap: Record<string, ArtworkModelDescriptor> = {
  // Sala 1
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
  "obra-1-3-L": {
    asset: bastonMochicaGlb,
    label: "baston_mochica.glb",
  },
  "obra-1-3-C": {
    asset: gateOfTheSunGlb,
    label: "gate_of_the_sun_tiwanaku.glb",
  },
  "obra-1-3-R": {
    asset: portadaGlb,
    label: "portada.glb",
  },
  "obra-1-4-L": {
    asset: recipienteChavinGlb,
    label: "recipiente_chavin.glb",
  },
  "obra-1-4-C": {
    asset: s20v112aGlb,
    label: "s20-v112a.glb",
  },
  "obra-1-4-R": {
    asset: huacoRetratoMochicaGlb,
    label: "huaco_retrato_mochica.glb",
  },

  // Sala 2
  "obra-2-1-L": {
    asset: botellaChimuGlb,
    label: "botella_de_ceramica_del_estilo_chimu.glb",
  },
  "obra-2-1-C": {
    asset: estatuaGiganteDeIncaGlb,
    label: "estatua_gigante_de_inca.glb",
  },
  "obra-2-1-R": {
    asset: esculturaTalladaGlb,
    label: "escultura_tallada.glb",
  },
  "obra-2-2-L": {
    asset: chavinFigEnteraGlb,
    label: "chavin-fig-entera.glb",
  },
  "obra-2-2-C": {
    asset: incaPhotogrammetryGlb,
    label: "inca_photogrammetry.glb",
  },
  "obra-2-2-R": {
    asset: batanGlb,
    label: "batan.glb",
  },
  "obra-2-3-L": {
    asset: botellaLambayequeGlb,
    label: "botella_de_ceramica_de_estilo_lambayeque.glb",
  },
  "obra-2-3-C": {
    asset: ceramicaOrnitomorfaMocheGlb,
    label: "ceramica_ornitomorfa_moche.glb",
  },
  "obra-2-3-R": {
    asset: stirrupVesselBirdGlb,
    label: "stirrup_vessel_in_form_of_a_bird.glb",
  },
  "obra-2-4-C": {
    asset: botellaEscultoricaGlb,
    label: "botella_escultorica.glb",
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
