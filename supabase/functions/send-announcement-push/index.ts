// Supabase Edge Function: send-announcement-push
//
// Triggered by a Database Webhook on INSERT into public.announcements.
// For every user in the announcement's target audience it:
//   1. inserts an in-app notification row (the "Alerts" feed reads from `notifications`)
//   2. sends an Expo push notification to their registered device(s)
//
// Deploy:
//   supabase functions deploy send-announcement-push --no-verify-jwt
//
// Secrets (supabase secrets set KEY=value):
//   ANNOUNCEMENT_WEBHOOK_SECRET  required shared secret; the webhook must
//                                send it as the `x-webhook-secret` header
//   EXPO_ACCESS_TOKEN            only needed if you enabled "Enhanced Security for
//                                Push Notifications" in your Expo account
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
//
// See README.md in this folder for the full setup + webhook wiring steps.

import { createClient } from "npm:@supabase/supabase-js@2";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const EXPO_BATCH_SIZE = 100; // Expo accepts at most 100 messages per request

type AnnouncementRecord = {
  id: string;
  sender_id: string | null;
  subject: string;
  message: string;
  target_audience: string[] | null;
};

type ProfileRow = {
  id: string;
  expo_push_token: string | null;
  account_type: string | null;
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Required shared-secret gate. Configure the same value as a custom header
  // (x-webhook-secret) on the Database Webhook to reject spoofed calls.
  const requiredSecret = Deno.env.get("ANNOUNCEMENT_WEBHOOK_SECRET");
  if (!requiredSecret)
    return new Response("Webhook secret is not configured", { status: 503 });
  if (req.headers.get("x-webhook-secret") !== requiredSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: { type?: string; record?: AnnouncementRecord };
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const record = payload?.record;
  if (!record?.id || !record?.subject) {
    return new Response("No announcement record in payload", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Resolve target audience -> recipient profiles.
  //    target_audience is stored normalized as any of: "all" | "staff" | "students".
  const audience =
    Array.isArray(record.target_audience) && record.target_audience.length
      ? record.target_audience
      : ["all"];

  let query = supabase
    .from("profiles")
    .select("id, expo_push_token, account_type")
    .eq("account_status", "approved");

  if (!audience.includes("all")) {
    const types: string[] = [];
    if (audience.includes("staff")) types.push("staff", "organizer", "admin");
    if (audience.includes("students")) types.push("student");
    if (types.length) query = query.in("account_type", types);
  }

  const { data: profiles, error: profilesError } = await query;
  if (profilesError) {
    console.error("Failed to load recipient profiles:", profilesError.message);
    return new Response("Failed to load recipients", { status: 500 });
  }

  // Don't notify the sender about their own announcement.
  let recipients = (profiles ?? []).filter(
    (p: ProfileRow) => p.id !== record.sender_id,
  );

  // 2. Fan out in-app notification rows so the announcement shows in each user's feed.
  if (recipients.length) {
    const rows = recipients.map((p: ProfileRow) => ({
      user_id: p.id,
      title: record.subject,
      message: record.message,
      announcement_id: record.id,
      type: "announcement",
      is_read: false,
      source_key: `announcement:${record.id}:${p.id}`,
    }));
    const { data: inserted, error: insertError } = await supabase
      .from("notifications")
      .upsert(rows, { onConflict: "source_key", ignoreDuplicates: true })
      .select("user_id");
    if (insertError) {
      console.error(
        "Failed to insert in-app notifications:",
        insertError.message,
      );
      return new Response("Failed to save notifications", { status: 500 });
    }
    const newRecipients = new Set<string>(
      (inserted || []).map((row: { user_id: string }) => row.user_id),
    );
    recipients = recipients.filter((profile: ProfileRow) =>
      newRecipients.has(profile.id),
    );
  }

  // 3. Build + send Expo push messages (skip users with no / invalid token).
  const messages = recipients
    .filter(
      (p: ProfileRow) =>
        typeof p.expo_push_token === "string" &&
        p.expo_push_token.startsWith("Expo"),
    )
    .map((p: ProfileRow) => ({
      to: p.expo_push_token,
      sound: "default",
      title: record.subject,
      body: record.message,
      channelId: "default",
      data: { announcementId: record.id, type: "announcement" },
    }));

  const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
  let pushed = 0;
  const errors: unknown[] = [];

  for (let i = 0; i < messages.length; i += EXPO_BATCH_SIZE) {
    const chunk = messages.slice(i, i + EXPO_BATCH_SIZE);
    try {
      const res = await fetch(EXPO_PUSH_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(expoAccessToken
            ? { Authorization: `Bearer ${expoAccessToken}` }
            : {}),
        },
        body: JSON.stringify(chunk),
      });
      const body = await res.json().catch(() => null);
      if (res.ok) {
        for (const ticket of body?.data || []) {
          if (ticket.status === "ok") pushed += 1;
          else errors.push(ticket);
        }
      } else {
        errors.push(body ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      errors.push(String(err));
    }
  }

  return new Response(
    JSON.stringify({ ok: true, recipients: recipients.length, pushed, errors }),
    { headers: { "Content-Type": "application/json" } },
  );
});
