import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

const TARGET_AUDIENCE = ["All Students", "Faculty of Science", "Staff Only"];

export default function SendAnnouncementScreen({ onBack }) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark);

  const [selectedAudience, setSelectedAudience] = useState(["All Students", "Faculty of Science", "Staff Only"]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const toggleAudience = (item) => {
    setSelectedAudience((prev) => {
      if (prev.includes(item)) {
        if (prev.length === 1) {
          return prev;
        }
        return prev.filter((entry) => entry !== item);
      }
      return [...prev, item];
    });
  };

  const handleSend = () => {
    if (!subject.trim()) {
      Alert.alert("Required", "Please enter announcement title.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Required", "Please enter announcement details.");
      return;
    }

    Alert.alert("Announcement sent", "Your announcement has been sent to selected audience.");
    setSubject("");
    setMessage("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.accent} />
        </Pressable>
        <Text style={styles.headerTitle}>Send Announcement</Text>
        <View style={styles.backButton} />
      </View>

      <Text style={styles.sectionTitle}>TARGET AUDIENCE</Text>
      <View style={styles.audienceRow}>
        {TARGET_AUDIENCE.map((item) => {
          const active = selectedAudience.includes(item);
          return (
            <Pressable
              key={item}
              style={[styles.audienceChip, active && styles.audienceChipActive]}
              onPress={() => toggleAudience(item)}
            >
              <Text style={[styles.audienceText, active && styles.audienceTextActive]}>{item}</Text>
              <Ionicons
                name={active ? "close-circle" : "chevron-down"}
                size={13}
                color={active ? colors.primaryContrast : colors.textMuted}
              />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="Enter announcement title"
        placeholderTextColor={colors.textSubtle}
      />

      <Text style={styles.label}>Message Content</Text>
      <TextInput
        style={[styles.input, styles.messageInput]}
        value={message}
        onChangeText={setMessage}
        placeholder="Type your announcement details here..."
        placeholderTextColor={colors.textSubtle}
        multiline
        textAlignVertical="top"
      />

      <Text style={styles.label}>Attachments (Optional)</Text>
      <Pressable
        style={styles.attachBox}
        onPress={() => Alert.alert("Upload", "Attachment upload will be added next.")}
      >
        <View style={styles.attachIconWrap}>
          <Ionicons name="document-attach" size={18} color={colors.accent} />
        </View>
        <Text style={styles.attachText}>Click to upload images or documents</Text>
        <Text style={styles.attachHint}>PDF, JPG, PNG (Max 5MB)</Text>
      </Pressable>

      <Pressable style={styles.sendBtn} onPress={handleSend}>
        <Ionicons name="paper-plane" size={14} color={colors.primaryContrast} />
        <Text style={styles.sendText}>Send Notification</Text>
      </Pressable>

      <Text style={styles.footerHint}>
        Sending this announcement will trigger a push notification to all users in the selected target audience.
      </Text>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: scale(12),
      paddingBottom: scale(22),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(14),
    },
    backButton: {
      width: scale(28),
      height: scale(28),
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: ms(17),
      fontWeight: "800",
      color: colors.text,
    },
    sectionTitle: {
      fontSize: ms(11),
      color: colors.textMuted,
      fontWeight: "900",
      letterSpacing: 0.6,
      marginBottom: scale(8),
    },
    audienceRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(6),
      marginBottom: scale(10),
    },
    audienceChip: {
      minHeight: scale(32),
      borderRadius: 999,
      backgroundColor: colors.borderSoft,
      paddingHorizontal: scale(12),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    audienceChipActive: {
      backgroundColor: colors.primary,
    },
    audienceText: {
      fontSize: ms(12),
      color: colors.accent,
      fontWeight: "700",
    },
    audienceTextActive: {
      color: colors.primaryContrast,
    },
    label: {
      marginTop: scale(8),
      marginBottom: scale(6),
      color: colors.textMuted,
      fontSize: ms(12),
      fontWeight: "700",
    },
    input: {
      height: scale(44),
      borderRadius: scale(14),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: scale(12),
      color: colors.text,
      fontSize: ms(13),
    },
    messageInput: {
      height: scale(126),
      paddingTop: scale(10),
    },
    attachBox: {
      marginTop: scale(4),
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: scale(14),
      minHeight: scale(108),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: scale(12),
    },
    attachIconWrap: {
      width: scale(26),
      height: scale(26),
      borderRadius: scale(13),
      backgroundColor: colors.borderSoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(6),
    },
    attachText: {
      textAlign: "center",
      color: colors.textMuted,
      fontSize: ms(12),
      fontWeight: "600",
    },
    attachHint: {
      marginTop: scale(3),
      textAlign: "center",
      color: colors.textSubtle,
      fontSize: ms(10),
      fontWeight: "600",
    },
    sendBtn: {
      marginTop: scale(18),
      height: scale(46),
      borderRadius: scale(16),
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(7),
      shadowColor: colors.accent,
      shadowOpacity: 0.16,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    sendText: {
      color: colors.primaryContrast,
      fontSize: ms(14),
      fontWeight: "800",
    },
    footerHint: {
      marginTop: scale(10),
      textAlign: "center",
      color: colors.textSubtle,
      fontSize: ms(10),
      fontWeight: "600",
      lineHeight: ms(14),
      paddingHorizontal: scale(10),
    },
  });
