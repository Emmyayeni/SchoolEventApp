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
    accentContrast: "#ffffff",
    accentTint: "#dcfce7",
    surfaceSunken: "#f1f5f9",
    borderStrong: "#94a3b8",
    success: "#15803d",
    warning: "#a16207",
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
    accentContrast: "#ffffff",
    accentTint: "#123b25",
    surfaceSunken: "#020617",
    borderStrong: "#64748b",
    success: "#4ade80",
    warning: "#facc15",
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

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: "700" },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: "700" },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: "600" },
  h3: { fontSize: 17, lineHeight: 24, fontWeight: "600" },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 32, "4xl": 40 };

export const radii = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

export function makeShadows(colors, isDark) {
  if (isDark) {
    return { none: {}, sm: {}, card: {} };
  }
  return {
    none: {},
    sm: {
      shadowColor: colors.border,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    card: {
      shadowColor: colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
  };
}

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
