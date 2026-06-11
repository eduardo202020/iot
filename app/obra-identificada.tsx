import {
  ArBottomHud,
  ArSceneBackground,
  ArSideRail,
  arColors,
  arSceneImage,
} from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { hasArtworkModelAsset } from "@/lib/artwork-models";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

function getCultureLabel(period?: string, author?: string) {
  const source = `${period ?? ""} ${author ?? ""}`.toLowerCase();
  if (source.includes("moche") || source.includes("sipan")) {
    return "Cultura Moche";
  }
  if (source.includes("lambayeque")) {
    return "Cultura Lambayeque";
  }
  return author || "Cultura por confirmar";
}

export default function ObraIdentificadaScreen() {
  const insets = useSafeAreaInsets();
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    findArtworkById,
    playArtworkNarration,
    selectArtwork,
  } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;

  useEffect(() => {
    if (artwork?.id) {
      selectArtwork(artwork.id);
    }
  }, [artwork?.id, selectArtwork]);

  if (!artwork) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <Pressable onPress={() => router.back()} style={styles.backOnly}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
          </Pressable>
          <View style={styles.emptyState}>
            <Ionicons color={musePalette.primary} name="scan-outline" size={42} />
            <Text style={styles.emptyTitle}>Obra no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const imageSource = getArtworkImageSource(artwork.image);
  const cultureLabel = getCultureLabel(artwork.period, artwork.author);

  const openArLoading = () => {
    selectArtwork(artwork.id);
    router.push({
      pathname: hasArtworkModelAsset(artwork.id)
        ? "/ar-viro-activo"
        : "/modelo-3d-no-disponible",
      params: { artworkId: artwork.id },
    } as never);
  };

  const openQuestion = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/pregunta-voz-modal", params: { artworkId: artwork.id } } as never);
  };

  const playNarration = () => {
    selectArtwork(artwork.id);
    playArtworkNarration(artwork.id);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.28)" />

      <SafeAreaView style={styles.safeArea}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.topBackButton,
            { top: insets.top + 10 },
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.identificationCard}>
            <Image
              contentFit="cover"
              contentPosition="center"
              source={imageSource ?? arSceneImage}
              style={styles.artworkThumb}
            />
            <View style={styles.identificationCopy}>
              <Text numberOfLines={2} style={styles.artworkTitle}>
                {artwork.title}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {cultureLabel}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {artwork.year}
              </Text>
              <Text numberOfLines={3} style={styles.summary}>
                {artwork.summary}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.secondaryActionsRow}>
              <Pressable
                onPress={playNarration}
                style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
              >
                <Ionicons color="#FFFFFF" name="volume-high-outline" size={19} />
                <Text style={styles.secondaryButtonText}>Escuchar</Text>
              </Pressable>
              <Pressable
                onPress={openQuestion}
                style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
              >
                <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={19} />
                <Text style={styles.secondaryButtonText}>Preguntar</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={openArLoading}
              style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
            >
              <Text style={styles.primaryButtonText}>Ver en AR</Text>
            </Pressable>
          </View>
        </View>

        <ArSideRail
          chatLabel="Preguntar"
          onAudio={playNarration}
          onChat={openQuestion}
          style={[styles.sideRail, { top: insets.top + 10 }]}
        />

        <ArBottomHud
          bottomIcon="information-circle-outline"
          bottomText="Consejo: puedes escuchar una explicacion de esta obra."
          centralActive
          centralLabel="Ver en AR"
          hideBottomStatus
          onCentral={openArLoading}
          onExplore={() => router.push("/home" as never)}
          onQr={() => router.push("/home" as never)}
        />
      </SafeAreaView>
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
  topBackButton: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: arColors.glassBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    left: 22,
    position: "absolute",
    width: 58,
    zIndex: 30,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 34,
    paddingTop: 94,
  },
  identificationCard: {
    backgroundColor: arColors.glassFillStrong,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 18,
    maxWidth: 520,
    minHeight: 224,
    padding: 18,
    width: "100%",
  },
  artworkThumb: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    height: 188,
    width: 132,
  },
  identificationCopy: {
    flex: 1,
    gap: 6,
    justifyContent: "center",
    minWidth: 0,
  },
  artworkTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  meta: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
  },
  summary: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 19,
    marginTop: 6,
  },
  actionRow: {
    gap: 12,
    marginTop: 16,
    width: "100%",
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: arColors.primary,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 52,
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  sideRail: {
    right: 22,
    zIndex: 20,
  },
  backOnly: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    marginLeft: 14,
    marginTop: 8,
    width: 50,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
