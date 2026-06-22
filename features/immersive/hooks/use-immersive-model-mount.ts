import type { MotionPermissionState } from "@/features/immersive/types";
import { logVr } from "@/features/immersive/utils/vr-logging";
import { useEffect, useState } from "react";

export function useImmersiveModelMount({
  enabled,
  motionPermissionState,
  windowHeight,
  windowWidth,
}: {
  enabled: boolean;
  motionPermissionState: MotionPermissionState;
  windowHeight: number;
  windowWidth: number;
}) {
  const [modelCanMount, setModelCanMount] = useState(false);

  useEffect(() => {
    setModelCanMount(false);

    if (!enabled || motionPermissionState === "checking") {
      return;
    }

    const timeout = setTimeout(() => {
      logVr("[MuseIQ][VR] Montando visor 3D inmersivo");
      setModelCanMount(true);
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [enabled, motionPermissionState, windowHeight, windowWidth]);

  return modelCanMount;
}
