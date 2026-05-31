import { musePalette } from "@/components/museiq/theme";
import type { RoomImmersiveExperience } from "@/lib/immersive-experience-types";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type HomeImmersiveSheetProps = {
  experiences: RoomImmersiveExperience[];
  onClose: () => void;
  onEnter: (experience: RoomImmersiveExperience) => void;
  roomName: string;
};

export function HomeImmersiveSheet({
  experiences,
  onClose,
  onEnter,
  roomName,
}: HomeImmersiveSheetProps) {
  return (
    <View style={styles.sheetBackdrop}>
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.eyebrow}>Experiencias inmersivas</Text>
        <Text style={styles.title}>Elige un recorrido</Text>
        <Text style={styles.roomName}>{roomName}</Text>
        <Text style={styles.description}>
          Selecciona la reconstruccion 3D que quieres cargar en modo headset.
        </Text>

        <ScrollView
          contentContainerStyle={styles.experienceList}
          showsVerticalScrollIndicator={false}
        >
          {experiences.map((experience) => (
            <Pressable
              key={experience.id}
              onPress={() => onEnter(experience)}
              style={({ pressed }) => [
                styles.experienceCard,
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.experienceIcon}>
                <Ionicons color={musePalette.primary} name="glasses-outline" size={24} />
              </View>
              <View style={styles.experienceContent}>
                <Text style={styles.experienceTitle}>{experience.title}</Text>
                <Text numberOfLines={2} style={styles.experienceDescription}>
                  {experience.description}
                </Text>
                <Text style={styles.experienceModel}>{experience.modelLabel}</Text>
              </View>
              <Ionicons color="rgba(255,255,255,0.64)" name="chevron-forward" size={20} />
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.secondaryButtonText}>Saltar por ahora</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(5,8,13,0.96)",
    borderColor: "rgba(255,255,255,0.18)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    gap: 12,
    maxHeight: "78%",
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 5,
    marginBottom: 8,
    width: 58,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  roomName: {
    color: musePalette.primarySoft,
    fontSize: 16,
    fontWeight: "800",
  },
  description: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  experienceList: {
    gap: 10,
    paddingTop: 4,
  },
  experienceCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 96,
    padding: 14,
  },
  experienceIcon: {
    alignItems: "center",
    backgroundColor: "rgba(54,176,255,0.12)",
    borderColor: "rgba(54,176,255,0.32)",
    borderRadius: 16,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  experienceContent: {
    flex: 1,
    gap: 4,
  },
  experienceTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  experienceDescription: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  experienceModel: {
    color: musePalette.primarySoft,
    fontSize: 11,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
