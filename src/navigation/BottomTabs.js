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
  { key: "my-events", label: "My Events", icon: "calendar-outline", activeIcon: "calendar" },
  { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
];

export default function BottomTabs({ activeTab, onChange }) {
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
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[styles.item, active && styles.itemActive]}
              hitSlop={8}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={active ? tab.activeIcon : tab.icon}
                  size={22}
                  color={active ? (isDark ? "#34d399" : colors.primary) : colors.textSubtle}
                />
              </View>
              <AppText style={[styles.label, active && styles.activeLabel]}>{tab.label}</AppText>
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
      paddingHorizontal: scale(16),
      paddingBottom: Math.max(insets?.bottom ?? 0, 8),
      paddingTop: 4,
    },
    islandWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      backgroundColor: colors.surface,
      borderRadius: scale(22),
      borderWidth: 1,
      borderColor: colors.borderSoft,
      paddingVertical: scale(7),
      paddingHorizontal: scale(8),
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
      minHeight: 52,
      paddingVertical: scale(5),
      paddingHorizontal: scale(4),
      borderRadius: scale(18),
      gap: scale(2),
    },
    itemActive: {
      backgroundColor: colors.accentTint,
    },
    iconContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      width: scale(24),
      height: scale(24),
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
