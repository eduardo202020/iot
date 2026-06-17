import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type BleSuggestionCardProps = {
  artworkTitle: string;
  imageSource: ReturnType<typeof getArtworkImageSource>;
  isNarrationPlaying: boolean;
  onAsk: () => void;
  onClose: () => void;
  onExploreOther: () => void;
  onListen: () => void;
  onViewAr: (resourceId?: string) => void;
  resources: {
    id: string;
    modelTitle: string;
    qrCode: string;
    relationLabel: string;
    subtitle: string;
    title: string;
  }[];
};

export function BleSuggestionCard({
  artworkTitle,
  imageSource,
  isNarrationPlaying,
  onAsk,
  onClose,
  onExploreOther,
  onListen,
  onViewAr,
  resources,
}: BleSuggestionCardProps) {
  const primaryResource = resources[0];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.signalMark}>
          <Ionicons color={musePalette.primary} name="radio-outline" size={42} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Obra cercana sugerida</Text>
          <Text style={styles.headerHint}>Zona BLE detectada</Text>
        </View>
        <Pressable
          accessibilityLabel="Cerrar sugerencia"
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="close" size={27} />
        </Pressable>
      </View>

      <View style={styles.body}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="cover"
            contentPosition="center"
            transition={160}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons color={musePalette.primary} name="image-outline" size={26} />
          </View>
        )}

        <View style={styles.copy}>
          <Text numberOfLines={3} style={styles.title}>
            Estas observando {artworkTitle}?
          </Text>
          <Text style={styles.subtitle}>
            La sala reconoce esta zona. Puedes explorar los recursos 3D asociados a la vitrina.
          </Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Pressable
          onPress={onListen}
          style={({ pressed }) => [
            styles.quickAction,
            isNarrationPlaying ? styles.quickActionActive : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons
            color="#FFFFFF"
            name={isNarrationPlaying ? "volume-high" : "volume-high-outline"}
            size={18}
          />
          <Text style={styles.quickActionText}>
            {isNarrationPlaying ? "Narrando" : "Escuchar"}
          </Text>
        </Pressable>
        <Pressable
          onPress={onAsk}
          style={({ pressed }) => [
            styles.quickAction,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={18} />
          <Text style={styles.quickActionText}>Preguntar</Text>
        </Pressable>
      </View>

      {resources.length > 0 ? (
        <View style={styles.resourceSection}>
          <Text style={styles.resourceSectionTitle}>Recursos 3D disponibles</Text>
          {resources.map((resource) => (
            <Pressable
              key={resource.id}
              onPress={() => onViewAr(resource.id)}
              style={({ pressed }) => [
                styles.resourceCard,
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.resourceIcon}>
                <Ionicons color={musePalette.primary} name="cube-outline" size={22} />
              </View>
              <View style={styles.resourceCopy}>
                <View style={styles.resourceTitleRow}>
                  <Text numberOfLines={1} style={styles.resourceTitle}>
                    {resource.title}
                  </Text>
                  <Text style={styles.resourceTag}>{resource.relationLabel}</Text>
                </View>
                <Text numberOfLines={1} style={styles.resourceModelTitle}>
                  {resource.modelTitle}
                </Text>
                <Text numberOfLines={2} style={styles.resourceSubtitle}>
                  {resource.subtitle}
                </Text>
              </View>
              <Ionicons color="#FFFFFF" name="chevron-forward" size={19} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          onPress={() => onViewAr(primaryResource?.id)}
          style={({ pressed }) => [
            styles.primaryAction,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.primaryActionText}>Abrir 3D</Text>
        </Pressable>
        <Pressable
          onPress={onExploreOther}
          style={({ pressed }) => [
            styles.secondaryAction,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.secondaryActionText}>
            No, explorar otras
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    backgroundColor: "rgba(8,10,14,0.86)",
    borderColor: musePalette.primary,
    borderRadius: 24,
    borderWidth: 1.4,
    gap: 14,
    maxWidth: 430,
    minHeight: 340,
    paddingBottom: 20,
    paddingHorizontal: 18,
    paddingTop: 17,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  signalMark: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 14,
    fontWeight: "700",
  },
  headerHint: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  closeButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  body: {
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
  },
  image: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    height: 128,
    overflow: "hidden",
    width: 88,
  },
  imagePlaceholder: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29,
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 21,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  quickActionActive: {
    backgroundColor: "rgba(22,137,206,0.22)",
    borderColor: "rgba(22,137,206,0.52)",
  },
  quickActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  resourceSection: {
    gap: 9,
  },
  resourceSectionTitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  resourceCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 78,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  resourceIcon: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.16)",
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  resourceCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  resourceTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  resourceTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
  },
  resourceTag: {
    backgroundColor: "rgba(22,137,206,0.24)",
    borderColor: "rgba(22,137,206,0.48)",
    borderRadius: 999,
    borderWidth: 1,
    color: "#BFEAFF",
    fontSize: 10,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  resourceModelTitle: {
    color: "#BFEAFF",
    fontSize: 12,
    fontWeight: "800",
  },
  resourceSubtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 13,
    flex: 1,
    justifyContent: "center",
    minHeight: 43,
    paddingHorizontal: 12,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.42)",
    borderRadius: 13,
    borderWidth: 1,
    flex: 1.25,
    justifyContent: "center",
    minHeight: 43,
    paddingHorizontal: 10,
  },
  secondaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
