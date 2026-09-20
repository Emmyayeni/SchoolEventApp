import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../components/Avatar";
import { AppText } from "../components/AppText";
import EventCard from "../components/EventCard";
import { EventSkeletonCard } from "../components/SkeletonLoader";
import { useAppTheme } from "../theme/theme";
import { ms } from "../utils/responsive";
import { homeEventSelection } from "../utils/eventPresentation";
import { useCurrentTime } from "../utils/useCurrentTime";

export default function HomeScreen({ user, dashboardType = "student", bookmarkedEventIds = [], registeredEventIds = [], waitlistedEventIds = [], events = [], featuredEvents = [], announcements = [], notifications = [], onToggleBookmark, onOpenNotifications, onOpenEvent, onOpenProfile, onActivateSearch, onOpenAnnouncementDetails, onCreateEvent, onOpenManageEvents, refreshing = false, onRefreshData, onOpenSidebar }) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [filter, setFilter] = useState("All");
  const now = useCurrentTime();
  const selected = useMemo(() => homeEventSelection(events, filter, now), [events, filter, now]);
  const featured = selected.find(item => featuredEvents.some(candidate => candidate.id === item.id)) || selected[0];
  const list = selected.filter(item => item.id !== featured?.id);
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || "there";
  const unread = notifications.filter(item => !item.read && !item.isRead).length;
  const isOrganizer = dashboardType === "staff";
  const announcement = announcements[0];
  const renderCard = (item, spotlight = false) => <EventCard {...item} featured={spotlight} compact={!spotlight} registrationStatus={registeredEventIds.includes(item.id) ? "Registered" : waitlistedEventIds.includes(item.id) ? "On waitlist" : undefined} bookmarked={bookmarkedEventIds.includes(item.id)} onToggleBookmark={onToggleBookmark} onPress={onOpenEvent} />;

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <View style={styles.appBar}>
        <Pressable style={styles.iconButton} onPress={onOpenSidebar} accessibilityRole="button" accessibilityLabel="Open menu"><Ionicons name="menu-outline" size={25} color={colors.text} /></Pressable>
        <View style={styles.brand}><Ionicons name="school-outline" size={21} color={colors.accent} /><AppText style={styles.brandText}>NSUK Events</AppText></View>
        <Pressable style={styles.iconButton} onPress={onOpenNotifications} accessibilityRole="button" accessibilityLabel={`Notifications${unread ? `, ${unread} unread` : ""}`}>
          <Ionicons name="notifications-outline" size={23} color={colors.text} />
          {unread > 0 && <View style={styles.badge}><AppText style={styles.badgeText}>{unread > 9 ? "9+" : unread}</AppText></View>}
        </Pressable>
      </View>
      <FlatList
        data={list}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => renderCard(item)}
        refreshing={refreshing}
        onRefresh={onRefreshData}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<>
          <View style={styles.greetingRow}>
            <View style={styles.greetingCopy}><AppText style={styles.greeting}>Hello, {firstName}.</AppText><AppText style={styles.subtitle}>Find your next campus moment.</AppText></View>
            <Pressable style={styles.avatarButton} onPress={onOpenProfile} accessibilityRole="button" accessibilityLabel="Open profile"><Avatar uri={user?.avatar} name={user?.fullName || ""} size={48} /></Pressable>
          </View>
          <Pressable style={styles.search} onPress={() => onActivateSearch?.("")} accessibilityRole="button" accessibilityLabel="Search campus events"><Ionicons name="search-outline" size={22} color={colors.textMuted} /><AppText style={styles.searchText}>Search events and venues</AppText><Ionicons name="arrow-forward" size={20} color={colors.accent} /></Pressable>
          {isOrganizer && <View style={styles.organizer}>
            <View style={styles.sectionRow}><View style={styles.flex}><AppText style={styles.sectionTitle}>Bring campus together</AppText><AppText style={styles.subtitle}>Create and manage your events.</AppText></View><Ionicons name="calendar-outline" size={25} color={colors.accent} /></View>
            <View style={styles.organizerActions}><Pressable style={styles.primaryButton} onPress={onCreateEvent} accessibilityRole="button" accessibilityLabel="Create event"><Ionicons name="add" size={20} color="#fff" /><AppText style={styles.primaryText}>Create event</AppText></Pressable><Pressable style={styles.textButton} onPress={onOpenManageEvents} accessibilityRole="button" accessibilityLabel="Manage events"><AppText style={styles.linkText}>Manage</AppText><Ionicons name="arrow-forward" size={18} color={colors.accent} /></Pressable></View>
          </View>}
          <View style={styles.filters} accessibilityRole="tablist">
            {["All", "Today", "This week"].map(label => <Pressable key={label} onPress={() => setFilter(label)} style={[styles.filter, filter === label && styles.activeFilter]} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: filter === label }}><AppText style={[styles.filterText, filter === label && styles.activeFilterText]}>{label}</AppText></Pressable>)}
          </View>
          {!!announcement && <Pressable style={styles.announcement} onPress={() => onOpenAnnouncementDetails?.(announcement.id)} accessibilityRole="button" accessibilityLabel={`Campus notice: ${announcement.title}`}><View style={styles.noticeIcon}><Ionicons name="megaphone-outline" size={20} color={isDark ? "#facc15" : "#7b5b15"} /></View><View style={styles.flex}><AppText style={styles.noticeLabel}>CAMPUS NOTICE</AppText><AppText style={styles.noticeTitle} numberOfLines={1}>{announcement.title}</AppText></View><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></Pressable>}
          {featured && <><View style={styles.sectionRow}><AppText style={styles.sectionTitle}>{filter === "All" ? "Don't miss this" : filter === "Today" ? "Happening today" : "On this week"}</AppText></View>{renderCard(featured, true)}</>}
          {list.length > 0 && <View style={styles.sectionRow}><AppText style={styles.sectionTitle}>More to explore</AppText><Pressable style={styles.textButton} onPress={() => onActivateSearch?.("")} accessibilityRole="button" accessibilityLabel="Explore all events"><AppText style={styles.linkText}>See all</AppText><Ionicons name="arrow-forward" size={17} color={colors.accent} /></Pressable></View>}
        </>}
        ListEmptyComponent={!featured ? refreshing ? <EventSkeletonCard /> : <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="calendar-outline" size={32} color={colors.accent} /></View><AppText style={styles.sectionTitle}>{filter === "Today" ? "A quieter day on campus" : "More campus moments soon"}</AppText><AppText style={styles.emptyText}>{filter === "All" ? "Upcoming events will appear here when they are published." : "No events match this date filter. Browse all upcoming events instead."}</AppText><Pressable style={styles.textButton} onPress={() => filter === "All" ? onActivateSearch?.("") : setFilter("All")} accessibilityRole="button"><AppText style={styles.linkText}>{filter === "All" ? "Explore events" : "Show all upcoming events"}</AppText><Ionicons name="arrow-forward" size={18} color={colors.accent} /></Pressable></View> : null}
      />
    </View>
  );
}

const createStyles = (colors, isDark) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  appBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 6, backgroundColor: colors.background, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSoft },
  iconButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandText: { fontSize: ms(17), fontWeight: "600", color: colors.text },
  badge: { position: "absolute", right: 1, top: 2, minWidth: 20, height: 20, paddingHorizontal: 4, borderRadius: 10, backgroundColor: colors.error, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingBottom: 18 },
  greetingCopy: { flex: 1 },
  eyebrow: { fontSize: ms(10), fontWeight: "700", letterSpacing: 1.6, color: colors.accent, marginBottom: 8 },
  greeting: { fontSize: ms(29), lineHeight: ms(36), fontWeight: "600", color: colors.text },
  subtitle: { fontSize: ms(14), lineHeight: ms(21), color: colors.textMuted, marginTop: 5 },
  avatarButton: { padding: 4, borderRadius: 30, borderWidth: 1, borderColor: colors.borderSoft },
  search: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 56, padding: 15, borderRadius: 17, backgroundColor: isDark ? colors.surface : "#fff", borderWidth: 1, borderColor: colors.borderSoft },
  searchText: { flex: 1, fontSize: ms(14), color: colors.textMuted },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 14 },
  filter: { minHeight: 48, paddingHorizontal: 17, paddingVertical: 12, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? colors.surface : "#fff", borderWidth: 1, borderColor: colors.borderSoft },
  activeFilter: { backgroundColor: "#174b33", borderColor: "#174b33" },
  filterText: { fontSize: ms(13), fontWeight: "600", color: colors.textMuted },
  activeFilterText: { color: "#fff" },
  announcement: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: isDark ? colors.surface : "#f3edda", padding: 10, borderRadius: 16, marginBottom: 18 },
  noticeIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  noticeLabel: { fontSize: ms(10), letterSpacing: 1, fontWeight: "700", color: isDark ? "#facc15" : "#7b5b15", marginBottom: 4 },
  noticeTitle: { fontSize: ms(14), lineHeight: ms(20), fontWeight: "500", color: colors.text },
  flex: { flex: 1 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 },
  sectionTitle: { fontSize: ms(19), fontWeight: "600", color: colors.text, flexShrink: 1 },
  textButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 4 },
  linkText: { fontSize: ms(14), fontWeight: "600", color: colors.accent },
  organizer: { padding: 18, backgroundColor: isDark ? colors.surface : "#e9f1e7", borderRadius: 20, marginTop: 18 },
  organizerActions: { flexDirection: "row", alignItems: "center", gap: 18, flexWrap: "wrap" },
  primaryButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, backgroundColor: "#174b33", paddingHorizontal: 18, paddingVertical: 12 },
  primaryText: { color: "#fff", fontSize: ms(14), fontWeight: "600" },
  empty: { paddingVertical: 32, alignItems: "center", gap: 14 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  emptyText: { textAlign: "center", color: colors.textMuted, fontSize: ms(14), lineHeight: ms(22), maxWidth: 290 },
});
