import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function SearchScreen({ value, results, onChange, onOpenEvent }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [viewMode, setViewMode] = useState("list");
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    { label: "All Events", icon: "apps" },
    { label: "Academic", icon: "school" },
    { label: "Social", icon: "people" },
    { label: "Sports", icon: "football" },
  ];

  const filtered = useMemo(() => {
    if (activeCategory === "All Events") {
      return results;
    }

    if (activeCategory === "Academic") {
      return results.filter((item) => ["Seminar", "Workshop", "Conference"].includes(item.category));
    }

    if (activeCategory === "Social") {
      return results.filter((item) => item.category === "Social");
    }

    if (activeCategory === "Sports") {
      return results.filter((item) => item.category === "Sports");
    }

    return results;
  }, [activeCategory, results]);

  return (
    <FlatList
      data={filtered}
      key={viewMode}
      numColumns={viewMode === "grid" ? 2 : 1}
      keyExtractor={(item) => String(item.id)}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
      contentContainerStyle={[styles.contentContainer, { paddingTop: (insets?.top ?? 0) + scale(8), backgroundColor: colors.background }]}
      renderItem={({ item, index }) => (
        <ExploreCard
          event={item}
          index={index}
          nowTs={nowTs}
          viewMode={viewMode}
          colors={colors}
          styles={styles}
          onPress={() => onOpenEvent(item.id)}
        />
      )}
      ListHeaderComponent={
        <View style={styles.headerWrap}>
          <View style={styles.topRow}>
            <View style={styles.brandRow}>
              <Ionicons name="school" size={14} color={colors.accent} />
              <Text style={styles.brandText}>NSUK Events</Text>
            </View>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="options-outline" size={14} color={colors.accent} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Ionicons name="search" size={15} color={colors.textSubtle} />
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Search events, workshops..."
                placeholderTextColor={colors.textSubtle}
                style={[styles.searchInput, { color: colors.text }]}
              />
            </View>
            <Pressable style={styles.filterBtn}>
              <Ionicons name="funnel" size={15} color={colors.primaryContrast} />
            </Pressable>
          </View>

          <View style={styles.metaFilterRow}>
            <Pressable style={styles.metaFilterChip}>
              <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
              <Text style={styles.metaFilterText}>Any Date</Text>
              <Ionicons name="chevron-down" size={11} color={colors.textMuted} />
            </Pressable>
            <Pressable style={styles.metaFilterChip}>
              <Ionicons name="location-outline" size={11} color={colors.textMuted} />
              <Text style={styles.metaFilterText}>Any Venue</Text>
              <Ionicons name="chevron-down" size={11} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Pressable onPress={() => setViewMode("list")} style={styles.switchItem}>
              <Text style={[styles.switchText, viewMode === "list" && styles.switchTextActive]}>List View</Text>
            </Pressable>
            <Pressable onPress={() => setViewMode("grid")} style={styles.switchItem}>
              <Text style={[styles.switchText, viewMode === "grid" && styles.switchTextActive]}>Grid View</Text>
            </Pressable>
          </View>

          <FlatList
            data={categories}
            horizontal
            keyExtractor={(item) => item.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
            renderItem={({ item }) => {
              const active = activeCategory === item.label;
              const iconColor = active ? colors.primaryContrast : colors.accent;
              return (
                <Pressable
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setActiveCategory(item.label)}
                >
                  <Ionicons name={item.icon} size={12} color={iconColor} />
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{item.label}</Text>
                </Pressable>
              );
            }}
          />
        </View>
      }
    />
  );
}

function ExploreCard({ event, index, nowTs, viewMode, onPress, colors, styles }) {
  const status = getStatus(event, nowTs);
  const disabled = status.type === "past";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.borderSoft },
        viewMode === "grid" && styles.cardGrid,
        disabled && styles.cardDisabled,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: event.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.badgeOverlay}>
          <Text style={[styles.badgeTag, status.type === "past" && styles.badgeGray]}>{status.label}</Text>
          <Text style={styles.badgeTagSecondary} numberOfLines={1}>
            {toCategoryLabel(event.category)}
          </Text>
        </View>
        {index === 1 && (
          <View style={styles.bookmarkBadge}>
            <Ionicons name="bookmark" size={12} color={colors.primaryContrast} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.eventTitle, { color: colors.text }, disabled && styles.textMuted]} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.metaLine}>
          <Ionicons name="calendar-outline" size={11} color={colors.textSubtle} />
          <Text style={styles.metaText}>{formatDate(event.date)}</Text>
          <Ionicons name="time-outline" size={11} color={colors.textSubtle} style={styles.timeIcon} />
          <Text style={styles.metaText}>{event.time}</Text>
        </View>

        <View style={styles.metaLine}>
          <Ionicons name="location-outline" size={11} color={colors.textSubtle} />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.venue}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.attendingText}>{getAttending(status.type)}</Text>
          <Pressable disabled={disabled} style={[styles.actionButton, disabled && styles.actionButtonDisabled]}>
            <Text style={[styles.actionButtonText, disabled && styles.actionButtonTextDisabled]}>
              {disabled ? "View Results" : status.type === "ongoing" ? "Join Now" : "Register"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function parseEventStartDateTime(dateText, timeText) {
  if (!dateText) {
    return null;
  }

  const baseDate = new Date(dateText);
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const rawTime = String(timeText || "").trim();
  if (!rawTime) {
    return start;
  }

  const twelveHour = rawTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2]);
    const period = twelveHour[3].toUpperCase();

    if (period === "PM" && hour < 12) {
      hour += 12;
    }
    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    start.setHours(hour, minute, 0, 0);
    return start;
  }

  const twentyFourHour = rawTime.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = Number(twentyFourHour[2]);
    start.setHours(hour, minute, 0, 0);
    return start;
  }

  return start;
}

function getStatus(event, nowTs) {
  const start = parseEventStartDateTime(event?.date, event?.time);
  if (!start) {
    return { label: "UPCOMING", type: "upcoming" };
  }

  const hasTime = !!String(event?.time || "").trim();
  const end = new Date(start);
  if (hasTime) {
    // If no end time exists, assume a 2 hour event duration.
    end.setHours(end.getHours() + 2);
  } else {
    end.setDate(end.getDate() + 1);
  }

  const now = new Date(nowTs);
  if (now < start) {
    return { label: "UPCOMING", type: "upcoming" };
  }
  if (now >= end) {
    return { label: "ENDED", type: "past" };
  }
  return { label: "ONGOING", type: "ongoing" };
}

function getAttending(statusType) {
  if (statusType === "ongoing") {
    return "20k+";
  }
  if (statusType === "upcoming") {
    return "250+ attending";
  }
  return "Registration ended";
}

function toCategoryLabel(category) {
  if (!category) {
    return "ACADEMIC";
  }
  return category.toUpperCase();
}

function formatDate(dateText) {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) {
    return dateText;
  }
  const month = parsed.toLocaleString("en-US", { month: "short" });
  return `${month} ${parsed.getDate()}`;
}

const createStyles = (colors) =>
  StyleSheet.create({
  contentContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: scale(14),
    paddingTop: scale(8),
    paddingBottom: scale(22),
  },
  headerWrap: {
    gap: scale(10),
    marginBottom: scale(8),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  brandText: {
    color: colors.accent,
    fontSize: ms(18),
    fontWeight: "800",
  },
  actionBtn: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  searchBox: {
    flex: 1,
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: scale(12),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: ms(13),
    fontWeight: "500",
    paddingVertical: 0,
  },
  filterBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  metaFilterRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  metaFilterChip: {
    flex: 1,
    minHeight: scale(30),
    borderRadius: scale(15),
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(4),
  },
  metaFilterText: {
    color: colors.textMuted,
    fontSize: ms(11),
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(22),
    paddingTop: scale(2),
  },
  switchItem: {
    paddingVertical: scale(4),
  },
  switchText: {
    fontSize: ms(13),
    fontWeight: "700",
    color: colors.textSubtle,
  },
  switchTextActive: {
    color: colors.accent,
    textDecorationLine: "underline",
  },
  categoryRow: {
    gap: scale(6),
    paddingTop: scale(2),
  },
  categoryChip: {
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: scale(14),
    paddingVertical: scale(6),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    color: colors.textMuted,
    fontSize: ms(11),
    fontWeight: "800",
  },
  categoryChipTextActive: {
    color: colors.primaryContrast,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  card: {
    borderRadius: scale(14),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    marginBottom: scale(10),
  },
  cardGrid: {
    width: "48.5%",
  },
  cardDisabled: {
    opacity: 0.72,
  },
  imageWrap: {
    width: "100%",
    height: scale(110),
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgeOverlay: {
    position: "absolute",
    left: scale(8),
    top: scale(8),
    right: scale(38),
    flexDirection: "row",
    gap: scale(4),
  },
  badgeTag: {
    backgroundColor: colors.error,
    color: colors.primaryContrast,
    fontSize: ms(9),
    fontWeight: "900",
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: 999,
    letterSpacing: 0.4,
  },
  badgeTagSecondary: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    fontSize: ms(9),
    fontWeight: "900",
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: 999,
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  badgeGray: {
    backgroundColor: colors.textMuted,
  },
  bookmarkBadge: {
    position: "absolute",
    right: scale(8),
    top: scale(8),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: colors.overlayStronger,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    paddingHorizontal: scale(10),
    paddingTop: scale(8),
    paddingBottom: scale(10),
    gap: scale(5),
  },
  eventTitle: {
    color: colors.text,
    fontSize: ms(13),
    fontWeight: "800",
    lineHeight: ms(18),
  },
  textMuted: {
    color: colors.textMuted,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  timeIcon: {
    marginLeft: scale(6),
  },
  metaText: {
    color: colors.textSubtle,
    fontSize: ms(11),
    fontWeight: "600",
    flexShrink: 1,
  },
  bottomRow: {
    marginTop: scale(6),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendingText: {
    color: colors.textSubtle,
    fontSize: ms(10),
    fontWeight: "700",
  },
  actionButton: {
    minHeight: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors.primary,
    paddingHorizontal: scale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    backgroundColor: colors.borderSoft,
  },
  actionButtonText: {
    color: colors.primaryContrast,
    fontSize: ms(11),
    fontWeight: "800",
  },
  actionButtonTextDisabled: {
    color: colors.textSubtle,
  },
  });
