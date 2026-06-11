import { ENABLE_VR_TERMINAL_LOGS } from "@/features/immersive/constants";

export function logVr(...args: Parameters<typeof console.log>) {
  if (ENABLE_VR_TERMINAL_LOGS) {
    console.log(...args);
  }
}

export function warnVr(...args: Parameters<typeof console.warn>) {
  if (ENABLE_VR_TERMINAL_LOGS) {
    console.warn(...args);
  }
}
