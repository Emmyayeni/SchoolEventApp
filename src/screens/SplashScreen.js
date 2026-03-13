import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/theme";
import { APP_NAME, SLOGAN } from "../utils/constants";

export default function SplashScreen() {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>NE</Text>
      </View>
      <Text style={styles.title}>{APP_NAME}</Text>
      <Text style={styles.subtitle}>{SLOGAN}</Text>
      <ActivityIndicator size="small" color={colors.text} style={styles.loader} />
    </View>
  );
}

const getStyles = (colors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.primaryContrast,
    fontSize: 30,
    fontWeight: "800",
  },
  title: {
    marginTop: 16,
    fontSize: 28,
    color: colors.text,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
  loader: {
    marginTop: 26,
  },
  });
