import { BeaconList } from '@/components/beacon-list';
import { RoomMap } from '@/components/room-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useBleScanner } from '@/hooks/use-ble-scanner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGuideNarrator } from '@/hooks/use-guide-narrator';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const estimateDistanceMeters = (rssi: number, txPower: number, n: number): number => {
  const distance = Math.pow(10, (txPower - rssi) / (10 * n));
  return Math.max(0.1, distance);
};

const MAX_WALK_SPEED_MPS = 0.8;
const DISTANCE_SMOOTHING_ALPHA = 0.15;

const getZoneFromDistance = (distanceMeters: number): number => {
  if (distanceMeters <= 0.5) return 1;
  if (distanceMeters <= 0.8) return 2;
  if (distanceMeters <= 1.2) return 3;
  return 0;
};

// Hysteresis: requiere 3 confirmaciones consecutivas antes de cambiar de zona
const applyZoneHysteresis = (newZone: number, previousZone: number, zoneHistoryRef: React.MutableRefObject<number[]>): number => {
  const confirmationsNeeded = 3;

  if (newZone === previousZone) {
    zoneHistoryRef.current = [newZone];
    return newZone;
  }

  if (zoneHistoryRef.current[0] !== newZone) {
    zoneHistoryRef.current = [newZone];
    return previousZone;
  }

  zoneHistoryRef.current.push(newZone);
  if (zoneHistoryRef.current.length >= confirmationsNeeded) {
    return newZone;
  }

  return previousZone;
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [distanceN, setDistanceN] = useState(2.5);
  const [txPowerFallback, setTxPowerFallback] = useState(-52);
  const [rssiWindowSize, setRssiWindowSize] = useState(7);
  const [currentZone, setCurrentZone] = useState(0);
  const [progressZone, setProgressZone] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [guideEnabled, setGuideEnabled] = useState(false);
  const zoneHistoryRef = useRef<number[]>([]);
  const currentZoneRef = useRef(0);
  const smoothedDistanceRef = useRef<number | null>(null);
  const lastDistanceTsRef = useRef<number>(Date.now());

  const { beacons, isScanning, bleState, error, startScanning, stopScanning } = useBleScanner({
    defaultTxPowerDbm: txPowerFallback,
    rssiWindowSize,
    emaAlpha: 0.4,
  });

  const guide = useGuideNarrator({
    roomId: 'SALA_2',
    zone: currentZone,
    enabled: guideEnabled && isScanning,
  });

  useEffect(() => {
    if (beacons.length === 0) {
      if (currentZoneRef.current !== 0) {
        currentZoneRef.current = 0;
        setCurrentZone(0);
      }
      setDistanceMeters(null);
      zoneHistoryRef.current = [];
      smoothedDistanceRef.current = null;
      lastDistanceTsRef.current = Date.now();
      return;
    }

    const strongest = beacons[0];
    const rawDistance = estimateDistanceMeters(strongest.rssi, strongest.txPower, distanceN);
    const now = Date.now();
    const previous = smoothedDistanceRef.current ?? rawDistance;
    const dtSeconds = Math.max(0.001, (now - lastDistanceTsRef.current) / 1000);
    const maxDelta = MAX_WALK_SPEED_MPS * dtSeconds;

    const clamped = Math.min(previous + maxDelta, Math.max(previous - maxDelta, rawDistance));
    const smoothedDistance = previous + DISTANCE_SMOOTHING_ALPHA * (clamped - previous);

    smoothedDistanceRef.current = smoothedDistance;
    lastDistanceTsRef.current = now;

    const rawZone = getZoneFromDistance(smoothedDistance);

    // Aplicar hysteresis: requiere 3 confirmaciones antes de cambiar zona
    const confirmedZone = applyZoneHysteresis(rawZone, currentZoneRef.current, zoneHistoryRef);

    if (currentZoneRef.current !== confirmedZone) {
      currentZoneRef.current = confirmedZone;
      setCurrentZone(confirmedZone);
    }
    setDistanceMeters(smoothedDistance);
    if (confirmedZone > 0) {
      setProgressZone((prev) => Math.max(prev, confirmedZone));
    }
  }, [beacons, distanceN]);

  const handleScanToggle = () => {
    if (isScanning) {
      stopScanning();
      setGuideEnabled(false);
      guide.stop();
    } else {
      startScanning();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={styles.headerTop}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
            <View style={styles.headerText}>
              <ThemedText type="title" style={styles.title}>
                MuseIQ Scanner v2
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {beacons.length} {beacons.length === 1 ? 'beacon detectado' : 'beacons detectados'}
              </ThemedText>
            </View>
          </View>

          {/* Estado de Bluetooth */}
          {bleState && bleState !== 'PoweredOn' && (
            <View style={[styles.bleWarning, { backgroundColor: colors.warning + '20' }]}>
              <IconSymbol name="exclamationmark.triangle" size={20} color={colors.warning} />
              <ThemedText style={{ color: colors.warning, fontSize: 13 }}>
                {bleState === 'PoweredOff'
                  ? 'Bluetooth está apagado'
                  : 'Bluetooth no disponible'}
              </ThemedText>
            </View>
          )}

          {/* Error */}
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: '#EF4444' + '20' }]}>
              <IconSymbol name="xmark.circle" size={20} color="#EF4444" />
              <ThemedText style={{ color: '#EF4444', fontSize: 13, flex: 1 }}>
                {error}
              </ThemedText>
            </View>
          )}

          {/* Botón de escaneo */}
          <TouchableOpacity
            style={[
              styles.scanButton,
              {
                backgroundColor: isScanning ? colors.danger : colors.tint,
              },
            ]}
            onPress={handleScanToggle}
            disabled={bleState !== 'PoweredOn'}>
            {isScanning ? (
              <>
                <ActivityIndicator color="#fff" />
                <ThemedText style={styles.scanButtonText}>Detener Escaneo</ThemedText>
              </>
            ) : (
              <>
                <IconSymbol name="antenna.radiowaves.left.and.right" size={20} color="#fff" />
                <ThemedText style={styles.scanButtonText}>Iniciar Escaneo</ThemedText>
              </>
            )}
          </TouchableOpacity>

          {/* Ajustes de distancia */}
          <ThemedView style={[styles.settingsCard, { borderColor: colors.border }]}>
            <View style={styles.settingsHeader}>
              <IconSymbol name="slider.horizontal.3" size={18} color={colors.icon} />
              <ThemedText type="defaultSemiBold" style={styles.settingsTitle}>
                Ajustes de distancia
              </ThemedText>
            </View>

            <View style={styles.settingRow}>
              <ThemedText style={styles.settingLabel}>Factor n</ThemedText>
              <View style={styles.settingControls}>
                <TouchableOpacity
                  style={[styles.settingButton, { borderColor: colors.border }]}
                  onPress={() => setDistanceN((prev) => Math.max(1.0, Number((prev - 10).toFixed(1))))}>
                  <ThemedText style={styles.settingButtonText}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.settingValue}>{distanceN.toFixed(1)}</ThemedText>
                <TouchableOpacity
                  style={[styles.settingButton, { borderColor: colors.border }]}
                  onPress={() => setDistanceN((prev) => Math.min(500.0, Number((prev + 10).toFixed(1))))}>
                  <ThemedText style={styles.settingButtonText}>+</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <ThemedText style={styles.settingLabel}>Tx Power @1m</ThemedText>
              <View style={styles.settingControls}>
                <TouchableOpacity
                  style={[styles.settingButton, { borderColor: colors.border }]}
                  onPress={() => setTxPowerFallback((prev) => Math.max(-80, prev - 10))}>
                  <ThemedText style={styles.settingButtonText}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.settingValue}>{txPowerFallback} dBm</ThemedText>
                <TouchableOpacity
                  style={[styles.settingButton, { borderColor: colors.border }]}
                  onPress={() => setTxPowerFallback((prev) => Math.min(-10, prev + 10))}>
                  <ThemedText style={styles.settingButtonText}>+</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <ThemedText style={styles.settingLabel}>Suavizado RSSI</ThemedText>
              <View style={styles.settingControls}>
                <TouchableOpacity
                  style={[styles.settingButton, { borderColor: colors.border }]}
                  onPress={() => setRssiWindowSize((prev) => Math.max(3, prev - 1))}>
                  <ThemedText style={styles.settingButtonText}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.settingValue}>{rssiWindowSize} lecturas</ThemedText>
                <TouchableOpacity
                  style={[styles.settingButton, { borderColor: colors.border }]}
                  onPress={() => setRssiWindowSize((prev) => Math.min(10, prev + 1))}>
                  <ThemedText style={styles.settingButtonText}>+</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ThemedView>

          {/* Controles de Guía Hablada */}
          <ThemedView style={[styles.settingsCard, { borderColor: colors.border }]}>
            <View style={styles.settingsHeader}>
              <IconSymbol name="speaker.wave.2.fill" size={18} color={colors.icon} />
              <ThemedText type="defaultSemiBold" style={styles.settingsTitle}>
                Guía Virtual
              </ThemedText>
            </View>

            <View style={styles.settingRow}>
              <ThemedText style={styles.settingLabel}>Guía Hablada</ThemedText>
              <Switch
                value={guideEnabled && isScanning}
                onValueChange={(enabled) => {
                  if (!isScanning) {
                    return; // No permitir activar sin escaneo
                  }
                  setGuideEnabled(enabled);
                }}
                disabled={!isScanning}
                trackColor={{ false: '#ccc', true: colors.tint + '80' }}
                thumbColor={guideEnabled && isScanning ? colors.tint : '#f4f3f4'}
              />
            </View>

            {guideEnabled && (
              <TouchableOpacity
                style={[
                  styles.guideButton,
                  {
                    backgroundColor: colors.tint,
                    opacity: guide.isPlaying ? 0.7 : 1,
                  },
                ]}
                onPress={() => guide.speakNow()}
                disabled={guide.isPlaying}>
                <IconSymbol name={guide.isPlaying ? 'speaker.slash.fill' : 'speaker.wave.2'} size={16} color="#fff" />
                <ThemedText style={styles.guideButtonText}>
                  {guide.isPlaying ? 'Hablando...' : 'Repetir Narración'}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>

          <RoomMap
            roomLabel="Sala 2"
            currentZone={currentZone}
            progressZone={progressZone}
            distanceMeters={distanceMeters}
          />
        </ThemedView>

        {/* Lista de beacons */}
        <BeaconList beacons={beacons} isScanning={isScanning} distanceN={distanceN} scrollEnabled={false} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    gap: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  bleWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsTitle: {
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  settingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  settingButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingValue: {
    minWidth: 70,
    textAlign: 'center',
    fontSize: 13,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  guideButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
