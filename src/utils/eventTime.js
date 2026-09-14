const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// Campus schedules use Nigeria time, independent of the viewer's device timezone.
export function campusDateKey(now = Date.now(), dayOffset = 0) {
  return new Date(Number(now) + HOUR_MS + dayOffset * DAY_MS).toISOString().slice(0, 10);
}

export function parseEventDate(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateText || ''))) return null;
  const date = new Date(`${dateText}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateText ? date : null;
}

export function formatEventDate(dateText, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  const date = parseEventDate(dateText);
  return date ? date.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' }) : (dateText || '');
}

// A native picker displays local calendar fields, rather than an instant in UTC.
export function eventDateForPicker(dateText) {
  const date = parseEventDate(dateText);
  if (!date) return null;
  const localDate = new Date(date);
  localDate.setFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  localDate.setHours(12, 0, 0, 0);
  return localDate;
}

export function eventStartTime(event) {
  const match = String(event?.time || '').trim().match(/^(\d{1,2}):(\d{2})(?::([0-5]\d))?\s*(AM|PM)?$/i);
  if (!parseEventDate(event?.date) || !match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[4]?.toUpperCase();
  if (minute > 59 || (period ? hour < 1 || hour > 12 : hour > 23)) return null;
  if (period) hour = (hour % 12) + (period === 'PM' ? 12 : 0);
  const date = new Date(`${event.date}T${String(hour).padStart(2, '0')}:${match[2]}:${match[3] || '00'}+01:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function eventTimeStatus(event, now = Date.now()) {
  const hasTime = !!String(event?.time || '').trim();
  const start = eventStartTime(hasTime ? event : { ...event, time: '00:00' });
  if (!start) return 'unknown';
  // The schema has no end time. Preserve the UI's two-hour status window.
  const end = start.getTime() + (hasTime ? 2 * HOUR_MS : DAY_MS);
  if (Number(now) < start.getTime()) return 'upcoming';
  return Number(now) >= end ? 'past' : 'ongoing';
}

export function eventCalendarUrl(event) {
  const start = eventStartTime(event);
  const params = new URLSearchParams({ action: 'TEMPLATE', text: event.title || 'NSUK Event', details: event.description || '', location: event.venue || 'NSUK Campus', ctz: 'Africa/Lagos' });
  if (start) {
    const format = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    params.set('dates', `${format(start)}/${format(new Date(start.getTime() + 60 * 60 * 1000))}`);
  }
  return `https://calendar.google.com/calendar/render?${params}`;
}
