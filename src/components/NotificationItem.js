import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function NotificationItem({ title, message, time, isRead, onPress }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, !isRead && styles.unread, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`${title}${isRead ? "" : ", unread"}. ${message}`}
      accessibilityHint="Opens notification"
    >
      <View style={styles.iconWrap}>
        <Ionicons name={isRead ? "notifications-outline" : "notifications"} size={18} color={colors.text} />
      </View>
      <View style={styles.body}>
        <AppText style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
        <AppText style={styles.message} numberOfLines={2}>
          {message}
        </AppText>
        <AppText style={styles.time}>{time}</AppText>
      </View>
      {!isRead ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    item: {
      flexDirection: "row",
      gap: scale(10),
      padding: scale(12),
      borderRadius: scale(14),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: scale(10),
      alignItems: "flex-start",
    },
    unread: {
      borderColor: colors.unreadBorder,
      backgroundColor: colors.unreadBg,
    },
    iconWrap: {
      width: scale(32),
      height: scale(32),
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    body: {
      flex: 1,
    },
    title: {
      fontSize: ms(14),
      color: colors.text,
      fontWeight: "700",
    },
    message: {
      fontSize: ms(13),
      color: colors.textMuted,
      marginTop: scale(2),
    },
    time: {
      fontSize: ms(12),
      color: colors.textSubtle,
      marginTop: scale(6),
    },
    dot: {
      width: scale(8),
      height: scale(8),
      borderRadius: 999,
      backgroundColor: colors.accent,
      marginTop: scale(6),
    },
  });
