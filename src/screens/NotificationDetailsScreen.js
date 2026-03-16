import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function NotificationDetailsScreen() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const notification = route.params?.notification;

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.accent} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Notification Details</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}>
        <Text style={styles.type}>{notification?.title || "NOTICE"}</Text>
        <Text style={[styles.message, { color: colors.text }]}>{notification?.message || "No notification details available."}</Text>
        <Text style={styles.time}>{notification?.time || ""}</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: scale(14),
      paddingTop: scale(12),
      paddingBottom: scale(24),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(12),
    },
    backBtn: {
      width: scale(28),
      height: scale(28),
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      color: colors.text,
      fontSize: ms(16),
      fontWeight: "800",
    },
    card: {
      borderRadius: scale(14),
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surface,
      padding: scale(14),
    },
    type: {
      color: colors.accent,
      fontSize: ms(12),
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: scale(6),
    },
    message: {
      color: colors.text,
      fontSize: ms(14),
      fontWeight: "700",
      lineHeight: ms(20),
    },
    time: {
      marginTop: scale(10),
      color: colors.textSubtle,
      fontSize: ms(11),
      fontWeight: "700",
    },
  });