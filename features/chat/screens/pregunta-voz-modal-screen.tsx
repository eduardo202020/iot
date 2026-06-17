import { ZoomImageViewer } from "@/components/museiq/chat/zoom-image-viewer";
import { ChatAnswerCard } from "@/features/chat/components/chat-answer-card";
import { ChatModalHeader } from "@/features/chat/components/chat-modal-header";
import { ChatQuestionComposer } from "@/features/chat/components/chat-question-composer";
import { ChatSuggestionsPanel } from "@/features/chat/components/chat-suggestions-panel";
import { useArtworkChatController } from "@/hooks/use-artwork-chat-controller";
import { useChatModalKeyboard } from "@/features/chat/hooks/use-chat-modal-keyboard";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function PreguntaVozModal() {
  const params = useLocalSearchParams<{ artworkId?: string }>();
  const artworkId =
    typeof params.artworkId === "string" ? params.artworkId : undefined;
  const { artwork, chatSheetProps, closeZoomViewer, zoomImage } =
    useArtworkChatController({ artworkId });

  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const keyboardHeight = useChatModalKeyboard();
  const quickQuestions = chatSheetProps.suggestedQuestions.slice(0, 4);
  const hasResponse = chatSheetProps.response.trim().length > 0;
  const canSubmit = chatSheetProps.questionText.trim().length > 0;

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />

      <View
        style={[
          styles.keyboardAvoider,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight - 12 : 0 },
        ]}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

        <ChatModalHeader
          onClose={() => router.back()}
          subtitle={artwork?.title ?? "Obra actual"}
          title="Preguntar"
        />

        <ChatSuggestionsPanel
          isOpen={isSuggestionsOpen}
          onResponseModeChange={chatSheetProps.onResponseModeChange}
          onSuggestedQuestionPress={chatSheetProps.onSuggestedQuestionPress}
          onToggle={() => setIsSuggestionsOpen((value) => !value)}
          questions={quickQuestions}
          responseMode={chatSheetProps.responseMode}
        />

        <ChatQuestionComposer
          canSubmit={canSubmit}
          isListening={chatSheetProps.isListening}
          onQuestionTextChange={chatSheetProps.onQuestionTextChange}
          onSubmit={chatSheetProps.onSubmit}
          onToggleListening={chatSheetProps.onToggleListening}
          questionText={chatSheetProps.questionText}
        />

        {chatSheetProps.voiceStatusMessage ? (
          <Text style={styles.helperText}>
            {chatSheetProps.voiceStatusMessage}
          </Text>
        ) : null}

        <ChatAnswerCard
          errorMessage={chatSheetProps.errorMessage}
          hasResponse={hasResponse}
          isLoading={chatSheetProps.isLoading}
          isSpeaking={chatSheetProps.isSpeaking}
          onOpenImage={chatSheetProps.onOpenImage}
          onSpeakResponse={chatSheetProps.onSpeakResponse}
          onStopSpeaking={chatSheetProps.onStopSpeaking}
          response={chatSheetProps.response}
          showSpeechSubtitles={chatSheetProps.subtitlesEnabled !== false}
          sources={chatSheetProps.sources}
          speakingDisplayText={chatSheetProps.speakingDisplayText}
          speechHighlightRange={chatSheetProps.speechHighlightRange}
        />
        </View>
      </View>

      {zoomImage ? (
        <ZoomImageViewer
          images={zoomImage.images}
          initialIndex={zoomImage.initialIndex}
          onClose={closeZoomViewer}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(5,8,13,0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  keyboardAvoider: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(8,10,14,0.96)",
    borderColor: "rgba(255,255,255,0.16)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    gap: 12,
    maxHeight: "76%",
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 4,
    width: 54,
  },
  helperText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
