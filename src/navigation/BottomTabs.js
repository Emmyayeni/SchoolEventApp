import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

export default function BottomTabs({ activeTab, onChange }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.wrapper}>
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.item, active && styles.itemActive]}
            hitSlop={6}
          >
            <Ionicons
              name={active ? tab.activeIcon : tab.icon}
              size={18}
              color={active ? "#0b7a24" : colors.textSubtle}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surface,
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 7,
      paddingHorizontal: 2,
      shadowColor: "#000000",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },
    item: {
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      flex: 1,
      minHeight: 48,
      borderRadius: 10,
    },
    itemActive: {
      backgroundColor: "#ecfdf3",
    },
    label: {
      fontSize: 10,
      color: colors.textSubtle,
      fontWeight: "700",
    },
    activeLabel: {
      color: "#0b7a24",
      fontWeight: "800",
    },
  });
