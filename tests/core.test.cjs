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

function dataFixture({ tables = {}, rpc = async () => ({ data: [] }), queryError = null } = {}) {
  const calls = [];
  const supabase = { rpc, from(table) {
    const filters = [];
    let payload;
    const result = () => ({ data: payload ? { id: 'created', ...payload } : (tables[table] || []).filter(row => filters.every(([key, value]) => row[key] === value)), error: queryError });
    const query = {
      select() { return query; }, order() { return query; },
      eq(key, value) { filters.push([key, value]); return query; },
      insert(value) { payload = value; calls.push({ table, value }); return query; },
      update(value) { payload = value; calls.push({ table, value }); return query; },
      async single() { return result(); },
      then(resolve, reject) { return Promise.resolve(result()).then(resolve, reject); },
    };
    return query;
  } };
  const globals = { supabase, STORAGE_BUCKETS: {}, resolveStoragePublicUrl: value => value || '' };
  return { calls, data: loadModule('src/services/supabaseData.js', globals), catalogs: loadModule('src/services/academicData.js', globals) };
}

test('events use database registration totals and do not invent images or publication dates', async () => {
  const { data } = dataFixture({ tables: { events: [{ id: 'event-1', title: 'Database event', created_at: '2026-09-14T00:00:00Z' }] },
    rpc: async () => ({ data: [{ event_id: 'event-1', registered_count: '42' }] }) });
  const events = await data.fetchEvents();
  assert.equal(events[0].registeredCount, 42);
  assert.equal(events[0].image, '');
  assert.equal(events[0].createdAt, '2026-09-14T00:00:00Z');
});

test('registration totals are batched and missing totals are not reported as zero', async () => {
  const batches = [];
  const { data } = dataFixture({ rpc: async (_, input) => {
    batches.push(input.p_event_ids);
    return { data: input.p_event_ids.map(id => ({ event_id: id, registered_count: id === 'event-0' ? null : '0' })) };
  } });
  const ids = Array.from({ length: 401 }, (_, i) => `event-${i}`);
  const counts = await data.fetchEventRegistrationCounts([...ids, ids[0]]);
  assert.deepEqual(batches.map(batch => batch.length), [200, 200, 1]);
  assert.equal(counts.has('event-0'), false);
  assert.equal(counts.get('event-1'), 0);
  assert.equal(counts.size, 400);
});

test('database errors are surfaced instead of presenting invented catalog choices', async () => {
  const { catalogs, data } = dataFixture({ queryError: new Error('offline'), rpc: async () => ({ error: new Error('missing migration') }) });
  await assert.rejects(catalogs.fetchAcademicFaculties(), /offline/);
  await assert.rejects(catalogs.fetchEventCategories(), /offline/);
  await assert.rejects(data.fetchEventRegistrationCounts(['event-1']), /missing migration/);
});

test('academic selectors load actual rows and restrict departments to the chosen faculty', async () => {
  const { catalogs } = dataFixture({ tables: {
    academic_faculties: [{ name: 'Faculty A' }],
    academic_departments: [{ name: 'Department A', faculty_name: 'Faculty A' }, { name: 'Department B', faculty_name: 'Faculty B' }],
    academic_levels: [{ name: 'Configured level' }],
  } });
  assert.equal((await catalogs.fetchAcademicFaculties()).join(), 'Faculty A');
  assert.equal((await catalogs.fetchAcademicDepartments('Faculty A')).join(), 'Department A');
  assert.equal((await catalogs.fetchAcademicDepartments('Missing')).length, 0);
  assert.equal((await catalogs.fetchAcademicDepartments()).length, 0);
  assert.equal((await catalogs.fetchAcademicLevels()).join(), 'Configured level');
});

test('draft and cancellation selections persist in the event database payload', async () => {
  const { data, calls } = dataFixture();
  const form = { title: 'Test', date: '2026-12-01', time: '12:00 PM', endTime: '2:00 PM', status: 'draft', targetAudience: 'students', capacity: '10' };
  await data.createEventFromForm({ form, userId: 'organizer' });
  assert.equal(calls[0].value.status, 'draft');
  assert.equal(calls[0].value.target_audience, 'students');
  assert.equal(calls[0].value.capacity, 10);
  assert.equal(calls[0].value.end_time, '14:00:00');
  assert.equal(calls[0].value.image_url, '');
  await data.updateEventFromForm({ eventId: 'event-1', userId: 'organizer', form: { ...form, status: 'cancelled' } });
  assert.equal(calls[1].value.status, 'cancelled');
});

test('legacy template photos are ignored while real uploaded photos remain available', () => {
  const storage = loadModule('src/services/storage.js', { supabase: {} });
  const template = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80';
  assert.equal(storage.resolveStoragePublicUrl(template, 'avatars'), '');
  assert.equal(storage.resolveStoragePublicUrl('https://example.test/uploaded-photo.jpg', 'avatars'), 'https://example.test/uploaded-photo.jpg');
});
test('campus time is converted to UTC without using the device timezone', () => {
  assert.equal(eventTime.eventStartTime({ date: '2026-10-12', time: '2:30 PM' }).toISOString(), '2026-10-12T13:30:00.000Z');
  assert.equal(eventTime.eventStartTime({ date: '2026-10-12', time: '12:00 AM' }).toISOString(), '2026-10-11T23:00:00.000Z');
  assert.equal(eventTime.eventStartTime({ date: '2026-10-12', time: '25:30' }), null);
});
test('calendar uses the stored start and end times and escapes event details', () => {
  const event = { date: '2026-10-12', time: '2:30 PM', endTime: '5:00 PM', title: 'Science & Arts', venue: 'Main Hall' };
  const url = new URL(eventTime.eventCalendarUrl(event));
  assert.equal(url.searchParams.get('dates'), '20261012T133000Z/20261012T160000Z');
  assert.equal(eventTime.formatEventTimeRange(event), '2:30 PM – 5:00 PM');
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

test('event statuses use stored start and end times rather than an estimated duration', () => {
  const event = { date: '2026-10-12', time: '2:30 PM', endTime: '5:30 PM' };
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-12T13:29:59Z')), 'upcoming');
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-12T13:30:00Z')), 'ongoing');
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-12T16:29:59Z')), 'ongoing');
  assert.equal(eventTime.eventTimeStatus(event, Date.parse('2026-10-12T16:30:00Z')), 'past');
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
  const base = { title: 'Career fair', category: 'Workshop', description: 'Meet employers', venue: 'Main hall', organizer: 'NSUK', date: '2026-10-12', time: '2:30 PM', endTime: '4:30 PM', capacity: '100' };
  assert.equal(Object.keys(validation.validateEvent(base)).length, 0);
  assert.ok(validation.validateEvent({ ...base, date: '2026-02-30' }).date);
  assert.ok(validation.validateEvent({ ...base, time: '25:00' }).time);
  assert.ok(validation.validateEvent({ ...base, endTime: '' }).endTime);
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
  assert.equal([...scheduled.values()][0].content.title, "Workshop — Starts in 15 minutes");
  await api.syncEventReminders(input);
  assert.equal(writes, 1);
  await api.syncEventReminders({ ...input, events: [{ ...event, time: '2:00 PM' }] });
  assert.equal(writes, 2);
  assert.equal(scheduled.size, 1);
  await api.syncEventReminders({ userId: null });
  assert.equal(scheduled.size, 0);
});

const presentation = loadModule('src/utils/eventPresentation.js', eventTime);

test('home filters use the campus week, exclude unpublished and ended events, and preserve source order', () => {
  const now = Date.parse('2026-09-19T23:30:00Z'); // Sunday in Nigeria, Saturday in UTC.
  const events = [
    { id: 'next-week', date: '2026-09-21', time: '12:00', status: 'published' },
    { id: 'today', date: '2026-09-20', time: '12:00', status: 'published' },
    { id: 'draft', date: '2026-09-20', time: '12:00', status: 'draft' },
    { id: 'cancelled', date: '2026-09-20', time: '12:00', status: 'cancelled' },
    { id: 'ended', date: '2026-09-19', time: '12:00', status: 'published' },
  ];
  const ids = list => Array.from(list, event => event.id);
  assert.deepEqual(ids(presentation.homeEventSelection(events, 'Today', now)), ['today']);
  assert.deepEqual(ids(presentation.homeEventSelection(events, 'This week', now)), ['today']);
  assert.deepEqual(ids(presentation.homeEventSelection(events, 'All', now)), ['today', 'next-week']);
  assert.equal(events[0].id, 'next-week');
});

test('event actions keep closed events disabled and distinguish saved registrations, waitlists and in-flight requests', () => {
  const event = { date: '2026-09-21', time: '12:00', status: 'published', capacity: 2, registeredCount: 2 };
  const now = Date.parse('2026-09-20T12:00:00Z');
  const action = (record = event, state = {}) => presentation.registrationPresentation(record, { now, ...state });
  assert.equal(action().label, 'Join waitlist');
  assert.equal(action({ ...event, registeredCount: null }).label, 'Register for event');
  assert.equal(action(event, { isRegistered: true }).label, 'Registration details');
  assert.equal(action(event, { isWaitlisted: true }).disabled, true);
  assert.equal(action(event, { registering: true }).label, 'Registering…');
  for (const status of ['draft', 'cancelled', 'archived']) {
    assert.equal(action({ ...event, status }, { isRegistered: true }).disabled, true);
  }
  assert.equal(action({ ...event, date: '2026-09-19' }).label, 'Event ended');
});

test('push registration creates Android channels before permission and persists the Expo token', async () => {
  const calls = [];
  const native = {
    setNotificationHandler() {}, AndroidImportance: { MAX: 5, HIGH: 4 },
    async setNotificationChannelAsync(id) { calls.push(`channel:${id}`); },
    async getPermissionsAsync() { return { status: 'undetermined' }; },
    async requestPermissionsAsync() { calls.push('permission'); return { status: 'granted' }; },
    async getExpoPushTokenAsync(options) { assert.equal(options.projectId, 'project-1'); return { data: 'ExpoPushToken[test]' }; },
  };
  const api = loadModule('src/services/notifications.js', {
    console: { log() {}, warn() {}, error() {} }, process: { env: {} },
    Constants: { appOwnership: 'standalone', easConfig: { projectId: 'project-1' } },
    Device: { isDevice: true }, Platform: { OS: 'android' }, require: () => native,
    supabase: { from: () => ({ update: value => ({ eq: async (key, id) => { calls.push('save'); assert.equal(id, 'user-1'); assert.equal(value.expo_push_token, 'ExpoPushToken[test]'); return { error: null }; } }) }) },
  });
  assert.equal(await api.registerForPushNotificationsAsync('user-1'), 'ExpoPushToken[test]');
  assert.deepEqual(calls, ['channel:default', 'channel:event-reminders', 'permission', 'save']);
  calls.length = 0;
  assert.equal(await api.registerForPushNotificationsAsync('user-1', { requestPermission: false }), null);
  assert.deepEqual(calls, ['channel:default', 'channel:event-reminders']);
});

test('push registration does not report success when token persistence fails', async () => {
  const api = loadModule('src/services/notifications.js', {
    console: { log() {}, warn() {}, error() {} }, process: { env: {} },
    Constants: { appOwnership: 'standalone', easConfig: { projectId: 'project-1' } },
    Device: { isDevice: true }, Platform: { OS: 'ios' },
    require: () => ({ setNotificationHandler() {}, getPermissionsAsync: async () => ({ status: 'granted' }), getExpoPushTokenAsync: async () => ({ data: 'ExpoPushToken[test]' }) }),
    supabase: { from: () => ({ update: () => ({ eq: async () => ({ error: { message: 'offline' } }) }) }) },
  });
  assert.equal(await api.registerForPushNotificationsAsync('user-1'), null);
});
const personalEvents = loadModule('src/utils/personalEvents.js', eventTime);
test('personal history retains ended registrations and bookmarks with newest events first', () => {
  const events = [
    { id: 'old', date: '2026-09-20', time: '10:00', endTime: '11:00', status: 'published' },
    { id: 'saved', date: '2026-09-22', time: '10:00', endTime: '11:00', status: 'published' },
    { id: 'next', date: '2026-09-24', time: '10:00', endTime: '11:00', status: 'published' },
  ];
  const groups = personalEvents.personalEventGroups(events, { registeredEventIds: ['old', 'next'], bookmarkedEventIds: ['saved'], now: Date.parse('2026-09-23T12:00:00Z') });
  assert.deepEqual(Array.from(groups.Past, e => e.id), ['saved', 'old']);
  assert.deepEqual(Array.from(groups.Registered, e => e.id), ['next']);
  assert.equal(groups.Saved.length, 1);
});
test('organizer event moves into history exactly at its overnight end without deleting it', () => {
  const event = { id: 'overnight', date: '2026-09-22', time: '23:00', endTime: '01:00', status: 'published' };
  const options = { isStaff: true, now: Date.parse('2026-09-22T23:59:59Z') };
  assert.equal(personalEvents.personalEventGroups([event], options).Published.length, 1);
  options.now += 1000;
  const groups = personalEvents.personalEventGroups([event, { ...event, id: 'draft', status: 'draft' }], options);
  assert.equal(groups.Published.length, 0);
  assert.deepEqual(Array.from(groups.Past, e => e.id), ['overnight']);
  assert.equal(groups.Drafts.length, 1);
  assert.equal(event.status, 'published');
});
test('a database event with stored end time remains in registered history after ending', () => {
  const { data } = dataFixture();
  const event = data.mapEventRowToApp({ id: 'ended-event', title: 'Head phone testing', event_date: '2026-09-22', start_time: '11:00:00', end_time: '11:30:00', status: 'published' });
  const groups = personalEvents.personalEventGroups([event], { registeredEventIds: ['ended-event'], now: Date.parse('2026-09-23T12:00:00Z') });
  assert.equal(groups.Past[0].id, 'ended-event');
  assert.equal(groups.Registered.length, 0);
});

const refreshTools = loadModule('src/utils/coalescedRefresh.js');
test('realtime bursts use one request, queue one follow-up and stop after disposal', async () => {
  let calls = 0, finish;
  const request = refreshTools.coalescedRefresh(() => { calls++; return new Promise(resolve => { finish = resolve; }); }, 5);
  for (let i = 0; i < 50; i++) request();
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(calls, 1);
  for (let i = 0; i < 50; i++) request();
  assert.equal(calls, 1);
  finish();
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(calls, 2);
  request(); request.dispose(); finish();
  await new Promise(resolve => setTimeout(resolve, 20));
  request();
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(calls, 2);
});
