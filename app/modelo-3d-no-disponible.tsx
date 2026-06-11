import { arColors, ArSceneBackground } from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Modelo3dNoDisponibleScreen() {
  const insets = useSafeAreaInsets();
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    findArtworkById,
    playArtworkNarration,
    selectArtwork,
  } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;
  const imageSource = getArtworkImageSource(artwork?.image);

  useEffect(() => {
    if (artwork?.id) {
      selectArtwork(artwork.id);
    }
  }, [artwork?.id, selectArtwork]);

  const openArtworkDetail = () => {
    if (!artwork) {
      router.replace("/home" as never);
      return;
    }

    router.push({
      pathname: "/artwork-detail",
      params: { artworkId: artwork.id },
    } as never);
  };

  const openQuestion = () => {
    if (!artwork) {
      return;
    }

    selectArtwork(artwork.id);
    router.push({
      pathname: "/pregunta-voz-modal",
      params: { artworkId: artwork.id },
    } as never);
  };

  const playNarration = () => {
    if (!artwork) {
      return;
    }

    selectArtwork(artwork.id);
    playArtworkNarration(artwork.id);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.34)" />

      <SafeAreaView style={styles.safeArea}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { top: insets.top + 10 },
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
        </Pressable>

        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.imageWrap}>
              {imageSource ? (
                <Image contentFit="cover" source={imageSource} style={styles.artworkImage} />
              ) : (
                <Ionicons color={musePalette.primary} name="image-outline" size={44} />
              )}
              <View style={styles.unavailableBadge}>
                <Ionicons color="#FFFFFF" name="cube-outline" size={24} />
                <View style={styles.badgeSlash} />
              </View>
            </View>

            <Text style={styles.kicker}>OBRA IDENTIFICADA</Text>
            <Text numberOfLines={2} style={styles.title}>
              {artwork?.title ?? "Modelo no disponible"}
            </Text>
            <Text style={styles.subtitle}>
              La obra fue reconocida, pero todavia no tiene un modelo 3D listo para mostrarse en AR.
              Puedes continuar con la mediacion de la visita mientras se prepara el recurso.
            </Text>

            <Pressable
              onPress={openArtworkDetail}
              style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
            >
              <Ionicons color="#03131E" name="document-text-outline" size={20} />
              <Text style={styles.primaryButtonText}>Ver ficha de obra</Text>
            </Pressable>

            <View style={styles.secondaryRow}>
              <Pressable
                onPress={playNarration}
                style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
              >
                <Ionicons color="#FFFFFF" name="volume-high-outline" size={18} />
                <Text style={styles.secondaryButtonText}>Escuchar</Text>
              </Pressable>
              <Pressable
                onPress={openQuestion}
                style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
              >
                <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={18} />
                <Text style={styles.secondaryButtonText}>Preguntar</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.replace("/ar-qr" as never)}
              style={({ pressed }) => [styles.ghostButton, pressed ? styles.pressed : null]}
            >
              <Ionicons color="#FFFFFF" name="qr-code-outline" size={18} />
              <Text style={styles.ghostButtonText}>Escanear otra obra</Text>
            </Pressable>
          </View>
        </View>
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
  backButton: {
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
    paddingHorizontal: 28,
    paddingTop: 72,
  },
  card: {
    alignItems: "center",
    backgroundColor: arColors.glassFillStrong,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 28,
    borderWidth: 1,
    maxWidth: 420,
    padding: 22,
    width: "100%",
  },
  imageWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 22,
    borderWidth: 1,
    height: 164,
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
    width: "100%",
  },
  artworkImage: {
    height: "100%",
    width: "100%",
  },
  unavailableBadge: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.86)",
    borderColor: "rgba(255,255,255,0.26)",
    borderRadius: 999,
    borderWidth: 1,
    bottom: 12,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    width: 48,
  },
  badgeSlash: {
    backgroundColor: "#FFFFFF",
    height: 2,
    position: "absolute",
    transform: [{ rotate: "38deg" }],
    width: 36,
  },
  kicker: {
    color: arColors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 30,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 12,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: arColors.primary,
    borderRadius: 18,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 54,
  },
  primaryButtonText: {
    color: "#03131E",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    width: "100%",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 50,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  ghostButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 48,
    width: "100%",
  },
  ghostButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
