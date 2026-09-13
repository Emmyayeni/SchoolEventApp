import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { AppText } from "./AppText";
import { useAppTheme } from "../theme/theme";
import { scale } from "../utils/responsive";

// Filter/category pill. Selected uses the accent tint + accent border/text;
// unselected is a surface pill with a hairline border. Announces selected state.
export function Chip({ label, icon, selected = false, onPress, style }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.accentTint : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
        },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? colors.accent : colors.textMuted}
          style={{ marginRight: scale(6) }}
        />
      ) : null}
      <AppText variant="caption" style={{ color: selected ? colors.accent : colors.textMuted, fontWeight: "600" }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: scale(8),
    paddingHorizontal: scale(14),
    borderRadius: 999,
    borderWidth: 1,
  },
});
