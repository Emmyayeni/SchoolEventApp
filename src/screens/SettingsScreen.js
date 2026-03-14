import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { scale } from "../utils/responsive";
export default function SettingsScreen({ onBack, onLogout }) {
  const { colors } = useAppTheme();
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
          <Ionicons name="arrow-back" size={20} color="#1f2937" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerBadge}>
          <Ionicons name="settings" size={10} color="#0b7a24" />
        </View>
      </View>

      <SectionTitle title="ACCOUNT" />
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
        <SettingsRow icon="lock-closed" label="Password change" />
        <Divider />
        <SettingsRow icon="shield-checkmark" label="Privacy settings" />
      </View>

      <SectionTitle title="NOTIFICATIONS" />
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
        <ToggleRow
          icon="notifications"
          label="Push Notifications"
          value={pushEnabled}
          onValueChange={setPushEnabled}
        />
        <Divider />
        <ToggleRow
          icon="mail"
          label="Email Updates"
          value={emailEnabled}
          onValueChange={setEmailEnabled}
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

      <SectionTitle title="APP INFO" />
      <View style={[styles.groupCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}> 
        <SettingsRow icon="document-text" label="Terms and conditions" />
        <Divider />
        <SettingsRow icon="code-slash" label="About developers" />
        <Divider />
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <View style={styles.iconWrap}>
              <Ionicons name="information-circle" size={15} color="#0b7a24" />
            </View>
            <Text style={styles.rowText}>Version</Text>
          </View>
          <View style={styles.versionTag}>
            <Text style={styles.versionText}>v2.4.1-stable</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={16} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function SettingsRow({ icon, label }) {
  return (
    <Pressable style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={15} color="#0b7a24" />
        </View>
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color="#94a3b8" />
    </Pressable>
  );
}

function ToggleRow({ icon, label, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={15} color="#0b7a24" />
        </View>
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#d5dbe2", true: "#0b7a24" }}
        thumbColor="#ffffff"
        ios_backgroundColor="#d5dbe2"
      />
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9ecea",
  },
  content: {
    paddingHorizontal: scale(14),
    paddingTop: 8,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  backButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
  },
  headerBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#d8e9dc",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "900",
    color: "#166534",
    letterSpacing: 0.8,
  },
  groupCard: {
    borderRadius: 16,
    backgroundColor: "#f2f4f3",
    borderWidth: 1,
    borderColor: "#dfe5e2",
    overflow: "hidden",
  },
  row: {
    minHeight: 58,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dbe9df",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    fontSize: 23,
    fontWeight: "700",
    color: "#111827",
  },
  divider: {
    height: 1,
    marginLeft: 54,
    backgroundColor: "#dde3e0",
  },
  reminderSection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
  },
  reminderLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#dce7dd",
  },
  pillActive: {
    backgroundColor: "#0b7a24",
  },
  pillText: {
    fontSize: 12,
    color: "#51705b",
    fontWeight: "800",
  },
  pillTextActive: {
    color: "#ffffff",
  },
  versionTag: {
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#dce7dd",
  },
  versionText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "800",
  },
  logoutBtn: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f4bcc2",
    backgroundColor: "#f6edee",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 22,
    fontWeight: "800",
  },
});