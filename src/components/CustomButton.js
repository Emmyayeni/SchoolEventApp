import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useAppTheme } from "../theme/theme";

export default function CustomButton({ title, onPress, loading, disabled, variant = "solid" }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
  const isDisabled = disabled || loading;
  const isOutline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        isOutline ? styles.outlineButton : styles.solidButton,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.text : colors.primaryContrast} size="small" />
      ) : (
        <Text style={[styles.text, isOutline ? styles.outlineText : styles.solidText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
  button: {
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  solidButton: {
    backgroundColor: colors.primary,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
  },
  solidText: {
    color: colors.primaryContrast,
  },
  outlineText: {
    color: colors.text,
  },
  disabled: {
    opacity: 0.7,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  });
