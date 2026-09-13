import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import AdminAnalyticsScreen from "../screens/AdminAnalyticsScreen";
import AdminDashboard from "../screens/AdminDashboard";
import AdminSettingsScreen from "../screens/AdminSettingsScreen";
import ManageEventsScreen from "../screens/ManageEventsScreen";
import ManageUsersScreen from "../screens/ManageUsersScreen";
import { useAppTheme } from "../theme/theme";

export default function AdminNavigator({
  activeScreen = "dashboard",
  onNavigate,
  dashboardProps,
  manageEventsProps,
  manageUsersProps,
  analyticsProps,
  settingsProps,
  refreshing,
  onRefreshData,
}) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return <AdminDashboard {...dashboardProps} refreshing={refreshing} onRefreshData={onRefreshData} />;
      case "events":
        return <ManageEventsScreen {...manageEventsProps} refreshing={refreshing} onRefreshData={onRefreshData} />;
      case "users":
        return <ManageUsersScreen {...manageUsersProps} refreshing={refreshing} onRefreshData={onRefreshData} />;
      case "analytics":
        return <AdminAnalyticsScreen {...analyticsProps} refreshing={refreshing} onRefreshData={onRefreshData} />;
      case "settings":
        return <AdminSettingsScreen {...settingsProps} />;
      default:
        return <AdminDashboard {...dashboardProps} refreshing={refreshing} onRefreshData={onRefreshData} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderActiveScreen()}</View>
      <View style={[styles.tabBar, { borderTopColor: colors.borderSoft, backgroundColor: colors.surface }]}>
        <AdminTab
          label="Home"
          icon="grid-outline"
          active={activeScreen === "dashboard"}
          onPress={() => onNavigate?.("dashboard")}
          colors={colors}
          styles={styles}
        />
        <AdminTab
          label="Events"
          icon="calendar-outline"
          active={activeScreen === "events"}
          onPress={() => onNavigate?.("events")}
          colors={colors}
          styles={styles}
        />
        <AdminTab
          label="Users"
          icon="people-outline"
          active={activeScreen === "users"}
          onPress={() => onNavigate?.("users")}
          colors={colors}
          styles={styles}
        />
        <AdminTab
          label="Analytics"
          icon="bar-chart-outline"
          active={activeScreen === "analytics"}
          onPress={() => onNavigate?.("analytics")}
          colors={colors}
          styles={styles}
        />
        <AdminTab
          label="Settings"
          icon="settings-outline"
          active={activeScreen === "settings"}
          onPress={() => onNavigate?.("settings")}
          colors={colors}
          styles={styles}
        />
      </View>
    </View>
  );
}

function AdminTab({ label, icon, active, onPress, colors, styles }) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Ionicons name={icon} size={18} color={active ? colors.primary : colors.textMuted} />
      <AppText style={[styles.tabLabel, { color: active ? colors.primary : colors.textMuted }]}>{label}</AppText>
    </Pressable>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    tabBar: {
      flexDirection: "row",
      borderTopWidth: 1,
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    tabLabel: {
      fontSize: 10,
      fontWeight: "700",
    },
  });
