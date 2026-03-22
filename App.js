import AsyncStorage from "@react-native-async-storage/async-storage";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AppState, Platform, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  getAuthErrorMessage,
  getCurrentAppUser,
  onAuthStateChange,
  signInWithEmailPassword,
  signOutCurrentUser,
  signUpWithEmailPassword,
  updateCurrentUserProfile,
} from "./lib/Auth";
import { user as seedUser } from "./src/data/user";
import AppNavigator from "./src/navigation/AppNavigator";
import CreateEventScreen from "./src/screens/CreateEventScreen";
import EditProfileScreen from "./src/screens/EditProfileScreen";
import EventDetailsScreen from "./src/screens/EventDetailsScreen";
import LoginScreen from "./src/screens/LoginScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SendAnnouncementScreen from "./src/screens/SendAnnouncementScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import SignupScreen from "./src/screens/SignupScreen";
import SplashScreen from "./src/screens/SplashScreen";
import { STORAGE_BUCKETS, uploadImageToBucket } from "./src/services/storage";
import {
  createEventFromForm,
  fetchEventBookmarks,
  fetchEventRegistrations,
  fetchEvents,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  registerForEvent,
  toggleEventBookmark,
} from "./src/services/supabaseData";
import { ThemeProvider, getThemeColors } from "./src/theme/theme";
import { filterByCategory, searchEvents } from "./src/utils/helpers";

const PROFILE_CACHE_KEY = "@nsuk/profile_cache";

export default function App() {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState("system");
  const resolvedThemeMode = themeMode === "system" ? (systemScheme === "dark" ? "dark" : "light") : themeMode;
  const colors = getThemeColors(resolvedThemeMode);
  const systemBarBackground = colors.background;
  const systemBarStyle = resolvedThemeMode === "dark" ? "light" : "dark";

  const [phase, setPhase] = useState("splash");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [authScreen, setAuthScreen] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [openingAnnouncement, setOpeningAnnouncement] = useState(false);
  const [openingSettings, setOpeningSettings] = useState(false);

  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(seedUser);
  const [notifications, setNotifications] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [bookmarkedEventIds, setBookmarkedEventIds] = useState([]);

  const [homeSearch, setHomeSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(["tech", "football", "workshop", "science"]);

  const [registering, setRegistering] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    showPassword: false,
  });
  const [loginErrors, setLoginErrors] = useState({});

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

  const [profileDraft, setProfileDraft] = useState(seedUser);

  const [createEventForm, setCreateEventForm] = useState({
    title: "",
    category: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    organizer: "",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
  });
  const [createEventErrors, setCreateEventErrors] = useState({});

  const cacheProfileLocally = async (profile) => {
    try {
      await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.log("Profile cache save error:", error?.message || error);
    }
  };

  const getCachedProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (error) {
      console.log("Profile cache read error:", error?.message || error);
      return null;
    }
  };

  const loadAppData = useCallback(async (currentUserId) => {
    if (!currentUserId) {
      return;
    }

    const [eventRows, registrationRows, bookmarkIds, notificationRows] = await Promise.all([
      fetchEvents(),
      fetchEventRegistrations(currentUserId),
      fetchEventBookmarks(currentUserId),
      fetchNotifications(currentUserId),
    ]);

    setEvents(eventRows);
    setRegisteredEventIds(
      registrationRows
        .filter((item) => item.status === "registered")
        .map((item) => item.event_id)
    );
    setBookmarkedEventIds(bookmarkIds);
    setNotifications(notificationRows);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const cachedProfile = await getCachedProfile();
        if (isMounted && cachedProfile) {
          setUser((prev) => ({ ...prev, ...cachedProfile }));
          setProfileDraft((prev) => ({ ...prev, ...cachedProfile }));
        }

        const currentUser = await getCurrentAppUser();
        if (!isMounted || !currentUser) {
          return;
        }

        setUser((prev) => ({ ...prev, ...currentUser }));
        setProfileDraft((prev) => ({ ...prev, ...currentUser }));
        setThemeMode(currentUser.themeMode || "system");
        await cacheProfileLocally(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.log("Session restore error:", error?.message || error);
      } finally {
        if (isMounted) {
          setAuthInitializing(false);
        }
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = onAuthStateChange((event, nextUser) => {
      if (!isMounted) {
        return;
      }

      if (!nextUser) {
        if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
        }
        return;
      }

      setUser((prev) => ({ ...prev, ...nextUser }));
      setProfileDraft((prev) => ({ ...prev, ...nextUser }));
      setThemeMode(nextUser.themeMode || "system");
      setIsAuthenticated(true);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    let active = true;

    const hydrateData = async () => {
      try {
        await loadAppData(user.id);
      } catch (error) {
        if (!active) {
          return;
        }
        Alert.alert("Sync error", "Could not load latest events and notifications.");
      }
    };

    hydrateData();

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id, loadAppData]);

  useEffect(() => {
    if (authInitializing) {
      return;
    }

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        setPhase("main");
        return;
      }

      if (!hasSeenOnboarding) {
        setPhase("onboarding");
        return;
      }

      setPhase("auth");
    }, 2400);

    return () => clearTimeout(timer);
  }, [hasSeenOnboarding, isAuthenticated, authInitializing]);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const applySystemBars = () => {
      SystemUI.setBackgroundColorAsync(systemBarBackground).catch(() => {});
      NavigationBar.setPositionAsync("relative").catch(() => {});
      NavigationBar.setBackgroundColorAsync(systemBarBackground).catch(() => {});
      NavigationBar.setButtonStyleAsync(systemBarStyle).catch(() => {});
    };

    applySystemBars();

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        applySystemBars();
      }
    });

    return () => {
      appStateSubscription.remove();
    };
  }, [systemBarBackground, systemBarStyle]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId]
  );

  const featuredEvents = useMemo(() => events.filter((event) => event.isFeatured), [events]);

  const filteredHomeEvents = useMemo(() => {
    const categoryList = filterByCategory(events, selectedCategory);
    return searchEvents(categoryList, homeSearch);
  }, [events, selectedCategory, homeSearch]);

  const searchResults = useMemo(() => searchEvents(events, searchQuery), [events, searchQuery]);

  const myEvents = useMemo(() => {
    if (user?.accountType === "staff") {
      return events.filter((event) => event.createdBy === user?.id);
    }
    return events.filter((event) => registeredEventIds.includes(event.id));
  }, [events, registeredEventIds, user?.accountType, user?.id]);

  const favoriteCategory = useMemo(() => {
    if (myEvents.length === 0) {
      return "";
    }
    const counts = myEvents.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  }, [myEvents]);

  const openEvent = (id) => {
    setSelectedEventId(id);
  };

  const handleNotificationPress = async (item) => {
    try {
      await markNotificationAsRead({ notificationId: item.id, userId: user.id });
      setNotifications((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)));
    } catch (error) {
      Alert.alert("Error", "Could not mark notification as read.");
    }

    if (item.eventId) {
      setSelectedEventId(item.eventId);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((entry) => ({ ...entry, isRead: true })));
    } catch (error) {
      Alert.alert("Error", "Could not mark all notifications as read.");
    }
  };

  const handleToggleBookmark = async (eventId) => {
    try {
      const isBookmarked = bookmarkedEventIds.includes(eventId);
      const nowBookmarked = await toggleEventBookmark({ eventId, userId: user.id, isBookmarked });
      setBookmarkedEventIds((prev) => {
        if (nowBookmarked) {
          return prev.includes(eventId) ? prev : [...prev, eventId];
        }
        return prev.filter((id) => id !== eventId);
      });
    } catch (error) {
      Alert.alert("Error", "Could not update bookmark.");
    }
  };

  const handleRegisterEvent = async () => {
    if (!selectedEvent) {
      return;
    }
    if (registeredEventIds.includes(selectedEvent.id)) {
      return;
    }
    setRegistering(true);
    try {
      const result = await registerForEvent({ eventId: selectedEvent.id, userId: user.id });
      const latestRegistrations = await fetchEventRegistrations(user.id);
      setRegisteredEventIds(
        latestRegistrations
          .filter((item) => item.status === "registered")
          .map((item) => item.event_id)
      );

      if (result?.status === "waitlisted") {
        Alert.alert("Waitlisted", "This event is full. You have been added to the waitlist.");
      } else {
        Alert.alert("Success", "You have successfully registered for this event.");
      }
    } catch (error) {
      Alert.alert("Registration failed", error?.message || "Could not register for this event.");
    } finally {
      setRegistering(false);
    }
  };

  const submitLogin = async () => {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!loginForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(loginForm.email.trim())) {
      errors.email = "Enter a valid email";
    }
    if (!loginForm.password.trim()) {
      errors.password = "Password is required";
    }

    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoginLoading(true);
    try {
      const { appUser } = await signInWithEmailPassword({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      });

      setUser((prev) => ({ ...prev, ...appUser }));
      setProfileDraft((prev) => ({ ...prev, ...appUser }));
      setIsAuthenticated(true);
      setPhase("main");
      setLoginErrors({});
    } catch (error) {
      setLoginErrors({ general: getAuthErrorMessage(error) });
    } finally {
      setLoginLoading(false);
    }
  };

  const submitSignup = async () => {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isStaffSignup = signupForm.accountType === "staff";

    if (!signupForm.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    if (!signupForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(signupForm.email.trim())) {
      errors.email = "Enter a valid email";
    }
    if (!signupForm.department.trim()) {
      errors.department = "Department is required";
    }
    if (!isStaffSignup && !signupForm.level.trim()) {
      errors.level = "Level is required";
    }
    if (!isStaffSignup && !signupForm.matricNumber.trim()) {
      errors.matricNumber = "Matric number is required";
    }
    if (isStaffSignup && !signupForm.staffId.trim()) {
      errors.staffId = "Staff ID is required";
    }
    if (isStaffSignup && !signupForm.roleDesignation.trim()) {
      errors.roleDesignation = "Role designation is required";
    }
    if (!signupForm.password.trim()) {
      errors.password = "Password is required";
    }
    if (!signupForm.confirmPassword.trim()) {
      errors.confirmPassword = "Confirm your password";
    } else if (signupForm.confirmPassword !== signupForm.password) {
      errors.confirmPassword = "Passwords do not match";
    }
    setSignupErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSignupLoading(true);
    try {
      const { appUser, requiresEmailConfirmation } = await signUpWithEmailPassword({
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password,
        profile: {
          accountType: signupForm.accountType,
          fullName: signupForm.fullName,
          department: signupForm.department,
          level: signupForm.level,
          faculty: signupForm.faculty,
          matricNumber: signupForm.matricNumber,
          staffId: signupForm.staffId,
          roleDesignation: signupForm.roleDesignation,
        },
      });

      setSignupErrors({});

      if (requiresEmailConfirmation) {
        setAuthScreen("login");
        setLoginForm((prev) => ({ ...prev, email: signupForm.email.trim().toLowerCase(), password: "" }));
        setLoginErrors({ general: "Account created. Check your email to verify, then log in." });
        return;
      }

      if (appUser) {
        setUser((prev) => ({ ...prev, ...appUser }));
        setProfileDraft((prev) => ({ ...prev, ...appUser }));
        setIsAuthenticated(true);
        setPhase("main");
      }
    } catch (error) {
      setSignupErrors({ general: getAuthErrorMessage(error) });
    } finally {
      setSignupLoading(false);
    }
  };

  const submitCreateEvent = async () => {
    const errors = {};
    ["title", "category", "description", "date", "time", "venue", "organizer", "image"].forEach((field) => {
      if (!createEventForm[field]?.trim()) {
        errors[field] = "Required";
      }
    });

    setCreateEventErrors(errors);
    if (Object.keys(errors).length > 0) {
      return false;
    }

    try {
      const created = await createEventFromForm({ form: createEventForm, userId: user.id });
      setEvents((prev) => [created, ...prev]);
      setCreatingEvent(false);
      setActiveTab("home");
      setCreateEventForm({
        title: "",
        category: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        organizer: "",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80",
      });
      setCreateEventErrors({});
      return true;
    } catch (error) {
      Alert.alert("Create failed", error?.message || "Could not create event.");
      return false;
    }
  };

  const saveProfile = async () => {
    const localDraft = { ...profileDraft, themeMode };

    try {
      const updatedUser = await updateCurrentUserProfile(localDraft);
      const mergedUser = {
        ...localDraft,
        ...updatedUser,
        phoneNumber: localDraft.phoneNumber || localDraft.phone || "",
      };

      setUser((prev) => ({ ...prev, ...mergedUser }));
      setProfileDraft((prev) => ({ ...prev, ...mergedUser }));
      await cacheProfileLocally(mergedUser);
      return { ok: true, mode: "remote" };
    } catch (error) {
      // Keep edits locally if remote update fails so user work is never lost.
      const localOnlyProfile = {
        ...localDraft,
        phoneNumber: localDraft.phoneNumber || localDraft.phone || "",
      };

      setUser((prev) => ({ ...prev, ...localOnlyProfile }));
      setProfileDraft((prev) => ({ ...prev, ...localOnlyProfile }));
      await cacheProfileLocally(localOnlyProfile);
      return {
        ok: false,
        mode: "local",
        message: getAuthErrorMessage(error),
      };
    }
  };

  const handleUploadAvatar = async (localUri) => {
    try {
      const uploaded = await uploadImageToBucket({
        bucket: STORAGE_BUCKETS.avatars,
        userId: user?.id,
        localUri,
      });

      setProfileDraft((prev) => ({
        ...prev,
        avatar: uploaded.path,
      }));

      return { ok: true, ...uploaded };
    } catch (error) {
      return { ok: false, message: error?.message || "Could not upload avatar. Check your storage policy and session." };
    }
  };

  const isStaffUser = user?.accountType === "staff";

  const logout = async () => {
    try {
      await signOutCurrentUser();
      await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
    } catch (error) {
      console.log("Logout error:", error?.message || error);
    }

    setIsAuthenticated(false);
    setUser(seedUser);
    setProfileDraft(seedUser);
    setPhase("auth");
    setAuthScreen("login");
    setSelectedEventId(null);
    setEditingProfile(false);
    setCreatingEvent(false);
    setOpeningAnnouncement(false);
    setOpeningSettings(false);
    setEvents([]);
    setNotifications([]);
    setRegisteredEventIds([]);
    setBookmarkedEventIds([]);
  };

  const onSearchChange = (value) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      setRecentSearches((prev) => {
        const updated = [value.trim().toLowerCase(), ...prev.filter((item) => item !== value.trim().toLowerCase())];
        return updated.slice(0, 5);
      });
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const removeRecentSearch = (searchItem) => {
    setRecentSearches((prev) => prev.filter((item) => item !== searchItem));
  };

  const renderAuthScreen = () => {
    if (authScreen === "login") {
      return (
        <LoginScreen
          email={loginForm.email}
          password={loginForm.password}
          showPassword={loginForm.showPassword}
          errors={loginErrors}
          loading={loginLoading}
          onChangeEmail={(value) => {
            setLoginForm((prev) => ({ ...prev, email: value }));
            setLoginErrors({});
          }}
          onChangePassword={(value) => {
            setLoginForm((prev) => ({ ...prev, password: value }));
            setLoginErrors({});
          }}
          onTogglePassword={() => setLoginForm((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
          onLogin={submitLogin}
          onSwitchToSignup={() => {
            setAuthScreen("signup");
            setLoginErrors({});
          }}
        />
      );
    }

    return (
      <SignupScreen
        values={signupForm}
        errors={signupErrors}
        loading={signupLoading}
        onChange={(field, value) => {
          setSignupForm((prev) => ({ ...prev, [field]: value }));
          setSignupErrors({});
        }}
        onRegister={submitSignup}
        onSwitchToLogin={() => {
          setAuthScreen("login");
          setSignupErrors({});
        }}
      />
    );
  };

  const renderInShell = (content, safeAreaEdges = ["bottom", "left", "right"]) => (
    <SafeAreaProvider>
      <ThemeProvider mode={themeMode} setMode={setThemeMode}>
        <SafeAreaView edges={safeAreaEdges} style={[styles.safeArea, { backgroundColor: colors.background }]}>
          <StatusBar
            style={systemBarStyle}
            backgroundColor={systemBarBackground}
            translucent={false}
          />
          {content}
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );

  if (phase === "splash") {
    return renderInShell(<SplashScreen />, ["left", "right"]);
  }

  if (phase === "onboarding") {
    return renderInShell(
      <OnboardingScreen
        step={onboardingStep}
        onNext={() => setOnboardingStep((prev) => prev + 1)}
        onSkip={() => {
          setHasSeenOnboarding(true);
          setPhase("auth");
        }}
        onGetStarted={() => {
          setHasSeenOnboarding(true);
          setPhase("auth");
        }}
      />,
      ["bottom", "left", "right"]
    );
  }

  if (!isAuthenticated || phase === "auth") {
    return renderInShell(renderAuthScreen(), ["bottom", "left", "right"]);
  }

  if (selectedEvent) {
    return renderInShell(
      <EventDetailsScreen
        event={selectedEvent}
        isRegistered={registeredEventIds.includes(selectedEvent.id)}
        isBookmarked={bookmarkedEventIds.includes(selectedEvent.id)}
        registering={registering}
        onRegister={handleRegisterEvent}
        onToggleBookmark={() => handleToggleBookmark(selectedEvent.id)}
        onBack={() => setSelectedEventId(null)}
      />,
      ["bottom", "left", "right"]
    );
  }

  if (editingProfile) {
    return renderInShell(
      <EditProfileScreen
        values={profileDraft}
        onChange={(field, value) => setProfileDraft((prev) => ({ ...prev, [field]: value }))}
        onUploadAvatar={handleUploadAvatar}
        onSave={saveProfile}
        onSaveSuccess={() => {
          setEditingProfile(false);
        }}
        onBack={() => {
          setProfileDraft(user);
          setEditingProfile(false);
        }}
      />,
      ["top", "bottom", "left", "right"]
    );
  }

  if (creatingEvent) {
    return renderInShell(
      <CreateEventScreen
        values={createEventForm}
        errors={createEventErrors}
        onChange={(field, value) => {
          setCreateEventForm((prev) => ({ ...prev, [field]: value }));
          setCreateEventErrors((prev) => ({ ...prev, [field]: undefined }));
        }}
        onSubmit={submitCreateEvent}
        onBack={() => setCreatingEvent(false)}
      />,
      ["bottom", "left", "right"]
    );
  }

  if (openingSettings) {
    return renderInShell(
      <SettingsScreen onBack={() => setOpeningSettings(false)} onLogout={logout} />,
      ["bottom", "left", "right"]
    );
  }

  if (openingAnnouncement) {
    return renderInShell(
      <SendAnnouncementScreen onBack={() => setOpeningAnnouncement(false)} />,
      ["bottom", "left", "right"]
    );
  }

  return renderInShell(
    <AppNavigator
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isStaff={isStaffUser}
      homeProps={{
        user,
        dashboardType: isStaffUser ? "staff" : "student",
        bookmarkedEventIds,
        featuredEvents,
        events: filteredHomeEvents,
        onToggleBookmark: handleToggleBookmark,
        onOpenEvent: openEvent,
        onOpenNotifications: () => setActiveTab("notifications"),
        onOpenProfile: () => setActiveTab("profile"),
      }}
      searchProps={{
        value: searchQuery,
        recentSearches,
        results: searchResults,
        onChange: onSearchChange,
        onSelectRecent: setSearchQuery,
        onClearRecent: clearRecentSearches,
        onRemoveRecent: removeRecentSearch,
        onOpenEvent: openEvent,
        onBack: () => setActiveTab("home"),
      }}
      myEventsProps={{
        events: myEvents,
        isStaff: isStaffUser,
        onOpenEvent: openEvent,
        onBack: () => setActiveTab("home"),
        onOpenNotifications: () => setActiveTab("notifications"),
        onCreateEvent: () => setCreatingEvent(true),
        onOpenAnnouncement: () => setOpeningAnnouncement(true),
      }}
      notificationsProps={{
        notifications,
        onPressItem: handleNotificationPress,
        onMarkAllRead: markAllNotificationsRead,
        onBack: () => setActiveTab("home"),
      }}
      profileProps={{
        user,
        isStaff: isStaffUser,
        totalRegistered: registeredEventIds.length,
        favoriteCategory,
        themeMode,
        onToggleTheme: () => setThemeMode((prev) => (prev === "dark" ? "light" : "dark")),
        onEditProfile: () => {
          setProfileDraft(user);
          setEditingProfile(true);
        },
        onOpenMyEvents: () => setActiveTab("my-events"),
        onOpenSavedEvents: () => setActiveTab("home"),
        onOpenNotifications: () => setActiveTab("notifications"),
        onOpenSettings: () => setOpeningSettings(true),
        onCreateEvent: () => setCreatingEvent(true),
        onLogout: logout,
      }}
    />,
    ["left", "right"]
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});