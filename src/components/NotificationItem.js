import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/theme";

export default function NotificationItem({ title, message, time, isRead, onPress }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <Pressable onPress={onPress} style={[styles.item, !isRead && styles.unread]}>
      <View style={styles.iconWrap}>
        <Ionicons name={isRead ? "notifications-outline" : "notifications"} size={18} color={colors.text} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </Pressable>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
  item: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  unread: {
    borderColor: colors.unreadBorder,
    backgroundColor: colors.unreadBg,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
  },
  message: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 6,
  },
  });
