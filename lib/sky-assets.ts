import afternoonSky from "@/assets/skies/afternoon.jpg";
import morningSky from "@/assets/skies/morning.jpg";
import nightSky from "@/assets/skies/night.jpg";

export type SkyTextureAsset = number | string;
export type SkyPreset = "morning" | "afternoon" | "night";

const skyTextures: Record<SkyPreset, SkyTextureAsset> = {
  afternoon: afternoonSky,
  morning: morningSky,
  night: nightSky,
};

export function getCurrentSkyPreset(date = new Date()): SkyPreset {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 19) {
    return "afternoon";
  }

  return "night";
}

export function getSkyTextureAsset(preset: SkyPreset) {
  return skyTextures[preset];
}

export function getCurrentSkyTextureAsset(date = new Date()) {
  return getSkyTextureAsset(getCurrentSkyPreset(date));
}
