import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet } from "react-native";
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
import SettingsScreen from "./src/screens/SettingsScreen";
import SignupScreen from "./src/screens/SignupScreen";
import SplashScreen from "./src/screens/SplashScreen";
import { ThemeProvider, getThemeColors } from "./src/theme/theme";
import { CATEGORIES, DUMMY_LOGIN } from "./src/utils/constants";
import { filterByCategory, searchEvents } from "./src/utils/helpers";

export default function App() {
  const [themeMode, setThemeMode] = useState("light");
  const colors = getThemeColors(themeMode);

  const [phase, setPhase] = useState("splash");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [authScreen, setAuthScreen] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
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
    fullName: "",
    email: "",
    department: "",
    level: "",
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
      if (
        loginForm.email.trim().toLowerCase() === DUMMY_LOGIN.email &&
        loginForm.password.trim() === DUMMY_LOGIN.password
      ) {
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
    if (!signupForm.level.trim()) {
      errors.level = "Level is required";
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
      setUser((prev) => ({
        ...prev,
        fullName: signupForm.fullName,
        email: signupForm.email,
        department: signupForm.department,
        level: signupForm.level,
      }));
      setProfileDraft((prev) => ({
        ...prev,
        fullName: signupForm.fullName,
        email: signupForm.email,
        department: signupForm.department,
        level: signupForm.level,
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

  const logout = () => {
    setIsAuthenticated(false);
    setPhase("auth");
    setAuthScreen("login");
    setSelectedEventId(null);
    setEditingProfile(false);
    setCreatingEvent(false);
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

  const renderInShell = (content, safeAreaEdges = ["top", "left", "right"]) => (
    <SafeAreaProvider>
      <ThemeProvider mode={themeMode} setMode={setThemeMode}>
        <SafeAreaView edges={safeAreaEdges} style={[styles.safeArea, { backgroundColor: colors.background }]}>
          {content}
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );

  if (phase === "splash") {
    return renderInShell(<SplashScreen />, ["top", "bottom", "left", "right"]);
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
      ["top", "bottom", "left", "right"]
    );
  }

  if (!isAuthenticated || phase === "auth") {
    return renderInShell(renderAuthScreen(), ["top", "bottom", "left", "right"]);
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
      ["top", "bottom", "left", "right"]
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
      ["top", "bottom", "left", "right"]
    );
  }

  if (openingSettings) {
    return renderInShell(
      <SettingsScreen onBack={() => setOpeningSettings(false)} onLogout={logout} />,
      ["top", "bottom", "left", "right"]
    );
  }

  return renderInShell(
    <AppNavigator
      activeTab={activeTab}
      onTabChange={setActiveTab}
      homeProps={{
        user,
        categories: CATEGORIES,
        selectedCategory,
        searchText: homeSearch,
        featuredEvents,
        events: filteredHomeEvents,
        onChangeSearch: setHomeSearch,
        onSelectCategory: setSelectedCategory,
        onOpenEvent: openEvent,
        onOpenNotifications: () => setActiveTab("notifications"),
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
        onOpenEvent: openEvent,
        onBack: () => setActiveTab("home"),
        onOpenNotifications: () => setActiveTab("notifications"),
        onCreateEvent: () => setCreatingEvent(true),
      }}
      notificationsProps={{
        notifications,
        onPressItem: handleNotificationPress,
      }}
      profileProps={{
        user,
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
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});