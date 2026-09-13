import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "../components/EmptyState";
import { FadeInImage } from "../components/FadeInImage";
import { ScalePressable } from "../components/ScalePressable";
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
            <Pressable
              style={styles.backBtn}
              onPress={onBack}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={18} color={colors.accent} />
            </Pressable>
            <AppText style={[styles.title, { color: colors.text }]}>Saved Events</AppText>
            <View style={styles.backBtn} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No bookmarked events yet"
            description="Open an event and tap the bookmark icon to save it here."
            icon="bookmark-outline"
          />
        }
        renderItem={({ item }) => (
          <ScalePressable
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}
            onPress={() => onOpenEvent(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.title}
            accessibilityHint="Opens event details"
          >
            <FadeInImage source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardBody}>
              <AppText style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </AppText>
              <AppText style={[styles.metaText, { color: colors.textSubtle }]} numberOfLines={1}>
                {item.category} • {item.time}
              </AppText>
            </View>
            <Pressable
              style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}
              onPress={() => onToggleBookmark(item.id)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Remove bookmark"
            >
              <Ionicons name="bookmark" size={16} color={colors.primary} />
            </Pressable>
          </ScalePressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
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
    backgroundColor: "transparent",
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
    fontSize: ms(12),
    fontWeight: "600",
  },
  iconWrap: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
