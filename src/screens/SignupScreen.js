import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { Field, SelectField } from "../components/Field";
import SelectPickerModal from "../components/SelectPickerModal";
import CustomButton from "../components/CustomButton";
import { IconButton } from "../components/Header";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";
import {
  fetchAcademicFaculties,
  fetchAcademicDepartments,
  fetchAcademicLevels,
} from "../services/academicData";

const ACCOUNT_TYPES = [
  { key: "student", label: "Student" },
  { key: "staff", label: "Staff" },
  { key: "organizer", label: "Organizer" },
];

export default function SignupScreen({ values, errors, loading, onChange, onRegister, onSwitchToLogin }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const accountType = values?.accountType || "student";

  // Dynamic academic data states
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);

  // Modal visibility states
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  useEffect(() => {
    fetchAcademicFaculties().then(setFaculties);
    fetchAcademicLevels().then(setLevels);
  }, []);

  useEffect(() => {
    fetchAcademicDepartments(values.faculty || "").then(setDepartments);
  }, [values.faculty]);

  const switchAccountType = (type) => {
    onChange("accountType", type);
    if (type === "student") {
      onChange("staffId", "");
      onChange("roleDesignation", "");
      return;
    }
    onChange("faculty", "");
    onChange("level", "");
    onChange("matricNumber", "");
  };

  const renderEye = (visible, toggle, label) => (
    <Pressable
      onPress={toggle}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={visible ? `Hide ${label}` : `Show ${label}`}
    >
      <Ionicons name={visible ? "eye-off" : "eye"} size={18} color={colors.textSubtle} />
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: (insets?.top ?? 0) + scale(10),
          paddingBottom: Math.max(insets?.bottom ?? 0, scale(22)),
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <IconButton name="arrow-back" label="Go back" onPress={onSwitchToLogin} color={colors.text} />
        <AppText style={styles.brand}>NSUK Events</AppText>
        <View style={styles.topSpacer} />
      </View>

      <AppText variant="h1" style={styles.title}>
        Create Account
      </AppText>
      <AppText style={styles.subtitle}>Choose your role to access the right campus event tools.</AppText>

      <View style={styles.segmentWrap} accessibilityRole="tablist">
        {ACCOUNT_TYPES.map((type) => {
          const active = accountType === type.key;
          return (
            <Pressable
              key={type.key}
              style={[styles.segmentButton, active && styles.segmentButtonActive]}
              onPress={() => switchAccountType(type.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={type.label}
            >
              <AppText style={[styles.segmentText, active && styles.segmentTextActive]}>{type.label}</AppText>
            </Pressable>
          );
        })}
      </View>

      <Field
        label="Full Name"
        value={values.fullName}
        onChangeText={(v) => onChange("fullName", v)}
        placeholder="John Doe"
        autoCapitalize="words"
        leftIcon="person-outline"
        error={errors.fullName}
      />

      <Field
        label="Email Address"
        value={values.email}
        onChangeText={(v) => onChange("email", v)}
        placeholder="name@nsuk.edu.ng"
        autoCapitalize="none"
        keyboardType="email-address"
        leftIcon="mail-outline"
        error={errors.email}
      />

      <Field
        label="Password"
        value={values.password}
        onChangeText={(v) => onChange("password", v)}
        placeholder="Min. 8 characters"
        autoCapitalize="none"
        secureTextEntry={!showPassword}
        leftIcon="lock-closed-outline"
        rightNode={renderEye(showPassword, () => setShowPassword((p) => !p), "password")}
        error={errors.password}
      />

      <Field
        label="Confirm Password"
        value={values.confirmPassword}
        onChangeText={(v) => onChange("confirmPassword", v)}
        placeholder="Re-enter password"
        autoCapitalize="none"
        secureTextEntry={!showConfirmPassword}
        leftIcon="lock-closed-outline"
        rightNode={renderEye(showConfirmPassword, () => setShowConfirmPassword((p) => !p), "confirm password")}
        error={errors.confirmPassword}
      />

      {accountType === "student" ? (
        <>
          <Field
            label="Matric Number"
            value={values.matricNumber}
            onChangeText={(v) => onChange("matricNumber", v)}
            placeholder="e.g 20/SCI/1234"
            leftIcon="card-outline"
            error={errors.matricNumber}
          />
          <SelectField
            label="Faculty"
            value={values.faculty}
            onPress={() => setShowFacultyPicker(true)}
            placeholder="Select Faculty"
            leftIcon="school-outline"
            error={errors.faculty}
          />
          <SelectField
            label="Department"
            value={values.department}
            onPress={() => setShowDepartmentPicker(true)}
            placeholder="Select Department"
            leftIcon="business-outline"
            error={errors.department}
          />
          <SelectField
            label="Level"
            value={values.level}
            onPress={() => setShowLevelPicker(true)}
            placeholder="Select Academic Level"
            leftIcon="stats-chart-outline"
            error={errors.level}
          />
        </>
      ) : accountType === "staff" ? (
        <>
          <SelectField
            label="Faculty"
            value={values.faculty}
            onPress={() => setShowFacultyPicker(true)}
            placeholder="Select Faculty"
            leftIcon="school-outline"
            error={errors.faculty}
          />
          <SelectField
            label="Department"
            value={values.department}
            onPress={() => setShowDepartmentPicker(true)}
            placeholder="Select Department"
            leftIcon="business-outline"
            error={errors.department}
          />
          <View style={styles.row}>
            <Field
              label="Staff ID"
              value={values.staffId}
              onChangeText={(v) => onChange("staffId", v)}
              placeholder="E.g. STF-001"
              leftIcon="card-outline"
              containerStyle={styles.halfWidth}
              error={errors.staffId}
            />
            <Field
              label="Role"
              value={values.roleDesignation}
              onChangeText={(v) => onChange("roleDesignation", v)}
              placeholder="Lecturer"
              leftIcon="briefcase-outline"
              containerStyle={styles.halfWidth}
              error={errors.roleDesignation}
            />
          </View>
        </>
      ) : (
        <>
          <Field
            label="Organization / Group"
            value={values.department}
            onChangeText={(v) => onChange("department", v)}
            placeholder="E.g. Tech Club"
            leftIcon="business-outline"
            error={errors.department}
          />
          <Field
            label="Role in Organization"
            value={values.roleDesignation}
            onChangeText={(v) => onChange("roleDesignation", v)}
            placeholder="E.g. Event Coordinator"
            leftIcon="briefcase-outline"
            error={errors.roleDesignation}
          />
        </>
      )}

      {!!errors.general && <AppText style={styles.errorText}>{errors.general}</AppText>}

      <CustomButton
        title="Create Account"
        onPress={onRegister}
        loading={loading}
        style={{ marginTop: scale(6), marginBottom: scale(12) }}
      />

      <View style={styles.footerRow}>
        <AppText style={styles.footerText}>Already have an account? </AppText>
        <Pressable onPress={onSwitchToLogin} hitSlop={8} accessibilityRole="button" accessibilityLabel="Login">
          <AppText style={styles.loginLink}>Login</AppText>
        </Pressable>
      </View>

      <AppText style={styles.terms}>
        Staff and organizer accounts require administrator approval before signing in.
      </AppText>

      {/* Dynamic Academic Select Modals */}
      <SelectPickerModal
        visible={showFacultyPicker}
        title="Select Faculty"
        options={faculties}
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
        options={departments}
        selectedValue={values.department}
        onSelect={(val) => onChange("department", val)}
        onClose={() => setShowDepartmentPicker(false)}
        searchPlaceholder="Search department..."
      />

      <SelectPickerModal
        visible={showLevelPicker}
        title="Select Academic Level"
        options={levels}
        selectedValue={values.level}
        onSelect={(val) => onChange("level", val)}
        onClose={() => setShowLevelPicker(false)}
        searchPlaceholder="Search level..."
      />
    </ScrollView>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: scale(16),
      paddingBottom: scale(22),
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(12),
    },
    brand: {
      color: colors.text,
      fontSize: ms(16),
      fontWeight: "800",
    },
    topSpacer: {
      width: scale(40),
    },
    title: {
      color: colors.text,
    },
    subtitle: {
      marginTop: scale(4),
      marginBottom: scale(16),
      color: colors.textMuted,
      fontSize: ms(14),
      fontWeight: "500",
    },
    segmentWrap: {
      height: scale(44),
      borderRadius: scale(12),
      backgroundColor: colors.surfaceSunken,
      padding: scale(4),
      flexDirection: "row",
      marginBottom: scale(20),
    },
    segmentButton: {
      flex: 1,
      borderRadius: scale(9),
      alignItems: "center",
      justifyContent: "center",
    },
    segmentButtonActive: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    segmentText: {
      color: colors.textMuted,
      fontSize: ms(14),
      fontWeight: "600",
    },
    segmentTextActive: {
      color: colors.text,
      fontWeight: "700",
    },
    row: {
      flexDirection: "row",
      gap: scale(10),
    },
    halfWidth: {
      flex: 1,
    },
    errorText: {
      marginTop: scale(2),
      marginBottom: scale(4),
      color: colors.error,
      fontSize: ms(12),
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: scale(10),
    },
    footerText: {
      color: colors.textMuted,
      fontSize: ms(14),
      fontWeight: "500",
    },
    loginLink: {
      color: colors.accent,
      fontSize: ms(14),
      fontWeight: "700",
    },
    terms: {
      textAlign: "center",
      color: colors.textSubtle,
      fontSize: ms(11),
      lineHeight: ms(16),
    },
  });
