import { createClient } from "npm:@supabase/supabase-js@2";

type ProfileRow = {
  id: string;
  expo_push_token: string | null;
};

type NotificationRow = {
  user_id: string;
};

// Database webhook: INSERT and UPDATE on public.events. Never call from the client.
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const secret = Deno.env.get("EVENT_WEBHOOK_SECRET");
  if (!secret) return new Response("Webhook secret is not configured", { status: 503 });
  if (req.headers.get("x-webhook-secret") !== secret) return new Response("Unauthorized", { status: 401 });
  try {
    const payload = await req.json();
    const event = payload.record;
    const old = payload.old_record;
    if (!event?.id || !event?.title) return new Response("Missing event", { status: 400 });
    if (event.status !== "published" && !(event.status === "cancelled" && old?.status === "published")) {
      return Response.json({ skipped: true });
    }
    const fields = ["title", "description", "event_date", "start_time", "end_time", "venue", "status", "target_audience"];
    if (payload.type === "UPDATE" && old && !fields.some(field => old[field] !== event[field])) return Response.json({ skipped: true });
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let query = db.from("profiles").select("id,expo_push_token").eq("account_status", "approved");
    if (event.target_audience === "students") query = query.eq("account_type", "student");
    else if (event.target_audience === "staff") query = query.in("account_type", ["staff", "organizer", "admin"]);
    const { data: profiles, error } = await query;
    if (error) throw error;
    const recipients = (profiles || []).filter((profile: ProfileRow) => profile.id !== event.created_by);
    if (!recipients.length) return Response.json({ inboxCreated: 0, pushAccepted: 0 });
    const title = `${payload.type === "INSERT" || old?.status === "draft" ? "New event" : "Event update"}: ${event.title}`;
    const timeRange = event.start_time ? `${event.start_time}${event.end_time ? `–${event.end_time}` : ""}` : "Time TBA";
    const message = event.status === "cancelled" ? "This event has been cancelled." : `${event.event_date} · ${timeRange} · ${event.venue}`;
    const rows = recipients.map((profile: ProfileRow) => ({ user_id: profile.id, event_id: event.id, title, message, type: "event", source_key: `${event.id}:${event.updated_at || event.created_at}:${profile.id}` }));
    const { data: inserted, error: insertError } = await db.from("notifications").upsert(rows, { onConflict: "source_key", ignoreDuplicates: true }).select("user_id");
    if (insertError) throw insertError;
    const newRecipients = new Set((inserted || []).map((row: NotificationRow) => row.user_id));
    const messages = recipients.filter((profile: ProfileRow) => newRecipients.has(profile.id) && /^(ExponentPushToken|ExpoPushToken)\[/.test(profile.expo_push_token || "")).map((profile: ProfileRow) => ({ to: profile.expo_push_token, title, body: message, sound: "default", priority: "high", channelId: "default", data: { eventId: event.id, type: "event" } }));
    const errors: unknown[] = [];
    let accepted = 0;
    for (let i = 0; i < messages.length; i += 100) {
      const token = Deno.env.get("EXPO_ACCESS_TOKEN");
      const response = await fetch("https://exp.host/--/api/v2/push/send", { method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(messages.slice(i, i + 100)) });
      const result = await response.json();
      if (!response.ok) errors.push(result);
      else for (const ticket of result.data || []) {
        if (ticket.status === "ok") accepted += 1;
        else errors.push(ticket);
      }
    }
    return Response.json({ inboxCreated: inserted?.length || 0, pushAccepted: accepted, errors });
  } catch (error) {
    console.error("Event notification failed:", error instanceof Error ? error.message : "Unknown error");
    return new Response("Could not dispatch notifications", { status: 500 });
  }
});
