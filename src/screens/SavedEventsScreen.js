import { Ionicons } from "@expo/vector-icons";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function SavedEventsScreen({
  events,
  bookmarkedEventIds,
  onBack,
  onOpenEvent,
  onToggleBookmark,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const savedEvents = events.filter((event) => bookmarkedEventIds.includes(event.id));

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}> 
      <FlatList
        data={savedEvents}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Pressable style={styles.backBtn} onPress={onBack}>
              <Ionicons name="arrow-back" size={18} color="#166534" />
            </Pressable>
            <Text style={[styles.title, { color: colors.text }]}>Saved Events</Text>
            <View style={styles.backBtn} />
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
            <Ionicons name="bookmark-outline" size={24} color="#64748b" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No bookmarked events yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSubtle }]}>Open an event and tap the bookmark icon to save it here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}
            onPress={() => onOpenEvent(item.id)}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.metaText} numberOfLines={1}>
                {item.category} • {item.time}
              </Text>
            </View>
            <Pressable style={styles.iconWrap} onPress={() => onToggleBookmark(item.id)}>
              <Ionicons name="bookmark" size={16} color="#0b7a24" />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#e9ecea",
  },
  content: {
    paddingHorizontal: scale(14),
    paddingBottom: scale(20),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(12),
  },
  backBtn: {
    width: scale(28),
    height: scale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: ms(18),
    fontWeight: "900",
  },
  emptyCard: {
    marginTop: scale(12),
    borderRadius: scale(14),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(24),
    paddingHorizontal: scale(16),
    gap: scale(6),
  },
  emptyTitle: {
    fontSize: ms(14),
    fontWeight: "800",
  },
  emptyText: {
    textAlign: "center",
    fontSize: ms(12),
    lineHeight: ms(18),
  },
  card: {
    borderRadius: scale(14),
    borderWidth: 1,
    padding: scale(10),
    flexDirection: "row",
    gap: scale(10),
    marginBottom: scale(10),
    alignItems: "center",
  },
  image: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(10),
    backgroundColor: "#d1d5db",
  },
  cardBody: {
    flex: 1,
    gap: scale(4),
  },
  cardTitle: {
    fontSize: ms(14),
    fontWeight: "800",
  },
  metaText: {
    color: "#64748b",
    fontSize: ms(12),
    fontWeight: "600",
  },
  iconWrap: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dcfce7",
  },
});
