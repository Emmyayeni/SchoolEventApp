import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppTheme } from "../theme/theme";

export default function LoginScreen({
  email,
  password,
  showPassword,
  errors,
  loading,
  onChangeEmail,
  onChangePassword,
  onTogglePassword,
  onLogin,
  onSwitchToSignup,
  onBack,
}) {
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.logo}>NSUK Events</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.heroBlock}>
        <Text style={styles.welcome}>Welcome Back</Text>
        <Text style={styles.subTitle}>Login to your account to continue</Text>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          value={email}
          onChangeText={onChangeEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="example@nsuk.edu.ng"
          placeholderTextColor={colors.textSubtle}
          style={styles.input}
        />
        {!!errors.email && <Text style={styles.error}>{errors.email}</Text>}
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            value={password}
            onChangeText={onChangePassword}
            secureTextEntry={!showPassword}
            placeholder="Enter your password"
            placeholderTextColor={colors.textSubtle}
            style={styles.passwordInput}
          />
          <Pressable onPress={onTogglePassword} style={styles.eyeBtn}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#0b7a24" />
          </Pressable>
        </View>
        {!!errors.password && <Text style={styles.error}>{errors.password}</Text>}
      </View>

      {!!errors.general && <Text style={styles.error}>{errors.general}</Text>}

      <Pressable style={styles.forgotWrap}>
        <Text style={styles.forgotLink}>Forgot password?</Text>
      </Pressable>

      <Pressable style={styles.loginBtn} onPress={onLogin} disabled={loading}>
        <Text style={styles.loginBtnText}>{loading ? "Logging in..." : "Login"}</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.divider} />
      </View>

      <Pressable style={styles.googleBtn}>
        <Ionicons name="logo-google" size={18} color="#ea4335" />
        <Text style={styles.googleText}>Sign in with Google</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Pressable onPress={onSwitchToSignup}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? colors.background : "#f2f5f3",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: {
    width: 28,
  },
  logo: {
    fontSize: 31,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  heroBlock: {
    marginTop: 4,
    marginBottom: 22,
  },
  welcome: {
    fontSize: 50,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 54,
  },
  subTitle: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: "700",
    color: "#0b7a24",
  },
  fieldWrap: {
    marginBottom: 12,
  },
  label: {
    fontSize: 27,
    color: colors.text,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c9d8cc",
    color: colors.text,
    borderRadius: 999,
    height: 66,
    paddingHorizontal: 16,
    fontSize: 26,
    backgroundColor: isDark ? colors.surface : "#f8faf9",
  },
  passwordRow: {
    borderWidth: 1,
    borderColor: "#c9d8cc",
    borderRadius: 999,
    height: 66,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: isDark ? colors.surface : "#f8faf9",
  },
  passwordInput: {
    flex: 1,
    fontSize: 26,
    color: colors.text,
  },
  eyeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginTop: 5,
  },
  forgotWrap: {
    marginTop: 6,
    alignSelf: "flex-end",
  },
  forgotLink: {
    color: "#0b7a24",
    fontWeight: "700",
    fontSize: 23,
  },
  loginBtn: {
    height: 64,
    borderRadius: 999,
    marginTop: 18,
    backgroundColor: "#007a08",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#d8e0da",
  },
  dividerText: {
    color: colors.textSubtle,
    fontSize: 20,
    fontWeight: "600",
  },
  googleBtn: {
    marginTop: 16,
    height: 62,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#d5dce0",
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleText: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 30,
  },
  footer: {
    marginTop: "auto",
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 30,
    fontWeight: "500",
  },
  signupLink: {
    color: "#0b7a24",
    fontWeight: "800",
    fontSize: 30,
  },
  });
