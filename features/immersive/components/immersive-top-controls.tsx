import { arColors } from "@/components/museiq/ar-flow";
import type { ImmersiveModelKey } from "@/features/immersive/types";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ImmersiveTopControlsProps = {
  activeModelKey: ImmersiveModelKey;
  onBack: () => void;
  onSelectModel: (modelKey: ImmersiveModelKey) => void;
  topInset: number;
};

export function ImmersiveTopControls({
  activeModelKey,
  onBack,
  onSelectModel,
  topInset,
}: ImmersiveTopControlsProps) {
  return (
    <>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          { top: topInset + 10 },
          pressed ? styles.pressed : null,
        ]}
      >
        <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
      </Pressable>
      <View style={[styles.modelToggle, { top: topInset + 10 }]}>
        <ModelToggleOption
          active={activeModelKey === "room"}
          label="Sala"
          onPress={() => onSelectModel("room")}
        />
        <ModelToggleOption
          active={activeModelKey === "clava"}
          label="Clava"
          onPress={() => onSelectModel("clava")}
        />
      </View>
    </>
  );
}

function ModelToggleOption({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modelToggleOption,
        active ? styles.modelToggleOptionActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.modelToggleLabel, active ? styles.modelToggleLabelActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  modelToggle: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.76)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    minHeight: 36,
    padding: 4,
    position: "absolute",
    right: 22,
    zIndex: 32,
  },
  modelToggleOption: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 28,
    minWidth: 58,
    paddingHorizontal: 10,
  },
  modelToggleOptionActive: {
    backgroundColor: arColors.primary,
  },
  modelToggleLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    fontWeight: "900",
  },
  modelToggleLabelActive: {
    color: "#03131E",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
