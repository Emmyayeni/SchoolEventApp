// Campus schedules use Nigeria time, independent of the viewer's device timezone.
export function eventStartTime(event) {
  const match = String(event?.time || '').trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!event?.date || !match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toUpperCase();
  if (minute > 59 || (period ? hour < 1 || hour > 12 : hour > 23)) return null;
  if (period) hour = (hour % 12) + (period === 'PM' ? 12 : 0);
  const date = new Date(`${event.date}T${String(hour).padStart(2, '0')}:${match[2]}:00+01:00`);
  return Number.isNaN(date.getTime()) ? null : date;
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
