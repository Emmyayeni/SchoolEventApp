import { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

const palette = {
  light: {
    background: "#ffffff",
    surface: "#f8fafc",
    surfaceAlt: "#f1f5f9",
    border: "#d5dbe2",
    borderSoft: "#e2e8f0",
    text: "#1f2937",
    textMuted: "#475569",
    textSubtle: "#64748b",
    primary: "#0b7a24",
    primaryContrast: "#ffffff",
    accent: "#166534",
    error: "#ef4444",
    unreadBg: "#f1f5f9",
    unreadBorder: "#0b7a24",
    overlay: "rgba(0, 0, 0, 0.36)",
    overlayStrong: "rgba(17, 24, 39, 0.55)",
    overlayStronger: "rgba(17, 24, 39, 0.65)",
    alphaWhite10: "rgba(255, 255, 255, 0.10)",
    alphaWhite12: "rgba(255, 255, 255, 0.12)",
    alphaWhite14: "rgba(255, 255, 255, 0.14)",
    alphaWhite18: "rgba(255, 255, 255, 0.18)",
    alphaWhite24: "rgba(255, 255, 255, 0.24)",
    alphaTextHigh: "rgba(241, 245, 249, 0.95)",
    alphaTextLow: "rgba(226, 232, 240, 0.55)",
  },
  dark: {
    background: "#030318",
    surface: "#0f172a",
    surfaceAlt: "#1e293b",
    border: "#334155",
    borderSoft: "#334155",
    text: "#f8fafc",
    textMuted: "#cbd5e1",
    textSubtle: "#94a3b8",
    primary: "#0b7a24",
    primaryContrast: "#ffffff",
    accent: "#166534",
    error: "#ef4444",
    unreadBg: "#0f172a",
    unreadBorder: "#0b7a24",
    overlay: "rgba(0, 0, 0, 0.36)",
    overlayStrong: "rgba(17, 24, 39, 0.55)",
    overlayStronger: "rgba(17, 24, 39, 0.65)",
    alphaWhite10: "rgba(255, 255, 255, 0.10)",
    alphaWhite12: "rgba(255, 255, 255, 0.12)",
    alphaWhite14: "rgba(255, 255, 255, 0.14)",
    alphaWhite18: "rgba(255, 255, 255, 0.18)",
    alphaWhite24: "rgba(255, 255, 255, 0.24)",
    alphaTextHigh: "rgba(241, 245, 249, 0.95)",
    alphaTextLow: "rgba(226, 232, 240, 0.55)",
  },
};

const ThemeContext = createContext({
  mode: "system",
  resolvedMode: "light",
  isDark: false,
  colors: palette.light,
  setMode: () => {},
  toggleMode: () => {},
});

export function getThemeColors(mode) {
  return palette[mode] || palette.light;
}

export function ThemeProvider({ mode, setMode, children }) {
  const systemScheme = useColorScheme();
  const value = useMemo(() => {
    const resolvedMode = mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;
    const isDark = resolvedMode === "dark";
    return {
      mode,
      resolvedMode,
      isDark,
      colors: getThemeColors(resolvedMode),
      setMode,
      toggleMode: () => setMode((prev) => (prev === "dark" ? "light" : "dark")),
    };
  }, [mode, setMode, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
