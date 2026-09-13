import { Pressable, StyleSheet, View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MyEventsScreen from "../screens/MyEventsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SavedEventsScreen from "../screens/SavedEventsScreen";
import SearchScreen from "../screens/SearchScreen";
import { useAppTheme } from "../theme/theme";
import BottomTabs from "./BottomTabs";
import { AppText } from "../components/AppText";

export default function AppNavigator({
  activeTab,
  onTabChange,
  isStaff = false,
  homeProps,
  searchProps,
  myEventsProps,
  notificationsProps,
  profileProps,
  savedEventsProps,
  refreshing,
  loadError,
  onRefreshData,
  onCreateEvent,
}) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  const renderActiveScreen = () => {
    if (activeTab === "home") {
      return <HomeScreen {...homeProps} refreshing={refreshing} onRefreshData={onRefreshData} />;
    }
    if (activeTab === "search") {
      return <SearchScreen {...searchProps} />;
    }
    if (activeTab === "registrations") {
      return <MyEventsScreen {...myEventsProps} isStaff={false} refreshing={refreshing} onRefreshData={onRefreshData} />;
    }
    if (activeTab === "my-events") {
      return isStaff ? (
        <MyEventsScreen {...myEventsProps} refreshing={refreshing} onRefreshData={onRefreshData} />
      ) : (
        <SavedEventsScreen {...savedEventsProps} refreshing={refreshing} onRefreshData={onRefreshData} />
      );
    }
    if (activeTab === "notifications") {
      return <NotificationsScreen {...notificationsProps} refreshing={refreshing} onRefreshData={onRefreshData} />;
    }
    return <ProfileScreen {...profileProps} />;
  };

  const unreadCount = (notificationsProps?.notifications || []).filter(
    (n) => !n.read && !n.isRead
  ).length;

  return (
    <View style={styles.container}>
      {!!loadError && <Pressable onPress={onRefreshData} accessibilityRole="button" accessibilityLabel="Retry loading campus updates" style={{ padding: 12, backgroundColor: colors.surfaceAlt }}>
        <AppText style={{ color: colors.error }}>Could not refresh campus updates. Tap to retry.</AppText>
      </Pressable>}
      <View style={styles.contentFrame}>
        <View style={styles.content}>{renderActiveScreen()}</View>
      </View>
      <View style={styles.tabBarWrap}>
        <BottomTabs
          activeTab={activeTab}
          onChange={onTabChange}
          isStaff={isStaff}
          onCreateEvent={onCreateEvent}
          unreadCount={unreadCount}
        />
      </View>
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentFrame: {
      flex: 1,
      width: "100%",
      alignSelf: "center",
      maxWidth: 760,
    },
    content: {
      flex: 1,
    },
    tabBarWrap: {
      width: "100%",
      alignSelf: "center",
      maxWidth: 760,
      backgroundColor: "transparent",
    },
  });
