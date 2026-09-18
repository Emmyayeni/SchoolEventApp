import { DarkTheme, DefaultTheme, NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventsContext";
import { addNotificationReceivedListener, addNotificationResponseListener, getInitialNotificationData } from "../services/notifications";
import RootNavigator from "./RootNavigator";
import { useAppTheme } from "../theme/theme";

export default function AppNavigation() {
  const navigation = useNavigationContainerRef();
  const { colors, isDark } = useAppTheme();
  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return { ...base, colors: { ...base.colors, background: colors.background, card: colors.background, text: colors.text, border: colors.borderSoft, primary: colors.accent, notification: colors.error } };
  }, [colors, isDark]);
  const { isAuthenticated } = useAuth();
  const { handleRefresh, refreshing, events, announcements } = useEvents();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(null);
  useEffect(() => {
    let active = true;
    getInitialNotificationData().then(data => { if (active && data) setPending(data); });
    const response = addNotificationResponseListener(data => setPending(data));
    return () => { active = false; response.remove(); };
  }, []);
  useEffect(() => {
    if (!isAuthenticated) return;
    const received = addNotificationReceivedListener(() => handleRefresh());
    return () => received.remove();
  }, [isAuthenticated, handleRefresh]);
  useEffect(() => {
    if (!pending || !isAuthenticated || !ready || refreshing || !navigation.isReady()) return;
    if (pending.eventId) navigation.navigate("EventDetails", { eventId: pending.eventId });
    else if (pending.announcementId) navigation.navigate("AnnouncementDetails", { announcementId: pending.announcementId });
    setPending(null);
  }, [pending, isAuthenticated, ready, refreshing, navigation, events, announcements]);
  return <NavigationContainer theme={navigationTheme} ref={navigation} onReady={() => setReady(true)}><RootNavigator /></NavigationContainer>;
}
