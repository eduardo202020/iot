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
    id: "sala-1-obra-1-reconstruccion",
    modelArtworkId: "obra-1-3-L",
    parentArtworkId: "obra-1-1-L",
    qrCode: "SALA_1-01-A",
    relationLabel: "QR A",
    subtitle: "Baston ritual relacionado para ampliar la lectura de autoridad.",
    title: "Simbolo de autoridad",
  },
  {
    id: "sala-1-obra-1-detalle",
    modelArtworkId: "obra-1-3-C",
    parentArtworkId: "obra-1-1-L",
    qrCode: "SALA_1-01-B",
    relationLabel: "QR B",
    subtitle: "Portada ceremonial para comparar arquitectura e iconografia.",
    title: "Contexto ceremonial",
  },
  {
    id: "sala-1-obra-2-reconstruccion",
    modelArtworkId: "obra-1-3-R",
    parentArtworkId: "obra-1-1-C",
    qrCode: "SALA_1-02-A",
    relationLabel: "QR A",
    subtitle: "Portada monumental para explicar acceso, escala y ritual.",
    title: "Portada monumental",
  },
  {
    id: "sala-1-obra-2-detalle",
    modelArtworkId: "obra-1-4-L",
    parentArtworkId: "obra-1-1-C",
    qrCode: "SALA_1-02-B",
    relationLabel: "QR B",
    subtitle: "Recipiente Chavin como comparacion de forma y simbolismo.",
    title: "Comparacion cultural",
  },
  {
    id: "sala-1-obra-3-reconstruccion",
    modelArtworkId: "obra-1-4-C",
    parentArtworkId: "obra-1-1-R",
    qrCode: "SALA_1-03-A",
    relationLabel: "QR A",
    subtitle: "Objeto complementario para observar volumen y acabado.",
    title: "Detalle material",
  },
  {
    id: "sala-1-obra-3-detalle",
    modelArtworkId: "obra-1-4-R",
    parentArtworkId: "obra-1-1-R",
    qrCode: "SALA_1-03-B",
    relationLabel: "QR B",
    subtitle: "Huaco retrato para conectar prestigio, rostro y memoria.",
    title: "Retrato relacionado",
  },
  {
    id: "sala-1-obra-4-reconstruccion",
    modelArtworkId: "obra-2-1-L",
    parentArtworkId: "obra-1-2-L",
    qrCode: "SALA_1-04-A",
    relationLabel: "QR A",
    subtitle: "Botella Chimu para comparar funcion y estilo ceramico.",
    title: "Botella comparativa",
  },
  {
    id: "sala-1-obra-4-detalle",
    modelArtworkId: "obra-2-1-C",
    parentArtworkId: "obra-1-2-L",
    qrCode: "SALA_1-04-B",
    relationLabel: "QR B",
    subtitle: "Escultura Inca para ampliar el contraste temporal.",
    title: "Contraste historico",
  },
  {
    id: "sala-1-obra-5-reconstruccion",
    modelArtworkId: "obra-2-1-R",
    parentArtworkId: "obra-1-2-C",
    qrCode: "SALA_1-05-A",
    relationLabel: "QR A",
    subtitle: "Escultura tallada para revisar textura, gesto y volumen.",
    title: "Escultura asociada",
  },
  {
    id: "sala-1-obra-5-detalle",
    modelArtworkId: "obra-2-2-L",
    parentArtworkId: "obra-1-2-C",
    qrCode: "SALA_1-05-B",
    relationLabel: "QR B",
    subtitle: "Figura Chavin completa para comparar iconografia.",
    title: "Figura completa",
  },
  {
    id: "sala-1-obra-6-reconstruccion",
    modelArtworkId: "obra-2-2-C",
    parentArtworkId: "obra-1-2-R",
    qrCode: "SALA_1-06-A",
    relationLabel: "QR A",
    subtitle: "Modelo fotogrametrico para revisar escala y superficie.",
    title: "Fotogrametria 3D",
  },
  {
    id: "sala-1-obra-6-detalle",
    modelArtworkId: "obra-2-2-R",
    parentArtworkId: "obra-1-2-R",
    qrCode: "SALA_1-06-B",
    relationLabel: "QR B",
    subtitle: "Batan como recurso para explicar uso cotidiano y materialidad.",
    title: "Uso cotidiano",
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
