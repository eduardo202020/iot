import { immersiveRoomExperiences } from "@/lib/immersive-experiences.generated";
import type { RoomImmersiveExperience } from "@/lib/immersive-experience-types";

export type { RoomImmersiveExperience };

export function getAllRoomImmersiveExperiences() {
  return immersiveRoomExperiences;
}

export function getImmersiveExperience(experienceId?: string) {
  if (!experienceId) {
    return undefined;
  }

  return immersiveRoomExperiences.find((experience) => experience.id === experienceId);
}

export function getRoomImmersiveExperience(roomIdOrExperienceId?: string) {
  if (!roomIdOrExperienceId) {
    return undefined;
  }

  return (
    getImmersiveExperience(roomIdOrExperienceId) ??
    immersiveRoomExperiences.find((experience) => experience.roomId === roomIdOrExperienceId)
  );
}

export function getRoomImmersiveExperiences(roomId?: string) {
  if (!roomId) {
    return immersiveRoomExperiences;
  }

  return immersiveRoomExperiences.filter((experience) => experience.roomId === roomId);
}
