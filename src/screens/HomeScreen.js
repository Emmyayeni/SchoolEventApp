import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useAudioPlayer } from 'expo-audio';
import { useMemo, useState, useRef } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View, Dimensions, Animated } from "react-native";
import { Image } from "expo-image";
import { AppText } from "../components/AppText";
import { AppTextInput } from "../components/AppTextInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScalePressable } from "../components/ScalePressable";
import { EventSkeletonCard } from "../components/SkeletonLoader";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

// Fixed ink for text/icons that always sit on a white chip/pill over the dark
// hero imagery. Must NOT use colors.primary, which flips to near-white in dark
// mode and would make these elements vanish against the white background.
const HERO_CHIP_INK = "#0f172a";

const CATEGORY_DATA = [
  { label: "All", icon: "apps-outline" },
  { label: "Today", icon: "calendar" },
  { label: "Tomorrow", icon: "calendar-outline" },
  { label: "Academic", icon: "school-outline" },
  { label: "Sports", icon: "football-outline" },
  { label: "Seminar", icon: "mic-outline" },
  { label: "Workshop", icon: "easel-outline" },
];

export default function HomeScreen({
  user,
  dashboardType = "student",
  bookmarkedEventIds = [],
  events = [],
  featuredEvents = [],
  announcements = [],
  notifications = [],
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
  onOpenSidebar,
}) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const screenWidth = Dimensions.get("window").width;
  const CARD_WIDTH = screenWidth - scale(32);

  // Single audio player for the Like sound effect to prevent memory leaks/crashes
  const likePlayer = useAudioPlayer(require("../../assets/sounds/pop.mp3"));

  const isStudent = dashboardType !== "staff";
  const fallbackGreeting = isStudent ? "Student" : "Staff";
  const firstName = (user?.fullName || fallbackGreeting).trim().split(" ")[0] || fallbackGreeting;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning,";
    if (hour < 18) return "Good Afternoon,";
    return "Good Evening,";
  };
  const greeting = getGreeting();

  const unreadAlertsCount = useMemo(() => {
    return notifications.filter((n) => !n.read && !n.isRead).length;
  }, [notifications]);

  const filteredEvents = useMemo(() => {
    const byCategory = events.filter((item) => {
      if (activeCategory === "Today" || activeCategory === "Tomorrow") {
        const day = new Date();
        if (activeCategory === "Tomorrow") day.setDate(day.getDate() + 1);
        const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
        return item.date === dateKey;
      }
      if (activeCategory === "All") return true;
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
  const featuredList = featuredEvents.length > 0 ? featuredEvents.slice(0, 5) : events.slice(0, 5);

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
        {[1, 2, 3].slice(0, count).map((_, i) => (
          <View
            key={i}
            style={{
              width: scale(size),
              height: scale(size),
              borderRadius: scale(size / 2),
              borderWidth: 1,
              borderColor: colors.surface,
              backgroundColor: i === 0 ? colors.primary : i === 1 ? colors.accent : "#3b82f6",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: i > 0 ? -scale(8) : 0,
            }}
          >
            <Ionicons name="person" size={scale(size * 0.55)} color="#fff" />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      {/* TOP APP BAR */}
      <View style={styles.topNav}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            style={styles.menuIcon}
            onPress={onOpenSidebar}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu-outline" size={28} color={colors.text} />
          </Pressable>
          <View style={styles.logoWrap}>
            <Image source={require("../../assets/images/logo.png")} style={styles.headerLogoImage} resizeMode="contain" />
            <View style={styles.logoTextWrap}>
              <AppText style={styles.logoTitle}>NSUK</AppText>
              <AppText style={styles.logoSubtitle}>CAMPUS EVENTS</AppText>
            </View>
          </View>
        </View>
        <Pressable
          style={styles.bellWrap}
          onPress={onOpenNotifications}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {unreadAlertsCount > 0 && (
            <View style={styles.notificationBadge}>
              <AppText style={styles.notificationBadgeText}>
                {unreadAlertsCount > 9 ? "9+" : unreadAlertsCount}
              </AppText>
            </View>
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} tintColor={colors.primary} />}
      >
        {/* GREETING BAR */}
        <View style={styles.greetingRow}>
          <Pressable style={styles.greetingLeft} onPress={onOpenProfile} accessibilityRole="button" accessibilityLabel="Open profile">
            <View>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.greetingAvatar} />
              ) : (
                <View style={[styles.greetingAvatar, { backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" }]}>
                  <AppText style={{ color: colors.primary, fontWeight: "700", fontSize: ms(14) }}>
                    {firstName.charAt(0).toUpperCase()}
                  </AppText>
                </View>
              )}
              <View style={styles.onlineDot} />
            </View>
            <View>
              <AppText style={styles.greetingText}>{greeting} 👋</AppText>
              <AppText style={styles.greetingName}>{firstName}</AppText>
            </View>
          </Pressable>
          <View style={styles.campusDropdown}>
            <Ionicons name="location" size={14} color={colors.primary} />
            <AppText style={styles.campusText}>NSUK Main Campus</AppText>
            <Ionicons name="chevron-down" size={14} color={colors.text} />
          </View>
        </View>

        {/* SEARCH AREA */}
        <Pressable
          style={styles.searchContainer}
          onPress={() => onActivateSearch?.(searchText)}
          accessibilityRole="button"
          accessibilityLabel="Search events"
        >
          <Ionicons name="search" size={20} color={colors.textSubtle} style={{marginLeft: scale(16)}} />
          <AppTextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search events, categories, or organizers..."
            placeholderTextColor={colors.textSubtle}
            style={styles.searchInput}
            pointerEvents="none"
            editable={false}
          />
          <View style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={colors.text} />
          </View>
        </Pressable>

        {/* CATEGORY SQUIRCLES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storyRow}>
          {CATEGORY_DATA.map((cat, i) => {
            const active = cat.label === activeCategory;
            return (
              <ScalePressable
                key={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveCategory(cat.label);
                }}
                style={styles.storyItem}
              >
                <View style={[styles.storySquircle, active && styles.storySquircleActive]}>
                  <Ionicons name={cat.icon} size={18} color={active ? colors.primary : colors.text} />
                </View>
                <AppText style={[styles.storyText, active && styles.storyTextActive]}>{cat.label}</AppText>
                {active && <View style={styles.storyActiveLine} />}
              </ScalePressable>
            );
          })}
        </ScrollView>

        {/* CAMPUS BROADCAST ALERT BANNER */}
        {announcements && announcements.length > 0 && (
          <View style={styles.broadcastBannerWrap}>
            <Pressable
              style={styles.broadcastCard}
              onPress={() => onOpenAnnouncementDetails?.(announcements[0].id)}
              accessibilityRole="button"
              accessibilityLabel={`Campus announcement: ${announcements[0].title}`}
            >
              <View style={styles.broadcastHeader}>
                <View style={styles.broadcastBadge}>
                  <Ionicons name="megaphone" size={11} color="#fff" />
                  <AppText style={styles.broadcastBadgeText}>CAMPUS BROADCAST</AppText>
                </View>
                <AppText style={styles.broadcastTime}>
                  {formatRelativeTime(announcements[0].createdAt || announcements[0].created_at)}
                </AppText>
              </View>

              <AppText style={styles.broadcastTitle} numberOfLines={1}>
                {announcements[0].title}
              </AppText>
              <AppText style={styles.broadcastBody} numberOfLines={2}>
                {announcements[0].body || announcements[0].content || "Tap to view full campus notice."}
              </AppText>

              <View style={styles.broadcastActionRow}>
                <AppText style={styles.broadcastActionText}>View Full Notice</AppText>
                <Ionicons name="arrow-forward" size={12} color={colors.primary} />
              </View>
            </Pressable>
          </View>
        )}

        {/* FEATURED EVENTS CAROUSEL */}
        {featuredList.length > 0 && isStudent && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + scale(16)}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: scale(16), gap: scale(16), paddingBottom: scale(10) }}
            style={{ marginBottom: scale(10) }}
          >
            {featuredList.map((featured) => (
              <ScalePressable key={featured.id} style={[styles.featuredHero, { width: CARD_WIDTH, marginHorizontal: 0, marginBottom: 0 }]} onPress={() => onOpenEvent?.(featured.id)}>
                <Image source={{ uri: featured.image }} style={styles.featuredHeroBg} />
                <LinearGradient colors={["transparent", "rgba(0, 42, 20, 0.96)"]} style={styles.featuredGradient} />
                <View style={styles.featuredHeroContent}>
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={10} color="#fff" />
                    <AppText style={styles.featuredBadgeText}>FEATURED EVENT</AppText>
                  </View>
                  <AppText style={styles.featuredHeroTitle}>{featured.title}</AppText>
                  <AppText style={styles.featuredHeroDesc} numberOfLines={1}>
                    {featured.description || "Small daily habits matter"}
                  </AppText>
                  
                  <View style={styles.featuredHeroMetaBlock}>
                    <View style={styles.metaLine}>
                      <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                      <AppText style={styles.featuredHeroMetaText}>{formatDate(featured.date)}</AppText>
                    </View>
                    <View style={styles.metaLine}>
                      <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                      <AppText style={styles.featuredHeroMetaText}>{featured.time || "9:00 AM"}</AppText>
                    </View>
                    <View style={styles.metaLine}>
                      <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                      <AppText style={styles.featuredHeroMetaText} numberOfLines={1}>{featured.venue}</AppText>
                    </View>
                  </View>

                  <View style={styles.featuredHeroBottom}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {renderFaces(2, 20)}
                      <AppText style={styles.facePileText}>
                        {featured.registeredCount ? `${featured.registeredCount} Registered` : "Registration Open"}
                      </AppText>
                    </View>
                    <Pressable
                      style={styles.viewDetailsBtn}
                      onPress={() => onOpenEvent?.(featured.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`View details for ${featured.title}`}
                    >
                      <AppText style={styles.viewDetailsText}>View Details</AppText>
                      <Ionicons name="arrow-forward" size={14} color={HERO_CHIP_INK} />
                    </Pressable>
                  </View>
                </View>
              </ScalePressable>
            ))}
          </ScrollView>
        )}

        {/* ORGANIZER METRICS HERO CARD */}
        {!isStudent && (
          <View style={styles.organizerHero}>
            <Image source={{ uri: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80" }} style={styles.featuredHeroBg} />
            <LinearGradient colors={["transparent", "rgba(0, 42, 20, 0.96)"]} style={styles.featuredGradient} />
            <View style={styles.featuredHeroContent}>
              <View style={[styles.featuredBadge, { backgroundColor: "#fff" }]}>
                <Ionicons name="stats-chart" size={10} color={HERO_CHIP_INK} />
                <AppText style={[styles.featuredBadgeText, { color: HERO_CHIP_INK }]}>ORGANIZER DASHBOARD</AppText>
              </View>
              <AppText style={styles.featuredHeroTitle}>Welcome back, {firstName}!</AppText>
              <AppText style={styles.featuredHeroDesc}>Here is a quick overview of your campus events.</AppText>
              
              <View style={styles.organizerStatsRow}>
                <View style={styles.organizerStatBox}>
                  <AppText style={styles.organizerStatValue}>{activeEventsCount}</AppText>
                  <AppText style={styles.organizerStatLabel}>Active Events</AppText>
                </View>
                <View style={styles.organizerStatDivider} />
                <View style={styles.organizerStatBox}>
                  <AppText style={styles.organizerStatValue}>{totalRegistrations}</AppText>
                  <AppText style={styles.organizerStatLabel}>Total RSVPs</AppText>
                </View>
              </View>

              <View style={styles.featuredHeroBottom}>
                <Pressable
                  style={styles.viewDetailsBtn}
                  onPress={onOpenManageEvents}
                  accessibilityRole="button"
                  accessibilityLabel="Manage events"
                >
                  <AppText style={styles.viewDetailsText}>Manage Events</AppText>
                  <Ionicons name="settings-outline" size={14} color={HERO_CHIP_INK} />
                </Pressable>
                <Pressable
                  style={[styles.viewDetailsBtn, { backgroundColor: colors.accent }]}
                  onPress={onCreateEvent}
                  accessibilityRole="button"
                  accessibilityLabel="Create event"
                >
                  <AppText style={[styles.viewDetailsText, { color: colors.accentContrast }]}>Create Event</AppText>
                  <Ionicons name="add" size={14} color={colors.accentContrast} />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* TOP EVENTS FOR YOU */}
        {isStudent && upcoming.length > 0 && (
          <View style={styles.topEventsSection}>
            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>Top events for you</AppText>
              <Pressable style={styles.seeAllBtn}>
                <AppText style={styles.seeAllText}>See all</AppText>
                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topEventsScroll}>
              {upcoming.slice(0, 5).map((item) => (
                <ScalePressable key={item.id} style={styles.topEventCard} onPress={() => onOpenEvent?.(item.id)}>
                  <View style={styles.topEventImageWrap}>
                    <Image source={{ uri: item.image }} style={styles.topEventImage} />
                    <Pressable
                      style={styles.topEventBookmark}
                      onPress={() => onToggleBookmark?.(item.id)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={bookmarkedEventIds.includes(item.id) ? "Remove from saved" : "Save event"}
                    >
                      <Ionicons name={bookmarkedEventIds.includes(item.id) ? "bookmark" : "bookmark-outline"} size={16} color="#fff" />
                    </Pressable>
                  </View>
                  <View style={styles.topEventContent}>
                    <View style={styles.topEventBadge}>
                      <AppText style={[styles.topEventBadgeText, { color: colors.primary }]}>{item.category || "Academic"}</AppText>
                    </View>
                    <AppText style={styles.topEventTitle} numberOfLines={1}>{item.title}</AppText>
                    <View style={styles.topEventMetaLine}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textSubtle} />
                      <AppText style={styles.topEventMetaText}>{formatDate(item.date)} • {item.time || "10:00 AM"}</AppText>
                    </View>
                    <View style={styles.topEventMetaLine}>
                      <Ionicons name="location-outline" size={12} color={colors.textSubtle} />
                      <AppText style={styles.topEventMetaText} numberOfLines={1}>{item.venue}</AppText>
                    </View>
                    <View style={styles.topEventBottomRow}>
                      <View style={{ flexDirection: "row" }}>
                        {renderFaces(3, 16)}
                      </View>
                      <AppText style={styles.topEventGoingText}>112 Going</AppText>
                    </View>
                  </View>
                </ScalePressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* FEED LOOP */}
        <View style={styles.feedWrap}>
          <View style={styles.feedHeaderRow}>
            <AppText style={styles.sectionTitle}>Feed</AppText>
            <View style={styles.feedFilterPill}>
              <AppText style={styles.feedFilterText}>Most recent</AppText>
              <Ionicons name="chevron-down" size={12} color={colors.textSubtle} />
            </View>
          </View>

          {upcoming.length === 0 && refreshing ? (
            <>
              <EventSkeletonCard />
              <EventSkeletonCard />
            </>
          ) : upcoming.length === 0 ? (
            <AppText style={styles.emptyStateText}>No events found in this category.</AppText>
          ) : (
            upcoming.map((item) => (
              <SocialEventPost 
                key={String(item.id)} 
                item={item} 
                colors={colors} 
                styles={styles}
                onPress={() => onOpenEvent?.(item.id)}
                bookmarked={bookmarkedEventIds.includes(item.id)}
                onToggleBookmark={() => onToggleBookmark?.(item.id)}
                likePlayer={likePlayer}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SocialEventPost({ item, colors, styles, onPress, bookmarked, onToggleBookmark, likePlayer }) {
  const [isLiked, setIsLiked] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const avatarUrl = `https://randomuser.me/api/portraits/men/${(String(item.id).charCodeAt(0) % 90) + 1}.jpg`;
  
  const handleLike = async () => {
    const willLike = !isLiked;
    setIsLiked(willLike);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (willLike) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();

      try {
        if (likePlayer) {
          likePlayer.seekTo(0);
          likePlayer.play();
        }
      } catch (e) {
        console.log("Audio play error:", e);
      }
    } else {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        {(!item.organizer || item.organizer === "Student Union") ? (
          <View style={[styles.postAvatar, { backgroundColor: "#0B2A15", alignItems: "center", justifyContent: "center" }]}>
            <AppText style={{ color: "#2EFE7E", fontFamily: "Outfit_900Black", fontSize: ms(16) }}>SU</AppText>
          </View>
        ) : (
          <Image source={{ uri: avatarUrl }} style={styles.postAvatar} />
        )}
        <View style={styles.postHeaderInfo}>
          <View style={styles.postAuthorRow}>
            <AppText style={styles.postAuthorName}>{item.organizer || "Student Union"}</AppText>
            <Ionicons name="checkmark-circle" size={14} color="#1DA1F2" />
          </View>
          <View style={styles.postTimeRow}>
            <AppText style={styles.postTimeText}>{formatRelativeTime(item.created_at || item.date)}</AppText>
            <AppText style={{ marginHorizontal: scale(4), color: colors.textMuted }}>•</AppText>
            <Ionicons name="globe-outline" size={11} color={colors.textMuted} />
          </View>
        </View>
        <Pressable style={styles.postOptionsBtn}>
          <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Post Body (Social Media Style) */}
      <Pressable style={styles.postBodySocial} onPress={onPress}>
        <AppText style={styles.postDescSocial} numberOfLines={3}>
          {item.description || "Join us for this campus event."}
        </AppText>
        
        <View style={styles.postImageWrapperSocial}>
          <Image source={{ uri: item.image }} style={styles.postImageSocial} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.postImageGradientSocial} />
          <View style={styles.postImageOverlaySocial}>
            <AppText style={styles.postImageTitleSocial} numberOfLines={1}>{item.title}</AppText>
            <View style={styles.postImageMetaRowSocial}>
              <Ionicons name="calendar-outline" size={10} color="rgba(255,255,255,0.8)" />
              <AppText style={styles.postImageMetaTextSocial}>{formatShortDate(item.date)}</AppText>
              <AppText style={styles.postImageMetaDotSocial}>•</AppText>
              <AppText style={styles.postImageMetaTextSocial} numberOfLines={1}>{item.venue}</AppText>
            </View>
          </View>
        </View>
      </Pressable>

      <View style={styles.postDivider} />

      {/* Action Footer */}
      <View style={styles.postActionFooter}>
        <Pressable
          style={styles.postActionBtn}
          onPress={handleLike}
          accessibilityRole="button"
          accessibilityLabel={isLiked ? "Unlike" : "Like"}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={18} color={isLiked ? "#ff4444" : colors.textSubtle} />
          </Animated.View>
          <AppText style={[styles.postActionText, isLiked && { color: "#ff4444", fontWeight: "700" }]}>Like</AppText>
        </Pressable>
        <Pressable
          style={styles.postActionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleBookmark();
          }}
          accessibilityRole="button"
          accessibilityLabel={bookmarked ? "Remove from saved" : "Save event"}
        >
          <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={18} color={bookmarked ? colors.primary : colors.textSubtle} />
          <AppText style={styles.postActionText}>Save</AppText>
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

function formatRelativeTime(dateString) {
  if (!dateString) return "Recently";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "Recently";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
    headerLogoImage: {
      width: scale(32),
      height: scale(32),
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
    onlineDot: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: scale(10),
      height: scale(10),
      backgroundColor: colors.primary,
      borderRadius: scale(5),
      borderWidth: 2,
      borderColor: colors.background,
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
      marginHorizontal: scale(16),
      marginTop: scale(16),
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderRadius: scale(24), // Pill shape
      height: scale(48),
      paddingRight: scale(16),
    },
    searchInput: {
      flex: 1,
      fontSize: ms(13),
      fontFamily: "Outfit_400Regular",
      color: colors.text,
      marginLeft: scale(8),
    },
    filterBtn: {
      borderLeftWidth: 1,
      borderLeftColor: colors.borderSoft,
      paddingLeft: scale(12),
      height: scale(24),
      justifyContent: "center",
    },

    // Categories (Stories)
    storyRow: {
      paddingHorizontal: scale(16),
      paddingVertical: scale(16),
      gap: scale(18),
    },
    storyItem: {
      alignItems: "center",
      gap: scale(4),
      width: scale(48),
    },
    storySquircle: {
      width: scale(44),
      height: scale(44),
      borderRadius: scale(14), // Squircle shape
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: isDark ? colors.surfaceAlt : colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    storySquircleActive: {
      backgroundColor: colors.primary + "15",
      borderColor: colors.primary,
    },
    storyActiveLine: {
      width: scale(16),
      height: scale(3),
      backgroundColor: colors.primary,
      borderRadius: 2,
      marginTop: scale(-2),
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
      height: scale(200),
      borderRadius: scale(20),
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
      backgroundColor: colors.accent,
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
      fontSize: ms(22),
      fontFamily: "Outfit_800ExtraBold",
      lineHeight: ms(26),
      marginBottom: scale(3),
      width: "90%",
    },
    featuredHeroDesc: {
      color: "#fff",
      fontSize: ms(13),
      fontFamily: "Outfit_500Medium",
      marginBottom: scale(12),
      width: "90%",
    },
    featuredHeroMetaBlock: {
      gap: scale(4),
      marginBottom: scale(8),
    },
    metaLine: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    featuredHeroMetaText: {
      color: "rgba(255,255,255,0.95)",
      fontSize: ms(11),
      fontWeight: "600",
    },
    featuredHeroBottom: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
    facePileText: {
      color: "#fff",
      fontSize: ms(10),
      fontWeight: "500",
      marginLeft: scale(8),
    },
    faceMoreBadge: {
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      backgroundColor: "rgba(255,255,255,0.3)",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: -scale(10),
      borderWidth: 1.5,
      borderColor: "rgba(0,0,0,0.2)",
    },
    faceMoreText: {
      color: "#fff",
      fontSize: ms(9),
      fontWeight: "700",
    },
    viewDetailsBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      paddingHorizontal: scale(14),
      paddingVertical: scale(10),
      borderRadius: scale(24),
      gap: scale(4),
    },
    viewDetailsText: {
      color: HERO_CHIP_INK,
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
      flex: 1,
    },
    // Top Events Section
    topEventsSection: {
      marginTop: scale(10),
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(16),
      marginBottom: scale(12),
    },
    sectionTitle: {
      fontSize: ms(16),
      fontFamily: "Outfit_800ExtraBold",
      color: colors.text,
    },
    seeAllBtn: {
      flexDirection: "row",
      alignItems: "center",
    },
    seeAllText: {
      fontSize: ms(12),
      fontWeight: "700",
      color: colors.primary,
    },
    topEventsScroll: {
      paddingHorizontal: scale(16),
      gap: scale(16),
      paddingBottom: scale(20),
    },
    topEventCard: {
      width: scale(200),
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: colors.borderSoft,
      overflow: "hidden",
    },
    topEventImageWrap: {
      width: "100%",
      height: scale(120),
    },
    topEventImage: {
      width: "100%",
      height: "100%",
    },
    topEventBookmark: {
      position: "absolute",
      top: scale(10),
      right: scale(10),
      width: scale(28),
      height: scale(28),
      borderRadius: scale(14),
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
    },
    topEventContent: {
      padding: scale(12),
    },
    topEventBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: scale(8),
      paddingVertical: scale(4),
      borderRadius: scale(6),
      marginBottom: scale(8),
    },
    topEventBadgeText: {
      fontSize: ms(9),
      fontWeight: "800",
    },
    topEventTitle: {
      fontSize: ms(13),
      fontFamily: "Outfit_800ExtraBold",
      color: colors.text,
      marginBottom: scale(6),
    },
    topEventMetaLine: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      marginBottom: scale(4),
    },
    topEventMetaText: {
      fontSize: ms(10),
      color: colors.textSubtle,
      fontWeight: "500",
      flex: 1,
    },
    topEventBottomRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: scale(10),
      gap: scale(8),
    },
    topEventGoingText: {
      fontSize: ms(10),
      color: colors.text,
      fontWeight: "600",
    },

    // Feed Layout
    feedHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(16),
      marginBottom: scale(16),
    },
    feedFilterPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      paddingHorizontal: scale(10),
      paddingVertical: scale(6),
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      borderRadius: scale(16),
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    feedFilterText: {
      fontSize: ms(10),
      color: colors.textSubtle,
      fontWeight: "600",
    },
    
    feedWrap: {
      paddingBottom: scale(100),
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
    
    // Social Media Style Body
    postBodySocial: {
      paddingHorizontal: scale(16),
      paddingBottom: scale(12),
    },
    postDescSocial: {
      fontSize: ms(13),
      fontFamily: "Outfit_400Regular",
      color: colors.text,
      lineHeight: ms(18),
      marginBottom: scale(12),
    },
    postImageWrapperSocial: {
      width: "100%",
      height: scale(180),
      borderRadius: scale(16),
      overflow: "hidden",
      backgroundColor: colors.background,
    },
    postImageSocial: {
      width: "100%",
      height: "100%",
    },
    postImageGradientSocial: {
      ...StyleSheet.absoluteFillObject,
    },
    postImageOverlaySocial: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: scale(12),
    },
    postImageTitleSocial: {
      color: "#fff",
      fontSize: ms(14),
      fontFamily: "Outfit_800ExtraBold",
      marginBottom: scale(4),
    },
    postImageMetaRowSocial: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    postImageMetaTextSocial: {
      color: "rgba(255,255,255,0.9)",
      fontSize: ms(10),
      fontWeight: "500",
    },
    postImageMetaDotSocial: {
      color: "rgba(255,255,255,0.5)",
      fontSize: ms(10),
      marginHorizontal: scale(2),
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
      gap: scale(28),
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

    // Campus Broadcast Alert Styles
    broadcastBannerWrap: {
      paddingHorizontal: scale(16),
      marginBottom: scale(14),
    },
    broadcastCard: {
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.borderSoft,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
      borderRadius: scale(12),
      padding: scale(14),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    broadcastHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(6),
    },
    broadcastBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: colors.accent,
      paddingHorizontal: scale(8),
      paddingVertical: scale(3),
      borderRadius: scale(4),
    },
    broadcastBadgeText: {
      color: "#fff",
      fontSize: ms(8),
      fontWeight: "900",
      letterSpacing: 0.6,
    },
    broadcastTime: {
      color: colors.textSubtle,
      fontSize: ms(11),
      fontWeight: "600",
    },
    broadcastTitle: {
      color: colors.text,
      fontSize: ms(15),
      fontWeight: "800",
      marginBottom: scale(3),
    },
    broadcastBody: {
      color: colors.textMuted,
      fontSize: ms(13),
      lineHeight: ms(18),
      marginBottom: scale(8),
    },
    broadcastActionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      alignSelf: "flex-end",
    },
    broadcastActionText: {
      color: colors.primary,
      fontSize: ms(12),
      fontWeight: "800",
    },
  });
