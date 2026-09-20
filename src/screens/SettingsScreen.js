import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";
const APPEARANCE_MODES = [
  { key: "system", label: "System", icon: "phone-portrait-outline" },
  { key: "light", label: "Light", icon: "sunny-outline" },
  { key: "dark", label: "Dark", icon: "moon-outline" },
];

export default function SettingsScreen({ themeMode, onThemeModeChange, onBack, onLogout, onChangePassword }) {
  const { colors, resolvedMode } = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const openDeviceSettings = () => Platform.OS === "web"
    ? Alert.alert("Device notifications", "Open the installed mobile app to manage event notifications.")
    : Linking.openSettings().catch(() => Alert.alert("Settings unavailable", "Open your device settings and select NSUK Events."));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <AppText style={[styles.headerTitle, { color: colors.text }]}>Settings</AppText>
        <View style={styles.headerBadge}>
          <Ionicons name="settings" size={10} color={colors.primary} />
        </View>
      </View>

      <SectionTitle title="ACCOUNT & APPEARANCE" colors={colors} styles={styles} />
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
        <SettingsRow icon="lock-closed" label="Password change" onPress={onChangePassword} colors={colors} styles={styles} />
        <Divider styles={styles} />
        <SettingsRow icon="shield-checkmark" label="Device permissions" onPress={openDeviceSettings} colors={colors} styles={styles} />
        <Divider styles={styles} />
        <View style={styles.appearanceSection}>
          <View style={styles.appearanceHeading}>
            <View style={styles.iconWrap}><Ionicons name="color-palette-outline" size={16} color={colors.primary} /></View>
            <View style={styles.appearanceCopy}>
              <AppText style={styles.rowText}>Appearance</AppText>
              <AppText style={styles.appearanceHint}>{themeMode === "system" ? `Following your phone · ${resolvedMode}` : `${themeMode[0].toUpperCase()}${themeMode.slice(1)} mode selected`}</AppText>
            </View>
          </View>
          <View style={styles.themeOptions} accessibilityRole="radiogroup">
            {APPEARANCE_MODES.map(option => {
              const selected = themeMode === option.key;
              return <Pressable
                key={option.key}
                onPress={() => onThemeModeChange?.(option.key)}
                style={({ pressed }) => [styles.themeOption, selected && styles.themeOptionSelected, pressed && { opacity: 0.78 }]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${option.label} appearance`}
              >
                <View style={[styles.themeIcon, selected && styles.themeIconSelected]}><Ionicons name={option.icon} size={19} color={selected ? colors.primaryContrast : colors.textMuted} /></View>
                <AppText style={[styles.themeLabel, selected && styles.themeLabelSelected]}>{option.label}</AppText>
                {selected && <Ionicons name="checkmark-circle" size={17} color={colors.primary} />}
              </Pressable>;
            })}
          </View>
        </View>
      </View>

      <SectionTitle title="NOTIFICATIONS" colors={colors} styles={styles} />
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
        <SettingsRow icon="notifications" label="Manage device notifications" onPress={openDeviceSettings} colors={colors} styles={styles} />

        <View style={styles.reminderSection}>
          <AppText style={styles.reminderLabel}>REMINDER TIMING</AppText>
          <AppText style={{ color: colors.textMuted }}>When notifications are available, registering sets a reminder 15 minutes before the event.</AppText>
        </View>
      </View>

      <SectionTitle title="APP INFO" colors={colors} styles={styles} />
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
        <SettingsRow icon="code-slash" label="About this project" onPress={() => Alert.alert("NSUK Events", "A campus event information system developed by Ayeni Adeniyi Emmanuel for the Department of Computer Science, Nasarawa State University, Keffi.")} colors={colors} styles={styles} />
        <Divider styles={styles} />
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={styles.iconWrap}>
              <Ionicons name="information-circle" size={15} color={colors.primary} />
            </View>
            <AppText style={styles.rowText}>Version</AppText>
          </View>
          <View style={styles.versionTag}>
            <AppText style={styles.versionText}>v1.0.0</AppText>
          </View>
        </View>
      </View>

      <Pressable
        style={styles.logoutBtn}
        onPress={onLogout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <Ionicons name="log-out-outline" size={16} color={colors.error} />
        <AppText style={styles.logoutText}>Logout</AppText>
      </Pressable>
    </ScrollView>
  );
}

function SectionTitle({ title, colors, styles }) {
  return <AppText style={styles.sectionTitle}>{title}</AppText>;
}

function SettingsRow({ icon, label, colors, styles, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={15} color={colors.primary} />
        </View>
        <AppText style={styles.rowText}>{label}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.textSubtle} />
    </Pressable>
  );
}

function Divider({ styles }) {
  return <View style={styles.divider} />;
}

const getStyles = (colors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: scale(16),
    paddingTop: scale(8),
    paddingBottom: scale(28),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(12),
    marginBottom: scale(14),
  },
  backButton: {
    width: scale(30),
    height: scale(30),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: ms(24),
    fontWeight: "800",
    color: colors.text,
  },
  headerBadge: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginTop: scale(14),
    marginBottom: scale(8),
    fontSize: ms(11),
    fontWeight: "900",
    color: colors.accent,
    letterSpacing: 1,
  },
  groupCard: {
    borderRadius: scale(16),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  row: {
    minHeight: scale(56),
    paddingHorizontal: scale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
    flex: 1,
  },
  iconWrap: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    fontSize: ms(14),
    fontWeight: "700",
    color: colors.text,
  },
  appearanceSection: {
    padding: scale(14),
    gap: scale(13),
  },
  appearanceHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10),
  },
  appearanceCopy: {
    flex: 1,
  },
  appearanceHint: {
    marginTop: scale(2),
    color: colors.textSubtle,
    fontSize: ms(11),
  },
  themeOptions: {
    flexDirection: "row",
    gap: scale(8),
  },
  themeOption: {
    flex: 1,
    minHeight: scale(76),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: scale(5),
    padding: scale(8),
  },
  themeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accentTint,
  },
  themeIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  themeIconSelected: {
    backgroundColor: colors.primary,
  },
  themeLabel: {
    color: colors.textMuted,
    fontSize: ms(11),
    fontWeight: "700",
  },
  themeLabelSelected: {
    color: colors.text,
  },
  divider: {
    height: 1,
    marginLeft: scale(58),
    backgroundColor: colors.borderSoft,
  },
  reminderSection: {
    paddingHorizontal: scale(14),
    paddingBottom: scale(14),
    paddingTop: scale(6),
  },
  reminderLabel: {
    fontSize: ms(11),
    fontWeight: "800",
    color: colors.textSubtle,
    letterSpacing: 0.8,
    marginBottom: scale(8),
  },
  pillRow: {
    flexDirection: "row",
    gap: scale(8),
    flexWrap: "wrap",
  },
  pill: {
    borderRadius: 999,
    paddingVertical: scale(7),
    paddingHorizontal: scale(12),
    backgroundColor: colors.surfaceAlt,
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: ms(11),
    color: colors.textMuted,
    fontWeight: "800",
  },
  pillTextActive: {
    color: colors.primaryContrast,
  },
  versionTag: {
    borderRadius: 999,
    paddingVertical: scale(5),
    paddingHorizontal: scale(8),
    backgroundColor: colors.surfaceAlt,
  },
  versionText: {
    color: colors.accent,
    fontSize: ms(10),
    fontWeight: "800",
  },
  logoutBtn: {
    marginTop: scale(18),
    minHeight: scale(50),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: scale(8),
  },
  logoutText: {
    color: colors.error,
    fontSize: ms(14),
    fontWeight: "800",
  },
  });
