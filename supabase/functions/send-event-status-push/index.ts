import { createClient } from "npm:@supabase/supabase-js@2";

type Delivery = { notification_id: string; user_id: string; event_id: string; title: string; message: string; expo_push_token: string; attempts: number };
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const secret = Deno.env.get("EVENT_WEBHOOK_SECRET");
  if (!secret) return new Response("Webhook secret is not configured", { status: 503 });
  if (req.headers.get("x-webhook-secret") !== secret) return new Response("Unauthorized", { status: 401 });
  try {
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error: queueError } = await db.rpc("queue_event_status_notifications");
    if (queueError) throw queueError;
    const { data, error } = await db.rpc("claim_event_status_pushes");
    if (error) throw error;
    const deliveries: Delivery[] = data || [];
    if (!deliveries.length) return Response.json({ accepted: 0, pending: 0 });
    const accessToken = Deno.env.get("EXPO_ACCESS_TOKEN");
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST", headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
      body: JSON.stringify(deliveries.map(item => ({ to: item.expo_push_token, title: item.title, body: item.message,
        sound: "default", priority: "high", channelId: "event-reminders", data: { eventId: item.event_id, notificationId: item.notification_id, type: "event-status" } }))),
    });
    const result = await response.json();
    let accepted = 0;
    for (const [index, item] of deliveries.entries()) {
      const ticket = response.ok ? result.data?.[index] : null;
      const sent = ticket?.status === "ok";
      const { error: saveError } = await db.from("event_status_push_queue").update(sent
        ? { sent_at: new Date().toISOString(), ticket_id: ticket.id, last_error: null }
        : { last_error: ticket?.details?.error || ticket?.message || `Expo HTTP ${response.status}` }
      ).eq("notification_id", item.notification_id);
      if (saveError) throw saveError;
      if (sent) accepted++;
    }
    return Response.json({ accepted, pending: deliveries.length-accepted });
  } catch (error) {
    console.error("Event status push failed:", error instanceof Error ? error.message : "Unknown error");
    return new Response("Could not dispatch event status notifications", { status: 500 });
  }
});
