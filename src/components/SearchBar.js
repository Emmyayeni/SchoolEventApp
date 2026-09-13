import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { AppTextInput } from "./AppTextInput";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function SearchBar({ value, onChangeText, placeholder = "Search events...", accessibilityLabel }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.wrapper}>
      <Ionicons name="search" size={18} color={colors.textSubtle} />
      <AppTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        style={styles.input}
        accessibilityLabel={accessibilityLabel || placeholder}
        returnKeyType="search"
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
        </Pressable>
      ) : null}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    wrapper: {
      height: scale(48),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: scale(12),
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: colors.surface,
      gap: scale(8),
    },
    input: {
      flex: 1,
      fontSize: ms(15),
      color: colors.text,
    },
  });
