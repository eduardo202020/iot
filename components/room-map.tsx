import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, View } from 'react-native';

interface RoomMapProps {
    roomLabel: string;
    currentZone: number; // 0 = fuera, 1..3 = zona
    progressZone: number; // 0 = inicio, 1..3 = zona alcanzada
    distanceMeters: number | null;
}

const MAP_HEIGHT = 260;
const MAP_PADDING = 12;
const INNER_HEIGHT = MAP_HEIGHT - MAP_PADDING * 2;
const ZONE_HEIGHT = INNER_HEIGHT / 3;
const MARKER_SIZE = 20;

const ZONE_COLORS = [
    { base: '#DCFCE7', active: '#86EFAC' },
    { base: '#DBEAFE', active: '#93C5FD' },
    { base: '#FEF3C7', active: '#FCD34D' },
];

const getZoneLabel = (zone: number): string => {
    if (zone === 1) return 'Zona 1';
    if (zone === 2) return 'Zona 2';
    if (zone === 3) return 'Zona 3';
    return 'Fuera';
};

const getZoneColor = (zone: number): string => {
    if (zone === 1) return '#10B981';
    if (zone === 2) return '#3B82F6';
    if (zone === 3) return '#F59E0B';
    return '#9CA3AF';
};

const getUserMarkerTop = (zone: number): number => {
    const innerTop = MAP_PADDING;
    const zoneCenter1 = innerTop + INNER_HEIGHT - ZONE_HEIGHT / 2;
    const zoneCenter2 = innerTop + INNER_HEIGHT - ZONE_HEIGHT - ZONE_HEIGHT / 2;
    const zoneCenter3 = innerTop + ZONE_HEIGHT / 2;

    if (zone <= 0) return innerTop + INNER_HEIGHT - MARKER_SIZE - 4;
    if (zone === 1) return zoneCenter1 - MARKER_SIZE / 2;
    if (zone === 2) return zoneCenter2 - MARKER_SIZE / 2;
    return zoneCenter3 - MARKER_SIZE / 2;
};

export function RoomMap({ roomLabel, currentZone, progressZone, distanceMeters }: RoomMapProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const userMarkerTop = getUserMarkerTop(currentZone);
    const userColor = getZoneColor(currentZone);

    return (
        <ThemedView style={[styles.card, { borderColor: colors.border }]}>
            <View style={styles.header}>
                <ThemedText type="defaultSemiBold" style={styles.title}>
                    {roomLabel}
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Zona actual: {getZoneLabel(currentZone)}
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                    Distancia: {distanceMeters === null ? '--' : `~${distanceMeters.toFixed(2)} m`}
                </ThemedText>
            </View>

            <View style={[styles.mapCanvas, { borderColor: colors.border }]}>
                <View style={styles.zoneArea}>
                    <View
                        style={[
                            styles.zone,
                            { backgroundColor: progressZone >= 3 ? ZONE_COLORS[2].active : ZONE_COLORS[2].base },
                        ]}
                    />
                    <View
                        style={[
                            styles.zone,
                            { backgroundColor: progressZone >= 2 ? ZONE_COLORS[1].active : ZONE_COLORS[1].base },
                        ]}
                    />
                    <View
                        style={[
                            styles.zone,
                            { backgroundColor: progressZone >= 1 ? ZONE_COLORS[0].active : ZONE_COLORS[0].base },
                        ]}
                    />
                </View>

                <View style={[styles.mapBorder, { borderColor: colors.border }]} />

                <View style={[styles.exitLabel, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <ThemedText style={styles.labelText}>Salida</ThemedText>
                </View>
                <View style={[styles.entryLabel, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <ThemedText style={styles.labelText}>Entrada</ThemedText>
                </View>

                <View style={[styles.leftColumn, { backgroundColor: colors.background, borderColor: colors.border }]} />
                <View style={[styles.leftCircle, styles.leftCircleTop, { backgroundColor: '#EF4444' }]} />
                <View style={[styles.leftCircle, styles.leftCircleMid, { backgroundColor: '#3B82F6' }]} />
                <View style={[styles.leftCircle, styles.leftCircleBot, { backgroundColor: '#10B981' }]} />

                <View style={[styles.rightColumn, { backgroundColor: colors.background, borderColor: colors.border }]} />
                <View style={[styles.rightSquare, { backgroundColor: '#60A5FA' }]} />
                <View style={[styles.rightDiamond, { backgroundColor: '#22C55E' }]} />
                <View style={[styles.rightCircle, { backgroundColor: '#F59E0B' }]} />

                <View style={[styles.beacon, { backgroundColor: '#E0E7FF', borderColor: '#6366F1' }]}>
                    <ThemedText style={styles.beaconText}>ESP32</ThemedText>
                </View>

                <View style={[styles.zoneLabel, styles.zoneLabelTop]}>
                    <ThemedText style={styles.zoneLabelText}>Zona 3</ThemedText>
                </View>
                <View style={[styles.zoneLabel, styles.zoneLabelMid]}>
                    <ThemedText style={styles.zoneLabelText}>Zona 2</ThemedText>
                </View>
                <View style={[styles.zoneLabel, styles.zoneLabelBot]}>
                    <ThemedText style={styles.zoneLabelText}>Zona 1</ThemedText>
                </View>

                <View style={[styles.userMarker, { top: userMarkerTop, backgroundColor: userColor }]}>
                    <ThemedText style={styles.userText}>U</ThemedText>
                </View>
                <View
                    style={[
                        styles.userBadge,
                        {
                            top: userMarkerTop - 6,
                            borderColor: userColor,
                            backgroundColor: colors.background,
                        },
                    ]}>
                    <ThemedText style={[styles.userBadgeText, { color: userColor }]}>
                        {getZoneLabel(currentZone)}
                    </ThemedText>
                </View>
            </View>

            <ThemedText style={styles.progressText}>
                Progreso: {getZoneLabel(progressZone)} (no se permite regresar)
            </ThemedText>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    header: {
        gap: 2,
    },
    title: {
        fontSize: 16,
    },
    subtitle: {
        fontSize: 12,
        opacity: 0.7,
    },
    mapCanvas: {
        height: MAP_HEIGHT,
        borderWidth: 1,
        borderRadius: 18,
        overflow: 'hidden',
        position: 'relative',
    },
    zoneArea: {
        position: 'absolute',
        left: MAP_PADDING,
        right: MAP_PADDING,
        top: MAP_PADDING,
        bottom: MAP_PADDING,
        borderRadius: 16,
        overflow: 'hidden',
    },
    zone: {
        height: ZONE_HEIGHT,
    },
    mapBorder: {
        position: 'absolute',
        left: MAP_PADDING,
        right: MAP_PADDING,
        top: MAP_PADDING,
        bottom: MAP_PADDING,
        borderRadius: 16,
        borderWidth: 2,
    },
    exitLabel: {
        position: 'absolute',
        alignSelf: 'center',
        top: 2,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    entryLabel: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 2,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    labelText: {
        fontSize: 12,
    },
    leftColumn: {
        position: 'absolute',
        left: 18,
        top: 52,
        width: 44,
        height: 156,
        borderRadius: 14,
        borderWidth: 1,
    },
    leftCircle: {
        position: 'absolute',
        left: 24,
        width: 26,
        height: 26,
        borderRadius: 13,
    },
    leftCircleTop: {
        top: 64,
    },
    leftCircleMid: {
        top: 112,
    },
    leftCircleBot: {
        top: 160,
    },
    rightColumn: {
        position: 'absolute',
        right: 18,
        top: 52,
        width: 44,
        height: 156,
        borderRadius: 14,
        borderWidth: 1,
    },
    rightSquare: {
        position: 'absolute',
        right: 28,
        top: 70,
        width: 22,
        height: 22,
        borderRadius: 6,
    },
    rightDiamond: {
        position: 'absolute',
        right: 30,
        top: 118,
        width: 20,
        height: 20,
        transform: [{ rotate: '45deg' }],
    },
    rightCircle: {
        position: 'absolute',
        right: 28,
        top: 164,
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    beacon: {
        position: 'absolute',
        alignSelf: 'center',
        top: 128,
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    beaconText: {
        fontSize: 11,
        color: '#4338CA',
        fontWeight: '600',
    },
    zoneLabel: {
        position: 'absolute',
        alignSelf: 'center',
    },
    zoneLabelTop: {
        top: 34,
    },
    zoneLabelMid: {
        top: 104,
    },
    zoneLabelBot: {
        top: 176,
    },
    zoneLabelText: {
        fontSize: 12,
    },
    userMarker: {
        position: 'absolute',
        alignSelf: 'center',
        width: MARKER_SIZE,
        height: MARKER_SIZE,
        borderRadius: MARKER_SIZE / 2,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userText: {
        fontSize: 9,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    userBadge: {
        position: 'absolute',
        left: '55%',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
    },
    userBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    progressText: {
        fontSize: 12,
        opacity: 0.7,
    },
});
