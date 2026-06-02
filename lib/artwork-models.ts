import cabezaClavaGlb from "@/assets/models/cabeza_clava.glb";
import cabezaClavaLiteGlb from "@/assets/models/cabeza_clava-2.glb";
import aribaloGlb from "@/assets/models/catalog/aribalo.glb";
import aroMochicaGlb from "@/assets/models/catalog/aro_mochica.glb";
import asientoDelIncaGlb from "@/assets/models/catalog/asiento_del_inca.glb";
import bastonMochicaGlb from "@/assets/models/catalog/baston_mochica.glb";
import batanGlb from "@/assets/models/catalog/batan.glb";
import botellaChimuGlb from "@/assets/models/catalog/botella_de_ceramica_del_estilo_chimu.glb";
import botellaEscultoricaGlb from "@/assets/models/catalog/botella_escultorica.glb";
import botellaLambayequeGlb from "@/assets/models/catalog/botella_de_ceramica_de_estilo_lambayeque.glb";
import buhoArtesaniaGlb from "@/assets/models/catalog/buho-artesania.glb";
import ceramicaOrnitomorfaMocheGlb from "@/assets/models/catalog/ceramica_ornitomorfa_moche.glb";
import chavinFigEnteraGlb from "@/assets/models/catalog/chavin-fig-entera.glb";
import esculturaTalladaGlb from "@/assets/models/catalog/escultura_tallada.glb";
import estatuaGiganteDeIncaGlb from "@/assets/models/catalog/estatua_gigante_de_inca.glb";
import gateOfTheSunGlb from "@/assets/models/catalog/gate_of_the_sun_tiwanaku.glb";
import huacoRetratoMochicaGlb from "@/assets/models/catalog/huaco_retrato_mochica.glb";
import incaPhotogrammetryGlb from "@/assets/models/catalog/inca_photogrammetry.glb";
import portadaGlb from "@/assets/models/catalog/portada.glb";
import recipienteChavinGlb from "@/assets/models/catalog/recipiente_chavin.glb";
import replicaObeliscoTelloGlb from "@/assets/models/catalog/replica_del_obelisco_tello.glb";
import s20v112aGlb from "@/assets/models/catalog/s20-v112a.glb";
import stirrupVesselBirdGlb from "@/assets/models/catalog/stirrup_vessel_in_form_of_a_bird.glb";

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
    asset: replicaObeliscoTelloGlb,
    label: "replica_del_obelisco_tello.glb",
  },
  "obra-1-1-C": {
    asset: cabezaClavaLiteGlb,
    label: "cabeza_clava-2.glb",
  },
  "obra-1-1-R": {
    asset: aroMochicaGlb,
    label: "aro_mochica.glb",
  },
  "obra-1-2-L": {
    asset: buhoArtesaniaGlb,
    label: "buho-artesania.glb",
  },
  "obra-1-2-C": {
    asset: asientoDelIncaGlb,
    label: "asiento_del_inca.glb",
  },
  "obra-1-2-R": {
    asset: aribaloGlb,
    label: "aribalo.glb",
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
