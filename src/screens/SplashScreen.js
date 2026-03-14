import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APP_NAME } from "../utils/constants";
import { hp, ms, scale } from "../utils/responsive";

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 3;
        if (next >= 75) {
          clearInterval(timer);
          return 75;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  const progressWidth = useMemo(() => `${Math.max(progress, 4)}%`, [progress]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + scale(8), paddingBottom: insets.bottom + scale(12) }]}>
      <View style={styles.ringTopLeft} />
      <View style={styles.ringBottom} />
      <View style={styles.diamondOutline} />

      <View style={styles.centerWrap}>
        <View style={styles.logoCardOuter}>
          <View style={styles.logoCardInner}>
            <Image source={require("../../assets/images/logo.png")} style={styles.logoImage} resizeMode="contain" />
          </View>
        </View>

        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>Stay updated with campus events</Text>
      </View>

      <View style={styles.loaderBlock}>
        <View style={styles.loaderRow}>
          <Text style={styles.loaderLabel}>Initializing campus portal...</Text>
          <Text style={styles.loaderPercent}>{progress}%</Text>
        </View>
        <View style={styles.loaderTrack}>
          <View style={[styles.loaderFill, { width: progressWidth }]} />
        </View>
      </View>

      <Text style={styles.footerText}>NASARAWA STATE UNIVERSITY, KEFFI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#007a08",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scale(20),
    overflow: "hidden",
  },
  ringTopLeft: {
    position: "absolute",
    width: scale(200),
    height: scale(200),
    borderRadius: scale(100),
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.10)",
    top: scale(-36),
    left: scale(-28),
  },
  ringBottom: {
    position: "absolute",
    width: scale(340),
    height: scale(340),
    borderRadius: scale(170),
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.10)",
    bottom: scale(-140),
    left: scale(-48),
  },
  diamondOutline: {
    position: "absolute",
    width: scale(84),
    height: scale(84),
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.12)",
    transform: [{ rotate: "45deg" }],
    top: hp(28),
    right: scale(70),
  },
  centerWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoCardOuter: {
    width: scale(166),
    height: scale(166),
    borderRadius: scale(30),
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  logoCardInner: {
    width: scale(126),
    height: scale(126),
    borderRadius: scale(22),
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImage: {
    width: "96%",
    height: "96%",
  },
  title: {
    marginTop: scale(28),
    color: "#f8fafc",
    fontSize: ms(38),
    fontWeight: "900",
  },
  subtitle: {
    marginTop: scale(6),
    color: "rgba(241, 245, 249, 0.95)",
    fontSize: ms(14),
    fontWeight: "500",
  },
  loaderBlock: {
    width: "100%",
    marginBottom: scale(8),
  },
  loaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(8),
  },
  loaderLabel: {
    color: "rgba(241, 245, 249, 0.95)",
    fontSize: ms(12),
    fontWeight: "700",
  },
  loaderPercent: {
    color: "#facc15",
    fontSize: ms(12),
    fontWeight: "900",
  },
  loaderTrack: {
    height: scale(6),
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#eab308",
  },
  footerText: {
    color: "rgba(226, 232, 240, 0.55)",
    fontSize: ms(9),
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: scale(4),
  },
});
