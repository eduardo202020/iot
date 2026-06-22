import type { ChatSheetProps } from "@/components/museiq/chat/chat-sheet";
import type { SourceImageItem } from "@/components/museiq/chat/source-image-carousel";
import { askMuseRag, type SourceSnippet } from "@/lib/muserag-api";
import {
  getArtworkConversationMemory,
  getPersistedChatHistory,
  persistChatTurn,
  recordAnalyticsEvent,
} from "@/lib/museum-database";
import { useMuseIQ } from "@/providers/museiq-provider";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";

const RECOGNITION_LANGUAGE = "es-ES";
const SPEECH_LANGUAGE = "es-PE";
const MAX_CHAT_HISTORY_TURNS = 3;

type ResponseMode = "breve" | "explicada" | "infantil";
type QuestionInputMode = "suggested" | "manual" | "voice";

type ChatHistoryTurn = {
  id: string;
  question: string;
  response: string;
  sourceCount: number;
};

type UseArtworkChatControllerOptions = {
  artworkId?: string;
};

type ChatControllerSheetProps = Omit<ChatSheetProps, "onClose">;

function createChatSessionId(artworkId?: string) {
  const seed = artworkId?.trim() || "chat";
  return `${seed}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function markdownToSpeechText(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function useArtworkChatController({
  artworkId,
}: UseArtworkChatControllerOptions = {}) {
  const {
    currentArtwork,
    currentRouteStep,
    currentRoom,
    findArtworkById,
    getArtworksForRoom,
    settings,
    stopArtworkNarration,
    voicePrompts,
  } = useMuseIQ();

  const artwork = useMemo(
    () => findArtworkById(artworkId) ?? currentArtwork,
    [artworkId, currentArtwork, findArtworkById],
  );

  const [questionText, setQuestionText] = useState(
    artwork?.suggestedQuestions[0] ?? voicePrompts[0] ?? "",
  );
  const [questionInputMode, setQuestionInputMode] =
    useState<QuestionInputMode>("suggested");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<SourceSnippet[]>([]);
  const [responseMeta, setResponseMeta] =
    useState<ChatSheetProps["responseMeta"]>(null);
  const [historyTurns, setHistoryTurns] = useState<ChatHistoryTurn[]>([]);
  const [zoomImage, setZoomImage] = useState<{
    images: SourceImageItem[];
    initialIndex: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingDisplayText, setSpeakingDisplayText] = useState("");
  const [speechHighlightRange, setSpeechHighlightRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [voiceStatusMessage, setVoiceStatusMessage] = useState("");
  const [responseMode, setResponseMode] = useState<ResponseMode>("breve");
  const loadingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeRequestAbortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef(createChatSessionId(artworkId ?? currentArtwork?.id));

  const suggestedQuestionFallback =
    artwork?.suggestedQuestions[0] ?? voicePrompts[0] ?? "";

  const resetQuestionComposer = () => {
    setQuestionText(suggestedQuestionFallback);
    setQuestionInputMode("suggested");
    setVoiceStatusMessage("");
  };

  const cancelPendingQuestion = () => {
    activeRequestAbortRef.current?.abort();
    activeRequestAbortRef.current = null;
    setPendingQuestion("");
    setStatusMessage("");
    setIsLoading(false);
    resetQuestionComposer();
    loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    loadingTimersRef.current = [];
  };

  const suggestedQuestions = useMemo(() => {
    const candidates = [
      ...(artwork?.suggestedQuestions ?? []),
      ...voicePrompts,
    ]
      .map((item) => item.trim())
      .filter(Boolean);

    return [...new Set(candidates)].slice(0, 4);
  }, [artwork?.suggestedQuestions, voicePrompts]);

  const nearbyArtworkTitles = useMemo(() => {
    if (!artwork?.roomId || !artwork.id) {
      return [];
    }

    const roomArtworks = getArtworksForRoom(artwork.roomId);
    const currentIndex = roomArtworks.findIndex((item) => item.id === artwork.id);
    if (currentIndex < 0) {
      return [];
    }

    return roomArtworks
      .filter((_, index) => Math.abs(index - currentIndex) <= 2 && index !== currentIndex)
      .map((item) => item.title)
      .slice(0, 4);
  }, [artwork?.id, artwork?.roomId, getArtworksForRoom]);

  const followUpQuestions = useMemo(() => {
    const candidates = [
      ...(artwork?.suggestedQuestions ?? []),
      ...historyTurns.map((turn) => turn.question),
    ]
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => item !== lastSubmittedQuestion.trim());

    return [...new Set(candidates)].slice(0, 3);
  }, [artwork?.suggestedQuestions, historyTurns, lastSubmittedQuestion]);

  const voiceMode = isListening
    ? "listening"
    : voiceStatusMessage.startsWith("Dictado listo")
      ? "review"
      : "idle";
  const isQuestionReady =
    questionInputMode !== "suggested" && questionText.trim().length > 0;

  const setSuggestedQuestion = (value: string) => {
    setQuestionText(value);
    setQuestionInputMode("manual");
  };

  const updateQuestionText = (value: string) => {
    setQuestionText(value);
    setQuestionInputMode(value.trim().length > 0 ? "manual" : "suggested");
  };

  useEffect(() => {
    if (questionText.trim().length > 0) {
      return;
    }

    setQuestionText(suggestedQuestionFallback);
    setQuestionInputMode("suggested");
  }, [questionText, suggestedQuestionFallback]);

  useEffect(() => {
    let isMounted = true;

    const hydrateHistory = async () => {
      if (!artwork?.id) {
        if (isMounted) {
          setHistoryTurns([]);
        }
        return;
      }

      const persistedTurns = await getPersistedChatHistory(artwork.id);
      const memory = await getArtworkConversationMemory(artwork.id);
      if (!isMounted) {
        return;
      }

      setHistoryTurns(
        persistedTurns.map((turn) => ({
          id: turn.id,
          question: turn.question,
          response: turn.response,
          sourceCount: turn.sourceCount,
        })),
      );

      const latestTurn = persistedTurns[0];
      sessionIdRef.current =
        memory?.lastSessionId ?? latestTurn?.sessionId ?? createChatSessionId(artwork.id);

      if (latestTurn) {
        setResponse(latestTurn.response);
        setLastSubmittedQuestion(latestTurn.question);
      } else {
        setResponse("");
        setLastSubmittedQuestion("");
      }
    };

    hydrateHistory().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [artwork?.id]);

  const openZoomViewer = (images: SourceImageItem[], initialIndex: number) => {
    setZoomImage({ images, initialIndex });
  };

  const closeZoomViewer = () => {
    setZoomImage(null);
  };

  const stopSpeaking = async () => {
    try {
      await Speech.stop();
    } finally {
      setIsSpeaking(false);
      setSpeakingDisplayText("");
      setSpeechHighlightRange(null);
    }
  };

  const speakResponse = async (text = response) => {
    const trimmedText = markdownToSpeechText(text);
    if (!trimmedText) {
      return;
    }

    setErrorMessage("");
    await stopArtworkNarration();
    await stopSpeaking();
    setIsSpeaking(true);
    setSpeakingDisplayText(trimmedText);
    setSpeechHighlightRange({ start: 0, end: 0 });
    Speech.speak(trimmedText, {
      language: SPEECH_LANGUAGE,
      rate: settings.voiceRate,
      pitch: 1,
      onBoundary: (event: { charIndex: number; charLength: number }) => {
        const start = event.charIndex ?? 0;
        const end = start + (event.charLength ?? 0);
        setSpeechHighlightRange({ start, end });
      },
      onDone: () => {
        setIsSpeaking(false);
        setSpeakingDisplayText("");
        setSpeechHighlightRange(null);
      },
      onStopped: () => {
        setIsSpeaking(false);
        setSpeakingDisplayText("");
        setSpeechHighlightRange(null);
      },
      onError: () => {
        setIsSpeaking(false);
        setSpeakingDisplayText("");
        setSpeechHighlightRange(null);
        setErrorMessage("No pude reproducir la respuesta en voz alta.");
      },
    });
  };

  const stopListening = () => {
    setVoiceStatusMessage("Procesando lo que acabas de decir...");
    ExpoSpeechRecognitionModule.stop();
  };

  const startListening = async () => {
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      setErrorMessage(
        "El dictado por voz no esta disponible en este dispositivo o servicio de reconocimiento.",
      );
      return;
    }

    const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permissions.granted) {
      setErrorMessage(
        "Necesito permiso de microfono y reconocimiento de voz para dictar preguntas.",
      );
      return;
    }

    await stopArtworkNarration();
    await stopSpeaking();
    setErrorMessage("");
    setVoiceStatusMessage("Activando el microfono del guia...");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordAnalyticsEvent({
      eventType: "voice_started",
      artworkId: artwork?.id ?? null,
      roomId: artwork?.roomId ?? null,
      metadata: { artworkTitle: artwork?.title ?? null },
    }).catch(() => undefined);
    ExpoSpeechRecognitionModule.start({
      lang: RECOGNITION_LANGUAGE,
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: true,
      iosTaskHint: "dictation",
      iosCategory: {
        category: "playAndRecord",
        categoryOptions: ["defaultToSpeaker", "allowBluetooth"],
        mode: "measurement",
      },
      iosVoiceProcessingEnabled: true,
      contextualStrings: [
        artwork?.title ?? "",
        ...(artwork?.suggestedQuestions ?? []),
        ...voicePrompts,
      ].filter(Boolean),
    });
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    await startListening();
  };

  const scheduleLoadingMessages = () => {
    loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    loadingTimersRef.current = [];

    const steps = [
      { delay: 0, message: "Buscando contexto de la obra..." },
      { delay: 3500, message: "Relacionando tu pregunta con las fuentes del museo..." },
      { delay: 9000, message: "Redactando una respuesta clara para ti..." },
      {
        delay: 16000,
        message: "La respuesta esta tardando un poco mas, pero seguimos esperando...",
      },
    ];

    loadingTimersRef.current = steps.map(({ delay, message }) =>
      setTimeout(() => {
        setStatusMessage(message);
      }, delay),
    );
  };

  const askQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setErrorMessage("Escribe una pregunta para continuar.");
      return;
    }

    setResponse("");
    setSources([]);
    setResponseMeta(null);
    setErrorMessage("");
    setLastSubmittedQuestion(trimmedQuestion);
    setPendingQuestion(trimmedQuestion);
    setVoiceStatusMessage("");
    setIsLoading(true);
    if (isListening) {
      ExpoSpeechRecognitionModule.abort();
      setIsListening(false);
    }
    await stopSpeaking();
    scheduleLoadingMessages();
    const requestAbortController = new AbortController();
    activeRequestAbortRef.current = requestAbortController;

    try {
      const result = await askMuseRag({
        question: trimmedQuestion,
        roomId: artwork?.roomId,
        artworkName: artwork?.title,
        artworkId: artwork?.id,
        responseMode,
        sessionId: sessionIdRef.current,
        artworkContext: artwork
          ? {
              id: artwork.id,
              title: artwork.title,
              author: artwork.author,
              year: artwork.year,
              period: artwork.period,
              technique: artwork.technique,
              summary: artwork.summary,
              context: artwork.context,
              room_name: currentRoom?.name,
              room_relation: artwork.roomRelation,
              location_hint: artwork.locationHint,
              route_hint: currentRouteStep?.hint,
              tags: artwork.tags,
              nearby_artworks: nearbyArtworkTitles,
              suggested_questions: artwork.suggestedQuestions,
            }
          : undefined,
        signal: requestAbortController.signal,
      });

      const markdownResponse = (result.markdown ?? result.respuesta).trim();

      setResponse(markdownResponse);
      setSources(result.fuentes ?? []);
      setResponseMeta(result.meta ?? null);
      setStatusMessage("");
      resetQuestionComposer();
      if (artwork?.id) {
        const nextTurn = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sessionId: sessionIdRef.current,
          artworkId: artwork.id,
          question: trimmedQuestion,
          response: markdownResponse,
          sourceCount: result.meta?.source_count ?? result.fuentes?.length ?? 0,
          createdAt: Date.now(),
        };
        setHistoryTurns((previous) =>
          [nextTurn, ...previous].slice(0, MAX_CHAT_HISTORY_TURNS).map((turn) => ({
            id: turn.id,
            question: turn.question,
            response: turn.response,
            sourceCount: turn.sourceCount,
          })),
        );
        persistChatTurn(nextTurn).catch(() => undefined);
      }
      recordAnalyticsEvent({
        eventType: "chat_question",
        artworkId: artwork?.id ?? null,
        roomId: artwork?.roomId ?? null,
        metadata: {
          mode: responseMode,
          sourceCount: result.meta?.source_count ?? result.fuentes?.length ?? 0,
        },
      }).catch(() => undefined);
      if (settings.autoPlay && markdownResponse) {
        await speakResponse(markdownResponse);
      }
    } catch (error) {
      if (
        requestAbortController.signal.aborted ||
        (error instanceof Error && error.message === "Consulta cancelada.")
      ) {
        resetQuestionComposer();
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "No pude conectar con MuseRAG. Verifica que el backend este activo.";
      setErrorMessage(message);
      setStatusMessage("");
    } finally {
      if (activeRequestAbortRef.current === requestAbortController) {
        activeRequestAbortRef.current = null;
      }
      loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      loadingTimersRef.current = [];
      setPendingQuestion("");
      setIsLoading(false);
    }
  };

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setVoiceStatusMessage("Te escucho. Habla con naturalidad.");
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
    setVoiceStatusMessage((current) =>
      current.startsWith("Dictado listo. Enviando")
        ? current
        : current.startsWith("Procesando")
          ? "Analizando tu dictado..."
          : current,
    );
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript?.trim();
    if (!transcript) {
      return;
    }

    setQuestionText(transcript);
    setQuestionInputMode("voice");

    if (event.isFinal) {
      setVoiceStatusMessage("Enviando tu pregunta...");
      askQuestion(transcript).catch(() => undefined);
      return;
    }

    setVoiceStatusMessage("Escuchando tu pregunta...");
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);

    if (event.error === "aborted") {
      setVoiceStatusMessage("");
      return;
    }

    const message =
      event.error === "no-speech"
        ? "No detecte voz con claridad. Intenta hablar un poco mas cerca del microfono."
        : event.message ||
          "No pude transcribir tu voz en este momento. Intenta de nuevo.";

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => undefined,
    );
    setVoiceStatusMessage("");
    setErrorMessage(message);
  });

  useEffect(() => {
    return () => {
      loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      loadingTimersRef.current = [];
      activeRequestAbortRef.current?.abort();
      ExpoSpeechRecognitionModule.abort();
      Speech.stop();
    };
  }, []);

  const chatSheetProps: ChatControllerSheetProps = {
    artworkTitle: artwork?.title ?? "Obra actual",
    errorMessage,
    followUpQuestions,
    historyTurns,
    isQuestionReady,
    isListening,
    isLoading,
    isSpeaking,
    onCancelPendingQuestion: cancelPendingQuestion,
    onFollowUpQuestionPress: setSuggestedQuestion,
    onHistoryTurnPress: setSuggestedQuestion,
    onOpenImage: openZoomViewer,
    onOpenConnectionError: errorMessage
      ? () =>
          router.push({
            pathname: "/error-conexion",
            params: {
              ...(artwork?.id ? { artworkId: artwork.id } : {}),
              message: errorMessage,
            },
          } as never)
      : undefined,
    onQuestionTextChange: updateQuestionText,
    onResponseModeChange: setResponseMode,
    onRetry: lastSubmittedQuestion ? () => askQuestion(lastSubmittedQuestion) : undefined,
    onSpeakResponse: () => speakResponse(),
    onStopListening: stopListening,
    onStopSpeaking: stopSpeaking,
    onSubmit: () => {
      if (isQuestionReady) {
        askQuestion(questionText);
        return;
      }

      toggleListening().catch(() => undefined);
    },
    onSuggestedQuestionPress: setSuggestedQuestion,
    onToggleListening: toggleListening,
    pendingQuestion,
    questionText,
    response,
    responseMeta,
    responseMode,
    sources,
    speakingDisplayText,
    speechHighlightRange,
    statusMessage,
    subtitlesEnabled: settings.subtitles,
    suggestedQuestions,
    voiceMode,
    voiceStatusMessage,
  };

  return {
    artwork,
    chatSheetProps,
    closeZoomViewer,
    zoomImage,
  };
}
