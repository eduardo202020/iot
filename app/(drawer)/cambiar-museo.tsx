import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image, type ImageSource } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MuseumOption = {
  city: string;
  image: ImageSource;
  name: string;
  status: string;
};

const museumOptions: MuseumOption[] = [
  {
    city: "Ancash, Peru",
    image: require("@/assets/images/fondo.png"),
    name: "Museo Nacional Chavin",
    status: "Sala Litica  -  Senal estable",
  },
  {
    city: "Cusco, Peru",
    image: require("@/assets/images/artworks/mvp-selected/03-aribalo-inca.png"),
    name: "Museo de Sitio Ollantaytambo",
    status: "Disponible proximamente",
  },
  {
    city: "Lima, Peru",
    image: require("@/assets/images/artworks/mvp-selected/01-musico-moche.png"),
    name: "Museo Larco",
    status: "Disponible proximamente",
  },
  {
    city: "Lambayeque, Peru",
    image: require("@/assets/images/artworks/mvp-selected/02-botella-chimu-lambayeque.png"),
    name: "Museo Tumbas Reales de Sipan",
    status: "Disponible proximamente",
  },
];

export default function CambiarMuseoScreen() {
  const { museumProfile } = useMuseIQ();
  const currentMuseum = museumOptions[0];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <Header title="Cambiar museo" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchBox}>
            <Ionicons color="rgba(255,255,255,0.68)" name="search-outline" size={20} />
            <TextInput
              editable={false}
              placeholder="Buscar museo o ubicacion"
              placeholderTextColor="rgba(255,255,255,0.50)"
              style={styles.searchInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Museo actual</Text>
            <MuseumCard
              current
              museum={{
                ...currentMuseum,
                city: `${museumProfile?.city ?? "Ancash"}, ${museumProfile?.country ?? "Peru"}`,
                name: museumProfile?.name ?? currentMuseum.name,
              }}
              onPress={() => router.replace("/home" as never)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Otros museos disponibles</Text>
            <View style={styles.list}>
              {museumOptions.slice(1).map((museum) => (
                <MuseumCard
                  key={museum.name}
                  museum={museum}
                  onPress={() => router.push("/seleccionar-museo" as never)}
                />
              ))}
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons color={musePalette.primary} name="information" size={19} />
            </View>
            <Text style={styles.infoText}>
              Al cambiar de museo, se reiniciara la deteccion de salas y las sugerencias por BLE.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.headerButton}>
        <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerButton} />
    </View>
  );
}

function MuseumCard({
  current,
  museum,
  onPress,
}: {
  current?: boolean;
  museum: MuseumOption;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.museumCard,
        current ? styles.museumCardCurrent : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Image contentFit="cover" source={museum.image} style={styles.museumImage} />
      <View style={styles.museumCopy}>
        <View style={styles.museumNameRow}>
          <Text numberOfLines={2} style={styles.museumName}>{museum.name}</Text>
          {current ? <Text style={styles.currentBadge}>Actual</Text> : null}
        </View>
        <Text numberOfLines={1} style={styles.museumCity}>{museum.city}</Text>
        <Text numberOfLines={1} style={styles.museumStatus}>{museum.status}</Text>
      </View>
      {current ? (
        <View style={styles.selectedIcon}>
          <Ionicons color={musePalette.primary} name="checkmark" size={19} />
        </View>
      ) : (
        <Ionicons color="#FFFFFF" name="chevron-forward" size={22} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#02070B",
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 68,
    paddingHorizontal: 22,
  },
  headerButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  headerTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  content: {
    gap: 18,
    paddingBottom: 34,
    paddingHorizontal: 22,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 13,
  },
  searchInput: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    gap: 9,
  },
  sectionTitle: {
    color: musePalette.primary,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  list: {
    gap: 12,
  },
  museumCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 108,
    overflow: "hidden",
    padding: 10,
  },
  museumCardCurrent: {
    backgroundColor: "rgba(22,137,206,0.11)",
    borderColor: musePalette.primary,
  },
  museumImage: {
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    width: 112,
  },
  museumCopy: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  museumNameRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
  },
  museumName: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  currentBadge: {
    backgroundColor: "rgba(22,137,206,0.16)",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 1,
    color: musePalette.primary,
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  museumCity: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  museumStatus: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "700",
  },
  selectedIcon: {
    alignItems: "center",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  infoCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 14,
  },
  infoIcon: {
    alignItems: "center",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  infoText: {
    color: "rgba(255,255,255,0.70)",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.84,
  },
});
