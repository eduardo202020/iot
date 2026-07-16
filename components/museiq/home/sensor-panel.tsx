import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type SensorBeaconReading = {
  id: string;
  label: string;
  rssi: number;
};

type SensorPanelProps = {
  accelerometerStatus: string;
  beaconReadings: SensorBeaconReading[];
  bleStatus: string;
  compassStatus: string;
  headingState: string | null;
  isOpen: boolean;
  movementState: string;
  manualZoneLabel: string;
  isManualZoneActive: boolean;
  onNextManualZone: () => void;
  onPreviousManualZone: () => void;
  onUsePhysicalBeacon: () => void;
  onToggle: () => void;
  stepCount: number | null;
  stepCountStatus: string;
};

export function SensorPanel({
  accelerometerStatus,
  beaconReadings,
  bleStatus,
  compassStatus,
  headingState,
  isOpen,
  isManualZoneActive,
  movementState,
  manualZoneLabel,
  onNextManualZone,
  onPreviousManualZone,
  onToggle,
  onUsePhysicalBeacon,
  stepCount,
  stepCountStatus,
}: SensorPanelProps) {
  const hasBeacons = beaconReadings.length > 0;

  return (
    <View style={styles.wrap}>
      {isOpen ? (
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View style={styles.panelTitleGroup}>
              <Ionicons color="#74D5FF" name="hardware-chip-outline" size={17} />
              <Text style={styles.panelTitle}>Modo técnico</Text>
            </View>
            <Text style={styles.liveLabel}>EN VIVO</Text>
          </View>

          <View style={styles.beaconSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>BEACONS BLE</Text>
              <Text style={styles.sectionState}>
                {hasBeacons ? `${beaconReadings.length} activo${beaconReadings.length === 1 ? "" : "s"}` : bleStatus}
              </Text>
            </View>

            {hasBeacons ? (
              <View style={styles.beaconList}>
                {beaconReadings.map((beacon) => (
                  <View key={beacon.id} style={styles.beaconRow}>
                    <View style={[styles.signalDot, getSignalStyle(beacon.rssi)]} />
                    <Text numberOfLines={1} style={styles.beaconLabel}>
                      {beacon.label}
                    </Text>
                    <Text style={styles.rssi}>{beacon.rssi}</Text>
                    <Text style={styles.rssiUnit}>dBm</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyBeaconCopy}>Aún no se detectan beacons compatibles.</Text>
            )}
          </View>

          <View style={styles.sensorGrid}>
            <SensorMetric label="Acelerómetro" value={accelerometerStatus} />
            <SensorMetric label="Movimiento" value={movementState} />
            <SensorMetric
              label="Brújula"
              value={`${compassStatus}${headingState ? ` · ${headingState}` : ""}`}
            />
            <SensorMetric
              label="Pasos"
              value={`${stepCountStatus}${stepCount !== null ? ` · ${stepCount}` : ""}`}
            />
          </View>

          <View style={styles.manualSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>RECORRIDO DE PRUEBA</Text>
              <Text style={[styles.sectionState, isManualZoneActive ? styles.manualState : null]}>
                {isManualZoneActive ? "MANUAL" : "BLE REAL"}
              </Text>
            </View>
            <View style={styles.zoneControls}>
              <Pressable
                accessibilityLabel="Zona anterior"
                onPress={onPreviousManualZone}
                style={({ pressed }) => [styles.zoneButton, pressed ? styles.zoneButtonPressed : null]}
              >
                <Ionicons color="#DDF7FF" name="chevron-back" size={20} />
              </Pressable>
              <View style={styles.zoneLabelWrap}>
                <Text numberOfLines={1} style={styles.zoneLabel}>{manualZoneLabel}</Text>
                <Text style={styles.zoneHint}>Usa las flechas para cambiar de obra</Text>
              </View>
              <Pressable
                accessibilityLabel="Zona siguiente"
                onPress={onNextManualZone}
                style={({ pressed }) => [styles.zoneButton, pressed ? styles.zoneButtonPressed : null]}
              >
                <Ionicons color="#DDF7FF" name="chevron-forward" size={20} />
              </Pressable>
            </View>
            {isManualZoneActive ? (
              <Pressable
                onPress={onUsePhysicalBeacon}
                style={({ pressed }) => [styles.physicalBeaconButton, pressed ? styles.zoneButtonPressed : null]}
              >
                <Ionicons color="#72E5B1" name="bluetooth-outline" size={15} />
                <Text style={styles.physicalBeaconButtonLabel}>Volver a beacon físico</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.toggle,
          pressed ? styles.togglePressed : null,
        ]}
      >
        <Text style={styles.toggleText}>
          {isOpen ? "Ocultar modo tecnico" : "Modo tecnico"}
        </Text>
      </Pressable>
    </View>
  );
}

function SensorMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function getSignalStyle(rssi: number) {
  if (rssi >= -55) {
    return styles.signalStrong;
  }

  if (rssi >= -72) {
    return styles.signalMedium;
  }

  return styles.signalWeak;
}

const styles = StyleSheet.create({
  wrap: {
    bottom: 14,
    position: "absolute",
    right: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  toggle: {
    backgroundColor: musePalette.primaryStrong,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: musePalette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  togglePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  toggleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  panel: {
    backgroundColor: "rgba(4, 13, 23, 0.96)",
    borderColor: "rgba(116, 213, 255, 0.56)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    maxWidth: 340,
    padding: 14,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  panelTitleGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  panelTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  liveLabel: {
    color: "#72E5B1",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  beaconSection: {
    backgroundColor: "rgba(116, 213, 255, 0.08)",
    borderColor: "rgba(116, 213, 255, 0.22)",
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#A9E8FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  sectionState: {
    color: "rgba(231, 248, 255, 0.72)",
    fontSize: 10,
    fontWeight: "800",
    maxWidth: 150,
    textAlign: "right",
  },
  beaconList: {
    gap: 7,
    marginTop: 10,
  },
  beaconRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  signalDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  signalStrong: {
    backgroundColor: "#72E5B1",
  },
  signalMedium: {
    backgroundColor: "#F4C45A",
  },
  signalWeak: {
    backgroundColor: "#FF8C7D",
  },
  beaconLabel: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
  },
  rssi: {
    color: "#8FDFFF",
    fontSize: 17,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
  },
  rssiUnit: {
    color: "rgba(231, 248, 255, 0.62)",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: -3,
  },
  emptyBeaconCopy: {
    color: "rgba(231, 248, 255, 0.62)",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  sensorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metric: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.09)",
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 54,
    paddingHorizontal: 8,
    paddingVertical: 7,
    width: "48.5%",
  },
  metricLabel: {
    color: "rgba(231, 248, 255, 0.57)",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: "#EAF8FF",
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 15,
    marginTop: 3,
  },
  manualSection: {
    backgroundColor: "rgba(244, 196, 90, 0.07)",
    borderColor: "rgba(244, 196, 90, 0.24)",
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
  },
  manualState: {
    color: "#F4C45A",
  },
  zoneControls: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  zoneButton: {
    alignItems: "center",
    backgroundColor: "rgba(116, 213, 255, 0.14)",
    borderColor: "rgba(116, 213, 255, 0.34)",
    borderRadius: 9,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  zoneButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  zoneLabelWrap: {
    alignItems: "center",
    flex: 1,
  },
  zoneLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  zoneHint: {
    color: "rgba(231, 248, 255, 0.6)",
    fontSize: 9,
    marginTop: 2,
    textAlign: "center",
  },
  physicalBeaconButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 9,
    paddingVertical: 3,
  },
  physicalBeaconButtonLabel: {
    color: "#B8F4D4",
    fontSize: 10,
    fontWeight: "900",
  },
});
