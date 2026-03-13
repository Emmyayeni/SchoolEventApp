import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useAppTheme } from "../theme/theme";

export default function ProfileScreen({
  user,
  totalRegistered,
  favoriteCategory,
  themeMode,
  onToggleTheme,
  onEditProfile,
  onOpenSettings,
  onLogout,
}) {
  const { colors, isDark } = useAppTheme();
  const styles = getStyles(colors, isDark);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            <Ionicons name="checkmark" size={12} color="#ffffff" />
          </View>
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.meta}>{user.department}</Text>
        <Text style={styles.level}>400 Level · ID: NSUK/20/0452</Text>

        <Pressable style={styles.editButton} onPress={onEditProfile}>
          <Ionicons name="create-outline" size={15} color="#ffffff" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </Pressable>
      </View>

      <SectionTitle title="ACCOUNT ACTIVITY" />
      <View style={styles.groupCard}>
        <ActionRow
          icon="ticket"
          label="My Registrations"
          value={`${totalRegistered}`}
          iconBg="#e9f7ed"
          iconColor="#0b7a24"
        />
        <Divider colors={colors} />
        <ActionRow
          icon="bookmark"
          label="Saved Events"
          value={favoriteCategory || "Campus Picks"}
          iconBg="#edf6ef"
          iconColor="#0b7a24"
        />
        <Divider colors={colors} />
        <ActionRow
          icon="notifications"
          label="Notification Settings"
          iconBg="#edf6ef"
          iconColor="#0b7a24"
        />
      </View>

      <SectionTitle title="PREFERENCES" />
      <View style={styles.groupCard}>
        <View style={styles.preferenceRow}>
          <View style={styles.rowLeft}>
            <View style={[styles.rowIconWrap, { backgroundColor: "#edf6ef" }]}>
              <Ionicons name="moon" size={14} color="#0b7a24" />
            </View>
            <Text style={styles.rowLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={themeMode === "dark"}
            onValueChange={onToggleTheme}
            trackColor={{ false: "#d5dbe2", true: "#91d7a2" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <SectionTitle title="SUPPORT & INFO" />
      <View style={styles.groupCard}>
        <ActionRow icon="help-circle" label="Help & Support" iconBg="#edf6ef" iconColor="#0b7a24" />
        <Divider colors={colors} />
        <ActionRow icon="code-slash" label="About Developers" iconBg="#edf6ef" iconColor="#0b7a24" />
      </View>

      <Pressable style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={16} color="#ef4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionTitle({ title }) {
  return <Text style={stylesStatic.sectionTitle}>{title}</Text>;
}

function Divider({ colors }) {
  return <View style={[stylesStatic.divider, { backgroundColor: colors.borderSoft }]} />;
}

function ActionRow({ icon, label, value, iconBg, iconColor }) {
  const { colors } = useAppTheme();

  return (
    <Pressable style={stylesStatic.actionRow}>
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
    backgroundColor: isDark ? colors.background : "#f0f2f1",
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0b7a24",
  },
  settingsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    borderRadius: 18,
    backgroundColor: isDark ? colors.surface : "#eef1ef",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 4,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#b7d6c0",
    padding: 3,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceAlt,
  },
  verifiedBadge: {
    position: "absolute",
    right: 0,
    bottom: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0b7a24",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  name: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.text,
  },
  meta: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: "600",
  },
  level: {
    fontSize: 14,
    color: "#0b7a24",
    fontWeight: "800",
  },
  editButton: {
    marginTop: 8,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#0b7a24",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 11,
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  groupCard: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: 2,
  },
  preferenceRow: {
    minHeight: 54,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoutBtn: {
    borderRadius: 14,
    backgroundColor: "#fef2f2",
    minHeight: 48,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "800",
  },
  });

const stylesStatic = StyleSheet.create({
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "800",
    color: "#94a3b8",
    marginTop: 2,
    marginBottom: 2,
  },
  actionRow: {
    minHeight: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTextWrap: {
    gap: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  rowValue: {
    fontSize: 11,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginLeft: 50,
  },
});
