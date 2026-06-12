import { BleSuggestionCard } from "@/components/museiq/home/ble-suggestion-card";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type HomeSceneStateProps = {
  isImmersiveRoom: boolean;
  isRoomDetected: boolean;
  isSuggestionVisible: boolean;
  onCloseSuggestion: () => void;
  onExploreOtherSuggestions: () => void;
  onViewSuggestedAr: (resourceId?: string) => void;
  roomName: string;
  shouldShowSuggestionCta: boolean;
  suggestedArtwork?: {
    title: string;
  };
  suggestedArtworkImageSource: ReturnType<typeof import("@/lib/artwork-images").getArtworkImageSource>;
  suggestedArtworkResources: {
    id: string;
    modelTitle: string;
    qrCode: string;
    relationLabel: string;
    subtitle: string;
    title: string;
  }[];
};

export function HomeSceneState({
  isImmersiveRoom,
  isRoomDetected,
  isSuggestionVisible,
  onCloseSuggestion,
  onExploreOtherSuggestions,
  onViewSuggestedAr,
  roomName,
  shouldShowSuggestionCta,
  suggestedArtwork,
  suggestedArtworkImageSource,
  suggestedArtworkResources,
}: HomeSceneStateProps) {
  if (
    !isImmersiveRoom &&
    isSuggestionVisible &&
    shouldShowSuggestionCta &&
    suggestedArtwork
  ) {
    return (
      <View style={styles.sceneLayer}>
        <BleSuggestionCard
          artworkTitle={suggestedArtwork.title}
          imageSource={suggestedArtworkImageSource}
          onClose={onCloseSuggestion}
          onExploreOther={onExploreOtherSuggestions}
          onViewAr={onViewSuggestedAr}
          resources={suggestedArtworkResources}
        />
      </View>
    );
  }

  if (isRoomDetected && isImmersiveRoom) {
    return (
      <View style={styles.sceneLayer}>
        <View style={styles.roomDetectedCard}>
          <Ionicons color="#FFFFFF" name="glasses-outline" size={52} />
          <View style={styles.roomDetectedCopy}>
            <Text style={styles.roomDetectedEyebrow}>Sala inmersiva</Text>
            <Text style={styles.roomDetectedTitle}>{roomName}</Text>
            <Text style={styles.roomDetectedText}>
              Esta sala activa el modo VR. Usa Entrar VR para elegir una experiencia.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (isRoomDetected) {
    return (
      <View style={styles.sceneLayer}>
        <View style={styles.roomDetectedCard}>
          <Ionicons color="#FFFFFF" name="location-outline" size={52} />
          <View style={styles.roomDetectedCopy}>
            <Text style={styles.roomDetectedEyebrow}>Estas en</Text>
            <Text style={styles.roomDetectedTitle}>{roomName}</Text>
            <Text style={styles.roomDetectedText}>
              Explora las obras o escanea un QR para ver material 3D.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.sceneLayer}>
      <View style={styles.searchingCard}>
        <Ionicons color="#FFFFFF" name="radio-outline" size={72} />
        <Text style={styles.searchingTitle}>Escanea el QR de una obra para iniciar</Text>
        <Text style={styles.searchingText}>
          La deteccion por Bluetooth queda pausada mientras terminamos el flujo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sceneLayer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  searchingCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(22,24,28,0.72)",
    borderColor: "rgba(255,255,255,0.32)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    maxWidth: 260,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  searchingTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 27,
    textAlign: "center",
  },
  searchingText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 21,
    textAlign: "center",
  },
  roomDetectedCard: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(8,10,14,0.74)",
    borderColor: "rgba(255,255,255,0.26)",
    borderLeftColor: "#1689CE",
    borderLeftWidth: 2,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 18,
    marginLeft: 44,
    marginTop: 40,
    maxWidth: 300,
    minHeight: 132,
    paddingHorizontal: 24,
  },
  roomDetectedCopy: {
    flex: 1,
    gap: 6,
  },
  roomDetectedEyebrow: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  roomDetectedTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  roomDetectedText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
});
