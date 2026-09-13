import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { AppText } from "./AppText";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

function getCategoryIcon(category) {
  const value = String(category || "").trim().toLowerCase();

  if (value === "all" || value === "all events") {
    return "apps";
  }
  if (value === "academic" || value === "seminar") {
    return "school";
  }
  if (value === "workshop") {
    return "construct";
  }
  if (value === "social") {
    return "people";
  }
  if (value === "sports") {
    return "football";
  }
  if (value === "conference") {
    return "library";
  }
  if (value === "career") {
    return "briefcase";
  }
  if (value === "cultural") {
    return "color-palette";
  }
  if (value === "health") {
    return "heart";
  }
  if (value === "technology") {
    return "hardware-chip";
  }
  if (value === "community") {
    return "people-circle";
  }
  if (value === "orientation") {
    return "compass";
  }

  return "pricetag";
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {categories.map((category) => {
        const active = selectedCategory === category;
        const iconName = getCategoryIcon(category);
        return (
          <Pressable
            key={category}
            onPress={() => onSelectCategory(category)}
            style={[styles.item, active && styles.itemActive]}
            accessibilityRole="button"
            accessibilityLabel={category}
            accessibilityState={{ selected: active }}
          >
            <Ionicons name={iconName} size={14} color={active ? colors.accent : colors.textMuted} />
            <AppText style={[styles.itemText, active && styles.itemTextActive]}>{category}</AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    row: {
      gap: scale(8),
      paddingVertical: scale(2),
    },
    item: {
      borderRadius: 999,
      paddingVertical: scale(8),
      paddingHorizontal: scale(14),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    itemActive: {
      backgroundColor: colors.accentTint,
      borderColor: colors.accent,
    },
    itemText: {
      fontSize: ms(13),
      color: colors.textMuted,
      fontWeight: "600",
    },
    itemTextActive: {
      color: colors.accent,
    },
  });
