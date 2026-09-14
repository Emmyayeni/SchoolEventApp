import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { AppTextInput } from "./AppTextInput";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

// One labeled input: label + AppTextInput + optional left icon / right node +
// error text. Focus lifts the border to the accent color; error turns it red.
// accessibilityLabel falls back to the label (or placeholder).
export function Field({
  label,
  error,
  leftIcon,
  rightNode,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...inputProps
}) {
  const { colors } = useAppTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.error : focused ? colors.accent : colors.border;

  return (
    <View style={[{ marginBottom: scale(16) }, containerStyle]}>
      {label ? (
        <AppText variant="label" style={{ color: colors.textMuted, marginBottom: scale(8) }}>
          {label}
        </AppText>
      ) : null}
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor }]}>
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={colors.textSubtle} style={{ marginRight: scale(8) }} />
        ) : null}
        <AppTextInput
          accessibilityLabel={label || inputProps.placeholder}
          placeholderTextColor={colors.textSubtle}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[{ flex: 1, fontSize: ms(15), color: colors.text, paddingVertical: 0 }, inputStyle]}
          {...inputProps}
        />
        {rightNode}
      </View>
      {error ? (
        <AppText variant="caption" style={{ color: colors.error, marginTop: scale(6) }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

export function SelectField({
  label,
  value,
  placeholder = "Select an option",
  leftIcon,
  error,
  onPress,
  containerStyle,
  disabled = false,
}) {
  const { colors } = useAppTheme();
  const borderColor = error ? colors.error : colors.border;

  return (
    <View style={[{ marginBottom: scale(16) }, containerStyle]}>
      {label ? (
        <AppText variant="label" style={{ color: colors.textMuted, marginBottom: scale(8) }}>
          {label}
        </AppText>
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.inputRow, { backgroundColor: colors.surface, borderColor }]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={label || placeholder}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={colors.textSubtle} style={{ marginRight: scale(8) }} />
        ) : null}
        <AppText
          style={{
            flex: 1,
            fontSize: ms(15),
            color: value ? colors.text : colors.textSubtle,
            fontFamily: "Outfit_400Regular",
          }}
          numberOfLines={1}
        >
          {value || placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={colors.textSubtle} />
      </Pressable>
      {error ? (
        <AppText variant="caption" style={{ color: colors.error, marginTop: scale(6) }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    minHeight: scale(50),
    borderRadius: scale(12),
    borderWidth: 1,
    paddingHorizontal: scale(14),
    flexDirection: "row",
    alignItems: "center",
  },
});
