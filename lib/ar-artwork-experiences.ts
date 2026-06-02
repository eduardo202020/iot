import {
  getArtworkModelAssetForArtwork,
  type ArtworkModelDescriptor,
} from "@/lib/artwork-models";
import bastonMochicaArGlb from "@/assets/models/catalog/ar/baston_mochica_ar.glb";
import batanArGlb from "@/assets/models/catalog/ar/batan_ar.glb";
import botellaEscultoricaArGlb from "@/assets/models/catalog/ar/botella_escultorica_ar.glb";
import chavinFigEnteraArGlb from "@/assets/models/catalog/ar/chavin-fig-entera_ar.glb";
import esculturaTalladaArGlb from "@/assets/models/catalog/ar/escultura_tallada_ar.glb";
import recipienteChavinArGlb from "@/assets/models/catalog/ar/recipiente_chavin_ar.glb";
import replicaObeliscoTelloArGlb from "@/assets/models/catalog/ar/replica_del_obelisco_tello_ar.glb";

export type ArArtworkExperience = ArtworkModelDescriptor & {
  modelYOffset: number;
  rotation: [number, number, number];
  scale: [number, number, number];
};

const DEFAULT_AR_SCALE: [number, number, number] = [0.28, 0.28, 0.28];

function uniformScale(value: number): [number, number, number] {
  return [value, value, value];
}

const arModelAssetOverrides: Record<string, ArtworkModelDescriptor> = {
  "baston_mochica.glb": {
    asset: bastonMochicaArGlb,
    label: "baston_mochica_ar.glb",
  },
  "batan.glb": {
    asset: batanArGlb,
    label: "batan_ar.glb",
  },
  "botella_escultorica.glb": {
    asset: botellaEscultoricaArGlb,
    label: "botella_escultorica_ar.glb",
  },
  "chavin-fig-entera.glb": {
    asset: chavinFigEnteraArGlb,
    label: "chavin-fig-entera_ar.glb",
  },
  "escultura_tallada.glb": {
    asset: esculturaTalladaArGlb,
    label: "escultura_tallada_ar.glb",
  },
  "recipiente_chavin.glb": {
    asset: recipienteChavinArGlb,
    label: "recipiente_chavin_ar.glb",
  },
  "replica_del_obelisco_tello.glb": {
    asset: replicaObeliscoTelloArGlb,
    label: "replica_del_obelisco_tello_ar.glb",
  },
};

const arModelTuning: Record<
  string,
  Partial<Pick<ArArtworkExperience, "modelYOffset" | "rotation" | "scale">>
> = {
  "aribalo.glb": {
    scale: uniformScale(0.3),
  },
  "aro_mochica.glb": {
    scale: uniformScale(0.0065),
  },
  "asiento_del_inca.glb": {
    scale: uniformScale(0.004),
  },
  "baston_mochica_ar.glb": {
    scale: uniformScale(0.00046),
  },
  "batan_ar.glb": {
    scale: uniformScale(0.28),
  },
  "botella_de_ceramica_de_estilo_lambayeque.glb": {
    scale: uniformScale(0.12),
  },
  "botella_de_ceramica_del_estilo_chimu.glb": {
    scale: uniformScale(0.11),
  },
  "botella_escultorica_ar.glb": {
    scale: uniformScale(0.14),
  },
  "buho-artesania.glb": {
    scale: uniformScale(0.075),
  },
  "cabeza_clava-2.glb": {
    modelYOffset: 0.02,
    scale: uniformScale(0.012),
  },
  "cabeza_clava.glb": {
    modelYOffset: 0.02,
    scale: uniformScale(0.012),
  },
  "ceramica_ornitomorfa_moche.glb": {
    scale: uniformScale(0.088),
  },
  "chavin-fig-entera_ar.glb": {
    scale: uniformScale(0.0065),
  },
  "escultura_tallada_ar.glb": {
    scale: uniformScale(0.14),
  },
  "gate_of_the_sun_tiwanaku.glb": {
    scale: uniformScale(0.06),
  },
  "huaco_retrato_mochica.glb": {
    scale: uniformScale(0.07),
  },
  "inca_photogrammetry.glb": {
    scale: uniformScale(1.85),
  },
  "portada.glb": {
    scale: uniformScale(0.00155),
  },
  "recipiente_chavin_ar.glb": {
    scale: uniformScale(0.19),
  },
  "replica_del_obelisco_tello_ar.glb": {
    scale: uniformScale(0.11),
  },
  "s20-v112a.glb": {
    scale: uniformScale(0.22),
  },
  "estatua_gigante_de_inca.glb": {
    scale: uniformScale(0.12),
  },
  "stirrup_vessel_in_form_of_a_bird.glb": {
    scale: uniformScale(4.1),
  },
};

export function getArArtworkExperience(artworkId?: string): ArArtworkExperience {
  const baseModel = getArtworkModelAssetForArtwork(artworkId);
  const model = arModelAssetOverrides[baseModel.label] ?? baseModel;
  const tuning = arModelTuning[model.label] ?? arModelTuning[baseModel.label] ?? {};

  return {
    ...model,
    modelYOffset: tuning.modelYOffset ?? 0.04,
    rotation: tuning.rotation ?? [0, 0, 0],
    scale: tuning.scale ?? DEFAULT_AR_SCALE,
  };
}
