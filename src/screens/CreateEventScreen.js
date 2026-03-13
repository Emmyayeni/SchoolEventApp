import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function CreateEventScreen({ values, errors, onChange, onSubmit, onBack }) {
  const [targetAudience, setTargetAudience] = useState("All");
  const [capacity, setCapacity] = useState("");

  const handleSubmit = () => {
    const success = onSubmit();
    if (success) {
      Alert.alert("Success", "Event created successfully");
    }
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={18} color="#166534" />
        </Pressable>
        <Text style={styles.title}>Create Event</Text>
      </View>

      <Text style={styles.sectionLabel}>Event Banner</Text>
      <Pressable style={styles.bannerUpload}>
        <View style={styles.bannerIconWrap}>
          <Ionicons name="camera" size={20} color="#0b7a24" />
        </View>
        <Text style={styles.bannerText}>Click to upload image</Text>
        <Text style={styles.bannerHint}>Recommended: 1200 x 675 pixels</Text>
      </Pressable>

      <FormCard title="BASIC DETAILS" icon="ellipse" iconColor="#0b7a24">
        <Field
          label="Event Title"
          value={values.title}
          onChangeText={(value) => onChange("title", value)}
          placeholder="e.g. Annual Tech Symposium"
          error={errors.title}
        />

        <Field
          label="Category"
          value={values.category}
          onChangeText={(value) => onChange("category", value)}
          placeholder="Select category"
          error={errors.category}
          rightIcon="chevron-down"
        />

        <Field
          label="Description"
          value={values.description}
          onChangeText={(value) => onChange("description", value)}
          placeholder="Describe your event..."
          error={errors.description}
          multiline
        />
      </FormCard>

      <FormCard title="LOGISTICS" icon="location" iconColor="#0b7a24">
        <Field
          label="Venue"
          value={values.venue}
          onChangeText={(value) => onChange("venue", value)}
          placeholder="e.g. Faculty of Science Auditorium"
          error={errors.venue}
        />

        <View style={styles.doubleRow}>
          <View style={styles.halfField}>
            <Field
              label="Date"
              value={values.date}
              onChangeText={(value) => onChange("date", value)}
              placeholder="DD/MM/YY"
              error={errors.date}
              leftIcon="calendar"
            />
          </View>
          <View style={styles.halfField}>
            <Field
              label="Time"
              value={values.time}
              onChangeText={(value) => onChange("time", value)}
              placeholder="00:00 AM"
              error={errors.time}
              leftIcon="time"
            />
          </View>
        </View>
      </FormCard>

      <FormCard title="ADMINISTRATION" icon="people" iconColor="#0b7a24">
        <Field
          label="Organizer Name"
          value={values.organizer}
          onChangeText={(value) => onChange("organizer", value)}
          placeholder="NSUK Student Union"
          error={errors.organizer}
        />

        <View style={styles.doubleRow}>
          <View style={styles.halfField}>
            <Field
              label="Target Audience"
              value={targetAudience}
              onChangeText={setTargetAudience}
              placeholder="All"
            />
          </View>
          <View style={styles.halfField}>
            <Field
              label="Capacity"
              value={capacity}
              onChangeText={setCapacity}
              placeholder="e.g. 500"
            />
          </View>
        </View>
      </FormCard>

      <Pressable style={styles.publishButton} onPress={handleSubmit}>
        <Ionicons name="play" size={13} color="#ffffff" />
        <Text style={styles.publishText}>Publish Event</Text>
      </Pressable>

      <Pressable style={styles.draftButton} onPress={onBack}>
        <Text style={styles.draftText}>Save as Draft</Text>
      </Pressable>
    </ScrollView>
  );
}

function FormCard({ title, icon, iconColor, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={12} color={iconColor} />
        <Text style={styles.cardTitle}>{title}</Text>
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
  leftIcon,
  rightIcon,
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, multiline && styles.inputWrapMultiline, error && styles.inputWrapError]}>
        {!!leftIcon && <Ionicons name={leftIcon} size={15} color="#94a3b8" style={styles.leftIcon} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          style={[
            styles.input,
            !!leftIcon && styles.inputWithLeftIcon,
            !!rightIcon && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
          ]}
          multiline={multiline}
        />
        {!!rightIcon && <Ionicons name={rightIcon} size={15} color="#6b7280" style={styles.rightIcon} />}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#e9ecea",
  },
  pageContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  backButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#166534",
    fontSize: 19,
    fontWeight: "800",
  },
  sectionLabel: {
    marginTop: 6,
    marginBottom: 5,
    color: "#166534",
    fontSize: 11,
    fontWeight: "800",
  },
  bannerUpload: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#9fc7a6",
    borderRadius: 14,
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#e8efea",
  },
  bannerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#d5e7d9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  bannerText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerHint: {
    marginTop: 3,
    color: "#6b7280",
    fontSize: 10,
    fontWeight: "500",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dfe5e2",
    backgroundColor: "#f1f4f2",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: {
    color: "#14532d",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "900",
  },
  fieldWrap: {
    marginBottom: 10,
  },
  fieldLabel: {
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
  },
  inputWrap: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: "#cfd8d1",
    borderRadius: 12,
    backgroundColor: "#edf2ee",
    justifyContent: "center",
  },
  inputWrapMultiline: {
    minHeight: 88,
    justifyContent: "flex-start",
  },
  inputWrapError: {
    borderColor: "#ef4444",
  },
  input: {
    color: "#111827",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWithLeftIcon: {
    paddingLeft: 33,
  },
  inputWithRightIcon: {
    paddingRight: 28,
  },
  inputMultiline: {
    textAlignVertical: "top",
  },
  leftIcon: {
    position: "absolute",
    left: 10,
    top: 12,
  },
  rightIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 11,
    marginTop: 3,
  },
  doubleRow: {
    flexDirection: "row",
    gap: 8,
  },
  halfField: {
    flex: 1,
  },
  publishButton: {
    marginTop: 2,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: "#007a08",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  publishText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  draftButton: {
    marginTop: 8,
    minHeight: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c5d3c8",
    backgroundColor: "#eef3ef",
    alignItems: "center",
    justifyContent: "center",
  },
  draftText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "700",
  },
});