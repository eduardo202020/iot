import {
  MVP_IMMERSIVE_ROOM_ID,
  isMvpNormalRoomId,
  museumMock,
  type ArtworkMock,
} from "@/datos";
import type { BeaconData } from "@/types/beacon";

export type MuseumRoomKind = "normal" | "immersive";

export type NormalRoomZone = {
  artworkId: string;
  beaconNode: number;
  label: string;
  qrCodes: [string, string];
  roomId: string;
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

const roomBeaconNodes: Record<string, number> = {
  SALA_1: 1,
  SALA_2: 2,
  SALA_3: 3,
};

const normalArtworks = museumMock.artworks.filter((artwork) =>
  isMvpNormalRoomId(artwork.roomId),
);

function getArtworkQrBase(artwork: ArtworkMock) {
  return `${artwork.roomId}-${String(artwork.order).padStart(2, "0")}`;
}

export const MVP_NORMAL_ROOM_ZONES: NormalRoomZone[] = normalArtworks.map(
  (artwork) => ({
    artworkId: artwork.id,
    beaconNode: roomBeaconNodes[artwork.roomId] ?? artwork.order,
    label: `${artwork.title} · estación ${artwork.order}`,
    qrCodes: [
      `${getArtworkQrBase(artwork)}-A`,
      `${getArtworkQrBase(artwork)}-B`,
    ],
    roomId: artwork.roomId,
    zoneId: `${artwork.roomId}-Z${artwork.order}`,
  }),
);

export const MVP_ARTWORK_AR_RESOURCES: ArtworkArResource[] = normalArtworks.flatMap(
  (artwork) => {
    const roomArtworks = normalArtworks.filter(
      (candidate) => candidate.roomId === artwork.roomId,
    );
    const artworkIndex = roomArtworks.findIndex(
      (candidate) => candidate.id === artwork.id,
    );
    const comparisonArtwork = roomArtworks[(artworkIndex + 1) % roomArtworks.length];
    const idPrefix = `${artwork.roomId.toLowerCase().replace("_", "-")}-${String(artwork.order).padStart(2, "0")}`;
    const qrBase = getArtworkQrBase(artwork);

    return [
      {
        id: `${idPrefix}-modelo`,
        modelArtworkId: artwork.id,
        parentArtworkId: artwork.id,
        qrCode: `${qrBase}-A`,
        relationLabel: "QR A",
        subtitle: "Explora el modelo principal y recorre su forma desde todos los ángulos.",
        title: `${artwork.title} en 3D`,
      },
      {
        id: `${idPrefix}-comparacion`,
        modelArtworkId: comparisonArtwork.id,
        parentArtworkId: artwork.id,
        qrCode: `${qrBase}-B`,
        relationLabel: "QR B",
        subtitle: "Abre la siguiente pieza de la misma sala para compararlas.",
        title: `Comparar con ${comparisonArtwork.title}`,
      },
    ];
  },
);

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
  if (!beacon || !isMvpNormalRoomId(beacon.roomId)) {
    return undefined;
  }

  const roomZones = MVP_NORMAL_ROOM_ZONES.filter(
    (zone) => zone.roomId === beacon.roomId,
  );

  if (beacon.artworkId) {
    const artworkZone = roomZones.find(
      (zone) => zone.artworkId === beacon.artworkId,
    );
    if (artworkZone) {
      return artworkZone;
    }
  }

  if (beacon.zoneId) {
    const zoneById = roomZones.find(
      (zone) => normalizeMuseumCodeForMatch(zone.zoneId) === normalizeMuseumCodeForMatch(beacon.zoneId ?? ""),
    );
    if (zoneById) {
      return zoneById;
    }
  }

  return roomZones.find((zone) => zone.beaconNode === beacon.beaconNode);
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
