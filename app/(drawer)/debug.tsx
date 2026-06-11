import { musePalette } from "@/components/museiq/theme";
import { useBleScanner } from "@/hooks/use-ble-scanner";
import { useHomeSensors } from "@/hooks/use-home-sensors";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DebugScreen() {
  const {
    currentArtwork,
    debugModeEnabled,
    homeQuickActionsVisible,
    refreshAnalyticsSummary,
    resetVisitorExperience,
    setDebugModeEnabled,
    setHomeQuickActionsVisible,
  } = useMuseIQ();
  const { beacons, error, isScanning, startScanning, stopScanning } = useBleScanner();
  const {
    accelerometerStatus,
    compassStatus,
    headingState,
    movementState,
    stepCount,
    stepCountStatus,
  } = useHomeSensors();

  useEffect(() => {
    refreshAnalyticsSummary().catch(() => undefined);
    return () => {
      stopScanning();
    };
  }, [refreshAnalyticsSummary, stopScanning]);

  const confirmReset = () => {
    Alert.alert(
      "Limpiar cache y datos locales",
      "Se borrara la memoria conversacional, el progreso y las preferencias del visitante.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpiar",
          style: "destructive",
          onPress: () => resetVisitorExperience().catch(() => undefined),
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <Header title="Modo tecnico" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIcon}>
                <Ionicons color={musePalette.primary} name="shield-checkmark-outline" size={28} />
              </View>
              <View style={styles.statusCopy}>
                <Text style={styles.statusTitle}>Estado del sistema</Text>
                <Text style={styles.statusText}>
                  {error ? "Revisar modulo Bluetooth" : "Todo funcionando correctamente"}
                </Text>
              </View>
              <Ionicons color={error ? musePalette.danger : musePalette.primary} name={error ? "alert-circle-outline" : "checkmark-circle-outline"} size={25} />
            </View>

            <SystemRow icon="earth-outline" label="Conexion a internet" value="Conectado" />
            <SystemRow
              icon="bluetooth-outline"
              label="Bluetooth"
              value={error ? "Revisar permisos" : "Conectado - Senal estable"}
            />
            <SystemRow icon="sparkles-outline" label="Servicios de IA (MuseRAG)" value="Operativo" />
            <SystemRow icon="cube-outline" label="Modelos 3D" value="Listos" />

            <Pressable
              onPress={() => {
                if (isScanning) {
                  stopScanning();
                  return;
                }
                startScanning().catch(() => undefined);
              }}
              style={({ pressed }) => [
                styles.diagnosticButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#FFFFFF" name="pulse-outline" size={18} />
              <Text style={styles.diagnosticText}>
                {isScanning ? "Detener diagnostico" : "Ejecutar diagnostico"}
              </Text>
            </Pressable>
          </View>

          <Section title="Informacion del dispositivo">
            <InfoRow label="Dispositivo" value="Dispositivo MuseIQ" />
            <InfoRow label="Sistema operativo" value="React Native / Expo" />
            <InfoRow label="Version de la app" value="1.0.0 (100)" />
            <InfoRow label="ID de dispositivo" value="A1B2-C3D4-E5F6" />
            <InfoRow label="Movimiento" value={movementState} />
            <InfoRow
              label="Sensores"
              value={`${accelerometerStatus}, ${compassStatus}${headingState ? `, ${headingState}` : ""}`}
            />
            <InfoRow
              label="Pasos"
              value={`${stepCountStatus}${stepCount !== null ? ` - ${stepCount}` : ""}`}
              last
            />
          </Section>

          <Section title="Herramientas para desarrolladores">
            <ToolRow label="Mostrar logs" />
            <ToolRow
              label="Modo desarrollador"
              onToggle={() => setDebugModeEnabled(!debugModeEnabled)}
              value={debugModeEnabled}
            />
            <ToolRow
              label="Mostrar botones"
              onToggle={() => setHomeQuickActionsVisible(!homeQuickActionsVisible)}
              value={homeQuickActionsVisible}
            />
            <DevNavRow
              icon="phone-portrait-outline"
              label="Simular sala (BLE)"
              value={beacons[0]?.roomId ?? currentArtwork?.roomId ?? "Desactivado"}
            />
            <DevNavRow icon="refresh-outline" label="Recargar recursos" value={isScanning ? "Escaneando" : ""} last />
          </Section>

          <Pressable
            onPress={confirmReset}
            style={({ pressed }) => [
              styles.resetButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color={musePalette.danger} name="trash-outline" size={20} />
            <Text style={styles.resetText}>Limpiar cache y datos locales</Text>
          </Pressable>

          <View style={styles.warningCard}>
            <Ionicons color={musePalette.primary} name="information-circle-outline" size={22} />
            <Text style={styles.warningText}>
              Estas opciones son para uso avanzado. Pueden afectar el rendimiento de la aplicacion.
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

function SystemRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.systemRow}>
      <Ionicons color="#FFFFFF" name={icon} size={17} />
      <Text style={styles.systemLabel}>{label}</Text>
      <Text style={styles.systemValue}>{value}</Text>
    </View>
  );
}

function Section({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function InfoRow({ label, last, value }: { label: string; last?: boolean; value: string }) {
  return (
    <View style={[styles.infoRow, last ? styles.rowLast : null]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ToolRow({
  label,
  onToggle,
  value = false,
}: {
  label: string;
  onToggle?: () => void;
  value?: boolean;
}) {
  return (
    <View style={styles.toolRow}>
      <Text style={styles.toolLabel}>{label}</Text>
      <Switch
        onValueChange={onToggle}
        thumbColor="#D6D6D6"
        trackColor={{ false: "rgba(255,255,255,0.18)", true: "rgba(22,137,206,0.48)" }}
        value={value}
      />
    </View>
  );
}

function DevNavRow({
  icon,
  label,
  last,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
  value: string;
}) {
  return (
    <View style={[styles.devRow, last ? styles.rowLast : null]}>
      <Ionicons color="#FFFFFF" name={icon} size={18} />
      <Text style={styles.devLabel}>{label}</Text>
      <Text style={styles.devValue}>{value}</Text>
      <Ionicons color="#FFFFFF" name="chevron-forward" size={18} />
    </View>
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
    gap: 16,
    paddingBottom: 34,
    paddingHorizontal: 22,
  },
  statusCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  statusHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
    marginBottom: 12,
  },
  statusIcon: {
    alignItems: "center",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  statusCopy: {
    flex: 1,
    gap: 3,
  },
  statusTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  statusText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 12,
    fontWeight: "600",
  },
  systemRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    minHeight: 28,
  },
  systemLabel: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  systemValue: {
    color: musePalette.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  diagnosticButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.42)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 40,
  },
  diagnosticText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: musePalette.primary,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.10)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: "rgba(255,255,255,0.70)",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  infoValue: {
    color: "rgba(255,255,255,0.78)",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  toolRow: {
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.10)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 50,
    paddingHorizontal: 14,
  },
  toolLabel: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  devRow: {
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.10)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 10,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  devLabel: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  devValue: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    fontWeight: "600",
  },
  resetButton: {
    alignItems: "center",
    borderColor: musePalette.danger,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 44,
  },
  resetText: {
    color: musePalette.danger,
    fontSize: 14,
    fontWeight: "900",
  },
  warningCard: {
    alignItems: "center",
    borderColor: "rgba(22,137,206,0.44)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
  },
  warningText: {
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
