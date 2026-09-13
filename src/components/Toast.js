import { createContext, useContext, useState, useRef, useCallback } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toastConfig, setToastConfig] = useState(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef(null);

  const hideToast = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToastConfig(null);
    });
  }, [slideAnim]);

  const showToast = useCallback(
    (message, type = "success", duration = 3000) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToastConfig({ message, type });

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [slideAnim, hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastConfig && (
        <ToastMessage message={toastConfig.message} type={toastConfig.type} slideAnim={slideAnim} />
      )}
    </ToastContext.Provider>
  );
}

function ToastMessage({ message, type, slideAnim }) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const config = {
    success: { bg: colors.success, icon: "checkmark-circle" },
    error: { bg: colors.error, icon: "alert-circle" },
    info: { bg: colors.accent, icon: "information-circle" },
    warning: { bg: colors.warning, icon: "warning" },
  };
  const { bg, icon } = config[type] || config.success;
  // Dark-mode semantic colors are light, so flip the content color to keep contrast.
  const contentColor = isDark ? "#0b0f14" : "#ffffff";

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        { transform: [{ translateY: slideAnim }], paddingTop: Math.max(insets.top, 20) + 10 },
      ]}
      accessibilityLiveRegion="polite"
      accessible
      accessibilityLabel={message}
    >
      <View style={[styles.toastContent, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={contentColor} style={styles.icon} />
        <AppText style={[styles.message, { color: contentColor }]}>{message}</AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    paddingHorizontal: scale(20),
    alignItems: "center",
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 400,
    width: "100%",
  },
  icon: {
    marginRight: scale(12),
  },
  message: {
    fontSize: ms(15),
    fontWeight: "600",
    flex: 1,
  },
});
