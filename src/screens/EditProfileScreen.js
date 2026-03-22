import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { resolveStoragePublicUrl, STORAGE_BUCKETS } from "../services/storage";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

const DEFAULT_EDIT_AVATAR =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80";

export default function EditProfileScreen({ values, onChange, onUploadAvatar, onSave, onSaveSuccess, onBack }) {
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors, isDark);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const formBusy = saving || uploadingAvatar;

  const avatarUri = resolveStoragePublicUrl(values.avatar, STORAGE_BUCKETS.avatars, DEFAULT_EDIT_AVATAR);

  const handlePickAvatar = async () => {
    if (uploadingAvatar) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access to upload an avatar.");
      return;
    }

    const pickResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (pickResult.canceled || !pickResult.assets?.[0]?.uri) {
      return;
    }

    if (!onUploadAvatar) {
      Alert.alert("Upload unavailable", "Avatar upload is not connected yet.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploadResult = await onUploadAvatar(pickResult.assets[0].uri);
      if (!uploadResult?.ok) {
        Alert.alert("Upload failed", uploadResult?.message || "Could not upload avatar.");
        return;
      }

      onChange("avatar", uploadResult.path);
      Alert.alert("Uploaded", "Avatar uploaded. Tap Save Changes to persist it.");
    } catch (_error) {
      Alert.alert("Upload failed", "Could not upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (formBusy) {
      return;
    }

    setSaving(true);
    try {
      const result = await onSave?.();
      if (result?.ok && result.mode !== "local") {
        const seconds = Math.max(0.1, (result.durationMs || 0) / 1000).toFixed(1);
        onSaveSuccess?.(`Profile updated successfully in ${seconds}s`);
        return;
      }

      if (result?.mode === "local") {
        Alert.alert("Saved locally", `${result.message || "Could not sync to server."} Your changes are visible on this device.`);
        return;
      }

      Alert.alert("Save failed", result?.message || "Could not save profile changes. Please try again.");
    } catch (_error) {
      Alert.alert("Save failed", "Could not save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, formBusy && styles.contentBusy]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={onBack} disabled={formBusy}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.photoSection}>
        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri: avatarUri,
            }}
            style={styles.avatar}
          />
          <Pressable style={styles.cameraBtn} onPress={handlePickAvatar} disabled={formBusy}>
            <Ionicons name="camera" size={13} color={colors.primaryContrast} />
          </Pressable>
        </View>
        <Text style={styles.photoTitle}>Update Photo</Text>
        <Pressable style={[styles.uploadBtn, formBusy && styles.uploadBtnDisabled]} onPress={handlePickAvatar} disabled={formBusy}>
          <Text style={styles.uploadText}>{uploadingAvatar ? "Uploading..." : "Upload New"}</Text>
        </Pressable>
      </View>

      <View style={styles.formArea}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          value={values.fullName}
          onChangeText={(value) => onChange("fullName", value)}
          placeholder="Full name"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          editable={!formBusy}
        />

        <Text style={styles.label}>Email (Read Only)</Text>
        <View style={[styles.input, styles.readOnlyRow]}>
          <Text style={styles.readOnlyText}>{values.email}</Text>
          <Ionicons name="lock-closed" size={15} color={colors.textSubtle} />
        </View>

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          value={values.phoneNumber || values.phone || "+234 801 234 5678"}
          onChangeText={(value) => onChange("phoneNumber", value)}
          placeholder="Phone number"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          keyboardType="phone-pad"
          editable={!formBusy}
        />

        <View style={styles.rowLabels}>
          <Text style={[styles.label, styles.halfLabel]}>Department</Text>
          <Text style={[styles.label, styles.halfLabel]}>Level</Text>
        </View>

        <View style={styles.doubleRow}>
          <View style={[styles.input, styles.selectLike]}>
            <Text style={styles.selectText}>{values.department || "Select department"}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSubtle} />
          </View>
          <View style={[styles.input, styles.selectLike]}>
            <Text style={styles.selectText}>{values.level ? `${values.level} Level` : "Select level"}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSubtle} />
          </View>
        </View>

        <Pressable style={[styles.saveBtn, formBusy && styles.saveBtnDisabled]} onPress={handleSave} disabled={formBusy}>
          <View style={styles.saveBtnContent}>
            {saving && <ActivityIndicator size="small" color={colors.primaryContrast} />}
            <Text style={styles.saveText}>{saving ? "Saving..." : "Save Changes"}</Text>
          </View>
        </Pressable>

        <Pressable style={styles.discardBtn} onPress={onBack} disabled={formBusy}>
          <Text style={styles.discardText}>Discard Changes</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: scale(12),
    paddingTop: scale(8),
    paddingBottom: scale(20),
  },
  contentBusy: {
    opacity: 0.74,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(10),
  },
  backBtn: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: scale(30),
  },
  title: {
    fontSize: ms(22),
    fontWeight: "800",
    color: colors.text,
  },
  photoSection: {
    alignItems: "center",
    paddingBottom: scale(14),
  },
  avatarWrap: {
    marginTop: scale(6),
    marginBottom: scale(8),
    borderWidth: 3,
    borderColor: isDark ? colors.borderSoft : colors.border,
    borderRadius: 999,
    padding: scale(3),
    position: "relative",
  },
  avatar: {
    width: scale(86),
    height: scale(86),
    borderRadius: scale(43),
    backgroundColor: colors.surfaceAlt,
  },
  cameraBtn: {
    position: "absolute",
    right: scale(-2),
    bottom: scale(4),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  photoTitle: {
    fontSize: ms(20),
    fontWeight: "800",
    color: colors.text,
  },
  uploadBtn: {
    marginTop: scale(10),
    paddingHorizontal: scale(22),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: isDark ? colors.surfaceAlt : colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
  uploadText: {
    color: isDark ? colors.accent : colors.accent,
    fontWeight: "700",
    fontSize: ms(13),
  },
  formArea: {
    marginTop: scale(2),
    gap: scale(6),
  },
  label: {
    marginTop: scale(8),
    marginBottom: scale(2),
    fontSize: ms(13),
    fontWeight: "700",
    color: colors.textMuted,
  },
  input: {
    minHeight: scale(46),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: isDark ? colors.border : colors.borderSoft,
    backgroundColor: isDark ? colors.surface : colors.surfaceAlt,
    color: colors.text,
    paddingHorizontal: scale(12),
    justifyContent: "center",
  },
  readOnlyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readOnlyText: {
    color: colors.textSubtle,
    fontSize: ms(14),
    fontWeight: "600",
  },
  rowLabels: {
    marginTop: scale(2),
    flexDirection: "row",
    gap: scale(8),
  },
  halfLabel: {
    flex: 1,
  },
  doubleRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  selectLike: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    color: colors.text,
    fontSize: ms(14),
    fontWeight: "600",
  },
  saveBtn: {
    marginTop: scale(16),
    height: scale(48),
    borderRadius: scale(16),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: isDark ? colors.text : colors.accent,
    shadowOpacity: isDark ? 0.16 : 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
  },
  saveText: {
    color: colors.primaryContrast,
    fontSize: ms(15),
    fontWeight: "800",
  },
  discardBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(12),
    marginTop: scale(2),
  },
  discardText: {
    color: colors.textSubtle,
    fontSize: ms(13),
    fontWeight: "700",
  },
  });
