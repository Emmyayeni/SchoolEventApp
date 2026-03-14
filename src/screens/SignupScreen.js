import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function SignupScreen({ values, errors, loading, onChange, onRegister, onSwitchToLogin }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const accountType = values?.accountType || "student";

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

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(10), paddingBottom: Math.max(insets?.bottom ?? 0, scale(22)) }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <Pressable style={styles.backButton} onPress={onSwitchToLogin}>
          <Ionicons name="arrow-back" size={18} color="#166534" />
        </Pressable>
        <Text style={[styles.brand, { color: colors.text }]}>NSUK Events</Text>
        <View style={styles.topSpacer} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
      <Text style={styles.subtitle}>Choose your role to access the right campus event tools.</Text>

      <View style={styles.segmentWrap}>
        <Pressable
          style={[styles.segmentButton, accountType === "student" && styles.segmentButtonActive]}
          onPress={() => switchAccountType("student")}
        >
          <Text style={[styles.segmentText, { color: colors.textMuted }, accountType === "student" && styles.segmentTextActive]}>Student</Text>
        </Pressable>
        <Pressable
          style={[styles.segmentButton, accountType === "staff" && styles.segmentButtonActive]}
          onPress={() => switchAccountType("staff")}
        >
          <Text style={[styles.segmentText, { color: colors.textMuted }, accountType === "staff" && styles.segmentTextActive]}>
            Staff / Organizer
          </Text>
        </Pressable>
      </View>

      <Field
        label="Full Name"
        value={values.fullName}
        onChangeText={(v) => onChange("fullName", v)}
        placeholder="John Doe"
        icon="person"
        error={errors.fullName}
      />

      <Field
        label="Email Address"
        value={values.email}
        onChangeText={(v) => onChange("email", v)}
        placeholder="name@nsuk.edu.ng"
        icon="mail"
        keyboardType="email-address"
        error={errors.email}
      />

      <Field
        label="Password"
        value={values.password}
        onChangeText={(v) => onChange("password", v)}
        placeholder="Min. 8 characters"
        icon="lock-closed"
        secureTextEntry={!showPassword}
        rightNode={
          <Pressable onPress={() => setShowPassword((p) => !p)} style={styles.eyeButton}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={16} color="#78a172" />
          </Pressable>
        }
        error={errors.password}
      />

      {accountType === "student" ? (
        <>
          <Field
            label="Matric Number"
            value={values.matricNumber}
            onChangeText={(v) => onChange("matricNumber", v)}
            placeholder="e.g 20/SCI/1234"
            error={errors.matricNumber}
          />
          <Field
            label="Faculty"
            value={values.faculty}
            onChangeText={(v) => onChange("faculty", v)}
            placeholder="e.g Faculty of Science"
            error={errors.faculty}
          />
          <Field
            label="Department"
            value={values.department}
            onChangeText={(v) => onChange("department", v)}
            placeholder="e.g Computer Science"
            error={errors.department}
          />
          <Field
            label="Level"
            value={values.level}
            onChangeText={(v) => onChange("level", v)}
            placeholder="e.g 100L"
            error={errors.level}
          />
        </>
      ) : (
        <>
          <Field
            label="Staff ID"
            value={values.staffId}
            onChangeText={(v) => onChange("staffId", v)}
            placeholder="e.g NSUK-STF-102"
            error={errors.staffId}
          />
          <Field
            label="Department / Unit"
            value={values.department}
            onChangeText={(v) => onChange("department", v)}
            placeholder="e.g ICT Unit"
            error={errors.department}
          />
          <Field
            label="Role / Designation"
            value={values.roleDesignation}
            onChangeText={(v) => onChange("roleDesignation", v)}
            placeholder="e.g Lecturer I"
            error={errors.roleDesignation}
          />
        </>
      )}

      {!!errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      <Pressable style={[styles.cta, loading && styles.ctaDisabled]} onPress={onRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.ctaText}>Create Account</Text>}
      </Pressable>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Pressable onPress={onSwitchToLogin}>
          <Text style={styles.loginLink}>Login</Text>
        </Pressable>
      </View>

      <Text style={styles.terms}>
        By clicking &quot;Create Account&quot;, you agree to NSUK&apos;s Terms of Service and Privacy Policy.
      </Text>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  rightIcon,
  rightNode,
  secureTextEntry,
  keyboardType,
  error,
  compact,
}) {
  return (
    <View style={[styles.field, compact && styles.fieldCompact]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {!!icon && <Ionicons name={icon} size={15} color="#78a172" style={styles.leftIcon} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8ea0b3"
          style={[styles.input, !!icon && styles.inputWithIcon, (!!rightIcon || !!rightNode) && styles.inputWithRight]}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {!!rightIcon && <Ionicons name={rightIcon} size={16} color="#78a172" style={styles.rightIcon} />}
        {!!rightNode && rightNode}
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
  backButton: {
    width: scale(26),
    height: scale(26),
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    color: "#1f2937",
    fontSize: ms(15),
    fontWeight: "800",
  },
  topSpacer: {
    width: scale(26),
  },
  title: {
    color: "#111827",
    fontSize: ms(28),
    fontWeight: "900",
    lineHeight: ms(34),
  },
  subtitle: {
    marginTop: scale(4),
    marginBottom: scale(12),
    color: "#2f9b59",
    fontSize: ms(13),
    fontWeight: "500",
  },
  segmentWrap: {
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#c7d4c8",
    padding: scale(3),
    flexDirection: "row",
    marginBottom: scale(12),
  },
  segmentButton: {
    flex: 1,
    borderRadius: scale(17),
    alignItems: "center",
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#f1f4f2",
  },
  segmentText: {
    color: "#517160",
    fontSize: ms(14),
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#0b7a24",
  },
  field: {
    marginBottom: scale(10),
  },
  fieldCompact: {
    marginBottom: 0,
  },
  label: {
    marginBottom: scale(5),
    color: "#1f2937",
    fontSize: ms(12),
    fontWeight: "700",
  },
  inputWrap: {
    height: scale(46),
    borderRadius: scale(23),
    borderWidth: 1,
    borderColor: "#c7d4c8",
    backgroundColor: "#f1f4f2",
    paddingHorizontal: scale(12),
    flexDirection: "row",
    alignItems: "center",
  },
  leftIcon: {
    marginRight: scale(8),
  },
  rightIcon: {
    marginLeft: scale(8),
  },
  input: {
    flex: 1,
    color: "#1f2937",
    fontSize: ms(13),
    paddingVertical: 0,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputWithRight: {
    paddingRight: scale(6),
  },
  row2: {
    flexDirection: "row",
    gap: scale(8),
    marginBottom: scale(10),
  },
  col2: {
    flex: 1,
  },
  eyeButton: {
    padding: scale(4),
  },
  errorText: {
    marginTop: scale(4),
    color: "#ef4444",
    fontSize: ms(11),
  },
  cta: {
    height: scale(50),
    borderRadius: scale(25),
    backgroundColor: "#007a08",
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(14),
    marginBottom: scale(12),
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: ms(16),
    fontWeight: "800",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scale(6),
  },
  footerText: {
    color: "#6b7280",
    fontSize: ms(13),
    fontWeight: "500",
  },
  loginLink: {
    color: "#0b7a24",
    fontSize: ms(13),
    fontWeight: "800",
  },
  terms: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: ms(10),
    lineHeight: ms(14),
  },
});