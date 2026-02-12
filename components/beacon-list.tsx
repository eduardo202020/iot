import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { BeaconData } from '@/types/beacon';
import { FlatList, StyleSheet, View } from 'react-native';

interface BeaconListProps {
    beacons: BeaconData[];
    isScanning: boolean;
    distanceN: number;
}

interface BeaconCardProps {
    beacon: BeaconData;
}

function BeaconCard({ beacon, distanceN }: BeaconCardProps & { distanceN: number }) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Determinar calidad de señal
    const getSignalQuality = (rssi: number): { quality: string; color: string; icon: any } => {
        if (rssi >= -60) return { quality: 'Excelente', color: '#10B981', icon: 'wifi' as const };
        if (rssi >= -70) return { quality: 'Buena', color: '#3B82F6', icon: 'wifi' as const };
        if (rssi >= -80) return { quality: 'Regular', color: '#F59E0B', icon: 'wifi' as const };
        return { quality: 'Débil', color: '#EF4444', icon: 'wifi.slash' as const };
    };

    // Determinar estado de batería
    const getBatteryStatus = (battery: number): { status: string; color: string; icon: any } => {
        if (battery >= 3600) return { status: 'Alta', color: '#10B981', icon: 'battery.100' as const };
        if (battery >= 3400) return { status: 'Media', color: '#F59E0B', icon: 'battery.50' as const };
        return { status: 'Baja', color: '#EF4444', icon: 'battery.25' as const };
    };

    const signal = getSignalQuality(beacon.rssi);
    const battery = getBatteryStatus(beacon.battery);

    // Calcular distancia usando Tx Power calibrado @1m
    // n = 2.5 para espacio libre con mejor ajuste en distancias mayores
    const estimateDistance = (rssi: number, txPower: number, n: number = 2.5): string => {
        const distance = Math.pow(10, (txPower - rssi) / (10 * n));
        return Math.max(0.1, distance).toFixed(1);
    };

    const distance = estimateDistance(beacon.rssi, beacon.txPower, distanceN);

    return (
        <ThemedView style={[styles.card, { borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <IconSymbol name="location.fill" size={24} color={colors.tint} />
                    <View style={styles.headerText}>
                        <ThemedText type="defaultSemiBold" style={styles.roomId}>
                            {beacon.roomId}
                        </ThemedText>
                        <View style={styles.beaconNodeRow}>
                            <ThemedText style={styles.beaconNode}>Beacon #{beacon.beaconNode}</ThemedText>
                            {/* Indicador de estado */}
                            <View style={styles.statusIndicator}>
                                <View
                                    style={[
                                        styles.statusDot,
                                        {
                                            backgroundColor: beacon.isActive ? '#10B981' : '#9CA3AF',
                                        },
                                    ]}
                                />
                                <ThemedText
                                    style={[
                                        styles.statusText,
                                        {
                                            color: beacon.isActive ? '#10B981' : '#9CA3AF',
                                        },
                                    ]}>
                                    {beacon.isActive ? 'Activo' : 'Reposo'}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.signalBadge, { backgroundColor: signal.color + '20' }]}>
                    <IconSymbol name={signal.icon} size={16} color={signal.color} />
                    <ThemedText style={[styles.signalText, { color: signal.color }]}>
                        {signal.quality}
                    </ThemedText>
                </View>
            </View>

            {/* Métricas */}
            <View style={styles.metrics}>
                {/* RSSI */}
                <View style={styles.metric}>
                    <IconSymbol name="antenna.radiowaves.left.and.right" size={20} color={colors.icon} />
                    <View style={styles.metricText}>
                        <ThemedText style={styles.metricLabel}>Señal</ThemedText>
                        <ThemedText type="defaultSemiBold">{beacon.rssi} dBm</ThemedText>
                    </View>
                </View>

                {/* Distancia estimada */}
                <View style={styles.metric}>
                    <IconSymbol name="ruler" size={20} color={colors.icon} />
                    <View style={styles.metricText}>
                        <ThemedText style={styles.metricLabel}>Distancia</ThemedText>
                        <ThemedText type="defaultSemiBold">~{distance} m</ThemedText>
                    </View>
                </View>

                {/* Batería */}
                <View style={styles.metric}>
                    <IconSymbol name={battery.icon} size={20} color={battery.color} />
                    <View style={styles.metricText}>
                        <ThemedText style={styles.metricLabel}>Batería</ThemedText>
                        <ThemedText type="defaultSemiBold" style={{ color: battery.color }}>
                            {beacon.battery} mV
                        </ThemedText>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
                <ThemedText style={styles.footerText}>
                    Firmware: v{beacon.firmwareVersion} • ID: {beacon.id}
                </ThemedText>
            </View>
        </ThemedView>
    );
}

export function BeaconList({ beacons, isScanning, distanceN }: BeaconListProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    if (beacons.length === 0) {
        return (
            <ThemedView style={styles.emptyContainer}>
                <IconSymbol
                    name={isScanning ? 'antenna.radiowaves.left.and.right' : 'location.slash'}
                    size={64}
                    color={colors.tabIconDefault}
                />
                <ThemedText type="subtitle" style={styles.emptyTitle}>
                    {isScanning ? 'Buscando beacons...' : 'No hay beacons detectados'}
                </ThemedText>
                <ThemedText style={styles.emptySubtitle}>
                    {isScanning
                        ? 'Asegúrate de estar cerca de un beacon'
                        : 'Presiona "Escanear" para buscar beacons cercanos'}
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <FlatList
            data={beacons}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BeaconCard beacon={item} distanceN={distanceN} />}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        gap: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerText: {
        gap: 2,
    },
    roomId: {
        fontSize: 18,
    },
    beaconNodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    beaconNode: {
        fontSize: 12,
        opacity: 0.6,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    signalBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    signalText: {
        fontSize: 12,
        fontWeight: '600',
    },
    metrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    metric: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metricText: {
        gap: 2,
    },
    metricLabel: {
        fontSize: 11,
        opacity: 0.5,
    },
    cardFooter: {
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128, 128, 128, 0.2)',
    },
    footerText: {
        fontSize: 11,
        opacity: 0.5,
    },
    separator: {
        height: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        gap: 16,
    },
    emptyTitle: {
        textAlign: 'center',
    },
    emptySubtitle: {
        textAlign: 'center',
        opacity: 0.6,
        fontSize: 14,
    },
});
