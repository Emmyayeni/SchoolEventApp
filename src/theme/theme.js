import { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

export const BRAND_GREEN = "#0b7a24";

const palette = {
  light: {
    background: "#f6f8f3",
    surface: "#ffffff",
    surfaceAlt: "#edf2eb",
    border: "#cfd8ce",
    borderSoft: "#dfe6dc",
    text: "#17241c",
    textMuted: "#45564b",
    textSubtle: "#66766b",
    primary: "#0b7a24",
    primaryContrast: "#ffffff",
    accent: "#166534",
    accentContrast: "#ffffff",
    accentTint: "#dcfce7",
    surfaceSunken: "#e9eee6",
    borderStrong: "#91a095",
    success: "#15803d",
    warning: "#a16207",
    error: "#ef4444",
    unreadBg: "#edf4ea",
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
    background: "#0b141a",
    surface: "#111b21",
    surfaceAlt: "#202c33",
    border: "#3b4a54",
    borderSoft: "#2a3942",
    text: "#e9edef",
    textMuted: "#c1cbd1",
    textSubtle: "#8696a0",
    primary: "#0b7a24",
    primaryContrast: "#ffffff",
    accent: "#00a884",
    accentContrast: "#ffffff",
    accentTint: "#103b36",
    surfaceSunken: "#080f13",
    borderStrong: "#667781",
    success: "#00a884",
    warning: "#facc15",
    error: "#ef4444",
    unreadBg: "#182a30",
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
