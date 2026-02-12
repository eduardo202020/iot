import { BeaconList } from '@/components/beacon-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useBleScanner } from '@/hooks/use-ble-scanner';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { beacons, isScanning, bleState, error, startScanning, stopScanning } = useBleScanner();

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
              MuseIQ Scanner
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
      </ThemedView>

      {/* Lista de beacons */}
      <BeaconList beacons={beacons} isScanning={isScanning} />
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
});
