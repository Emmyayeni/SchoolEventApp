import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";
export default function EventDetailsScreen({
  event,
  isRegistered,
  isBookmarked,
  registering,
  canManageEvent,
  deletingEvent,
  onRegister,
  onToggleBookmark,
  onEditEvent,
  onDeleteEvent,
  onBack,
}) {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
  const insets = useSafeAreaInsets();
  const registerLabel = isRegistered ? "Registered" : registering ? "Registering..." : "Register Now";
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const eventStatus = useMemo(() => getEventTimeStatus(event, nowTs), [event, nowTs]);
  const audienceLabels = useMemo(() => getAudienceLabels(event?.targetAudience), [event?.targetAudience]);
  const registeredUsers = useMemo(() => {
    if (!Array.isArray(event?.registeredUsers)) {
      return [];
    }
    return event.registeredUsers.slice(0, 3);
  }, [event?.registeredUsers]);
  const registrationSummary = useMemo(() => {
    const count = Number(event?.registeredCount);
    if (!Number.isFinite(count) || count < 0) {
      return "No registrations yet";
    }

    const capacity = Number(event?.capacity);
    if (Number.isFinite(capacity) && capacity > 0) {
      return `${count} registered • ${Math.max(capacity - count, 0)} spots left`;
    }

    return `${count} registered`;
  }, [event?.capacity, event?.registeredCount]);

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.pageContent, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.topIconBtn}>
          <Ionicons name="arrow-back" size={18} color={colors.accent} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.text }]}>Event Details</Text>
        <View style={styles.topActions}>
          <Pressable style={styles.topIconBtn} onPress={onToggleBookmark}>
            <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={14} color={colors.primary} />
          </Pressable>
          {canManageEvent && (
            <Pressable style={styles.topIconBtn} onPress={onEditEvent}>
              <Ionicons name="create-outline" size={14} color={colors.primary} />
            </Pressable>
          )}
          {canManageEvent && (
            <Pressable style={styles.topIconBtn} onPress={onDeleteEvent} disabled={deletingEvent}>
              <Ionicons name="trash-outline" size={14} color={colors.error} />
            </Pressable>
          )}
          <Pressable
            style={styles.topIconBtn}
            onPress={() => Alert.alert("Share", "Share feature will be connected to native share API later.")}
          >
            <Ionicons name="share-social" size={14} color={colors.primary} />
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
          <Ionicons name="person-circle-outline" size={14} color={colors.textSubtle} />
          <View>
            <Text style={styles.organizerLabel}>Organized by</Text>
            <Text style={styles.organizerName}>{event.organizer}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
          <View style={styles.infoIconWrap}>
            <Ionicons name="calendar" size={14} color={colors.accent} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Date & Time</Text>
            <Text style={styles.infoValue}>{formatEventDate(event.date)} • {event.time}</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
          <View style={styles.infoIconWrap}>
            <Ionicons name="location" size={14} color={colors.accent} />
          </View>
          <View>
            <Text style={styles.infoValue}>{event.venue}</Text>
            <Text style={styles.locationLink}>View location</Text>
          </View>
        </View>

        <View style={[styles.registeredBar, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
          <View style={styles.avatarsWrap}>
            {registeredUsers.map((person, index) => (
              <View key={`${person.id}-${index}`} style={styles.avatarDot}>
                {person.avatar ? (
                  <Image source={{ uri: person.avatar }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt }]}> 
                    <Ionicons name="person" size={10} color={colors.textMuted} />
                  </View>
                )}
              </View>
            ))}
          </View>
          <Text style={styles.registeredText}>{registrationSummary}</Text>
          <Text style={styles.statusText}>{eventStatus}</Text>
        </View>

        <Text style={styles.sectionTitle}>About this event</Text>
        <Text style={styles.aboutText}>{event.description}</Text>

        <Text style={styles.sectionTitle}>Who can attend</Text>
        <View style={styles.chipRow}>
          {audienceLabels.map((label) => (
            <Text key={label} style={[styles.chip, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              {label}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Event agenda</Text>
        <View style={styles.agendaList}>
          <AgendaItem
            time="10:00 AM - 10:30 AM"
            title="Opening Ceremony"
            subtitle="Welcome address by the Vice Chancellor."
            styles={styles}
          />
          <AgendaItem
            time="10:30 AM - 12:00 PM"
            title="Keynote: Future of AI"
            subtitle="Expert talk on Artificial General Intelligence."
            styles={styles}
          />
          <AgendaItem
            time="12:00 PM - 01:00 PM"
            title="Networking & Exhibition"
            subtitle="Interactive session and product showcases."
            styles={styles}
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
          <Ionicons name="arrow-forward" size={14} color={colors.primaryContrast} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function AgendaItem({ time, title, subtitle, styles }) {
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

function parseEventStartDateTime(dateText, timeText) {
  if (!dateText) {
    return null;
  }

  const baseDate = new Date(dateText);
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const rawTime = String(timeText || "").trim();
  if (!rawTime) {
    return start;
  }

  const twelveHour = rawTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2]);
    const period = twelveHour[3].toUpperCase();

    if (period === "PM" && hour < 12) {
      hour += 12;
    }
    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    start.setHours(hour, minute, 0, 0);
    return start;
  }

  const twentyFourHour = rawTime.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (twentyFourHour) {
    const hour = Number(twentyFourHour[1]);
    const minute = Number(twentyFourHour[2]);
    start.setHours(hour, minute, 0, 0);
    return start;
  }

  return start;
}

function getEventTimeStatus(event, nowTimestamp) {
  const start = parseEventStartDateTime(event?.date, event?.time);
  if (!start) {
    return "UPCOMING";
  }

  const hasTime = !!String(event?.time || "").trim();
  const end = new Date(start);
  if (hasTime) {
    // Default duration when end time is not stored.
    end.setHours(end.getHours() + 2);
  } else {
    end.setDate(end.getDate() + 1);
  }

  const now = new Date(nowTimestamp);
  if (now < start) {
    return "UPCOMING";
  }
  if (now >= end) {
    return "PAST";
  }
  return "ONGOING";
}

function getAudienceLabels(targetAudience) {
  const value = String(targetAudience || "all").toLowerCase();
  if (value === "students") {
    return ["Students"];
  }
  if (value === "staff") {
    return ["Faculty Staff"];
  }
  return ["All Students", "Faculty Staff"];
}

const getStyles = (colors) =>
  StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
  },
  topIconBtn: {
    width: scale(28),
    height: scale(28),
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: colors.text,
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
    backgroundColor: colors.border,
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
    backgroundColor: colors.surfaceAlt,
    color: colors.accent,
  },
  badgeYellow: {
    backgroundColor: colors.surface,
    color: colors.textMuted,
  },
  eventTitle: {
    color: colors.text,
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
    color: colors.textSubtle,
    fontSize: ms(11),
    fontWeight: "600",
  },
  organizerName: {
    color: colors.accent,
    fontSize: ms(12),
    fontWeight: "800",
  },
  infoCard: {
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    color: colors.textSubtle,
    fontSize: ms(10),
    fontWeight: "700",
  },
  infoValue: {
    color: colors.text,
    fontSize: ms(13),
    fontWeight: "800",
  },
  locationLink: {
    marginTop: scale(1),
    color: colors.accent,
    fontSize: ms(11),
    fontWeight: "800",
  },
  registeredBar: {
    borderRadius: 999,
    minHeight: scale(36),
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingHorizontal: scale(12),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8),
    marginBottom: scale(10),
  },
  avatarsWrap: {
    flexDirection: "row",
    minWidth: scale(20),
  },
  avatarDot: {
    width: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    overflow: "hidden",
    marginRight: -scale(6),
    borderWidth: 1,
    borderColor: colors.primaryContrast,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  registeredText: {
    color: colors.accent,
    fontSize: ms(11),
    fontWeight: "800",
  },
  statusText: {
    marginLeft: "auto",
    color: colors.textSubtle,
    fontSize: ms(9),
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: ms(16),
    fontWeight: "900",
    marginBottom: scale(5),
  },
  aboutText: {
    color: colors.textMuted,
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
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    color: colors.textMuted,
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
    borderLeftColor: colors.border,
  },
  agendaTime: {
    color: colors.accent,
    fontSize: ms(11),
    fontWeight: "900",
  },
  agendaTitle: {
    color: colors.text,
    fontSize: ms(13),
    fontWeight: "800",
    marginTop: scale(1),
  },
  agendaSubtitle: {
    color: colors.textSubtle,
    fontSize: ms(11),
    marginTop: scale(1),
  },
  footerBar: {
    marginHorizontal: scale(14),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: scale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    color: colors.textSubtle,
    fontSize: ms(10),
    fontWeight: "700",
  },
  priceValue: {
    color: colors.accent,
    fontSize: ms(18),
    fontWeight: "900",
    marginTop: scale(1),
  },
  registerButton: {
    minHeight: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.primary,
    paddingHorizontal: scale(18),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerText: {
    color: colors.primaryContrast,
    fontSize: ms(14),
    fontWeight: "800",
  },
  });