import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "../../lib/supabase";
import { eventStartTime } from "../utils/eventTime";

// Determine if we're running inside Expo Go
const isExpoGo =
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";

let Notifications = null;
try {
  // Expo Go completely removed native push notifications.
  // Guard the require to prevent runtime crashes in Expo Go or Web.
  if (!isExpoGo && Platform.OS !== "web") {
    Notifications = require("expo-notifications");
  }
} catch (e) {
  console.log("[Notifications] expo-notifications module unavailable:", e?.message || e);
}

// Configure foreground notification behavior
try {
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        // Support both modern (SDK 51+) and legacy properties
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (_e) {
  console.log("[Notifications] Push notifications disabled in this environment.");
}

/**
 * Configure Android notification channels
 */
async function configureAndroidChannels() {
  if (Platform.OS !== "android" || !Notifications) return;

  try {
    // Default channel for general notifications & announcements
    await Notifications.setNotificationChannelAsync("default", {
      name: "General Announcements",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2E7D32",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });

    // Dedicated channel for event reminders
    await Notifications.setNotificationChannelAsync("event-reminders", {
      name: "Event Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: "#1B5E20",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
  } catch (err) {
    console.warn("[Notifications] Failed to setup Android channels:", err?.message || err);
  }
}

/**
 * Resolves the EAS project ID across configuration formats
 */
function getEasProjectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId ??
    Constants?.manifest2?.extra?.expoClient?.extra?.eas?.projectId ??
    Constants?.manifest?.extra?.eas?.projectId ??
    Constants?.expoConfig?.extra?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID ??
    process.env.EAS_PROJECT_ID ??
    null
  );
}

/**
 * Checks current notification permission status without prompting
 */
export async function getNotificationPermissionsAsync() {
  if (!Notifications || Platform.OS === "web") {
    return { granted: false, status: "undetermined" };
  }
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return permissions;
  } catch (e) {
    console.warn("[Notifications] Error checking permissions:", e?.message || e);
    return { granted: false, status: "error" };
  }
}

/**
 * Requests push notification permissions from the user
 */
export async function requestNotificationPermissionsAsync() {
  if (!Notifications || Platform.OS === "web") {
    return { granted: false, status: "undetermined" };
  }
  try {
    const permissions = await Notifications.requestPermissionsAsync();
    return permissions;
  } catch (e) {
    console.warn("[Notifications] Error requesting permissions:", e?.message || e);
    return { granted: false, status: "error" };
  }
}

/**
 * Registers the device for Expo Push Notifications and saves the token to Supabase.
 * Returns the token string on success, or null if unsupported/failed.
 */
export async function registerForPushNotificationsAsync(userId) {
  if (Platform.OS === "web") {
    console.log("[Notifications] Push notifications not supported on web without VAPID config.");
    return null;
  }

  if (isExpoGo || !Notifications) {
    console.log("[Notifications] Push notifications are not supported in Expo Go. Use a development build.");
    return null;
  }

  await configureAndroidChannels();

  let token = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[Notifications] Permission not granted for push notifications.");
      return null;
    }

    try {
      const projectId = getEasProjectId();
      if (!projectId) {
        console.warn("[Notifications] EAS Project ID not found in app config; token request may fail.");
      }

      const params = projectId ? { projectId } : {};
      const pushTokenData = await Notifications.getExpoPushTokenAsync(params);
      token = pushTokenData?.data ?? null;
      console.log("[Notifications] Expo Push Token obtained:", token);
    } catch (e) {
      console.error("[Notifications] Error getting push token:", e?.message || e);
      return null;
    }
  } else {
    console.log("[Notifications] Push notifications require a physical device.");
    return null;
  }

  // Persist token to Supabase profile if userId is provided
  if (token && userId && supabase) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          expo_push_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("[Notifications] Error saving push token to profile:", error.message);
      } else {
        console.log("[Notifications] Push token successfully synchronized with Supabase profile.");
      }
    } catch (e) {
      console.error("[Notifications] Exception saving push token to Supabase:", e?.message || e);
    }
  }

  return token;
}

/**
 * Schedule a local notification (e.g. for an upcoming event reminder)
 * @param {Object} options
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Date|number} options.triggerDate - When to fire the reminder
 * @param {Object} [options.data] - Custom data payload
 * @param {string} [options.channelId] - Android channel ("event-reminders" or "default")
 * @returns {Promise<string|null>} notificationId or null
 */
export async function scheduleEventReminderAsync({
  title,
  body,
  triggerDate,
  data = {},
  channelId = "event-reminders",
  identifier,
}) {
  if (!Notifications) return null;

  try {
    const trigger = triggerDate instanceof Date ? triggerDate : new Date(triggerDate);
    if (isNaN(trigger.getTime()) || trigger.getTime() <= Date.now()) {
      console.warn("[Notifications] Trigger date must be in the future.");
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        data,
        sound: "default",
        channelId,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: trigger,
        channelId,
      },
    });

    return notificationId;
  } catch (err) {
    console.error("[Notifications] Error scheduling reminder:", err?.message || err);
    return null;
  }
}

/**
 * Cancels a scheduled local notification by ID
 */
export async function cancelScheduledNotificationAsync(notificationId) {
  if (!Notifications || !notificationId) return false;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    return true;
  } catch (err) {
    console.error("[Notifications] Error canceling notification:", err?.message || err);
    return false;
  }
}

/**
 * Cancels all scheduled local notifications
 */
export async function cancelAllScheduledNotificationsAsync() {
  if (!Notifications) return false;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  } catch (err) {
    console.error("[Notifications] Error canceling all notifications:", err?.message || err);
    return false;
  }
}

/**
 * Retrieves all currently scheduled notifications
 */
export async function getAllScheduledNotificationsAsync() {
  if (!Notifications) return [];
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (err) {
    console.error("[Notifications] Error getting scheduled notifications:", err?.message || err);
    return [];
  }
}

let reminderSync = Promise.resolve();

export function syncEventReminders({ userId, events = [], registeredEventIds = [] }) {
  // Serialize updates so a stale refresh cannot recreate reminders after logout.
  reminderSync = reminderSync.catch(() => {}).then(async () => {
    if (!Notifications) return;
    const desired = new Map();
    if (userId) for (const event of events) {
      if (!registeredEventIds.includes(event.id) || event.status !== "published") continue;
      const start = eventStartTime(event);
      const reminderAt = start ? start.getTime() - 15 * 60000 : 0;
      if (reminderAt <= Date.now()) continue;
      desired.set(`nsuk-reminder:${userId}:${event.id}`, { event, reminderAt });
    }
    const existing = await getAllScheduledNotificationsAsync();
    for (const notification of existing) {
      if (notification.content?.data?.type !== "event-reminder") continue;
      const next = desired.get(notification.identifier);
      if (next && notification.content.data.reminderAt === next.reminderAt && notification.content.body === `${next.event.title} · ${next.event.venue}`) {
        desired.delete(notification.identifier);
      } else {
        await cancelScheduledNotificationAsync(notification.identifier);
      }
    }
    for (const [identifier, { event, reminderAt }] of desired) {
      await scheduleEventReminderAsync({ identifier, title: "Your event starts in 15 minutes", body: `${event.title} · ${event.venue}`, triggerDate: new Date(reminderAt), data: { eventId: event.id, type: "event-reminder", reminderAt } });
    }
  });
  return reminderSync;
}

/**
 * Triggers an immediate local notification (useful for in-app alert or testing)
 */
export async function presentLocalNotificationAsync({ title, body, data = {} }) {
  if (!Notifications) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
        channelId: "default",
      },
      trigger: null, // triggers immediately
    });
  } catch (err) {
    console.error("[Notifications] Error presenting local notification:", err?.message || err);
    return null;
  }
}

/**
 * Sets the app badge icon count
 */
export async function setBadgeCountAsync(count) {
  if (!Notifications) return false;
  try {
    await Notifications.setBadgeCountAsync(Math.max(0, count));
    return true;
  } catch (err) {
    console.warn("[Notifications] Error setting badge count:", err?.message || err);
    return false;
  }
}

/**
 * Clears the app badge count to 0
 */
export async function clearBadgeCountAsync() {
  return setBadgeCountAsync(0);
}

/**
 * Gets the current app badge count
 */
export async function getBadgeCountAsync() {
  if (!Notifications) return 0;
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (err) {
    console.warn("[Notifications] Error getting badge count:", err?.message || err);
    return 0;
  }
}

/**
 * Subscribe to notification taps. `handler` receives the push `data` payload and the raw response.
 * Returns a subscription object with a `.remove()` method.
 */
export function addNotificationResponseListener(handler) {
  if (!Notifications) {
    return { remove: () => {} };
  }
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response?.notification?.request?.content?.data ?? {};
    handler(data, response);
  });
}

/**
 * Subscribe to foreground notifications received while the app is active.
 * Returns a subscription object with a `.remove()` method.
 */
export function addNotificationReceivedListener(handler) {
  if (!Notifications) {
    return { remove: () => {} };
  }
  return Notifications.addNotificationReceivedListener((notification) => {
    const data = notification?.request?.content?.data ?? {};
    handler(data, notification);
  });
}

/**
 * When the app is launched by tapping a notification (cold start),
 * returns that notification's `data` payload, or null if the app opened normally.
 */
export async function getInitialNotificationData() {
  if (!Notifications) {
    return null;
  }
  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    return response?.notification?.request?.content?.data ?? null;
  } catch (e) {
    console.log("[Notifications] Could not read initial notification response:", e?.message || e);
    return null;
  }
}

export default {
  registerForPushNotificationsAsync,
  getNotificationPermissionsAsync,
  requestNotificationPermissionsAsync,
  scheduleEventReminderAsync,
  cancelScheduledNotificationAsync,
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
  presentLocalNotificationAsync,
  setBadgeCountAsync,
  clearBadgeCountAsync,
  getBadgeCountAsync,
  addNotificationResponseListener,
  addNotificationReceivedListener,
  getInitialNotificationData,
};
