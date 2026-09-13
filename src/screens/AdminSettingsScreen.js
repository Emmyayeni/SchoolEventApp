import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { AppText } from "../components/AppText";
import { AppTextInput } from "../components/AppTextInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function AdminSettingsScreen({
  settings = {
    autoApproveEvents: false,
    requireEventDescription: true,
    maxEventsPerUser: 5,
    sendNotifications: true,
    maintenanceMode: false,
  },
  onBack,
  onUpdateSettings,
  onEditProfile,
  onChangePassword,
  onLogout,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [localSettings, setLocalSettings] = useState(settings);
  const [maxEvents, setMaxEvents] = useState(String(settings.maxEventsPerUser || 5));

  const handleToggleSetting = (key) => {
    const updated = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(updated);
    onUpdateSettings?.(updated);
  };

  const handleMaxEventsChange = (value) => {
    setMaxEvents(value);
    const num = parseInt(value) || 5;
    const updated = { ...localSettings, maxEventsPerUser: num };
    setLocalSettings(updated);
    onUpdateSettings?.(updated);
  };

  const handleChangePassword = () => {
    Alert.alert("Change Password", "Please update your password from the main settings or auth screen.");
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: onLogout,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={colors.accent} />
        </Pressable>
        <AppText style={[styles.title, { color: colors.text }]}>Admin Settings</AppText>
        <View style={styles.backBtn} />
      </View>

      {/* Personal Account Settings */}
      <Section title="Personal Account" colors={colors} styles={styles}>
        <SettingButton
          icon="person-circle-outline"
          label="Edit My Profile"
          description="Update your name and profile details"
          onPress={onEditProfile}
          colors={colors}
          styles={styles}
        />
      </Section>

      {/* Event Management Settings */}
      <Section title="Event Management" colors={colors} styles={styles}>
        <SettingToggle
          label="Auto-approve Events"
          description="Automatically approve new events without admin review"
          value={localSettings.autoApproveEvents}
          onToggle={() => handleToggleSetting("autoApproveEvents")}
          colors={colors}
          styles={styles}
        />
        <SettingToggle
          label="Require Event Description"
          description="Event organizers must provide a detailed description"
          value={localSettings.requireEventDescription}
          onToggle={() => handleToggleSetting("requireEventDescription")}
          colors={colors}
          styles={styles}
        />
        <View style={[styles.settingItem, { borderBottomColor: colors.borderSoft }]}>
          <View style={styles.settingLabel}>
            <AppText style={[styles.settingLabelText, { color: colors.text }]}>Max Events Per User</AppText>
            <AppText style={[styles.settingDesc, { color: colors.textMuted }]}>
              Limit the number of events one user can create
            </AppText>
          </View>
          <AppTextInput
            style={[styles.numberInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            value={maxEvents}
            onChangeText={handleMaxEventsChange}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      </Section>

      {/* Notification Settings */}
      <Section title="Notifications" colors={colors} styles={styles}>
        <SettingToggle
          label="Enable Notifications"
          description="Send notifications to users about events and updates"
          value={localSettings.sendNotifications}
          onToggle={() => handleToggleSetting("sendNotifications")}
          colors={colors}
          styles={styles}
        />
      </Section>

      {/* Maintenance & System */}
      <Section title="System" colors={colors} styles={styles}>
        <SettingToggle
          label="Maintenance Mode"
          description="Put the app in maintenance mode (users will see a message)"
          value={localSettings.maintenanceMode}
          onToggle={() => handleToggleSetting("maintenanceMode")}
          colors={colors}
          styles={styles}
          warning
        />
      </Section>

      {/* Security Settings */}
      <Section title="Security & Account" colors={colors} styles={styles}>
        <SettingButton
          icon="key-outline"
          label="Change Password"
          description="Update your admin account password"
          onPress={handleChangePassword}
          colors={colors}
          styles={styles}
        />
        <SettingButton
          icon="shield-checkmark-outline"
          label="Two-Factor Authentication"
          description="Secure your account with 2FA"
          onPress={() => Alert.alert("2FA", "Two-factor authentication is coming soon")}
          colors={colors}
          styles={styles}
        />
      </Section>

      {/* About & Logout */}
      <Section title="About" colors={colors} styles={styles}>
        <View style={[styles.settingItem, { borderBottomColor: colors.borderSoft }]}>
          <View style={styles.settingLabel}>
            <AppText style={[styles.settingLabelText, { color: colors.text }]}>App Version</AppText>
            <AppText style={[styles.settingDesc, { color: colors.textMuted }]}>1.0.0</AppText>
          </View>
        </View>
      </Section>

      {/* Logout Button */}
      <Pressable
        style={[styles.logoutButton, { backgroundColor: colors.error + "20" }]}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Logout"
      >
        <Ionicons name="log-out" size={18} color={colors.error} />
        <AppText style={[styles.logoutButtonText, { color: colors.error }]}>Logout</AppText>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children, colors, styles }) {
  return (
    <View style={styles.section}>
      <AppText style={[styles.sectionTitle, { color: colors.accent }]}>{title}</AppText>
      <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}>
        {children}
      </View>
    </View>
  );
}

function SettingToggle({ label, description, value, onToggle, colors, styles, warning }) {
  return (
    <View style={[styles.settingItem, { borderBottomColor: colors.borderSoft }]}>
      <View style={styles.settingLabel}>
        <AppText style={[styles.settingLabelText, { color: colors.text }]}>{label}</AppText>
        <AppText style={[styles.settingDesc, { color: colors.textMuted }]}>{description}</AppText>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + "60" }}
        thumbColor={value ? colors.primary : colors.textSubtle}
        accessibilityLabel={label}
      />
    </View>
  );
}

function SettingButton({ icon, label, description, onPress, colors, styles }) {
  return (
    <Pressable
      style={[styles.settingItem, { borderBottomColor: colors.borderSoft }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.buttonIcon, { backgroundColor: colors.primary + "20" }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.settingLabel}>
        <AppText style={[styles.settingLabelText, { color: colors.text }]}>{label}</AppText>
        <AppText style={[styles.settingDesc, { color: colors.textMuted }]}>{description}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
    </Pressable>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: scale(14),
      paddingBottom: scale(24),
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scale(20),
    },
    backBtn: {
      width: scale(28),
      height: scale(28),
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: ms(18),
      fontWeight: "800",
    },
    section: {
      marginBottom: scale(18),
    },
    sectionTitle: {
      fontSize: ms(12),
      fontWeight: "800",
      marginBottom: scale(8),
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    sectionContent: {
      borderRadius: scale(12),
      borderWidth: 1,
      overflow: "hidden",
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: scale(12),
      paddingVertical: scale(12),
      borderBottomWidth: 1,
    },
    settingLabel: {
      flex: 1,
    },
    settingLabelText: {
      fontSize: ms(13),
      fontWeight: "700",
      marginBottom: scale(2),
    },
    settingDesc: {
      fontSize: ms(11),
      fontWeight: "500",
    },
    buttonIcon: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      alignItems: "center",
      justifyContent: "center",
      marginRight: scale(10),
    },
    numberInput: {
      width: scale(50),
      borderWidth: 1,
      borderRadius: scale(8),
      textAlign: "center",
      fontSize: ms(13),
      fontWeight: "700",
      paddingVertical: scale(6),
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scale(10),
      marginTop: scale(24),
      paddingVertical: scale(12),
      borderRadius: scale(10),
    },
    logoutButtonText: {
      fontSize: ms(14),
      fontWeight: "700",
    },
  });
