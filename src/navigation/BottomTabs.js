import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";

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

export default function BottomTabs({ activeTab, onChange, isStaff = false }) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 7) }]}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const label = tab.key === "my-events" && isStaff ? "Events" : tab.label;
        const iconName = tab.key === "my-events" && isStaff ? "calendar-outline" : tab.icon;
        const activeIconName = tab.key === "my-events" && isStaff ? "calendar" : tab.activeIcon;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.item, active && styles.itemActive]}
            hitSlop={6}
          >
            <Ionicons
              name={active ? activeIconName : iconName}
              size={18}
              color={active ? (isDark ? colors.accent : colors.primary) : colors.textSubtle}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    wrapper: {
      width: "100%",
      borderRadius: 0,
      backgroundColor: colors.surface,
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 7,
      paddingHorizontal: 2,
    },
    item: {
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      flex: 1,
      minHeight: 48,
      borderRadius: 0,
    },
    itemActive: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
    },
    label: {
      fontSize: 10,
      color: colors.textSubtle,
      fontWeight: "700",
    },
    activeLabel: {
      color: isDark ? colors.accent : colors.primary,
      fontWeight: "800",
    },
  });
