import { campusDateKey, eventStartTime, eventTimeStatus } from "./eventTime";

export function homeEventSelection(events, filter = "All", now = Date.now()) {
  const today = campusDateKey(now);
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  const weekEnd = campusDateKey(now, (7 - weekday) % 7);
  return events.filter(event => {
    if (event.status && event.status !== "published") return false;
    if (eventTimeStatus(event, now) === "past") return false;
    if (filter === "Today") return event.date === today;
    if (filter === "This week") return event.date >= today && event.date <= weekEnd;
    return true;
  }).sort((a, b) => (eventStartTime(a)?.getTime() ?? Infinity) - (eventStartTime(b)?.getTime() ?? Infinity));
}

export function registrationPresentation(event, { isRegistered, isWaitlisted, registering, now = Date.now() } = {}) {
  const status = event.status && event.status !== "published" ? event.status : eventTimeStatus(event, now);
  const closed = { cancelled: "Event cancelled", draft: "Not published", archived: "Event archived", past: "Event ended", unknown: "Schedule to be confirmed" };
  if (closed[status]) return { label: closed[status], disabled: true, status };
  if (registering) return { label: "Registering…", disabled: true, status };
  if (isRegistered) return { label: "Registration details", disabled: false, status };
  if (isWaitlisted) return { label: "On the waitlist", disabled: true, status };
  const full = event.registeredCount != null && Number(event.capacity) > 0 && Number(event.registeredCount) >= Number(event.capacity);
  return { label: full ? "Join waitlist" : "Register for event", disabled: false, status };
}
