import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useAppTheme } from "../theme/theme";

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {categories.map((category) => {
        const active = selectedCategory === category;
        return (
          <Pressable
            key={category}
            onPress={() => onSelectCategory(category)}
            style={[styles.item, active && styles.itemActive]}
          >
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
