import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

type HomeTopHudProps = {
  homeQuickActionsVisible: boolean;
  isArtworkNarrationPlaying: boolean;
  onOpenArMvp: () => void;
  onOpenImmersiveTest: () => void;
  onOpenDrawer: () => void;
  onRepeatArtworkNarration: () => void;
  topRoomLabel: string;
};

type HomeBottomHudProps = {
  centralLabel: string;
  onCentralAction: () => void;
  onExplore: () => void;
  onOpenQr: () => void;
  shouldShowSuggestionCta: boolean;
};

type HudActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

function HudActionButton({ icon, label, onPress, style }: HudActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.hudAction, style, pressed ? styles.pressed : null]}
    >
      <Ionicons color="#FFFFFF" name={icon} size={38} />
      <Text style={styles.hudActionLabel}>{label}</Text>
    </Pressable>
  );
}

export function HomeTopHud({
  homeQuickActionsVisible,
  isArtworkNarrationPlaying,
  onOpenArMvp,
  onOpenImmersiveTest,
  onOpenDrawer,
  onRepeatArtworkNarration,
  topRoomLabel,
}: HomeTopHudProps) {
  return (
    <View style={styles.topHud}>
      <View pointerEvents="none" style={styles.topHudCenter}>
        <Text numberOfLines={1} style={styles.topHudRoomLabel}>
          {topRoomLabel}
        </Text>
      </View>

      <Pressable
        onPress={onOpenDrawer}
        style={({ pressed }) => [styles.menuButton, pressed ? styles.pressed : null]}
      >
        <Ionicons color="#FFFFFF" name="menu" size={38} />
      </Pressable>

      {homeQuickActionsVisible ? (
        <View style={styles.topHudRightStack}>
          <Pressable
            onPress={onRepeatArtworkNarration}
            style={({ pressed }) => [
              styles.sideButton,
              isArtworkNarrationPlaying ? styles.sideButtonActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              color="#FFFFFF"
              name={isArtworkNarrationPlaying ? "volume-mute-outline" : "mic-outline"}
              size={26}
            />
            <Text style={styles.sideButtonLabel}>Audio</Text>
          </Pressable>

          <Pressable
            onPress={onOpenImmersiveTest}
            style={({ pressed }) => [
              styles.sideButton,
              styles.immersiveTestButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#FFFFFF" name="glasses-outline" size={24} />
          </Pressable>

          <Pressable
            onPress={onOpenArMvp}
            style={({ pressed }) => [
              styles.sideButton,
              styles.arTestButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#FFFFFF" name="cube-outline" size={23} />
            <Text style={styles.compactSideButtonLabel}>AR</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.topHudRightPlaceholder} />
      )}
    </View>
  );
}

export function HomeBottomHud({
  centralLabel,
  onCentralAction,
  onExplore,
  onOpenQr,
  shouldShowSuggestionCta,
}: HomeBottomHudProps) {
  const isImmersiveAction = centralLabel === "Entrar VR";

  return (
    <View style={styles.bottomHud}>
      <View style={styles.bottomActionsRow}>
        <HudActionButton icon="navigate-outline" label="Explorar" onPress={onExplore} />

        <Pressable
          onPress={onCentralAction}
          style={({ pressed }) => [
            styles.centralAction,
            shouldShowSuggestionCta ? styles.centralActionSuggested : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons
            color={shouldShowSuggestionCta ? musePalette.primary : "#FFFFFF"}
            name={isImmersiveAction ? "glasses-outline" : "sparkles-outline"}
            size={44}
          />
        </Pressable>

        <HudActionButton icon="qr-code-outline" label="Escanear QR" onPress={onOpenQr} />
      </View>
      <Text
        style={[
          styles.centralActionLabel,
          shouldShowSuggestionCta ? styles.centralActionLabelSuggested : null,
        ]}
      >
        {centralLabel}
      </Text>
    </View>
  );
}

const glassBorder = "rgba(255,255,255,0.34)";
const glassFill = "rgba(8,10,14,0.58)";

const styles = StyleSheet.create({
  topHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  topHudCenter: {
    alignItems: "center",
    justifyContent: "center",
    left: 92,
    position: "absolute",
    right: 92,
    top: 14,
  },
  topHudRightStack: {
    alignItems: "center",
    gap: 10,
  },
  topHudRightPlaceholder: {
    width: 66,
  },
  topHudRoomLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    minHeight: 36,
    paddingHorizontal: 12,
    paddingTop: 8,
    textAlign: "center",
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: glassFill,
    borderColor: glassBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 66,
    justifyContent: "center",
    width: 66,
  },
  sideButton: {
    alignItems: "center",
    backgroundColor: glassFill,
    borderColor: glassBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
    height: 66,
    justifyContent: "center",
    width: 66,
  },
  immersiveTestButton: {
    gap: 0,
  },
  arTestButton: {
    gap: 3,
  },
  sideButtonActive: {
    borderColor: musePalette.primary,
  },
  sideButtonLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  compactSideButtonLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  bottomHud: {
    paddingBottom: 12,
    paddingHorizontal: 22,
  },
  bottomActionsRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hudAction: {
    alignItems: "center",
    gap: 10,
    width: 98,
  },
  hudActionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  centralAction: {
    alignItems: "center",
    backgroundColor: "rgba(10,12,16,0.48)",
    borderColor: "rgba(255,255,255,0.72)",
    borderRadius: 999,
    borderWidth: 1.5,
    height: 104,
    justifyContent: "center",
    marginBottom: 10,
    width: 104,
  },
  centralActionSuggested: {
    backgroundColor: "rgba(5,8,13,0.52)",
    borderColor: "rgba(255,255,255,0.86)",
  },
  centralActionLabel: {
    alignSelf: "center",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: -1,
    minHeight: 34,
    textAlign: "center",
    width: 170,
  },
  centralActionLabelSuggested: {
    color: musePalette.primary,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
