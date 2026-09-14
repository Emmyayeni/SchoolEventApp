import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { AppTextInput } from "../components/AppTextInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";
import { eventTimeStatus } from "../utils/eventTime";
import { useCurrentTime } from "../utils/useCurrentTime";

export default function ManageEventsScreen({
  events = [],
  onBack,
  onCreateEvent,
  onEditEvent,
  onDeleteEvent,
  onViewEventDetails,
  refreshing,
  onRefreshData,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, upcoming, past
  const nowTs = useCurrentTime();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const filteredEvents = useMemo(() => {
    let result = events;

    // Filter by search text
    if (searchText.trim()) {
      const needle = searchText.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(needle) || e.organizer?.toLowerCase().includes(needle));
    }

    // Filter by status
    if (filterStatus === "upcoming") {
      result = result.filter((e) => e.status === "published" && ["upcoming", "ongoing"].includes(eventTimeStatus(e, nowTs)));
    } else if (filterStatus === "past") {
      result = result.filter((e) => eventTimeStatus(e, nowTs) === "past");
    }

    return result;
  }, [events, searchText, filterStatus, nowTs]);

  const handleDeleteEvent = (event) => {
    Alert.alert("Delete Event", `Are you sure you want to delete "${event.title}"?`, [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: () => onDeleteEvent?.(event.id),
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerRow, { paddingTop: (insets?.top ?? 0) + scale(8) }]}>
        <Pressable
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={colors.accent} />
        </Pressable>
        <AppText style={[styles.title, { color: colors.text }]}>Manage Events</AppText>
        <Pressable
          style={styles.backBtn}
          onPress={onCreateEvent}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Create event"
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <AppTextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search events..."
          placeholderTextColor={colors.textSubtle}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <Pressable
            onPress={() => setSearchText("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {["all", "upcoming", "past"].map((filter) => (
          <Pressable
            key={filter}
            style={[styles.filterTab, filterStatus === filter && styles.filterTabActive]}
            onPress={() => setFilterStatus(filter)}
            accessibilityRole="button"
            accessibilityLabel={filter}
            accessibilityState={{ selected: filterStatus === filter }}
          >
            <AppText
              style={[
                styles.filterTabText,
                { color: filterStatus === filter ? colors.primaryContrast : colors.textMuted },
                filterStatus === filter && styles.filterTabTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} tintColor={colors.primary} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.borderSoft} />
            <AppText style={[styles.emptyText, { color: colors.textMuted }]}>
              {searchText ? "No events match your search." : "No events found."}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <EventManageCard
            event={item}
            colors={colors}
            styles={styles}
            onEdit={() => onEditEvent?.(item.id)}
            onDelete={() => handleDeleteEvent(item)}
            onView={() => onViewEventDetails?.(item.id)}
          />
        )}
      />
    </View>
  );
}

function EventManageCard({ event, colors, styles, onEdit, onDelete, onView }) {
  const isPast = eventTimeStatus(event) === "past";

  return (
    <Pressable
      style={[styles.eventCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}
      onPress={onView}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      accessibilityHint="Opens event details"
    >
      {event.image && <Image source={{ uri: event.image }} style={styles.eventImage} />}
      <View style={styles.eventCardContent}>
        <View style={styles.eventCardHeader}>
          <View style={{ flex: 1 }}>
            <AppText style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
              {event.title}
            </AppText>
            <AppText style={[styles.eventMeta, { color: colors.textMuted }]}>{event.organizer}</AppText>
          </View>
          {isPast && <View style={[styles.pastBadge, { backgroundColor: colors.error + "20" }]}>
            <AppText style={[styles.pastBadgeText, { color: colors.error }]}>Ended</AppText>
          </View>}
        </View>

        <View style={styles.eventCardInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={14} color={colors.textMuted} />
            <AppText style={[styles.infoText, { color: colors.textMuted }]}>{event.date}</AppText>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={14} color={colors.textMuted} />
            <AppText style={[styles.infoText, { color: colors.textMuted }]} numberOfLines={1}>
              {event.venue}
            </AppText>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people" size={14} color={colors.textMuted} />
            <AppText style={[styles.infoText, { color: colors.textMuted }]}>
              {Number.isFinite(event.registeredCount) ? `${event.registeredCount} registered` : "RSVP count unavailable"}
            </AppText>
          </View>
        </View>

        <View style={styles.eventActions}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
            onPress={onEdit}
            accessibilityRole="button"
            accessibilityLabel="Edit event"
          >
            <Ionicons name="create" size={16} color={colors.primary} />
            <AppText style={[styles.actionBtnText, { color: colors.primary }]}>Edit</AppText>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.error + "20" }]}
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete event"
          >
            <Ionicons name="trash" size={16} color={colors.error} />
            <AppText style={[styles.actionBtnText, { color: colors.error }]}>Delete</AppText>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(14),
      paddingBottom: scale(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
    },
    backBtn: {
      width: scale(28),
      height: scale(28),
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: ms(18),
      fontWeight: "800",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      marginHorizontal: scale(14),
      marginVertical: scale(12),
      paddingHorizontal: scale(12),
      height: scale(40),
      borderRadius: scale(10),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    searchInput: {
      flex: 1,
      fontSize: ms(13),
      fontWeight: "500",
    },
    filterRow: {
      flexDirection: "row",
      gap: scale(8),
      marginHorizontal: scale(14),
      marginBottom: scale(12),
    },
    filterTab: {
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      borderRadius: scale(8),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    filterTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterTabText: {
      fontSize: ms(12),
      fontWeight: "600",
    },
    filterTabTextActive: {
      color: colors.primaryContrast,
    },
    listContent: {
      paddingHorizontal: scale(14),
      paddingBottom: scale(24),
      gap: scale(12),
    },
    emptyContainer: {
      paddingVertical: scale(60),
      alignItems: "center",
      justifyContent: "center",
      gap: scale(12),
    },
    emptyText: {
      fontSize: ms(14),
      fontWeight: "500",
      textAlign: "center",
    },
    eventCard: {
      borderRadius: scale(12),
      borderWidth: 1,
      overflow: "hidden",
    },
    eventImage: {
      width: "100%",
      height: scale(120),
      backgroundColor: colors.border,
    },
    eventCardContent: {
      padding: scale(12),
    },
    eventCardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: scale(8),
      marginBottom: scale(8),
    },
    eventTitle: {
      fontSize: ms(14),
      fontWeight: "700",
    },
    eventMeta: {
      fontSize: ms(11),
      fontWeight: "500",
      marginTop: scale(2),
    },
    pastBadge: {
      borderRadius: scale(6),
      paddingHorizontal: scale(8),
      paddingVertical: scale(4),
    },
    pastBadgeText: {
      fontSize: ms(10),
      fontWeight: "700",
    },
    eventCardInfo: {
      gap: scale(6),
      marginBottom: scale(10),
      paddingTop: scale(8),
      borderTopWidth: 1,
      borderTopColor: colors.borderSoft,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    infoText: {
      fontSize: ms(11),
      fontWeight: "500",
      flex: 1,
    },
    eventActions: {
      flexDirection: "row",
      gap: scale(8),
    },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scale(8),
      borderRadius: scale(8),
      gap: scale(4),
    },
    actionBtnText: {
      fontSize: ms(11),
      fontWeight: "700",
    },
  });
