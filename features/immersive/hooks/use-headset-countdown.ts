import { HEADSET_COUNTDOWN_SECONDS } from "@/features/immersive/constants";
import { useEffect, useState } from "react";

export function useHeadsetCountdown({
  experienceId,
  hasGuidedTour,
  modelCanMount,
  onResetTourSegment,
}: {
  experienceId?: string;
  hasGuidedTour: boolean;
  modelCanMount: boolean;
  onResetTourSegment: () => void;
}) {
  const [tourCanPlay, setTourCanPlay] = useState(false);
  const [tourCountdown, setTourCountdown] = useState(HEADSET_COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!hasGuidedTour) {
      setTourCanPlay(true);
      setTourCountdown(0);
      onResetTourSegment();
      return;
    }

    if (!modelCanMount) {
      setTourCanPlay(false);
      setTourCountdown(HEADSET_COUNTDOWN_SECONDS);
      onResetTourSegment();
      return;
    }

    setTourCanPlay(false);
    setTourCountdown(HEADSET_COUNTDOWN_SECONDS);

    const interval = setInterval(() => {
      setTourCountdown((currentCountdown) => {
        if (currentCountdown <= 1) {
          clearInterval(interval);
          setTourCanPlay(true);
          return 0;
        }

        return currentCountdown - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [experienceId, hasGuidedTour, modelCanMount, onResetTourSegment]);

  return {
    tourCanPlay,
    tourCountdown,
  };
}
