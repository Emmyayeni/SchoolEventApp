import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { useAppTheme } from "../theme/theme";
import { scale } from "../utils/responsive";

// Uppercase section label + optional right-aligned action ("See all").
export function SectionHeader({ label, actionLabel, onAction, style }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.row, style]}>
      <AppText variant="label" style={{ color: colors.textSubtle }}>
        {label}
      </AppText>
      {actionLabel ? (
        <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={8}>
          <AppText variant="caption" style={{ color: colors.accent, fontWeight: "600" }}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(12),
  },
});
