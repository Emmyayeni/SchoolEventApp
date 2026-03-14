import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";
export default function EventDetailsScreen({
  event,
  isRegistered,
  isBookmarked,
  registering,
  onRegister,
  onToggleBookmark,
  onBack,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const registerLabel = isRegistered ? "Registered" : registering ? "Registering..." : "Register Now";

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.pageContent, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.topIconBtn}>
          <Ionicons name="arrow-back" size={18} color="#166534" />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.text }]}>Event Details</Text>
        <View style={styles.topActions}>
          <Pressable style={styles.topIconBtn} onPress={onToggleBookmark}>
            <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={14} color="#0b7a24" />
          </Pressable>
          <Pressable
            style={styles.topIconBtn}
            onPress={() => Alert.alert("Share", "Share feature will be connected to native share API later.")}
          >
            <Ionicons name="share-social" size={14} color="#0b7a24" />
          </Pressable>
        </View>
      </View>

      <Image source={{ uri: event.image }} style={styles.heroImage} resizeMode="cover" />

      <View style={[styles.contentCard, { backgroundColor: colors.background }]}> 
        <View style={styles.badgeRow}>
          <Text style={[styles.badge, styles.badgeGreen]}>{event.category || "FACULTY OF SCIENCE"}</Text>
          <Text style={[styles.badge, styles.badgeYellow]}>TRENDING</Text>
        </View>

        <Text style={styles.eventTitle}>{event.title}</Text>

        <View style={styles.organizerRow}>
          <Ionicons name="person-circle-outline" size={14} color="#94a3b8" />
          <View>
            <Text style={styles.organizerLabel}>Organized by</Text>
            <Text style={styles.organizerName}>{event.organizer}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
          <View style={styles.infoIconWrap}>
            <Ionicons name="calendar" size={14} color="#166534" />
          </View>
          <View>
            <Text style={styles.infoLabel}>Date & Time</Text>
            <Text style={styles.infoValue}>{formatEventDate(event.date)} • {event.time}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
          <View style={styles.infoIconWrap}>
            <Ionicons name="location" size={14} color="#166534" />
          </View>
          <View>
            <Text style={styles.infoValue}>{event.venue}</Text>
            <Text style={styles.locationLink}>View location</Text>
          </View>
        </View>

        <View style={[styles.registeredBar, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
          <View style={styles.avatarsWrap}>
            <View style={[styles.avatarDot, { backgroundColor: "#dbeafe" }]} />
            <View style={[styles.avatarDot, { backgroundColor: "#fde68a" }]} />
            <View style={[styles.avatarDot, { backgroundColor: "#fecaca" }]} />
          </View>
          <Text style={styles.registeredText}>150+ registered</Text>
          <Text style={styles.statusText}>RSVP OPEN</Text>
        </View>

        <Text style={styles.sectionTitle}>About this event</Text>
        <Text style={styles.aboutText}>{event.description}</Text>

        <Text style={styles.sectionTitle}>Who can attend</Text>
        <View style={styles.chipRow}>
          <Text style={[styles.chip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            All Students
          </Text>
          <Text style={[styles.chip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            Faculty Staff
          </Text>
          <Text style={[styles.chip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            Tech Enthusiasts
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Event agenda</Text>
        <View style={styles.agendaList}>
          <AgendaItem
            time="10:00 AM - 10:30 AM"
            title="Opening Ceremony"
            subtitle="Welcome address by the Vice Chancellor."
          />
          <AgendaItem
            time="10:30 AM - 12:00 PM"
            title="Keynote: Future of AI"
            subtitle="Expert talk on Artificial General Intelligence."
          />
          <AgendaItem
            time="12:00 PM - 01:00 PM"
            title="Networking & Exhibition"
            subtitle="Interactive session and product showcases."
          />
        </View>
      </View>

      <View style={styles.footerBar}>
        <View>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>FREE</Text>
        </View>
        <Pressable
          style={[styles.registerButton, (isRegistered || registering) && styles.registerButtonDisabled]}
          onPress={onRegister}
          disabled={isRegistered || registering}
        >
          <Text style={styles.registerText}>{registerLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color="#ffffff" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function AgendaItem({ time, title, subtitle }) {
  return (
    <View style={styles.agendaItem}>
      <Text style={styles.agendaTime}>{time}</Text>
      <Text style={styles.agendaTitle}>{title}</Text>
      <Text style={styles.agendaSubtitle}>{subtitle}</Text>
    </View>
  );
}

function formatEventDate(dateText) {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) {
    return dateText;
  }
  const month = parsed.toLocaleString("en-US", { month: "short" });
  const day = parsed.getDate();
  const year = parsed.getFullYear();
  return `${month} ${day}, ${year}`;
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#e9ecea",
  },
  pageContent: {
    paddingBottom: scale(18),
  },
  topBar: {
    minHeight: scale(44),
    paddingHorizontal: scale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e9ecea",
  },
  topIconBtn: {
    width: scale(28),
    height: scale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: "#1f2937",
    fontSize: ms(14),
    fontWeight: "800",
  },
  topActions: {
    flexDirection: "row",
    gap: scale(4),
  },
  heroImage: {
    width: "100%",
    height: scale(160),
    backgroundColor: "#cbd5e1",
  },
  contentCard: {
    paddingHorizontal: scale(14),
    paddingTop: scale(12),
  },
  badgeRow: {
    flexDirection: "row",
    gap: scale(5),
    marginBottom: scale(8),
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    fontSize: ms(9),
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  badgeGreen: {
    backgroundColor: "#dcfce7",
    color: "#14532d",
  },
  badgeYellow: {
    backgroundColor: "#fef08a",
    color: "#854d0e",
  },
  eventTitle: {
    color: "#111827",
    fontSize: ms(24),
    fontWeight: "900",
    lineHeight: ms(30),
    marginBottom: scale(8),
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    marginBottom: scale(8),
  },
  organizerLabel: {
    color: "#94a3b8",
    fontSize: ms(11),
    fontWeight: "600",
  },
  organizerName: {
    color: "#166534",
    fontSize: ms(12),
    fontWeight: "800",
  },
  infoCard: {
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#dbe3de",
    backgroundColor: "#f3f5f4",
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    marginBottom: scale(8),
  },
  infoIconWrap: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: "#e2ebe4",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    color: "#94a3b8",
    fontSize: ms(10),
    fontWeight: "700",
  },
  infoValue: {
    color: "#111827",
    fontSize: ms(13),
    fontWeight: "800",
  },
  locationLink: {
    marginTop: scale(1),
    color: "#166534",
    fontSize: ms(11),
    fontWeight: "800",
  },
  registeredBar: {
    borderRadius: 999,
    minHeight: scale(36),
    backgroundColor: "#f0f3f1",
    borderWidth: 1,
    borderColor: "#dbe3de",
    paddingHorizontal: scale(12),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: scale(10),
  },
  avatarsWrap: {
    flexDirection: "row",
  },
  avatarDot: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    marginRight: -scale(6),
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  registeredText: {
    color: "#166534",
    fontSize: ms(11),
    fontWeight: "800",
  },
  statusText: {
    marginLeft: "auto",
    color: "#94a3b8",
    fontSize: ms(9),
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: ms(16),
    fontWeight: "900",
    marginBottom: scale(5),
  },
  aboutText: {
    color: "#475569",
    fontSize: ms(13),
    lineHeight: ms(20),
    marginBottom: scale(10),
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(6),
    marginBottom: scale(10),
  },
  chip: {
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d9d4",
    backgroundColor: "#eef2ef",
    color: "#374151",
    fontSize: ms(11),
    fontWeight: "700",
  },
  agendaList: {
    gap: scale(8),
    marginBottom: scale(10),
  },
  agendaItem: {
    paddingLeft: scale(10),
    borderLeftWidth: 2,
    borderLeftColor: "#d3ddd6",
  },
  agendaTime: {
    color: "#166534",
    fontSize: ms(11),
    fontWeight: "900",
  },
  agendaTitle: {
    color: "#111827",
    fontSize: ms(13),
    fontWeight: "800",
    marginTop: scale(1),
  },
  agendaSubtitle: {
    color: "#64748b",
    fontSize: ms(11),
    marginTop: scale(1),
  },
  footerBar: {
    marginHorizontal: scale(14),
    borderTopWidth: 1,
    borderTopColor: "#d5ddd8",
    paddingTop: scale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    color: "#94a3b8",
    fontSize: ms(10),
    fontWeight: "700",
  },
  priceValue: {
    color: "#166534",
    fontSize: ms(18),
    fontWeight: "900",
    marginTop: scale(1),
  },
  registerButton: {
    minHeight: scale(40),
    borderRadius: scale(20),
    backgroundColor: "#007a08",
    paddingHorizontal: scale(18),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerText: {
    color: "#ffffff",
    fontSize: ms(14),
    fontWeight: "800",
  },
});