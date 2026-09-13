import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../components/AppText";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

const tabs = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
  { key: "search", label: "Explore", icon: "compass-outline", activeIcon: "compass" },
  {
    key: "notifications",
    label: "Alerts",
    icon: "notifications-outline",
    activeIcon: "notifications",
  },
  { key: "my-events", label: "Saved", icon: "bookmark-outline", activeIcon: "bookmark" },
  { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
];

export default function BottomTabs({ activeTab, onChange, isStaff = false, unreadCount = 0 }) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark, insets);

  const handleTabPress = (tabKey) => {
    if (tabKey !== activeTab) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_e) {
        // Safe fallback if haptics unavailable
      }
      onChange(tabKey);
    }
  };

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={styles.islandWrapper}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          const label = tab.key === "my-events" && isStaff ? "Events" : tab.label;
          const iconName = tab.key === "my-events" && isStaff ? "calendar-outline" : tab.icon;
          const activeIconName = tab.key === "my-events" && isStaff ? "calendar" : tab.activeIcon;
          const showBadge = tab.key === "notifications" && unreadCount > 0;

          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[styles.item, active && styles.itemActive]}
              hitSlop={8}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={active ? activeIconName : iconName}
                  size={active ? 20 : 19}
                  color={active ? (isDark ? "#34d399" : colors.primary) : colors.textSubtle}
                />
                {showBadge && (
                  <View style={styles.badgeIndicator}>
                    {unreadCount > 1 && (
                      <AppText style={styles.badgeText}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </AppText>
                    )}
                  </View>
                )}
              </View>
              <AppText style={[styles.label, active && styles.activeLabel]}>{label}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (colors, isDark, insets) =>
  StyleSheet.create({
    outerContainer: {
      width: "100%",
      backgroundColor: "transparent",
      paddingHorizontal: scale(12),
      paddingBottom: Math.max(insets?.bottom ?? 0, 8),
      paddingTop: 4,
    },
    islandWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      backgroundColor: isDark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.98)",
      borderRadius: scale(26),
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.09)" : "rgba(0, 0, 0, 0.06)",
      paddingVertical: scale(6),
      paddingHorizontal: scale(6),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.45 : 0.09,
      shadowRadius: 14,
      elevation: 10,
    },
    item: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      paddingVertical: scale(6),
      paddingHorizontal: scale(4),
      borderRadius: scale(18),
      gap: scale(2),
    },
    itemActive: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.16)" : "rgba(11, 122, 36, 0.1)",
    },
    iconContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      width: scale(24),
      height: scale(24),
    },
    badgeIndicator: {
      position: "absolute",
      top: -1,
      right: -4,
      minWidth: scale(8),
      height: scale(8),
      borderRadius: scale(4),
      backgroundColor: "#ef4444",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: isDark ? "#0f172a" : "#ffffff",
    },
    badgeText: {
      color: "#ffffff",
      fontSize: ms(8),
      fontWeight: "800",
      paddingHorizontal: 2,
    },
    label: {
      fontSize: ms(10),
      color: colors.textSubtle,
      fontWeight: "600",
      textAlign: "center",
    },
    activeLabel: {
      color: isDark ? "#34d399" : colors.primary,
      fontWeight: "800",
    },
  });
