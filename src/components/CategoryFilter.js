import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useAppTheme } from "../theme/theme";

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
          >
            <Ionicons
              name={iconName}
              size={12}
              color={active ? colors.primaryContrast : colors.accent}
            />
            <Text style={[styles.itemText, active && styles.itemTextActive]}>{category}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 2,
  },
  item: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  itemText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
  },
  itemTextActive: {
    color: colors.primaryContrast,
  },
  });
