import { arColors } from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { hasArtworkModelAsset } from "@/lib/artwork-models";
import { resolveArtworkFromQrInput } from "@/lib/qr-codes";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ArtworkMock } from "@/datos";
import type { ComponentType } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type CameraRuntime = {
  CameraView: ComponentType<any>;
  getCameraPermissionsAsync: () => Promise<{ canAskAgain?: boolean; granted: boolean }>;
  requestCameraPermissionsAsync: () => Promise<{ canAskAgain?: boolean; granted: boolean }>;
};

type ScannerState = "loading" | "permission" | "ready" | "blocked" | "native-missing";

export default function ArQrScreen() {
  const insets = useSafeAreaInsets();
  const {
    artworks,
    currentArtwork,
    currentRoom,
    museumProfile,
    selectArtwork,
  } = useMuseIQ();
  const cameraRuntimeRef = useRef<CameraRuntime | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanLockRef = useRef(false);
  const [scannerState, setScannerState] = useState<ScannerState>("loading");
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isOpeningAr, setIsOpeningAr] = useState(false);
  const [invalidQrMessage, setInvalidQrMessage] = useState("");
  const [CameraView, setCameraView] = useState<ComponentType<any> | null>(null);

  const developmentArtworks = useMemo(() => {
    const uniqueArtworks = [currentArtwork, ...artworks].filter(
      (artwork): artwork is ArtworkMock =>
        Boolean(artwork && hasArtworkModelAsset(artwork.id)),
    );
    return Array.from(
      new Map(uniqueArtworks.map((artwork) => [artwork.id, artwork])).values(),
    );
  }, [artworks, currentArtwork]);

  const openArtworkInAr = useCallback(
    (artworkId: string) => {
      console.log("[MuseIQ][AR_QR]", JSON.stringify({
        artworkId,
        event: "safeOpenArStart",
      }));
      selectArtwork(artworkId);
      setIsOpeningAr(true);
      setIsTorchOn(false);
      setInvalidQrMessage("");
      setScannerState("loading");

      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Give expo-camera one frame to unmount before the AR screen mounts its own camera + GLView.
      navigationTimeoutRef.current = setTimeout(() => {
        console.log("[MuseIQ][AR_QR]", JSON.stringify({
          artworkId,
          event: "safeOpenArNavigate",
        }));
        router.replace({
          pathname: "/ar-viro-activo",
          params: { artworkId },
        } as never);
      }, 180);
    },
    [selectArtwork],
  );

  const requestPermission = useCallback(async () => {
    const cameraRuntime = cameraRuntimeRef.current;
    if (!cameraRuntime) {
      setScannerState("native-missing");
      return;
    }

    try {
      const permission = await cameraRuntime.requestCameraPermissionsAsync();
      setScannerState(permission.granted ? "ready" : "blocked");
    } catch {
      setScannerState("native-missing");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCamera = async () => {
      try {
        const cameraModule = await import("expo-camera");
        if (!isMounted) {
          return;
        }

        const cameraRuntime: CameraRuntime = {
          CameraView: cameraModule.CameraView as ComponentType<any>,
          getCameraPermissionsAsync: cameraModule.Camera.getCameraPermissionsAsync,
          requestCameraPermissionsAsync: cameraModule.Camera.requestCameraPermissionsAsync,
        };
        cameraRuntimeRef.current = cameraRuntime;
        setCameraView(() => cameraRuntime.CameraView);

        const permission = await cameraRuntime.getCameraPermissionsAsync();
        if (!isMounted) {
          return;
        }
        setScannerState(
          permission.granted ? "ready" : permission.canAskAgain === false ? "blocked" : "permission",
        );
      } catch {
        if (isMounted) {
          setScannerState("native-missing");
        }
      }
    };

    loadCamera();

    return () => {
      isMounted = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const handleQrScanned = useCallback(
    ({ data }: { data?: string }) => {
      if (!data || scanLockRef.current) {
        return;
      }

      scanLockRef.current = true;
      const artwork = resolveArtworkFromQrInput(data, artworks);

      if (artwork) {
        openArtworkInAr(artwork.id);
        return;
      }

      setInvalidQrMessage("No reconocimos este QR como una obra de MuseIQ.");
      setTimeout(() => {
        scanLockRef.current = false;
        setInvalidQrMessage("");
      }, 1600);
    },
    [artworks, openArtworkInAr],
  );

  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = currentRoom?.name ?? "Sala de prueba";
  const showCamera = !isOpeningAr && scannerState === "ready" && CameraView;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {showCamera ? (
        <CameraView
          active
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          enableTorch={isTorchOn}
          facing="back"
          onBarcodeScanned={handleQrScanned}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={styles.loadingBackdrop}>
          {scannerState === "loading" ? (
            <ActivityIndicator color={arColors.primary} size="large" />
          ) : null}
          {isOpeningAr ? (
            <Text style={styles.loadingText}>Abriendo AR...</Text>
          ) : null}
        </View>
      )}

      <View style={styles.cameraShade} />

      <SafeAreaView style={styles.safeArea}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { top: insets.top + 10 },
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.kicker}>MVP AR</Text>
          <Text style={styles.title}>Escanea el QR de la obra</Text>
          <Text style={styles.subtitle}>
            {museumName} · {roomName}
          </Text>
        </View>

        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          <View style={styles.scanLine} />
        </View>

        {invalidQrMessage ? (
          <View style={styles.feedbackCard}>
            <Ionicons color="#FFD65A" name="warning-outline" size={18} />
            <Text style={styles.feedbackText}>{invalidQrMessage}</Text>
          </View>
        ) : null}

        {scannerState !== "ready" && !isOpeningAr ? (
          <View style={styles.permissionCard}>
            <Ionicons
              color={arColors.primary}
              name={scannerState === "native-missing" ? "build-outline" : "camera-outline"}
              size={28}
            />
            <Text style={styles.permissionTitle}>
              {scannerState === "native-missing"
                ? "Dev client pendiente"
                : scannerState === "blocked"
                  ? "Camara bloqueada"
                  : "Permiso de camara"}
            </Text>
            <Text style={styles.permissionBody}>
              {scannerState === "native-missing"
                ? "Instalamos dependencias nativas. Recompila el dev client para activar expo-camera y ViroReact."
                : scannerState === "blocked"
                  ? "Activa la camara desde ajustes del sistema para escanear QR."
                  : "MuseIQ necesita la camara para leer el QR junto a la obra fisica."}
            </Text>
            {scannerState === "permission" ? (
              <Pressable
                onPress={requestPermission}
                style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
              >
                <Text style={styles.primaryButtonText}>Activar camara</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View style={styles.bottomPanel}>
          <View style={styles.bottomActions}>
            <Pressable
              onPress={() => setIsTorchOn((value) => !value)}
              style={({ pressed }) => [
                styles.iconButton,
                isTorchOn ? styles.iconButtonActive : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#FFFFFF" name="flashlight-outline" size={22} />
            </Pressable>
            <Text style={styles.bottomHint}>
              Apunta al QR. En desarrollo puedes abrir una obra directamente.
            </Text>
          </View>

          <Text style={styles.devArtworkLabel}>Obras AR disponibles</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.devArtworkScroller}
          >
            {developmentArtworks.map((artwork) => (
              <Pressable
                key={artwork.id}
                onPress={() => openArtworkInAr(artwork.id)}
                style={({ pressed }) => [styles.devArtworkButton, pressed ? styles.pressed : null]}
              >
                <Text numberOfLines={1} style={styles.devArtworkTitle}>
                  {artwork.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  loadingBackdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#05080D",
    gap: 12,
    justifyContent: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontWeight: "800",
  },
  cameraShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.18)",
  },
  safeArea: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.62)",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    left: 22,
    position: "absolute",
    width: 58,
    zIndex: 20,
  },
  header: {
    alignItems: "center",
    marginTop: 76,
  },
  kicker: {
    color: arColors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  scanFrame: {
    alignSelf: "center",
    aspectRatio: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: "center",
    maxWidth: 340,
    width: "82%",
  },
  corner: {
    borderColor: "#FFFFFF",
    height: 62,
    position: "absolute",
    width: 62,
  },
  cornerTopLeft: {
    borderLeftWidth: 4,
    borderTopWidth: 4,
    left: -1,
    top: -1,
  },
  cornerTopRight: {
    borderRightWidth: 4,
    borderTopWidth: 4,
    right: -1,
    top: -1,
  },
  cornerBottomLeft: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    bottom: -1,
    left: -1,
  },
  cornerBottomRight: {
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: -1,
    right: -1,
  },
  scanLine: {
    alignSelf: "center",
    backgroundColor: arColors.primary,
    borderRadius: 999,
    height: 3,
    opacity: 0.92,
    width: "74%",
  },
  feedbackCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(5,8,13,0.82)",
    borderColor: "rgba(255,214,90,0.32)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    maxWidth: 340,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  feedbackText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
  },
  permissionCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(5,8,13,0.86)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    maxWidth: 360,
    padding: 18,
    width: "100%",
  },
  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  permissionBody: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: arColors.primary,
    borderRadius: 999,
    justifyContent: "center",
    marginTop: 2,
    minHeight: 42,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#03131E",
    fontSize: 14,
    fontWeight: "900",
  },
  bottomPanel: {
    backgroundColor: "rgba(5,8,13,0.66)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  bottomActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  iconButtonActive: {
    backgroundColor: musePalette.primary,
    borderColor: musePalette.primary,
  },
  bottomHint: {
    color: "rgba(255,255,255,0.78)",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  devArtworkLabel: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  devArtworkScroller: {
    marginHorizontal: -2,
  },
  devArtworkButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    borderWidth: 1,
    marginHorizontal: 3,
    maxWidth: 180,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  devArtworkTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
