import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useBleBidirectional } from '@/hooks/use-ble-bidirectional';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = (colorScheme ?? 'light') === 'dark';
    const [draftMessage, setDraftMessage] = useState('hola esp32');
    const [led1On, setLed1On] = useState(false);
    const [led2On, setLed2On] = useState(false);
    const lastButtonCountRef = useRef(0);

    const {
        bleState,
        isScanning,
        isConnecting,
        connectedDevice,
        error,
        messages,
        buttonEventCount,
        scannedDevices,
        targetDeviceName,
        serviceUuid,
        startScanAndConnect,
        connectToDeviceId,
        sendMessage,
        disconnect,
        clearMessages,
    } = useBleBidirectional();

    const connectionLabel = useMemo(() => {
        if (isConnecting) return 'Conectando...';
        if (connectedDevice) return `Conectado: ${connectedDevice.name ?? connectedDevice.id}`;
        if (isScanning) return 'Buscando dispositivo...';
        return 'Sin conexion';
    }, [connectedDevice, isConnecting, isScanning]);

    const ui = useMemo(() => {
        return {
            cardBg: isDark ? '#1C222B' : '#F8FAFC',
            rowBg: isDark ? '#11151B' : '#FFFFFF',
            ledOff: isDark ? '#4B5563' : '#9CA3AF',
            ledOn: '#22C55E',
        };
    }, [isDark]);

    const getButtonPressMessage = (count: number) => {
        const ordinals: Record<number, string> = {
            1: 'primera',
            2: 'segunda',
            3: 'tercera',
            4: 'cuarta',
            5: 'quinta',
            6: 'sexta',
            7: 'septima',
            8: 'octava',
            9: 'novena',
            10: 'decima',
        };

        const ordinal = ordinals[count] ?? `${count}a`;
        return `Es la ${ordinal} vez que aprietas el boton`;
    };

    useEffect(() => {
        if (buttonEventCount > lastButtonCountRef.current) {
            Speech.speak(getButtonPressMessage(buttonEventCount), {
                language: 'es-ES',
                pitch: 1,
                rate: 0.95,
            });
        }

        lastButtonCountRef.current = buttonEventCount;
    }, [buttonEventCount]);

    const toggleLed = async (ledNumber: 1 | 2) => {
        if (ledNumber === 1) {
            const nextState = !led1On;
            await sendMessage(nextState ? 'LED1_ON' : 'LED1_OFF');
            setLed1On(nextState);
            return;
        }

        const nextState = !led2On;
        await sendMessage(nextState ? 'LED2_ON' : 'LED2_OFF');
        setLed2On(nextState);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title" style={styles.title}>
                        BLE Explore
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>Prueba bidireccional con ESP32</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.card, { borderColor: colors.border, backgroundColor: ui.cardBg }]}>
                    <View style={styles.rowBetween}>
                        <ThemedText type="defaultSemiBold">Objetivo</ThemedText>
                        <IconSymbol name="dot.radiowaves.left.and.right" size={18} color={colors.icon} />
                    </View>

                    <ThemedText style={styles.smallText}>Dispositivo: {targetDeviceName}</ThemedText>
                    <ThemedText style={styles.smallText}>Servicio: {serviceUuid}</ThemedText>
                    <ThemedText style={styles.smallText}>Bluetooth: {bleState ?? 'desconocido'}</ThemedText>
                    <ThemedText style={styles.smallText}>Estado: {connectionLabel}</ThemedText>
                    <ThemedText style={styles.smallText}>Eventos de boton: {buttonEventCount}</ThemedText>

                    {error ? (
                        <ThemedView style={[styles.errorBanner, { borderColor: colors.danger }]}>
                            <ThemedText style={{ color: colors.danger }}>{error}</ThemedText>
                        </ThemedView>
                    ) : null}

                    <View style={styles.actionsRow}>
                        <Pressable
                            style={[styles.actionButton, { backgroundColor: colors.tint }]}
                            onPress={startScanAndConnect}
                            disabled={isScanning || isConnecting || bleState !== 'PoweredOn' || !!connectedDevice}>
                            {isScanning || isConnecting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <IconSymbol name="dot.radiowaves.left.and.right" size={18} color="#fff" />
                            )}
                            <ThemedText style={styles.actionText}>Buscar y conectar</ThemedText>
                        </Pressable>

                        <Pressable
                            style={[styles.actionButton, { backgroundColor: colors.danger }]}
                            onPress={disconnect}
                            disabled={!connectedDevice && !isScanning && !isConnecting}>
                            <IconSymbol name="xmark" size={18} color="#fff" />
                            <ThemedText style={styles.actionText}>Desconectar</ThemedText>
                        </Pressable>
                    </View>
                </ThemedView>

                <ThemedView style={[styles.card, { borderColor: colors.border, backgroundColor: ui.cardBg }]}>
                    <View style={styles.rowBetween}>
                        <ThemedText type="defaultSemiBold">Control LED 1 / LED 2</ThemedText>
                        <IconSymbol name="lightbulb.max" size={18} color={colors.icon} />
                    </View>

                    <View style={styles.ledButtonsRow}>
                        <Pressable
                            style={[
                                styles.ledButton,
                                {
                                    backgroundColor: led1On ? ui.ledOn : ui.ledOff,
                                    borderColor: led1On ? '#166534' : colors.border,
                                },
                            ]}
                            onPress={() => toggleLed(1)}
                            disabled={!connectedDevice}>
                            <IconSymbol name="lightbulb.max" size={26} color="#fff" />
                        </Pressable>

                        <Pressable
                            style={[
                                styles.ledButton,
                                {
                                    backgroundColor: led2On ? ui.ledOn : ui.ledOff,
                                    borderColor: led2On ? '#166534' : colors.border,
                                },
                            ]}
                            onPress={() => toggleLed(2)}
                            disabled={!connectedDevice}>
                            <IconSymbol name="lightbulb.max" size={26} color="#fff" />
                        </Pressable>
                    </View>
                </ThemedView>

                <ThemedView style={[styles.card, { borderColor: colors.border, backgroundColor: ui.cardBg }]}>
                    <View style={styles.rowBetween}>
                        <ThemedText type="defaultSemiBold">Dispositivos detectados</ThemedText>
                        <ThemedText style={styles.smallText}>{scannedDevices.length}</ThemedText>
                    </View>

                    {scannedDevices.length === 0 ? (
                        <ThemedText style={styles.smallText}>
                            Inicia escaneo para ver dispositivos BLE cercanos.
                        </ThemedText>
                    ) : (
                        <View style={styles.logList}>
                            {scannedDevices.map((device) => (
                                <View key={device.id} style={[styles.logItem, { borderColor: colors.border, backgroundColor: ui.rowBg }]}>
                                    <ThemedText type="defaultSemiBold">{device.name}</ThemedText>
                                    <ThemedText style={styles.smallText}>ID: {device.id}</ThemedText>
                                    <ThemedText style={styles.smallText}>RSSI: {device.rssi ?? 'N/A'}</ThemedText>
                                    <ThemedText style={styles.smallText}>
                                        {device.hasServiceUuid ? 'UUID A100 detectado' : 'UUID A100 no detectado'}
                                    </ThemedText>
                                    <Pressable
                                        style={[styles.manualConnectButton, { backgroundColor: colors.tint }]}
                                        onPress={() => connectToDeviceId(device.id)}
                                        disabled={isConnecting || !!connectedDevice}>
                                        <ThemedText style={styles.actionText}>Conectar manualmente</ThemedText>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}
                </ThemedView>

                <ThemedView style={[styles.card, { borderColor: colors.border, backgroundColor: ui.cardBg }]}>
                    <View style={styles.rowBetween}>
                        <ThemedText type="defaultSemiBold">Enviar mensaje a RX (A101)</ThemedText>
                        <IconSymbol name="arrow.up.message" size={18} color={colors.icon} />
                    </View>

                    <TextInput
                        value={draftMessage}
                        onChangeText={setDraftMessage}
                        placeholder="Escribe texto para el ESP32"
                        placeholderTextColor={colors.icon}
                        style={[
                            styles.input,
                            {
                                borderColor: colors.border,
                                color: colors.text,
                                backgroundColor: ui.rowBg,
                            },
                        ]}
                        editable={!!connectedDevice}
                    />

                    <Pressable
                        style={[
                            styles.sendButton,
                            { backgroundColor: connectedDevice ? colors.tint : colors.icon },
                        ]}
                        onPress={() => sendMessage(draftMessage)}
                        disabled={!connectedDevice || !draftMessage.trim()}>
                        <IconSymbol name="paperplane.fill" size={16} color="#fff" />
                        <ThemedText style={styles.actionText}>Enviar</ThemedText>
                    </Pressable>
                </ThemedView>

                <ThemedView style={[styles.card, { borderColor: colors.border, backgroundColor: ui.cardBg }]}>
                    <View style={styles.rowBetween}>
                        <ThemedText type="defaultSemiBold">Mensajes TX/RX</ThemedText>
                        <Pressable onPress={clearMessages}>
                            <ThemedText type="link">Limpiar</ThemedText>
                        </Pressable>
                    </View>

                    {messages.length === 0 ? (
                        <ThemedText style={styles.smallText}>
                            Sin mensajes todavia. Conecta el ESP32 y envia "hola esp32" para probar el eco.
                        </ThemedText>
                    ) : (
                        <View style={styles.logList}>
                            {(() => {
                                let seenButtonItems = 0;

                                return messages.map((item) => {
                                    const tone =
                                        item.direction === 'rx'
                                            ? '#065F46'
                                            : item.direction === 'tx'
                                                ? '#1D4ED8'
                                                : colors.icon;

                                    const label =
                                        item.direction === 'rx' && item.kind === 'button'
                                            ? 'RX-BUTTON'
                                            : item.direction === 'rx' && item.kind === 'binary'
                                                ? 'RX-BINARY'
                                                : item.direction.toUpperCase();

                                    const displayText =
                                        item.direction === 'rx' && item.kind === 'button'
                                            ? getButtonPressMessage(Math.max(1, buttonEventCount - seenButtonItems++))
                                            : item.text;

                                    return (
                                        <View key={item.id} style={[styles.logItem, { borderColor: colors.border, backgroundColor: ui.rowBg }]}>
                                            <ThemedText style={[styles.logDirection, { color: tone }]}>
                                                {label} - {new Date(item.ts).toLocaleTimeString()}
                                            </ThemedText>
                                            <ThemedText>{displayText}</ThemedText>
                                        </View>
                                    );
                                });
                            })()}
                        </View>
                    )}
                </ThemedView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 32,
        gap: 14,
    },
    titleContainer: {
        gap: 6,
        marginTop: 8,
    },
    title: {
        fontFamily: Fonts.rounded,
    },
    subtitle: {
        opacity: 0.8,
    },
    card: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        gap: 10,
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    smallText: {
        fontSize: 13,
        lineHeight: 18,
    },
    errorBanner: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        flex: 1,
        borderRadius: 10,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 10,
    },
    actionText: {
        color: '#fff',
        fontWeight: '700',
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    sendButton: {
        borderRadius: 10,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    logList: {
        gap: 8,
    },
    logItem: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        gap: 4,
    },
    logDirection: {
        fontSize: 12,
        fontWeight: '700',
    },
    manualConnectButton: {
        marginTop: 6,
        borderRadius: 8,
        minHeight: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ledButton: {
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    ledButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
});
