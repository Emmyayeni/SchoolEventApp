import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  getCurrentAppUser,
  onAuthStateChange,
  signInWithEmailPassword,
  signOutCurrentUser,
  signUpWithEmailPassword,
  updateCurrentUserProfile,
  resetPasswordForEmail,
} from "../../lib/Auth";
import { STORAGE_BUCKETS, uploadImageToBucket } from "../services/storage";
import { normalizeEmail, validateLogin, validateSignup } from "../utils/validation";

const PROFILE_CACHE_KEY = "@nsuk/profile_cache";
const ONBOARDING_KEY = "@nsuk/has_seen_onboarding";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileDraft, setProfileDraft] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

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
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.log("Profile cache read error:", error?.message || error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const onboardingValue = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (isMounted && onboardingValue === "true") {
          setHasSeenOnboarding(true);
        }

        const cachedProfile = await getCachedProfile();
        if (isMounted && cachedProfile) {
          setProfileDraft(cachedProfile);
        }

        const currentUser = await getCurrentAppUser();
        if (!isMounted || !currentUser) {
          return;
        }

        setUser(currentUser);
        setProfileDraft(currentUser);
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
      if (!isMounted) return;

      if (!nextUser) {
        if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
          setUser(null);
          setProfileDraft(null);
          AsyncStorage.removeItem(PROFILE_CACHE_KEY).catch(() => {});
        }
        return;
      }

      setUser(nextUser);
      setProfileDraft(nextUser);
      setIsAuthenticated(true);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const markOnboardingComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setHasSeenOnboarding(true);
  };

  const login = async ({ email, password }) => {
    const errors = validateLogin({ email, password });
    if (Object.keys(errors).length) return { ok: false, errors };
    setLoginLoading(true);
    try {
      const { appUser } = await signInWithEmailPassword({ email: normalizeEmail(email), password });
      setUser(appUser);
      setProfileDraft(appUser);
      await cacheProfileLocally(appUser);
      setIsAuthenticated(true);
      return { ok: true, user: appUser };
    } catch (error) {
      return { ok: false, error };
    } finally {
      setLoginLoading(false);
    }
  };

  const signup = async (formValues) => {
    const errors = validateSignup(formValues);
    if (Object.keys(errors).length) return { ok: false, errors };
    setSignupLoading(true);
    try {
      const result = await signUpWithEmailPassword({
        email: normalizeEmail(formValues.email), password: formValues.password, profile: formValues,
      });
      const { appUser, requiresEmailConfirmation, requiresApproval } = result;
      if (requiresEmailConfirmation || requiresApproval) return { ok: true, requiresEmailConfirmation, requiresApproval };
      setUser(appUser);
      setProfileDraft(appUser);
      await cacheProfileLocally(appUser);
      setIsAuthenticated(true);
      return { ok: true, user: appUser };
    } catch (error) {
      return { ok: false, error };
    } finally {
      setSignupLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutCurrentUser();
      await AsyncStorage.removeItem(PROFILE_CACHE_KEY);
      setUser(null);
      setProfileDraft(null);
      setIsAuthenticated(false);
    } catch (error) {
      Alert.alert("Logout error", error?.message || "Could not log out at this time.");
    }
  };

  const saveProfile = async (overrides = {}) => {
    const updatedDraft = { ...profileDraft, ...overrides };
    try {
      const savedUser = await updateCurrentUserProfile(updatedDraft);
      setUser(savedUser);
      setProfileDraft(savedUser);
      await cacheProfileLocally(savedUser);
      return { ok: true, user: savedUser };
    } catch (error) {
      Alert.alert("Save Failed", error?.message || "Could not update your profile.");
      return { ok: false, error };
    }
  };

  const handleUploadAvatar = async (imageUri) => {
    try {
      const result = await uploadImageToBucket({ bucket: STORAGE_BUCKETS.avatars, localUri: imageUri, userId: user?.id });
      setProfileDraft((prev) => ({ ...prev, avatar: result.publicUrl }));
      return { ...result, ok: true, path: result.publicUrl };
    } catch (error) {
      Alert.alert("Upload Error", error?.message || "Failed to upload image.");
      return { ok: false, message: error?.message };
    }
  };

  const resetPassword = async (email) => {
    return resetPasswordForEmail(email);
  };

  const isStaffUser = ["staff", "organizer", "admin"].includes(user?.accountType);
  const isAdminUser = user?.accountType === "admin";

  const value = {
    user,
    setUser,
    profileDraft,
    setProfileDraft,
    isAuthenticated,
    authInitializing,
    hasSeenOnboarding,
    markOnboardingComplete,
    loginLoading,
    signupLoading,
    login,
    signup,
    logout,
    saveProfile,
    handleUploadAvatar,
    resetPassword,
    isStaffUser,
    isAdminUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
