import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen({ user, onOpenNotifications, onOpenSettings }) {
  const stats = [
    { label: "Total Events", value: "24", badge: "+4%", icon: "calendar" },
    { label: "Upcoming", value: "8", badge: "Active", icon: "trophy" },
    { label: "Users", value: "1,240", badge: "+120", icon: "people" },
    { label: "Total RSVPs", value: "3,500", badge: "Total", icon: "person-add" },
  ];

  const quickActions = [
    { key: "create", label: "Create Event", icon: "add", active: true },
    { key: "manage", label: "Manage Events", icon: "document-text" },
    { key: "attendance", label: "Attendance", icon: "clipboard" },
    { key: "announce", label: "Announce", icon: "megaphone", warm: true },
  ];

  const activities = [
    { id: "1", title: "Bello Musa registered for Convocation 2024", time: "2 minutes ago", icon: "person-add" },
    { id: "2", title: "Aisha Yusuf registered for Tech Fest NSUK", time: "15 minutes ago", icon: "person-add" },
    { id: "3", title: 'Announcement sent: "New venue for Seminar B"', time: "1 hour ago", icon: "megaphone" },
    { id: "4", title: "Event Verified: Inter-Faculty Games", time: "3 hours ago", icon: "checkmark-circle" },
  ];

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={styles.userRow}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.brand}>NSUK EVENTS</Text>
            <Text style={styles.adminName}>Admin: Dr. Ibrahim</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable onPress={onOpenNotifications} style={styles.iconButton}>
            <Ionicons name="notifications" size={15} color="#0b7a24" />
          </Pressable>
          <Pressable onPress={onOpenSettings} style={styles.iconButton}>
            <Ionicons name="settings" size={15} color="#0b7a24" />
          </Pressable>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <View style={styles.statTop}>
              <View style={styles.statIconWrap}>
                <Ionicons name={item.icon} size={15} color="#0b7a24" />
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>{item.badge}</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>{item.label}</Text>
            <Text style={styles.statValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickRow}>
        {quickActions.map((action) => (
          <Pressable key={action.key} style={styles.quickItem}>
            <View
              style={[
                styles.quickIconWrap,
                action.active && styles.quickIconWrapActive,
                action.warm && styles.quickIconWrapWarm,
              ]}
            >
              <Ionicons name={action.icon} size={17} color="#0b7a24" />
            </View>
            <Text style={styles.quickLabel}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.activityHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Text style={styles.viewAll}>View all</Text>
      </View>

      <View style={styles.activityCard}>
        {activities.map((item, index) => (
          <Pressable key={item.id} style={[styles.activityRow, index !== activities.length - 1 && styles.rowBorder]}>
            <View style={styles.activityLeft}>
              <View style={styles.activityIconWrap}>
                <Ionicons name={item.icon} size={13} color="#0b7a24" />
              </View>
              <View style={styles.activityBody}>
                <Text style={styles.activityText}>{item.title}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={15} color="#94a3b8" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#e9ecea",
  },
  pageContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d5dfd8",
  },
  brand: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  adminName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#d8e9dc",
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    backgroundColor: "#f2f4f3",
    borderWidth: 1,
    borderColor: "#dfe5e2",
    padding: 12,
    minHeight: 116,
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statIconWrap: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#deebe1",
    alignItems: "center",
    justifyContent: "center",
  },
  statBadge: {
    borderRadius: 999,
    backgroundColor: "#d8f2df",
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  statBadgeText: {
    color: "#0b7a24",
    fontSize: 10,
    fontWeight: "900",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
  },
  statValue: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 2,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 26,
    fontWeight: "900",
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  quickItem: {
    alignItems: "center",
    width: "24%",
    gap: 6,
  },
  quickIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#edf2ef",
    borderWidth: 1,
    borderColor: "#dae2dc",
  },
  quickIconWrapActive: {
    backgroundColor: "#d8f2df",
    borderColor: "#bce5c8",
  },
  quickIconWrapWarm: {
    backgroundColor: "#efe7b8",
    borderColor: "#e4da94",
  },
  quickLabel: {
    textAlign: "center",
    color: "#111827",
    fontSize: 10,
    fontWeight: "700",
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  viewAll: {
    color: "#166534",
    fontSize: 16,
    fontWeight: "800",
  },
  activityCard: {
    borderRadius: 18,
    backgroundColor: "#f2f4f3",
    borderWidth: 1,
    borderColor: "#dfe5e2",
    overflow: "hidden",
  },
  activityRow: {
    minHeight: 68,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8e4",
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  activityIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#d8f2df",
    alignItems: "center",
    justifyContent: "center",
  },
  activityBody: {
    flex: 1,
  },
  activityText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  activityTime: {
    marginTop: 2,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
  },
});