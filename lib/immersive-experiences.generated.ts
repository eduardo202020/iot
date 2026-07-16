// Archivo generado por muse3d.py. No editar a mano.
import lugarGlb from "@/assets/models/immersive/lugar.glb";
import puertaMonumentalIncaGlb from "@/assets/models/immersive/puerta_monumental_inca.glb";
import ushnu2MobileGlb from "@/assets/models/immersive/ushnu-2-mobile.glb";
import ushnuGlb from "@/assets/models/immersive/ushnu.glb";
import type { RoomImmersiveExperience } from "@/lib/immersive-experience-types";
import { lugarWalkingTour, puertaMonumentalIncaWalkingTour, ushnu2WalkingTour, ushnuWalkingTour } from "@/lib/immersive-tours";

export const immersiveRoomExperiences: RoomImmersiveExperience[] = [
  {
    id: "immersive-puerta-monumental-inca",
    roomId: "SALA_VR",
    title: "Puerta Monumental Inca",
    promptTitle: "Modo inmersivo disponible",
    description: "Recorrido inmersivo por una reconstruccion 3D preparada para headset.",
    ctaLabel: "Entrar al modo inmersivo",
    modelAsset: puertaMonumentalIncaGlb,
    modelLabel: "puerta_monumental_inca.glb",
    tour: puertaMonumentalIncaWalkingTour,
  },
  {
    id: "immersive-sala-1",
    roomId: "SALA_VR",
    title: "Sala inmersiva andina",
    promptTitle: "Modo inmersivo disponible",
    description: "Esta sala ofrece una reconstruccion 3D para recorrer el espacio desde dentro antes de continuar con la visita normal.",
    ctaLabel: "Entrar al modo inmersivo",
    modelAsset: lugarGlb,
    modelLabel: "lugar.glb",
    tour: lugarWalkingTour,
  },
  {
    id: "immersive-ushnu",
    roomId: "SALA_VR",
    title: "Ushnu",
    promptTitle: "Modo inmersivo disponible",
    description: "Recorrido inmersivo por una reconstruccion 3D preparada para headset.",
    ctaLabel: "Entrar al modo inmersivo",
    modelAsset: ushnuGlb,
    modelLabel: "ushnu.glb",
    tour: ushnuWalkingTour,
  },
  {
    id: "immersive-ushnu-2",
    roomId: "SALA_VR",
    title: "Ushnu 2",
    promptTitle: "Modo inmersivo disponible",
    description: "Recorrido inmersivo por una reconstruccion 3D preparada para headset.",
    ctaLabel: "Entrar al modo inmersivo",
    modelAsset: ushnu2MobileGlb,
    modelLabel: "ushnu-2-mobile.glb",
    tour: ushnu2WalkingTour,
  },
];
