import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function NotificationsScreen({ notifications, onPressItem, onMarkAllRead, onBack }) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const sections = {
    today: notifications.filter((item, index) => index < 2),
    yesterday: notifications.filter((item, index) => index >= 2 && index < 4),
    earlier: notifications.filter((item, index) => index >= 4),
  };

  const fallbackEarlier = [
    {
      id: "fallback-1",
      title: "NOTICE",
      message: "The Inter-Faculty Marathon has been postponed until further notice.",
      time: "2 days ago",
      tone: "red",
    },
    {
      id: "fallback-2",
      title: "GENERAL UPDATE",
      message: "Monthly campus maintenance scheduled for this weekend.",
      time: "4 days ago",
      tone: "green",
    },
  ];

  const todayItems = sections.today.length > 0 ? sections.today : notifications.slice(0, 2);
  const yesterdayItems = sections.yesterday.length > 0 ? sections.yesterday : notifications.slice(2, 4);
  const earlierItems = sections.earlier.length > 0 ? sections.earlier : fallbackEarlier;

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={18} color="#166534" />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <Pressable onPress={onMarkAllRead}>
          <Text style={styles.markRead}>Mark all as read</Text>
        </Pressable>
      </View>

      <Section title="TODAY" items={todayItems} onPressItem={onPressItem} colors={colors} isDark={isDark} />
      <Section title="YESTERDAY" items={yesterdayItems} onPressItem={onPressItem} colors={colors} isDark={isDark} />
      <Section title="EARLIER" items={earlierItems} onPressItem={onPressItem} colors={colors} isDark={isDark} />
    </ScrollView>
  );
}

function Section({ title, items, onPressItem, colors, isDark }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <Pressable key={String(item.id)} style={[styles.row, { borderBottomColor: colors.borderSoft }]} onPress={() => onPressItem?.(item)}>
          <View style={[styles.iconWrap, getToneWrap(item)]}>
            <Ionicons name={getIcon(item)} size={16} color={getToneColor(item)} />
          </View>
          <View style={styles.rowBody}>
            <View style={styles.rowTop}>
              <Text style={[styles.itemTitle, { color: getToneColor(item) }]}>{item.title}</Text>
              <Text style={styles.itemTime}>{item.time}</Text>
            </View>
            <Text style={[styles.itemMessage, { color: isDark ? colors.textMuted : "#1f2937" }]}>{item.message}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function getIcon(item) {
  const title = (item.title || "").toLowerCase();
  if (title.includes("notice")) {
    return "alert-circle";
  }
  if (title.includes("reminder")) {
    return "notifications";
  }
  if (title.includes("update")) {
    return "folder-open";
  }
  if (title.includes("new")) {
    return "calendar";
  }
  return "information-circle";
}

function getToneColor(item) {
  const title = (item.title || "").toLowerCase();
  const tone = item.tone || "";
  if (tone === "red" || title.includes("notice")) {
    return "#ef4444";
  }
  return "#166534";
}

function getToneWrap(item) {
  const title = (item.title || "").toLowerCase();
  const tone = item.tone || "";
  if (tone === "red" || title.includes("notice")) {
    return { backgroundColor: "#fee2e2" };
  }
  return { backgroundColor: "#dceadd" };
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#e9ecea",
  },
  content: {
    paddingHorizontal: scale(14),
    paddingTop: scale(12),
    paddingBottom: scale(20),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(10),
  },
  backBtn: {
    width: scale(26),
    height: scale(26),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#1f2937",
    fontSize: ms(22),
    fontWeight: "900",
  },
  markRead: {
    color: "#166534",
    fontSize: ms(12),
    fontWeight: "800",
  },
  sectionWrap: {
    marginTop: scale(8),
  },
  sectionTitle: {
    color: "#64748b",
    fontSize: ms(13),
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: scale(6),
  },
  row: {
    flexDirection: "row",
    gap: scale(10),
    paddingVertical: scale(10),
  },
  iconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(2),
  },
  rowBody: {
    flex: 1,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: scale(8),
  },
  itemTitle: {
    fontSize: ms(12),
    fontWeight: "900",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  itemTime: {
    color: "#64748b",
    fontSize: ms(10),
    fontWeight: "700",
  },
  itemMessage: {
    marginTop: scale(2),
    color: "#1f2937",
    fontSize: ms(13),
    fontWeight: "600",
    lineHeight: ms(19),
  },
});