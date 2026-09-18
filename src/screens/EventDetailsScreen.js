import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Linking, Modal, Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../components/AppText";
import { FadeInImage } from "../components/FadeInImage";
import { Header } from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";
import { eventCalendarUrl, formatEventDate } from "../utils/eventTime";
import { registrationPresentation } from "../utils/eventPresentation";
import { useCurrentTime } from "../utils/useCurrentTime";

export default function EventDetailsScreen({ event, isRegistered, isWaitlisted = false, isBookmarked, registering, canManageEvent, deletingEvent, onRegister, onToggleBookmark, onEditEvent, onViewParticipants, onDeleteEvent, onBack }) {
  const { user } = useAuth();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();
  const now = useCurrentTime();
  const [sheet, setSheet] = useState(null);
  const action = registrationPresentation(event, { isRegistered, isWaitlisted, registering, now });
  const statusLabels = { upcoming: "Upcoming", ongoing: "Happening now", past: "Ended", cancelled: "Cancelled", archived: "Archived", draft: "Draft", unknown: "Schedule pending" };
  const total = event.registeredCount == null ? null : Number(event.registeredCount);
  const knownCount = Number.isFinite(total) && total >= 0;
  const capacity = Number(event.capacity);
  const remaining = knownCount && Number.isFinite(capacity) && capacity > 0 ? Math.max(capacity - total, 0) : null;
  const audience = event.targetAudience === "students" ? "Students" : event.targetAudience === "staff" ? "Staff and organizers" : "All campus members";
  const addToCalendar = async () => {
    try { await Linking.openURL(eventCalendarUrl(event)); }
    catch { Alert.alert("Calendar", "Could not open the calendar. Please try again."); }
  };
  const share = async () => {
    try { await Share.share({ message: `${event.title}\n${formatEventDate(event.date)} · ${event.time || "Time to be confirmed"}\n${event.venue || "Venue to be confirmed"}` }); }
    catch (error) { Alert.alert("Could not share event", error.message); }
  };
  const register = async () => {
    if (isRegistered) { setSheet("registration"); return; }
    const result = await onRegister?.();
    if (result?.ok) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };
  const manage = callback => { setSheet(null); callback?.(); };
  const detail = (icon, label, value) => <View style={styles.detailRow}><View style={styles.detailIcon}><Ionicons name={icon} size={22} color={colors.accent} /></View><View style={styles.flex}><AppText style={styles.detailLabel}>{label}</AppText><AppText style={styles.detailValue}>{value}</AppText></View></View>;

  return (
    <View style={[styles.page, { paddingTop: insets.top }]}>
      <Header title="Event details" onBack={onBack} actions={[
        { icon: isBookmarked ? "bookmark" : "bookmark-outline", label: isBookmarked ? "Unsave event" : "Save event", onPress: onToggleBookmark, color: isBookmarked ? colors.accent : colors.text },
        { icon: "share-outline", label: "Share event", onPress: share },
      ]} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.bannerWrap}><FadeInImage source={{ uri: event.image }} style={styles.banner} /><View style={styles.bannerLabel}><Ionicons name="school-outline" size={15} color="#fff" /><AppText style={styles.bannerLabelText}>NSUK CAMPUS EVENTS</AppText></View></View>
        <View style={styles.body}>
          <View style={styles.badgeRow}>
            {!!event.category && <View style={styles.category}><AppText style={styles.categoryText}>{event.category}</AppText></View>}
            <View style={styles.status}><View style={[styles.statusDot, ["cancelled", "archived", "past"].includes(action.status) && { backgroundColor: colors.textSubtle }]} /><AppText style={styles.statusText}>{statusLabels[action.status] || event.status}</AppText></View>
          </View>
          <AppText style={styles.title}>{event.title}</AppText>
          <View style={styles.organizerRow}><View style={styles.organizerIcon}><Ionicons name="person-outline" size={18} color={colors.accent} /></View><View style={styles.flex}><AppText style={styles.detailLabel}>Organized by</AppText><AppText style={styles.organizerName}>{event.organizer || "Organizer to be confirmed"}</AppText></View></View>
          {canManageEvent && <Pressable style={styles.manageButton} onPress={() => setSheet("manage")} accessibilityRole="button" accessibilityLabel="Manage this event"><Ionicons name="options-outline" size={20} color={colors.accent} /><AppText style={styles.link}>Manage event</AppText><Ionicons name="chevron-down" size={18} color={colors.accent} /></Pressable>}
          <View style={styles.infoCard}>
            {detail("calendar-outline", "Date & time", `${formatEventDate(event.date) || "Date to be confirmed"}\n${event.time || "Time to be confirmed"}`)}
            <View style={styles.divider} />
            {detail("location-outline", "Venue", event.venue || "Venue to be confirmed")}
          </View>
          <View style={styles.registrationRow}><Ionicons name="people-outline" size={22} color={colors.accent} /><View style={styles.flex}><AppText style={styles.registrationText}>{knownCount ? `${total} ${total === 1 ? "person has" : "people have"} registered` : "Registration count unavailable"}</AppText>{remaining != null && <AppText style={styles.detailLabel}>{remaining > 0 ? `${remaining} ${remaining === 1 ? "place" : "places"} remaining` : "Capacity reached · waitlist available"}</AppText>}</View></View>
          <AppText style={styles.sectionTitle}>About this event</AppText><AppText style={styles.description}>{event.description || "The organizer has not added a description yet."}</AppText>
          <AppText style={styles.sectionTitle}>Who can attend</AppText><View style={styles.audience}><Ionicons name="school-outline" size={18} color={colors.accent} /><AppText style={styles.audienceText}>{audience}</AppText></View>
          <Pressable style={styles.calendarButton} onPress={addToCalendar} accessibilityRole="button" accessibilityLabel="Add event to calendar"><Ionicons name="calendar-number-outline" size={21} color={colors.accent} /><AppText style={styles.link}>Add to my calendar</AppText><Ionicons name="arrow-forward" size={18} color={colors.accent} /></Pressable>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {isRegistered && <View style={styles.confirmation}><Ionicons name="checkmark-circle" size={18} color={colors.accent} /><AppText style={styles.confirmationText}>Your registration is saved</AppText></View>}
        {isWaitlisted && !isRegistered && <AppText style={styles.footerHint}>Your place on the waitlist is saved.</AppText>}
        <Pressable style={({ pressed }) => [styles.primaryButton, action.disabled && styles.disabledButton, pressed && { opacity: 0.85 }]} onPress={register} disabled={action.disabled} accessibilityRole="button" accessibilityLabel={action.label} accessibilityState={{ disabled: action.disabled, busy: !!registering }}>
          {registering ? <ActivityIndicator color={colors.primaryContrast} /> : <Ionicons name={isRegistered ? "checkmark-circle-outline" : isWaitlisted ? "time-outline" : "calendar-outline"} size={21} color={action.disabled ? colors.textMuted : "#fff"} />}
          <AppText style={[styles.primaryText, action.disabled && { color: colors.textMuted }]}>{action.label}</AppText>
          {!action.disabled && <Ionicons name="arrow-forward" size={20} color="#fff" />}
        </Pressable>
      </View>
      <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSheet(null)} accessibilityRole="button" accessibilityLabel="Close sheet" />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]} accessibilityViewIsModal>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}><AppText style={styles.sectionTitle}>{sheet === "manage" ? "Manage event" : "Registration details"}</AppText><Pressable style={styles.closeButton} onPress={() => setSheet(null)} accessibilityRole="button" accessibilityLabel="Close"><Ionicons name="close" size={24} color={colors.text} /></Pressable></View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {sheet === "manage" ? <>
                <AppText style={styles.sheetEventTitle}>{event.title}</AppText>
                <Pressable style={styles.sheetAction} onPress={() => manage(onEditEvent)} accessibilityRole="button"><Ionicons name="create-outline" size={22} color={colors.accent} /><AppText style={styles.sheetActionText}>Edit event</AppText><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></Pressable>
                <Pressable style={styles.sheetAction} onPress={() => manage(onViewParticipants)} accessibilityRole="button"><Ionicons name="people-outline" size={22} color={colors.accent} /><AppText style={styles.sheetActionText}>View participants</AppText><Ionicons name="chevron-forward" size={18} color={colors.textMuted} /></Pressable>
                <Pressable style={styles.sheetAction} onPress={() => manage(onDeleteEvent)} disabled={deletingEvent} accessibilityRole="button" accessibilityState={{ disabled: !!deletingEvent }}><Ionicons name="trash-outline" size={22} color={colors.error} /><AppText style={[styles.sheetActionText, { color: colors.error }]}>{deletingEvent ? "Deleting…" : "Delete event"}</AppText></Pressable>
              </> : <>
                <View style={styles.confirmation}><Ionicons name="checkmark-circle" size={24} color={colors.accent} /><AppText style={styles.confirmationText}>You’re registered</AppText></View>
                <AppText style={styles.sheetEventTitle}>{event.title}</AppText>
                {detail("person-outline", "Registered account", user?.fullName || "Your account")}
                {detail("calendar-outline", "Date & time", `${formatEventDate(event.date)} · ${event.time || "Time to be confirmed"}`)}
                {detail("location-outline", "Venue", event.venue || "Venue to be confirmed")}
                <Pressable style={styles.calendarButton} onPress={addToCalendar} accessibilityRole="button"><Ionicons name="calendar-number-outline" size={21} color={colors.accent} /><AppText style={styles.link}>Add to my calendar</AppText></Pressable>
              </>}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors, isDark) => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 24 },
  bannerWrap: { margin: 16, marginBottom: 0, borderRadius: 24, overflow: "hidden", backgroundColor: colors.surfaceAlt },
  banner: { width: "100%", height: scale(230) },
  bannerLabel: { position: "absolute", bottom: 16, left: 16, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#174b33", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  bannerLabelText: { color: "#fff", fontSize: ms(10), fontWeight: "600", letterSpacing: 1 },
  body: { paddingHorizontal: 22, paddingTop: 24 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 14 },
  category: { backgroundColor: colors.accentTint, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20 },
  categoryText: { color: colors.accent, fontSize: ms(12), fontWeight: "600" },
  status: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  statusText: { color: colors.textMuted, fontSize: ms(12) },
  title: { fontSize: ms(29), lineHeight: ms(36), fontWeight: "600", color: colors.text },
  organizerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 20 },
  organizerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentTint, justifyContent: "center", alignItems: "center" },
  organizerName: { fontSize: ms(14), fontWeight: "600", color: colors.text, marginTop: 3 },
  flex: { flex: 1 },
  manageButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, minHeight: 48, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.borderSoft, marginBottom: 18 },
  infoCard: { borderRadius: 20, paddingHorizontal: 16, backgroundColor: isDark ? colors.surface : "#f2f5ee", borderWidth: 1, borderColor: colors.borderSoft },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 17 },
  detailIcon: { width: 32, alignItems: "center" },
  detailLabel: { fontSize: ms(12), lineHeight: ms(18), color: colors.textMuted },
  detailValue: { fontSize: ms(15), lineHeight: ms(23), color: colors.text, fontWeight: "500", marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.borderSoft },
  registrationRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 22, borderBottomWidth: 1, borderColor: colors.borderSoft },
  registrationText: { fontSize: ms(14), color: colors.text, fontWeight: "500", marginBottom: 3 },
  sectionTitle: { fontSize: ms(19), fontWeight: "600", color: colors.text, marginTop: 22, marginBottom: 12, flexShrink: 1 },
  description: { color: colors.textMuted, fontSize: ms(15), lineHeight: ms(25) },
  audience: { flexDirection: "row", alignItems: "center", gap: 9 },
  audienceText: { color: colors.textMuted, fontSize: ms(14), flex: 1 },
  calendarButton: { minHeight: 52, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 22, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: 15 },
  link: { color: colors.accent, fontSize: ms(14), fontWeight: "600" },
  footer: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.background, borderTopWidth: 1, borderColor: colors.borderSoft },
  primaryButton: { minHeight: 56, paddingHorizontal: 16, paddingVertical: 15, borderRadius: 17, backgroundColor: "#174b33", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  primaryText: { color: "#fff", fontSize: ms(15), fontWeight: "600", flexShrink: 1, textAlign: "center" },
  disabledButton: { backgroundColor: colors.surfaceAlt },
  confirmation: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 },
  confirmationText: { fontSize: ms(13), fontWeight: "500", color: colors.accent },
  footerHint: { textAlign: "center", fontSize: ms(13), color: colors.textMuted, marginBottom: 10 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: { maxHeight: "85%", paddingHorizontal: 22, backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", backgroundColor: colors.borderStrong, marginTop: 10 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  closeButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  sheetEventTitle: { fontSize: ms(21), lineHeight: ms(28), fontWeight: "600", marginBottom: 15, color: colors.text },
  sheetAction: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 60, paddingVertical: 15, borderTopWidth: 1, borderColor: colors.borderSoft },
  sheetActionText: { flex: 1, fontSize: ms(15), color: colors.text },
});
