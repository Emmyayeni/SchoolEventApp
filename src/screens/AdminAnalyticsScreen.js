import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function AdminAnalyticsScreen({
  analytics = {
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    averageAttendance: 0,
    eventsByCategory: {},
    usersByDepartment: {},
    registrationTrend: [],
    topEvents: [],
  },
  onBack,
  onExportReport,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const categoryChartData = useMemo(() => {
    if (!analytics.eventsByCategory) return [];
    return Object.entries(analytics.eventsByCategory).map(([category, count]) => ({
      category,
      count,
    }));
  }, [analytics.eventsByCategory]);

  const topEventsData = useMemo(() => {
    if (!analytics.topEvents) return [];
    return analytics.topEvents.slice(0, 5);
  }, [analytics.topEvents]);

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={colors.accent} />
        </Pressable>
        <AppText style={[styles.title, { color: colors.text }]}>Analytics</AppText>
        <Pressable
          style={styles.backBtn}
          onPress={onExportReport}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Export report"
        >
          <Ionicons name="download" size={18} color={colors.primary} />
        </Pressable>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          icon="calendar"
          title="Total Events"
          value={analytics.totalEvents}
          colors={colors}
          styles={styles}
        />
        <MetricCard
          icon="people"
          title="Total Users"
          value={analytics.totalUsers}
          colors={colors}
          styles={styles}
        />
        <MetricCard
          icon="checkmark-circle"
          title="Registrations"
          value={analytics.totalRegistrations}
          colors={colors}
          styles={styles}
        />
        <MetricCard
          icon="pie-chart"
          title="RSVPs per Event"
          value={analytics.averageRegistrations || 0}
          colors={colors}
          styles={styles}
        />
      </View>

      {/* Events by Category */}
      {categoryChartData.length > 0 && (
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>Events by Category</AppText>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}>
            {categoryChartData.map((item, index) => (
              <View key={item.category}>
                <View style={styles.chartRow}>
                  <AppText style={[styles.chartLabel, { color: colors.text }]} numberOfLines={1}>
                    {item.category}
                  </AppText>
                  <AppText style={[styles.chartValue, { color: colors.primary }]}>{item.count}</AppText>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${Math.min((item.count / (Math.max(...categoryChartData.map((d) => d.count)) || 1)) * 100, 100)}%`,
                      },
                    ]}
                  />
                </View>
                {index < categoryChartData.length - 1 && (
                  <View style={[styles.divider, { borderBottomColor: colors.borderSoft }]} />
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Top Events */}
      {topEventsData.length > 0 && (
        <View style={styles.section}>
          <AppText style={[styles.sectionTitle, { color: colors.text }]}>Top Events</AppText>
          <View style={styles.topEventsList}>
            {topEventsData.map((event, index) => (
              <View
                key={String(event.id)}
                style={[styles.topEventCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}
              >
                <View style={styles.rankBadge}>
                  <AppText style={[styles.rankNumber, { color: colors.primaryContrast }]}>{index + 1}</AppText>
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                    {event.title}
                  </AppText>
                  <AppText style={[styles.eventStats, { color: colors.textMuted }]}>
                    {Number.isFinite(event.registeredCount) ? `${event.registeredCount} registered` : "RSVP count unavailable"}
                  </AppText>
                </View>

              </View>
            ))}
          </View>
        </View>
      )}

      {/* Engagement Insights */}
      <View style={styles.section}>
        <AppText style={[styles.sectionTitle, { color: colors.text }]}>Engagement Insights</AppText>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}>
          <InsightRow
            icon="people-outline"
            label="Avg. Event Size"
            value={`${analytics.totalEvents > 0 ? Math.round(analytics.totalRegistrations / analytics.totalEvents) : 0} people`}
            colors={colors}
          />
        </View>
      </View>

      {/* Report Export Card */}
      <View style={[styles.reportCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
        <Ionicons name="document-text" size={32} color={colors.primary} />
        <AppText style={[styles.reportTitle, { color: colors.text }]}>Generate Report</AppText>
        <AppText style={[styles.reportText, { color: colors.textMuted }]}>
          Share the latest event and registration totals from your account
        </AppText>
        <Pressable
          style={[styles.reportButton, { backgroundColor: colors.primary }]}
          onPress={onExportReport}
          accessibilityRole="button"
          accessibilityLabel="Export report"
        >
          <Ionicons name="download" size={16} color={colors.primaryContrast} />
          <AppText style={[styles.reportButtonText, { color: colors.primaryContrast }]}>Export Report</AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function MetricCard({ icon, title, value, colors, styles }) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}>
      <View style={[styles.metricIcon, { backgroundColor: colors.primary + "20" }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <AppText style={[styles.metricTitle, { color: colors.textMuted }]}>{title}</AppText>
      <AppText style={[styles.metricValue, { color: colors.text }]}>{value}</AppText>
    </View>
  );
}

function InsightRow({ icon, label, value, colors }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: scale(12), gap: scale(12) }}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: ms(12), color: colors.textMuted, marginBottom: scale(2) }}>{label}</AppText>
        <AppText style={{ fontSize: ms(13), fontWeight: "700", color: colors.text }}>{value}</AppText>
      </View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: scale(14),
      paddingBottom: scale(24),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(20),
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
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(10),
      marginBottom: scale(24),
    },
    metricCard: {
      flex: 1,
      minWidth: "47%",
      borderRadius: scale(12),
      borderWidth: 1,
      padding: scale(12),
      alignItems: "center",
    },
    metricIcon: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(8),
    },
    metricTitle: {
      fontSize: ms(11),
      fontWeight: "600",
      marginBottom: scale(4),
    },
    metricValue: {
      fontSize: ms(18),
      fontWeight: "800",
      marginBottom: scale(4),
    },
    metricChange: {
      fontSize: ms(10),
      fontWeight: "700",
    },
    section: {
      marginBottom: scale(20),
    },
    sectionTitle: {
      fontSize: ms(14),
      fontWeight: "700",
      marginBottom: scale(10),
    },
    card: {
      borderRadius: scale(12),
      borderWidth: 1,
      padding: scale(12),
    },
    chartRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: scale(6),
    },
    chartLabel: {
      flex: 1,
      fontSize: ms(12),
      fontWeight: "600",
    },
    chartValue: {
      fontSize: ms(13),
      fontWeight: "700",
    },
    progressBar: {
      height: scale(6),
      borderRadius: scale(3),
      overflow: "hidden",
      marginBottom: scale(10),
    },
    progressFill: {
      height: "100%",
    },
    divider: {
      borderBottomWidth: 1,
      marginVertical: scale(8),
    },
    topEventsList: {
      gap: scale(10),
    },
    topEventCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: scale(10),
      borderWidth: 1,
      paddingHorizontal: scale(12),
      paddingVertical: scale(10),
      gap: scale(12),
    },
    rankBadge: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    rankNumber: {
      fontSize: ms(14),
      fontWeight: "800",
    },
    eventTitle: {
      fontSize: ms(12),
      fontWeight: "700",
    },
    eventStats: {
      fontSize: ms(10),
      fontWeight: "500",
      marginTop: scale(2),
    },
    eventRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
    },
    ratingText: {
      fontSize: ms(11),
      fontWeight: "700",
    },
    reportCard: {
      borderRadius: scale(12),
      borderWidth: 1,
      padding: scale(16),
      alignItems: "center",
      marginTop: scale(4),
    },
    reportTitle: {
      fontSize: ms(15),
      fontWeight: "800",
      marginTop: scale(10),
    },
    reportText: {
      fontSize: ms(12),
      fontWeight: "500",
      marginTop: scale(6),
      textAlign: "center",
    },
    reportButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      marginTop: scale(12),
      paddingHorizontal: scale(20),
      paddingVertical: scale(10),
      borderRadius: scale(10),
    },
    reportButtonText: {
      fontSize: ms(13),
      fontWeight: "700",
    },
  });
