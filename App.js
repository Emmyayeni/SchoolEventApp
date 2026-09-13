import {
  useFonts,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { ToastProvider } from "./src/components/Toast";
import { AuthProvider } from "./src/context/AuthContext";
import { EventsProvider } from "./src/context/EventsContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { ThemeProvider, useAppTheme } from "./src/theme/theme";

function ThemedShell({ children }) {
  const { colors, isDark } = useAppTheme();
  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.background} translucent={false} />
      <ErrorBoundary>{children}</ErrorBoundary>
    </SafeAreaView>
  );
}

export default function App() {
  const [themeMode, setThemeMode] = useState("system");
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider mode={themeMode} setMode={setThemeMode}>
        <ToastProvider>
          <AuthProvider>
            <EventsProvider>
              <ThemedShell>
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </ThemedShell>
            </EventsProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
