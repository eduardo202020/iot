import { ArSceneBackground, arColors } from "@/components/museiq/ar-flow";
import { prepareCabezaClavaModel } from "@/components/museiq/cabeza-clava-model-view";
import { getImmersiveExperience, getRoomImmersiveExperience } from "@/lib/room-experiences";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CargandoInmersivoScreen() {
  const { experienceId, roomId } = useLocalSearchParams<{
    experienceId?: string;
    roomId?: string;
  }>();
  const experience = getImmersiveExperience(experienceId) ?? getRoomImmersiveExperience(roomId);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!experience) {
      return;
    }

    let isMounted = true;

    prepareCabezaClavaModel(experience.modelAsset, (nextProgress) => {
      if (isMounted) {
        setProgress(nextProgress);
      }
    })
      .then(() => {
        if (!isMounted) {
          return;
        }

        setProgress(100);
        setTimeout(() => {
          router.replace({
            pathname: "/sala-inmersiva",
            params: { experienceId: experience.id },
          } as never);
        }, 180);
      })
      .catch(() => {
        if (isMounted) {
          router.replace("/home" as never);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [experience]);

  if (!experience) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
          </Pressable>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Modo inmersivo no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.30)" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingCenter}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.progressText}>{`${Math.round(progress)}%`}</Text>
            </View>
          </View>
          <Text style={styles.title}>Preparando modo inmersivo</Text>
          <Text style={styles.subtitle}>
            Cargando la reconstruccion 3D de la sala para entrar en la experiencia.
          </Text>
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
  safeArea: {
    flex: 1,
  },
  loadingCenter: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  ringOuter: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 120,
    borderWidth: 15,
    height: 178,
    justifyContent: "center",
    width: 178,
  },
  ringInner: {
    alignItems: "center",
    borderColor: arColors.primary,
    borderRadius: 999,
    borderWidth: 12,
    height: 128,
    justifyContent: "center",
    width: 128,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "900",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 22,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 320,
    textAlign: "center",
  },
  backButton: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    marginLeft: 14,
    marginTop: 8,
    width: 50,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
});
