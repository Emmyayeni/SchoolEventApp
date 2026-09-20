import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../components/AppText";
import { AppTextInput } from "../components/AppTextInput";
import EventCard from "../components/EventCard";
import { useAppTheme } from "../theme/theme";
import { campusDateKey, eventTimeStatus } from "../utils/eventTime";
import { ms } from "../utils/responsive";
import { useCurrentTime } from "../utils/useCurrentTime";

const DATE_FILTERS = ["Upcoming", "Today", "This week", "Any date"];

export default function SearchScreen({ value = "", results = [], bookmarkedEventIds = [], onChange, onOpenEvent, onToggleBookmark }) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const now = useCurrentTime();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const [category, setCategory] = useState("All categories");
  const [dateFilter, setDateFilter] = useState("Upcoming");
  const [venue, setVenue] = useState("All venues");
  const [showFilters, setShowFilters] = useState(false);

  const visibleEvents = useMemo(() => results.filter(event => !event.status || event.status === "published"), [results]);
  const categories = useMemo(() => ["All categories", ...new Set(visibleEvents.map(event => event.category?.trim()).filter(Boolean))], [visibleEvents]);
  const venues = useMemo(() => ["All venues", ...new Set(visibleEvents.map(event => event.venue?.trim()).filter(Boolean))], [visibleEvents]);
  const filtered = useMemo(() => {
    const today = campusDateKey(now);
    const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
    const weekEnd = campusDateKey(now, (7 - weekday) % 7);
    return visibleEvents.filter(event => {
      if (category !== "All categories" && event.category !== category) return false;
      if (venue !== "All venues" && event.venue !== venue) return false;
      if (dateFilter === "Today" && event.date !== today) return false;
      if (dateFilter === "This week" && !(event.date >= today && event.date <= weekEnd)) return false;
      if (dateFilter === "Upcoming" && !["upcoming", "ongoing"].includes(eventTimeStatus(event, now))) return false;
      return true;
    });
  }, [category, dateFilter, now, venue, visibleEvents]);
  const activeFilters = [dateFilter !== "Any date" && dateFilter, category !== "All categories" && category, venue !== "All venues" && venue].filter(Boolean);
  const clearFilters = () => { setDateFilter("Upcoming"); setCategory("All categories"); setVenue("All venues"); };

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <EventCard {...item} onPress={onOpenEvent} bookmarked={bookmarkedEventIds.includes(item.id)} onToggleBookmark={onToggleBookmark} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View>
          <View style={styles.headingRow}><View><AppText style={styles.eyebrow}>DISCOVER CAMPUS</AppText><AppText style={styles.title}>Explore events</AppText></View><View style={styles.resultBadge}><AppText style={styles.resultCount}>{filtered.length}</AppText></View></View>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}><Ionicons name="search-outline" size={22} color={colors.textMuted} /><AppTextInput value={value} onChangeText={onChange} placeholder="Search events and venues" placeholderTextColor={colors.textSubtle} style={styles.searchInput} />{!!value && <Pressable style={styles.smallButton} onPress={() => onChange?.("")} accessibilityRole="button" accessibilityLabel="Clear search"><Ionicons name="close" size={20} color={colors.textMuted} /></Pressable>}</View>
            <Pressable style={styles.filterButton} onPress={() => setShowFilters(true)} accessibilityRole="button" accessibilityLabel="Open event filters"><Ionicons name="options-outline" size={22} color="#fff" />{activeFilters.length > 1 && <View style={styles.filterCount}><AppText style={styles.filterCountText}>{activeFilters.length}</AppText></View>}</Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {activeFilters.map(item => <Pressable key={item} style={styles.activeChip} onPress={() => item === dateFilter ? setDateFilter("Any date") : item === category ? setCategory("All categories") : setVenue("All venues")} accessibilityRole="button" accessibilityLabel={`Remove ${item} filter`}><AppText style={styles.activeChipText}>{item}</AppText><Ionicons name="close" size={15} color={colors.accent} /></Pressable>)}
            {activeFilters.length === 0 && <AppText style={styles.helper}>Showing all available events</AppText>}
          </ScrollView>
          <View style={styles.listHeading}><AppText style={styles.sectionTitle}>{value ? `Results for “${value}”` : "Events for you"}</AppText>{activeFilters.length > 0 && <Pressable style={styles.clearButton} onPress={clearFilters} accessibilityRole="button"><AppText style={styles.clearText}>Reset</AppText></Pressable>}</View>
        </View>}
        ListEmptyComponent={<View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="search-outline" size={32} color={colors.accent} /></View><AppText style={styles.sectionTitle}>No matching events</AppText><AppText style={styles.emptyText}>Try a different search or remove one of your filters.</AppText><Pressable style={styles.resetButton} onPress={() => { onChange?.(""); clearFilters(); }} accessibilityRole="button"><AppText style={styles.resetText}>Clear search and filters</AppText></Pressable></View>}
      />
      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={styles.overlay}><Pressable style={StyleSheet.absoluteFillObject} onPress={() => setShowFilters(false)} /><View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]} accessibilityViewIsModal>
          <View style={styles.handle} /><View style={styles.sheetHeader}><View><AppText style={styles.sheetTitle}>Filter events</AppText><AppText style={styles.helper}>Choose what you want to see</AppText></View><Pressable style={styles.closeButton} onPress={() => setShowFilters(false)} accessibilityRole="button" accessibilityLabel="Close filters"><Ionicons name="close" size={24} color={colors.text} /></Pressable></View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <FilterGroup title="Date" options={DATE_FILTERS} value={dateFilter} onChange={setDateFilter} colors={colors} styles={styles} />
            <FilterGroup title="Category" options={categories} value={category} onChange={setCategory} colors={colors} styles={styles} />
            <FilterGroup title="Venue" options={venues} value={venue} onChange={setVenue} colors={colors} styles={styles} />
          </ScrollView>
          <View style={styles.sheetActions}><Pressable style={styles.secondaryButton} onPress={clearFilters} accessibilityRole="button"><AppText style={styles.secondaryText}>Reset</AppText></Pressable><Pressable style={styles.applyButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); setShowFilters(false); }} accessibilityRole="button"><AppText style={styles.applyText}>Show {filtered.length} events</AppText></Pressable></View>
        </View></View>
      </Modal>
    </View>
  );
}

function FilterGroup({ title, options, value, onChange, colors, styles }) {
  return <View style={styles.group}><AppText style={styles.groupTitle}>{title}</AppText>{options.map(option => <Pressable key={option} style={styles.option} onPress={() => onChange(option)} accessibilityRole="radio" accessibilityState={{ checked: value === option }}><AppText style={styles.optionText} numberOfLines={2}>{option}</AppText><Ionicons name={value === option ? "radio-button-on" : "radio-button-off"} size={22} color={value === option ? colors.accent : colors.textSubtle} /></Pressable>)}</View>;
}

const getStyles = (colors, isDark) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 28 },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  eyebrow: { color: colors.accent, fontSize: ms(10), fontWeight: "700", letterSpacing: 1.5, marginBottom: 7 },
  title: { color: colors.text, fontSize: ms(29), lineHeight: ms(36), fontWeight: "600" },
  resultBadge: { minWidth: 42, height: 42, paddingHorizontal: 10, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint },
  resultCount: { color: colors.accent, fontSize: ms(15), fontWeight: "700" },
  searchRow: { flexDirection: "row", gap: 10 },
  searchBox: { flex: 1, minHeight: 56, borderRadius: 17, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft },
  searchInput: { flex: 1, color: colors.text, fontSize: ms(14), paddingVertical: 0 },
  smallButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  filterButton: { width: 56, height: 56, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#174b33" },
  filterCount: { position: "absolute", top: -5, right: -5, minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.error },
  filterCountText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  chips: { minHeight: 66, alignItems: "center", gap: 8, paddingVertical: 12 },
  activeChip: { flexDirection: "row", alignItems: "center", gap: 7, minHeight: 40, paddingHorizontal: 13, borderRadius: 20, backgroundColor: colors.accentTint },
  activeChipText: { color: colors.accent, fontSize: ms(12), fontWeight: "600", maxWidth: 160 },
  helper: { color: colors.textMuted, fontSize: ms(13), lineHeight: ms(19) },
  listHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionTitle: { color: colors.text, fontSize: ms(19), lineHeight: ms(25), fontWeight: "600", flexShrink: 1 },
  clearButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
  clearText: { color: colors.accent, fontSize: ms(13), fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 54, gap: 13 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.textMuted, textAlign: "center", fontSize: ms(14), lineHeight: ms(21), maxWidth: 280 },
  resetButton: { minHeight: 48, paddingHorizontal: 18, borderRadius: 14, justifyContent: "center", backgroundColor: "#174b33" },
  resetText: { color: "#fff", fontSize: ms(14), fontWeight: "600" },
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { maxHeight: "88%", backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, alignSelf: "center", marginTop: 10 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 17 },
  sheetTitle: { color: colors.text, fontSize: ms(22), fontWeight: "600", marginBottom: 3 },
  closeButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  group: { borderTopWidth: 1, borderColor: colors.borderSoft, paddingVertical: 15 },
  groupTitle: { color: colors.text, fontSize: ms(15), fontWeight: "600", marginBottom: 6 },
  option: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 },
  optionText: { flex: 1, color: colors.textMuted, fontSize: ms(14) },
  sheetActions: { flexDirection: "row", gap: 10, paddingTop: 14 },
  secondaryButton: { minHeight: 52, paddingHorizontal: 22, borderRadius: 15, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderSoft },
  secondaryText: { color: colors.text, fontSize: ms(14), fontWeight: "600" },
  applyButton: { flex: 1, minHeight: 52, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#174b33", paddingHorizontal: 14 },
  applyText: { color: "#fff", fontSize: ms(14), fontWeight: "600" },
});
