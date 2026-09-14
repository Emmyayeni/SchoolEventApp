import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { AppTextInput } from "../components/AppTextInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import SelectPickerModal from "../components/SelectPickerModal";
import { fetchEventCategories, fetchEventVenues } from "../services/academicData";
import { useDatabaseOptions } from "../utils/useDatabaseOptions";
import { eventDateForPicker } from "../utils/eventTime";
import { ms, scale } from "../utils/responsive";

export default function CreateEventScreen({ values, errors, onChange, onSubmit, onUploadEventImage, onBack, mode = "create" }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);
  const [showAudiencePicker, setShowAudiencePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showVenuePicker, setShowVenuePicker] = useState(false);
  const [customVenue, setCustomVenue] = useState(false);
  const categoryOptions = useDatabaseOptions(fetchEventCategories);
  const venueOptions = useDatabaseOptions(fetchEventVenues);
  const formBusy = submitting || uploadingBanner;
  const isEditMode = mode === "edit";

  const parseDateValue = () => {
    const parsed = eventDateForPicker(values.date);
    if (parsed && !Number.isNaN(parsed.getTime())) {
      return parsed;
    }
    return new Date();
  };

  const parseTimeValue = () => {
    const now = new Date();
    const raw = String(values.time || "").trim();
    if (!raw) {
      return now;
    }

    const twelveHour = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (twelveHour) {
      let hour = Number(twelveHour[1]);
      const minute = Number(twelveHour[2]);
      const period = twelveHour[3].toUpperCase();
      if (period === "PM" && hour < 12) {
        hour += 12;
      }
      if (period === "AM" && hour === 12) {
        hour = 0;
      }

      const date = new Date(now);
      date.setHours(hour, minute, 0, 0);
      return date;
    }

    const twentyFourHour = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (twentyFourHour) {
      const hour = Number(twentyFourHour[1]);
      const minute = Number(twentyFourHour[2]);
      const date = new Date(now);
      date.setHours(hour, minute, 0, 0);
      return date;
    }

    return now;
  };

  const formatDateForField = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeForField = (date) => {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = ((hours + 11) % 12) + 1;
    return `${hour12}:${minutes} ${suffix}`;
  };

  const onDatePicked = (_event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (!selectedDate) {
      return;
    }
    onChange("date", formatDateForField(selectedDate));
  };

  const onTimePicked = (_event, selectedTime) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (!selectedTime) {
      return;
    }
    onChange("time", formatTimeForField(selectedTime));
  };

  const handleUploadBanner = async () => {
    if (formBusy) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access to upload an event banner.");
      return;
    }

    const pickResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.9,
    });

    if (pickResult.canceled || !pickResult.assets?.[0]?.uri) {
      return;
    }

    if (!onUploadEventImage) {
      Alert.alert("Upload unavailable", "Event image upload is not connected yet.");
      return;
    }

    setUploadingBanner(true);
    try {
      const uploadResult = await onUploadEventImage(pickResult.assets[0].uri);
      if (!uploadResult?.ok) {
        Alert.alert("Upload failed", uploadResult?.message || "Could not upload event image.");
        return;
      }

      onChange("image", uploadResult.path);
      Alert.alert("Uploaded", "Event banner uploaded successfully.");
    } catch (_error) {
      Alert.alert("Upload failed", "Could not upload event image.");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (status = values.status || "published") => {
    if (formBusy) {
      return;
    }

    setSubmitting(true);
    try {
      const success = await onSubmit(status);
      if (success) {
        Alert.alert("Success", status === "draft" ? "Draft saved" : isEditMode ? "Event updated successfully" : "Event created successfully");
      }
    } catch (error) {
      Alert.alert("Save failed", error?.message || "Could not save this event.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.pageContent, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          disabled={formBusy}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityState={{ disabled: formBusy }}
        >
          <Ionicons name="arrow-back" size={18} color={colors.accent} />
        </Pressable>
        <AppText style={styles.title}>{isEditMode ? "Edit Event" : "Create Event"}</AppText>
      </View>

      <AppText style={styles.sectionLabel}>Event Banner</AppText>
      <Pressable
        style={[styles.bannerUpload, formBusy && styles.bannerUploadDisabled, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handleUploadBanner}
        disabled={formBusy}
        accessibilityRole="button"
        accessibilityLabel="Upload event banner"
        accessibilityState={{ disabled: formBusy, busy: uploadingBanner }}
      >
        <View style={styles.bannerIconWrap}>
          {uploadingBanner ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="camera" size={20} color={colors.primary} />}
        </View>
        <AppText style={styles.bannerText}>{uploadingBanner ? "Uploading image..." : "Click to upload image"}</AppText>
        <AppText style={styles.bannerHint}>
          {values.image?.trim() ? "Image selected and ready" : "Recommended: 1200 x 675 pixels"}
        </AppText>
      </Pressable>

      <FormCard title="BASIC DETAILS" icon="ellipse" iconColor={colors.primary} styles={styles}>
        <Field
          label="Event Title"
          value={values.title}
          onChangeText={(value) => onChange("title", value)}
          placeholder="e.g. Annual Tech Symposium"
          error={errors.title}
        />

        <PickerField label="Category" value={values.category} placeholder="Select category" error={errors.category} icon="grid" onPress={() => setShowCategoryList(true)} disabled={formBusy} />

        <Field
          label="Description"
          value={values.description}
          onChangeText={(value) => onChange("description", value)}
          placeholder="Describe your event..."
          error={errors.description}
          multiline
        />
      </FormCard>

      <FormCard title="LOGISTICS" icon="location" iconColor={colors.primary} styles={styles}>
        <PickerField label="Venue" value={values.venue} placeholder="Select venue or add a new one" error={errors.venue} icon="location" onPress={() => setShowVenuePicker(true)} disabled={formBusy} />
        {customVenue && <Field label="New venue" value={values.venue} onChangeText={value => onChange("venue", value)} placeholder="Enter the venue name" error={errors.venue} />}

        <View style={styles.doubleRow}>
          <View style={styles.halfField}>
            <PickerField
              label="Date"
              value={values.date}
              placeholder="Select date"
              error={errors.date}
              icon="calendar"
              onPress={() => {
                if (!formBusy) {
                  setShowDatePicker(true);
                }
              }}
              disabled={formBusy}
            />
          </View>
          <View style={styles.halfField}>
            <PickerField
              label="Time"
              value={values.time}
              placeholder="Select time"
              error={errors.time}
              icon="time"
              onPress={() => {
                if (!formBusy) {
                  setShowTimePicker(true);
                }
              }}
              disabled={formBusy}
            />
          </View>
        </View>

        {showDatePicker && (
          <View style={styles.inlinePickerWrap}>
            <DateTimePicker
              value={parseDateValue()}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onDatePicked}
            />
          </View>
        )}

        {showTimePicker && (
          <View style={styles.inlinePickerWrap}>
            <DateTimePicker
              value={parseTimeValue()}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onTimePicked}
            />
          </View>
        )}
      </FormCard>

      <FormCard title="ADMINISTRATION" icon="people" iconColor={colors.primary} styles={styles}>
        <Field
          label="Organizer Name"
          value={values.organizer}
          onChangeText={(value) => onChange("organizer", value)}
          placeholder="NSUK Student Union"
          error={errors.organizer}
        />

        <View style={styles.doubleRow}>
          <View style={styles.halfField}>
            <PickerField label="Target Audience" value={{ all: "Everyone", students: "Students", staff: "Staff and organizers" }[values.targetAudience]} onPress={() => setShowAudiencePicker(true)} placeholder="Select audience" icon="people" error={errors.targetAudience} disabled={formBusy} />
          </View>
          <View style={styles.halfField}>
            <Field
              label="Capacity"
              keyboardType="number-pad"
              error={errors.capacity}
              value={values.capacity}
              onChangeText={(value) => onChange("capacity", value)}
              placeholder="e.g. 500"
            />
          </View>
        </View>
      </FormCard>

      {isEditMode && <PickerField label="Status" value={values.status || "published"} placeholder="Select status" icon="flag" error={errors.status} onPress={() => setShowStatusPicker(true)} disabled={formBusy} />}

      <Pressable
        style={[styles.publishButton, formBusy && styles.buttonDisabled]}
        onPress={() => handleSubmit()}
        disabled={formBusy}
        accessibilityRole="button"
        accessibilityLabel={isEditMode ? "Update event" : "Publish event"}
        accessibilityState={{ disabled: formBusy, busy: submitting }}
      >
        {submitting ? <ActivityIndicator size="small" color={colors.primaryContrast} /> : <Ionicons name="play" size={13} color={colors.primaryContrast} />}
        <AppText style={styles.publishText}>{submitting ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Event" : "Publish Event")}</AppText>
      </Pressable>

      <Pressable
        style={[styles.draftButton, formBusy && styles.buttonDisabled]}
        onPress={() => handleSubmit("draft")}
        disabled={formBusy}
        accessibilityRole="button"
        accessibilityLabel="Save as draft"
        accessibilityState={{ disabled: formBusy }}
      >
        <AppText style={styles.draftText}>Save as Draft</AppText>
      </Pressable>
      <SelectPickerModal visible={showCategoryList} title="Select category" {...categoryOptions} selectedValue={values.category} onSelect={value => onChange("category", value)} onClose={() => setShowCategoryList(false)} />
      <SelectPickerModal visible={showAudiencePicker} title="Select audience" options={[{label: "Everyone", value: "all"}, {label: "Students", value: "students"}, {label: "Staff and organizers", value: "staff"}]} selectedValue={values.targetAudience} onSelect={value => onChange("targetAudience", value)} onClose={() => setShowAudiencePicker(false)} />
      <SelectPickerModal visible={showStatusPicker} title="Event status" options={[{label: "Draft", value: "draft"}, {label: "Published", value: "published"}, {label: "Cancelled", value: "cancelled"}, {label: "Archived", value: "archived"}]} selectedValue={values.status || "published"} onSelect={value => onChange("status", value)} onClose={() => setShowStatusPicker(false)} />
      <SelectPickerModal visible={showVenuePicker} title="Select venue" {...venueOptions} options={[...venueOptions.options, {label: "Enter a new venue", value: "__custom__"}]} selectedValue={values.venue} onSelect={value => { setCustomVenue(value === "__custom__"); if (value !== "__custom__") onChange("venue", value); }} onClose={() => setShowVenuePicker(false)} />
    </ScrollView>
  );
}

function FormCard({ title, icon, iconColor, children, styles }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={12} color={iconColor} />
        <AppText style={[styles.cardTitle, { color: colors.text }]}>{title}</AppText>
      </View>
      {children}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline = false,
  keyboardType = "default",
  leftIcon,
  rightIcon,
}) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.fieldWrap}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <View style={[styles.inputWrap, multiline && styles.inputWrapMultiline, error && styles.inputWrapError]}>
        {!!leftIcon && <Ionicons name={leftIcon} size={15} color={colors.textSubtle} style={styles.leftIcon} />}
        <AppTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.input,
            !!leftIcon && styles.inputWithLeftIcon,
            !!rightIcon && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
          ]}
          multiline={multiline}
          keyboardType={keyboardType}
        />
        {!!rightIcon && <Ionicons name={rightIcon} size={15} color={colors.textMuted} style={styles.rightIcon} />}
      </View>
      {!!error && <AppText style={styles.errorText}>{error}</AppText>}
    </View>
  );
}

function PickerField({ label, value, placeholder, error, icon, onPress, disabled }) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.fieldWrap}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <Pressable
        style={[styles.inputWrap, error && styles.inputWrapError, disabled && styles.inputWrapDisabled]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={value ? `${label}, ${value}` : label}
        accessibilityState={{ disabled }}
      >
        <Ionicons name={icon} size={15} color={colors.textSubtle} style={styles.leftIcon} />
        <AppText style={[styles.input, styles.inputWithLeftIcon, !value && styles.inputPlaceholder]}>
          {value || placeholder}
        </AppText>
      </Pressable>
      {!!error && <AppText style={styles.errorText}>{error}</AppText>}
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageContent: {
    paddingHorizontal: scale(14),
    paddingTop: scale(8),
    paddingBottom: scale(24),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scale(8),
    gap: scale(8),
  },
  backButton: {
    width: scale(28),
    height: scale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.accent,
    fontSize: ms(18),
    fontWeight: "800",
  },
  sectionLabel: {
    marginTop: scale(6),
    marginBottom: scale(5),
    color: colors.accent,
    fontSize: ms(11),
    fontWeight: "800",
  },
  bannerUpload: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: scale(14),
    minHeight: scale(110),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(12),
    backgroundColor: colors.surface,
  },
  bannerUploadDisabled: {
    opacity: 0.75,
  },
  bannerIconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(6),
  },
  bannerText: {
    color: colors.text,
    fontSize: ms(12),
    fontWeight: "700",
  },
  bannerHint: {
    marginTop: scale(3),
    color: colors.textMuted,
    fontSize: ms(10),
    fontWeight: "500",
  },
  card: {
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: scale(12),
    paddingTop: scale(10),
    paddingBottom: scale(8),
    marginBottom: scale(10),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginBottom: scale(10),
  },
  cardTitle: {
    color: colors.accent,
    fontSize: ms(10),
    letterSpacing: 1,
    fontWeight: "900",
  },
  fieldWrap: {
    marginBottom: scale(10),
  },
  fieldLabel: {
    color: colors.text,
    fontSize: ms(12),
    fontWeight: "700",
    marginBottom: scale(5),
  },
  inputWrap: {
    minHeight: scale(42),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(12),
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  inputWrapDisabled: {
    opacity: 0.65,
  },
  inputWrapMultiline: {
    minHeight: scale(84),
    justifyContent: "flex-start",
  },
  inputWrapError: {
    borderColor: colors.error,
  },
  categoryListWrap: {
    marginTop: scale(6),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(12),
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  categoryItem: {
    minHeight: scale(38),
    paddingHorizontal: scale(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  categoryItemActive: {
    backgroundColor: colors.surfaceAlt,
  },
  categoryItemText: {
    color: colors.text,
    fontSize: ms(13),
    fontWeight: "600",
  },
  categoryItemTextActive: {
    color: colors.primary,
  },
  input: {
    color: colors.text,
    fontSize: ms(13),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
  },
  inputPlaceholder: {
    color: colors.textSubtle,
  },
  inputWithLeftIcon: {
    paddingLeft: scale(34),
  },
  inputWithRightIcon: {
    paddingRight: scale(30),
  },
  inputMultiline: {
    textAlignVertical: "top",
  },
  leftIcon: {
    position: "absolute",
    left: scale(10),
    top: scale(12),
  },
  rightIcon: {
    position: "absolute",
    right: scale(10),
    top: scale(12),
  },
  errorText: {
    color: colors.error,
    fontSize: ms(11),
    marginTop: scale(3),
  },
  inlinePickerWrap: {
    marginTop: scale(2),
    marginBottom: scale(8),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(12),
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  doubleRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  halfField: {
    flex: 1,
  },
  publishButton: {
    marginTop: scale(2),
    minHeight: scale(46),
    borderRadius: scale(23),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: scale(6),
  },
  publishText: {
    color: colors.primaryContrast,
    fontSize: ms(14),
    fontWeight: "800",
  },
  draftButton: {
    marginTop: scale(8),
    minHeight: scale(42),
    borderRadius: scale(21),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  draftText: {
    color: colors.accent,
    fontSize: ms(14),
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  });
