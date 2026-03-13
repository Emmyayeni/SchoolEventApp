import { createContext, useContext, useMemo } from "react";

const palette = {
  light: {
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceAlt: "#f1f5f9",
    border: "#cbd5e1",
    borderSoft: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#475569",
    textSubtle: "#64748b",
    primary: "#0f172a",
    primaryContrast: "#ffffff",
    accent: "#0369a1",
    error: "#b91c1c",
    unreadBg: "#f0f9ff",
    unreadBorder: "#0ea5e9",
  },
  dark: {
    background: "#020617",
    surface: "#0f172a",
    surfaceAlt: "#1e293b",
    border: "#334155",
    borderSoft: "#334155",
    text: "#f8fafc",
    textMuted: "#cbd5e1",
    textSubtle: "#94a3b8",
    primary: "#38bdf8",
    primaryContrast: "#082f49",
    accent: "#7dd3fc",
    error: "#fca5a5",
    unreadBg: "#082f49",
    unreadBorder: "#38bdf8",
  },
};

const ThemeContext = createContext({
  mode: "light",
  isDark: false,
  colors: palette.light,
  setMode: () => {},
  toggleMode: () => {},
});

export function getThemeColors(mode) {
  return palette[mode] || palette.light;
}

export function ThemeProvider({ mode, setMode, children }) {
  const value = useMemo(() => {
    const isDark = mode === "dark";
    return {
      mode,
      isDark,
      colors: getThemeColors(mode),
      setMode,
      toggleMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    };
  }, [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
