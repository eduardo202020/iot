import { arColors } from "@/components/museiq/ar-flow";
import type { MotionPermissionState } from "@/features/immersive/types";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type MotionPermissionOverlayProps = {
  motionPermissionState: MotionPermissionState;
  onRequestMotionPermission: () => void;
};

export function MotionPermissionOverlay({
  motionPermissionState,
  onRequestMotionPermission,
}: MotionPermissionOverlayProps) {
  if (motionPermissionState === "granted") {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.permissionOverlay}>
      <View style={styles.permissionCard}>
        <Text style={styles.permissionTitle}>Permiso de movimiento</Text>
        <Text style={styles.permissionBody}>{getPermissionMessage(motionPermissionState)}</Text>
        {motionPermissionState === "checking" ? (
          <ActivityIndicator color={arColors.primary} size="small" />
        ) : motionPermissionState === "prompt" ? (
          <Pressable
            onPress={onRequestMotionPermission}
            style={({ pressed }) => [styles.permissionButton, pressed ? styles.pressed : null]}
          >
            <Ionicons color="#03131E" name="compass-outline" size={18} />
            <Text style={styles.permissionButtonLabel}>Activar movimiento</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function getPermissionMessage(motionPermissionState: MotionPermissionState) {
  if (motionPermissionState === "checking") {
    return "Verificando sensores para activar el visor inmersivo.";
  }

  if (motionPermissionState === "blocked") {
    return "El permiso fue bloqueado. Activalo desde ajustes para mover la vista con tu cabeza.";
  }

  if (motionPermissionState === "unavailable") {
    return "Este dispositivo no expone Device Motion, Gyroscope ni el combo Accelerometer + Magnetometer para la experiencia inmersiva.";
  }

  return "Activa el permiso de movimiento para que el visor responda a tu cabeza en Android.";
}

const styles = StyleSheet.create({
  permissionOverlay: {
    alignItems: "center",
    bottom: 28,
    left: 18,
    position: "absolute",
    right: 18,
    zIndex: 40,
  },
  permissionCard: {
    alignItems: "center",
    backgroundColor: "rgba(7,10,15,0.9)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    maxWidth: 480,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: "100%",
  },
  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  permissionBody: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    textAlign: "center",
  },
  permissionButton: {
    alignItems: "center",
    backgroundColor: arColors.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 18,
  },
  permissionButtonLabel: {
    color: "#03131E",
    fontSize: 14,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
