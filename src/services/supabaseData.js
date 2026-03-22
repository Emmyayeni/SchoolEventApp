import { supabase } from "../../lib/superbase";
import { resolveStoragePublicUrl, STORAGE_BUCKETS } from "./storage";

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80";

function to12HourTime(timeValue) {
  if (!timeValue) {
    return "";
  }

  const raw = String(timeValue).trim();
  if (!raw) {
    return "";
  }

  if (/am|pm/i.test(raw)) {
    return raw.toUpperCase();
  }

  const base = raw.length >= 5 ? raw.slice(0, 5) : raw;
  const [hStr, mStr = "00"] = base.split(":");
  const hour24 = Number(hStr);
  const minute = Number(mStr);

  if (Number.isNaN(hour24) || Number.isNaN(minute)) {
    return raw;
  }

  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function parseDateForDb(dateValue) {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function parseTimeForDb(timeValue) {
  if (!timeValue) {
    return null;
  }

  const raw = String(timeValue).trim();
  if (!raw) {
    return null;
  }

  const already24 = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (already24) {
    const hh = String(Number(already24[1])).padStart(2, "0");
    const mm = already24[2];
    return `${hh}:${mm}:00`;
  }

  const twelveHour = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelveHour) {
    let hour = Number(twelveHour[1]);
    const minute = twelveHour[2];
    const period = twelveHour[3].toUpperCase();

    if (period === "PM" && hour < 12) {
      hour += 12;
    }
    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    return `${String(hour).padStart(2, "0")}:${minute}:00`;
  }

  return null;
}

function normalizeAudience(value) {
  if (!value) {
    return "all";
  }

  const lower = String(value).trim().toLowerCase();
  if (lower.includes("staff")) {
    return "staff";
  }
  if (lower.includes("student")) {
    return "students";
  }
  return "all";
}

function normalizeAudienceList(list = []) {
  if (!Array.isArray(list) || list.length === 0) {
    return ["all"];
  }

  const mapped = list.map((item) => normalizeAudience(item));
  const unique = [...new Set(mapped)];
  return unique.length > 0 ? unique : ["all"];
}

export function mapEventRowToApp(row) {
  const imageValue = row.image_url || DEFAULT_EVENT_IMAGE;

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    date: row.event_date,
    time: to12HourTime(row.start_time),
    venue: row.venue,
    organizer: row.organizer,
    image: resolveStoragePublicUrl(imageValue, STORAGE_BUCKETS.eventImages, DEFAULT_EVENT_IMAGE),
    isFeatured: !!row.is_featured,
    status: row.status,
    createdBy: row.created_by,
    targetAudience: row.target_audience,
    capacity: row.capacity,
  };
}

function relativeTimeFromDate(dateValue) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "just now";
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return parsed.toLocaleDateString();
}

export function mapNotificationRowToApp(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    isRead: !!row.is_read,
    eventId: row.event_id,
    announcementId: row.announcement_id,
    type: row.type,
    time: relativeTimeFromDate(row.created_at),
    createdAt: row.created_at,
  };
}

export async function fetchEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("is_featured", { ascending: false })
    .order("event_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(mapEventRowToApp);
}

export async function fetchEventRegistrations(userId) {
  const { data, error } = await supabase
    .from("event_registrations")
    .select("event_id, status")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function registerForEvent({ eventId, userId }) {
  const { data, error } = await supabase
    .from("event_registrations")
    .upsert(
      {
        event_id: eventId,
        user_id: userId,
        status: "registered",
      },
      { onConflict: "event_id,user_id" }
    )
    .select("event_id, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchEventBookmarks(userId) {
  const { data, error } = await supabase
    .from("event_bookmarks")
    .select("event_id")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data || []).map((item) => item.event_id);
}

export async function toggleEventBookmark({ eventId, userId, isBookmarked }) {
  if (isBookmarked) {
    const { error } = await supabase
      .from("event_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("event_id", eventId);

    if (error) {
      throw error;
    }

    return false;
  }

  const { error } = await supabase.from("event_bookmarks").insert({
    user_id: userId,
    event_id: eventId,
  });

  if (error) {
    throw error;
  }

  return true;
}

export async function fetchNotifications(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(mapNotificationRowToApp);
}

export async function markNotificationAsRead({ notificationId, userId }) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsAsRead(userId) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw error;
  }
}

export async function createEventFromForm({ form, userId }) {
  const payload = {
    title: form.title?.trim() || "Untitled Event",
    category: form.category?.trim() || "Workshop",
    description: form.description?.trim() || "",
    event_date: parseDateForDb(form.date) || new Date().toISOString().slice(0, 10),
    start_time: parseTimeForDb(form.time),
    venue: form.venue?.trim() || "TBA",
    organizer: form.organizer?.trim() || "NSUK",
    image_url: form.image?.trim() || DEFAULT_EVENT_IMAGE,
    is_featured: false,
    target_audience: normalizeAudience(form.targetAudience),
    capacity: Number.isFinite(Number(form.capacity)) && Number(form.capacity) > 0 ? Number(form.capacity) : null,
    status: "published",
    created_by: userId,
  };

  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapEventRowToApp(data);
}

export async function createAnnouncement({ userId, subject, message, targetAudience }) {
  const { error } = await supabase.from("announcements").insert({
    sender_id: userId,
    subject: subject.trim(),
    message: message.trim(),
    target_audience: normalizeAudienceList(targetAudience),
  });

  if (error) {
    throw error;
  }
}
