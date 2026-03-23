import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function ProfileScreen({
  user,
  isStaff,
  totalRegistered,
  favoriteCategory,
  themeMode,
  onToggleTheme,
  onEditProfile,
  onOpenMyEvents,
  onOpenSavedEvents,
  onOpenNotifications,
  onCreateEvent,
  onOpenAnnouncement,
  onOpenSettings,
  onLogout,
}) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, isDark);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(10) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile</Text>
        <Pressable style={styles.settingsBtn} onPress={onOpenSettings}>
          <Ionicons name="settings-sharp" size={18} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <Image
            source={{ uri: user.avatar || "https://randomuser.me/api/portraits/women/44.jpg" }}
            style={styles.avatar}
          />
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color={colors.primaryContrast} />
          </View>
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.meta}>{user.department}</Text>
        <Text style={styles.level}>{user.level || (isStaff ? "Organizer" : "Student")}</Text>
        <Text style={styles.roleBadge}>{isStaff ? "Staff / Organizer" : "Student / Attendee"}</Text>

        <Pressable style={styles.editButton} onPress={onEditProfile}>
          <Ionicons name="create-outline" size={15} color={colors.primaryContrast} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>

        <Pressable style={styles.manageButton} onPress={isStaff ? onCreateEvent : onOpenMyEvents}>
          <Ionicons name={isStaff ? "add-circle-outline" : "compass-outline"} size={15} color={colors.primaryContrast} />
          <Text style={styles.manageButtonText}>{isStaff ? "Create Event" : "Discover Events"}</Text>
        </Pressable>

        {isStaff && (
          <Pressable style={styles.announcementButton} onPress={onOpenAnnouncement}>
            <Ionicons name="megaphone-outline" size={15} color={colors.primaryContrast} />
            <Text style={styles.announcementButtonText}>Create Announcement</Text>
          </Pressable>
        )}
      </View>

      <SectionTitle title="ACCOUNT ACTIVITY" colors={colors} />
      <View style={styles.groupCard}>
        <ActionRow
          icon="ticket"
          label="My Registrations"
          value={`${totalRegistered}`}
          iconBg={colors.surfaceAlt}
          iconColor={colors.primary}
          onPress={onOpenMyEvents}
        />
        <Divider colors={colors} />
        <ActionRow
          icon="bookmark"
          label="Saved Events"
          value={favoriteCategory || "Campus Picks"}
          iconBg={colors.surfaceAlt}
          iconColor={colors.primary}
          onPress={onOpenSavedEvents}
        />
        <Divider colors={colors} />
        <ActionRow
          icon="notifications"
          label="Notification Settings"
          iconBg={colors.surfaceAlt}
          iconColor={colors.primary}
          onPress={onOpenNotifications}
        />
      </View>

      <SectionTitle title="PREFERENCES" colors={colors} />
      <View style={styles.groupCard}>
        <View style={styles.preferenceRow}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconWrap, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="moon" size={14} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={themeMode === "dark"}
            onValueChange={onToggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.primaryContrast}
          />
        </View>
      </View>

      <SectionTitle title="SUPPORT & INFO" colors={colors} />
      <View style={styles.groupCard}>
        <ActionRow icon="help-circle" label="Help & Support" iconBg={colors.surfaceAlt} iconColor={colors.primary} onPress={onOpenSettings} />
        <Divider colors={colors} />
        <ActionRow icon="code-slash" label="About Developers" iconBg={colors.surfaceAlt} iconColor={colors.primary} onPress={onOpenSettings} />
      </View>

      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={16} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionTitle({ title, colors }) {
  return <Text style={[stylesStatic.sectionTitle, { color: colors.textSubtle }]}>{title}</Text>;
}

function Divider({ colors }) {
  return <View style={[stylesStatic.divider, { backgroundColor: colors.borderSoft }]} />;
}

function ActionRow({ icon, label, value, iconBg, iconColor, onPress }) {
  const { colors } = useAppTheme();

  return (
    <Pressable style={stylesStatic.actionRow} onPress={onPress}>
      <View style={stylesStatic.rowLeft}>
        <View style={[stylesStatic.rowIconWrap, { backgroundColor: iconBg }]}> 
          <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        <View style={stylesStatic.rowTextWrap}>
          <Text style={[stylesStatic.rowLabel, { color: colors.text }]}>{label}</Text>
          {!!value && <Text style={[stylesStatic.rowValue, { color: colors.textSubtle }]}>{value}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
    </Pressable>
  );
}

const getStyles = (colors, isDark) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? colors.background : colors.surfaceAlt,
  },
  content: {
    paddingHorizontal: scale(14),
    paddingTop: scale(10),
    paddingBottom: scale(20),
    gap: scale(12),
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: ms(22),
    fontWeight: "800",
    color: colors.primary,
  },
  settingsBtn: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    borderRadius: scale(18),
    backgroundColor: isDark ? colors.surface : colors.surface,
    alignItems: "center",
    paddingVertical: scale(14),
    paddingHorizontal: scale(12),
    gap: scale(4),
  },
  avatarWrap: {
    position: "relative",
    marginBottom: scale(4),
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.border,
    padding: scale(3),
  },
  avatar: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: colors.surfaceAlt,
  },
  verifiedBadge: {
    position: "absolute",
    right: 0,
    bottom: scale(4),
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primaryContrast,
  },
  name: {
    fontSize: ms(22),
    fontWeight: "800",
    color: colors.text,
  },
  meta: {
    fontSize: ms(14),
    color: colors.textMuted,
    fontWeight: "600",
  },
  level: {
    fontSize: ms(13),
    color: colors.primary,
    fontWeight: "800",
  },
  roleBadge: {
    marginTop: scale(2),
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: 999,
    color: colors.accent,
    backgroundColor: colors.surfaceAlt,
    fontSize: ms(11),
    fontWeight: "800",
    overflow: "hidden",
  },
  editButton: {
    marginTop: scale(8),
    width: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(6),
    paddingVertical: scale(11),
  },
  editButtonText: {
    color: colors.primaryContrast,
    fontSize: ms(14),
    fontWeight: "800",
  },
  manageButton: {
    marginTop: scale(8),
    width: "100%",
    borderRadius: 999,
    backgroundColor: colors.accent,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(6),
    paddingVertical: scale(10),
  },
  manageButtonText: {
    color: colors.primaryContrast,
    fontSize: ms(13),
    fontWeight: "800",
  },
  announcementButton: {
    marginTop: scale(8),
    width: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: scale(6),
    paddingVertical: scale(10),
  },
  announcementButtonText: {
    color: colors.primaryContrast,
    fontSize: ms(13),
    fontWeight: "800",
  },
  groupCard: {
    borderRadius: scale(16),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: scale(2),
  },
  preferenceRow: {
    minHeight: scale(52),
    paddingHorizontal: scale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  rowIconWrap: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    borderRadius: scale(14),
    backgroundColor: colors.surfaceAlt,
    minHeight: scale(48),
    marginTop: scale(6),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(6),
  },
  logoutText: {
    color: colors.error,
    fontSize: ms(14),
    fontWeight: "800",
  },
  });

const stylesStatic = StyleSheet.create({
  sectionTitle: {
    fontSize: ms(11),
    letterSpacing: 1,
    fontWeight: "800",
    marginTop: scale(2),
    marginBottom: scale(2),
  },
  actionRow: {
    minHeight: scale(54),
    paddingHorizontal: scale(14),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  rowIconWrap: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  rowTextWrap: {
    gap: 1,
  },
  rowLabel: {
    fontSize: ms(14),
    fontWeight: "700",
  },
  rowValue: {
    fontSize: ms(11),
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginLeft: scale(50),
  },
});
