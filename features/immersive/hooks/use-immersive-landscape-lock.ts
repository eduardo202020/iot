import { warnVr } from "@/features/immersive/utils/vr-logging";
import { useEffect } from "react";

export function useImmersiveLandscapeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isMounted = true;
    let screenOrientationModule: {
      OrientationLock: { LANDSCAPE: number; PORTRAIT_UP: number };
      lockAsync: (lock: number) => Promise<void>;
    } | null = null;

    const lockLandscape = async () => {
      try {
        const loadedModule = await import("expo-screen-orientation");
        screenOrientationModule = loadedModule;
        await loadedModule.lockAsync(loadedModule.OrientationLock.LANDSCAPE);
      } catch (error) {
        if (isMounted) {
          warnVr("[MuseIQ][VR] No se pudo bloquear landscape nativo", error);
        }
      }
    };

    lockLandscape().catch((error) => {
      if (isMounted) {
        warnVr("[MuseIQ][VR] No se pudo bloquear landscape nativo", error);
      }
    });

    return () => {
      isMounted = false;
      screenOrientationModule
        ?.lockAsync(screenOrientationModule.OrientationLock.PORTRAIT_UP)
        .catch((error) => {
          warnVr("[MuseIQ][VR] No se pudo restaurar portrait", error);
        });
    };
  }, [enabled]);
}
