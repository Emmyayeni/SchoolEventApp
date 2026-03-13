import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/theme";

const slides = [
  {
    id: 1,
    title: "Discover Campus Events",
    highlightedWord: "Campus",
    description:
      "Find academic, social, sports, and faculty events in one place. Your university life, organized.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 2,
    title: "Register Easily",
    highlightedWord: "Easily",
    description: "Join events with one tap and keep track of your attendance from your dashboard.",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: 3,
    title: "Stay Updated",
    highlightedWord: "Updated",
    description: "Receive reminders and updates for upcoming events.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
  },
];

export default function OnboardingScreen({ step, onNext, onSkip, onGetStarted }) {
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors, isDark);

  const slide = slides[step] || slides[0];
  const isLast = step === slides.length - 1;
  const [firstChunk, secondChunk = ""] = slide.title.split(" ");

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconWrap}>
            <Ionicons name="school" size={12} color="#ffffff" />
          </View>
          <Text style={styles.brandText}>CampusPulse</Text>
        </View>
        <Pressable onPress={onSkip}>
          <Text style={styles.skipTop}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.imageWrap}>
        <Image source={{ uri: slide.image }} style={styles.image} />
      </View>

      <Text style={styles.title}>
        {firstChunk} <Text style={styles.titleAccent}>{slide.highlightedWord || secondChunk}</Text>
        {slide.highlightedWord ? "\nEvents" : ""}
      </Text>
      <Text style={styles.description}>{slide.description}</Text>

      <View style={styles.dotsRow}>
        {slides.map((item, idx) => (
          <View key={item.id} style={[styles.dot, idx === step && styles.dotActive]} />
        ))}
      </View>

      <Pressable style={styles.ctaButton} onPress={isLast ? onGetStarted : onNext}>
        <Text style={styles.ctaText}>{isLast ? "Get Started" : "Get Started"}</Text>
        <Ionicons name="arrow-forward" size={18} color="#ffffff" />
      </Pressable>

      <View style={styles.bottomBadge}>
        <Ionicons name="shield-checkmark" size={13} color={colors.textSubtle} />
        <Text style={styles.bottomBadgeText}>Official University Platform</Text>
      </View>
    </View>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    justifyContent: "space-between",
    backgroundColor: isDark ? colors.background : "#f2f5f3",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0b7a24",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: "#0b7a24",
    fontSize: 24,
    fontWeight: "800",
  },
  skipTop: {
    color: "#0b7a24",
    fontSize: 28,
    fontWeight: "700",
  },
  imageWrap: {
    marginTop: 18,
    height: 290,
    borderRadius: 24,
    padding: 4,
    backgroundColor: "#d8e8dc",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  title: {
    marginTop: 20,
    fontSize: 58,
    fontWeight: "900",
    lineHeight: 64,
    textAlign: "center",
    color: colors.text,
  },
  titleAccent: {
    color: "#0b7a24",
  },
  description: {
    marginTop: 14,
    fontSize: 35,
    lineHeight: 46,
    textAlign: "center",
    color: colors.textMuted,
  },
  dotsRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#cde0d1",
  },
  dotActive: {
    width: 34,
    backgroundColor: "#0b7a24",
  },
  ctaButton: {
    marginTop: 20,
    height: 66,
    borderRadius: 999,
    backgroundColor: "#007a08",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
  },
  bottomBadge: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bottomBadgeText: {
    color: colors.textSubtle,
    fontSize: 24,
    fontWeight: "600",
  },
  });
