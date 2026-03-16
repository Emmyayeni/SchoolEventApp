import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";
export default function SettingsScreen({ onBack, onLogout }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [reminderTiming, setReminderTiming] = useState("15m before");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: (insets?.top ?? 0) + scale(8) }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerBadge}>
          <Ionicons name="settings" size={10} color={colors.primary} />
        </View>
      </View>

      <SectionTitle title="ACCOUNT" colors={colors} styles={styles} />
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
        <SettingsRow icon="lock-closed" label="Password change" colors={colors} styles={styles} />
        <Divider styles={styles} />
        <SettingsRow icon="shield-checkmark" label="Privacy settings" colors={colors} styles={styles} />
      </View>

      <SectionTitle title="NOTIFICATIONS" colors={colors} styles={styles} />
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
        <ToggleRow
          icon="notifications"
          label="Push Notifications"
          value={pushEnabled}
          onValueChange={setPushEnabled}
          colors={colors}
          styles={styles}
        />
        <Divider styles={styles} />
        <ToggleRow
          icon="mail"
          label="Email Updates"
          value={emailEnabled}
          onValueChange={setEmailEnabled}
          colors={colors}
          styles={styles}
        />

        <View style={styles.reminderSection}>
          <Text style={styles.reminderLabel}>REMINDER TIMING</Text>
          <View style={styles.pillRow}>
            {[
              "15m before",
              "30m before",
              "1h before",
            ].map((item) => {
              const active = reminderTiming === item;
              return (
                <Pressable
                  key={item}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setReminderTiming(item)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <SectionTitle title="APP INFO" colors={colors} styles={styles} />
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
        <SettingsRow icon="document-text" label="Terms and conditions" colors={colors} styles={styles} />
        <Divider styles={styles} />
        <SettingsRow icon="code-slash" label="About developers" colors={colors} styles={styles} />
        <Divider styles={styles} />
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={styles.iconWrap}>
              <Ionicons name="information-circle" size={15} color={colors.primary} />
            </View>
            <Text style={styles.rowText}>Version</Text>
          </View>
          <View style={styles.versionTag}>
            <Text style={styles.versionText}>v2.4.1-stable</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={16} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionTitle({ title, colors, styles }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function SettingsRow({ icon, label, colors, styles }) {
  return (
    <Pressable style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={15} color={colors.primary} />
        </View>
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.textSubtle} />
    </Pressable>
  );
}

function ToggleRow({ icon, label, value, onValueChange, colors, styles }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={15} color={colors.primary} />
        </View>
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.primaryContrast}
        ios_backgroundColor={colors.border}
      />
    </View>
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