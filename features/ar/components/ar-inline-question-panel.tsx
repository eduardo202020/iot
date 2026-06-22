import { arColors } from "@/components/museiq/ar-flow";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";

type SpeechRange = { start: number; end: number } | null;
type ArInlineQuestionPanelStyles = {
  content: ViewStyle;
  errorRow: ViewStyle;
  errorText: TextStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  headerTitleGroup: ViewStyle;
  helperText: TextStyle;
  loadingRow: ViewStyle;
  loadingText: TextStyle;
  panel: ViewStyle;
  pressed: ViewStyle;
  questionLabel: TextStyle;
  questionRow: ViewStyle;
  questionText: TextStyle;
  responseActive: TextStyle;
  responseFuture: TextStyle;
  responsePast: TextStyle;
  responseText: TextStyle;
  retryButton: ViewStyle;
  retryText: TextStyle;
  stopButton: ViewStyle;
};

type ArInlineQuestionPanelProps = {
  errorMessage: string;
  hasSubmittedQuestion: boolean;
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  onRetry?: () => void;
  onStopSpeaking: () => void;
  pendingQuestion: string;
  questionText: string;
  response: string;
  speechHighlightRange: SpeechRange;
  speakingDisplayText: string;
  statusMessage: string;
  voiceStatusMessage: string;
};

function cleanResponseText(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getSpeechSegments(text: string, range: SpeechRange) {
  const start = Math.max(0, Math.min(range?.start ?? 0, text.length));
  const end = Math.max(start, Math.min(range?.end ?? start, text.length));

  return {
    active: text.slice(start, end),
    after: text.slice(end),
    before: text.slice(0, start),
  };
}

function getVisibleSpeechSegments(text: string, range: SpeechRange) {
  const start = Math.max(0, Math.min(range?.start ?? 0, text.length));
  const end = Math.max(start, Math.min(range?.end ?? start, text.length));
  const active = text.slice(start, end);
  const windowSize = 150;

  if (!range || (!start && !end)) {
    return getSpeechSegments(text.slice(0, 170), null);
  }

  const roughWindowStart = Math.floor(start / windowSize) * windowSize;
  const previousSpace = text.lastIndexOf(" ", roughWindowStart);
  const windowStart =
    roughWindowStart > 0 && previousSpace > roughWindowStart - 24
      ? previousSpace + 1
      : roughWindowStart;
  const windowEnd = Math.min(text.length, windowStart + windowSize);
  const beforePrefix = windowStart > 0 ? "... " : "";
  const afterSuffix = windowEnd < text.length ? " ..." : "";

  return {
    active,
    after: `${text.slice(end, windowEnd)}${afterSuffix}`,
    before: `${beforePrefix}${text.slice(windowStart, start)}`,
  };
}

export function ArInlineQuestionPanel({
  errorMessage,
  hasSubmittedQuestion,
  isListening,
  isLoading,
  isSpeaking,
  onRetry,
  onStopSpeaking,
  pendingQuestion,
  questionText,
  response,
  speechHighlightRange,
  speakingDisplayText,
  statusMessage,
  voiceStatusMessage,
}: ArInlineQuestionPanelProps) {
  const spokenText = speakingDisplayText || cleanResponseText(response);
  const speechSegments =
    isSpeaking && spokenText
      ? getVisibleSpeechSegments(spokenText, speechHighlightRange)
      : null;
  const submittedQuestion = pendingQuestion || questionText;
  const responseText = cleanResponseText(response);
  const shouldShowResponse = hasSubmittedQuestion && !isLoading && Boolean(responseText);
  const shouldShowQuestion = isListening || isLoading || Boolean(pendingQuestion);

  return (
    <View style={styles.panel} pointerEvents="box-none">
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <Ionicons
              color={isListening ? "#FFD65A" : arColors.primary}
              name={isListening ? "mic-outline" : "sparkles-outline"}
              size={18}
            />
            <Text style={styles.headerTitle}>
              {isListening
                ? "Haz tu pregunta"
                : isLoading
                  ? "Consultando MuseIQ"
                  : "Respuesta MuseIQ"}
            </Text>
          </View>

          {isSpeaking ? (
            <Pressable
              accessibilityLabel="Detener narracion de la respuesta"
              onPress={onStopSpeaking}
              style={({ pressed }) => [styles.stopButton, pressed ? styles.pressed : null]}
            >
              <Ionicons color="#FFFFFF" name="volume-mute-outline" size={17} />
            </Pressable>
          ) : null}
        </View>

        {shouldShowQuestion ? (
          <View style={styles.questionRow}>
            <Text style={styles.questionLabel}>Pregunta</Text>
            <Text numberOfLines={2} style={styles.questionText}>
              {submittedQuestion.trim() || voiceStatusMessage || "Te escucho..."}
            </Text>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={arColors.primary} size="small" />
            <Text style={styles.loadingText}>
              {statusMessage || "Buscando una respuesta contextual..."}
            </Text>
          </View>
        ) : null}

        {shouldShowResponse ? (
          <View>
            {speechSegments ? (
              <Text numberOfLines={2} style={styles.responseText}>
                <Text style={styles.responsePast}>{speechSegments.before}</Text>
                <Text style={styles.responseActive}>{speechSegments.active || " "}</Text>
                <Text style={styles.responseFuture}>{speechSegments.after}</Text>
              </Text>
            ) : (
              <Text numberOfLines={2} style={styles.responseText}>{responseText}</Text>
            )}
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            {onRetry ? (
              <Pressable
                onPress={onRetry}
                style={({ pressed }) => [styles.retryButton, pressed ? styles.pressed : null]}
              >
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {!isLoading && !shouldShowResponse && !errorMessage ? (
          <Text style={styles.helperText}>
            {voiceStatusMessage || "Pulsa Preguntar y dicta tu duda sobre la obra."}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    zIndex: 44,
  },
  content: {
    backgroundColor: "rgba(5,8,13,0.46)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  headerTitleGroup: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  stopButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  questionRow: {
    gap: 3,
  },
  questionLabel: {
    color: arColors.primary,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  loadingText: {
    color: "rgba(255,255,255,0.82)",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  responseText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  responsePast: {
    color: "rgba(255,255,255,0.94)",
  },
  responseActive: {
    color: "#FFD65A",
    fontWeight: "900",
  },
  responseFuture: {
    color: "rgba(255,255,255,0.94)",
  },
  errorRow: {
    gap: 8,
  },
  errorText: {
    color: "#FFB2A6",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  helperText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
}) as ArInlineQuestionPanelStyles;
