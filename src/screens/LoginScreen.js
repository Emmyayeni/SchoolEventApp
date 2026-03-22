import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

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
  onBack = () => {},
}) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark, insets);

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
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color={colors.primary} />
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
        <Ionicons name="logo-google" size={18} color={colors.error} />
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

const getStyles = (colors, isDark, insets) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: scale(20),
    paddingTop: (insets?.top ?? 0) + scale(16),
    paddingBottom: Math.max(insets?.bottom ?? 0, scale(20)),
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(20),
  },
  backBtn: {
    width: scale(28),
    height: scale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  spacer: {
    width: scale(28),
  },
  logo: {
    fontSize: ms(20),
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  heroBlock: {
    marginTop: scale(4),
    marginBottom: scale(18),
  },
  welcome: {
    fontSize: ms(30),
    fontWeight: "900",
    color: colors.text,
    lineHeight: ms(36),
  },
  subTitle: {
    marginTop: scale(6),
    fontSize: ms(15),
    fontWeight: "700",
    color: colors.primary,
  },
  fieldWrap: {
    marginBottom: scale(12),
  },
  label: {
    fontSize: ms(14),
    color: colors.text,
    fontWeight: "700",
    marginBottom: scale(6),
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    color: colors.text,
    borderRadius: 999,
    height: scale(50),
    paddingHorizontal: scale(16),
    fontSize: ms(15),
    backgroundColor: isDark ? colors.surface : colors.surfaceAlt,
  },
  passwordRow: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 999,
    height: scale(50),
    paddingHorizontal: scale(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: isDark ? colors.surface : colors.surfaceAlt,
  },
  passwordInput: {
    flex: 1,
    fontSize: ms(15),
    color: colors.text,
  },
  eyeBtn: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: colors.error,
    fontSize: ms(12),
    marginTop: scale(4),
  },
  forgotWrap: {
    marginTop: scale(6),
    alignSelf: "flex-end",
  },
  forgotLink: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: ms(13),
  },
  loginBtn: {
    height: scale(52),
    borderRadius: 999,
    marginTop: scale(16),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginBtnText: {
    color: colors.primaryContrast,
    fontSize: ms(17),
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    marginTop: scale(20),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surfaceAlt,
  },
  dividerText: {
    color: colors.textSubtle,
    fontSize: ms(13),
    fontWeight: "600",
  },
  googleBtn: {
    marginTop: scale(14),
    height: scale(50),
    borderRadius: scale(22),
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(10),
  },
  googleText: {
    color: colors.border,
    fontWeight: "700",
    fontSize: ms(14),
  },
  footer: {
    marginTop: "auto",
    marginBottom: scale(6),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: colors.textMuted,
    fontSize: ms(14),
    fontWeight: "500",
  },
  signupLink: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: ms(14),
  },
  });
