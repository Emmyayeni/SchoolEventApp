import { StyleSheet, View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import MyEventsScreen from "../screens/MyEventsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SearchScreen from "../screens/SearchScreen";
import { useAppTheme } from "../theme/theme";
import BottomTabs from "./BottomTabs";

export default function AppNavigator({
  activeTab,
  onTabChange,
  isStaff = false,
  homeProps,
  searchProps,
  myEventsProps,
  notificationsProps,
  profileProps,
}) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  const renderActiveScreen = () => {
    if (activeTab === "home") {
      return <HomeScreen {...homeProps} />;
    }
    if (activeTab === "search") {
      return <SearchScreen {...searchProps} />;
    }
    if (activeTab === "my-events") {
      return <MyEventsScreen {...myEventsProps} />;
    }
    if (activeTab === "notifications") {
      return <NotificationsScreen {...notificationsProps} />;
    }
    return <ProfileScreen {...profileProps} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentFrame}>
        <View style={styles.content}>{renderActiveScreen()}</View>
      </View>
      <View style={styles.tabBarWrap}>
        <BottomTabs activeTab={activeTab} onChange={onTabChange} isStaff={isStaff} />
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
      alignSelf: "stretch",
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: colors.background,
    },
  });
