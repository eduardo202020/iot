import { arColors } from "@/components/museiq/ar-flow";
import { StyleSheet, Text, View } from "react-native";

type HeadsetCountdownOverlayProps = {
  countdown: number;
};

export function HeadsetCountdownOverlay({ countdown }: HeadsetCountdownOverlayProps) {
  return (
    <View pointerEvents="none" style={styles.headsetCountdownOverlay}>
      <View style={styles.headsetCountdownCard}>
        <Text style={styles.headsetCountdownKicker}>Prepara el visor</Text>
        <Text style={styles.headsetCountdownNumber}>{countdown}</Text>
        <Text style={styles.headsetCountdownText}>
          Ponte el headset. El recorrido iniciara automaticamente.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headsetCountdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.42)",
    justifyContent: "center",
    zIndex: 24,
  },
  headsetCountdownCard: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.84)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 28,
    borderWidth: 1,
    gap: 8,
    maxWidth: 280,
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  headsetCountdownKicker: {
    color: arColors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  headsetCountdownNumber: {
    color: "#FFFFFF",
    fontSize: 58,
    fontWeight: "900",
    lineHeight: 64,
  },
  headsetCountdownText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    textAlign: "center",
  },
});
