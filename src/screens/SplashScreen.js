import { ActivityIndicator, Image, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../components/AppText";
import { BRAND_GREEN, useAppTheme } from "../theme/theme";
import { APP_NAME } from "../utils/constants";

export default function SplashScreen() {
  const { isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const background = isDark ? BRAND_GREEN : "#ffffff";
  const foreground = isDark ? "#ffffff" : BRAND_GREEN;
  return <View style={[styles.page, { backgroundColor: background, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) }]}>
    <StatusBar style={isDark ? "light" : "dark"} backgroundColor={background} />
    <View style={styles.center}>
      <Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" accessibilityLabel="Nasarawa State University logo" />
      <AppText style={[styles.title, { color: foreground }]}>{APP_NAME}</AppText>
      <AppText style={[styles.subtitle, { color: foreground }]}>Your campus, connected.</AppText>
      <ActivityIndicator style={styles.loader} size="large" color={foreground} accessibilityLabel="Loading NSUK Events" />
    </View>
    <AppText style={[styles.footer, { color: foreground }]}>NASARAWA STATE UNIVERSITY, KEFFI</AppText>
  </View>;
}
const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 24, alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", width: "100%" },
  logo: { width: 168, height: 168 },
  title: { fontSize: 30, fontWeight: "700", marginTop: 24, textAlign: "center" },
  subtitle: { fontSize: 16, marginTop: 8, textAlign: "center" },
  loader: { marginTop: 32 },
  footer: { fontSize: 10, letterSpacing: 1, textAlign: "center" },
});
