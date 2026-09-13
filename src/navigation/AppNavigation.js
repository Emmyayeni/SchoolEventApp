import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventsContext";
import { addNotificationReceivedListener, addNotificationResponseListener, getInitialNotificationData } from "../services/notifications";
import RootNavigator from "./RootNavigator";

export default function AppNavigation() {
  const navigation = useNavigationContainerRef();
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
  return <NavigationContainer ref={navigation} onReady={() => setReady(true)}><RootNavigator /></NavigationContainer>;
}
