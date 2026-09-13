import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

// Back-compat aliases: old call sites use variant="solid"|"outline".
function normalizeVariant(variant) {
  if (variant === "solid") return "primary";
  if (variant === "outline") return "secondary";
  return variant;
}

const SIZES = {
  sm: { height: 38, fontSize: 14, paddingH: 14, icon: 16 },
  md: { height: 48, fontSize: 15, paddingH: 16, icon: 18 },
  lg: { height: 54, fontSize: 16, paddingH: 20, icon: 20 },
};

// App-wide button. Variants: primary (ink fill), secondary (surface + hairline
// border), ghost (text only), danger (error fill). Accessibility baked in.
export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  fullWidth = true,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) {
  const { colors } = useAppTheme();
  const v = normalizeVariant(variant);
  const sz = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  const contentColor =
    v === "primary"
      ? colors.primaryContrast
      : v === "danger"
      ? "#ffffff"
      : v === "ghost"
      ? colors.accent
      : colors.text; // secondary

  const bg =
    v === "primary"
      ? colors.primary
      : v === "danger"
      ? colors.error
      : v === "secondary"
      ? colors.surface
      : "transparent"; // ghost

  const borderColor = v === "secondary" ? colors.border : "transparent";
  const borderWidth = v === "secondary" ? 1 : 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        {
          height: scale(sz.height),
          paddingHorizontal: scale(sz.paddingH),
          borderRadius: scale(14),
          backgroundColor: bg,
          borderColor,
          borderWidth,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: fullWidth ? "stretch" : "flex-start",
          shadowColor: v === "primary" ? colors.primary : "transparent",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: v === "primary" ? 0.22 : 0,
          shadowRadius: 6,
          elevation: v === "primary" ? 2 : 0,
        },
        isDisabled && { opacity: 0.5 },
        pressed && !isDisabled && { opacity: 0.88, transform: [{ scale: 0.985 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} size="small" />
      ) : (
        <View style={styles.row}>
          {leftIcon ? (
            <Ionicons name={leftIcon} size={sz.icon} color={contentColor} style={{ marginRight: scale(8) }} />
          ) : null}
          <AppText style={[{ fontSize: ms(sz.fontSize), fontWeight: "700", color: contentColor }, textStyle]}>
            {title}
          </AppText>
          {rightIcon ? (
            <Ionicons name={rightIcon} size={sz.icon} color={contentColor} style={{ marginLeft: scale(8) }} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
});
