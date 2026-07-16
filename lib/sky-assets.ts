import afternoonSky from "@/assets/skies/afternoon.jpg";
import morningSky from "@/assets/skies/morning.jpg";

export type SkyTextureAsset = number | string;
export type SkyPreset = "morning" | "afternoon";

const skyTextures: Record<SkyPreset, SkyTextureAsset> = {
  afternoon: afternoonSky,
  morning: morningSky,
};

export function getCurrentSkyPreset(date = new Date()): SkyPreset {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 19) {
    return "afternoon";
  }

  // The mobile bundle currently includes morning and afternoon panoramas.
  // Keep a valid environment after sunset rather than referencing a removed asset.
  return "afternoon";
}

export function getSkyTextureAsset(preset: SkyPreset) {
  return skyTextures[preset];
}

export function getCurrentSkyTextureAsset(date = new Date()) {
  return getSkyTextureAsset(getCurrentSkyPreset(date));
}
