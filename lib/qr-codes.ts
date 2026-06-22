import type { ArtworkMock } from "@/datos";
import {
  normalizeMuseumCode,
  normalizeMuseumCodeForMatch,
  resolveArResourceFromQrInput,
} from "@/lib/museum-structure";

function compactCode(value: string) {
  return normalizeMuseumCodeForMatch(value);
}

export function normalizeQrInput(input: string) {
  return normalizeMuseumCode(input);
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

export function resolveQrExperienceFromInput(
  input: string,
  artworks: ArtworkMock[],
) {
  const resource = resolveArResourceFromQrInput(input);
  if (resource) {
    const artwork = artworks.find((candidate) => candidate.id === resource.modelArtworkId);
    return artwork ? { artwork, resource } : undefined;
  }

  const artwork = resolveArtworkFromQrInput(input, artworks);
  return artwork ? { artwork, resource: undefined } : undefined;
}
