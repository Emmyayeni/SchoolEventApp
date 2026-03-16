import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo, useState } from "react";
import { Alert, AppState, Platform, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { events as seedEvents } from "./src/data/events";
import { notifications as seedNotifications } from "./src/data/notifications";
import { registrations as seedRegistrations } from "./src/data/registrations";
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
import { ThemeProvider, getThemeColors } from "./src/theme/theme";
import {
    CATEGORIES,
    DUMMY_STAFF_LOGIN,
    DUMMY_STAFF_PROFILE,
    DUMMY_STUDENT_LOGIN,
    DUMMY_STUDENT_PROFILE,
} from "./src/utils/constants";
import { filterByCategory, searchEvents } from "./src/utils/helpers";

export default function App() {
  const [themeMode, setThemeMode] = useState("light");
  const colors = getThemeColors(themeMode);
  const systemBarBackground = colors.background;
  const systemBarStyle = themeMode === "dark" ? "light" : "dark";

  const [phase, setPhase] = useState("splash");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [authScreen, setAuthScreen] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [openingAnnouncement, setOpeningAnnouncement] = useState(false);
  const [openingSettings, setOpeningSettings] = useState(false);

  const [events, setEvents] = useState(seedEvents);
  const [user, setUser] = useState(seedUser);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [registeredEventIds, setRegisteredEventIds] = useState(
    seedRegistrations.filter((item) => item.userId === seedUser.id).map((item) => item.eventId)
  );

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        setPhase("onboarding");
        return;
      }
      setPhase(isAuthenticated ? "main" : "auth");
    }, 2400);

    return () => clearTimeout(timer);
  }, [hasSeenOnboarding, isAuthenticated]);

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

  const myEvents = useMemo(
    () => events.filter((event) => registeredEventIds.includes(event.id)),
    [events, registeredEventIds]
  );

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

  const handleNotificationPress = (item) => {
    setNotifications((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)));
    if (item.eventId) {
      setSelectedEventId(item.eventId);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((entry) => ({ ...entry, isRead: true })));
  };

  const handleRegisterEvent = () => {
    if (!selectedEvent) {
      return;
    }
    if (registeredEventIds.includes(selectedEvent.id)) {
      return;
    }

    setRegistering(true);
    setTimeout(() => {
      setRegisteredEventIds((prev) => [...prev, selectedEvent.id]);
      setRegistering(false);
      Alert.alert("Success", "You have successfully registered for this event.");
    }, 800);
  };

  const submitLogin = () => {
    const errors = {};
    if (!loginForm.email.trim()) {
      errors.email = "Email is required";
    }
    if (!loginForm.password.trim()) {
      errors.password = "Password is required";
    }

    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoginLoading(true);
    setTimeout(() => {
      const normalizedEmail = loginForm.email.trim().toLowerCase();
      const normalizedPassword = loginForm.password.trim();
      const matchedCredential = [DUMMY_STUDENT_LOGIN, DUMMY_STAFF_LOGIN].find(
        (credential) => normalizedEmail === credential.email && normalizedPassword === credential.password
      );

      if (
        matchedCredential
      ) {
        const nextProfile =
          matchedCredential.email === DUMMY_STAFF_LOGIN.email ? DUMMY_STAFF_PROFILE : DUMMY_STUDENT_PROFILE;
        setUser(nextProfile);
        setProfileDraft(nextProfile);
        setIsAuthenticated(true);
        setPhase("main");
        setLoginErrors({});
      } else {
        setLoginErrors({ general: "Invalid login credentials." });
      }
      setLoginLoading(false);
    }, 900);
  };

  const submitSignup = () => {
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
    setTimeout(() => {
      const roleLevel = isStaffSignup ? signupForm.roleDesignation : signupForm.level;

      setUser((prev) => ({
        ...prev,
        accountType: signupForm.accountType,
        fullName: signupForm.fullName,
        email: signupForm.email,
        department: signupForm.department,
        level: roleLevel,
      }));
      setProfileDraft((prev) => ({
        ...prev,
        accountType: signupForm.accountType,
        fullName: signupForm.fullName,
        email: signupForm.email,
        department: signupForm.department,
        level: roleLevel,
      }));
      setIsAuthenticated(true);
      setPhase("main");
      setSignupLoading(false);
      setSignupErrors({});
    }, 1000);
  };

  const submitCreateEvent = () => {
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

    const nextId = Math.max(...events.map((item) => item.id)) + 1;
    setEvents((prev) => [{ id: nextId, isFeatured: false, ...createEventForm }, ...prev]);
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
  };

  const saveProfile = () => {
    setUser(profileDraft);
    setEditingProfile(false);
  };

  const isStaffUser = user?.accountType === "staff";

  const logout = () => {
    setIsAuthenticated(false);
    setPhase("auth");
    setAuthScreen("login");
    setSelectedEventId(null);
    setEditingProfile(false);
    setCreatingEvent(false);
    setOpeningAnnouncement(false);
    setOpeningSettings(false);
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
    return renderInShell(<SplashScreen />, ["bottom", "left", "right"]);
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
        registering={registering}
        onRegister={handleRegisterEvent}
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
        onSave={saveProfile}
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
        categories: CATEGORIES,
        selectedCategory,
        searchText: homeSearch,
        featuredEvents,
        events: filteredHomeEvents,
        onChangeSearch: setHomeSearch,
        onSelectCategory: setSelectedCategory,
        onOpenEvent: openEvent,
        onOpenNotifications: () => setActiveTab("notifications"),
        onOpenProfile: () => setActiveTab("profile"),
        onOpenSettings: () => setOpeningSettings(true),
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
        onToggleTheme: () => setThemeMode((prev) => (prev === "light" ? "dark" : "light")),
        onEditProfile: () => {
          setProfileDraft(user);
          setEditingProfile(true);
        },
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