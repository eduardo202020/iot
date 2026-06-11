import type { ArtworkMock } from "@/datos";

const QUERY_KEYS = ["codigo", "code", "obra", "artwork", "artworkId"];

function compactCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function normalizeQrInput(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmed);
    for (const key of QUERY_KEYS) {
      const value = parsedUrl.searchParams.get(key);
      if (value) {
        return value.trim();
      }
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

export function getArtworkQrCode(artwork: ArtworkMock) {
  return `${artwork.roomId}-${String(artwork.order).padStart(2, "0")}`;
}

function getArtworkCodeCandidates(artwork: ArtworkMock) {
  const orderCode = getArtworkQrCode(artwork);
  const rowColCode =
    typeof artwork.row === "number" && typeof artwork.col === "number"
      ? `${artwork.roomId}-${artwork.row}-${artwork.col}`
      : "";

  return [
    artwork.id,
    `MUSEIQ-${artwork.id}`,
    `MUSEIQ:${artwork.id}`,
    `QR-${artwork.id}`,
    orderCode,
    `${orderCode}-A`,
    `${orderCode}-B`,
    `${orderCode}-1`,
    `${orderCode}-2`,
    rowColCode,
    artwork.title,
  ].filter(Boolean);
}

export function resolveArtworkFromQrInput(
  input: string,
  artworks: ArtworkMock[],
) {
  const normalizedInput = compactCode(normalizeQrInput(input));
  if (!normalizedInput) {
    return undefined;
  }

  return artworks.find((artwork) =>
    getArtworkCodeCandidates(artwork).some(
      (candidate) => compactCode(candidate) === normalizedInput,
    ),
  );
}
