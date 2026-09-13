const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function loadModule(file, globals = {}) {
  let source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const names = [...source.matchAll(/export (?:async )?function (\w+)|export const (\w+)/g)].map(m => m[1] || m[2]);
  source = source.replace(/^import[\s\S]*?from [^\n]+\n/gm, '').replace(/export /g, '');
  const context = vm.createContext({ console: { log() {} }, setTimeout, clearTimeout, ...globals });
  vm.runInContext(`${source}\nthis.result = { ${names.join(',')} };`, context);
  return context.result;
}

const validation = loadModule('src/utils/validation.js');
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
