import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { APP_NAME } from "../utils/constants";
import { hp, ms, scale } from "../utils/responsive";

// Splash is a fixed brand moment — a deep ink background in BOTH themes. It must
// NOT follow the palette: with the Ink palette, colors.primary flips to near-white
// in dark mode, which would make the white-alpha rings/text vanish. So it uses a
// self-contained fixed palette instead of theme tokens.
const INK = "#111827";
const WHITE = "#ffffff";
const ACCENT = "#6366f1";

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
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + scale(8), paddingBottom: Math.max(insets.bottom, scale(8)) },
      ]}
    >
      <View style={styles.ringTopLeft} />
      <View style={styles.ringBottom} />
      <View style={styles.diamondOutline} />

      <View style={styles.centerWrap}>
        <View style={styles.logoCardOuter}>
          <View style={styles.logoCardInner}>
            <Image source={require("../../assets/images/logo.png")} style={styles.logoImage} resizeMode="contain" />
          </View>
        </View>

        <AppText style={styles.title}>{APP_NAME}</AppText>
        <AppText style={styles.subtitle}>Stay updated with campus events</AppText>
      </View>

      <View style={styles.loaderBlock}>
        <View style={styles.loaderRow}>
          <AppText style={styles.loaderLabel}>Initializing campus portal...</AppText>
          <AppText style={styles.loaderPercent}>{progress}%</AppText>
        </View>
        <View style={styles.loaderTrack}>
          <View style={[styles.loaderFill, { width: progressWidth }]} />
        </View>
      </View>

      <AppText style={styles.footerText}>NASARAWA STATE UNIVERSITY, KEFFI</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: INK,
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
    borderColor: "rgba(255,255,255,0.08)",
    top: scale(-36),
    left: scale(-28),
  },
  ringBottom: {
    position: "absolute",
    width: scale(340),
    height: scale(340),
    borderRadius: scale(170),
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.08)",
    bottom: scale(-140),
    left: scale(-48),
  },
  diamondOutline: {
    position: "absolute",
    width: scale(84),
    height: scale(84),
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
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
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoCardInner: {
    width: scale(126),
    height: scale(126),
    borderRadius: scale(22),
    backgroundColor: WHITE,
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
    color: WHITE,
    fontSize: ms(38),
    fontWeight: "900",
  },
  subtitle: {
    marginTop: scale(6),
    color: "rgba(255,255,255,0.75)",
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
    color: "rgba(255,255,255,0.75)",
    fontSize: ms(12),
    fontWeight: "700",
  },
  loaderPercent: {
    color: WHITE,
    fontSize: ms(12),
    fontWeight: "900",
  },
  loaderTrack: {
    height: scale(6),
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: ACCENT,
  },
  footerText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: ms(9),
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: scale(4),
  },
});
