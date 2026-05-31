import type { ImmersiveTourDefinition } from "@/lib/immersive-tours";

export type RoomImmersiveExperience = {
  ctaLabel: string;
  description: string;
  id: string;
  modelAsset: number;
  modelLabel: string;
  promptTitle: string;
  roomId: string;
  title: string;
  tour?: ImmersiveTourDefinition;
};
