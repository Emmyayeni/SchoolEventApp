import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { FadeInImage } from "./FadeInImage";
import { useAppTheme } from "../theme/theme";
import { formatEventDate, formatEventTimeRange, parseEventDate } from "../utils/eventTime";
import { ms, scale } from "../utils/responsive";

export default function EventCard({ id, title, image, date, time, endTime, venue, category, onPress, bookmarked = false, onToggleBookmark, featured = false, compact = false, registrationStatus }) {
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors, isDark);
  const validDate = parseEventDate(date);
  const showImage = Boolean(image?.trim()) && !compact;
  return (
    <View style={styles.card}>
      <Pressable onPress={() => onPress?.(id)} style={({ pressed }) => [pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={[title, formatEventDate(date), time, venue, registrationStatus].filter(Boolean).join(", ")} accessibilityHint="Opens event details">
        <View style={[styles.imageWrap, featured && styles.featuredImage, !showImage && styles.compactHeader]}>
          {showImage && <FadeInImage source={{ uri: image }} style={StyleSheet.absoluteFillObject} />}
          <View style={[styles.dateBadge, !showImage && styles.inlineDate]}>
            <AppText style={[styles.month, !showImage && { color: colors.accent }]}>{validDate ? formatEventDate(date, { month: "short" }).toUpperCase() : "DATE"}</AppText>
            <AppText style={[styles.day, !showImage && { color: colors.text }]}>{validDate ? validDate.getUTCDate() : "TBC"}</AppText>
          </View>
          {featured && <View style={[styles.featuredBadge, !showImage && styles.inlineSpotlight]}><Ionicons name="sparkles" size={13} color="#fff" /><AppText style={styles.featuredText}>In the spotlight</AppText></View>}
        </View>
        <View style={styles.body}>
          {!!registrationStatus && <View style={styles.registration}><Ionicons name={registrationStatus === "Registered" ? "checkmark-circle" : "time-outline"} size={16} color={colors.accent} /><AppText style={styles.registrationText}>{registrationStatus}</AppText></View>}
          {!!category && <AppText style={styles.category}>{category}</AppText>}
          <AppText style={[styles.title, featured && styles.featuredTitle]} numberOfLines={2}>{title}</AppText>
          <View style={styles.metaRow}><Ionicons name="time-outline" size={17} color={colors.textMuted} /><AppText style={styles.meta}>{[formatEventDate(date, { weekday: "short", month: "short", day: "numeric" }), formatEventTimeRange({ time, endTime })].filter(Boolean).join(" · ")}</AppText></View>
          <View style={styles.metaRow}><Ionicons name="location-outline" size={17} color={colors.textMuted} /><AppText style={styles.meta} numberOfLines={2}>{venue || "Venue to be confirmed"}</AppText></View>
          {featured && <View style={styles.detailsRow}><AppText style={styles.details}>Explore this event</AppText><Ionicons name="arrow-forward" size={18} color={colors.accent} /></View>}
        </View>
      </Pressable>
      {onToggleBookmark && <Pressable onPress={() => onToggleBookmark(id)} style={({ pressed }) => [styles.bookmark, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`${bookmarked ? "Unsave" : "Save"} ${title}`} accessibilityState={{ selected: bookmarked }}>
        <Ionicons name={bookmarked ? "bookmark" : "bookmark-outline"} size={21} color={bookmarked ? "#0b7a24" : "#253c30"} />
      </Pressable>}
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  card: { backgroundColor: isDark ? colors.surface : "#fff", borderRadius: 22, borderWidth: 1, borderColor: isDark ? colors.borderSoft : "#e2e8e0", overflow: "hidden", marginBottom: 16 },
  pressed: { opacity: 0.82 },
  imageWrap: { height: scale(155), backgroundColor: colors.surfaceAlt },
  compactHeader: { height: "auto", minHeight: 82, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, paddingRight: 72 },
  inlineDate: { position: "relative", top: 0, left: 0, backgroundColor: colors.accentTint },
  inlineSpotlight: { position: "relative", bottom: 0, left: 0, flexShrink: 1 },
  registration: { flexDirection: "row", alignItems: "center", gap: 5 },
  registrationText: { color: colors.accent, fontSize: ms(12), fontWeight: "600" },
  featuredImage: { height: scale(190) },
  dateBadge: { position: "absolute", top: 14, left: 14, minWidth: 58, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 14, backgroundColor: "#fff", alignItems: "center" },
  month: { color: "#0b7a24", fontSize: ms(11), fontWeight: "700", letterSpacing: 1 },
  day: { color: "#203729", fontSize: ms(24), fontWeight: "700" },
  bookmark: { position: "absolute", top: 14, right: 14, width: 48, height: 48, borderRadius: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  featuredBadge: { position: "absolute", bottom: 14, left: 14, backgroundColor: "#174b33", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 6 },
  featuredText: { color: "#fff", fontSize: ms(12), fontWeight: "600" },
  body: { padding: 18, gap: 9 },
  category: { color: colors.accent, fontSize: ms(12), fontWeight: "600" },
  title: { fontSize: ms(20), lineHeight: ms(27), fontWeight: "600", color: colors.text },
  featuredTitle: { fontSize: ms(23), lineHeight: ms(29) },
  metaRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  meta: { flex: 1, color: colors.textMuted, fontSize: ms(13), lineHeight: ms(20) },
  detailsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderColor: colors.borderSoft, paddingTop: 13, marginTop: 4 },
  details: { color: colors.accent, fontSize: ms(14), fontWeight: "600" },
});
