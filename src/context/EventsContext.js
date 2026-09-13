import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  createAnnouncement,
  createEventFromForm,
  deleteEventById,
  deleteEventByIdAsAdmin,
  fetchAdminUsers,
  fetchAnnouncements,
  fetchEventBookmarks,
  fetchEventRegistrations,
  fetchEvents,
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  registerForEvent,
  toggleEventBookmark,
  updateEventFromForm,
} from "../services/supabaseData";
import { supabase } from "../../lib/supabase";
import { STORAGE_BUCKETS, uploadImageToBucket } from "../services/storage";
import { registerForPushNotificationsAsync, scheduleEventReminderAsync, cancelAllScheduledNotificationsAsync } from "../services/notifications";
import { eventStartTime } from "../utils/eventTime";
import { useAuth } from "./AuthContext";

const CACHE_EVENTS_KEY = "@nsuk/cached_events";
const CACHE_ANNOUNCEMENTS_KEY = "@nsuk/cached_announcements";

const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [waitlistedEventIds, setWaitlistedEventIds] = useState([]);
  const [registeringEventId, setRegisteringEventId] = useState(null);
  const registrationInProgress = useRef(false);
  const [bookmarkedEventIds, setBookmarkedEventIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const activeUserId = useRef(null);
  activeUserId.current = isAuthenticated ? user?.id : null;

  // Restore cache on launch & subscribe to Supabase Realtime
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const currentUserId = user.id;
    let active = true;
    const restoreCache = async () => {
      try {
        const [cachedEvents, cachedAnnouncements] = await Promise.all([
          AsyncStorage.getItem(`${CACHE_EVENTS_KEY}/${currentUserId}`),
          AsyncStorage.getItem(`${CACHE_ANNOUNCEMENTS_KEY}/${currentUserId}`),
        ]);
        if (!active) return;
        if (cachedEvents) {
          const parsed = JSON.parse(cachedEvents);
          if (Array.isArray(parsed) && parsed.length > 0) setEvents(parsed);
        }
        if (cachedAnnouncements) {
          const parsed = JSON.parse(cachedAnnouncements);
          if (Array.isArray(parsed) && parsed.length > 0) setAnnouncements(parsed);
        }
      } catch (_e) {
        // Cache read fallback
      }
    };
    restoreCache();

    // Realtime channel for announcements and events
    const channel = supabase
      .channel("nsuk_realtime_feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => {
          fetchAnnouncements().then((rows) => {
            if (active) setAnnouncements(rows);
          }).catch(() => {});
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        (_payload) => {
          fetchEvents()
            .then((latestEvents) => {
              if (active && Array.isArray(latestEvents)) {
                setEvents(latestEvents);
                AsyncStorage.setItem(`${CACHE_EVENTS_KEY}/${currentUserId}`, JSON.stringify(latestEvents)).catch(() => {});
              }
            })
            .catch(() => {});
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id]);

  const loadAppData = useCallback(
    async (currentUserId, accountType, userRole) => {
      try {
        setRefreshing(true);
        setLoadError(null);
        const baseQueries = [
          fetchEvents(),
          fetchEventRegistrations(currentUserId),
          fetchEventBookmarks(currentUserId),
          fetchNotifications(currentUserId),
          fetchAnnouncements(),
        ];

        const shouldLoadAdminUsers = accountType === "admin" || (userRole && userRole !== "viewer");
        if (shouldLoadAdminUsers) {
          baseQueries.push(fetchAdminUsers());
        }

        const [eventRows, registrationRows, bookmarkIds, notificationRows, announcementRows, adminUserRows] =
          await Promise.all(baseQueries);

        if (activeUserId.current !== currentUserId) return;

        setEvents(eventRows);
        setRegisteredEventIds(
          registrationRows.filter((item) => item.status === "registered").map((item) => item.event_id)
        );
        setWaitlistedEventIds(registrationRows.filter((item) => item.status === "waitlisted").map((item) => item.event_id));
        setBookmarkedEventIds(bookmarkIds);
        setNotifications(notificationRows);
        setAnnouncements(announcementRows);

        if (shouldLoadAdminUsers) {
          setAdminUsers(adminUserRows || []);
        } else {
          setAdminUsers([]);
        }

        // Cache for offline/instant launch
        AsyncStorage.setItem(`${CACHE_EVENTS_KEY}/${currentUserId}`, JSON.stringify(eventRows)).catch(() => {});
        AsyncStorage.setItem(`${CACHE_ANNOUNCEMENTS_KEY}/${currentUserId}`, JSON.stringify(announcementRows)).catch(() => {});
      } catch (err) {
        if (activeUserId.current === currentUserId) setLoadError(err?.message || "Could not load campus updates.");
        console.log("Error loading app data:", err?.message || err);
      } finally {
        if (activeUserId.current === currentUserId) setRefreshing(false);
      }
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    if (user?.id) {
      await loadAppData(user.id, user.accountType, user.role);
    }
  }, [user, loadAppData]);

  // Load app data when user is authenticated
  useEffect(() => {
    setEvents([]);
    setAnnouncements([]);
    setNotifications([]);
    setAdminUsers([]);
    setRegisteredEventIds([]);
    setWaitlistedEventIds([]);
    setBookmarkedEventIds([]);
    setRefreshing(false);
    setLoadError(null);
    if (isAuthenticated && user?.id) {
      loadAppData(user.id, user.accountType, user.role);
      registerForPushNotificationsAsync(user.id).catch((e) => {
        console.log("Push registration error:", e);
      });
    } else {
      cancelAllScheduledNotificationsAsync();
    }
  }, [isAuthenticated, user?.id, user?.accountType, user?.role, loadAppData]);

  const handleToggleBookmark = async (eventId) => {
    const isBookmarked = bookmarkedEventIds.includes(eventId);
    const expectedNewState = !isBookmarked;

    // Optimistically update
    setBookmarkedEventIds((prev) => {
      if (expectedNewState) {
        return prev.includes(eventId) ? prev : [...prev, eventId];
      }
      return prev.filter((id) => id !== eventId);
    });

    try {
      const nowBookmarked = await toggleEventBookmark({ eventId, userId: user.id, isBookmarked });
      if (nowBookmarked !== expectedNewState) {
        setBookmarkedEventIds((prev) => {
          if (nowBookmarked) {
            return prev.includes(eventId) ? prev : [...prev, eventId];
          }
          return prev.filter((id) => id !== eventId);
        });
      }
    } catch (error) {
      // Revert optimistic update
      setBookmarkedEventIds((prev) => {
        if (isBookmarked) {
          return prev.includes(eventId) ? prev : [...prev, eventId];
        }
        return prev.filter((id) => id !== eventId);
      });
      const errorMsg = error?.message || error?.details || "Could not update bookmark.";
      Alert.alert("Bookmark Error", errorMsg);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    if (!eventId || !user?.id || registrationInProgress.current || registeredEventIds.includes(eventId) || waitlistedEventIds.includes(eventId)) return { ok: false };
    registrationInProgress.current = true;
    setRegisteringEventId(eventId);

    try {
      const result = await registerForEvent({ eventId, userId: user.id });
      const latestRegistrations = await fetchEventRegistrations(user.id);
      setRegisteredEventIds(
        latestRegistrations.filter((item) => item.status === "registered").map((item) => item.event_id)
      );
      setWaitlistedEventIds(latestRegistrations.filter((item) => item.status === "waitlisted").map((item) => item.event_id));

      if (result?.status === "waitlisted") {
        Alert.alert("Waitlisted", "This event is full. You have been added to the waitlist.");
      } else {
        const event = events.find((item) => item.id === eventId);
        const start = eventStartTime(event);
        let reminderId = null;
        if (start && start.getTime() - 15 * 60000 > Date.now()) {
          reminderId = await scheduleEventReminderAsync({
            identifier: `nsuk-reminder:${user.id}:${eventId}`,
            title: "Your event starts in 15 minutes",
            body: `${event.title} · ${event.venue}`,
            triggerDate: new Date(start.getTime() - 15 * 60000),
            data: { eventId, type: "event-reminder" },
          });
        }
        Alert.alert("Registered", `You have successfully registered for this event.${reminderId ? " A reminder is set for 15 minutes before it starts." : ""}`);
      }
      return { ok: true, result };
    } catch (error) {
      Alert.alert("Registration failed", error?.message || "Could not register for this event.");
      return { ok: false, error };
    } finally {
      registrationInProgress.current = false;
      setRegisteringEventId(null);
    }
  };

  const handleSendAnnouncement = async ({
    subject,
    message,
    targetAudience,
    scheduledAt,
    mainImageUri,
    attachmentUris = [],
  }) => {
    try {
      const cleanSubject = subject?.trim() || "";
      const cleanMessage = message?.trim() || "";
      if (scheduledAt) throw new Error("Scheduled announcements are not configured. Choose Send now.");

      if (!cleanSubject || !cleanMessage) {
        Alert.alert("Validation Error", "Subject and message cannot be empty.");
        return { ok: false };
      }

      const uploadedUrls = [];

      if (mainImageUri) {
        const uploadResult = await uploadImageToBucket({ bucket: STORAGE_BUCKETS.announcementFiles, localUri: mainImageUri, userId: user?.id });
        uploadedUrls.push(uploadResult.path);
      }

      if (attachmentUris.length > 0) {
        for (const uri of attachmentUris) {
          const uploadResult = await uploadImageToBucket({ bucket: STORAGE_BUCKETS.announcementFiles, localUri: uri, userId: user?.id });
          uploadedUrls.push(uploadResult.path);
        }
      }

      const created = await createAnnouncement({
        userId: user.id,
        subject: cleanSubject,
        message: cleanMessage,
        targetAudience,
        attachmentUrls: uploadedUrls,
      });

      setAnnouncements((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
      return { ok: true, announcement: created };
    } catch (error) {
      Alert.alert("Send failed", error?.message || "Could not send announcement.");
      return { ok: false, error };
    }
  };

  const handleNotificationPress = async (item) => {
    try {
      await markNotificationAsRead({ notificationId: item.id, userId: user.id });
      setNotifications((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, isRead: true } : entry)));
    } catch (error) {
      console.log("Could not mark notification as read:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((entry) => ({ ...entry, isRead: true })));
    } catch (_error) {
      Alert.alert("Error", "Could not mark all notifications as read.");
    }
  };

  const saveEvent = async (formData, editingEventId = null) => {
    try {
      if (editingEventId) {
        const updated = await updateEventFromForm({
          eventId: editingEventId,
          form: formData,
          userId: user.id,
        });
        setEvents((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        return { ok: true, event: updated };
      } else {
        const created = await createEventFromForm({ form: formData, userId: user.id });
        setEvents((prev) => [created, ...prev]);
        return { ok: true, event: created };
      }
    } catch (error) {
      Alert.alert(editingEventId ? "Update failed" : "Create failed", error?.message || "Could not save event.");
      return { ok: false, error };
    }
  };

  const deleteEvent = async (eventId, asAdmin = false) => {
    try {
      if (asAdmin) {
        await deleteEventByIdAsAdmin({ eventId });
      } else {
        await deleteEventById({ eventId, userId: user.id });
      }
      setEvents((prev) => prev.filter((item) => item.id !== eventId));
      setBookmarkedEventIds((prev) => prev.filter((id) => id !== eventId));
      setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
      return { ok: true };
    } catch (error) {
      Alert.alert("Delete failed", error?.message || "Could not delete this event.");
      return { ok: false, error };
    }
  };

  const uploadEventImage = async (imageUri) => {
    const result = await uploadImageToBucket({ bucket: STORAGE_BUCKETS.eventImages, localUri: imageUri, userId: user?.id });
    return { ...result, ok: true, path: result.publicUrl };
  };

  const featuredEvents = useMemo(() => events.filter((e) => e.isFeatured), [events]);

  const adminStats = useMemo(
    () => ({
      totalEvents: events.length,
      totalUsers: adminUsers.length,
      totalRegistrations: registeredEventIds.length,
      activeAnnouncements: announcements.length,
    }),
    [events.length, adminUsers.length, registeredEventIds.length, announcements.length]
  );

  const adminAnalytics = useMemo(() => {
    const eventsByCategory = events.reduce((acc, event) => {
      const key = event.category || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const usersByDepartment = adminUsers.reduce((acc, profile) => {
      const key = profile.department || "General";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      totalEvents: events.length,
      totalUsers: adminUsers.length,
      totalRegistrations: registeredEventIds.length,
      averageAttendance: events.length ? Math.round((registeredEventIds.length / events.length) * 100) : 0,
      eventsByCategory,
      usersByDepartment,
      registrationTrend: [],
      topEvents: events
        .slice()
        .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
        .slice(0, 5),
    };
  }, [events, adminUsers, registeredEventIds.length]);

  const value = {
    events,
    setEvents,
    announcements,
    setAnnouncements,
    notifications,
    setNotifications,
    adminUsers,
    setAdminUsers,
    registeredEventIds,
    waitlistedEventIds,
    registeringEventId,
    bookmarkedEventIds,
    refreshing,
    loadError,
    loadAppData,
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
  };

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
}
