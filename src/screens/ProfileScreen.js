import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScalePressable } from "../components/ScalePressable";
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
        <ScalePressable style={styles.settingsBtn} onPress={onOpenSettings}>
          <Ionicons name="settings-sharp" size={20} color={colors.text} />
        </ScalePressable>
      </View>

      <View style={[styles.profileCard, isStaff ? styles.profileCardStaff : styles.profileCardStudent]}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: user.avatar || "https://randomuser.me/api/portraits/women/44.jpg" }}
              style={styles.avatar}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color={colors.primaryContrast} />
            </View>
          </View>
          
          <ScalePressable style={styles.editButton} onPress={onEditProfile}>
            <Ionicons name="pencil" size={16} color={isStaff ? colors.primaryContrast : colors.primaryContrast} />
          </ScalePressable>
        </View>

        <View style={styles.profileInfo}>
          <Text style={[styles.name, isStaff && styles.textStaff, !isStaff && styles.textStudent]}>{user.fullName}</Text>
          <Text style={[styles.department, isStaff && styles.textStaffMuted, !isStaff && styles.textStudentMuted]}>{user.department}</Text>
          
          <View style={styles.badgesRow}>
            <View style={[styles.roleBadge, isStaff ? styles.roleBadgeStaff : styles.roleBadgeStudent]}>
              <Ionicons name={isStaff ? "briefcase" : "school"} size={12} color={isStaff ? colors.primary : colors.primaryContrast} />
              <Text style={[styles.roleBadgeText, isStaff ? styles.textPrimary : styles.textStudent]}>
                {isStaff ? "Organizer" : "Student"}
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={[styles.levelBadgeText, !isStaff && styles.textStudent]}>{user.level || "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>

      <SectionTitle title={isStaff ? "ORGANIZER TOOLS" : "MY HUB"} colors={colors} />
      
      {isStaff ? (
        <View style={styles.actionGrid}>
          <GridTile 
            icon="add-circle" 
            label="Create Event" 
            color={colors.primary} 
            onPress={onCreateEvent} 
            styles={styles} 
          />
          <GridTile 
            icon="megaphone" 
            label="Send Announcement" 
            color={colors.accent} 
            onPress={onOpenAnnouncement} 
            styles={styles} 
          />
          <GridTile 
            icon="calendar" 
            label="Manage Hosted Events" 
            color={colors.success || "#10b981"} 
            onPress={onOpenMyEvents} 
            styles={styles} 
            fullWidth
          />
        </View>
      ) : (
        <View style={styles.actionGrid}>
          <GridTile 
            icon="bookmark" 
            label="Saved Events" 
            color={colors.accent} 
            onPress={onOpenSavedEvents} 
            styles={styles} 
          />
          <GridTile 
            icon="ticket" 
            label={`Registrations (${totalRegistered})`} 
            color={colors.primary} 
            onPress={onOpenMyEvents} 
            styles={styles} 
          />
        </View>
      )}

      <SectionTitle title="PREFERENCES & SETTINGS" colors={colors} />
      <View style={styles.listCard}>
        <View style={styles.preferenceRow}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconWrap, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="moon" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={themeMode === "dark"}
            onValueChange={onToggleTheme}
            trackColor={{ false: colors.borderSoft, true: colors.primary }}
            thumbColor={colors.primaryContrast}
          />
        </View>
        
        <Divider colors={colors} />
        
        <ActionRow 
          icon="notifications" 
          label="Notifications" 
          colors={colors} 
          onPress={onOpenNotifications} 
        />
        
        <Divider colors={colors} />
        
        <ActionRow 
          icon="help-buoy" 
          label="Help & Support" 
          colors={colors} 
          onPress={() => {}} 
        />
      </View>

      <ScalePressable style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
        <Text style={styles.logoutText}>Log Out securely</Text>
      </ScalePressable>
    </ScrollView>
  );
}

function GridTile({ icon, label, color, fullWidth, onPress, styles }) {
  return (
    <ScalePressable 
      style={[styles.gridTile, fullWidth && styles.gridTileFull]} 
      onPress={onPress}
    >
      <View style={[styles.gridTileIconWrap, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.gridTileLabel}>{label}</Text>
    </ScalePressable>
  );
}

function ActionRow({ icon, label, colors, onPress }) {
  return (
    <ScalePressable style={stylesStatic.actionRow} onPress={onPress}>
      <View style={stylesStatic.rowLeft}>
        <View style={[stylesStatic.rowIconWrap, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>
        <Text style={[stylesStatic.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
    </ScalePressable>
  );
}

function SectionTitle({ title, colors }) {
  return <Text style={[stylesStatic.sectionTitle, { color: colors.textSubtle }]}>{title}</Text>;
}

function Divider({ colors }) {
  return <View style={[stylesStatic.divider, { backgroundColor: colors.borderSoft }]} />;
}

const stylesStatic = StyleSheet.create({
  sectionTitle: {
    fontSize: ms(12),
    fontFamily: "Outfit_900Black",
    letterSpacing: 1,
    marginBottom: scale(12),
    marginTop: scale(10),
    paddingHorizontal: scale(4),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: scale(12),
    paddingHorizontal: scale(14),
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  rowIconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: ms(14),
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginHorizontal: scale(14),
  },
});

const getStyles = (colors, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: scale(16),
    paddingBottom: scale(40),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(16),
  },
  title: {
    color: colors.text,
    fontSize: ms(32),
    fontFamily: "Outfit_900Black",
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  profileCard: {
    borderRadius: scale(20),
    padding: scale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileCardStudent: {
    backgroundColor: colors.primary,
  },
  profileCardStaff: {
    backgroundColor: isDark ? colors.surface : "#1e293b",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primaryContrast,
  },
  editButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    marginTop: scale(16),
  },
  name: {
    fontSize: ms(24),
    fontFamily: "Outfit_900Black",
    marginBottom: scale(2),
    color: colors.primaryContrast,
  },
  department: {
    fontSize: ms(13),
    fontWeight: "600",
    color: colors.primaryContrast,
    opacity: 0.8,
    marginBottom: scale(12),
  },
  textStaff: { color: "#ffffff" },
  textStaffMuted: { color: "rgba(255, 255, 255, 0.7)" },
  textStudent: { color: colors.primaryContrast },
  textStudentMuted: { color: colors.primaryContrast, opacity: 0.8 },
  textPrimary: { color: colors.primary },
  badgesRow: {
    flexDirection: "row",
    gap: scale(8),
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: 999,
  },
  roleBadgeStudent: { backgroundColor: "rgba(255,255,255,0.2)" },
  roleBadgeStaff: { backgroundColor: colors.surfaceAlt },
  roleBadgeText: {
    fontSize: ms(11),
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  levelBadge: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    borderRadius: 999,
  },
  levelBadgeText: {
    color: colors.primaryContrast,
    fontSize: ms(11),
    fontWeight: "800",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(12),
  },
  gridTile: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surface,
    padding: scale(16),
    borderRadius: scale(16),
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: colors.borderSoft,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridTileFull: {
    minWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  gridTileIconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(12),
  },
  gridTileLabel: {
    fontSize: ms(13),
    fontWeight: "800",
    color: colors.text,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: scale(12),
    paddingHorizontal: scale(14),
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
  },
  rowIconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: ms(14),
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: scale(8),
    marginTop: scale(24),
    padding: scale(14),
    borderRadius: scale(14),
    backgroundColor: colors.error + "15",
  },
  logoutText: {
    color: colors.error,
    fontSize: ms(14),
    fontWeight: "800",
  },
});
