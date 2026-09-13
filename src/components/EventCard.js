import { Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

// Canonical event card (Home feed + lists). Modern Minimal: hairline border,
// no shadow, category pill over the image, compact icon meta rows. The whole
// card is the tap target (the old redundant "View Details" button is gone).
export default function EventCard({
  id,
  title,
  image,
  date,
  time,
  venue,
  category,
  description,
  onPress,
}) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
  const a11yLabel = [title, category, date, venue].filter(Boolean).join(", ");

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint="Opens event details"
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        {!!category && (
          <View style={styles.categoryChip}>
            <AppText style={styles.categoryText}>{category}</AppText>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <AppText variant="h3" numberOfLines={2} style={{ color: colors.text }}>
          {title}
        </AppText>
        {!!description && (
          <AppText variant="caption" numberOfLines={2} style={{ color: colors.textSubtle }}>
            {description}
          </AppText>
        )}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSubtle} />
          <AppText style={styles.meta} numberOfLines={1}>
            {[date, time].filter(Boolean).join("  •  ")}
          </AppText>
        </View>
        {!!venue && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSubtle} />
            <AppText style={styles.meta} numberOfLines={1}>
              {venue}
            </AppText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    card: {
      borderRadius: scale(16),
      backgroundColor: colors.surface,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: scale(14),
    },
    imageWrap: {
      width: "100%",
      height: scale(150),
      backgroundColor: colors.surfaceAlt,
      justifyContent: "center",
      alignItems: "center",
    },
    image: { width: "100%", height: "100%" },
    categoryChip: {
      position: "absolute",
      top: scale(10),
      left: scale(10),
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      borderRadius: 999,
    },
    categoryText: {
      fontSize: ms(11),
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    body: { padding: scale(14), gap: scale(6) },
    metaRow: { flexDirection: "row", alignItems: "center", gap: scale(6) },
    meta: { flex: 1, fontSize: ms(13), color: colors.textMuted },
  });
