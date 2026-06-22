import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image, type ImageSource } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MuseumOption = {
  id: string;
  image: ImageSource;
  location: string;
  name: string;
  selected?: boolean;
};

export default function SeleccionarMuseoScreen() {
  const { isDatabaseReady, museumProfile } = useMuseIQ();

  const museumOptions: MuseumOption[] = [
    {
      id: museumProfile?.id ?? "museiq_peru",
      image: require("@/assets/images/fondo.png"),
      location: `${museumProfile?.city ?? "Trujillo"}, ${museumProfile?.country ?? "Peru"}`,
      name: museumProfile?.name ?? "MuseIQ Peru",
      selected: true,
    },
    {
      id: "museo-nacional-chavin",
      image: require("@/assets/images/artworks/mvp-selected/05-botella-chavin-204002.png"),
      location: "Ancash, Peru",
      name: "Museo Nacional Chavin",
    },
    {
      id: "museo-sitio-ollantaytambo",
      image: require("@/assets/images/artworks/mvp-selected/03-aribalo-inca.png"),
      location: "Cusco, Peru",
      name: "Museo de Sitio Ollantaytambo",
    },
    {
      id: "museo-larco",
      image: require("@/assets/images/artworks/mvp-selected/01-musico-moche.png"),
      location: "Lima, Peru",
      name: "Museo Larco",
    },
  ];

  const continueToVisit = () => {
    if (!isDatabaseReady) {
      return;
    }

    router.push("/preparacion-visita" as never);
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
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#FFFFFF" name="arrow-back" size={27} />
          </Pressable>
          <Text style={styles.title}>Selecciona tu museo</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle}>Elige el museo que vas a visitar</Text>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {museumOptions.map((museum) => (
            <Pressable
              key={museum.id}
              onPress={museum.selected ? continueToVisit : undefined}
              style={({ pressed }) => [
                styles.museumCard,
                museum.selected ? styles.museumCardSelected : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Image
                source={museum.image}
                style={styles.museumImage}
                contentFit="cover"
              />
              <View style={styles.museumInfo}>
                <Text numberOfLines={3} style={styles.museumName}>
                  {museum.name}
                </Text>
                <Text style={styles.location}>{museum.location}</Text>
              </View>
              <View style={styles.cardAction}>
                {museum.selected ? (
                  <View style={styles.selectedIcon}>
                    <Ionicons
                      color={musePalette.primary}
                      name="checkmark"
                      size={23}
                    />
                  </View>
                ) : (
                  <Ionicons color="#FFFFFF" name="chevron-forward" size={25} />
                )}
              </View>
            </Pressable>
          ))}

          <View style={styles.emptyStateCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                color="rgba(255,255,255,0.78)"
                name="information"
                size={24}
              />
            </View>
            <View style={styles.emptyTextBlock}>
              <Text style={styles.emptyTitle}>¿No encuentras tu museo?</Text>
              <Text style={styles.emptyCopy}>
                En futuras actualizaciones incorporaremos mas museos.
              </Text>
            </View>
            <View style={styles.museumIcon}>
              <Ionicons
                color={musePalette.primary}
                name="business-outline"
                size={27}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.86)",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 20,
    textAlign: "center",
  },
  list: {
    gap: 14,
    paddingBottom: 36,
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  museumCard: {
    alignItems: "center",
    backgroundColor: "rgba(8,14,20,0.72)",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 118,
    overflow: "hidden",
  },
  museumCardSelected: {
    borderColor: musePalette.primary,
    borderWidth: 1.4,
  },
  museumImage: {
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.08)",
    width: "46%",
  },
  museumInfo: {
    flex: 1,
    gap: 7,
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  museumName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25,
  },
  location: {
    color: musePalette.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  cardAction: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 14,
  },
  selectedIcon: {
    alignItems: "center",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 2,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  emptyStateCard: {
    alignItems: "center",
    backgroundColor: "rgba(8,14,20,0.72)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 96,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  infoIcon: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.54)",
    borderRadius: 999,
    borderWidth: 1.5,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  emptyTextBlock: {
    flex: 1,
    gap: 4,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyCopy: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  museumIcon: {
    alignItems: "center",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  pressed: {
    opacity: 0.82,
  },
});
