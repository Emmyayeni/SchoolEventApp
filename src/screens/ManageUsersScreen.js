import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { AppText } from "../components/AppText";
import { AppTextInput } from "../components/AppTextInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function ManageUsersScreen({
  users = [],
  onBack,
  onViewUserDetails,
  onEditUser,
  onDisableUser,
  onResetPassword,
  onApproveUser,
  currentUserId,
  refreshing,
  onRefreshData,
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // all, student, staff
  const styles = useMemo(() => createStyles(colors), [colors]);

  const filteredUsers = useMemo(() => {
    let result = users;

    // Filter by search text
    if (searchText.trim()) {
      const needle = searchText.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(needle) ||
          u.email?.toLowerCase().includes(needle) ||
          u.department?.toLowerCase().includes(needle)
      );
    }

    // Filter by role
    if (filterRole !== "all") {
      result = result.filter((u) => u.accountType === filterRole);
    }

    return result;
  }, [users, searchText, filterRole]);

  const userStats = useMemo(
    () => ({
      total: users.length,
      students: users.filter((u) => u.accountType === "student").length,
      staff: users.filter((u) => u.accountType === "staff" || u.accountType === "organizer").length,
      pending: users.filter((u) => u.accountStatus === "pending").length,
    }),
    [users]
  );

  const handleApproveUser = (user) => {
    Alert.alert(
      "Approve Account",
      `Are you sure you want to approve ${user.fullName} and grant them system access?`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Approve",
          onPress: () => onApproveUser?.(user.id),
        },
      ]
    );
  };

  const handleDisableUser = (user) => {
    Alert.alert(
      "Disable User",
      `Are you sure you want to disable ${user.fullName}? They won't be able to access the app.`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Disable",
          onPress: () => onDisableUser?.(user.id),
          style: "destructive",
        },
      ]
    );
  };

  const handleResetPassword = (user) => {
    Alert.alert(
      "Reset Password",
      `Send password reset email to ${user.email}?`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Send",
          onPress: () => onResetPassword?.(user.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerRow, { paddingTop: (insets?.top ?? 0) + scale(8) }]}>
        <Pressable
          style={styles.backBtn}
          onPress={onBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={colors.accent} />
        </Pressable>
        <AppText style={[styles.title, { color: colors.text }]}>Manage Users</AppText>
        <View style={styles.backBtn} />
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <StatBadge label="Total" value={userStats.total} colors={colors} styles={styles} />
        <StatBadge label="Staff" value={userStats.staff} colors={colors} styles={styles} />
        <StatBadge label="Pending" value={userStats.pending} colors={colors} styles={styles} isWarning={userStats.pending > 0} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <AppTextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search users..."
          placeholderTextColor={colors.textSubtle}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <Pressable
            onPress={() => setSearchText("")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {["all", "student", "staff"].map((filter) => (
          <Pressable
            key={filter}
            style={[styles.filterTab, filterRole === filter && styles.filterTabActive]}
            onPress={() => setFilterRole(filter)}
            accessibilityRole="button"
            accessibilityLabel={filter}
            accessibilityState={{ selected: filterRole === filter }}
          >
            <AppText
              style={[
                styles.filterTabText,
                { color: filterRole === filter ? colors.primaryContrast : colors.textMuted },
                filterRole === filter && styles.filterTabTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefreshData} tintColor={colors.primary} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.borderSoft} />
            <AppText style={[styles.emptyText, { color: colors.textMuted }]}>
              {searchText ? "No users match your search." : "No users found."}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => (
          <UserManageCard
            user={item}
            isMe={item.id === currentUserId}
            colors={colors}
            styles={styles}
            onView={() => onViewUserDetails?.(item.id)}
            onEdit={() => onEditUser?.(item.id)}
            onDisable={() => handleDisableUser(item)}
            onResetPassword={() => handleResetPassword(item)}
            onApprove={() => handleApproveUser(item)}
          />
        )}
      />
    </View>
  );
}

function UserManageCard({ user, isMe, colors, styles, onView, onEdit, onDisable, onResetPassword, onApprove }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <Pressable
      style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.borderSoft }]}
      onPress={onView}
      accessibilityRole="button"
      accessibilityLabel={user.fullName}
      accessibilityHint="Opens user details"
    >
      <View style={styles.userCardHeader}>
        <View style={styles.userInfo}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
          ) : (
            <View style={[styles.userAvatar, { backgroundColor: colors.primary + "30" }]}>
              <AppText style={{ color: colors.primary, fontWeight: "700", fontSize: ms(16) }}>
                {user.fullName?.charAt(0).toUpperCase()}
              </AppText>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <AppText style={[styles.userName, { color: isMe ? colors.primary : colors.text }]} numberOfLines={1}>
                {user.fullName} {isMe ? "(You)" : ""}
              </AppText>
              {isMe && (
                <View style={{ backgroundColor: colors.primary + "20", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                  <AppText style={{ color: colors.primary, fontSize: ms(10), fontWeight: "bold" }}>Me</AppText>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
              <AppText style={[styles.userRole, { color: colors.textMuted, marginTop: 0 }]}>
                {user.accountType === "student" ? `${user.level || ''} Level • ${user.department || ''}` : user.roleDesignation || user.accountType}
              </AppText>
              {user.accountStatus === "pending" && (
                <View style={{ backgroundColor: "#f59e0b20", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <AppText style={{ color: "#f59e0b", fontSize: ms(9), fontWeight: "bold", textTransform: "uppercase" }}>Pending</AppText>
                </View>
              )}
            </View>
            <AppText style={[styles.userEmail, { color: colors.textSubtle }]}>{user.email}</AppText>
          </View>
        </View>
        <Pressable
          style={styles.moreBtn}
          onPress={() => setShowActions(!showActions)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="More actions"
          accessibilityState={{ expanded: showActions }}
        >
          <Ionicons name="ellipsis-vertical" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      {showActions && !isMe && (
        <View style={[styles.actionsPanel, { backgroundColor: colors.surfaceAlt }]}>
          {user.accountStatus === "pending" && (
            <ActionButton
              icon="checkmark-circle"
              label="Approve Account"
              onPress={onApprove}
              colors={colors}
              iconColor="#10b981"
            />
          )}
          <ActionButton
            icon="create"
            label="Edit User Role"
            onPress={onEdit}
            colors={colors}
            iconColor={colors.accent}
          />
          <ActionButton
            icon="key"
            label="Reset Password"
            onPress={onResetPassword}
            colors={colors}
            iconColor={colors.accent}
          />
          <ActionButton
            icon="ban"
            label="Disable User"
            onPress={onDisable}
            colors={colors}
            iconColor={colors.error}
          />
        </View>
      )}
    </Pressable>
  );
}

function StatBadge({ label, value, colors, styles, isWarning }) {
  return (
    <View style={[styles.statBadge, { backgroundColor: isWarning ? "#f59e0b10" : colors.surface, borderColor: isWarning ? "#f59e0b50" : colors.borderSoft }]}>
      <AppText style={[styles.statValue, { color: isWarning ? "#f59e0b" : colors.primary }]}>{value}</AppText>
      <AppText style={[styles.statLabel, { color: isWarning ? "#f59e0b" : colors.textMuted }]}>{label}</AppText>
    </View>
  );
}

function ActionButton({ icon, label, onPress, colors, iconColor }) {
  return (
    <Pressable
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: scale(10),
          paddingHorizontal: scale(12),
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={16} color={iconColor} />
      <AppText style={{ marginLeft: scale(10), color: colors.text, fontSize: ms(12), fontWeight: "600" }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scale(14),
      paddingBottom: scale(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSoft,
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
    statsBar: {
      flexDirection: "row",
      gap: scale(10),
      marginHorizontal: scale(14),
      marginVertical: scale(12),
    },
    statBadge: {
      flex: 1,
      borderRadius: scale(10),
      borderWidth: 1,
      paddingVertical: scale(8),
      paddingHorizontal: scale(10),
      alignItems: "center",
    },
    statValue: {
      fontSize: ms(16),
      fontWeight: "800",
    },
    statLabel: {
      fontSize: ms(10),
      fontWeight: "600",
      marginTop: scale(2),
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
      marginHorizontal: scale(14),
      marginBottom: scale(12),
      paddingHorizontal: scale(12),
      height: scale(40),
      borderRadius: scale(10),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    searchInput: {
      flex: 1,
      fontSize: ms(13),
      fontWeight: "500",
    },
    filterRow: {
      flexDirection: "row",
      gap: scale(8),
      marginHorizontal: scale(14),
      marginBottom: scale(12),
    },
    filterTab: {
      flex: 1,
      paddingHorizontal: scale(12),
      paddingVertical: scale(6),
      borderRadius: scale(8),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
    },
    filterTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterTabText: {
      fontSize: ms(12),
      fontWeight: "600",
    },
    filterTabTextActive: {
      color: colors.primaryContrast,
    },
    listContent: {
      paddingHorizontal: scale(14),
      paddingBottom: scale(24),
      gap: scale(10),
    },
    emptyCard: {
      borderRadius: scale(12),
      paddingVertical: scale(40),
      paddingHorizontal: scale(24),
      alignItems: "center",
      marginTop: scale(40),
    },
    emptyTitle: {
      fontSize: ms(16),
      fontWeight: "700",
      marginTop: scale(12),
    },
    emptyText: {
      fontSize: ms(13),
      fontWeight: "500",
      marginTop: scale(6),
      textAlign: "center",
    },
    userCard: {
      borderRadius: scale(12),
      borderWidth: 1,
      padding: scale(12),
    },
    userCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    userInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10),
    },
    userAvatar: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(20),
      alignItems: "center",
      justifyContent: "center",
    },
    userName: {
      fontSize: ms(13),
      fontWeight: "700",
    },
    userRole: {
      fontSize: ms(11),
      fontWeight: "500",
      marginTop: scale(2),
    },
    userEmail: {
      fontSize: ms(10),
      fontWeight: "500",
      marginTop: scale(1),
    },
    moreBtn: {
      width: scale(28),
      height: scale(28),
      alignItems: "center",
      justifyContent: "center",
    },
    actionsPanel: {
      marginTop: scale(10),
      paddingTop: scale(10),
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginHorizontal: -scale(12),
      marginBottom: -scale(12),
      paddingHorizontal: scale(12),
      borderBottomLeftRadius: scale(12),
      borderBottomRightRadius: scale(12),
    },
  });
