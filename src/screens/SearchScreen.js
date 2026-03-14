import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function SearchScreen({ value, results, onChange, onOpenEvent }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [viewMode, setViewMode] = useState("list");

  const categories = ["All Events", "Academic", "Social", "Sports"];

  const filtered = useMemo(() => {
    if (activeCategory === "All Events") {
      return results;
    }

    if (activeCategory === "Academic") {
      return results.filter((item) => ["Seminar", "Workshop", "Conference"].includes(item.category));
    }

    if (activeCategory === "Social") {
      return results.filter((item) => item.category === "Social");
    }

    if (activeCategory === "Sports") {
      return results.filter((item) => item.category === "Sports");
    }

    return results;
  }, [activeCategory, results]);

  return (
    <FlatList
      data={filtered}
      key={viewMode}
      numColumns={viewMode === "grid" ? 2 : 1}
      keyExtractor={(item) => String(item.id)}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
      contentContainerStyle={[styles.contentContainer, { paddingTop: (insets?.top ?? 0) + scale(8), backgroundColor: colors.background }]}
      renderItem={({ item, index }) => (
        <ExploreCard
          event={item}
          index={index}
          viewMode={viewMode}
          colors={colors}
          onPress={() => onOpenEvent(item.id)}
        />
      )}
      ListHeaderComponent={
        <View style={styles.headerWrap}>
          <View style={styles.topRow}>
            <View style={styles.brandRow}>
              <Ionicons name="school" size={14} color="#166534" />
              <Text style={styles.brandText}>NSUK Events</Text>
            </View>
            <Pressable style={styles.actionBtn}>
              <Ionicons name="options-outline" size={14} color="#166534" />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Ionicons name="search" size={15} color="#91a39a" />
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Search events, workshops..."
                placeholderTextColor="#93a49b"
                style={styles.searchInput}
              />
            </View>
            <Pressable style={styles.filterBtn}>
              <Ionicons name="funnel" size={15} color="#ffffff" />
            </Pressable>
          </View>

          <View style={styles.metaFilterRow}>
            <Pressable style={styles.metaFilterChip}>
              <Ionicons name="calendar-outline" size={11} color="#6b7280" />
              <Text style={styles.metaFilterText}>Any Date</Text>
              <Ionicons name="chevron-down" size={11} color="#6b7280" />
            </Pressable>
            <Pressable style={styles.metaFilterChip}>
              <Ionicons name="location-outline" size={11} color="#6b7280" />
              <Text style={styles.metaFilterText}>Any Venue</Text>
              <Ionicons name="chevron-down" size={11} color="#6b7280" />
            </Pressable>
          </View>

          <View style={styles.switchRow}>
            <Pressable onPress={() => setViewMode("list")} style={styles.switchItem}>
              <Text style={[styles.switchText, viewMode === "list" && styles.switchTextActive]}>List View</Text>
            </Pressable>
            <Pressable onPress={() => setViewMode("grid")} style={styles.switchItem}>
              <Text style={[styles.switchText, viewMode === "grid" && styles.switchTextActive]}>Grid View</Text>
            </Pressable>
          </View>

          <FlatList
            data={categories}
            horizontal
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
            renderItem={({ item }) => {
              const active = activeCategory === item;
              return (
                <Pressable
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setActiveCategory(item)}
                >
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{item}</Text>
                </Pressable>
              );
            }}
          />
        </View>
      }
    />
  );
}

function ExploreCard({ event, index, viewMode, onPress, colors }) {
  const status = getStatus(index);
  const disabled = status.label === "CLOSED";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.borderSoft },
        viewMode === "grid" && styles.cardGrid,
        disabled && styles.cardDisabled,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: event.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.badgeOverlay}>
          <Text style={[styles.badgeTag, status.type === "closed" && styles.badgeGray]}>{status.label}</Text>
          <Text style={styles.badgeTagSecondary}>{toCategoryLabel(event.category)}</Text>
        </View>
        {index === 1 && (
          <View style={styles.bookmarkBadge}>
            <Ionicons name="bookmark" size={12} color="#ffffff" />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.eventTitle, { color: colors.text }, disabled && styles.textMuted]} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.metaLine}>
          <Ionicons name="calendar-outline" size={11} color="#7c8d84" />
          <Text style={styles.metaText}>{formatDate(event.date)}</Text>
          <Ionicons name="time-outline" size={11} color="#7c8d84" style={styles.timeIcon} />
          <Text style={styles.metaText}>{event.time}</Text>
        </View>

        <View style={styles.metaLine}>
          <Ionicons name="location-outline" size={11} color="#7c8d84" />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.venue}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.attendingText}>{getAttending(index)}</Text>
          <Pressable disabled={disabled} style={[styles.actionButton, disabled && styles.actionButtonDisabled]}>
            <Text style={[styles.actionButtonText, disabled && styles.actionButtonTextDisabled]}>
              {disabled ? "View Results" : index === 0 ? "RSVP Now" : "Register"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function getStatus(index) {
  if (index === 0) {
    return { label: "ONGOING", type: "ongoing" };
  }
  if (index === 1) {
    return { label: "UPCOMING", type: "upcoming" };
  }
  return { label: "CLOSED", type: "closed" };
}

function getAttending(index) {
  if (index === 0) {
    return "20k+";
  }
  if (index === 1) {
    return "250+ attending";
  }
  return "Registration ended";
}

function toCategoryLabel(category) {
  if (!category) {
    return "ACADEMIC";
  }
  return category.toUpperCase();
}

function formatDate(dateText) {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) {
    return dateText;
  }
  const month = parsed.toLocaleString("en-US", { month: "short" });
  return `${month} ${parsed.getDate()}`;
}

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: "#e9ecea",
    paddingHorizontal: scale(14),
    paddingTop: scale(8),
    paddingBottom: scale(22),
  },
  headerWrap: {
    gap: scale(10),
    marginBottom: scale(8),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  brandText: {
    color: "#166534",
    fontSize: ms(18),
    fontWeight: "800",
  },
  actionBtn: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: "#dce8df",
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  searchBox: {
    flex: 1,
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: "#e4ebe6",
    borderWidth: 1,
    borderColor: "#d3ddd6",
    paddingHorizontal: scale(12),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  searchInput: {
    flex: 1,
    color: "#1f2937",
    fontSize: ms(13),
    fontWeight: "500",
    paddingVertical: 0,
  },
  filterBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: "#007a08",
    alignItems: "center",
    justifyContent: "center",
  },
  metaFilterRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  metaFilterChip: {
    flex: 1,
    minHeight: scale(30),
    borderRadius: scale(15),
    backgroundColor: "#f1f4f2",
    borderWidth: 1,
    borderColor: "#d8dfdb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(4),
  },
  metaFilterText: {
    color: "#6b7280",
    fontSize: ms(11),
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: scale(22),
    paddingTop: scale(2),
  },
  switchItem: {
    paddingVertical: scale(4),
  },
  switchText: {
    fontSize: ms(13),
    fontWeight: "700",
    color: "#8ea09a",
  },
  switchTextActive: {
    color: "#166534",
    textDecorationLine: "underline",
  },
  categoryRow: {
    gap: scale(6),
    paddingTop: scale(2),
  },
  categoryChip: {
    borderRadius: 999,
    backgroundColor: "#d8e3da",
    paddingHorizontal: scale(14),
    paddingVertical: scale(6),
  },
  categoryChipActive: {
    backgroundColor: "#007a08",
  },
  categoryChipText: {
    color: "#45664f",
    fontSize: ms(11),
    fontWeight: "800",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  gridRow: {
    justifyContent: "space-between",
  },
  card: {
    borderRadius: scale(14),
    backgroundColor: "#f2f5f3",
    borderWidth: 1,
    borderColor: "#dbe2de",
    overflow: "hidden",
    marginBottom: scale(10),
  },
  cardGrid: {
    width: "48.5%",
  },
  cardDisabled: {
    opacity: 0.72,
  },
  imageWrap: {
    width: "100%",
    height: scale(110),
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badgeOverlay: {
    position: "absolute",
    left: scale(8),
    top: scale(8),
    flexDirection: "row",
    gap: scale(4),
  },
  badgeTag: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
    fontSize: ms(9),
    fontWeight: "900",
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: 999,
    letterSpacing: 0.4,
  },
  badgeTagSecondary: {
    backgroundColor: "#ecfdf3",
    color: "#1f2937",
    fontSize: ms(9),
    fontWeight: "900",
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: 999,
    letterSpacing: 0.3,
  },
  badgeGray: {
    backgroundColor: "#6b7280",
  },
  bookmarkBadge: {
    position: "absolute",
    right: scale(8),
    top: scale(8),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: "rgba(17, 24, 39, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    paddingHorizontal: scale(10),
    paddingTop: scale(8),
    paddingBottom: scale(10),
    gap: scale(5),
  },
  eventTitle: {
    color: "#111827",
    fontSize: ms(13),
    fontWeight: "800",
    lineHeight: ms(18),
  },
  textMuted: {
    color: "#6b7280",
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(4),
  },
  timeIcon: {
    marginLeft: scale(6),
  },
  metaText: {
    color: "#64748b",
    fontSize: ms(11),
    fontWeight: "600",
    flexShrink: 1,
  },
  bottomRow: {
    marginTop: scale(6),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendingText: {
    color: "#94a3b8",
    fontSize: ms(10),
    fontWeight: "700",
  },
  actionButton: {
    minHeight: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#007a08",
    paddingHorizontal: scale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: ms(11),
    fontWeight: "800",
  },
  actionButtonTextDisabled: {
    color: "#9ca3af",
  },
});
