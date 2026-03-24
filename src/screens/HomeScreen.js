import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

const HOME_CATEGORIES = [
  { label: "All", icon: "apps" },
  { label: "Academic", icon: "school" },
  { label: "Social", icon: "people" },
  { label: "Sports", icon: "football" },
  { label: "Workshop", icon: "construct" },
];

export default function HomeScreen({
  user,
  dashboardType = "student",
  bookmarkedEventIds = [],
  events = [],
  featuredEvents = [],
  announcements = [],
  onToggleBookmark,
  onOpenNotifications,
  onOpenEvent,
  onOpenProfile,
  onActivateSearch,
  onOpenAnnouncementDetails,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const styles = useMemo(() => createStyles(colors), [colors]);

  const firstName = (user?.fullName || "John").trim().split(" ")[0] || "John";
  const isStudent = dashboardType !== "staff";

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
  const announcement = announcements[0] || null;

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
          </View>
        </View>

        <Pressable style={styles.iconBtn} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={16} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <Pressable
          style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => onActivateSearch?.(searchText)}
        >
          <Ionicons name="search" size={16} color={colors.textSubtle} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => onActivateSearch?.(searchText)}
            placeholder="Search events, venues..."
            placeholderTextColor={colors.textSubtle}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </Pressable>

        <Pressable style={styles.filterBtn} onPress={() => onActivateSearch?.(searchText)}>
          <Ionicons name="options" size={16} color={colors.primaryContrast} />
        </Pressable>
      </View>

      {announcement && (
        <Pressable
          style={styles.announcementCard}
          onPress={() => onOpenAnnouncementDetails?.(announcement.id)}
        >
          <View style={styles.announcementIconWrap}>
            <Ionicons name="megaphone" size={14} color={colors.accent} />
          </View>
          <View style={styles.announcementBody}>
            <Text style={styles.announcementTitle} numberOfLines={2}>{announcement.subject}</Text>
            <View style={styles.announcementBottomRow}>
              <Text style={styles.announcementMessage} numberOfLines={2}>{announcement.message}</Text>
              <Text style={styles.announcementLink}>Read More</Text>
            </View>
          </View>
        </Pressable>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {HOME_CATEGORIES.map((categoryItem) => {
          const active = categoryItem.label === activeCategory;
          const iconColor = active ? colors.primaryContrast : colors.accent;
          return (
            <Pressable
              key={categoryItem.label}
              onPress={() => setActiveCategory(categoryItem.label)}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
            >
              <Ionicons name={categoryItem.icon} size={11} color={iconColor} />
              <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{categoryItem.label}</Text>
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
              <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
              <View style={styles.featuredMetaRow}>
                <Ionicons name="calendar-outline" size={11} color={colors.borderSoft} />
                <Text style={styles.featuredMeta}>{formatDate(item.date)}, {item.time}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <SectionTitle title="Upcoming Events" action="See all" styles={styles} />
      <View style={styles.upcomingWrap}>
        {upcoming.map((item) => (
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
                <Text style={styles.upcomingCategory} numberOfLines={1}>{item.category.toUpperCase()}</Text>
                <Text style={styles.upcomingDate}>{formatShortDate(item.date)}</Text>
              </View>

              <Text style={styles.upcomingTitle} numberOfLines={1}>{item.title}</Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={11} color={colors.textMuted} />
                <Text style={styles.locationText} numberOfLines={1}>{item.venue}</Text>
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

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
    },
    content: {
      paddingHorizontal: scale(12),
      paddingBottom: scale(18),
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
      gap: scale(8),
    },
    avatar: {
      width: scale(30),
      height: scale(30),
      borderRadius: scale(15),
    },
    avatarRing: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(17),
      backgroundColor: "#EFC5A3",
      alignItems: "center",
      justifyContent: "center",
    },
    welcomeText: {
      color: colors.textMuted,
      fontSize: ms(10),
      fontWeight: "700",
    },
    nameText: {
      color: colors.primary,
      fontSize: ms(22),
      fontWeight: "900",
      marginTop: -1,
    },
    iconBtn: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(17),
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(7),
    },
    searchWrap: {
      flex: 1,
      height: scale(41),
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(11),
      gap: scale(6),
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: ms(13),
    },
    filterBtn: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    announcementCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(9),
      borderRadius: scale(13),
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surface,
      paddingHorizontal: scale(10),
      paddingVertical: scale(10),
    },
    announcementIconWrap: {
      width: scale(30),
      height: scale(30),
      borderRadius: scale(15),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    announcementBody: {
      flex: 1,
      gap: scale(3),
    },
    announcementTitle: {
      color: colors.text,
      fontSize: ms(12),
      fontWeight: "900",
      lineHeight: ms(15),
    },
    announcementBottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: scale(8),
    },
    announcementMessage: {
      flex: 1,
      color: colors.textMuted,
      fontSize: ms(11),
      fontWeight: "600",
    },
    announcementLink: {
      color: colors.primary,
      fontSize: ms(11),
      fontWeight: "900",
    },
    categoryRow: {
      paddingVertical: scale(1),
      gap: scale(8),
    },
    categoryChip: {
      height: scale(32),
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: scale(11),
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
      marginTop: scale(1),
    },
    sectionTitle: {
      color: colors.text,
      fontSize: ms(24),
      fontWeight: "900",
    },
    sectionAction: {
      color: colors.primary,
      fontSize: ms(13),
      fontWeight: "800",
    },
    featuredRow: {
      gap: scale(10),
      paddingBottom: scale(2),
    },
    featuredCard: {
      width: scale(180),
      height: scale(146),
      borderRadius: scale(15),
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
      left: scale(9),
      top: scale(10),
    },
    bookmarkBtn: {
      position: "absolute",
      right: scale(9),
      top: scale(9),
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.overlayStrong,
    },
    featuredTag: {
      paddingHorizontal: scale(7),
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
      left: scale(10),
      right: scale(10),
      bottom: scale(10),
    },
    featuredTitle: {
      color: colors.primaryContrast,
      fontSize: ms(24),
      fontWeight: "900",
    },
    featuredMetaRow: {
      marginTop: scale(3),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    featuredMeta: {
      color: colors.borderSoft,
      fontSize: ms(10),
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
      backgroundColor: colors.surface,
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
      backgroundColor: colors.surfaceAlt,
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
      fontSize: ms(15),
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
      backgroundColor: colors.primary,
      paddingHorizontal: scale(12),
      paddingVertical: scale(5),
    },
    rsvpText: {
      color: colors.primaryContrast,
      fontSize: ms(10),
      fontWeight: "900",
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
