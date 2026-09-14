import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, View, Share } from "react-native";
import { Image } from "expo-image";
import { AppText } from "../components/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";
import { eventCalendarUrl, eventTimeStatus, formatEventDate } from "../utils/eventTime";
import { useCurrentTime } from "../utils/useCurrentTime";

export default function EventDetailsScreen({
  event,
  isRegistered,
  isWaitlisted = false,
  isBookmarked,
  registering,
  canManageEvent,
  deletingEvent,
  onRegister,
  onToggleBookmark,
  onEditEvent,
  onViewParticipants,
  onDeleteEvent,
  onBack,
}) {
  const { user } = useAuth();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();
  const nowTs = useCurrentTime();
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  const eventStatus = useMemo(() => ["cancelled", "draft"].includes(event.status)
    ? event.status.toUpperCase() : eventTimeStatus(event, nowTs).toUpperCase(), [event, nowTs]);
  const isPast = eventStatus === "PAST";
  
  const capacity = Number(event?.capacity);
  const count = Number(event?.registeredCount);
  const isFull = Number.isFinite(capacity) && capacity > 0 && count >= capacity;

  let registerLabel = "Register Now";
  if (isPast) {
    registerLabel = "Event Ended";
  } else if (isFull && !isRegistered) {
    registerLabel = "Join Waitlist";
  } else if (isRegistered) {
    registerLabel = "Registered";
  } else if (registering) {
    registerLabel = "Registering...";
  }
  if (isWaitlisted) registerLabel = "Waitlisted";
  if (eventStatus === "CANCELLED") registerLabel = "Event Cancelled";
  if (eventStatus === "DRAFT") registerLabel = "Not Published";
  if (eventStatus === "UNKNOWN") registerLabel = "Time to Be Confirmed";

  const isRegistrationDisabled = isPast || isRegistered || isWaitlisted || registering || ["CANCELLED", "DRAFT", "UNKNOWN"].includes(eventStatus);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title}\nDate: ${formatEventDate(event.date)}\nVenue: ${event.venue}`,
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleAddToCalendar = async () => {
    try {
      await Linking.openURL(eventCalendarUrl(event));
    } catch (_err) {
      Alert.alert("Calendar", "Could not open calendar link.");
    }
  };

  const audienceLabels = useMemo(() => getAudienceLabels(event?.targetAudience), [event?.targetAudience]);
  const registeredUsers = useMemo(() => {
    if (!Array.isArray(event?.registeredUsers)) return [];
    return event.registeredUsers.slice(0, 3);
  }, [event?.registeredUsers]);
  
  const registrationSummary = useMemo(() => {
    const count = Number(event?.registeredCount);
    if (event?.registeredCount == null || !Number.isFinite(count) || count < 0) return "RSVP to join this event";
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
        <Image
          source={{ uri: event.image }}
          style={styles.absoluteImage}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
        <View style={styles.absoluteOverlay} />
      </View>

      {/* Floating Top Actions */}
      <View style={[styles.topBarAbsolute, { top: Math.max(insets.top, scale(12)) }]}>
        <Pressable onPress={onBack} style={styles.glassBtn} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </Pressable>
        <View style={styles.topActionsRight}>
          <Pressable
            style={styles.glassBtn}
            onPress={handleAddToCalendar}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add to calendar"
          >
            <Ionicons name="calendar-outline" size={18} color="#fff" />
          </Pressable>
          <Pressable
            style={styles.glassBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onToggleBookmark();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? "Remove bookmark" : "Bookmark event"}
          >
            <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={18} color="#fff" />
          </Pressable>
          {canManageEvent && (
            <Pressable style={styles.glassBtn} onPress={onEditEvent} hitSlop={8} accessibilityRole="button" accessibilityLabel="Edit event">
              <Ionicons name="create-outline" size={18} color="#fff" />
            </Pressable>
          )}
          {canManageEvent && (
            <Pressable
              style={styles.glassBtn}
              onPress={onDeleteEvent}
              disabled={deletingEvent}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Delete event"
              accessibilityState={{ disabled: deletingEvent }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </Pressable>
          )}
          <Pressable style={styles.glassBtn} onPress={handleShare} hitSlop={8} accessibilityRole="button" accessibilityLabel="Share event">
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
            <AppText style={[styles.badge, styles.badgeGreen]}>{event.category || "CAMPUS EVENT"}</AppText>
            {eventStatus === "ONGOING" && <AppText style={[styles.badge, styles.badgeLive]}>LIVE</AppText>}
          </View>

          <AppText style={styles.eventTitle}>{event.title}</AppText>

          <View style={styles.organizerRow}>
            <View style={styles.organizerIconWrap}>
              <Ionicons name="person" size={12} color={colors.primary} />
            </View>
            <View>
              <AppText style={styles.organizerLabel}>Organized by</AppText>
              <AppText style={styles.organizerName}>{event.organizer}</AppText>
            </View>
          </View>

          <View style={styles.infoCard}> 
            <View style={styles.infoIconWrap}>
              <Ionicons name="calendar" size={16} color={colors.accent} />
            </View>
            <View>
              <AppText style={styles.infoLabel}>Date & Time</AppText>
              <AppText style={styles.infoValue}>{formatEventDate(event.date)} • {event.time}</AppText>
            </View>
          </View>

          <View style={styles.infoCard}> 
            <View style={styles.infoIconWrap}>
              <Ionicons name="location" size={16} color={colors.accent} />
            </View>
            <View>
              <AppText style={styles.infoValue}>{event.venue}</AppText>
              <AppText style={styles.locationLink}>View on campus map</AppText>
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
            <AppText style={styles.registeredText}>{registrationSummary}</AppText>
            <AppText style={styles.statusText}>{eventStatus}</AppText>
          </View>

          <AppText style={styles.sectionTitle}>About this event</AppText>
          <AppText style={styles.aboutText}>{event.description}</AppText>
          {canManageEvent && <Pressable onPress={onViewParticipants} accessibilityRole="button" accessibilityLabel="View participants" style={{ paddingVertical: 16 }}>
            <AppText style={{ color: colors.primary, fontWeight: "700" }}>View participants →</AppText>
          </Pressable>}

          <AppText style={styles.sectionTitle}>Who can attend</AppText>
          <View style={styles.chipRow}>
            {audienceLabels.map((label) => (
              <AppText key={label} style={styles.chip}>{label}</AppText>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={[styles.floatingFooter, { paddingBottom: Math.max(insets.bottom, scale(12)) }]}>
        <View style={styles.footerInner}>
          <View>
            <AppText style={styles.priceLabel}>Price</AppText>
            <AppText style={styles.priceValue}>FREE</AppText>
          </View>
          {isRegistered ? (
            <View style={{ flexDirection: "row", gap: scale(8), alignItems: "center" }}>
              <Pressable
                style={[styles.ticketButton, { backgroundColor: colors.accentTint, borderColor: colors.primary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setShowTicketModal(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="View admission ticket"
              >
                <Ionicons name="qr-code-outline" size={16} color={colors.primary} />
                <AppText style={[styles.ticketButtonText, { color: colors.primary }]}>View Ticket</AppText>
              </Pressable>
              <View style={[styles.registerButton, styles.registeredBadge]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primaryContrast} />
                <AppText style={styles.registerText}>Registered</AppText>
              </View>
            </View>
          ) : (
            <Pressable
              style={[styles.registerButton, isRegistrationDisabled && styles.registerButtonDisabled]}
              onPress={async () => {
                const result = await onRegister();
                if (result?.ok) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              disabled={isRegistrationDisabled}
              accessibilityRole="button"
              accessibilityLabel={registerLabel}
              accessibilityState={{ disabled: isRegistrationDisabled, busy: registering }}
            >
              <AppText style={styles.registerText}>{registerLabel}</AppText>
              <Ionicons name="arrow-forward" size={14} color={colors.primaryContrast} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Digital Admission Pass Modal */}
      <Modal
        visible={showTicketModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismiss} onPress={() => setShowTicketModal(false)} />
          <View style={[styles.ticketCard, { backgroundColor: colors.surface }]}>
            <View style={styles.ticketTopBanner}>
              <View style={styles.ticketBrandRow}>
                <Ionicons name="school" size={20} color="#fff" />
                <AppText style={styles.ticketBrandText}>NSUK EVENT PASS</AppText>
              </View>
              <AppText style={styles.ticketEventTitle} numberOfLines={2}>
                {event.title}
              </AppText>
              <View style={styles.ticketBadgeRow}>
                <View style={styles.confirmedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#059669" />
                  <AppText style={styles.confirmedText}>REGISTRATION CONFIRMED</AppText>
                </View>
              </View>
            </View>

            {/* Perforated Divider */}
            <View style={styles.perforatedRow}>
              <View style={[styles.cutoutCircle, styles.cutoutLeft, { backgroundColor: "rgba(0,0,0,0.6)" }]} />
              <View style={styles.dashedLine} />
              <View style={[styles.cutoutCircle, styles.cutoutRight, { backgroundColor: "rgba(0,0,0,0.6)" }]} />
            </View>

            {/* Ticket Details */}
            <View style={styles.ticketBody}>
              <View style={styles.ticketDetailRow}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.ticketFieldLabel}>ATTENDEE</AppText>
                  <AppText style={styles.ticketFieldValue} numberOfLines={1}>
                    {user?.fullName || "Student Attendee"}
                  </AppText>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <AppText style={styles.ticketFieldLabel}>ID / MATRIC</AppText>
                  <AppText style={styles.ticketFieldValue}>
                    {user?.matricNumber || user?.staffId || "Not provided"}
                  </AppText>
                </View>
              </View>

              <View style={[styles.ticketDetailRow, { marginTop: scale(12) }]}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.ticketFieldLabel}>DATE & TIME</AppText>
                  <AppText style={styles.ticketFieldValue}>
                    {formatEventDate(event.date)} • {event.time || "TBA"}
                  </AppText>
                </View>
              </View>

              <View style={[styles.ticketDetailRow, { marginTop: scale(12) }]}>
                <View style={{ flex: 1 }}>
                  <AppText style={styles.ticketFieldLabel}>VENUE</AppText>
                  <AppText style={styles.ticketFieldValue} numberOfLines={1}>
                    {event.venue || "NSUK Campus"}
                  </AppText>
                </View>
              </View>

              {/* QR Code Pass */}
              <View style={styles.qrContainer}>
                <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
                <AppText style={styles.qrCodeText}>
                  PASS: {`NSUK-${String(event.id || "").slice(0, 8).toUpperCase()}`}
                </AppText>
                <AppText style={styles.qrInstruction}>
                  Your RSVP is recorded. Follow the organizer&apos;s instructions for entry.
                </AppText>
              </View>

              <Pressable
                style={[styles.closeTicketBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowTicketModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Close ticket"
              >
                <AppText style={styles.closeTicketText}>Done</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
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
    ticketButton: {
      minHeight: scale(48),
      borderRadius: 999,
      paddingHorizontal: scale(16),
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      borderWidth: 1.5,
    },
    ticketButtonText: {
      fontSize: ms(14),
      fontWeight: "800",
    },
    registeredBadge: {
      backgroundColor: "#059669",
      paddingHorizontal: scale(16),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      justifyContent: "center",
      alignItems: "center",
      padding: scale(20),
    },
    modalDismiss: {
      ...StyleSheet.absoluteFillObject,
    },
    ticketCard: {
      width: "100%",
      maxWidth: 380,
      borderRadius: scale(20),
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    },
    ticketTopBanner: {
      backgroundColor: colors.primary,
      padding: scale(20),
    },
    ticketBrandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      marginBottom: scale(10),
    },
    ticketBrandText: {
      color: "#fff",
      fontSize: ms(12),
      fontWeight: "900",
      letterSpacing: 1,
    },
    ticketEventTitle: {
      color: "#fff",
      fontSize: ms(20),
      fontWeight: "800",
      lineHeight: ms(24),
    },
    ticketBadgeRow: {
      marginTop: scale(12),
    },
    confirmedBadge: {
      backgroundColor: "#fff",
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      borderRadius: scale(6),
      alignSelf: "flex-start",
    },
    confirmedText: {
      color: "#059669",
      fontSize: ms(11),
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    perforatedRow: {
      flexDirection: "row",
      alignItems: "center",
      height: scale(24),
      backgroundColor: colors.surface,
      position: "relative",
    },
    cutoutCircle: {
      width: scale(24),
      height: scale(24),
      borderRadius: scale(12),
      position: "absolute",
    },
    cutoutLeft: {
      left: -scale(12),
    },
    cutoutRight: {
      right: -scale(12),
    },
    dashedLine: {
      flex: 1,
      height: 1,
      borderWidth: 1,
      borderColor: colors.borderSoft,
      borderStyle: "dashed",
      marginHorizontal: scale(18),
    },
    ticketBody: {
      padding: scale(20),
      paddingTop: scale(10),
    },
    ticketDetailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    ticketFieldLabel: {
      color: colors.textSubtle,
      fontSize: ms(10),
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: scale(2),
    },
    ticketFieldValue: {
      color: colors.text,
      fontSize: ms(14),
      fontWeight: "700",
    },
    qrContainer: {
      alignItems: "center",
      marginTop: scale(16),
      paddingVertical: scale(12),
      backgroundColor: colors.surfaceAlt,
      borderRadius: scale(12),
    },
    qrImage: {
      width: scale(140),
      height: scale(140),
      borderRadius: scale(8),
    },
    qrCodeText: {
      marginTop: scale(8),
      fontSize: ms(12),
      fontWeight: "800",
      color: colors.text,
      letterSpacing: 1,
    },
    qrInstruction: {
      marginTop: scale(4),
      fontSize: ms(11),
      color: colors.textMuted,
      textAlign: "center",
      paddingHorizontal: scale(10),
    },
    closeTicketBtn: {
      marginTop: scale(16),
      paddingVertical: scale(12),
      borderRadius: scale(12),
      alignItems: "center",
    },
    closeTicketText: {
      color: "#fff",
      fontSize: ms(15),
      fontWeight: "800",
    },
  });
