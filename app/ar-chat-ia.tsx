import {
  ArSceneBackground,
  ArSideRail,
  ArTopStatusHud,
  arColors,
} from "@/components/museiq/ar-flow";
import { ZoomImageViewer } from "@/components/museiq/chat/zoom-image-viewer";
import { musePalette } from "@/components/museiq/theme";
import { useArtworkChatController } from "@/hooks/use-artwork-chat-controller";
import { formatMuseRagSource } from "@/lib/muserag-api";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArChatIaScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    currentRoom,
    findArtworkById,
    findRoomById,
    museumProfile,
    selectArtwork,
  } = useMuseIQ();
  const resolvedArtworkId =
    typeof artworkId === "string" ? artworkId : undefined;
  const artwork = findArtworkById(resolvedArtworkId) ?? currentArtwork;
  const room = findRoomById(artwork?.roomId) ?? currentRoom;
  const { chatSheetProps, closeZoomViewer, zoomImage } =
    useArtworkChatController({ artworkId: resolvedArtworkId });

  if (!artwork) {
    return <View style={styles.screen} />;
  }

  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = room?.name ?? "Sala por confirmar";
  const statusLabel = room?.statusLabel ?? "Senal estable";
  const quickQuestions = chatSheetProps.suggestedQuestions.slice(0, 4);
  const hasResponse = chatSheetProps.response.trim().length > 0;
  const canSubmit = chatSheetProps.questionText.trim().length > 0;

  const openAudioActive = () => {
    selectArtwork(artwork.id);
    router.push({
      pathname: "/ar-audio-activo",
      params: { artworkId: artwork.id },
    } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.18)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud
          museumName={museumName}
          roomName={roomName}
          statusLabel={statusLabel}
        />

        <ArSideRail
          active="chat"
          onAudio={openAudioActive}
          onChat={() => undefined}
          style={styles.sideRail}
        />

        <View style={styles.spacer} />

        <View style={styles.chatSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeaderRow}>
            <View>
              <Text style={styles.sheetTitle}>Preguntar</Text>
              <Text numberOfLines={1} style={styles.sheetSubtitle}>
                {artwork.title}
              </Text>
            </View>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.closeButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#FFFFFF" name="close" size={18} />
            </Pressable>
          </View>

          <View style={styles.topicTabs}>
            <View style={[styles.topicChip, styles.topicChipActive]}>
              <Ionicons color="#D7F7D3" name="sparkles-outline" size={13} />
              <Text style={styles.topicChipTextActive}>Sugeridas</Text>
            </View>
            <Pressable
              onPress={() => chatSheetProps.onResponseModeChange("breve")}
              style={[
                styles.topicChip,
                chatSheetProps.responseMode === "breve"
                  ? styles.topicChipActive
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.topicChipText,
                  chatSheetProps.responseMode === "breve"
                    ? styles.topicChipTextActive
                    : null,
                ]}
              >
                Breve
              </Text>
            </Pressable>
            <Pressable
              onPress={() => chatSheetProps.onResponseModeChange("explicada")}
              style={[
                styles.topicChip,
                chatSheetProps.responseMode === "explicada"
                  ? styles.topicChipActive
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.topicChipText,
                  chatSheetProps.responseMode === "explicada"
                    ? styles.topicChipTextActive
                    : null,
                ]}
              >
                Explicada
              </Text>
            </Pressable>
          </View>

          <View style={styles.questionStack}>
            {quickQuestions.map((question) => (
              <Pressable
                key={question}
                onPress={() =>
                  chatSheetProps.onSuggestedQuestionPress(question)
                }
                style={({ pressed }) => [
                  styles.questionBubble,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text numberOfLines={2} style={styles.questionBubbleText}>
                  {question}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <Ionicons
                color={arColors.primary}
                name="sparkles-outline"
                size={18}
              />
              <Text style={styles.answerHeaderText}>Respuesta IA</Text>
              {chatSheetProps.isLoading ? (
                <ActivityIndicator color={arColors.primary} size="small" />
              ) : null}
            </View>

            <ScrollView
              contentContainerStyle={styles.answerScrollContent}
              style={styles.answerScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.answerText}>
                {hasResponse
                  ? chatSheetProps.response
                  : "Haz una pregunta sobre esta obra y la respuesta aparecera aqui."}
              </Text>

              {chatSheetProps.errorMessage ? (
                <Text style={styles.errorText}>
                  {chatSheetProps.errorMessage}
                </Text>
              ) : null}

              {chatSheetProps.sources.slice(0, 3).map((source) => {
                const reference = formatMuseRagSource(source);
                return (
                  <Pressable
                    key={source.id}
                    onPress={() => {
                      const sourceImages = chatSheetProps.sources
                        .filter((item) => item.image_url)
                        .map((item, index) => ({
                          id: item.id,
                          uri: item.image_url as string,
                          label:
                            formatMuseRagSource(item).title || `Fuente ${index + 1}`,
                        }));

                      const imageIndex = sourceImages.findIndex(
                        (item) => item.id === source.id,
                      );

                      if (sourceImages.length && imageIndex >= 0) {
                        chatSheetProps.onOpenImage(sourceImages, imageIndex);
                      }
                    }}
                    style={({ pressed }) => [
                      styles.sourceCard,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text style={styles.sourceLabel}>{reference.title}</Text>
                    {reference.meta ? (
                      <Text style={styles.sourceMeta}>{reference.meta}</Text>
                    ) : null}
                    <Text numberOfLines={2} style={styles.sourceText}>
                      {source.text}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              value={chatSheetProps.questionText}
              onChangeText={chatSheetProps.onQuestionTextChange}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor="rgba(255,255,255,0.55)"
              multiline
              style={styles.input}
            />

            <Pressable
              onPress={
                canSubmit
                  ? chatSheetProps.onSubmit
                  : chatSheetProps.onToggleListening
              }
              style={({ pressed }) => [
                styles.inputAction,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons
                color="#FFFFFF"
                name={canSubmit ? "send" : "mic-outline"}
                size={20}
              />
            </Pressable>
          </View>

          {chatSheetProps.voiceStatusMessage ? (
            <Text style={styles.helperText}>
              {chatSheetProps.voiceStatusMessage}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>

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
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  sideRail: {
    top: "31%",
  },
  chatSheet: {
    backgroundColor: arColors.glassFillStrong,
    borderColor: "rgba(255,255,255,0.16)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    gap: 12,
    maxHeight: "74%",
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
  sheetHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  sheetSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    maxWidth: 240,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  topicTabs: {
    flexDirection: "row",
    gap: 8,
  },
  topicChip: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 10,
  },
  topicChipActive: {
    backgroundColor: "rgba(22,137,206,0.38)",
    borderColor: "rgba(27,164,226,0.72)",
  },
  topicChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  topicChipTextActive: {
    color: arColors.primarySoft,
    fontSize: 12,
    fontWeight: "800",
  },
  questionStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  questionBubble: {
    backgroundColor: "rgba(22,137,206,0.24)",
    borderColor: "rgba(27,164,226,0.38)",
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  questionBubbleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
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
    fontSize: 14,
    fontWeight: "800",
  },
  answerScroll: {
    flex: 1,
  },
  answerScrollContent: {
    gap: 10,
    paddingBottom: 8,
  },
  answerText: {
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
    color: arColors.primary,
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
  inputRow: {
    alignItems: "flex-end",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    maxHeight: 90,
    paddingVertical: 0,
  },
  inputAction: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.72)",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
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
