import { Ionicons } from "@expo/vector-icons";
import { Image, PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { hp, ms, scale } from "../utils/responsive";

const slides = [
  {
    id: 1,
    title: "Discover Campus Events",
    highlightedWord: "Campus",
    description:
      "Find academic, social, sports, and faculty events in one place. Your university life, organized.",
    image: require("../../assets/images/1.png"),
  },
  {
    id: 2,
    title: "Get Instant\nNotifications",
    description: "Receive reminders and updates for important university events and deadlines.",
    image: require("../../assets/images/2.png"),
  },
  {
    id: 3,
    title: "Join and Participate",
    description:
      "RSVP, save events, and never miss campus activities. Build your network and make the most of your university experience.",
    badge: "COMMUNITY",
    image: require("../../assets/images/3.png"),
  },
];

export default function OnboardingScreen({ step, onNext, onPrev, onSkip, onGetStarted }) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark, insets);

  const slide = slides[step] || slides[0];
  const isLast = step === slides.length - 1;
  const isFirstSlide = slide.id === 1;
  const isSecondSlide = slide.id === 2;
  const isThirdSlide = slide.id === 3;
  const showBellBadge = slide.id === 2;
  const swipeThreshold = scale(40);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10,
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx <= -swipeThreshold) {
        if (isLast) {
          onGetStarted?.();
          return;
        }
        onNext?.();
        return;
      }

      if (gestureState.dx >= swipeThreshold && step > 0) {
        onPrev?.();
      }
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {isThirdSlide ? (
        <View style={styles.topRowThird}>
          <Pressable onPress={onPrev} style={styles.backTopBtn}>
            <Ionicons name="arrow-back" size={scale(18)} color={colors.text} />
          </Pressable>
          <Text style={styles.stepTopText}>STEP 3 OF 3</Text>
          <View style={styles.topSpacer} />
        </View>
      ) : (
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconWrap}>
              <Ionicons name="school" size={scale(12)} color={colors.primaryContrast} />
            </View>
            <Text style={styles.brandText}>UniHub</Text>
          </View>
          <Pressable onPress={onSkip}>
            <Text style={styles.skipTop}>Skip</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.imageWrap, isFirstSlide && styles.imageWrapFirst, isThirdSlide && styles.imageWrapThird]}>
        <Image source={slide.image} style={[styles.image]} />
        {showBellBadge && (
          <View style={styles.bellBadge}>
            <Ionicons name="notifications" size={scale(16)} color={colors.primaryContrast} />
          </View>
        )}
      </View>

      <View style={styles.textBlock}>
        {isThirdSlide && <Text style={styles.slideBadge}>{slide.badge}</Text>}
        {isFirstSlide ? (
          <Text style={[styles.title, styles.titleFirst]}>
            Discover <Text style={styles.titleAccent}>Campus</Text>
            {"\n"}
            Events
          </Text>
        ) : (
          <Text style={[styles.title, isSecondSlide && styles.titleSecond, isThirdSlide && styles.titleThird]}>
            {slide.title}
          </Text>
        )}
        <Text
          style={[
            styles.description,
            isFirstSlide && styles.descriptionFirst,
            isSecondSlide && styles.descriptionSecond,
            isThirdSlide && styles.descriptionThird,
          ]}
        >
          {slide.description}
        </Text>
      </View>

      <View style={styles.dotsRow}>
        {slides.map((item, idx) => (
          <View key={item.id} style={[styles.dot, idx === step && styles.dotActive]} />
        ))}
      </View>

      <Pressable style={styles.ctaButton} onPress={isLast ? onGetStarted : onNext}>
        <Text style={styles.ctaText}>{isLast || isFirstSlide ? "Get Started" : "Next"}</Text>
        <Ionicons name={isLast ? "rocket" : "arrow-forward"} size={scale(18)} color={colors.primaryContrast} />
      </Pressable>

      {isThirdSlide ? (
        <Pressable style={styles.remindWrap} onPress={onSkip}>
          <Text style={styles.remindText}>Remind me later</Text>
        </Pressable>
      ) : isSecondSlide ? (
        <View style={styles.remindWrap}>
          <Text style={styles.stepBottomText}>Step 2 of 3</Text>
        </View>
      ) : (
        <View style={styles.bottomBadge}>
          <Ionicons name="shield-checkmark" size={scale(13)} color={colors.textSubtle} />
          <Text style={styles.bottomBadgeText}>Official University Platform</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors, isDark, insets) =>
  StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: (insets?.top || 0) + scale(8),
    paddingBottom: Math.max(insets?.bottom || 0, scale(18)),
    justifyContent: "space-between",
    backgroundColor: isDark ? colors.background : colors.surface,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topRowThird: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backTopBtn: {
    width: scale(28),
    height: scale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  stepTopText: {
    color: colors.textMuted,
    fontSize: ms(12),
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  topSpacer: {
    width: scale(28),
    height: scale(28),
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
  },
  brandIconWrap: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: colors.primary,
    fontSize: ms(20),
    fontWeight: "800",
  },
  skipTop: {
    color: colors.primary,
    fontSize: ms(15),
    fontWeight: "700",
  },
  imageWrap: {
    marginTop: scale(14),
    width: "94%",
    alignSelf: "center",
    height: hp(34),
    minHeight: scale(225),
    maxHeight: scale(320),
    borderRadius: scale(22),
    padding: scale(4),
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
  },
  imageWrapFirst: {
    width: "100%",
    height: hp(31),
    minHeight: scale(210),
    maxHeight: scale(300),
    borderRadius: scale(22),
    backgroundColor: colors.surface,
  },
  imageWrapThird: {
    width: "98%",
    height: hp(50),
    minHeight: scale(340),
    maxHeight: scale(460),
    borderRadius: scale(24),
    backgroundColor: colors.surfaceAlt,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: scale(18),
  },
  textBlock: {
    marginTop: scale(10),
    alignItems: "center",
    paddingHorizontal: scale(6),
    gap: scale(10),
  },
  title: {
    fontSize: ms(38),
    fontWeight: "900",
    lineHeight: ms(46),
    letterSpacing: 0.2,
    textAlign: "center",
    color: colors.primary,
  },
  titleFirst: {
    color: colors.text,
    fontSize: ms(30),
    lineHeight: ms(38),
    letterSpacing: 0,
  },
  titleSecond: {
    color: colors.primary,
    fontSize: ms(30),
    lineHeight: ms(38),
    letterSpacing: 0,
  },
  titleAccent: {
    color: colors.primary,
  },
  titleThird: {
    color: colors.text,
    fontSize: ms(44),
    lineHeight: ms(52),
    letterSpacing: 0,
    maxWidth: "96%",
  },
  bellBadge: {
    position: "absolute",
    right: scale(10),
    top: scale(10),
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  description: {
    maxWidth: "92%",
    fontSize: ms(18),
    lineHeight: ms(28),
    textAlign: "center",
    color: colors.textMuted,
    fontWeight: "600",
  },
  descriptionFirst: {
    fontSize: ms(16),
    lineHeight: ms(24),
    color: colors.textMuted,
    maxWidth: "96%",
    fontWeight: "700",
  },
  descriptionSecond: {
    fontSize: ms(16),
    lineHeight: ms(24),
    color: colors.textMuted,
    maxWidth: "92%",
    fontWeight: "700",
  },
  descriptionThird: {
    color: colors.textMuted,
    fontSize: ms(16),
    lineHeight: ms(24),
    maxWidth: "95%",
    fontWeight: "700",
  },
  slideBadge: {
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    color: colors.accent,
    fontSize: ms(10),
    fontWeight: "900",
    letterSpacing: 1.2,
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    overflow: "hidden",
  },
  dotsRow: {
    flexDirection: "row",
    marginTop: scale(12),
    gap: scale(8),
    justifyContent: "center",
  },
  dot: {
    width: scale(10),
    height: scale(10),
    borderRadius: 999,
    backgroundColor: colors.borderSoft,
  },
  dotActive: {
    width: scale(30),
    backgroundColor: colors.primary,
  },
  ctaButton: {
    marginTop: scale(12),
    minHeight: scale(52),
    borderRadius: 999,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(8),
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaText: {
    color: colors.primaryContrast,
    fontSize: ms(18),
    fontWeight: "800",
  },
  bottomBadge: {
    marginTop: scale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
  },
  bottomBadgeText: {
    color: colors.textSubtle,
    fontSize: ms(12),
    fontWeight: "600",
  },
  remindWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: scale(22),
  },
  remindText: {
    color: colors.textSubtle,
    fontSize: ms(13),
    fontWeight: "700",
  },
  stepBottomText: {
    color: colors.textSubtle,
    fontSize: ms(12),
    fontWeight: "700",
  },
  });
