import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

const DUMMY_ANNOUNCEMENT = {
  date: "27-02-26, 19:31",
  title: "Revised First Semester 2026/2027 Examination Timetable Released",
  office: "Office of the Registrar",
  bodyOne:
    "The University Management, through the Office of the Registrar, wishes to inform all students and faculty members that the First Semester 2026/2027 Academic Session Examination Timetable has been officially revised.",
  bodyTwo:
    "Following recent administrative adjustments and public holiday considerations, this examination timetable now includes to commence on Monday and now slated to begin on November 15th, 2026. Students are advised to take note of the new venues and shifted time slots for core departmental courses.",
  keyInstruction:
    "All students must present their physical University ID Card and examination clearance registration slip at the entrance of the examination hall. Photocopies or digital copies will not be accepted.",
  attachmentName: "Exam_Timetable_V2.pdf",
  attachmentMeta: "4.2 MB • PDF Document",
  image:
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
};

export default function AnnouncementDetailsScreen({ onBack }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Pressable style={styles.iconBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.screenTitle}>Announcement</Text>
        <Pressable
          style={styles.iconBtn}
          onPress={() => Alert.alert("Share", "Share feature will be connected next.")}
        >
          <Ionicons name="share-social-outline" size={18} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.dateChip}>
        <Text style={styles.dateChipText}>{DUMMY_ANNOUNCEMENT.date}</Text>
      </View>

      <Text style={styles.title}>{DUMMY_ANNOUNCEMENT.title}</Text>

      <View style={styles.officeRow}>
        <View style={styles.officeAvatar}>
          <Ionicons name="person" size={11} color={colors.primary} />
        </View>
        <Text style={styles.officeText}>{DUMMY_ANNOUNCEMENT.office}</Text>
      </View>

      <Image source={{ uri: DUMMY_ANNOUNCEMENT.image }} style={styles.heroImage} resizeMode="cover" />

      <Text style={styles.bodyText}>{DUMMY_ANNOUNCEMENT.bodyOne}</Text>
      <Text style={styles.bodyText}>{DUMMY_ANNOUNCEMENT.bodyTwo}</Text>

      <View style={styles.keyBox}>
        <View style={styles.keyHeader}>
          <View style={styles.keyDot}>
            <Ionicons name="alert" size={10} color={colors.primaryContrast} />
          </View>
          <Text style={styles.keyTitle}>Key Instruction</Text>
        </View>
        <Text style={styles.keyBody}>{DUMMY_ANNOUNCEMENT.keyInstruction}</Text>
      </View>

      <Text style={styles.attachLabel}>ATTACHMENTS</Text>
      <Pressable style={styles.attachmentRow} onPress={() => Alert.alert("Attachment", "Download will be connected next.")}>
        <View style={styles.attachmentIconWrap}>
          <Ionicons name="document-text-outline" size={16} color={colors.primary} />
        </View>
        <View style={styles.attachmentBody}>
          <Text style={styles.attachmentName}>{DUMMY_ANNOUNCEMENT.attachmentName}</Text>
          <Text style={styles.attachmentMeta}>{DUMMY_ANNOUNCEMENT.attachmentMeta}</Text>
        </View>
        <Ionicons name="download-outline" size={16} color={colors.textSubtle} />
      </Pressable>

      <Pressable
        style={styles.whatsappBtn}
        onPress={() => Alert.alert("Forward", "WhatsApp forwarding will be connected next.")}
      >
        <Ionicons name="logo-whatsapp" size={14} color={colors.primaryContrast} />
        <Text style={styles.whatsappText}>Forward to WhatsApp Group</Text>
      </Pressable>

      <Text style={styles.footerHint}>Was this information helpful?</Text>
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
      paddingBottom: scale(24),
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(10),
    },
    iconBtn: {
      width: scale(28),
      height: scale(28),
      alignItems: "center",
      justifyContent: "center",
    },
    screenTitle: {
      color: colors.text,
      fontSize: ms(14),
      fontWeight: "800",
    },
    dateChip: {
      alignSelf: "flex-start",
      borderRadius: 999,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: scale(9),
      paddingVertical: scale(4),
      marginBottom: scale(9),
    },
    dateChipText: {
      color: colors.textMuted,
      fontSize: ms(10),
      fontWeight: "700",
    },
    title: {
      color: colors.accent,
      fontSize: ms(22),
      lineHeight: ms(28),
      fontWeight: "900",
      marginBottom: scale(9),
    },
    officeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(7),
      marginBottom: scale(12),
    },
    officeAvatar: {
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    officeText: {
      color: colors.textMuted,
      fontSize: ms(12),
      fontWeight: "700",
    },
    heroImage: {
      width: "100%",
      height: scale(160),
      borderRadius: scale(10),
      marginBottom: scale(11),
    },
    bodyText: {
      color: colors.text,
      fontSize: ms(12),
      lineHeight: ms(19),
      fontWeight: "500",
      marginBottom: scale(9),
    },
    keyBox: {
      borderRadius: scale(10),
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.accent,
      padding: scale(11),
      marginTop: scale(3),
      marginBottom: scale(13),
    },
    keyHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(7),
      marginBottom: scale(6),
    },
    keyDot: {
      width: scale(15),
      height: scale(15),
      borderRadius: scale(7.5),
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    keyTitle: {
      color: colors.primaryContrast,
      fontSize: ms(12),
      fontWeight: "900",
    },
    keyBody: {
      color: colors.primaryContrast,
      fontSize: ms(11),
      lineHeight: ms(16),
      fontWeight: "600",
    },
    attachLabel: {
      color: colors.textSubtle,
      fontSize: ms(10),
      fontWeight: "800",
      letterSpacing: 0.8,
      marginBottom: scale(7),
    },
    attachmentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(9),
      borderRadius: scale(10),
      borderWidth: 1,
      borderColor: colors.borderSoft,
      backgroundColor: colors.surface,
      paddingHorizontal: scale(10),
      paddingVertical: scale(8),
      marginBottom: scale(14),
    },
    attachmentIconWrap: {
      width: scale(28),
      height: scale(28),
      borderRadius: scale(14),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    attachmentBody: {
      flex: 1,
    },
    attachmentName: {
      color: colors.text,
      fontSize: ms(12),
      fontWeight: "800",
    },
    attachmentMeta: {
      color: colors.textSubtle,
      fontSize: ms(10),
      fontWeight: "600",
      marginTop: scale(1),
    },
    whatsappBtn: {
      minHeight: scale(40),
      borderRadius: scale(10),
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(7),
    },
    whatsappText: {
      color: colors.primaryContrast,
      fontSize: ms(12),
      fontWeight: "800",
    },
    footerHint: {
      marginTop: scale(14),
      color: colors.textSubtle,
      textAlign: "center",
      fontSize: ms(10),
      fontWeight: "600",
    },
  });
