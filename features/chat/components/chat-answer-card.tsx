import { musePalette } from "@/components/museiq/theme";
import {
  formatMuseRagSource,
  type SourceSnippet,
} from "@/lib/muserag-api";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ChatAnswerCardProps = {
  errorMessage: string;
  hasResponse: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  onOpenImage: (
    images: { id: string; label: string; uri: string }[],
    initialIndex: number,
  ) => void;
  onSpeakResponse: () => void;
  onStopSpeaking: () => void;
  response: string;
  showSpeechSubtitles?: boolean;
  sources: SourceSnippet[];
  speakingDisplayText: string;
  speechHighlightRange: { start: number; end: number } | null;
};

function getSpeechSegments(
  text: string,
  range: { start: number; end: number } | null,
) {
  const start = Math.max(0, Math.min(range?.start ?? 0, text.length));
  const end = Math.max(start, Math.min(range?.end ?? start, text.length));

  return {
    active: text.slice(start, end),
    after: text.slice(end),
    before: text.slice(0, start),
  };
}

export function ChatAnswerCard({
  errorMessage,
  hasResponse,
  isLoading,
  isSpeaking,
  onOpenImage,
  onSpeakResponse,
  onStopSpeaking,
  response,
  showSpeechSubtitles = true,
  sources,
  speakingDisplayText,
  speechHighlightRange,
}: ChatAnswerCardProps) {
  const speechSegments = speakingDisplayText
    ? getSpeechSegments(speakingDisplayText, speechHighlightRange)
    : null;

  return (
    <View style={styles.answerCard}>
      <View style={styles.answerHeader}>
        <Ionicons color={musePalette.primary} name="sparkles-outline" size={18} />
        <Text style={styles.answerHeaderText}>Respuesta MuseIQ</Text>
        {isLoading ? <ActivityIndicator color={musePalette.primary} size="small" /> : null}
        {hasResponse && !isLoading ? (
          <Pressable
            accessibilityLabel={isSpeaking ? "Detener lectura" : "Escuchar respuesta"}
            onPress={isSpeaking ? onStopSpeaking : onSpeakResponse}
            style={({ pressed }) => [
              styles.speakButton,
              isSpeaking ? styles.speakButtonActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              color="#FFFFFF"
              name={isSpeaking ? "volume-mute-outline" : "volume-high-outline"}
              size={17}
            />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.answerScrollContent}
        style={styles.answerScroll}
        showsVerticalScrollIndicator={false}
      >
        {hasResponse ? (
          <Markdown style={markdownStyles}>{response}</Markdown>
        ) : (
          <Text style={styles.answerPlaceholderText}>
            Haz una pregunta sobre esta obra y la respuesta aparecera aqui.
          </Text>
        )}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {showSpeechSubtitles && isSpeaking && speechSegments ? (
          <View style={styles.subtitleCard}>
            <View style={styles.subtitleHeader}>
              <Ionicons color="#FFD65A" name="text-outline" size={15} />
              <Text style={styles.subtitleLabel}>Subtitulos de la respuesta</Text>
            </View>
            <Text style={styles.speechText}>
              <Text style={styles.speechPast}>{speechSegments.before}</Text>
              <Text style={styles.speechActive}>{speechSegments.active || " "}</Text>
              <Text style={styles.speechFuture}>{speechSegments.after}</Text>
            </Text>
          </View>
        ) : null}

        {sources.slice(0, 3).map((source) => {
          const reference = formatMuseRagSource(source);
          return (
            <Pressable
              key={source.id}
              onPress={() => {
                const sourceImages = sources
                  .filter((item) => item.image_url)
                  .map((item, index) => ({
                    id: item.id,
                    uri: item.image_url as string,
                    label: formatMuseRagSource(item).title || `Fuente ${index + 1}`,
                  }));

                const imageIndex = sourceImages.findIndex((item) => item.id === source.id);

                if (sourceImages.length && imageIndex >= 0) {
                  onOpenImage(sourceImages, imageIndex);
                }
              }}
              style={({ pressed }) => [styles.sourceCard, pressed ? styles.pressed : null]}
            >
              <Text style={styles.sourceLabel}>{reference.title}</Text>
              {reference.meta ? <Text style={styles.sourceMeta}>{reference.meta}</Text> : null}
              <Text numberOfLines={2} style={styles.sourceText}>
                {source.text}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  answerCard: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 15,
    borderWidth: 1,
    gap: 8,
    minHeight: 230,
    padding: 12,
  },
  answerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  answerHeaderText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },
  speakButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  speakButtonActive: {
    backgroundColor: "rgba(22,137,206,0.32)",
    borderColor: "rgba(22,137,206,0.56)",
  },
  answerScroll: {
    flex: 1,
  },
  answerScrollContent: {
    gap: 10,
    paddingBottom: 8,
  },
  answerPlaceholderText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  sourceCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
  sourceLabel: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  sourceMeta: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 14,
  },
  sourceText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
  },
  errorText: {
    color: "#FFB2A6",
    fontSize: 12,
    fontWeight: "700",
  },
  subtitleCard: {
    backgroundColor: "rgba(255,214,90,0.08)",
    borderColor: "rgba(255,214,90,0.22)",
    borderRadius: 13,
    borderWidth: 1,
    gap: 7,
    padding: 11,
  },
  subtitleHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  subtitleLabel: {
    color: "#FFD65A",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  speechText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 21,
  },
  speechPast: {
    color: "rgba(255,255,255,0.5)",
  },
  speechActive: {
    backgroundColor: "rgba(255,214,90,0.28)",
    color: "#FFD65A",
    fontWeight: "900",
  },
  speechFuture: {
    color: "rgba(255,255,255,0.9)",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  paragraph: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 0,
    marginBottom: 10,
  },
  strong: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  em: {
    color: "#E7FFE4",
  },
  bullet_list: {
    marginTop: 0,
    marginBottom: 10,
  },
  ordered_list: {
    marginTop: 0,
    marginBottom: 10,
  },
  list_item: {
    color: "rgba(255,255,255,0.86)",
  },
  heading1: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 0,
    marginBottom: 10,
  },
  heading2: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 0,
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
  },
  blockquote: {
    borderLeftColor: musePalette.primary,
    borderLeftWidth: 3,
    color: "rgba(255,255,255,0.76)",
    paddingLeft: 10,
  },
});
