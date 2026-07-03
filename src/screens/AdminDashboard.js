import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Image, ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScalePressable } from "../components/ScalePressable";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function AdminDashboard({
  currentUser,
  stats = {
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    activeAnnouncements: 0,
  },
  recentEvents = [],
  recentUsers = [],
  onManageEvents,
  onManageUsers,
  onManageAnnouncements,
  onViewAnalytics,
  onBack,
  refreshing,
  onRefreshData,
}) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const displayName = currentUser?.fullName || "Admin";
  const avatarUri = currentUser?.avatar || "";
  const initials = String(displayName)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + scale(24) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} tintColor={colors.primary} />}
        bounces={false}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: (insets?.top ?? 0) + scale(10) }]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerRight}>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                <Text style={styles.roleText}>{currentUser?.role || "Admin"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.title} numberOfLines={1}>{displayName}</Text>
            </View>
            <View style={styles.avatarWrap}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitials}>{initials || "A"}</Text>
              )}
            </View>
          </View>
        </LinearGradient>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Quick Actions (Floating above gradient) */}
          <View style={styles.actionsContainer}>
            <ActionButton icon="calendar" label="Events" onPress={onManageEvents} colors={colors} styles={styles} color="#3b82f6" />
            <ActionButton icon="people" label="Users" onPress={onManageUsers} colors={colors} styles={styles} color="#8b5cf6" />
            <ActionButton icon="megaphone" label="Announce" onPress={onManageAnnouncements} colors={colors} styles={styles} color="#f59e0b" />
            <ActionButton icon="bar-chart" label="Analytics" onPress={onViewAnalytics} colors={colors} styles={styles} color="#10b981" />
          </View>

          {/* Stats Grid */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard icon="calendar-outline" label="Total Events" value={stats.totalEvents} colors={colors} styles={styles} />
              <StatCard icon="people-outline" label="Total Users" value={stats.totalUsers} colors={colors} styles={styles} />
              <StatCard icon="ticket-outline" label="Registrations" value={stats.totalRegistrations} colors={colors} styles={styles} />
              <StatCard icon="notifications-outline" label="Active Alerts" value={stats.activeAnnouncements} colors={colors} styles={styles} />
            </View>
          </View>

          {/* System Health */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>System Health</Text>
            <View style={styles.healthCard}>
              <View style={styles.healthRow}>
                <View style={styles.healthIconWrap}>
                  <Ionicons name="server" size={24} color={colors.primary} />
                </View>
                <View style={styles.healthTextWrap}>
                  <Text style={styles.healthTitle}>All systems operational</Text>
                  <Text style={styles.healthSubtitle}>Database, Auth, and Storage are running smoothly.</Text>
                </View>
                <View style={styles.healthBadge}>
                  <Text style={styles.healthBadgeText}>99.9% Uptime</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Activity Feed */}
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityFeed}>
              {recentEvents.length === 0 && recentUsers.length === 0 ? (
                <Text style={styles.emptyText}>No recent activity</Text>
              ) : (
                <>
                  {recentEvents.slice(0, 2).map((event) => (
                    <ActivityItem
                      key={`ev-${event.id}`}
                      icon="calendar"
                      color="#3b82f6"
                      title={`New Event: ${event.title}`}
                      subtitle={`${event.date} • by ${event.organizer || 'Admin'}`}
                      colors={colors}
                      styles={styles}
                    />
                  ))}
                  {recentUsers.slice(0, 2).map((user) => (
                    <ActivityItem
                      key={`us-${user.id}`}
                      icon="person-add"
                      color="#10b981"
                      title={`New User: ${user.fullName}`}
                      subtitle={`${user.accountType} ${user.accountStatus === 'pending' ? '(Pending)' : ''} • ${user.department || 'NSUK'}`}
                      colors={colors}
                      styles={styles}
                    />
                  ))}
                </>
              )}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, colors, styles }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.statTextWrap}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function ActionButton({ icon, label, onPress, colors, styles, color }) {
  return (
    <ScalePressable style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIconWrap, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </ScalePressable>
  );
}

function ActivityItem({ icon, color, title, subtitle, colors, styles }) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconWrap, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.activityTextWrap}>
        <Text style={styles.activityTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.activitySubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
    },
    headerGradient: {
      paddingHorizontal: scale(20),
      paddingBottom: scale(60), // Extra padding for overlapping actions
      borderBottomLeftRadius: scale(30),
      borderBottomRightRadius: scale(30),
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      marginBottom: scale(20),
    },
    roleBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primaryContrast,
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      borderRadius: 999,
      gap: scale(4),
    },
    roleText: {
      fontSize: ms(12),
      fontWeight: "800",
      color: colors.primary,
      textTransform: "capitalize",
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTextWrap: {
      flex: 1,
      paddingRight: scale(16),
    },
    greeting: {
      fontSize: ms(14),
      color: "rgba(255,255,255,0.8)",
      fontWeight: "600",
      marginBottom: scale(4),
    },
    title: {
      fontSize: ms(26),
      fontWeight: "900",
      color: colors.primaryContrast,
    },
    avatarWrap: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(32),
      backgroundColor: colors.primaryContrast,
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.3)",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarInitials: {
      fontSize: ms(22),
      fontWeight: "800",
      color: colors.primary,
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      marginHorizontal: scale(20),
      marginTop: -scale(40),
      borderRadius: scale(20),
      padding: scale(16),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 15,
      elevation: 5,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.borderSoft,
    },
    actionBtn: {
      alignItems: "center",
      flex: 1,
    },
    actionIconWrap: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(16),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(8),
    },
    actionLabel: {
      fontSize: ms(11),
      fontWeight: "700",
      color: colors.text,
    },
    sectionWrap: {
      marginTop: scale(28),
      paddingHorizontal: scale(20),
    },
    sectionTitle: {
      fontSize: ms(16),
      fontWeight: "800",
      color: colors.text,
      marginBottom: scale(16),
      letterSpacing: -0.3,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(12),
    },
    statCard: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: colors.surface,
      borderRadius: scale(16),
      padding: scale(16),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.03,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    statIconWrap: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(12),
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    statTextWrap: {
      flex: 1,
    },
    statValue: {
      fontSize: ms(20),
      fontWeight: "800",
      color: colors.text,
      marginBottom: scale(2),
    },
    statLabel: {
      fontSize: ms(11),
      fontWeight: "600",
      color: colors.textMuted,
    },
    healthCard: {
      backgroundColor: colors.surface,
      borderRadius: scale(16),
      padding: scale(16),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.03,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    healthRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    healthIconWrap: {
      width: scale(48),
      height: scale(48),
      borderRadius: scale(24),
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    healthTextWrap: {
      flex: 1,
    },
    healthTitle: {
      fontSize: ms(14),
      fontWeight: "800",
      color: colors.text,
      marginBottom: scale(4),
    },
    healthSubtitle: {
      fontSize: ms(11),
      fontWeight: "500",
      color: colors.textSubtle,
      lineHeight: ms(15),
    },
    healthBadge: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: scale(10),
      paddingVertical: scale(6),
      borderRadius: 999,
    },
    healthBadgeText: {
      fontSize: ms(10),
      fontWeight: "800",
      color: colors.primary,
    },
    activityFeed: {
      backgroundColor: colors.surface,
      borderRadius: scale(16),
      padding: scale(16),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.2 : 0.03,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      gap: scale(16),
    },
    activityItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    activityIconWrap: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      alignItems: "center",
      justifyContent: "center",
    },
    activityTextWrap: {
      flex: 1,
    },
    activityTitle: {
      fontSize: ms(13),
      fontWeight: "700",
      color: colors.text,
      marginBottom: scale(2),
    },
    activitySubtitle: {
      fontSize: ms(11),
      fontWeight: "500",
      color: colors.textMuted,
    },
    emptyText: {
      textAlign: "center",
      color: colors.textSubtle,
      fontStyle: "italic",
      paddingVertical: scale(10),
    },
  });
