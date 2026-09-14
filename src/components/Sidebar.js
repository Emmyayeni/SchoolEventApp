import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Pressable, StyleSheet, View } from "react-native";
import { Avatar } from "./Avatar";
import { AppText } from "./AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(width * 0.75, 300);

export default function Sidebar({
  isOpen,
  onClose,
  user,
  activeTab,
  onNavigate,
  onOpenSettings,
  onLogout,
  onOpenAdminDashboard,
}) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, fade, translateX]);

  if (!isOpen && translateX._value === -SIDEBAR_WIDTH) {
    return null;
  }

  const navItems = [
    { key: "home", label: "Dashboard", icon: "home-outline", activeIcon: "home" },
    { key: "search", label: "Explore Events", icon: "compass-outline", activeIcon: "compass" },
    { key: "my-events", label: ["organizer", "staff", "admin"].includes(user?.accountType) ? "Manage Events" : "Saved Events", icon: "calendar-outline", activeIcon: "calendar" },
    { key: "registrations", label: "My Registrations", icon: "checkmark-circle-outline", activeIcon: "checkmark-circle" },
    { key: "notifications", label: "Notifications", icon: "notifications-outline", activeIcon: "notifications" },
    { key: "profile", label: "My Profile", icon: "person-outline", activeIcon: "person" },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isOpen ? "auto" : "none"}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
            transform: [{ translateX }],
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <View style={styles.header}>
          <Avatar uri={user?.avatar} name={user?.fullName} size={56} style={styles.avatar} />
          <View style={styles.userInfo}>
            <AppText style={[styles.userName, { color: colors.text }]}>{user?.fullName || "User"}</AppText>
            <AppText style={[styles.userEmail, { color: colors.textSubtle }]}>{user?.email}</AppText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />

        <View style={styles.navContainer}>
          {navItems.map((item) => {
            const active = activeTab === item.key;
            return (
              <Pressable
                key={item.key}
                style={[styles.navItem, active && { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}
                onPress={() => {
                  onNavigate(item.key);
                  onClose();
                }}
              >
                <Ionicons
                  name={active ? item.activeIcon : item.icon}
                  size={24}
                  color={active ? colors.primary : colors.textMuted}
                  style={styles.navIcon}
                />
                <AppText style={[styles.navLabel, { color: active ? colors.text : colors.textMuted, fontWeight: active ? "700" : "500" }]}>
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />

        {(user?.accountType === "admin" || user?.role === "admin" || user?.role === "superadmin") && (
          <View style={{ paddingHorizontal: 12 }}>
            <AppText style={[styles.navLabel, { color: colors.textSubtle, fontSize: 12, marginBottom: 8, marginLeft: 12 }]}>Admin Controls</AppText>
            <Pressable
              style={styles.navItem}
              onPress={() => {
                onOpenAdminDashboard("dashboard");
                onClose();
              }}
            >
              <Ionicons name="speedometer-outline" size={24} color={colors.primary} style={styles.navIcon} />
              <AppText style={[styles.navLabel, { color: colors.text }]}>Admin Dashboard</AppText>
            </Pressable>
            <Pressable
              style={styles.navItem}
              onPress={() => {
                onOpenAdminDashboard("users");
                onClose();
              }}
            >
              <Ionicons name="people-outline" size={24} color={colors.textMuted} style={styles.navIcon} />
              <AppText style={[styles.navLabel, { color: colors.textMuted }]}>Manage Users</AppText>
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />
          </View>
        )}

        <View style={styles.bottomActions}>
          <Pressable
            style={styles.navItem}
            onPress={() => {
              onOpenSettings();
              onClose();
            }}
          >
            <Ionicons name="settings-outline" size={24} color={colors.textMuted} style={styles.navIcon} />
            <AppText style={[styles.navLabel, { color: colors.textMuted }]}>App Settings</AppText>
          </Pressable>
          <Pressable
            style={styles.navItem}
            onPress={() => {
              onLogout();
              onClose();
            }}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.error} style={styles.navIcon} />
            <AppText style={[styles.navLabel, { color: colors.error }]}>Log Out</AppText>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 99,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
  divider: {
    height: 1,
    width: "100%",
    marginVertical: 12,
  },
  navContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  navIcon: {
    marginRight: 16,
  },
  navLabel: {
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
  },
  bottomActions: {
    paddingHorizontal: 12,
  },
});
