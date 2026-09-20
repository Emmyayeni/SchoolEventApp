import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { useAppTheme } from "../theme/theme";
import { scale } from "../utils/responsive";

// Round icon button with a11y baked in. Reusable outside Header too (bell,
// bookmark, overlay actions on EventDetails, etc.).
export function IconButton({
  name,
  label,
  onPress,
  size = 22,
  color,
  background = "transparent",
  disabled = false,
  hitSlop = 10,
  style,
  children,
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: background,
        },
        pressed && !disabled && { opacity: 0.6 },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color || colors.text} />
      {children}
    </Pressable>
  );
}

// Minimal app bar: optional leading (back arrow or custom node), title/subtitle,
// and trailing actions `[{ icon, label, onPress, color, badge }]`. Hairline
// bottom border, no shadow (Modern Minimal).
export function Header({
  title,
  subtitle,
  onBack,
  backLabel = "Go back",
  leading,
  actions = [],
  align = "left",
  border = true,
  style,
}) {
  const { colors } = useAppTheme();

  const leadingNode =
    leading ||
    (onBack ? <IconButton name="chevron-back" label={backLabel} onPress={onBack} color={colors.text} /> : null);

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.background },
        border && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        style,
      ]}
    >
      <View style={styles.side}>{leadingNode}</View>
      <View style={[styles.titleWrap, align === "center" && styles.titleCenter]}>
        {title ? (
          <AppText variant="h3" numberOfLines={1} style={{ color: colors.text, textAlign: align }}>
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="caption" numberOfLines={1} style={{ color: colors.textSubtle, textAlign: align }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.side, styles.actions]}>
        {actions.map((a, i) => (
          <IconButton
            key={a.key || a.icon || i}
            name={a.icon}
            label={a.label}
            onPress={a.onPress}
            color={a.color || colors.text}
            disabled={a.disabled}
          >
            {a.badge}
          </IconButton>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: scale(58),
    paddingHorizontal: scale(10),
    flexDirection: "row",
    alignItems: "center",
  },
  side: {
    minWidth: scale(48),
    flexDirection: "row",
    alignItems: "center",
  },
  actions: {
    justifyContent: "flex-end",
    gap: scale(2),
  },
  titleWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: scale(4),
  },
  titleCenter: {
    alignItems: "center",
  },
});
