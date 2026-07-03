import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FadeInImage } from "../components/FadeInImage";
import { ScalePressable } from "../components/ScalePressable";
import { EventSkeletonCard } from "../components/SkeletonLoader";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

const CATEGORY_DATA = [
  { label: "Today", image: "https://images.unsplash.com/photo-1506784951809-c8e39031c5df?w=200&q=80" },
  { label: "Tomorrow", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&q=80" },
  { label: "Academic", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&q=80" },
  { label: "Sports", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&q=80" },
  { label: "Seminar", image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=200&q=80" },
  { label: "Workshop", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=200&q=80" },
  { label: "SUG", image: "https://images.unsplash.com/photo-1523580494112-071d45d41982?w=200&q=80" },
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
  onCreateEvent,
  onOpenManageEvents,
  refreshing,
  onRefreshData,
}) {
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("Today");
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const firstName = (user?.fullName || "John").trim().split(" ")[0] || "John";
  const isStudent = dashboardType !== "staff";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 18) return "Good Afternoon,";
    return "Good Evening,";
  };
  const greeting = getGreeting();

  const filteredEvents = useMemo(() => {
    const byCategory = events.filter((item) => {
      if (activeCategory === "Today" || activeCategory === "Tomorrow" || activeCategory === "All") return true;
      if (activeCategory === "Academic") return ["Seminar", "Workshop", "Conference"].includes(item.category);
      if (activeCategory === "Workshop") return item.category === "Workshop";
      if (activeCategory === "Sports") return item.category === "Sports";
      if (activeCategory === "Seminar") return item.category === "Seminar";
      return true; // Fallback
    });

    const needle = searchText.trim().toLowerCase();
    if (!needle) return byCategory;

    return byCategory.filter((item) => {
      const source = `${item.title} ${item.venue} ${item.category}`.toLowerCase();
      return source.includes(needle);
    });
  }, [activeCategory, events, searchText]);

  const upcoming = useMemo(() => filteredEvents, [filteredEvents]);
  const featured = featuredEvents.length > 0 ? featuredEvents[0] : (events.length > 0 ? events[0] : null);

  const staffHostedEvents = useMemo(() => {
    return events.filter(e => e.createdBy === user?.id);
  }, [events, user]);

  const activeEventsCount = useMemo(() => {
    return staffHostedEvents.filter(e => {
      const start = new Date(e.date);
      return start >= new Date();
    }).length;
  }, [staffHostedEvents]);

  const totalRegistrations = useMemo(() => {
    return staffHostedEvents.reduce((sum, e) => {
      const count = Number(e.registeredCount);
      return sum + (Number.isFinite(count) ? count : 0);
    }, 0);
  }, [staffHostedEvents]);

  const renderFaces = (count = 3, size = 18) => {
    return (
      <View style={{ flexDirection: "row", marginRight: scale(6) }}>
        {[1, 2, 3].slice(0, count).map((num, i) => (
          <Image
            key={i}
            source={{ uri: `https://randomuser.me/api/portraits/women/${(num * 10) + 1}.jpg` }}
            style={{
              width: scale(size),
              height: scale(size),
              borderRadius: scale(size / 2),
              borderWidth: 1,
              borderColor: colors.surface,
              marginLeft: i > 0 ? -scale(8) : 0,
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      {/* TOP APP BAR */}
      <View style={styles.topNav}>
        <Pressable style={styles.menuIcon}>
          <Ionicons name="menu-outline" size={28} color={colors.text} />
        </Pressable>
        <View style={styles.logoWrap}>
          <View style={styles.shieldIconWrap}>
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
          </View>
          <View style={styles.logoTextWrap}>
            <Text style={styles.logoTitle}>NSUK</Text>
            <Text style={styles.logoSubtitle}>CAMPUS EVENTS</Text>
          </View>
        </View>
        <Pressable style={styles.bellWrap} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} tintColor={colors.primary} />}
      >
        {/* GREETING BAR */}
        <View style={styles.greetingRow}>
          <Pressable style={styles.greetingLeft} onPress={onOpenProfile}>
            <Image source={{ uri: user?.avatar || "https://randomuser.me/api/portraits/lego/1.jpg" }} style={styles.greetingAvatar} />
            <View>
              <Text style={styles.greetingText}>{greeting} 👋</Text>
              <Text style={styles.greetingName}>{firstName}</Text>
            </View>
          </Pressable>
          <View style={styles.campusDropdown}>
            <Ionicons name="location" size={12} color={colors.text} />
            <Text style={styles.campusText}>NSUK Main Campus</Text>
            <Ionicons name="chevron-down" size={12} color={colors.text} />
          </View>
        </View>

        {/* SEARCH AREA */}
        <View style={styles.searchContainer}>
          <Pressable style={styles.searchInputWrap} onPress={() => onActivateSearch?.(searchText)}>
            <Ionicons name="search" size={20} color={colors.textSubtle} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => onActivateSearch?.(searchText)}
              placeholder="Search events, categories, or organizers..."
              placeholderTextColor={colors.textSubtle}
              style={styles.searchInput}
              pointerEvents="none"
            />
          </Pressable>
          <Pressable style={styles.filterBtn} onPress={() => onActivateSearch?.(searchText)}>
            <Ionicons name="options-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* STORY-STYLE CATEGORIES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyRow}>
          {CATEGORY_DATA.map((cat, i) => {
            const active = cat.label === activeCategory;
            return (
              <ScalePressable key={i} onPress={() => setActiveCategory(cat.label)} style={styles.storyItem}>
                <View style={[styles.storyRing, active && styles.storyRingActive]}>
                  <View style={styles.storyImageWrap}>
                    {cat.label === "Today" || cat.label === "Tomorrow" ? (
                      <View style={[styles.storyIconWrap, { backgroundColor: active ? colors.primary : colors.surfaceAlt }]}>
                        <Ionicons name="calendar" size={24} color={active ? "#fff" : colors.primary} />
                      </View>
                    ) : (
                      <Image source={{ uri: cat.image }} style={styles.storyImage} />
                    )}
                  </View>
                </View>
                <Text style={[styles.storyText, active && styles.storyTextActive]}>{cat.label}</Text>
              </ScalePressable>
            );
          })}
        </ScrollView>

        {/* FEATURED EVENT HERO CARD */}
        {featured && isStudent && (
          <ScalePressable style={styles.featuredHero} onPress={() => onOpenEvent?.(featured.id)}>
            <Image source={{ uri: featured.image }} style={styles.featuredHeroBg} />
            <LinearGradient colors={["transparent", "rgba(5, 15, 40, 0.95)"]} style={styles.featuredGradient} />
            <View style={styles.featuredHeroContent}>
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={10} color="#fff" />
                <Text style={styles.featuredBadgeText}>FEATURED EVENT</Text>
              </View>
              <Text style={styles.featuredHeroTitle}>{featured.title}</Text>
              <Text style={styles.featuredHeroDesc} numberOfLines={2}>
                {featured.description || "Explore emerging technologies, network with experts and innovators, and shape the future."}
              </Text>
              
              <View style={styles.featuredHeroMetaRow}>
                <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.featuredHeroMetaText}>{formatDate(featured.date)}</Text>
                <Text style={styles.featuredHeroMetaDivider}>|</Text>
                <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.featuredHeroMetaText}>{featured.time || "9:00 AM"}</Text>
                <Text style={styles.featuredHeroMetaDivider}>|</Text>
                <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.featuredHeroMetaText} numberOfLines={1}>{featured.venue}</Text>
              </View>

              <View style={styles.featuredHeroBottom}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {renderFaces(3, 20)}
                  <Text style={styles.facePileText}>243 Going • 18 Interested</Text>
                </View>
                <Pressable style={styles.viewDetailsBtn} onPress={() => onOpenEvent?.(featured.id)}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <Ionicons name="arrow-forward" size={14} color="#000" />
                </Pressable>
              </View>
            </View>
          </ScalePressable>
        )}

        {/* ORGANIZER METRICS HERO CARD */}
        {!isStudent && (
          <View style={styles.organizerHero}>
            <Image source={{ uri: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80" }} style={styles.featuredHeroBg} />
            <LinearGradient colors={["transparent", "rgba(5, 15, 40, 0.95)"]} style={styles.featuredGradient} />
            <View style={styles.featuredHeroContent}>
              <View style={[styles.featuredBadge, { backgroundColor: "#fff" }]}>
                <Ionicons name="stats-chart" size={10} color={colors.primary} />
                <Text style={[styles.featuredBadgeText, { color: colors.primary }]}>ORGANIZER DASHBOARD</Text>
              </View>
              <Text style={styles.featuredHeroTitle}>Welcome back, {firstName}!</Text>
              <Text style={styles.featuredHeroDesc}>Here is a quick overview of your campus events.</Text>
              
              <View style={styles.organizerStatsRow}>
                <View style={styles.organizerStatBox}>
                  <Text style={styles.organizerStatValue}>{activeEventsCount}</Text>
                  <Text style={styles.organizerStatLabel}>Active Events</Text>
                </View>
                <View style={styles.organizerStatDivider} />
                <View style={styles.organizerStatBox}>
                  <Text style={styles.organizerStatValue}>{totalRegistrations}</Text>
                  <Text style={styles.organizerStatLabel}>Total RSVPs</Text>
                </View>
              </View>

              <View style={styles.featuredHeroBottom}>
                <Pressable style={styles.viewDetailsBtn} onPress={onOpenManageEvents}>
                  <Text style={styles.viewDetailsText}>Manage Events</Text>
                  <Ionicons name="settings-outline" size={14} color="#000" />
                </Pressable>
                <Pressable style={[styles.viewDetailsBtn, { backgroundColor: colors.primary }]} onPress={onCreateEvent}>
                  <Text style={[styles.viewDetailsText, { color: "#fff" }]}>Create Event</Text>
                  <Ionicons name="add" size={14} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* FEED LOOP */}
        <View style={styles.feedWrap}>
          {upcoming.length === 0 && refreshing ? (
            <>
              <EventSkeletonCard />
              <EventSkeletonCard />
            </>
          ) : upcoming.length === 0 ? (
            <Text style={styles.emptyStateText}>No events found in this category.</Text>
          ) : (
            upcoming.map((item) => (
              <SocialEventPost 
                key={String(item.id)} 
                item={item} 
                colors={colors} 
                styles={styles}
                isDark={isDark}
                onPress={() => onOpenEvent?.(item.id)}
                isStudent={isStudent}
                bookmarked={bookmarkedEventIds.includes(item.id)}
                onToggleBookmark={() => onToggleBookmark?.(item.id)}
                renderFaces={renderFaces}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SocialEventPost({ item, colors, styles, isDark, onPress, isStudent, bookmarked, onToggleBookmark, renderFaces }) {
  const avatarUrl = `https://randomuser.me/api/portraits/men/${(String(item.id).charCodeAt(0) % 90) + 1}.jpg`;
  
  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: avatarUrl }} style={styles.postAvatar} />
        <View style={styles.postHeaderInfo}>
          <View style={styles.postAuthorRow}>
            <Text style={styles.postAuthorName}>{item.organizer || "Student Affairs Division"}</Text>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          </View>
          <View style={styles.postTimeRow}>
            <Text style={styles.postTimeText}>2 hours ago</Text>
            <Ionicons name="globe-outline" size={11} color={colors.textMuted} />
          </View>
        </View>
        <Pressable style={styles.postOptionsBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Post Body (Side by Side) */}
      <Pressable style={styles.postBody} onPress={onPress}>
        <Image source={{ uri: item.image }} style={styles.postBodyImage} />
        <View style={styles.postBodyContent}>
          <View style={styles.postBadge}>
            <Text style={[styles.postBadgeText, { color: colors.primary }]}>{item.category || "Academic"}</Text>
          </View>
          <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.postDesc} numberOfLines={3}>
            {item.description || "Join developers from across NSUK for a 24-hour coding challenge. Great prizes to be won!"}
          </Text>
          
          <View style={styles.postMetaGrid}>
            <View style={styles.postMetaRow}>
              <Ionicons name="calendar-outline" size={12} color={colors.textSubtle} />
              <Text style={styles.postMetaText}>{formatShortDate(item.date)}</Text>
            </View>
            <View style={styles.postMetaRow}>
              <Ionicons name="location-outline" size={12} color={colors.textSubtle} />
              <Text style={styles.postMetaText} numberOfLines={1}>{item.venue}</Text>
            </View>
          </View>

          <View style={styles.postFacePileRow}>
            {renderFaces(3, 16)}
            <Text style={styles.postFacePileText}>132 Going   22 Interested</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.postDivider} />

      {/* Action Footer */}
      <View style={styles.postActionFooter}>
        <Pressable style={styles.postActionBtn}>
          <Ionicons name="heart" size={18} color="#ff4444" />
          <Text style={styles.postActionText}>Like</Text>
        </Pressable>
        <Pressable style={styles.postActionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textSubtle} />
          <Text style={styles.postActionText}>Comment</Text>
        </Pressable>
        <Pressable style={styles.postActionBtn} onPress={onToggleBookmark}>
          <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={18} color={bookmarked ? colors.primary : colors.textSubtle} />
          <Text style={styles.postActionText}>Save</Text>
        </Pressable>
        <Pressable style={styles.postActionBtn}>
          <Ionicons name="arrow-redo-outline" size={18} color={colors.textSubtle} />
          <Text style={styles.postActionText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatDate(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatShortDate(dateText) {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingBottom: scale(40),
    },
    // Top Nav
    topNav: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(16),
      paddingVertical: scale(10),
      backgroundColor: colors.background,
    },
    menuIcon: {
      padding: scale(4),
    },
    logoWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    shieldIconWrap: {
      backgroundColor: colors.primary,
      width: scale(26),
      height: scale(28),
      borderRadius: scale(6),
      alignItems: "center",
      justifyContent: "center",
    },
    logoTextWrap: {
      flexDirection: "column",
    },
    logoTitle: {
      color: colors.primary,
      fontSize: ms(14),
      fontFamily: "Outfit_900Black",
      lineHeight: ms(14),
      letterSpacing: 0.5,
    },
    logoSubtitle: {
      color: colors.textSubtle,
      fontSize: ms(8),
      fontWeight: "800",
      lineHeight: ms(10),
      letterSpacing: 0.5,
    },
    bellWrap: {
      padding: scale(4),
    },
    notificationBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: "#ff4444",
      width: scale(14),
      height: scale(14),
      borderRadius: scale(7),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: colors.background,
    },
    notificationBadgeText: {
      color: "#fff",
      fontSize: ms(8),
      fontWeight: "900",
    },
    
    // Greeting Row
    greetingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(16),
      paddingTop: scale(10),
    },
    greetingLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    greetingAvatar: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
    },
    greetingText: {
      fontSize: ms(12),
      color: colors.textSubtle,
      fontWeight: "600",
    },
    greetingName: {
      fontSize: ms(16),
      fontFamily: "Outfit_900Black",
      color: colors.text,
      marginTop: -2,
    },
    campusDropdown: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      paddingHorizontal: scale(10),
      paddingVertical: scale(6),
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    campusText: {
      fontSize: ms(10),
      fontWeight: "700",
      color: colors.text,
    },

    // Search Area
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(16),
      marginTop: scale(16),
      gap: scale(10),
    },
    searchInputWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: scale(12),
      paddingHorizontal: scale(12),
      height: scale(44),
      gap: scale(8),
    },
    searchInput: {
      flex: 1,
      fontSize: ms(13),
      fontFamily: "Outfit_500Medium",
      color: colors.text,
    },
    filterBtn: {
      width: scale(44),
      height: scale(44),
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
    },

    // Categories (Stories)
    storyRow: {
      paddingHorizontal: scale(16),
      paddingVertical: scale(16),
      gap: scale(16),
    },
    storyItem: {
      alignItems: "center",
      gap: scale(6),
      width: scale(64),
    },
    storyRing: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(32),
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    storyRingActive: {
      borderColor: colors.primary,
    },
    storyImageWrap: {
      width: scale(54),
      height: scale(54),
      borderRadius: scale(27),
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.background,
    },
    storyImage: {
      width: "100%",
      height: "100%",
    },
    storyIconWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    storyText: {
      fontSize: ms(11),
      fontWeight: "700",
      color: colors.textMuted,
      textAlign: "center",
    },
    storyTextActive: {
      color: colors.primary,
      fontFamily: "Outfit_800ExtraBold",
    },

    // Featured Event Hero
    featuredHero: {
      marginHorizontal: scale(16),
      height: scale(220),
      borderRadius: scale(16),
      overflow: "hidden",
      marginBottom: scale(20),
    },
    featuredHeroBg: {
      width: "100%",
      height: "100%",
      position: "absolute",
    },
    featuredGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    featuredHeroContent: {
      flex: 1,
      padding: scale(16),
      justifyContent: "flex-end",
    },
    featuredBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: colors.primary,
      alignSelf: "flex-start",
      paddingHorizontal: scale(8),
      paddingVertical: scale(4),
      borderRadius: scale(6),
      marginBottom: scale(8),
    },
    featuredBadgeText: {
      color: "#fff",
      fontSize: ms(8),
      fontWeight: "900",
      letterSpacing: 0.5,
    },
    featuredHeroTitle: {
      color: "#fff",
      fontSize: ms(18),
      fontFamily: "Outfit_900Black",
      lineHeight: ms(24),
      marginBottom: scale(4),
      width: "80%",
    },
    featuredHeroDesc: {
      color: "rgba(255,255,255,0.8)",
      fontSize: ms(11),
      lineHeight: ms(16),
      marginBottom: scale(10),
      width: "80%",
    },
    featuredHeroMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      marginBottom: scale(12),
    },
    featuredHeroMetaText: {
      color: "rgba(255,255,255,0.9)",
      fontSize: ms(10),
      fontWeight: "600",
    },
    featuredHeroMetaDivider: {
      color: "rgba(255,255,255,0.4)",
      fontSize: ms(10),
      marginHorizontal: scale(2),
    },
    featuredHeroBottom: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    facePileText: {
      color: "#fff",
      fontSize: ms(10),
      fontWeight: "700",
    },
    viewDetailsBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      paddingHorizontal: scale(12),
      paddingVertical: scale(8),
      borderRadius: scale(8),
      gap: scale(4),
    },
    viewDetailsText: {
      color: "#000",
      fontSize: ms(11),
      fontWeight: "800",
    },

    // Organizer Hero Styles
    organizerHero: {
      marginHorizontal: scale(16),
      height: scale(240),
      borderRadius: scale(16),
      overflow: "hidden",
      marginBottom: scale(20),
    },
    organizerStatsRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.1)",
      padding: scale(12),
      borderRadius: scale(12),
      marginBottom: scale(16),
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
    },
    organizerStatBox: {
      flex: 1,
      alignItems: "center",
    },
    organizerStatValue: {
      color: "#fff",
      fontSize: ms(20),
      fontFamily: "Outfit_900Black",
      marginBottom: scale(2),
    },
    organizerStatLabel: {
      color: "rgba(255,255,255,0.7)",
      fontSize: ms(10),
      fontWeight: "700",
    },
    organizerStatDivider: {
      width: 1,
      height: scale(30),
      backgroundColor: "rgba(255,255,255,0.2)",
    },

    // Feed Layout
    feedWrap: {
      paddingHorizontal: scale(16),
      gap: scale(16),
    },
    postCard: {
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: colors.borderSoft,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 10,
      elevation: isDark ? 0 : 3,
    },
    postHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: scale(12),
    },
    postAvatar: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: colors.background,
    },
    postHeaderInfo: {
      flex: 1,
      marginLeft: scale(10),
    },
    postAuthorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    postAuthorName: {
      fontSize: ms(14),
      fontFamily: "Outfit_800ExtraBold",
      color: colors.text,
    },
    postTimeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      marginTop: 2,
    },
    postTimeText: {
      fontSize: ms(11),
      color: colors.textMuted,
      fontWeight: "600",
    },
    postOptionsBtn: {
      padding: scale(4),
    },
    
    // Side by Side Body
    postBody: {
      flexDirection: "row",
      paddingHorizontal: scale(12),
      gap: scale(12),
    },
    postBodyImage: {
      width: scale(120),
      height: scale(140),
      borderRadius: scale(12),
      backgroundColor: colors.background,
    },
    postBodyContent: {
      flex: 1,
    },
    postBadge: {
      backgroundColor: colors.primary + "15",
      alignSelf: "flex-start",
      paddingHorizontal: scale(6),
      paddingVertical: scale(2),
      borderRadius: scale(4),
      marginBottom: scale(4),
    },
    postBadgeText: {
      fontSize: ms(9),
      fontWeight: "800",
    },
    postTitle: {
      fontSize: ms(15),
      fontFamily: "Outfit_900Black",
      color: colors.text,
      lineHeight: ms(18),
      marginBottom: scale(4),
    },
    postDesc: {
      fontSize: ms(11),
      color: colors.textSubtle,
      lineHeight: ms(14),
      marginBottom: scale(6),
    },
    postMetaGrid: {
      gap: scale(4),
      marginBottom: scale(8),
    },
    postMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    postMetaText: {
      fontSize: ms(10),
      color: colors.textSubtle,
      fontWeight: "600",
    },
    postFacePileRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: "auto",
    },
    postFacePileText: {
      fontSize: ms(9),
      color: colors.textMuted,
      fontWeight: "700",
    },

    // Footer
    postDivider: {
      height: 1,
      backgroundColor: colors.borderSoft,
      marginHorizontal: scale(12),
      marginTop: scale(12),
    },
    postActionFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(16),
      paddingVertical: scale(10),
    },
    postActionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      paddingVertical: scale(4),
    },
    postActionText: {
      fontSize: ms(12),
      fontWeight: "700",
      color: colors.textSubtle,
    },
    
    emptyStateText: {
      fontSize: ms(13),
      color: colors.textSubtle,
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: scale(20),
    },
  });
