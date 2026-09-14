import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Avatar } from "../components/Avatar";
import { AppText } from "../components/AppText";
import { SelectField } from "../components/Field";
import { AppTextInput } from "../components/AppTextInput";
import SelectPickerModal from "../components/SelectPickerModal";
import { useDatabaseOptions } from "../utils/useDatabaseOptions";
import { useToast } from "../components/Toast";
import { resolveStoragePublicUrl, STORAGE_BUCKETS } from "../services/storage";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";
import {
  fetchAcademicFaculties,
  fetchAcademicDepartments,
  fetchAcademicLevels,
} from "../services/academicData";

const DEFAULT_EDIT_AVATAR = "";

export default function EditProfileScreen({ values, onChange, onUploadAvatar, onSave, onSaveSuccess, onBack }) {
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors, isDark);
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const formBusy = saving || uploadingAvatar;

  // Academic data states
  const facultyOptions = useDatabaseOptions(fetchAcademicFaculties);
  const departmentLoader = useCallback(() => fetchAcademicDepartments(values?.faculty || ""), [values?.faculty]);
  const departmentOptions = useDatabaseOptions(departmentLoader);
  const levelOptions = useDatabaseOptions(fetchAcademicLevels);

  // Modal visibility
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);


  const avatarUri = resolveStoragePublicUrl(values.avatar, STORAGE_BUCKETS.avatars, DEFAULT_EDIT_AVATAR);

  const handlePickAvatar = async () => {
    if (uploadingAvatar) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showToast("Please allow photo library access to upload an avatar.", "error");
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
      showToast("Avatar upload is not connected yet.", "error");
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploadResult = await onUploadAvatar(pickResult.assets[0].uri);
      if (!uploadResult?.ok) {
        showToast(uploadResult?.message || "Could not upload avatar.", "error");
        return;
      }

      onChange("avatar", uploadResult.path);
      showToast("Avatar uploaded. Tap Save Changes to persist it.", "success");
    } catch (_error) {
      showToast("Could not upload avatar.", "error");
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
        onSaveSuccess?.("Profile updated successfully.");
        return;
      }

      if (result?.mode === "local") {
        showToast(`${result.message || "Could not sync to server."} Your changes are visible on this device.`, "success", 4000);
        return;
      }

      showToast(result?.message || "Could not save profile changes. Please try again.", "error");
    } catch (_error) {
      showToast("Could not save profile changes. Please try again.", "error");
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
        <Pressable
          style={styles.backBtn}
          onPress={onBack}
          disabled={formBusy}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityState={{ disabled: formBusy }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <AppText style={styles.title}>Edit Profile</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.photoSection}>
        <View style={styles.avatarWrap}>
          <Avatar uri={avatarUri} name={values.fullName} size={96} style={styles.avatar} />
          <Pressable
            style={styles.cameraBtn}
            onPress={handlePickAvatar}
            disabled={formBusy}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            accessibilityState={{ disabled: formBusy }}
          >
            <Ionicons name="camera" size={13} color={colors.primaryContrast} />
          </Pressable>
        </View>
        <AppText style={styles.photoTitle}>Update Photo</AppText>
        <Pressable
          style={[styles.uploadBtn, formBusy && styles.uploadBtnDisabled]}
          onPress={handlePickAvatar}
          disabled={formBusy}
          accessibilityRole="button"
          accessibilityLabel="Upload new photo"
          accessibilityState={{ disabled: formBusy, busy: uploadingAvatar }}
        >
          <AppText style={styles.uploadText}>{uploadingAvatar ? "Uploading..." : "Upload New"}</AppText>
        </Pressable>
      </View>

      <View style={styles.formArea}>
        <AppText style={styles.label}>Full Name</AppText>
        <AppTextInput
          value={values.fullName}
          onChangeText={(value) => onChange("fullName", value)}
          placeholder="Full name"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          editable={!formBusy}
        />

        <AppText style={styles.label}>Email (Read Only)</AppText>
        <View style={[styles.input, styles.readOnlyRow]}>
          <AppText style={styles.readOnlyText}>{values.email}</AppText>
          <Ionicons name="lock-closed" size={15} color={colors.textSubtle} />
        </View>

        <AppText style={styles.label}>Phone Number</AppText>
        <AppTextInput
          value={values.phoneNumber || values.phone || ""}
          onChangeText={(value) => onChange("phoneNumber", value)}
          placeholder="Phone number"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
          keyboardType="phone-pad"
          editable={!formBusy}
        />

        {values.accountType === "organizer" ? <>
          <AppText style={styles.label}>Organization / Group</AppText>
          <AppTextInput value={values.department || ""} onChangeText={value => onChange("department", value)} placeholder="Organization name" style={styles.input} editable={!formBusy} />
        </> : <>
          <SelectField label="Faculty" value={values.faculty} onPress={() => setShowFacultyPicker(true)} disabled={formBusy} />
          <SelectField label="Department" value={values.department} placeholder={values.faculty ? "Select department" : "Select a faculty first"} onPress={() => setShowDepartmentPicker(true)} disabled={formBusy || !values.faculty} />
          {values.accountType === "student" && <SelectField label="Level" value={values.level} onPress={() => setShowLevelPicker(true)} disabled={formBusy} />}
        </>}
        {["staff", "organizer"].includes(values.accountType) && <>
          <AppText style={styles.label}>Role / Designation</AppText>
          <AppTextInput value={values.roleDesignation || ""} onChangeText={value => onChange("roleDesignation", value)} placeholder="Your role" style={styles.input} editable={!formBusy} />
        </>}

        <Pressable
          style={[styles.saveBtn, formBusy && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={formBusy}
          accessibilityRole="button"
          accessibilityLabel="Save changes"
          accessibilityState={{ disabled: formBusy, busy: saving }}
        >
          <View style={styles.saveBtnContent}>
            {saving && <ActivityIndicator size="small" color={colors.primaryContrast} />}
            <AppText style={styles.saveText}>{saving ? "Saving..." : "Save Changes"}</AppText>
          </View>
        </Pressable>

        <Pressable
          style={styles.discardBtn}
          onPress={onBack}
          disabled={formBusy}
          accessibilityRole="button"
          accessibilityLabel="Discard changes"
          accessibilityState={{ disabled: formBusy }}
        >
          <AppText style={styles.discardText}>Discard Changes</AppText>
        </Pressable>
      </View>

      {/* Dynamic Academic Modals */}
      <SelectPickerModal
        visible={showFacultyPicker}
        title="Select Faculty"
        {...facultyOptions}
        selectedValue={values.faculty}
        onSelect={(val) => {
          onChange("faculty", val);
          onChange("department", "");
        }}
        onClose={() => setShowFacultyPicker(false)}
        searchPlaceholder="Search faculty..."
      />

      <SelectPickerModal
        visible={showDepartmentPicker}
        title={values.faculty ? `${values.faculty} Departments` : "Select Department"}
        {...departmentOptions}
        emptyMessage={values.faculty ? "No departments configured for this faculty." : "Select a faculty first."}
        selectedValue={values.department}
        onSelect={(val) => onChange("department", val)}
        onClose={() => setShowDepartmentPicker(false)}
        searchPlaceholder="Search department..."
      />

      <SelectPickerModal
        visible={showLevelPicker}
        title="Select Academic Level"
        {...levelOptions}
        selectedValue={values.level}
        onSelect={(val) => onChange("level", val)}
        onClose={() => setShowLevelPicker(false)}
        searchPlaceholder="Search level..."
      />
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
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBtnDisabled: {
    opacity: 0.6,
  },
  uploadText: {
    color: colors.accent,
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
