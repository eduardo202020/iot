// Archivo generado por muse3d.py. No editar a mano.
import lugarGlb from "@/assets/models/immersive/lugar.glb";
import type { RoomImmersiveExperience } from "@/lib/immersive-experience-types";
import { lugarWalkingTour } from "@/lib/immersive-tours";

export const immersiveRoomExperiences: RoomImmersiveExperience[] = [
  {
    id: "immersive-sala-1",
    roomId: "SALA_1",
    title: "Sala inmersiva Sipan",
    promptTitle: "Modo inmersivo disponible",
    description: "Esta sala ofrece una reconstruccion 3D para recorrer el espacio desde dentro antes de continuar con la visita normal.",
    ctaLabel: "Entrar al modo inmersivo",
    modelAsset: lugarGlb,
    modelLabel: "lugar.glb",
    tour: lugarWalkingTour,
  },
];
