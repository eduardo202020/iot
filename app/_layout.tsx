import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { MuseIQProvider } from "@/providers/museiq-provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MuseIQProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="seleccionar-museo" />
            <Stack.Screen name="preparacion-visita" />
            <Stack.Screen name="obra-identificada" />
            <Stack.Screen name="modelo-3d-no-disponible" />
            <Stack.Screen name="qr-invalido" />
            <Stack.Screen name="codigo-manual" />
            <Stack.Screen name="sin-conexion" />
            <Stack.Screen name="error-conexion" />
            <Stack.Screen name="cargando-ar" />
            <Stack.Screen name="cargando-inmersivo" />
            <Stack.Screen name="ar-qr" />
            <Stack.Screen name="ar-viro-activo" />
            <Stack.Screen name="ar-no-disponible" />
            <Stack.Screen name="ar-activo" />
            <Stack.Screen name="ar-chat-ia" />
            <Stack.Screen name="ar-hotspot-seleccionado" />
            <Stack.Screen name="ar-audio-activo" />
            <Stack.Screen name="sala-inmersiva" />
            <Stack.Screen name="visor-3d" />
            <Stack.Screen name="artwork-detail" />
            <Stack.Screen name="artwork-images" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen
              name="pregunta-voz-modal"
              options={{ presentation: "transparentModal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="permissions-modal"
              options={{ presentation: "transparentModal", animation: "slide_from_bottom" }}
            />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </MuseIQProvider>
    </GestureHandlerRootView>
  );
}
