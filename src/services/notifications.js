import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "../../lib/superbase";

let Notifications = null;
try {
  // Expo Go completely removed push notifications. The module throws an error on require.
  if (Constants.appOwnership !== "expo" && Platform.OS !== "web") {
    Notifications = require("expo-notifications");
  }
} catch (e) {
  console.log("Could not require expo-notifications:", e);
}

try {
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.log("Push notifications disabled in this environment.");
}

export async function registerForPushNotificationsAsync(userId) {
  if (Platform.OS === "web") {
    console.log("Push notifications are not fully supported on the web without VAPID configuration.");
    return null;
  }

  // We must skip push registration when running inside Expo Go to prevent crashes.
  if (!Notifications || Constants.appOwnership === "expo") {
    console.log("Push notifications are not supported in Expo Go. Use a custom dev client.");
    return null;
  }

  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }
    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId: "your-project-id" })).data;
      console.log("Expo Push Token:", token);
    } catch (e) {
      console.log("Error getting push token:", e?.message || e);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

  if (token && userId) {
    try {
      const { error } = await supabase.from("profiles").update({ expo_push_token: token }).eq("id", userId);
      if (error) {
        console.error("Error saving push token to profile", error);
      }
    } catch (e) {
      console.error("Exception saving push token", e);
    }
  }

  return token;
}
