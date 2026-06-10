import { musePalette } from "@/components/museiq/theme";
import {
  CabezaClavaModelView,
  getCabezaClavaModelAssetForArtwork,
} from "@/components/museiq/cabeza-clava-model-view";
import { getArArtworkExperience } from "@/lib/ar-artwork-experiences";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Image, type ImageProps } from "expo-image";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

export type ArImageSource = ImageProps["source"];

export const arSceneImage = require("@/assets/images/fondo.png");

type ArSceneBackgroundProps = {
  dim?: string;
};

export function ArSceneBackground({ dim = "rgba(5,8,13,0.24)" }: ArSceneBackgroundProps) {
  return (
    <>
      <Image
        contentFit="cover"
        contentPosition="center"
        source={arSceneImage}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: dim }]} />
    </>
  );
}

type ArTopStatusHudProps = {
  museumName: string;
  roomName: string;
  statusLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function ArTopStatusHud({
  museumName,
  roomName,
  statusLabel = "Senal estable",
  style,
}: ArTopStatusHudProps) {
  const navigation = useNavigation();

  return (
    <View style={[styles.topHud, style]}>
      <View style={styles.museumStatusCard}>
        <Ionicons color="#FFFFFF" name="business-outline" size={30} />
        <View style={styles.museumStatusText}>
          <Text numberOfLines={1} style={styles.museumName}>
            {museumName}
          </Text>
          <View style={styles.roomStatusRow}>
            <Text numberOfLines={1} style={styles.roomStatus}>
              {roomName}
            </Text>
            <View style={styles.signalDot} />
            <Text numberOfLines={1} style={styles.signalText}>
              {statusLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.topRightStack}>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={({ pressed }) => [styles.menuButton, pressed ? styles.pressed : null]}
        >
          <Ionicons color="#FFFFFF" name="menu" size={36} />
        </Pressable>
        <View style={styles.bleMiniBadge}>
          <Ionicons color={arColors.primary} name="bluetooth-outline" size={24} />
        </View>
      </View>
    </View>
  );
}

type ArPlainHeaderProps = {
  onBack: () => void;
  onRightPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  title: string;
};

export function ArPlainHeader({
  onBack,
  onRightPress,
  rightIcon = "help-circle-outline",
  title,
}: ArPlainHeaderProps) {
  return (
    <View style={styles.plainHeader}>
      <Pressable onPress={onBack} style={({ pressed }) => [styles.plainIconButton, pressed ? styles.pressed : null]}>
        <Ionicons color="#FFFFFF" name="arrow-back" size={27} />
      </Pressable>
      <Text numberOfLines={1} style={styles.plainHeaderTitle}>
        {title}
      </Text>
      <Pressable
        onPress={onRightPress}
        style={({ pressed }) => [styles.plainIconButton, pressed ? styles.pressed : null]}
      >
        <Ionicons color="#FFFFFF" name={rightIcon} size={26} />
      </Pressable>
    </View>
  );
}

type ArBottomHudProps = {
  bottomIcon?: keyof typeof Ionicons.glyphMap;
  bottomText: string;
  centralActive?: boolean;
  centralIcon?: keyof typeof Ionicons.glyphMap;
  centralLabel: string;
  exploreIcon?: keyof typeof Ionicons.glyphMap;
  exploreLabel?: string;
  hideBottomStatus?: boolean;
  onCentral: () => void;
  onExplore: () => void;
  onQr: () => void;
  progress?: number;
  progressLabel?: string;
  qrLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function ArBottomHud({
  bottomIcon = "information-circle-outline",
  bottomText,
  centralActive = false,
  centralIcon = "sparkles-outline",
  centralLabel,
  exploreIcon = "navigate-outline",
  exploreLabel = "Explorar",
  hideBottomStatus = false,
  onCentral,
  onExplore,
  onQr,
  progress,
  progressLabel,
  qrLabel = "Escanear QR",
  style,
}: ArBottomHudProps) {
  return (
    <View style={[styles.bottomHud, style]}>
      <View style={styles.bottomActionsRow}>
        <HudActionButton icon={exploreIcon} label={exploreLabel} onPress={onExplore} />

        <Pressable
          onPress={onCentral}
          style={({ pressed }) => [
            styles.centralAction,
            centralActive ? styles.centralActionActive : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name={centralIcon} size={51} />
        </Pressable>

        <HudActionButton icon="qr-code-outline" label={qrLabel} onPress={onQr} />
      </View>
      <Text style={[styles.centralActionLabel, centralActive ? styles.centralActionLabelActive : null]}>
        {centralLabel}
      </Text>

      {!hideBottomStatus ? (
        <View style={styles.bottomStatusBar}>
          <Ionicons color={arColors.primary} name={bottomIcon} size={20} />
          <Text numberOfLines={1} style={styles.bottomStatusText}>
            {bottomText}
          </Text>
          {progressLabel ? (
            <Text numberOfLines={1} style={styles.bottomStatusMeta}>
              {progressLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
      {!hideBottomStatus && typeof progress === "number" ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, progress))}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

type HudActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function HudActionButton({ icon, label, onPress }: HudActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.hudAction, pressed ? styles.pressed : null]}
    >
      <Ionicons color="#FFFFFF" name={icon} size={34} />
      <Text style={styles.hudActionLabel}>{label}</Text>
    </Pressable>
  );
}

type ArSideRailProps = {
  active?: "chat" | "audio";
  audioLabel?: string;
  chatLabel?: string;
  showAudio?: boolean;
  showChat?: boolean;
  onAudio: () => void;
  onChat: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ArSideRail({
  active,
  audioLabel = "Audio",
  chatLabel = "Chat",
  showAudio = true,
  showChat = true,
  onAudio,
  onChat,
  style,
}: ArSideRailProps) {
  return (
    <View style={[styles.sideRail, style]}>
      {showChat ? (
        <Pressable
          onPress={onChat}
          style={({ pressed }) => [
            styles.sideButton,
            active === "chat" ? styles.sideButtonActive : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={27} />
          <Text style={styles.sideButtonLabel}>{chatLabel}</Text>
        </Pressable>
      ) : null}
      {showAudio ? (
        <Pressable
          onPress={onAudio}
          style={({ pressed }) => [
            styles.sideButton,
            active === "audio" ? styles.sideButtonActive : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name={active === "audio" ? "volume-high-outline" : "mic-outline"} size={29} />
          <Text style={styles.sideButtonLabel}>{audioLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type ArArtifactModelProps = {
  autoRotate?: boolean;
  artworkId?: string;
  externalRotationY?: number;
  externalZoom?: number;
  imageSource?: ArImageSource;
  introRotationRadians?: number;
  introRotationSpeed?: number;
  interactive?: boolean;
  modelVariant?: "catalog" | "ar";
  onModelStatusChange?: (status: "loading" | "ready" | "error") => void;
  recenterSignal?: number;
  showStatus?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ArArtifactModel({
  autoRotate = true,
  artworkId,
  externalRotationY,
  externalZoom,
  introRotationRadians,
  introRotationSpeed,
  interactive = false,
  modelVariant = "catalog",
  onModelStatusChange,
  recenterSignal = 0,
  showStatus = true,
  style,
}: ArArtifactModelProps) {
  const model =
    modelVariant === "ar"
      ? getArArtworkExperience(artworkId)
      : getCabezaClavaModelAssetForArtwork(artworkId);

  return (
    <View style={[styles.modelWrap, style]}>
      <CabezaClavaModelView
        autoRotate={autoRotate}
        externalRotationY={externalRotationY}
        externalZoom={externalZoom}
        introRotationRadians={introRotationRadians}
        introRotationSpeed={introRotationSpeed}
        interactive={interactive}
        modelAsset={model.asset}
        modelLabel={model.label}
        onModelStatusChange={onModelStatusChange}
        recenterSignal={recenterSignal}
        showStatus={showStatus}
        style={styles.modelCanvas}
      />
    </View>
  );
}

export const arColors = {
  glassBorder: "rgba(255,255,255,0.30)",
  glassFill: "rgba(8,10,14,0.68)",
  glassFillStrong: "rgba(8,10,14,0.94)",
  primary: musePalette.primary,
  primarySoft: "#BFE7FB",
};

const styles = StyleSheet.create({
  topHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  museumStatusCard: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: arColors.glassBorder,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 12,
    maxWidth: 315,
    minHeight: 70,
    paddingHorizontal: 14,
  },
  museumStatusText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  museumName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  roomStatusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  roomStatus: {
    color: "#FFFFFF",
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  signalDot: {
    backgroundColor: arColors.primary,
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  signalText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  topRightStack: {
    alignItems: "center",
    gap: 12,
    marginLeft: 12,
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: arColors.glassBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  bleMiniBadge: {
    alignItems: "center",
    backgroundColor: "rgba(8,10,14,0.58)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 15,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  plainHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  plainIconButton: {
    alignItems: "center",
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  plainHeaderTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  bottomHud: {
    paddingBottom: 18,
    paddingHorizontal: 22,
  },
  bottomActionsRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hudAction: {
    alignItems: "center",
    gap: 9,
    width: 96,
  },
  hudActionLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  centralAction: {
    alignItems: "center",
    backgroundColor: "rgba(8,10,14,0.62)",
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    borderWidth: 2,
    height: 118,
    justifyContent: "center",
    marginBottom: 14,
    width: 118,
  },
  centralActionActive: {
    backgroundColor: "rgba(22,137,206,0.84)",
    borderColor: "rgba(255,255,255,0.52)",
  },
  centralActionLabel: {
    alignSelf: "center",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: -8,
    minHeight: 42,
    textAlign: "center",
    width: 182,
  },
  centralActionLabelActive: {
    color: arColors.primarySoft,
  },
  bottomStatusBar: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.66)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 42,
    paddingHorizontal: 16,
  },
  bottomStatusText: {
    color: "rgba(255,255,255,0.76)",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  bottomStatusMeta: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    height: 4,
    marginHorizontal: 42,
    marginTop: -4,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: arColors.primary,
    height: "100%",
  },
  sideRail: {
    gap: 10,
    position: "absolute",
    right: 22,
    top: "43%",
  },
  sideButton: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: arColors.glassBorder,
    borderRadius: 17,
    borderWidth: 1,
    gap: 7,
    height: 82,
    justifyContent: "center",
    width: 68,
  },
  sideButtonActive: {
    borderColor: arColors.primary,
  },
  sideButtonLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  modelWrap: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
    minHeight: 0,
    overflow: "visible",
    width: "100%",
  },
  modelCanvas: {
    ...StyleSheet.absoluteFillObject,
    overflow: "visible",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
