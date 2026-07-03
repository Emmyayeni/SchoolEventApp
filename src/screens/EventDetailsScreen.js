import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, Share } from "react-native";
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
  const { colors, mode } = useAppTheme();
  const isDark = mode === "dark";
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();
  const [nowTs, setNowTs] = useState(Date.now());
  
  const eventStatus = useMemo(() => getEventTimeStatus(event, nowTs), [event, nowTs]);
  const isPast = eventStatus === "PAST";
  
  const capacity = Number(event?.capacity);
  const count = Number(event?.registeredCount);
  const isFull = Number.isFinite(capacity) && capacity > 0 && count >= capacity;

  let registerLabel = "Register Now";
  if (isPast) {
    registerLabel = "Event Ended";
  } else if (isFull && !isRegistered) {
    registerLabel = "Sold Out";
  } else if (isRegistered) {
    registerLabel = "Registered";
  } else if (registering) {
    registerLabel = "Registering...";
  }

  const isRegistrationDisabled = isPast || isRegistered || registering || (isFull && !isRegistered);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTs(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title}\nDate: ${formatEventDate(event.date)}\nVenue: ${event.venue}`,
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const audienceLabels = useMemo(() => getAudienceLabels(event?.targetAudience), [event?.targetAudience]);
  const registeredUsers = useMemo(() => {
    if (!Array.isArray(event?.registeredUsers)) return [];
    return event.registeredUsers.slice(0, 3);
  }, [event?.registeredUsers]);
  
  const registrationSummary = useMemo(() => {
    const count = Number(event?.registeredCount);
    if (!Number.isFinite(count) || count < 0) return "No registrations yet";
    const capacity = Number(event?.capacity);
    if (Number.isFinite(capacity) && capacity > 0) {
      return `${count} registered • ${Math.max(capacity - count, 0)} spots left`;
    }
    return `${count} registered`;
  }, [event?.capacity, event?.registeredCount]);

  return (
    <View style={styles.page}>
      {/* Absolute Edge-to-Edge Header */}
      <View style={styles.absoluteHeader}>
        <Image source={{ uri: event.image }} style={styles.absoluteImage} resizeMode="cover" />
        <View style={styles.absoluteOverlay} />
      </View>

      {/* Floating Top Actions */}
      <View style={[styles.topBarAbsolute, { top: Math.max(insets.top, scale(12)) }]}>
        <Pressable onPress={onBack} style={styles.glassBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
        <View style={styles.topActionsRight}>
          <Pressable style={styles.glassBtn} onPress={onToggleBookmark}>
            <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={18} color="#fff" />
          </Pressable>
          {canManageEvent && (
            <Pressable style={styles.glassBtn} onPress={onEditEvent}>
              <Ionicons name="create-outline" size={18} color="#fff" />
            </Pressable>
          )}
          {canManageEvent && (
            <Pressable style={styles.glassBtn} onPress={onDeleteEvent} disabled={deletingEvent}>
              <Ionicons name="trash-outline" size={18} color="#ff4444" />
            </Pressable>
          )}
          <Pressable style={styles.glassBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Scrollable Content overlapping the image */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: scale(220), paddingBottom: scale(140) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContentSheet}>
          <View style={styles.badgeRow}>
            <Text style={[styles.badge, styles.badgeGreen]}>{event.category || "CAMPUS EVENT"}</Text>
            {eventStatus === "ONGOING" && <Text style={[styles.badge, styles.badgeLive]}>LIVE</Text>}
          </View>

          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.organizerRow}>
            <View style={styles.organizerIconWrap}>
              <Ionicons name="person" size={12} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.organizerLabel}>Organized by</Text>
              <Text style={styles.organizerName}>{event.organizer}</Text>
            </View>
          </View>

          <View style={styles.infoCard}> 
            <View style={styles.infoIconWrap}>
              <Ionicons name="calendar" size={16} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formatEventDate(event.date)} • {event.time}</Text>
            </View>
          </View>

          <View style={styles.infoCard}> 
            <View style={styles.infoIconWrap}>
              <Ionicons name="location" size={16} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.infoValue}>{event.venue}</Text>
              <Text style={styles.locationLink}>View on campus map</Text>
            </View>
          </View>

          <View style={styles.registeredBar}> 
            <View style={styles.avatarsWrap}>
              {registeredUsers.map((person, index) => (
                <View key={`${person.id}-${index}`} style={styles.avatarDot}>
                  {person.avatar ? (
                    <Image source={{ uri: person.avatar }} style={styles.avatarImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.avatarFallback}> 
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
              <Text key={label} style={styles.chip}>{label}</Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Event agenda</Text>
          <View style={styles.agendaList}>
            <AgendaItem
              time="10:00 AM - 10:30 AM"
              title="Registration & Welcome"
              subtitle="Grab your badge and settle in."
              styles={styles}
            />
            <AgendaItem
              time="10:30 AM - 12:00 PM"
              title="Main Session"
              subtitle="Expert speakers and presentations."
              styles={styles}
            />
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={[styles.floatingFooter, { paddingBottom: Math.max(insets.bottom, scale(12)) }]}>
        <View style={styles.footerInner}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>FREE</Text>
          </View>
          <Pressable
            style={[styles.registerButton, isRegistrationDisabled && styles.registerButtonDisabled]}
            onPress={onRegister}
            disabled={isRegistrationDisabled}
          >
            <Text style={styles.registerText}>{registerLabel}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primaryContrast} />
          </Pressable>
        </View>
      </View>
    </View>
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
  if (Number.isNaN(parsed.getTime())) return dateText;
  return `${parsed.toLocaleString("en-US", { month: "short" })} ${parsed.getDate()}, ${parsed.getFullYear()}`;
}

function parseEventStartDateTime(dateText, timeText) {
  if (!dateText) return null;
  const baseDate = new Date(dateText);
  if (Number.isNaN(baseDate.getTime())) return null;
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const rawTime = String(timeText || "").trim();
  if (!rawTime) return start;

  const twelveHour = rawTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = Number(twelveHour[2]);
    const period = twelveHour[3].toUpperCase();
    if (period === "PM" && hour < 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
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
  if (!start) return "UPCOMING";
  const hasTime = !!String(event?.time || "").trim();
  const end = new Date(start);
  if (hasTime) end.setHours(end.getHours() + 2);
  else end.setDate(end.getDate() + 1);

  const now = new Date(nowTimestamp);
  if (now < start) return "UPCOMING";
  if (now >= end) return "PAST";
  return "ONGOING";
}

function getAudienceLabels(targetAudience) {
  const value = String(targetAudience || "all").toLowerCase();
  if (value === "students") return ["Students"];
  if (value === "staff") return ["Faculty Staff"];
  return ["All Students", "Faculty Staff"];
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    absoluteHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: scale(280),
      backgroundColor: "#000",
    },
    absoluteImage: {
      width: "100%",
      height: "100%",
      opacity: 0.8,
    },
    absoluteOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.3)",
      borderBottomWidth: isDark ? 1 : 0,
      borderColor: colors.borderSoft,
    },
    topBarAbsolute: {
      position: "absolute",
      left: scale(16),
      right: scale(16),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 10,
    },
    topActionsRight: {
      flexDirection: "row",
      gap: scale(8),
    },
    glassBtn: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.2)",
    },
    mainContentSheet: {
      backgroundColor: colors.background,
      minHeight: 1000,
      borderTopLeftRadius: scale(32),
      borderTopRightRadius: scale(32),
      paddingTop: scale(24),
      paddingHorizontal: scale(20),
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.borderSoft,
    },
    badgeRow: {
      flexDirection: "row",
      gap: scale(6),
      marginBottom: scale(12),
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      fontSize: ms(9),
      fontWeight: "900",
      letterSpacing: 0.8,
    },
    badgeGreen: {
      backgroundColor: colors.primary + "20",
      color: colors.primary,
    },
    badgeLive: {
      backgroundColor: "#ff444420",
      color: "#ff4444",
    },
    eventTitle: {
      color: colors.text,
      fontSize: ms(26),
      fontFamily: "Outfit_900Black",
      lineHeight: ms(32),
      marginBottom: scale(16),
    },
    organizerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
      marginBottom: scale(20),
    },
    organizerIconWrap: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      backgroundColor: colors.primary + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    organizerLabel: {
      color: colors.textSubtle,
      fontSize: ms(11),
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    organizerName: {
      color: colors.text,
      fontSize: ms(14),
      fontWeight: "900",
    },
    infoCard: {
      borderRadius: scale(16),
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.borderSoft,
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      paddingHorizontal: scale(16),
      paddingVertical: scale(14),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(14),
      marginBottom: scale(10),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0 : 0.03,
      shadowRadius: 8,
      elevation: isDark ? 0 : 2,
    },
    infoIconWrap: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(12),
      backgroundColor: colors.accent + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    infoLabel: {
      color: colors.textSubtle,
      fontSize: ms(11),
      fontWeight: "700",
    },
    infoValue: {
      color: colors.text,
      fontSize: ms(14),
      fontWeight: "800",
    },
    locationLink: {
      marginTop: scale(2),
      color: colors.accent,
      fontSize: ms(11),
      fontWeight: "800",
    },
    registeredBar: {
      borderRadius: scale(16),
      minHeight: scale(44),
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.borderSoft,
      paddingHorizontal: scale(16),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
      marginTop: scale(6),
      marginBottom: scale(20),
    },
    avatarsWrap: {
      flexDirection: "row",
      minWidth: scale(20),
    },
    avatarDot: {
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      overflow: "hidden",
      marginRight: -scale(8),
      borderWidth: 2,
      borderColor: colors.surface,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    avatarFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
    },
    registeredText: {
      color: colors.text,
      fontSize: ms(12),
      fontWeight: "800",
    },
    statusText: {
      marginLeft: "auto",
      color: colors.textSubtle,
      fontSize: ms(10),
      fontFamily: "Outfit_900Black",
      letterSpacing: 1,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: ms(18),
      fontFamily: "Outfit_900Black",
      marginBottom: scale(10),
      marginTop: scale(10),
    },
    aboutText: {
      color: colors.textMuted,
      fontSize: ms(14),
      lineHeight: ms(22),
      marginBottom: scale(16),
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(8),
      marginBottom: scale(20),
    },
    chip: {
      paddingVertical: scale(8),
      paddingHorizontal: scale(14),
      borderRadius: 999,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.borderSoft,
      backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
      color: colors.text,
      fontSize: ms(12),
      fontWeight: "800",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 4,
      elevation: isDark ? 0 : 2,
    },
    agendaList: {
      gap: scale(12),
      marginBottom: scale(10),
    },
    agendaItem: {
      paddingLeft: scale(14),
      borderLeftWidth: 2,
      borderLeftColor: colors.primary + "50",
    },
    agendaTime: {
      color: colors.accent,
      fontSize: ms(12),
      fontFamily: "Outfit_900Black",
    },
    agendaTitle: {
      color: colors.text,
      fontSize: ms(14),
      fontWeight: "800",
      marginTop: scale(2),
    },
    agendaSubtitle: {
      color: colors.textSubtle,
      fontSize: ms(12),
      marginTop: scale(2),
    },
    floatingFooter: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? colors.background : "rgba(255,255,255,0.9)",
      borderTopWidth: 1,
      borderColor: colors.borderSoft,
      paddingTop: scale(16),
      paddingHorizontal: scale(20),
    },
    footerInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    priceLabel: {
      color: colors.textSubtle,
      fontSize: ms(11),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    priceValue: {
      color: colors.text,
      fontSize: ms(24),
      fontFamily: "Outfit_900Black",
      marginTop: scale(2),
    },
    registerButton: {
      minHeight: scale(48),
      borderRadius: 999,
      backgroundColor: colors.primary,
      paddingHorizontal: scale(24),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    registerButtonDisabled: {
      opacity: 0.5,
      shadowOpacity: 0,
    },
    registerText: {
      color: colors.primaryContrast,
      fontSize: ms(15),
      fontWeight: "900",
    },
  });