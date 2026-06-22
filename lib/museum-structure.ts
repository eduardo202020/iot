import {
  MVP_IMMERSIVE_ROOM_ID,
  MVP_NORMAL_ROOM_ID,
  type ArtworkMock,
} from "@/datos";
import type { BeaconData } from "@/types/beacon";

export type MuseumRoomKind = "normal" | "immersive";

export type NormalRoomZone = {
  artworkId: string;
  beaconNode: number;
  label: string;
  qrCodes: [string, string];
  roomId: typeof MVP_NORMAL_ROOM_ID;
  zoneId: string;
};

export type ArtworkArResource = {
  id: string;
  modelArtworkId: string;
  parentArtworkId: string;
  qrCode: string;
  relationLabel: string;
  subtitle: string;
  title: string;
};

export const MVP_NORMAL_ROOM_ZONES: NormalRoomZone[] = [
  {
    artworkId: "obra-1-1-L",
    beaconNode: 1,
    label: "Zona 1 - Obra 1",
    qrCodes: ["SALA_1-01-A", "SALA_1-01-B"],
    roomId: MVP_NORMAL_ROOM_ID,
    zoneId: "Z1",
  },
  {
    artworkId: "obra-1-1-C",
    beaconNode: 2,
    label: "Zona 2 - Obra 2",
    qrCodes: ["SALA_1-02-A", "SALA_1-02-B"],
    roomId: MVP_NORMAL_ROOM_ID,
    zoneId: "Z2",
  },
  {
    artworkId: "obra-1-1-R",
    beaconNode: 3,
    label: "Zona 3 - Obra 3",
    qrCodes: ["SALA_1-03-A", "SALA_1-03-B"],
    roomId: MVP_NORMAL_ROOM_ID,
    zoneId: "Z3",
  },
  {
    artworkId: "obra-1-2-L",
    beaconNode: 4,
    label: "Zona 4 - Obra 4",
    qrCodes: ["SALA_1-04-A", "SALA_1-04-B"],
    roomId: MVP_NORMAL_ROOM_ID,
    zoneId: "Z4",
  },
  {
    artworkId: "obra-1-2-C",
    beaconNode: 5,
    label: "Zona 5 - Obra 5",
    qrCodes: ["SALA_1-05-A", "SALA_1-05-B"],
    roomId: MVP_NORMAL_ROOM_ID,
    zoneId: "Z5",
  },
  {
    artworkId: "obra-1-2-R",
    beaconNode: 6,
    label: "Zona 6 - Obra 6",
    qrCodes: ["SALA_1-06-A", "SALA_1-06-B"],
    roomId: MVP_NORMAL_ROOM_ID,
    zoneId: "Z6",
  },
];

export const MVP_ARTWORK_AR_RESOURCES: ArtworkArResource[] = [
  {
    id: "sala-1-obra-1-modelo",
    modelArtworkId: "obra-1-1-L",
    parentArtworkId: "obra-1-1-L",
    qrCode: "SALA_1-01-A",
    relationLabel: "QR A",
    subtitle: "Explora en 3D la postura, la vestimenta y el instrumento del personaje.",
    title: "Musico Moche en 3D",
  },
  {
    id: "sala-1-obra-1-comparacion",
    modelArtworkId: "obra-1-1-C",
    parentArtworkId: "obra-1-1-L",
    qrCode: "SALA_1-01-B",
    relationLabel: "QR B",
    subtitle: "Compara dos tradiciones ceramicas de la costa norte.",
    title: "Botella Chimu-Lambayeque",
  },
  {
    id: "sala-1-obra-2-modelo",
    modelArtworkId: "obra-1-1-C",
    parentArtworkId: "obra-1-1-C",
    qrCode: "SALA_1-02-A",
    relationLabel: "QR A",
    subtitle: "Observa la figura animal, el asa y el acabado de la botella.",
    title: "Botella Chimu-Lambayeque en 3D",
  },
  {
    id: "sala-1-obra-2-comparacion",
    modelArtworkId: "obra-1-1-L",
    parentArtworkId: "obra-1-1-C",
    qrCode: "SALA_1-02-B",
    relationLabel: "QR B",
    subtitle: "Regresa al personaje Moche para comparar modelado y funcion.",
    title: "Musico Moche",
  },
  {
    id: "sala-1-obra-3-modelo",
    modelArtworkId: "obra-1-1-R",
    parentArtworkId: "obra-1-1-R",
    qrCode: "SALA_1-03-A",
    relationLabel: "QR A",
    subtitle: "Explora la forma, las asas laterales y la base conica.",
    title: "Aribalo inca en 3D",
  },
  {
    id: "sala-1-obra-3-comparacion",
    modelArtworkId: "obra-1-2-L",
    parentArtworkId: "obra-1-1-R",
    qrCode: "SALA_1-03-B",
    relationLabel: "QR B",
    subtitle: "Compara un recipiente movil con una estructura ceremonial de piedra.",
    title: "Asiento del Inca",
  },
  {
    id: "sala-1-obra-4-modelo",
    modelArtworkId: "obra-1-2-L",
    parentArtworkId: "obra-1-2-L",
    qrCode: "SALA_1-04-A",
    relationLabel: "QR A",
    subtitle: "Recorre la superficie tallada y la relacion del asiento con su base.",
    title: "Asiento del Inca en 3D",
  },
  {
    id: "sala-1-obra-4-comparacion",
    modelArtworkId: "obra-1-1-R",
    parentArtworkId: "obra-1-2-L",
    qrCode: "SALA_1-04-B",
    relationLabel: "QR B",
    subtitle: "Relaciona autoridad, espacio ceremonial y cultura material inca.",
    title: "Aribalo inca",
  },
  {
    id: "sala-1-obra-5-modelo",
    modelArtworkId: "obra-1-2-C",
    parentArtworkId: "obra-1-2-C",
    qrCode: "SALA_1-05-A",
    relationLabel: "QR A",
    subtitle: "Examina los felinos estilizados del asa, el gollete y el cuerpo.",
    title: "Botella Chavin 204002 en 3D",
  },
  {
    id: "sala-1-obra-5-comparacion",
    modelArtworkId: "obra-1-2-R",
    parentArtworkId: "obra-1-2-C",
    qrCode: "SALA_1-05-B",
    relationLabel: "QR B",
    subtitle: "Compara la iconografia ceramica con una composicion litica monumental.",
    title: "Obelisco Tello",
  },
  {
    id: "sala-1-obra-6-modelo",
    modelArtworkId: "obra-1-2-R",
    parentArtworkId: "obra-1-2-R",
    qrCode: "SALA_1-06-A",
    relationLabel: "QR A",
    subtitle: "Gira el monolito para recorrer su composicion en las cuatro caras.",
    title: "Obelisco Tello en 3D",
  },
  {
    id: "sala-1-obra-6-comparacion",
    modelArtworkId: "obra-1-2-C",
    parentArtworkId: "obra-1-2-R",
    qrCode: "SALA_1-06-B",
    relationLabel: "QR B",
    subtitle: "Relaciona los felinos estilizados de la botella con el lenguaje visual del monolito.",
    title: "Botella Chavin 204002",
  },
];

function compactCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function normalizeMuseumCode(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmed);
    const queryValue =
      parsedUrl.searchParams.get("resource") ??
      parsedUrl.searchParams.get("qr") ??
      parsedUrl.searchParams.get("codigo") ??
      parsedUrl.searchParams.get("code") ??
      parsedUrl.searchParams.get("obra") ??
      parsedUrl.searchParams.get("artwork") ??
      parsedUrl.searchParams.get("artworkId");

    if (queryValue) {
      return queryValue.trim();
    }

    const pathCandidate = parsedUrl.pathname.split("/").filter(Boolean).pop();
    if (pathCandidate) {
      return decodeURIComponent(pathCandidate).trim();
    }
  } catch {
    // Plain QR payloads are expected during the MVP.
  }

  return trimmed;
}

export function normalizeMuseumCodeForMatch(input: string) {
  return compactCode(normalizeMuseumCode(input));
}

export function isImmersiveRoomId(roomId?: string | null) {
  return roomId === MVP_IMMERSIVE_ROOM_ID;
}

export function getNormalRoomZoneByBeacon(beacon?: BeaconData | null) {
  if (!beacon || beacon.roomId !== MVP_NORMAL_ROOM_ID) {
    return undefined;
  }

  if (beacon.artworkId) {
    const artworkZone = MVP_NORMAL_ROOM_ZONES.find(
      (zone) => zone.artworkId === beacon.artworkId,
    );
    if (artworkZone) {
      return artworkZone;
    }
  }

  if (beacon.zoneId) {
    const zoneById = MVP_NORMAL_ROOM_ZONES.find(
      (zone) => normalizeMuseumCodeForMatch(zone.zoneId) === normalizeMuseumCodeForMatch(beacon.zoneId ?? ""),
    );
    if (zoneById) {
      return zoneById;
    }
  }

  return MVP_NORMAL_ROOM_ZONES.find((zone) => zone.beaconNode === beacon.beaconNode);
}

export function getArResourcesForArtwork(artworkId?: string | null) {
  if (!artworkId) {
    return [];
  }

  return MVP_ARTWORK_AR_RESOURCES.filter(
    (resource) => resource.parentArtworkId === artworkId,
  );
}

export function getArResourceById(resourceId?: string | null) {
  if (!resourceId) {
    return undefined;
  }

  return MVP_ARTWORK_AR_RESOURCES.find((resource) => resource.id === resourceId);
}

export function getDefaultArResourceForArtwork(artworkId?: string | null) {
  return getArResourcesForArtwork(artworkId)[0];
}

export function resolveArResourceFromQrInput(input: string) {
  const normalizedInput = normalizeMuseumCodeForMatch(input);
  if (!normalizedInput) {
    return undefined;
  }

  return MVP_ARTWORK_AR_RESOURCES.find(
    (resource) =>
      normalizeMuseumCodeForMatch(resource.qrCode) === normalizedInput ||
      normalizeMuseumCodeForMatch(resource.id) === normalizedInput,
  );
}

export function getArtworkTitleById(artworks: ArtworkMock[], artworkId: string) {
  return artworks.find((artwork) => artwork.id === artworkId)?.title ?? "Modelo 3D";
}
