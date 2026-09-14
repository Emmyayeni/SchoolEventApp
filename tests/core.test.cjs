const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function loadModule(file, globals = {}) {
  let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const names = [...source.matchAll(/export (?:async )?function (\w+)|export const (\w+)/g)].map(m => m[1] || m[2]);
  source = source.replace(/^import[\s\S]*?from [^\n]+\n/gm, '').replace(/export /g, '');
  source = source.replace(/default \{[\s\S]*$/, '');
  const context = vm.createContext({ console: { log() {} }, setTimeout, clearTimeout, URLSearchParams, ...globals });
  vm.runInContext(`${source}\nthis.result = { ${names.join(',')} };`, context);
  return context.result;
}

const validation = loadModule('src/utils/validation.js');
const eventTime = loadModule('src/utils/eventTime.js');
test('campus time is converted to UTC without using the device timezone', () => {
  assert.equal(eventTime.eventStartTime({ date: '2026-10-12', time: '2:30 PM' }).toISOString(), '2026-10-12T13:30:00.000Z');
  assert.equal(eventTime.eventStartTime({ date: '2026-10-12', time: '12:00 AM' }).toISOString(), '2026-10-11T23:00:00.000Z');
  assert.equal(eventTime.eventStartTime({ date: '2026-10-12', time: '25:30' }), null);
});
test('calendar uses the real start time and escapes event details', () => {
  const url = new URL(eventTime.eventCalendarUrl({ date: '2026-10-12', time: '2:30 PM', title: 'Science & Arts', venue: 'Main Hall' }));
  assert.equal(url.searchParams.get('dates'), '20261012T133000Z/20261012T143000Z');
  assert.equal(url.searchParams.get('text'), 'Science & Arts');
  assert.equal(url.searchParams.get('ctz'), 'Africa/Lagos');
});

test('campus date filters roll over at Nigeria midnight, including year boundaries', () => {
  assert.equal(eventTime.campusDateKey(Date.parse('2026-12-31T22:59:59Z')), '2026-12-31');
  assert.equal(eventTime.campusDateKey(Date.parse('2026-12-31T23:00:00Z')), '2027-01-01');
  assert.equal(eventTime.campusDateKey(Date.parse('2026-12-31T22:59:59Z'), 1), '2027-01-01');
});

test('invalid event dates and seconds cannot silently become valid calendar dates', () => {
  for (const date of ['2026-02-30', '2026-13-01', 'bad', '2026-1-01']) {
    assert.equal(eventTime.eventStartTime({ date, time: '12:00 PM' }), null);
    assert.equal(eventTime.eventDateForPicker(date), null);
  }
  assert.equal(eventTime.eventStartTime({ date: '2026-10-12', time: '12:00:99' }), null);
  assert.equal(eventTime.eventStartTime({ date: '2028-02-29', time: '12:00:30' }).toISOString(), '2028-02-29T11:00:30.000Z');
});

test('event statuses use the start time and two-hour duration rather than date midnight', () => {
  const event = { date: '2026-10-12', time: '2:30 PM' };
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-12T13:29:59Z')), 'upcoming');
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-12T13:30:00Z')), 'ongoing');
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-12T15:29:59Z')), 'ongoing');
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-12T15:30:00Z')), 'past');
  assert.equal(eventTime.eventTimeStatus({ date: 'bad' }), 'unknown');
  assert.equal(eventTime.eventTimeStatus({ date: '2026-10-12', time: 'bad' }), 'unknown');
});

test('date-only events last for the campus day', () => {
  const event = { date: '2026-10-12' };
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-11T22:59:59Z')), 'upcoming');
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-11T23:00:00Z')), 'ongoing');
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-12T23:00:00Z')), 'past');
});

test('date labels and picker values preserve the selected day across device timezones', () => {
  const originalTimezone = process.env.TZ;
  try {
    for (const zone of ['America/Los_Angeles', 'Africa/Lagos', 'Pacific/Auckland']) {
      process.env.TZ = zone;
      assert.equal(eventTime.formatEventDate('2026-10-12'), 'Oct 12, 2026', zone);
      const pickerDate = eventTime.eventDateForPicker('2026-10-12');
      assert.equal(pickerDate.getFullYear(), 2026, zone);
      assert.equal(pickerDate.getMonth(), 9, zone);
      assert.equal(pickerDate.getDate(), 12, zone);
      const event = { date: '2026-11-01', time: '9:30 AM' };
      assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-11-01T10:30:00Z')), 'past', zone);
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});
test('login rejects malformed addresses and empty passwords', () => {
  assert.ok(validation.validateLogin({ email: 'bad', password: '' }).email);
  assert.ok(validation.validateLogin({ email: 'a@b.co', password: '' }).password);
  assert.equal(validation.normalizeEmail(' User@NSUK.edu.ng '), 'user@nsuk.edu.ng');
});
test('signup validates confirmation, account type and student information', () => {
  const errors = validation.validateSignup({ accountType: 'admin', password: 'password', confirmPassword: 'different' });
  assert.ok(errors.general);
  assert.ok(errors.confirmPassword);
  const student = validation.validateSignup({ accountType: 'student' });
  assert.ok(student.matricNumber);
  assert.ok(student.faculty);
});
test('events reject impossible dates, times and fractional capacity', () => {
  const base = { title: 'Career fair', category: 'Workshop', description: 'Meet employers', venue: 'Main hall', organizer: 'NSUK', date: '2026-10-12', time: '2:30 PM', capacity: '100' };
  assert.equal(Object.keys(validation.validateEvent(base)).length, 0);
  assert.ok(validation.validateEvent({ ...base, date: '2026-02-30' }).date);
  assert.ok(validation.validateEvent({ ...base, time: '25:00' }).time);
  assert.ok(validation.validateEvent({ ...base, capacity: '2.5' }).capacity);
});

function authFixture({ status = 'approved', role = null, session = true, profileError = null } = {}) {
  const writes = [];
  const calls = {};
  const authUser = { id: 'user-1', email: 'user@nsuk.edu.ng', user_metadata: { accountType: 'student' } };
  let row = { id: authUser.id, account_type: 'student', account_status: status, full_name: 'Test User' };
  const auth = {
    async signInWithPassword(input) { calls.login = input; return { data: { user: authUser, session: {} } }; },
    async signUp(input) { calls.signup = input; return { data: { user: authUser, session: session ? {} : null } }; },
    async signOut() { calls.signouts = (calls.signouts || 0) + 1; return {}; },
    async getUser() { return { data: { user: authUser } }; },
    async updateUser() { return {}; },
    onAuthStateChange(handler) { calls.handler = handler; return { data: { subscription: { unsubscribe() {} } } }; },
  };
  const supabase = { auth, from(table) {
    const query = {
      select() { return query; }, eq() { return query; },
      async maybeSingle() { return table === 'admin_users' ? { data: role ? { role } : null } : { data: row, error: profileError }; },
      async upsert(payload) { writes.push(payload); row = { ...row, ...payload }; return {}; },
      update(payload) { writes.push(payload); row = { ...row, ...payload }; return { async eq() { return {}; } }; },
    };
    return query;
  } };
  const api = loadModule('lib/Auth.js', { supabase, STORAGE_BUCKETS: { avatars: 'avatars' }, resolveStoragePublicUrl: (v, b, fallback) => v || fallback });
  return { api, calls, writes };
}
test('login forwards credentials and returns an app user separate from session', async () => {
  const { api, calls } = authFixture();
  const result = await api.signInWithEmailPassword({ email: 'user@nsuk.edu.ng', password: 'secret' });
  assert.equal(calls.login.password, 'secret');
  assert.equal(result.appUser.id, 'user-1');
  assert.ok(result.session);
});
for (const status of ['pending', 'disabled']) {
  test(`${status} accounts cannot sign in or restore a session`, async () => {
    const { api, calls } = authFixture({ status });
    await assert.rejects(api.signInWithEmailPassword({ email: 'a@b.co', password: 'secret' }));
    assert.equal(await api.getCurrentAppUser(), null);
    assert.equal(calls.signouts, 2);
  });
}
test('confirmation-required signup does not pretend to authenticate or write a profile', async () => {
  const { api, writes } = authFixture({ session: false });
  const result = await api.signUpWithEmailPassword({ email: 'a@b.co', password: 'password', profile: { accountType: 'student' } });
  assert.equal(result.requiresEmailConfirmation, true);
  assert.equal(result.session, null);
  assert.equal(writes.length, 0);
});
test('organizer signup ends its temporary session until admin approval', async () => {
  const { api, calls } = authFixture();
  const result = await api.signUpWithEmailPassword({ email: 'a@b.co', password: 'password', profile: { accountType: 'organizer' } });
  assert.equal(result.requiresApproval, true);
  assert.equal(result.session, null);
  assert.equal(calls.signouts, 1);
});
test('editing profile preserves approval and admin privileges', async () => {
  const { api, writes } = authFixture({ role: 'superadmin' });
  const user = await api.updateCurrentUserProfile({ fullName: 'Changed name', accountType: 'staff' });
  assert.equal(writes[0].account_status, undefined);
  assert.equal(writes[0].account_type, undefined);
  assert.equal(user.role, 'superadmin');
});
test('profile read errors are not treated as missing profiles', async () => {
  const { api, writes } = authFixture({ profileError: new Error('offline') });
  await assert.rejects(api.signInWithEmailPassword({ email: 'a@b.co', password: 'password' }), /offline/);
  assert.equal(writes.length, 0);
});
test('auth listener releases its callback immediately and ignores stale sign-in after sign-out', async () => {
  const { api, calls } = authFixture();
  const events = [];
  const subscription = api.onAuthStateChange((event) => events.push(event));
  assert.equal(calls.handler('SIGNED_IN', { user: { id: 'user-1' } }), undefined);
  calls.handler('SIGNED_OUT', null);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.deepEqual(events, ['SIGNED_OUT']);
  subscription.data.subscription.unsubscribe();
});

test('reminders deduplicate, follow changed event times, and clear at logout', async () => {
  const scheduled = new Map();
  let writes = 0;
  const native = {
    setNotificationHandler() {},
    SchedulableTriggerInputTypes: { DATE: 'date' },
    async getAllScheduledNotificationsAsync() { return [...scheduled.values()]; },
    async scheduleNotificationAsync(request) { writes++; scheduled.set(request.identifier, request); return request.identifier; },
    async cancelScheduledNotificationAsync(id) { scheduled.delete(id); },
  };
  const api = loadModule('src/services/notifications.js', {
    Constants: { appOwnership: 'standalone' }, Device: { isDevice: true }, Platform: { OS: 'android' },
    supabase: {}, eventStartTime: eventTime.eventStartTime, require: () => native,
  });
  const event = { id: 'event-1', title: 'Workshop', venue: 'Main hall', date: '2099-01-01', time: '12:00 PM', status: 'published' };
  const input = { userId: 'user-1', events: [event], registeredEventIds: ['event-1'] };
  await api.syncEventReminders(input);
  assert.equal(scheduled.size, 1);
  await api.syncEventReminders(input);
  assert.equal(writes, 1);
  await api.syncEventReminders({ ...input, events: [{ ...event, time: '2:00 PM' }] });
  assert.equal(writes, 2);
  assert.equal(scheduled.size, 1);
  await api.syncEventReminders({ userId: null });
  assert.equal(scheduled.size, 0);
});
