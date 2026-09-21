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
import * as NativeSplash from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { NavigationBar } from "expo-navigation-bar";
import { Platform, StatusBar as NativeStatusBar, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { ToastProvider } from "./src/components/Toast";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { EventsProvider } from "./src/context/EventsContext";
import AppNavigation from "./src/navigation/AppNavigation";
import { BRAND_GREEN, ThemeProvider, useAppTheme } from "./src/theme/theme";

NativeSplash.preventAutoHideAsync().catch(() => {});

function ThemedShell({ children }) {
  const { colors, isDark } = useAppTheme();
  const { authInitializing, hasSeenOnboarding, passwordRecovery } = useAuth();
  const showingWelcome = !passwordRecovery && (authInitializing || !hasSeenOnboarding);
  const background = showingWelcome ? (isDark ? BRAND_GREEN : "#ffffff") : colors.background;

  useEffect(() => {
    NativeStatusBar.setBarStyle(isDark ? "light-content" : "dark-content", true);
    if (Platform.OS === "android") {
      NativeStatusBar.setBackgroundColor(background, true);
    }
  }, [background, isDark]);

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={[styles.safeArea, { backgroundColor: background }]}>
      <StatusBar animated style={isDark ? "light" : "dark"} backgroundColor={background} translucent={false} />
      <NavigationBar style={isDark ? "dark" : "light"} />
      <ErrorBoundary>{children}</ErrorBoundary>
    </SafeAreaView>
  );
}

export default function App() {
  const [themeMode, setThemeMode] = useState("system");
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("@nsuk/theme").then(mode => {
      if (["system", "light", "dark"].includes(mode)) setThemeMode(mode);
    }).catch(() => {}).finally(() => setThemeReady(true));
  }, []);
  useEffect(() => {
    if (themeReady) AsyncStorage.setItem("@nsuk/theme", themeMode).catch(() => {});
  }, [themeMode, themeReady]);
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  useEffect(() => {
    if (themeReady && (fontsLoaded || fontError)) NativeSplash.hideAsync().catch(() => {});
  }, [themeReady, fontsLoaded, fontError]);

  if (!themeReady || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider mode={themeMode} setMode={setThemeMode}>
        <ToastProvider>
          <AuthProvider>
            <EventsProvider>
              <ThemedShell>
                <AppNavigation />
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
