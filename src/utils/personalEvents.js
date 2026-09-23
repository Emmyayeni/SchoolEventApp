import { eventTimeStatus, eventStartTime } from "./eventTime";

export function personalEventGroups(events, { isStaff = false, registeredEventIds = [], bookmarkedEventIds = [], now = Date.now() } = {}) {
  const registered = new Set(registeredEventIds);
  const saved = new Set(bookmarkedEventIds);
  const groups = { Published: [], Drafts: [], Registered: [], Saved: [], Past: [] };
  for (const source of events) {
    const event = { ...source, timeStatus: eventTimeStatus(source, now) };
    const closed = event.timeStatus === "past" || ["cancelled", "archived"].includes(event.status);
    if (isStaff) {
      if (event.status === "draft") groups.Drafts.push(event);
      else if (closed) groups.Past.push(event);
      else if (event.status === "published") groups.Published.push(event);
    } else {
      if (saved.has(event.id)) groups.Saved.push(event);
      if (closed && (registered.has(event.id) || saved.has(event.id))) groups.Past.push(event);
      else if (!closed && registered.has(event.id)) groups.Registered.push(event);
    }
  }
  for (const [tab, items] of Object.entries(groups)) {
    items.sort((a, b) => (tab === "Past" ? -1 : 1) * ((eventStartTime(a)?.getTime() || 0) - (eventStartTime(b)?.getTime() || 0)));
  }
  return groups;
}
