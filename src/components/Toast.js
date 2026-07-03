import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { Animated, StyleSheet, Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";

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
        <ToastMessage
          message={toastConfig.message}
          type={toastConfig.type}
          slideAnim={slideAnim}
        />
      )}
    </ToastContext.Provider>
  );
}

function ToastMessage({ message, type, slideAnim }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const isSuccess = type === "success";
  const iconName = isSuccess ? "checkmark-circle" : "alert-circle";
  const bgColor = isSuccess ? "#10b981" : "#ef4444";

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
          paddingTop: Math.max(insets.top, 20) + 10,
        },
      ]}
    >
      <View style={[styles.toastContent, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={24} color="#ffffff" style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
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
    paddingHorizontal: 20,
    alignItems: "center",
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 400,
    width: "100%",
  },
  icon: {
    marginRight: 12,
  },
  message: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
});
