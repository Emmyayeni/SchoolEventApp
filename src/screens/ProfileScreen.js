import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "../components/Avatar";
import { AppText } from "../components/AppText";
import { ScalePressable } from "../components/ScalePressable";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function ProfileScreen({
  user = {},
  isStaff = false,
  totalRegistered = 0,
  favoriteCategory,
  themeMode = "system",
  onThemeModeChange,
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

  const matricOrStaffId =
    user?.matricNumber ||
    user?.staffId ||
    "Not provided";

  const isAdmin = user?.accountType === "admin";

  const getPassGradient = () => {
    if (isAdmin) {
      return ["#1e1b4b", "#312e81", "#4338ca"];
    }
    if (isStaff) {
      return isDark ? ["#064e3b", "#065f46", "#047857"] : ["#0b7a24", "#15803d", "#14532d"];
    }
    return ["#0b7a24", "#15803d", "#166534"];
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: (insets?.top ?? 0) + scale(10) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <AppText style={styles.title}>My Profile</AppText>
          <AppText style={styles.subtitle}>NSUK Events</AppText>
        </View>
        <ScalePressable
          style={styles.settingsBtn}
          onPress={onOpenSettings}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-sharp" size={18} color={colors.text} />
        </ScalePressable>
      </View>

      {/* Digital Campus Pass / Virtual Student ID Card */}
      <View style={styles.cardShadowWrap}>
        <LinearGradient
          colors={getPassGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.passCard}
        >
          {/* Card Top Strip */}
          <View style={styles.passTopRow}>
            <View style={styles.passInstitutionGroup}>
              <Ionicons name="school" size={14} color="rgba(255,255,255,0.9)" />
              <AppText style={styles.passInstitutionText}>
                NASARAWA STATE UNIVERSITY
              </AppText>
            </View>
            <View style={styles.passTypeChip}>
              <AppText style={styles.passTypeChipText}>
                {isAdmin ? "SYSTEM ADMIN" : isStaff ? "STAFF" : "STUDENT"}
              </AppText>
            </View>
          </View>

          {/* Card Main Body */}
          <View style={styles.passBodyRow}>
            <View style={styles.avatarWrap}>
              <Avatar uri={user.avatar} name={user.fullName} size={72} style={styles.avatar} />

            </View>

            <View style={styles.passInfoCol}>
              <AppText style={styles.passName} numberOfLines={2}>
                {user.fullName || (isStaff ? "Faculty Member" : "Student Member")}
              </AppText>
              <AppText style={styles.passDepartment} numberOfLines={1}>
                {user.department || "Department not provided"}
              </AppText>
              <View style={styles.passIdRow}>
                <AppText style={styles.passIdLabel}>ID: </AppText>
                <AppText style={styles.passIdValue}>{matricOrStaffId}</AppText>
              </View>
            </View>


          </View>

          {/* Card Bottom Bar */}
          <View style={styles.passBottomRow}>
            <View style={styles.badgeCluster}>
              <View style={styles.levelBadge}>
                <AppText style={styles.levelBadgeText}>
                  {isAdmin
                    ? "Admin"
                    : isStaff
                    ? user.roleDesignation || "Organizer"
                    : user.level || "Level not provided"}
                </AppText>
              </View>
              {user.faculty && (
                <View style={styles.facultyBadge}>
                  <AppText style={styles.facultyBadgeText} numberOfLines={1}>
                    {user.faculty}
                  </AppText>
                </View>
              )}
            </View>


          </View>
        </LinearGradient>
      </View>

      <ActionRow icon="create-outline" label="Edit profile" colors={colors} onPress={onEditProfile} />

      {/* Action Hub */}
      <SectionTitle
        title={isStaff ? "ORGANIZER TOOLS" : "CAMPUS ACTIVITIES"}
        colors={colors}
      />

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
            label="Broadcast Alert"
            color={colors.accent}
            onPress={onOpenAnnouncement}
            styles={styles}
          />
          <GridTile
            icon="calendar"
            label="Manage Hosted Events"
            color="#10b981"
            onPress={onOpenMyEvents}
            styles={styles}
            fullWidth
          />
        </View>
      ) : (
        <View style={styles.actionGrid}>
          <GridTile
            icon="ticket"
            label={`My Registrations (${totalRegistered})`}
            color={colors.primary}
            onPress={onOpenMyEvents}
            styles={styles}
          />
          <GridTile
            icon="bookmark"
            label="Saved Events"
            color={colors.accent}
            onPress={onOpenSavedEvents}
            styles={styles}
          />
        </View>
      )}

      {/* Preferences & Settings */}
      <SectionTitle title="PREFERENCES & SETTINGS" colors={colors} />
      <View style={styles.listCard}>
        <View style={[styles.preferenceRow, { flexDirection: "column", alignItems: "stretch", gap: 12 }]}>
          <View style={styles.preferenceIdentity}>
            <View
              style={[
                styles.preferenceIcon,
                { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : colors.surfaceAlt },
              ]}
            >
              <Ionicons name={themeMode === "dark" ? "moon" : themeMode === "light" ? "sunny" : "phone-portrait"} size={16} color={colors.primary} />
            </View>
            <View>
              <AppText style={styles.preferenceLabel}>Appearance</AppText>
              <AppText style={styles.preferenceHint}>{themeMode === "system" ? "Matches your phone" : `${themeMode[0].toUpperCase()}${themeMode.slice(1)} mode`}</AppText>
            </View>
          </View>
          <View style={styles.compactThemeOptions} accessibilityRole="radiogroup">
            {[
              ["system", "phone-portrait-outline"],
              ["light", "sunny-outline"],
              ["dark", "moon-outline"],
            ].map(([mode, icon]) => {
              const selected = themeMode === mode;
              return <ScalePressable
                key={mode}
                style={[styles.compactThemeButton, selected && styles.compactThemeButtonSelected]}
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  onThemeModeChange?.(mode);
                }}
                accessibilityRole="radio"
                accessibilityLabel={`${mode} appearance`}
                accessibilityState={{ checked: selected }}
              >
                <Ionicons name={icon} size={17} color={selected ? colors.primaryContrast : colors.textMuted} />
                <AppText style={{ fontSize: ms(12), color: selected ? colors.primaryContrast : colors.textMuted }}>{mode[0].toUpperCase() + mode.slice(1)}</AppText>
              </ScalePressable>;
            })}
          </View>
        </View>

        <Divider colors={colors} />

        <ActionRow
          icon="notifications-outline"
          label="Notification Alerts"
          colors={colors}
          onPress={onOpenNotifications}
        />

        <Divider colors={colors} />

        <ActionRow
          icon="shield-checkmark-outline"
          label="Security & Password"
          colors={colors}
          onPress={onOpenSettings}
        />
      </View>

      {/* Secure Logout */}
      <ScalePressable
        style={styles.logoutBtn}
        onPress={onLogout}
        accessibilityRole="button"
        accessibilityLabel="Log out securely"
      >
        <Ionicons name="log-out-outline" size={18} color={colors.error} />
        <AppText style={styles.logoutText}>Log Out</AppText>
      </ScalePressable>


    </ScrollView>
  );
}

function GridTile({ icon, label, color, fullWidth, onPress, styles }) {
  return (
    <ScalePressable
      style={[styles.gridTile, fullWidth && styles.gridTileFull]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.gridTileIconWrap, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <AppText style={styles.gridTileLabel}>{label}</AppText>
    </ScalePressable>
  );
}

function ActionRow({ icon, label, colors, onPress }) {
  return (
    <ScalePressable
      style={stylesStatic.actionRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={stylesStatic.rowLeft}>
        <View style={[stylesStatic.rowIconWrap, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name={icon} size={16} color={colors.primary} />
        </View>
        <AppText style={[stylesStatic.rowLabel, { color: colors.text }]}>{label}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
    </ScalePressable>
  );
}

function SectionTitle({ title, colors }) {
  return <AppText style={[stylesStatic.sectionTitle, { color: colors.textSubtle }]}>{title}</AppText>;
}

function Divider({ colors }) {
  return <View style={[stylesStatic.divider, { backgroundColor: colors.borderSoft }]} />;
}

const stylesStatic = StyleSheet.create({
  sectionTitle: {
    fontSize: ms(11),
    fontFamily: "Outfit_800ExtraBold",
    letterSpacing: 1,
    marginBottom: scale(10),
    marginTop: scale(18),
    paddingHorizontal: scale(2),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: scale(13),
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

const getStyles = (colors, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: scale(16),
      paddingBottom: scale(60),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(16),
    },
    title: {
      color: colors.text,
      fontSize: ms(26),
      fontFamily: "Outfit_900Black",
      letterSpacing: -0.5,
    },
    subtitle: {
      color: colors.textSubtle,
      fontSize: ms(12),
      fontWeight: "600",
      marginTop: scale(1),
    },
    settingsBtn: {
      width: scale(38),
      height: scale(38),
      borderRadius: scale(19),
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    cardShadowWrap: {
      borderRadius: scale(22),
      shadowColor: "#0b7a24",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.35 : 0.18,
      shadowRadius: 18,
      elevation: 8,
      marginBottom: scale(16),
    },
    passCard: {
      borderRadius: scale(22),
      padding: scale(18),
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    passTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(14),
    },
    passInstitutionGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
    },
    passInstitutionText: {
      color: "rgba(255,255,255,0.92)",
      fontSize: ms(10),
      fontFamily: "Outfit_800ExtraBold",
      letterSpacing: 0.8,
    },
    passTypeChip: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: scale(8),
      paddingVertical: scale(3),
      borderRadius: scale(10),
    },
    passTypeChipText: {
      color: "#ffffff",
      fontSize: ms(9),
      fontFamily: "Outfit_800ExtraBold",
      letterSpacing: 0.5,
    },
    passBodyRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: scale(16),
    },
    avatarWrap: {
      position: "relative",
    },
    avatar: {
      width: scale(62),
      height: scale(62),
      borderRadius: scale(31),
      borderWidth: 2.5,
      borderColor: "rgba(255, 255, 255, 0.4)",
    },
    verifiedBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#10b981",
      width: scale(18),
      height: scale(18),
      borderRadius: scale(9),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: "#ffffff",
    },
    passInfoCol: {
      flex: 1,
      marginLeft: scale(14),
    },
    passName: {
      color: "#ffffff",
      fontSize: ms(18),
      fontFamily: "Outfit_900Black",
    },
    passDepartment: {
      color: "rgba(255, 255, 255, 0.82)",
      fontSize: ms(12),
      fontWeight: "500",
      marginTop: 2,
    },
    passIdRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    passIdLabel: {
      color: "rgba(255, 255, 255, 0.65)",
      fontSize: ms(10),
      fontFamily: "Outfit_700Bold",
    },
    passIdValue: {
      color: "#ffffff",
      fontSize: ms(11),
      fontFamily: "Outfit_700Bold",
      letterSpacing: 0.5,
    },
    editButton: {
      width: scale(34),
      height: scale(34),
      borderRadius: scale(17),
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    passBottomRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.15)",
      paddingTop: scale(12),
    },
    badgeCluster: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(6),
      flex: 1,
    },
    levelBadge: {
      backgroundColor: "rgba(255, 255, 255, 0.22)",
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      borderRadius: 999,
    },
    levelBadgeText: {
      color: "#ffffff",
      fontSize: ms(10),
      fontFamily: "Outfit_800ExtraBold",
    },
    facultyBadge: {
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      paddingHorizontal: scale(8),
      paddingVertical: scale(4),
      borderRadius: 999,
      maxWidth: scale(110),
    },
    facultyBadgeText: {
      color: "rgba(255, 255, 255, 0.9)",
      fontSize: ms(10),
      fontWeight: "600",
    },
    qrPassBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      backgroundColor: "#ffffff",
      paddingHorizontal: scale(10),
      paddingVertical: scale(5),
      borderRadius: 999,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    qrPassBtnText: {
      color: "#0b7a24",
      fontSize: ms(11),
      fontFamily: "Outfit_800ExtraBold",
    },
    statsRow: {
      flexDirection: "row",
      gap: scale(10),
      marginBottom: scale(8),
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: scale(14),
      paddingVertical: scale(12),
      paddingHorizontal: scale(10),
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    statValue: {
      fontSize: ms(17),
      fontFamily: "Outfit_800ExtraBold",
      color: colors.text,
    },
    statValueText: {
      fontSize: ms(14),
      fontFamily: "Outfit_800ExtraBold",
      color: colors.text,
    },
    statLabel: {
      fontSize: ms(11),
      fontWeight: "500",
      color: colors.textSubtle,
      marginTop: scale(2),
    },
    verifiedDotRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
    },
    statusActiveDot: {
      width: scale(8),
      height: scale(8),
      borderRadius: scale(4),
      backgroundColor: "#10b981",
    },
    actionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: scale(10),
    },
    gridTile: {
      flex: 1,
      minWidth: "46%",
      backgroundColor: colors.surface,
      padding: scale(14),
      borderRadius: scale(16),
      alignItems: "flex-start",
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    gridTileFull: {
      minWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12),
    },
    gridTileIconWrap: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(10),
    },
    gridTileLabel: {
      fontSize: ms(13),
      fontFamily: "Outfit_700Bold",
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
      gap: scale(10),
    },
    preferenceIdentity: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    preferenceIcon: {
      width: scale(32),
      height: scale(32),
      borderRadius: scale(16),
      alignItems: "center",
      justifyContent: "center",
    },
    preferenceLabel: {
      color: colors.text,
      fontSize: ms(14),
      fontWeight: "600",
    },
    preferenceHint: {
      color: colors.textSubtle,
      fontSize: ms(10),
      marginTop: scale(2),
    },
    compactThemeOptions: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(5),
    },
    compactThemeButton: {
      width: 72,
      minHeight: 60,
      gap: 4,
      borderRadius: scale(12),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    compactThemeButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(8),
      marginTop: scale(20),
      padding: scale(14),
      borderRadius: scale(14),
      backgroundColor: colors.error + "15",
    },
    logoutText: {
      color: colors.error,
      fontSize: ms(14),
      fontFamily: "Outfit_800ExtraBold",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
      padding: scale(20),
    },
    modalContent: {
      width: "100%",
      maxWidth: scale(340),
      backgroundColor: colors.surface,
      borderRadius: scale(24),
      padding: scale(20),
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    modalHeader: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(16),
    },
    modalTitle: {
      fontSize: ms(17),
      fontFamily: "Outfit_800ExtraBold",
      color: colors.text,
    },
    qrContainer: {
      alignItems: "center",
      backgroundColor: "#ffffff",
      borderRadius: scale(18),
      padding: scale(16),
      width: "100%",
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },
    qrPlaceholder: {
      padding: scale(10),
      backgroundColor: "#f8fafc",
      borderRadius: scale(12),
      marginBottom: scale(10),
    },
    qrStudentName: {
      fontSize: ms(16),
      fontFamily: "Outfit_900Black",
      color: "#0f172a",
    },
    qrStudentId: {
      fontSize: ms(12),
      fontFamily: "Outfit_700Bold",
      color: "#64748b",
      marginTop: 2,
    },
    qrStatusChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(4),
      marginTop: scale(10),
      backgroundColor: "#ecfdf5",
      paddingHorizontal: scale(10),
      paddingVertical: scale(4),
      borderRadius: 999,
    },
    qrStatusText: {
      fontSize: ms(11),
      fontFamily: "Outfit_700Bold",
      color: "#065f46",
    },
    qrHint: {
      fontSize: ms(11),
      color: colors.textSubtle,
      textAlign: "center",
      marginTop: scale(14),
      marginBottom: scale(16),
      lineHeight: ms(16),
    },
    modalCloseBtn: {
      width: "100%",
      backgroundColor: colors.primary,
      paddingVertical: scale(12),
      borderRadius: scale(14),
      alignItems: "center",
    },
    modalCloseBtnText: {
      color: "#ffffff",
      fontSize: ms(14),
      fontFamily: "Outfit_800ExtraBold",
    },
  });
