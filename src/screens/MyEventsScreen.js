import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View, RefreshControl } from "react-native";
import { AppText } from "../components/AppText";
import { AppTextInput } from "../components/AppTextInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FadeInImage } from "../components/FadeInImage";
import { EmptyState } from "../components/EmptyState";
import { ScalePressable } from "../components/ScalePressable";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function MyEventsScreen({ events, isStaff = false, onOpenEvent, onBack, onOpenNotifications, onCreateEvent, onOpenAnnouncement, refreshing, onRefreshData }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const tabs = isStaff ? ["All", "Published", "Draft", "Cancelled", "Past"] : ["All", "Upcoming", "Past"];

  const preparedEvents = useMemo(() => {
    const withStatus = events.map((item) => {
      const isPast = new Date(`${item.date}T23:59:59`).getTime() < Date.now();
      return { ...item, status: isPast ? "Past" : (item.status || "published") };
    });

    const byTab = activeTab === "All"
      ? withStatus
      : activeTab === "Upcoming"
        ? withStatus.filter((item) => item.status !== "Past" && item.status !== "cancelled")
        : withStatus.filter((item) => item.status.toLowerCase() === activeTab.toLowerCase());

    const needle = searchText.trim().toLowerCase();
    if (!needle) {
      return byTab;
    }

    return byTab.filter((item) => [item.title, item.category].join(" ").toLowerCase().includes(needle));
  }, [activeTab, events, searchText]);

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}> 
      <FlatList
        data={preparedEvents}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} tintColor={colors.primary} />}
        renderItem={({ item }) => <ManageEventCard event={item} onOpenEvent={onOpenEvent} colors={colors} styles={styles} />}
        ListEmptyComponent={
          !refreshing ? (
            <EmptyState
              icon={searchText ? "search" : "calendar"}
              title={searchText ? "No matches found" : `No ${activeTab.toLowerCase()} events`}
              description={searchText ? "Try adjusting your search terms." : "You have no events matching this category."}
            />
          ) : null
        }
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.topRow}>
              <Pressable
                style={styles.iconBtn}
                onPress={onBack}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Ionicons name="arrow-back" size={17} color={colors.accent} />
              </Pressable>
              <AppText style={[styles.title, { color: colors.text }]}>{isStaff ? "Manage Events" : "My Events"}</AppText>
              <Pressable
                style={styles.iconBtn}
                onPress={onOpenNotifications}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons name="notifications" size={16} color={colors.primary} />
              </Pressable>
            </View>

            <AppText style={styles.subtitle}>
              {isStaff
                ? "Create events, publish updates, and manage registrations."
                : "Your registrations and campus event history."}
            </AppText>

            {isStaff && (
              <Pressable
                style={styles.announcementBtn}
                onPress={onOpenAnnouncement}
                accessibilityRole="button"
                accessibilityLabel="Create announcement"
              >
                <Ionicons name="megaphone-outline" size={14} color={colors.primaryContrast} />
                <AppText style={styles.announcementBtnText}>Create Announcement</AppText>
              </Pressable>
            )}

            <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Ionicons name="search" size={16} color={colors.textSubtle} />
              <AppTextInput
                value={searchText}
                onChangeText={setSearchText}
                placeholder={isStaff ? "Search events by name or status" : "Search events to join"}
                placeholderTextColor={colors.textSubtle}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>

            <FlatList
              data={tabs}
              horizontal
              keyExtractor={(item) => item}
              contentContainerStyle={styles.tabsRow}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const active = item === activeTab;
                return (
                  <Pressable
                    style={styles.tabItem}
                    onPress={() => setActiveTab(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item}
                    accessibilityState={{ selected: active }}
                  >
                    <AppText style={[styles.tabText, active && styles.tabTextActive]}>{item}</AppText>
                    {active && <View style={styles.tabIndicator} />}
                  </Pressable>
                );
              }}
            />
          </View>
        }
      />

      {isStaff && (
        <Pressable
          style={styles.fab}
          onPress={onCreateEvent}
          accessibilityRole="button"
          accessibilityLabel="Create event"
        >
          <Ionicons name="add" size={28} color={colors.primaryContrast} />
        </Pressable>
      )}
    </View>
  );
}

function ManageEventCard({ event, onOpenEvent, colors, styles }) {
  const statusColor =
    event.status === "Published" ? colors.primary : event.status === "Draft" ? colors.error : colors.textSubtle;

  return (
    <ScalePressable
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}
      onPress={() => onOpenEvent(event.id)}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      accessibilityHint="Opens event details"
    >
      <FadeInImage source={{ uri: event.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <AppText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {event.title}
          </AppText>
          <Ionicons name="ellipsis-vertical" size={16} color={colors.textSubtle} />
        </View>

        <View style={styles.badgesRow}>
          <AppText style={[styles.badge, styles.badgeGreen]}>{event.category.toUpperCase()}</AppText>
          <AppText style={[styles.badge, { color: statusColor, backgroundColor: colors.surfaceAlt }]}>{event.status.toUpperCase()}</AppText>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.textSubtle} />
          <AppText style={styles.metaText}>{formatDate(event.date)} • {event.time}</AppText>
        </View>
      </View>
    </ScalePressable>
  );
}

function formatDate(dateText) {
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) {
    return dateText;
  }
  return `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}, ${d.getFullYear()}`;
}

const createStyles = (colors) =>
  StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: scale(14),
    paddingBottom: scale(90),
  },
  headerWrap: {
    paddingTop: scale(2),
    marginBottom: scale(8),
  },
  subtitle: {
    marginBottom: scale(8),
    color: colors.textMuted,
    fontSize: ms(12),
    fontWeight: "600",
  },
  announcementBtn: {
    alignSelf: "flex-start",
    minHeight: scale(34),
    borderRadius: 999,
    paddingHorizontal: scale(12),
    marginBottom: scale(9),
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
  },
  announcementBtnText: {
    color: colors.primaryContrast,
    fontSize: ms(12),
    fontWeight: "800",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(10),
  },
  iconBtn: {
    width: scale(28),
    height: scale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: ms(20),
    fontWeight: "900",
  },
  searchWrap: {
    height: scale(44),
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: scale(14),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: scale(10),
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: ms(13),
    fontWeight: "500",
    paddingVertical: 0,
  },
  tabsRow: {
    gap: scale(16),
  },
  tabItem: {
    alignItems: "center",
    paddingBottom: scale(8),
  },
  tabText: {
    color: colors.textSubtle,
    fontSize: ms(13),
    fontWeight: "700",
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: "800",
  },
  tabIndicator: {
    marginTop: scale(5),
    width: scale(24),
    height: scale(2),
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  card: {
    marginBottom: scale(10),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    padding: scale(10),
    flexDirection: "row",
    gap: scale(10),
  },
  cardImage: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(12),
    backgroundColor: colors.border,
  },
  cardBody: {
    flex: 1,
    gap: scale(5),
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: ms(14),
    fontWeight: "800",
    marginRight: scale(6),
  },
  badgesRow: {
    flexDirection: "row",
    gap: scale(6),
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    fontSize: ms(9),
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  badgeGreen: {
    color: colors.accent,
    backgroundColor: colors.surfaceAlt,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
  },
  metaText: {
    color: colors.textSubtle,
    fontSize: ms(12),
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: scale(16),
    bottom: scale(16),
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: colors.text,
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  });
