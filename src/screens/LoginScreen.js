import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { Field } from "../components/Field";
import CustomButton from "../components/CustomButton";
import { IconButton } from "../components/Header";
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
  onBack,
  onForgotPassword,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);

  const handleForgotPassword = () => {
    onForgotPassword?.(email);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        {onBack ? <IconButton name="arrow-back" label="Go back" onPress={onBack} color={colors.text} /> : <View style={styles.spacer} />}
        <AppText style={styles.logo}>NSUK Events</AppText>
        <View style={styles.spacer} />
      </View>

      <View style={styles.heroBlock}>
        <AppText variant="display" style={styles.welcome}>
          Welcome Back
        </AppText>
        <AppText style={styles.subTitle}>Login to your account to continue</AppText>
      </View>

      <Field
        label="Email Address"
        value={email}
        onChangeText={onChangeEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="example@nsuk.edu.ng"
        leftIcon="mail-outline"
        error={errors.email}
      />

      <Field
        label="Password"
        value={password}
        onChangeText={onChangePassword}
        autoCapitalize="none"
        secureTextEntry={!showPassword}
        placeholder="Enter your password"
        leftIcon="lock-closed-outline"
        error={errors.password}
        rightNode={
          <Pressable
            onPress={onTogglePassword}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color={colors.textSubtle} />
          </Pressable>
        }
      />

      {!!errors.general && <AppText style={styles.error}>{errors.general}</AppText>}

      <Pressable
        style={styles.forgotWrap}
        onPress={handleForgotPassword}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Forgot password"
      >
        <AppText style={styles.forgotLink}>Forgot password?</AppText>
      </Pressable>

      <CustomButton title="Login" onPress={onLogin} loading={loading} style={{ marginTop: scale(8) }} />

      <View style={styles.footer}>
        <AppText style={styles.footerText}>Don&apos;t have an account? </AppText>
        <Pressable onPress={onSwitchToSignup} hitSlop={8} accessibilityRole="button" accessibilityLabel="Sign up">
          <AppText style={styles.signupLink}>Sign Up</AppText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors, insets) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      paddingHorizontal: scale(20),
      paddingTop: (insets?.top ?? 0) + scale(8),
      paddingBottom: Math.max(insets?.bottom ?? 0, scale(20)),
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(16),
    },
    spacer: {
      width: scale(40),
    },
    logo: {
      fontSize: ms(18),
      fontWeight: "800",
      color: colors.text,
    },
    heroBlock: {
      marginTop: scale(4),
      marginBottom: scale(20),
    },
    welcome: {
      color: colors.text,
    },
    subTitle: {
      marginTop: scale(6),
      fontSize: ms(15),
      fontWeight: "500",
      color: colors.textMuted,
    },
    error: {
      color: colors.error,
      fontSize: ms(12),
      marginBottom: scale(8),
    },
    forgotWrap: {
      marginTop: scale(2),
      alignSelf: "flex-end",
    },
    forgotLink: {
      color: colors.accent,
      fontWeight: "600",
      fontSize: ms(13),
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
      marginVertical: scale(20),
    },
    divider: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
    },
    dividerText: {
      color: colors.textSubtle,
      fontSize: ms(13),
      fontWeight: "500",
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
    },
    signupLink: {
      color: colors.accent,
      fontWeight: "700",
      fontSize: ms(14),
    },
  });
