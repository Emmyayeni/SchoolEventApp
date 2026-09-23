import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../components/AppText";
import { EmptyState } from "../components/EmptyState";
import NotificationItem from "../components/NotificationItem";
import { useAppTheme } from "../theme/theme";

export default function NotificationsScreen({ notifications = [], onPressItem, onMarkAllRead, onBack, refreshing = false, onRefreshData }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [marking, setMarking] = useState(false);
  const unread = notifications.filter(item => !item.isRead).length;
  const markRead = async () => {
    if (marking || !unread || !onMarkAllRead) return;
    setMarking(true);
    try { await onMarkAllRead(); } finally { setMarking(false); }
  };
  return <View style={[styles.page, { backgroundColor: colors.background, paddingTop: insets.top }]}>
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.button} accessibilityRole="button" accessibilityLabel="Go back"><Ionicons name="arrow-back" size={24} color={colors.text} /></Pressable>
      <AppText style={[styles.title, { color: colors.text }]}>Notifications</AppText>
    </View>
    <View style={styles.actions}>
      <AppText style={{ color: colors.textMuted }} accessibilityLiveRegion="polite">{unread ? `${unread} unread` : "All caught up"}</AppText>
      <Pressable onPress={markRead} disabled={!unread || marking} style={styles.markButton} accessibilityRole="button" accessibilityLabel="Mark all as read" accessibilityState={{ disabled: !unread || marking, busy: marking }}>
        {marking ? <ActivityIndicator color={colors.accent} /> : <Ionicons name="checkmark-done" size={20} color={unread ? colors.accent : colors.textSubtle} />}
        <AppText style={{ color: unread ? colors.accent : colors.textSubtle }}>{marking ? "Saving..." : "Mark all as read"}</AppText>
      </Pressable>
    </View>
    <FlatList data={notifications} keyExtractor={item => String(item.id)} refreshing={refreshing} onRefresh={onRefreshData} contentContainerStyle={styles.list}
      renderItem={({ item }) => <NotificationItem {...item} onPress={() => onPressItem?.(item)} />}
      ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="No notifications yet" description="Event updates and announcements will appear here." />} />
  </View>;
}
const styles = StyleSheet.create({
  page: { flex: 1 }, header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12 },
  button: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 23, fontWeight: "700", flexShrink: 1 },
  actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, gap: 8 },
  markButton: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8 },
  list: { padding: 16, paddingBottom: 24 },
});
