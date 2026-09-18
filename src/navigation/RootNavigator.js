import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState, useMemo } from "react";
import { Alert, View, StyleSheet, Share } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useEvents } from "../context/EventsContext";
import { useAppTheme } from "../theme/theme";

// Screens
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import EventDetailsScreen from "../screens/EventDetailsScreen";
import CreateEventScreen from "../screens/CreateEventScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import SendAnnouncementScreen from "../screens/SendAnnouncementScreen";
import AnnouncementDetailsScreen from "../screens/AnnouncementDetailsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ParticipantsScreen from "../screens/ParticipantsScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import AppNavigator from "./AppNavigator";
import AdminNavigator from "./AdminNavigator";
import Sidebar from "../components/Sidebar";
import { filterByCategory, searchEvents } from "../utils/helpers";
import { approveUserAdmin, disableUserAdmin, updateUserAccountType } from "../services/supabaseData";
import { validateEvent } from "../utils/validation";
import { ErrorState } from "../components/ErrorState";
import SelectPickerModal from "../components/SelectPickerModal";

const Stack = createNativeStackNavigator();

const DEFAULT_CREATE_EVENT_FORM = {
  title: "",
  category: "",
  description: "",
  date: "",
  time: "",
  venue: "",
  organizer: "",
  image: "",
  status: "published",
  targetAudience: "all",
  capacity: "",
};

export default function RootNavigator() {
  const {
    user,
    profileDraft,
    setProfileDraft,
    isAuthenticated,
    authInitializing,
    hasSeenOnboarding,
    markOnboardingComplete,
    login,
    signup,
    logout,
    saveProfile,
    handleUploadAvatar,
    resetPassword,
    isStaffUser,
    loginLoading,
    signupLoading,
    passwordRecovery,
    finishPasswordRecovery,
  } = useAuth();

  const {
    events,
    announcements,
    notifications,
    adminUsers,
    setAdminUsers,
    registeredEventIds,
    waitlistedEventIds,
    registeringEventId,
    bookmarkedEventIds,
    refreshing,
    loadError,
    handleRefresh,
    handleToggleBookmark,
    handleRegisterEvent,
    handleSendAnnouncement,
    handleNotificationPress,
    markAllNotificationsRead,
    saveEvent,
    deleteEvent,
    uploadEventImage,
    featuredEvents,
    adminStats,
    adminAnalytics,
  } = useEvents();

  const { mode: themeMode, setMode: setThemeMode, colors, isDark } = useAppTheme();

  // App UI state
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [homeSearch] = useState("");
  const [selectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeAdminScreen, setActiveAdminScreen] = useState("dashboard");
  const [editingUserId, setEditingUserId] = useState(null);
  const [adminSettings, setAdminSettings] = useState({
    autoApproveEvents: false,
    requireEventDescription: true,
    maxEventsPerUser: 5,
    sendNotifications: true,
    maintenanceMode: false,
  });

  // Event form state
  const [createEventForm, setCreateEventForm] = useState(DEFAULT_CREATE_EVENT_FORM);
  const [createEventErrors, setCreateEventErrors] = useState({});
  const [editingEventId, setEditingEventId] = useState(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: "", password: "", showPassword: false });
  const [loginErrors, setLoginErrors] = useState({});

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    accountType: "student",
    fullName: "",
    email: "",
    department: "",
    level: "",
    faculty: "",
    matricNumber: "",
    staffId: "",
    roleDesignation: "",
    password: "",
    confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState({});

  // Filtered lists
  const filteredHomeEvents = useMemo(() => {
    const categoryList = filterByCategory(events, selectedCategory);
    return searchEvents(categoryList, homeSearch);
  }, [events, selectedCategory, homeSearch]);

  const searchResults = useMemo(() => searchEvents(events, searchQuery), [events, searchQuery]);

  const myEvents = useMemo(() => {
    if (["staff", "organizer", "admin"].includes(user?.accountType)) {
      return events.filter((e) => e.createdBy === user?.id);
    }
    return events.filter((e) => registeredEventIds.includes(e.id));
  }, [events, registeredEventIds, user?.accountType, user?.id]);

  const clearRecentSearches = () => setRecentSearches([]);
  const removeRecentSearch = (item) => setRecentSearches((prev) => prev.filter((i) => i !== item));
  const onSearchChange = (query) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query.toLowerCase())) {
      setRecentSearches((prev) => [query.toLowerCase(), ...prev].slice(0, 8));
    }
  };

  // Splash loading
  if (passwordRecovery) return <ChangePasswordScreen onDone={finishPasswordRecovery} onBack={async () => { await logout(); finishPasswordRecovery(); }} />;
  if (authInitializing) {
    return <SplashScreen />;
  }

  // Onboarding flow
  if (!hasSeenOnboarding) {
    return (
      <OnboardingScreen
        step={onboardingStep}
        onNext={() => setOnboardingStep((prev) => prev + 1)}
        onSkip={markOnboardingComplete}
        onGetStarted={markOnboardingComplete}
      />
    );
  }

  return (
    <>
    <SelectPickerModal visible={!!editingUserId} title="Change account type" options={[{ label: "Student", value: "student" }, { label: "Staff", value: "staff" }, { label: "Organizer", value: "organizer" }]} onClose={() => setEditingUserId(null)} onSelect={async (accountType) => {
      if (!user?.privileges?.canManageUsers) return;
      try {
        await updateUserAccountType(editingUserId, accountType);
        setAdminUsers(prev => prev.map(item => item.id === editingUserId ? { ...item, accountType } : item));
      } catch (error) { Alert.alert("Update failed", error.message); }
    }} />
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "default", statusBarStyle: isDark ? "light" : "dark", contentStyle: { backgroundColor: colors.background } }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                email={loginForm.email}
                password={loginForm.password}
                showPassword={loginForm.showPassword}
                errors={loginErrors}
                loading={loginLoading}
                onChangeEmail={(email) => {
                  setLoginForm((p) => ({ ...p, email }));
                  setLoginErrors({});
                }}
                onChangePassword={(password) => {
                  setLoginForm((p) => ({ ...p, password }));
                  setLoginErrors({});
                }}
                onTogglePassword={() => setLoginForm((p) => ({ ...p, showPassword: !p.showPassword }))}
                onLogin={async () => {
                  const res = await login(loginForm);
                  if (!res.ok) {
                    setLoginErrors(res.errors || { general: res.error?.message || "Login failed" });
                  }
                }}
                onSwitchToSignup={() => {
                  setLoginErrors({});
                  navigation.navigate("Signup");
                }}
                onForgotPassword={async (email) => {
                  if (!email || !email.includes("@")) {
                    Alert.alert("Invalid Email", "Please enter a valid email address.");
                    return;
                  }
                  try {
                    await resetPassword(email.trim().toLowerCase());
                    Alert.alert("Email Sent", "If an account exists, you will receive a password reset link.");
                  } catch (err) {
                    Alert.alert("Reset Failed", err?.message || "Could not send reset link.");
                  }
                }}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Signup">
            {({ navigation }) => (
              <SignupScreen
                values={signupForm}
                errors={signupErrors}
                loading={signupLoading}
                onChange={(field, value) => {
                  setSignupForm((p) => ({ ...p, [field]: value }));
                  setSignupErrors({});
                }}
                onRegister={async () => {
                  const res = await signup(signupForm);
                  if (!res.ok) {
                    setSignupErrors(res.errors || { general: res.error?.message || "Registration failed" });
                  } else if (res.requiresEmailConfirmation || res.requiresApproval) {
                    setSignupForm((p) => ({ ...p, password: "", confirmPassword: "" }));
                    navigation.navigate("Login");
                    Alert.alert("Account created", [res.requiresEmailConfirmation ? "Check your email to confirm your account." : "", res.requiresApproval ? "An administrator must approve your account before you can sign in." : ""].filter(Boolean).join(" "));
                  }
                }}
                onSwitchToLogin={() => {
                  setSignupErrors({});
                  navigation.navigate("Login");
                }}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="MainTabs">
            {({ navigation }) => (
              <View style={styles.flexOne}>
                <AppNavigator
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  user={user}
                  themeMode={themeMode}
                  refreshing={refreshing}
                  loadError={loadError}
                  onRefreshData={handleRefresh}
                  isStaff={isStaffUser}
                  onCreateEvent={() => {
                    setEditingEventId(null);
                    setCreateEventForm({ ...DEFAULT_CREATE_EVENT_FORM, organizer: user?.fullName || "" });
                    setCreateEventErrors({});
                    navigation.navigate("CreateEvent");
                  }}
                  homeProps={{
                    user,
                    dashboardType: isStaffUser ? "staff" : "student",
                    bookmarkedEventIds,
                    featuredEvents,
                    events: filteredHomeEvents,
                    announcements,
                    notifications,
                    onToggleBookmark: handleToggleBookmark,
                    onOpenEvent: (id) => navigation.navigate("EventDetails", { eventId: id }),
                    onOpenNotifications: () => setActiveTab("notifications"),
                    onOpenProfile: () => setActiveTab("profile"),
                    onOpenAnnouncementDetails: (announcementId) => {
                      navigation.navigate("AnnouncementDetails", { announcementId });
                    },
                    onActivateSearch: (value) => {
                      const input = String(value || "").trim();
                      if (input) onSearchChange(input);
                      setActiveTab("search");
                    },
                    onCreateEvent: () => {
                      setEditingEventId(null);
                      setCreateEventForm({ ...DEFAULT_CREATE_EVENT_FORM, organizer: user?.fullName || "" });
                      setCreateEventErrors({});
                      navigation.navigate("CreateEvent");
                    },
                    onOpenManageEvents: () => setActiveTab("my-events"),
                    onOpenSidebar: () => setSidebarOpen(true),
                  }}
                  searchProps={{
                    value: searchQuery,
                    recentSearches,
                    results: searchResults,
                    onChange: onSearchChange,
                    onSelectRecent: setSearchQuery,
                    onClearRecent: clearRecentSearches,
                    onRemoveRecent: removeRecentSearch,
                    onOpenEvent: (id) => navigation.navigate("EventDetails", { eventId: id }),
                    onBack: () => setActiveTab("home"),
                  }}
                  myEventsProps={{
                    onOpenAnnouncement: () => navigation.navigate("SendAnnouncement"),
                    events: activeTab === "registrations" ? events.filter((e) => registeredEventIds.includes(e.id)) : myEvents,
                    isStaff: isStaffUser,
                    onOpenEvent: (id) => navigation.navigate("EventDetails", { eventId: id }),
                    onBack: () => setActiveTab("home"),
                    onOpenNotifications: () => setActiveTab("notifications"),
                    onCreateEvent: () => {
                      setEditingEventId(null);
                      setCreateEventForm({ ...DEFAULT_CREATE_EVENT_FORM, organizer: user?.fullName || "" });
                      setCreateEventErrors({});
                      navigation.navigate("CreateEvent");
                    },
                  }}
                  notificationsProps={{
                    notifications,
                    onNotificationPress: (item) => {
                      handleNotificationPress(item);
                      if (item.eventId) {
                        navigation.navigate("EventDetails", { eventId: item.eventId });
                      } else if (item.announcementId) {
                        navigation.navigate("AnnouncementDetails", { announcementId: item.announcementId });
                      }
                    },
                    onMarkAllAsRead: markAllNotificationsRead,
                    onBack: () => setActiveTab("home"),
                  }}
                  profileProps={{
                    user,
                    isStaff: isStaffUser,
                    totalRegistered: registeredEventIds.length,
                    themeMode,
                    onToggleTheme: () => setThemeMode(p => p === "dark" ? "light" : "dark"),
                    onOpenMyEvents: () => setActiveTab(isStaffUser ? "my-events" : "registrations"),
                    onOpenSavedEvents: () => setActiveTab("my-events"),
                    onOpenNotifications: () => setActiveTab("notifications"),
                    onOpenAnnouncement: () => navigation.navigate("SendAnnouncement"),
                    onCreateEvent: () => {
                      setEditingEventId(null);
                      setCreateEventForm({ ...DEFAULT_CREATE_EVENT_FORM, organizer: user?.fullName || "" });
                      setCreateEventErrors({});
                      navigation.navigate("CreateEvent");
                    },
                    onEditProfile: () => navigation.navigate("EditProfile"),
                    onOpenSettings: () => navigation.navigate("Settings"),
                    onLogout: logout,
                  }}
                  savedEventsProps={{
                    events,
                    bookmarkedEventIds,
                    onToggleBookmark: handleToggleBookmark,
                    onOpenEvent: (id) => navigation.navigate("EventDetails", { eventId: id }),
                    onBack: () => setActiveTab("home"),
                  }}
                />
                <Sidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setSidebarOpen(false)}
                  user={user}
                  activeTab={activeTab}
                  onNavigate={(tab) => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  onOpenSettings={() => {
                    setSidebarOpen(false);
                    navigation.navigate("Settings");
                  }}
                  onLogout={logout}
                  onOpenAdminDashboard={() => {
                    setSidebarOpen(false);
                    navigation.navigate("Admin");
                  }}
                />
              </View>
            )}
          </Stack.Screen>

          <Stack.Screen name="EventDetails">
            {({ route, navigation }) => {
              const eventId = route.params?.eventId;
              const event = events.find((e) => e.id === eventId) || null;
              if (!event) {
                return (
                  <ErrorState title="Event unavailable" description="This event may have been removed or is no longer available to your account." actionLabel="Go back" onRetry={() => navigation.goBack()} />
                );
              }
              const isRegistered = registeredEventIds.includes(event.id);
              const isBookmarked = bookmarkedEventIds.includes(event.id);
              const canManageEvent = event.createdBy === user?.id || user?.privileges?.canManageEvents;

              return (
                <EventDetailsScreen
                  event={event}
                  isRegistered={isRegistered}
                  isWaitlisted={waitlistedEventIds.includes(event.id)}
                  isBookmarked={isBookmarked}
                  registering={registeringEventId === event.id}
                  canManageEvent={canManageEvent}
                  deletingEvent={false}
                  onRegister={() => handleRegisterEvent(event.id)}
                  onViewParticipants={() => navigation.navigate("Participants", { eventId: event.id })}
                  onToggleBookmark={() => handleToggleBookmark(event.id)}
                  onEditEvent={() => {
                    setEditingEventId(event.id);
                    setCreateEventForm({
                      title: event.title || "",
                      category: event.category || "",
                      description: event.description || "",
                      date: event.date || "",
                      time: event.time || "",
                      venue: event.venue || "",
                      organizer: event.organizer || "",
                      image: event.image || DEFAULT_CREATE_EVENT_FORM.image,
                      targetAudience: event.targetAudience || "all",
                      status: event.status || "published",
                      capacity: event.capacity ? String(event.capacity) : "",
                    });
                    navigation.navigate("CreateEvent");
                  }}
                  onDeleteEvent={() => {
                    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          const res = await deleteEvent(event.id);
                          if (res.ok) navigation.goBack();
                        },
                      },
                    ]);
                  }}
                  onBack={() => navigation.goBack()}
                />
              );
            }}
          </Stack.Screen>

          <Stack.Screen name="CreateEvent">
            {({ navigation }) => (
              <CreateEventScreen
                mode={editingEventId ? "edit" : "create"}
                values={createEventForm}
                errors={createEventErrors}
                onChange={(field, value) => {
                  setCreateEventForm((p) => ({ ...p, [field]: value }));
                  setCreateEventErrors((p) => ({ ...p, [field]: undefined }));
                }}
                onUploadEventImage={uploadEventImage}
                onSubmit={async (status) => {
                  const form = { ...createEventForm, status: status || createEventForm.status || "published" };
                  const errors = validateEvent(form);
                  setCreateEventErrors(errors);
                  if (Object.keys(errors).length) return false;
                  const res = await saveEvent(form, editingEventId);
                  if (res.ok) {
                    setCreateEventForm({ ...DEFAULT_CREATE_EVENT_FORM, organizer: user?.fullName || "" });
                    setEditingEventId(null);
                    navigation.goBack();
                  }
                  return res.ok;
                }}
                onBack={() => {
                  setEditingEventId(null);
                  navigation.goBack();
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Participants">
            {({ route, navigation }) => {
              const event = events.find(item => item.id === route.params?.eventId);
              if (!event || (event.createdBy !== user?.id && !user?.privileges?.canManageEvents)) return <ErrorState title="Participants unavailable" description="Only the event organizer and authorized administrators can view this list." actionLabel="Go back" onRetry={() => navigation.goBack()} />;
              return <ParticipantsScreen event={event} onBack={() => navigation.goBack()} />;
            }}
          </Stack.Screen>

          <Stack.Screen name="EditProfile">
            {({ navigation }) => (
              <EditProfileScreen
                values={profileDraft}
                onChange={(field, value) => setProfileDraft((p) => ({ ...p, [field]: value }))}
                onUploadAvatar={handleUploadAvatar}
                onSave={saveProfile}
                onSaveSuccess={(message) => {
                  navigation.goBack();
                  setTimeout(() => Alert.alert("Success", message || "Profile updated"), 0);
                }}
                onBack={() => {
                  setProfileDraft(user);
                  navigation.goBack();
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="ChangePassword">
            {({ navigation }) => <ChangePasswordScreen onDone={() => navigation.goBack()} onBack={() => navigation.goBack()} />}
          </Stack.Screen>

          <Stack.Screen name="Settings">
            {({ navigation }) => (
              <SettingsScreen
                themeMode={themeMode}
                onChangePassword={() => navigation.navigate("ChangePassword")}
                onToggleTheme={() => setThemeMode((p) => (p === "dark" ? "light" : "dark"))}
                onBack={() => navigation.goBack()}
                onLogout={logout}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="SendAnnouncement">
            {({ navigation }) => (
              <SendAnnouncementScreen
                onBack={() => navigation.goBack()}
                onSendAnnouncement={async (data) => {
                  const res = await handleSendAnnouncement(data);
                  if (res.ok) navigation.goBack();
                  return res;
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="AnnouncementDetails">
            {({ route, navigation }) => {
              const announcementId = route.params?.announcementId;
              const announcement =
                announcements.find((a) => a.id === announcementId) || null;
              return (
                <AnnouncementDetailsScreen
                  announcement={announcement}
                  onBack={() => navigation.goBack()}
                />
              );
            }}
          </Stack.Screen>

          <Stack.Screen name="Admin">
            {({ navigation }) => !user?.privileges?.canViewDashboard ? <ErrorState title="Administrator access required" actionLabel="Go back" onRetry={() => navigation.goBack()} /> : (
              <AdminNavigator
                activeScreen={activeAdminScreen}
                onNavigate={setActiveAdminScreen}
                onSwitchToUser={() => navigation.goBack()}
                refreshing={refreshing}
                onRefreshData={handleRefresh}
                dashboardProps={{
                  currentUser: user,
                  stats: adminStats,
                  recentEvents: events.slice(0, 3),
                  recentUsers: adminUsers.slice(0, 3),
                  onManageEvents: () => setActiveAdminScreen("events"),
                  onManageUsers: () => setActiveAdminScreen("users"),
                  onManageAnnouncements: () => navigation.navigate("SendAnnouncement"),
                  onViewAnalytics: () => setActiveAdminScreen("analytics"),
                  onBack: () => setActiveAdminScreen("dashboard"),
                  onSwitchToUser: () => navigation.goBack(),
                  onCreateEvent: () => {
                    setEditingEventId(null);
                    setCreateEventForm({ ...DEFAULT_CREATE_EVENT_FORM, organizer: user?.fullName || "" });
                    navigation.navigate("CreateEvent");
                  },
                }}
                manageEventsProps={{
                  events,
                  onBack: () => setActiveAdminScreen("dashboard"),
                  onCreateEvent: () => {
                    setEditingEventId(null);
                    setCreateEventForm({ ...DEFAULT_CREATE_EVENT_FORM, organizer: user?.fullName || "" });
                    navigation.navigate("CreateEvent");
                  },
                  onEditEvent: (id) => {
                    const evt = events.find((e) => e.id === id);
                    if (evt) {
                      setEditingEventId(id);
                      setCreateEventForm({ ...evt, capacity: evt.capacity ? String(evt.capacity) : "" });
                      navigation.navigate("CreateEvent");
                    }
                  },
                  onDeleteEvent: (id) => deleteEvent(id, true),
                  onViewEventDetails: (id) => navigation.navigate("EventDetails", { eventId: id }),
                }}
                manageUsersProps={{
                  users: adminUsers,
                  currentUserId: user?.id,
                  onBack: () => setActiveAdminScreen("dashboard"),
                  onViewUserDetails: (userId) => {
                    const profile = adminUsers.find((item) => item.id === userId);
                    if (profile) {
                      Alert.alert(
                        "User Profile",
                        `Name: ${profile.fullName}\nEmail: ${profile.email}\nRole: ${profile.accountType.toUpperCase()}`
                      );
                    }
                  },
                  onEditUser: (userId) => {
                    if (user?.privileges?.canManageUsers) setEditingUserId(userId);
                  },
                  onDisableUser: async (userId) => {
                    try {
                      await disableUserAdmin(userId);
                      setAdminUsers((prev) =>
                        prev.map((u) => (u.id === userId ? { ...u, accountStatus: "disabled" } : u))
                      );
                      Alert.alert("User Disabled", "User has been disabled.");
                    } catch (_e) {
                      Alert.alert("Error", "Could not disable user.");
                    }
                  },
                  onApproveUser: async (userId) => {
                    try {
                      await approveUserAdmin(userId);
                      setAdminUsers((prev) =>
                        prev.map((u) => (u.id === userId ? { ...u, accountStatus: "approved" } : u))
                      );
                      Alert.alert("Success", "Account has been approved.");
                    } catch (_e) {
                      Alert.alert("Error", "Could not approve user.");
                    }
                  },
                  onResetPassword: async (userId) => {
                    const profile = adminUsers.find((item) => item.id === userId);
                    if (profile?.email) {
                      await resetPassword(profile.email);
                      Alert.alert("Password Reset Sent", `Link sent to ${profile.email}`);
                    }
                  },
                }}
                analyticsProps={{
                  analytics: adminAnalytics,
                  onBack: () => setActiveAdminScreen("dashboard"),
                  onExportReport: async () => {
                    try {
                      await Share.share({ title: "NSUK Events Report", message: `NSUK Events Report\nGenerated: ${new Date().toLocaleDateString()}\nEvents: ${adminAnalytics.totalEvents}\nUsers: ${adminAnalytics.totalUsers}\nRegistrations: ${adminAnalytics.totalRegistrations}\nAverage RSVPs per event: ${adminAnalytics.averageRegistrations}\n\nEvents by category\n${Object.entries(adminAnalytics.eventsByCategory).map(([category, count]) => `${category}: ${count}`).join("\n")}` });
                    } catch (error) { Alert.alert("Export failed", error.message); }
                  },
                }}
                settingsProps={{
                  settings: adminSettings,
                  onBack: () => setActiveAdminScreen("dashboard"),
                  onUpdateSettings: setAdminSettings,
                  onEditProfile: () => navigation.navigate("EditProfile"),
                  onChangePassword: () => navigation.navigate("ChangePassword"),
                  onLogout: logout,
                }}
              />
            )}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  flexCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
