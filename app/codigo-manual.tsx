import { musePalette } from "@/components/museiq/theme";
import { hasArtworkModelAsset } from "@/lib/artwork-models";
import { getArResourcesForArtwork } from "@/lib/museum-structure";
import { getArtworkQrCode, resolveQrExperienceFromInput } from "@/lib/qr-codes";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CodigoManualScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const {
    artworks,
    currentArtwork,
    currentRoom,
    museumProfile,
    selectArtwork,
  } = useMuseIQ();
  const [manualCode, setManualCode] = useState(code ?? "");
  const [error, setError] = useState("");

  const examples = useMemo(() => {
    const currentExample = currentArtwork ? getArtworkQrCode(currentArtwork) : "";
    const firstExample = artworks[0] ? getArtworkQrCode(artworks[0]) : "";
    const resourceExamples = currentArtwork
      ? getArResourcesForArtwork(currentArtwork.id).map((resource) => resource.qrCode)
      : [];
    return [...new Set([...resourceExamples, currentExample, firstExample].filter(Boolean))].slice(0, 3);
  }, [artworks, currentArtwork]);

  const submitCode = (value = manualCode) => {
    const trimmedCode = value.trim();
    if (!trimmedCode) {
      setError("Ingresa el codigo que aparece junto a la obra.");
      return;
    }

    const qrExperience = resolveQrExperienceFromInput(trimmedCode, artworks);
    if (!qrExperience) {
      router.replace({
        pathname: "/qr-invalido",
        params: { code: trimmedCode },
      } as never);
      return;
    }

    const artwork = qrExperience.artwork;
    selectArtwork(artwork.id);
    router.replace({
      pathname: hasArtworkModelAsset(artwork.id)
        ? "/ar-viro-activo"
        : "/modelo-3d-no-disponible",
      params: {
        artworkId: artwork.id,
        resourceId: qrExperience.resource?.id,
        sourceArtworkId: qrExperience.resource?.parentArtworkId,
      },
    } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={require("@/assets/images/fondo.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <View style={styles.backdrop} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.iconButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#FFFFFF" name="arrow-back" size={27} />
            </Pressable>
            <View style={styles.headerText}>
              <Text numberOfLines={1} style={styles.museumName}>
                {museumProfile?.name ?? "MuseIQ"}
              </Text>
              <Text numberOfLines={1} style={styles.roomName}>
                {currentRoom?.name ?? "Sala por confirmar"}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <View style={styles.heroIcon}>
              <Ionicons color={musePalette.primary} name="keypad-outline" size={58} />
            </View>
            <Text style={styles.title}>Ingresar codigo manualmente</Text>
            <Text style={styles.subtitle}>
              Usa esta opcion si la camara no logra leer el QR o si el codigo esta en una ficha impresa.
            </Text>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Codigo de obra</Text>
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                onChangeText={(value) => {
                  setManualCode(value);
                  setError("");
                }}
                onSubmitEditing={() => submitCode()}
                placeholder="Ej. SALA_2-06-A"
                placeholderTextColor="rgba(255,255,255,0.46)"
                returnKeyType="done"
                style={styles.input}
                value={manualCode}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {examples.length ? (
              <View style={styles.examplesCard}>
                <Text style={styles.examplesTitle}>Codigos de prueba</Text>
                <View style={styles.examplesRow}>
                  {examples.map((example) => (
                    <Pressable
                      key={example}
                      onPress={() => {
                        setManualCode(example);
                        submitCode(example);
                      }}
                      style={({ pressed }) => [
                        styles.exampleChip,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <Text style={styles.exampleText}>{example}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => submitCode()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#FFFFFF" name="scan-outline" size={21} />
              <Text style={styles.primaryButtonText}>Identificar obra</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/home" as never)}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Volver a escanear</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const glassBorder = "rgba(255,255,255,0.26)";
const glassFill = "rgba(8,10,14,0.72)";

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.72)",
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: glassFill,
    borderColor: glassBorder,
    borderRadius: 16,
    borderWidth: 1,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  museumName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  roomName: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.18)",
    borderColor: "rgba(22,137,206,0.44)",
    borderRadius: 34,
    borderWidth: 1,
    height: 104,
    justifyContent: "center",
    marginBottom: 22,
    width: 104,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 32,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 330,
    textAlign: "center",
  },
  inputCard: {
    alignSelf: "stretch",
    backgroundColor: glassFill,
    borderColor: glassBorder,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginTop: 28,
    padding: 16,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  input: {
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 14,
    borderWidth: 1,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    minHeight: 54,
    paddingHorizontal: 14,
  },
  errorText: {
    color: "#FFB5AA",
    fontSize: 13,
    fontWeight: "700",
  },
  examplesCard: {
    alignSelf: "stretch",
    gap: 10,
    marginTop: 14,
  },
  examplesTitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  examplesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  exampleChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  exampleText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  actions: {
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.30)",
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
