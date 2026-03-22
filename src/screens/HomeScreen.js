import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

const HOME_CATEGORIES = ["All", "Academic", "Social", "Sports", "Workshop"];

export default function HomeScreen({
  user,
  dashboardType = "student",
  bookmarkedEventIds = [],
  events = [],
  featuredEvents = [],
  onToggleBookmark,
  onOpenNotifications,
  onOpenEvent,
  onOpenProfile,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const styles = useMemo(() => createStyles(colors), [colors]);

  const firstName = (user?.fullName || "John").trim().split(" ")[0] || "John";
  const isStudent = dashboardType !== "staff";
  const dashboardLabel =
    dashboardType === "staff" ? "Staff dashboard: create and manage events" : "Student dashboard: discover and join events";

  const filteredEvents = useMemo(() => {
    const byCategory = events.filter((item) => {
      if (activeCategory === "All") {
        return true;
      }
      if (activeCategory === "Academic") {
        return ["Seminar", "Workshop", "Conference"].includes(item.category);
      }
      if (activeCategory === "Workshop") {
        return item.category === "Workshop";
      }
      return item.category?.toLowerCase() === activeCategory.toLowerCase();
    });

    const needle = searchText.trim().toLowerCase();
    if (!needle) {
      return byCategory;
    }

    return byCategory.filter((item) => {
      const source = `${item.title} ${item.venue} ${item.category}`.toLowerCase();
      return source.includes(needle);
    });
  }, [activeCategory, events, searchText]);

  const featured = useMemo(() => {
    if (featuredEvents.length > 0) {
      return featuredEvents.slice(0, 5);
    }
    return filteredEvents.slice(0, 5);
  }, [featuredEvents, filteredEvents]);

  const upcoming = useMemo(() => filteredEvents.slice(0, 3), [filteredEvents]);
  const trending = useMemo(() => filteredEvents.slice(0, 6), [filteredEvents]);

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.userWrap}>
          <Pressable onPress={onOpenProfile}>
            <View style={styles.avatarRing}>
              <Image source={{ uri: user?.avatar }} style={styles.avatar} />
            </View>
          </Pressable>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>Hello, {firstName}</Text>
            <Text style={styles.roleHint}>{dashboardLabel}</Text>
          </View>
        </View>

        <Pressable style={styles.iconBtn} onPress={onOpenNotifications}>
          <Ionicons name="notifications" size={16} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <Ionicons name="search" size={16} color={colors.textSubtle} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search events, venues..."
            placeholderTextColor={colors.textSubtle}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        <Pressable style={styles.filterBtn}>
          <Ionicons name="options" size={16} color={colors.primaryContrast} />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {HOME_CATEGORIES.map((category) => {
          const active = category === activeCategory;
          return (
            <Pressable
              key={category}
              onPress={() => setActiveCategory(category)}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
            >
              {!active && <Ionicons name="leaf" size={11} color={colors.accent} />}
              <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <SectionTitle title="Featured Events" action="View all" styles={styles} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
        {featured.map((item, index) => (
          <Pressable
            key={String(item.id)}
            style={[styles.featuredCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}
            onPress={() => onOpenEvent?.(item.id)}
          >
            <Image source={{ uri: item.image }} style={styles.featuredImage} />
            <View style={styles.featuredOverlay} />

            {isStudent && (
              <Pressable style={styles.bookmarkBtn} onPress={() => onToggleBookmark?.(item.id)}>
                <Ionicons
                  name={bookmarkedEventIds.includes(item.id) ? "bookmark" : "bookmark-outline"}
                  size={13}
                  color={colors.primaryContrast}
                />
              </Pressable>
            )}

            <View style={styles.featuredTagWrap}>
              <Text style={[styles.featuredTag, index % 2 === 0 ? styles.tagPrimary : styles.tagSecondary]}>
                {index % 2 === 0 ? "FEATURED" : "TRENDING"}
              </Text>
            </View>

            <View style={styles.featuredBody}>
              <Text style={styles.featuredTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.featuredMetaRow}>
                <Ionicons name="calendar-outline" size={11} color={colors.borderSoft} />
                <Text style={styles.featuredMeta}>
                  {formatDate(item.date)}, {item.time}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <SectionTitle title="Upcoming Events" action="See all" styles={styles} />
      <View style={styles.upcomingWrap}>
        {upcoming.map((item, index) => (
          <Pressable
            key={String(item.id)}
            style={[styles.upcomingCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}
            onPress={() => onOpenEvent?.(item.id)}
          >
            {isStudent && (
              <Pressable style={styles.bookmarkBtnInline} onPress={() => onToggleBookmark?.(item.id)}>
                <Ionicons
                  name={bookmarkedEventIds.includes(item.id) ? "bookmark" : "bookmark-outline"}
                  size={13}
                  color={colors.accent}
                />
              </Pressable>
            )}
            <Image source={{ uri: item.image }} style={styles.upcomingImage} />

            <View style={[styles.upcomingBody, isStudent && styles.upcomingBodyWithBookmark]}>
              <View style={styles.upcomingTop}>
                <Text style={styles.upcomingCategory} numberOfLines={1}>
                  {item.category.toUpperCase()}
                </Text>
                <Text style={styles.upcomingDate}>{formatShortDate(item.date)}</Text>
              </View>

              <Text style={styles.upcomingTitle} numberOfLines={1}>
                {item.title}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={11} color={colors.textMuted} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.venue}
                </Text>
              </View>

              <View style={styles.upcomingBottom}>
                <Text style={styles.timeText}>{item.time}</Text>
                <View style={styles.rsvpBtn}>
                  <Text style={styles.rsvpText}>RSVP</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="Trending This Week" styles={styles} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
        {trending.map((item) => (
          <Pressable
            key={`trend-${item.id}`}
            style={[styles.trendingCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}
            onPress={() => onOpenEvent?.(item.id)}
          >
            {isStudent && (
              <Pressable style={styles.bookmarkBtnInline} onPress={() => onToggleBookmark?.(item.id)}>
                <Ionicons
                  name={bookmarkedEventIds.includes(item.id) ? "bookmark" : "bookmark-outline"}
                  size={13}
                  color={colors.accent}
                />
              </Pressable>
            )}
            <Image source={{ uri: item.image }} style={styles.trendingImage} />
            <View style={styles.trendingBody}>
              <Text style={styles.trendingTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.trendingMeta} numberOfLines={1}>
                {formatWeekday(item.date)}, {item.time}
              </Text>
              <View style={styles.detailsBtn}>
                <Text style={styles.detailsBtnText}>Details</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

function SectionTitle({ title, action, styles }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : <View />}
    </View>
  );
}

function formatDate(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatShortDate(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

function formatWeekday(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return "Date TBD";
  }
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

const createStyles = (colors) =>
  StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  content: {
    paddingHorizontal: scale(14),
    paddingBottom: scale(28),
    gap: scale(12),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  avatar: {
    width: scale(42),
    height: scale(42),
    borderRadius: scale(21),
  },
  avatarRing: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  welcomeText: {
    color: colors.text,
    fontSize: ms(12),
    fontWeight: "700",
  },
  nameText: {
    color: colors.primary,
    fontSize: ms(24),
    fontWeight: "900",
  },
  roleHint: {
    marginTop: scale(2),
    color: colors.text,
    fontSize: ms(10),
    fontWeight: "800",
  },
  iconBtn: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  searchWrap: {
    flex: 1,
    height: scale(40),
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    gap: scale(6),
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: ms(13),
  },
  filterBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryRow: {
    paddingVertical: scale(2),
    gap: scale(8),
  },
  categoryChip: {
    height: scale(34),
    borderRadius: scale(17),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: scale(12),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  categoryChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: ms(12),
    fontWeight: "700",
  },
  categoryTextActive: {
    color: colors.primaryContrast,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: ms(21),
    fontWeight: "900",
  },
  sectionAction: {
    color: colors.accent,
    fontSize: ms(13),
    fontWeight: "800",
  },
  featuredRow: {
    gap: scale(10),
    paddingBottom: scale(2),
  },
  featuredCard: {
    width: scale(258),
    height: scale(142),
    borderRadius: scale(16),
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  featuredTagWrap: {
    position: "absolute",
    left: scale(10),
    top: scale(10),
  },
  bookmarkBtn: {
    position: "absolute",
    right: scale(10),
    top: scale(10),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.overlayStrong,
  },
  featuredTag: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    borderRadius: 999,
    fontSize: ms(9),
    fontWeight: "900",
    color: colors.text,
    overflow: "hidden",
  },
  tagPrimary: {
    backgroundColor: colors.surfaceAlt,
  },
  tagSecondary: {
    backgroundColor: colors.surface,
  },
  featuredBody: {
    position: "absolute",
    left: scale(12),
    right: scale(12),
    bottom: scale(10),
  },
  featuredTitle: {
    color: colors.primaryContrast,
    fontSize: ms(18),
    fontWeight: "900",
  },
  featuredMetaRow: {
    marginTop: scale(4),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
  },
  featuredMeta: {
    color: colors.borderSoft,
    fontSize: ms(11),
    fontWeight: "700",
  },
  upcomingWrap: {
    gap: scale(10),
  },
  upcomingCard: {
    position: "relative",
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceAlt,
    padding: scale(10),
    flexDirection: "row",
    gap: scale(10),
  },
  upcomingImage: {
    width: scale(62),
    height: scale(62),
    borderRadius: scale(12),
    backgroundColor: colors.surfaceAlt,
  },
  upcomingBody: {
    flex: 1,
    gap: scale(4),
  },
  upcomingBodyWithBookmark: {
    paddingRight: scale(28),
  },
  upcomingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: scale(6),
  },
  upcomingCategory: {
    flexShrink: 1,
    color: colors.accent,
    backgroundColor: colors.surface,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: scale(8),
    paddingVertical: scale(3),
    fontSize: ms(9),
    fontWeight: "900",
  },
  upcomingDate: {
    color: colors.textSubtle,
    fontSize: ms(10),
    fontWeight: "800",
  },
  upcomingTitle: {
    color: colors.text,
    fontSize: ms(16),
    fontWeight: "800",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  locationText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: ms(11),
    fontWeight: "600",
  },
  upcomingBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    color: colors.primary,
    fontSize: ms(14),
    fontWeight: "900",
  },
  rsvpBtn: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: scale(12),
    paddingVertical: scale(5),
  },
  rsvpText: {
    color: colors.primaryContrast,
    fontSize: ms(10),
    fontWeight: "900",
  },
  trendingRow: {
    gap: scale(10),
  },
  trendingCard: {
    position: "relative",
    width: scale(150),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  trendingImage: {
    width: "100%",
    height: scale(74),
    backgroundColor: colors.surfaceAlt,
  },
  trendingBody: {
    padding: scale(9),
    gap: scale(4),
  },
  trendingTitle: {
    color: colors.text,
    fontSize: ms(12),
    fontWeight: "800",
  },
  trendingMeta: {
    color: colors.textMuted,
    fontSize: ms(10),
    fontWeight: "600",
  },
  detailsBtn: {
    marginTop: scale(6),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    height: scale(26),
  },
  detailsBtnText: {
    color: colors.primary,
    fontSize: ms(10),
    fontWeight: "800",
  },
  bookmarkBtnInline: {
    position: "absolute",
    right: scale(10),
    top: scale(10),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
    zIndex: 5,
  },
  });