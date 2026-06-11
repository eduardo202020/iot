import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ImmersiveEmptyState() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.overlaySafeArea}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Experiencia inmersiva no disponible</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
    overflow: "hidden",
  },
  overlaySafeArea: {
    ...StyleSheet.absoluteFillObject,
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
