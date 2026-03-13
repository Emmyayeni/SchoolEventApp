import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../theme/theme";

export default function SignupScreen({
  values,
  errors,
  loading,
  onChange,
  onRegister,
  onSwitchToLogin,
}) {
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors, isDark);
  const [accountType, setAccountType] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={onSwitchToLogin}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
        </Pressable>

        <Text style={styles.brand}>NSUK Events</Text>
        <View style={styles.spacer} />
      </View>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join the campus community and never miss an event.</Text>

      <View style={styles.segmentWrap}>
        <Pressable
          style={[styles.segmentOption, accountType === "student" && styles.segmentOptionActive]}
          onPress={() => setAccountType("student")}
        >
          <Text style={[styles.segmentText, accountType === "student" && styles.segmentTextActive]}>
            Student
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segmentOption, accountType === "staff" && styles.segmentOptionActive]}
          onPress={() => setAccountType("staff")}
        >
          <Text style={[styles.segmentText, accountType === "staff" && styles.segmentTextActive]}>
            Staff
          </Text>
        </Pressable>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputRow}>
          <Ionicons name="person" size={15} color="#78a172" />
          <TextInput
            value={values.fullName}
            onChangeText={(value) => onChange("fullName", value)}
            placeholder="John Doe"
            placeholderTextColor="#9aa7b8"
            style={styles.input}
          />
        </View>
        {!!errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputRow}>
          <Ionicons name="mail" size={15} color="#78a172" />
          <TextInput
            value={values.email}
            onChangeText={(value) => onChange("email", value)}
            placeholder="name@nsuk.edu.ng"
            placeholderTextColor="#9aa7b8"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>
        {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputRow}>
          <Ionicons name="call" size={15} color="#78a172" />
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="0801 234 5678"
            placeholderTextColor="#9aa7b8"
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.doubleFieldRow}>
        <View style={styles.doubleFieldItem}>
          <Text style={styles.label}>Department</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={values.department}
              onChangeText={(value) => onChange("department", value)}
              placeholder="Select"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
            />
            <Ionicons name="chevron-down" size={16} color="#78a172" />
          </View>
          {!!errors.department && <Text style={styles.error}>{errors.department}</Text>}
        </View>

        <View style={styles.doubleFieldItem}>
          <Text style={styles.label}>Level / Year</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={values.level}
              onChangeText={(value) => onChange("level", value)}
              placeholder="Select"
              placeholderTextColor={colors.textSubtle}
              style={styles.input}
            />
            <Ionicons name="chevron-down" size={16} color="#78a172" />
          </View>
          {!!errors.level && <Text style={styles.error}>{errors.level}</Text>}
        </View>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed" size={15} color="#78a172" />
          <TextInput
            value={values.password}
            onChangeText={(value) => onChange("password", value)}
            placeholder="Min. 8 characters"
            placeholderTextColor="#9aa7b8"
            secureTextEntry={!showPassword}
            style={styles.input}
          />
          <Pressable onPress={() => setShowPassword((prev) => !prev)} style={styles.iconButton}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={16} color="#78a172" />
          </Pressable>
        </View>
        {!!errors.password && <Text style={styles.error}>{errors.password}</Text>}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputRow}>
          <Ionicons name="refresh-circle" size={15} color="#78a172" />
          <TextInput
            value={values.confirmPassword}
            onChangeText={(value) => onChange("confirmPassword", value)}
            placeholder="Re-type password"
            placeholderTextColor="#9aa7b8"
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
          />
          <Pressable
            onPress={() => setShowConfirmPassword((prev) => !prev)}
            style={styles.iconButton}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={16}
              color="#78a172"
            />
          </Pressable>
        </View>
        {!!errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
      </View>

      {!!errors.general && <Text style={styles.error}>{errors.general}</Text>}

      <Pressable
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={onRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>Create Account</Text>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Pressable onPress={onSwitchToLogin}>
          <Text style={styles.link}>Login</Text>
        </Pressable>
      </View>

      <Text style={styles.termsText}>
        By clicking &quot;Create Account&quot;, you agree to NSUK&apos;s Terms of Service and Privacy Policy.
      </Text>
    </ScrollView>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.background : "#f2f5f3",
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 20,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    backButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    brand: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
    },
    spacer: {
      width: 28,
    },
    title: {
      color: colors.text,
      fontSize: 40,
      fontWeight: "900",
      marginBottom: 2,
    },
    subtitle: {
      color: "#2f9b59",
      fontSize: 18,
      marginBottom: 12,
      fontWeight: "500",
    },
    segmentWrap: {
      height: 40,
      borderRadius: 20,
      backgroundColor: "#ccdbcf",
      padding: 3,
      flexDirection: "row",
      marginBottom: 12,
    },
    segmentOption: {
      flex: 1,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentOptionActive: {
      backgroundColor: "#eef2ef",
    },
    segmentText: {
      color: "#4c7756",
      fontWeight: "700",
      fontSize: 15,
    },
    segmentTextActive: {
      color: "#0b7a24",
    },
    fieldWrap: {
      marginBottom: 8,
    },
    label: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 5,
    },
    inputRow: {
      height: 50,
      borderWidth: 1,
      borderColor: "#c4d4c8",
      borderRadius: 25,
      backgroundColor: isDark ? colors.surface : "#f6f8f6",
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 17,
      paddingVertical: 0,
    },
    doubleFieldRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 8,
    },
    doubleFieldItem: {
      flex: 1,
    },
    iconButton: {
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    error: {
      color: colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
    submitBtn: {
      marginTop: 8,
      height: 54,
      borderRadius: 999,
      backgroundColor: "#007a08",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    submitBtnDisabled: {
      opacity: 0.7,
    },
    submitBtnText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "800",
    },
    footer: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    footerText: {
      color: colors.textMuted,
      fontSize: 15,
    },
    link: {
      color: "#0b7a24",
      fontSize: 15,
      fontWeight: "800",
    },
    termsText: {
      marginTop: 10,
      color: colors.textSubtle,
      fontSize: 10,
      lineHeight: 14,
      textAlign: "center",
      paddingHorizontal: 8,
      marginBottom: 8,
    },
  });