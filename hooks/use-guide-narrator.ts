import museumContent from '@/content/museum.json';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';

interface UseGuideNarratorProps {
    roomId: string;
    zone: number | null;
    enabled: boolean;
}

interface UseGuideNarratorReturn {
    isPlaying: boolean;
    speakNow: () => void;
    stop: () => void;
}

export function useGuideNarrator({
    roomId,
    zone,
    enabled,
}: UseGuideNarratorProps): UseGuideNarratorReturn {
    const [isPlaying, setIsPlaying] = useState(false);
    const isMountedRef = useRef(true);
    const lastSpokenKeyRef = useRef<string | null>(null);

    const getContent = (): string | null => {
        if (!zone || zone < 1 || zone > 3) return null;

        // Try to find content in museum JSON
        const roomContent = (museumContent as any)[roomId];
        console.log('🎙️ getContent:', { roomId, zone, roomContent, available: Object.keys(museumContent as any) });

        if (!roomContent) return null;

        const zoneKey = `Z${zone}`;
        const narration = roomContent[zoneKey]?.narration || null;
        console.log('🎙️ narration found:', { zoneKey, narration });
        return narration;
    };

    const stop = async () => {
        try {
            await Speech.stop();
        } catch (error) {
            console.warn('Error stopping speech:', error);
        }
        if (isMountedRef.current) {
            setIsPlaying(false);
            lastSpokenKeyRef.current = null;
        }
    };

    const speakNow = async () => {
        const content = getContent();
        console.log('🎙️ speakNow called, content:', content);
        if (!content) return;

        try {
            await Speech.stop(); // Stop any current speech

            if (isMountedRef.current) {
                setIsPlaying(true);
                console.log('🎙️ Starting speech:', content.substring(0, 50) + '...');
                await Speech.speak(content, {
                    language: 'es',
                    pitch: 1.0,
                    rate: 0.9,
                    onDone: () => {
                        console.log('🎙️ Speech done');
                        if (isMountedRef.current) {
                            setIsPlaying(false);
                        }
                    },
                    onError: (error: any) => {
                        console.error('🎙️ Speech error:', error);
                        if (isMountedRef.current) {
                            setIsPlaying(false);
                        }
                    },
                });
            }
        } catch (error) {
            console.warn('🎙️ Narrator error:', error);
            if (isMountedRef.current) {
                setIsPlaying(false);
            }
        }
    };

    // Auto-trigger when zone changes
    useEffect(() => {
        if (!enabled || !zone) {
            console.log('🎙️ Auto-trigger skipped:', { enabled, zone });
            return;
        }

        const currentKey = `${roomId}:Z${zone}`;
        console.log('🎙️ Zone changed:', { currentKey, lastSpoken: lastSpokenKeyRef.current });
        
        if (lastSpokenKeyRef.current !== currentKey) {
            lastSpokenKeyRef.current = currentKey;
            console.log('🎙️ Triggering speak for new zone');
            speakNow();
        }
    }, [zone, enabled, roomId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            Speech.stop().catch(() => {
                // Ignore errors on cleanup
            });
        };
    }, []);

    return {
        isPlaying,
        speakNow,
        stop,
    };
}
