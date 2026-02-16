import { BeaconList } from '@/components/beacon-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useBleScanner } from '@/hooks/use-ble-scanner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [distanceN, setDistanceN] = useState(2.5);
  const [txPowerFallback, setTxPowerFallback] = useState(-52);
  const [rssiWindowSize, setRssiWindowSize] = useState(5);

  const { beacons, isScanning, bleState, error, startScanning, stopScanning } = useBleScanner({
    defaultTxPowerDbm: txPowerFallback,
    rssiWindowSize,
  });

  const handleScanToggle = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
                onPress={() => setDistanceN((prev) => Math.max(2.0, Number((prev - 0.1).toFixed(1))))}>
                <ThemedText style={styles.settingButtonText}>-</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.settingValue}>{distanceN.toFixed(1)}</ThemedText>
              <TouchableOpacity
                style={[styles.settingButton, { borderColor: colors.border }]}
                onPress={() => setDistanceN((prev) => Math.min(3.0, Number((prev + 0.1).toFixed(1))))}>
                <ThemedText style={styles.settingButtonText}>+</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>Tx Power @1m</ThemedText>
            <View style={styles.settingControls}>
              <TouchableOpacity
                style={[styles.settingButton, { borderColor: colors.border }]}
                onPress={() => setTxPowerFallback((prev) => Math.max(-80, prev - 1))}>
                <ThemedText style={styles.settingButtonText}>-</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.settingValue}>{txPowerFallback} dBm</ThemedText>
              <TouchableOpacity
                style={[styles.settingButton, { borderColor: colors.border }]}
                onPress={() => setTxPowerFallback((prev) => Math.min(-30, prev + 1))}>
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
      </ThemedView>

      {/* Lista de beacons */}
      <BeaconList beacons={beacons} isScanning={isScanning} distanceN={distanceN} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});
