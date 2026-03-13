import { Ionicons } from "@expo/vector-icons";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function EventDetailsScreen({ event, isRegistered, registering, onRegister, onBack }) {
  const registerLabel = isRegistered ? "Registered" : registering ? "Registering..." : "Register Now";

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.topIconBtn}>
          <Ionicons name="arrow-back" size={18} color="#166534" />
        </Pressable>
        <Text style={styles.topTitle}>Event Details</Text>
        <View style={styles.topActions}>
          <Pressable style={styles.topIconBtn}>
            <Ionicons name="bookmark" size={14} color="#0b7a24" />
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

      <View style={styles.contentCard}>
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

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="calendar" size={14} color="#166534" />
          </View>
          <View>
            <Text style={styles.infoLabel}>Date & Time</Text>
            <Text style={styles.infoValue}>{formatEventDate(event.date)} • {event.time}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="location" size={14} color="#166534" />
          </View>
          <View>
            <Text style={styles.infoValue}>{event.venue}</Text>
            <Text style={styles.locationLink}>View location</Text>
          </View>
        </View>

        <View style={styles.registeredBar}>
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
          <Text style={styles.chip}>All Students</Text>
          <Text style={styles.chip}>Faculty Staff</Text>
          <Text style={styles.chip}>Tech Enthusiasts</Text>
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
    paddingBottom: 18,
  },
  topBar: {
    minHeight: 40,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e9ecea",
  },
  topIconBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: "#1f2937",
    fontSize: 13,
    fontWeight: "800",
  },
  topActions: {
    flexDirection: "row",
    gap: 2,
  },
  heroImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#cbd5e1",
  },
  contentCard: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 9,
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
    fontSize: 37,
    fontWeight: "900",
    lineHeight: 39,
    marginBottom: 8,
  },
  organizerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  organizerLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
  },
  organizerName: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "800",
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbe3de",
    backgroundColor: "#f3f5f4",
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e2ebe4",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
  },
  infoValue: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
  },
  locationLink: {
    marginTop: 1,
    color: "#166534",
    fontSize: 10,
    fontWeight: "800",
  },
  registeredBar: {
    borderRadius: 999,
    minHeight: 34,
    backgroundColor: "#f0f3f1",
    borderWidth: 1,
    borderColor: "#dbe3de",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  avatarsWrap: {
    flexDirection: "row",
  },
  avatarDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: -6,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  registeredText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "800",
  },
  statusText: {
    marginLeft: "auto",
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 5,
  },
  aboutText: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d9d4",
    backgroundColor: "#eef2ef",
    color: "#374151",
    fontSize: 11,
    fontWeight: "700",
  },
  agendaList: {
    gap: 8,
    marginBottom: 10,
  },
  agendaItem: {
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#d3ddd6",
  },
  agendaTime: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "900",
  },
  agendaTitle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 1,
  },
  agendaSubtitle: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 1,
  },
  footerBar: {
    marginHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#d5ddd8",
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "700",
  },
  priceValue: {
    color: "#166534",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 1,
  },
  registerButton: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: "#007a08",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
});