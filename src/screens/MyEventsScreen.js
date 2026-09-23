import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../components/AppText";
import { FadeInImage } from "../components/FadeInImage";
import { useAppTheme } from "../theme/theme";
import { formatEventDate, formatEventTimeRange, parseEventDate } from "../utils/eventTime";
import { ms, scale } from "../utils/responsive";
import { personalEventGroups } from "../utils/personalEvents";
import { useCurrentTime } from "../utils/useCurrentTime";

export default function MyEventsScreen({ events = [], isStaff = false, registeredEventIds = [], bookmarkedEventIds = [], onOpenEvent, onOpenNotifications, onCreateEvent, onOpenAnnouncement, onToggleBookmark, refreshing, onRefreshData }) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();
  const now = useCurrentTime();
  const tabs = isStaff ? ["Published", "Drafts", "Past"] : ["Registered", "Saved", "Past"];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const groups = useMemo(() => personalEventGroups(events, { isStaff, registeredEventIds, bookmarkedEventIds, now }), [events, isStaff, registeredEventIds, bookmarkedEventIds, now]);
  const tabEvents = groups[activeTab] || [];
  const tabCount = tab => groups[tab].length;

  return <View style={[styles.page, { paddingTop: insets.top }]}>
    <FlatList
      data={tabEvents}
      keyExtractor={event => String(event.id)}
      renderItem={({ item }) => <PersonalEventCard event={item} isStaff={isStaff} saved={bookmarkedEventIds.includes(item.id)} onOpenEvent={onOpenEvent} onToggleBookmark={onToggleBookmark} colors={colors} styles={styles} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} tintColor={colors.accent} colors={[colors.accent]} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<View>
        <View style={styles.topBar}><View><AppText style={styles.eyebrow}>{isStaff ? "ORGANIZER SPACE" : "YOUR CAMPUS PLANS"}</AppText><AppText style={styles.title}>{isStaff ? "Manage events" : "My events"}</AppText></View><Pressable style={styles.iconButton} onPress={onOpenNotifications} accessibilityRole="button" accessibilityLabel="Open notifications"><Ionicons name="notifications-outline" size={23} color={colors.text} /></Pressable></View>
        <AppText style={styles.subtitle}>{isStaff ? "Publish updates and keep track of your event schedule." : "Everything you registered for or saved, in one place."}</AppText>
        {isStaff && <View style={styles.actions}><Pressable style={styles.primaryButton} onPress={onCreateEvent} accessibilityRole="button"><Ionicons name="add" size={20} color="#fff" /><AppText style={styles.primaryText}>Create event</AppText></Pressable><Pressable style={styles.secondaryButton} onPress={onOpenAnnouncement} accessibilityRole="button"><Ionicons name="megaphone-outline" size={19} color={colors.accent} /><AppText style={styles.secondaryText}>Announcement</AppText></Pressable></View>}
        <View style={styles.tabs} accessibilityRole="tablist">{tabs.map(tab => <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, tab === activeTab && styles.activeTab]} accessibilityRole="tab" accessibilityState={{ selected: tab === activeTab }}><AppText style={[styles.tabText, tab === activeTab && styles.activeTabText]}>{tab}</AppText><View style={[styles.count, tab === activeTab && styles.activeCount]}><AppText style={[styles.countText, tab === activeTab && styles.activeCountText]}>{tabCount(tab)}</AppText></View></Pressable>)}</View>
        <View style={styles.sectionRow}><AppText style={styles.sectionTitle}>{activeTab}</AppText><AppText style={styles.helper}>{tabEvents.length} {tabEvents.length === 1 ? "event" : "events"}</AppText></View>
      </View>}
      ListEmptyComponent={!refreshing && <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={emptyIcon(activeTab)} size={32} color={colors.accent} /></View><AppText style={styles.sectionTitle}>{emptyTitle(activeTab)}</AppText><AppText style={styles.emptyText}>{emptyDescription(activeTab, isStaff)}</AppText>{isStaff && activeTab !== "Past" && <Pressable style={styles.primaryButton} onPress={onCreateEvent} accessibilityRole="button"><Ionicons name="add" size={20} color="#fff" /><AppText style={styles.primaryText}>Create an event</AppText></Pressable>}</View>}
    />
  </View>;
}

function PersonalEventCard({ event, isStaff, saved, onOpenEvent, onToggleBookmark, colors, styles }) {
  const date = parseEventDate(event.date);
  const status = event.status === "published" ? event.timeStatus : event.status;
  const statusLabels = { upcoming: "Upcoming", ongoing: "Happening now", past: "Ended", draft: "Draft", cancelled: "Cancelled", archived: "Archived", unknown: "Schedule pending" };
  return <View style={styles.card}>
    <Pressable style={({ pressed }) => [styles.cardPress, pressed && { opacity: 0.82 }]} onPress={() => onOpenEvent?.(event.id)} accessibilityRole="button" accessibilityLabel={event.title} accessibilityHint="Opens event details">
      <View style={styles.imageWrap}><FadeInImage source={{ uri: event.image }} style={styles.image} /><View style={styles.dateBadge}><AppText style={styles.month}>{date ? formatEventDate(event.date, { month: "short" }).toUpperCase() : "DATE"}</AppText><AppText style={styles.day}>{date ? date.getUTCDate() : "TBC"}</AppText></View></View>
      <View style={styles.cardBody}><View style={styles.badgeRow}><AppText style={styles.category}>{event.category || "Campus event"}</AppText><View style={styles.statusBadge}><View style={[styles.statusDot, ["past", "cancelled", "archived"].includes(status) && { backgroundColor: colors.textSubtle }]} /><AppText style={styles.statusText}>{statusLabels[status] || status}</AppText></View></View><AppText style={styles.cardTitle} numberOfLines={2}>{event.title}</AppText><View style={styles.meta}><Ionicons name="time-outline" size={16} color={colors.textMuted} /><AppText style={styles.metaText}>{formatEventTimeRange(event)}</AppText></View><View style={styles.meta}><Ionicons name="location-outline" size={16} color={colors.textMuted} /><AppText style={styles.metaText} numberOfLines={1}>{event.venue || "Venue to be confirmed"}</AppText></View>{isStaff && <View style={styles.organizerFooter}><Ionicons name="people-outline" size={17} color={colors.accent} /><AppText style={styles.organizerFooterText}>{Number.isFinite(event.registeredCount) ? `${event.registeredCount} registered` : "Registration count unavailable"}</AppText><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></View>}</View>
    </Pressable>
    {!isStaff && saved && <Pressable style={styles.bookmark} onPress={() => onToggleBookmark?.(event.id)} accessibilityRole="button" accessibilityLabel={`Remove ${event.title} from saved events`}><Ionicons name="bookmark" size={20} color="#0b7a24" /></Pressable>}
  </View>;
}

function emptyIcon(tab) { return tab === "Saved" ? "bookmark-outline" : tab === "Past" ? "time-outline" : "calendar-outline"; }
function emptyTitle(tab) { return tab === "Saved" ? "No saved events yet" : tab === "Past" ? "No event history yet" : tab === "Drafts" ? "No drafts" : "Nothing planned yet"; }
function emptyDescription(tab, staff) {
  if (tab === "Saved") return "Save an event from Home or Explore and it will appear here.";
  if (tab === "Past") return staff ? "Completed and cancelled events will appear here." : "Your registered and saved events stay here after they end.";
  if (tab === "Drafts") return "Events you save as drafts will appear here until you publish them.";
  return staff ? "Create an event to begin building your campus schedule." : "Register for an upcoming event and it will appear here.";
}

const getStyles = (colors, isDark) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 28 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { color: colors.accent, fontSize: ms(10), fontWeight: "700", letterSpacing: 1.5, marginBottom: 7 },
  title: { color: colors.text, fontSize: ms(29), lineHeight: ms(36), fontWeight: "600" },
  iconButton: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft },
  subtitle: { color: colors.textMuted, fontSize: ms(14), lineHeight: ms(21), marginTop: 8, marginBottom: 18, maxWidth: 330 },
  actions: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  primaryButton: { minHeight: 48, paddingHorizontal: 17, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "#174b33" },
  primaryText: { color: "#fff", fontSize: ms(14), fontWeight: "600" },
  secondaryButton: { minHeight: 48, paddingHorizontal: 15, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft },
  secondaryText: { color: colors.accent, fontSize: ms(14), fontWeight: "600" },
  tabs: { flexDirection: "row", gap: 8, paddingBottom: 22 },
  tab: { flex: 1, minHeight: 68, paddingHorizontal: 4, paddingVertical: 10, borderRadius: 18, alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft },
  activeTab: { backgroundColor: "#174b33", borderColor: "#174b33" },
  tabText: { color: colors.textMuted, fontSize: ms(13), fontWeight: "600" },
  activeTabText: { color: "#fff" },
  count: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 5, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" },
  activeCount: { backgroundColor: "rgba(255,255,255,0.18)" },
  countText: { color: colors.textMuted, fontSize: ms(10), fontWeight: "700" },
  activeCountText: { color: "#fff" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { color: colors.text, fontSize: ms(19), lineHeight: ms(25), fontWeight: "600", flexShrink: 1 },
  helper: { color: colors.textMuted, fontSize: ms(12) },
  card: { borderRadius: 20, overflow: "hidden", marginBottom: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft },
  cardPress: { flexDirection: "row", minHeight: 150 },
  imageWrap: { width: scale(116), position: "relative", backgroundColor: colors.surfaceAlt },
  image: { width: "100%", height: "100%" },
  dateBadge: { position: "absolute", left: 10, top: 10, minWidth: 48, borderRadius: 12, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: "#fff", alignItems: "center" },
  month: { color: "#0b7a24", fontSize: ms(9), fontWeight: "700", letterSpacing: 0.7 },
  day: { color: "#203729", fontSize: ms(19), fontWeight: "700" },
  cardBody: { flex: 1, padding: 14, gap: 7 },
  badgeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 7 },
  category: { color: colors.accent, fontSize: ms(11), fontWeight: "600", flexShrink: 1 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  statusText: { color: colors.textMuted, fontSize: ms(10) },
  cardTitle: { color: colors.text, fontSize: ms(17), lineHeight: ms(22), fontWeight: "600" },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: colors.textMuted, fontSize: ms(12), flex: 1 },
  organizerFooter: { flexDirection: "row", alignItems: "center", gap: 7, borderTopWidth: 1, borderColor: colors.borderSoft, paddingTop: 9, marginTop: 2 },
  organizerFooterText: { color: colors.textMuted, fontSize: ms(11), flex: 1 },
  bookmark: { position: "absolute", left: scale(61), bottom: 10, width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingVertical: 52, gap: 13 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.textMuted, fontSize: ms(14), lineHeight: ms(21), textAlign: "center", maxWidth: 290 },
});
