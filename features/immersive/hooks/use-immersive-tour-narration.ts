import { NARRATION_DEFAULT_RATE } from "@/features/immersive/constants";
import type { ImmersiveModelKey } from "@/features/immersive/types";
import type { ImmersiveTourNarration } from "@/lib/immersive-tours";
import * as Speech from "expo-speech";
import { useEffect, useRef } from "react";

export function useImmersiveTourNarration({
  activeModelKey,
  activeNarration,
  activeNarrationKey,
  tourCanPlay,
}: {
  activeModelKey: ImmersiveModelKey;
  activeNarration?: ImmersiveTourNarration;
  activeNarrationKey: string | null;
  tourCanPlay: boolean;
}) {
  const lastSpokenSegmentKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tourCanPlay || activeModelKey !== "room" || !activeNarrationKey || !activeNarration) {
      lastSpokenSegmentKeyRef.current = null;
      Speech.stop().catch(() => undefined);
      return;
    }

    if (lastSpokenSegmentKeyRef.current === activeNarrationKey) {
      return;
    }

    let isCancelled = false;
    lastSpokenSegmentKeyRef.current = activeNarrationKey;

    const speakSegment = async () => {
      try {
        await Speech.stop();
        if (isCancelled) {
          return;
        }

        Speech.speak(activeNarration.text, {
          language: "es-PE",
          pitch: 1,
          rate: activeNarration.speechRate ?? NARRATION_DEFAULT_RATE,
          onDone: () => undefined,
          onError: () => undefined,
          onStopped: () => undefined,
        });
      } catch {
        // La narracion es complementaria: si TTS falla, el tour continua.
      }
    };

    speakSegment();

    return () => {
      isCancelled = true;
    };
  }, [activeModelKey, activeNarration, activeNarrationKey, tourCanPlay]);

  useEffect(() => {
    return () => {
      Speech.stop().catch(() => undefined);
    };
  }, []);
}
