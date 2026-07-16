import { arColors } from "@/components/museiq/ar-flow";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

type ImmersiveTopControlsProps = {
  onBack: () => void;
  topInset: number;
};

export function ImmersiveTopControls({
  onBack,
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
    </>
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
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
