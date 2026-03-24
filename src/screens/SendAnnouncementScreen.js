import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

const TARGET_AUDIENCE = ["All Students", "Faculty of Science", "Staff Only"];

export default function SendAnnouncementScreen({ onBack, onSendAnnouncement }) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark);

  const [selectedAudience, setSelectedAudience] = useState(["All Students", "Faculty of Science", "Staff Only"]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleMode, setScheduleMode] = useState("now");
  const [scheduledAt, setScheduledAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [mainImageUri, setMainImageUri] = useState("");
  const [attachmentUris, setAttachmentUris] = useState([]);

  const pickImage = async ({ onSelect }) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Please allow photo access to add an image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      onSelect(result.assets[0].uri);
    } catch (_error) {
      Alert.alert("Upload failed", "Could not pick image. Please try again.");
    }
  };

  const scheduledLabel = `${scheduledAt.toLocaleDateString()} ${scheduledAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const handleScheduledDateChange = (_event, date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (!date) {
      return;
    }

    const next = new Date(scheduledAt);
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setScheduledAt(next);
  };

  const handleScheduledTimeChange = (_event, time) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (!time) {
      return;
    }

    const next = new Date(scheduledAt);
    next.setHours(time.getHours(), time.getMinutes(), 0, 0);
    setScheduledAt(next);
  };

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

  const handleSend = async () => {
    if (!subject.trim()) {
      Alert.alert("Required", "Please enter announcement title.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Required", "Please enter announcement details.");
      return;
    }

    if (onSendAnnouncement) {
      const result = await onSendAnnouncement({
        subject,
        message,
        targetAudience: selectedAudience,
        scheduledAt: scheduleMode === "later" ? scheduledAt.toISOString() : null,
        mainImageUri,
        attachmentUris,
      });

      if (!result?.ok) {
        return;
      }
    } else {
      if (scheduleMode === "later") {
        Alert.alert("Announcement scheduled", `This announcement is set for ${scheduledLabel}.`);
      } else {
        Alert.alert("Announcement saved", "Announcement flow is local for now.");
      }
    }

    setSubject("");
    setMessage("");
    setMainImageUri("");
    setAttachmentUris([]);
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

      <Text style={styles.label}>Main Image (Optional)</Text>
      <Pressable
        style={styles.attachBox}
        onPress={() => pickImage({ onSelect: setMainImageUri })}
      >
        {mainImageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: mainImageUri }} style={styles.previewImage} resizeMode="cover" />
            <Pressable style={styles.removeBadge} onPress={() => setMainImageUri("")}>
              <Ionicons name="close" size={12} color={colors.primaryContrast} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.attachIconWrap}>
              <Ionicons name="image-outline" size={18} color={colors.accent} />
            </View>
            <Text style={styles.attachText}>Tap to choose announcement cover image</Text>
            <Text style={styles.attachHint}>JPG, PNG, WEBP</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.sectionTitle}>DELIVERY</Text>
      <View style={styles.scheduleRow}>
        <Pressable
          style={[styles.scheduleChip, scheduleMode === "now" && styles.scheduleChipActive]}
          onPress={() => setScheduleMode("now")}
        >
          <Text style={[styles.scheduleChipText, scheduleMode === "now" && styles.scheduleChipTextActive]}>Send Now</Text>
        </Pressable>
        <Pressable
          style={[styles.scheduleChip, scheduleMode === "later" && styles.scheduleChipActive]}
          onPress={() => setScheduleMode("later")}
        >
          <Text style={[styles.scheduleChipText, scheduleMode === "later" && styles.scheduleChipTextActive]}>Schedule</Text>
        </Pressable>
      </View>

      {scheduleMode === "later" && (
        <View style={styles.schedulePanel}>
          <Text style={styles.scheduleLabel}>Scheduled For</Text>
          <Text style={styles.scheduleValue}>{scheduledLabel}</Text>

          <View style={styles.scheduleActions}>
            <Pressable style={styles.scheduleBtn} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={14} color={colors.accent} />
              <Text style={styles.scheduleBtnText}>Pick Date</Text>
            </Pressable>

            <Pressable style={styles.scheduleBtn} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={14} color={colors.accent} />
              <Text style={styles.scheduleBtnText}>Pick Time</Text>
            </Pressable>
          </View>

          {showDatePicker && (
            <View style={styles.inlinePickerWrap}>
              <DateTimePicker
                value={scheduledAt}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={handleScheduledDateChange}
              />
            </View>
          )}

          {showTimePicker && (
            <View style={styles.inlinePickerWrap}>
              <DateTimePicker
                value={scheduledAt}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleScheduledTimeChange}
              />
            </View>
          )}
        </View>
      )}

      <Text style={styles.label}>Attachments (Optional)</Text>
      <Pressable
        style={styles.attachBox}
        onPress={() =>
          pickImage({
            onSelect: (uri) => {
              setAttachmentUris((prev) => {
                if (prev.includes(uri)) {
                  return prev;
                }
                return [...prev, uri].slice(0, 5);
              });
            },
          })
        }
      >
        <View style={styles.attachIconWrap}>
          <Ionicons name="document-attach" size={18} color={colors.accent} />
        </View>
        <Text style={styles.attachText}>Tap to add attachment images ({attachmentUris.length}/5)</Text>
        <Text style={styles.attachHint}>JPG, PNG, WEBP</Text>
      </Pressable>

      {attachmentUris.length > 0 && (
        <View style={styles.attachmentPreviewRow}>
          {attachmentUris.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.attachmentThumbWrap}>
              <Image source={{ uri }} style={styles.attachmentThumb} resizeMode="cover" />
              <Pressable
                style={styles.removeAttachmentBtn}
                onPress={() => setAttachmentUris((prev) => prev.filter((item) => item !== uri))}
              >
                <Ionicons name="close" size={10} color={colors.primaryContrast} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

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
    scheduleRow: {
      flexDirection: "row",
      gap: scale(8),
      marginBottom: scale(8),
    },
    scheduleChip: {
      minHeight: scale(32),
      borderRadius: 999,
      backgroundColor: colors.borderSoft,
      paddingHorizontal: scale(14),
      alignItems: "center",
      justifyContent: "center",
    },
    scheduleChipActive: {
      backgroundColor: colors.primary,
    },
    scheduleChipText: {
      color: colors.accent,
      fontSize: ms(12),
      fontWeight: "700",
    },
    scheduleChipTextActive: {
      color: colors.primaryContrast,
    },
    schedulePanel: {
      marginBottom: scale(8),
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: scale(14),
      backgroundColor: colors.surface,
      paddingHorizontal: scale(10),
      paddingVertical: scale(10),
    },
    scheduleLabel: {
      color: colors.textMuted,
      fontSize: ms(11),
      fontWeight: "700",
    },
    scheduleValue: {
      marginTop: scale(2),
      color: colors.text,
      fontSize: ms(13),
      fontWeight: "800",
    },
    scheduleActions: {
      marginTop: scale(8),
      flexDirection: "row",
      gap: scale(8),
    },
    scheduleBtn: {
      minHeight: scale(34),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      paddingHorizontal: scale(10),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(6),
    },
    scheduleBtnText: {
      color: colors.accent,
      fontSize: ms(12),
      fontWeight: "700",
    },
    inlinePickerWrap: {
      marginTop: scale(8),
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: scale(12),
      backgroundColor: colors.surface,
      overflow: "hidden",
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
    previewWrap: {
      width: "100%",
      height: scale(140),
      borderRadius: scale(10),
      overflow: "hidden",
      position: "relative",
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    removeBadge: {
      position: "absolute",
      top: scale(8),
      right: scale(8),
      width: scale(22),
      height: scale(22),
      borderRadius: scale(11),
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    attachmentPreviewRow: {
      marginTop: scale(8),
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
    },
    attachmentThumbWrap: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(8),
      overflow: "hidden",
      position: "relative",
      borderWidth: 1,
      borderColor: colors.border,
    },
    attachmentThumb: {
      width: "100%",
      height: "100%",
    },
    removeAttachmentBtn: {
      position: "absolute",
      top: scale(3),
      right: scale(3),
      width: scale(16),
      height: scale(16),
      borderRadius: scale(8),
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
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
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
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
