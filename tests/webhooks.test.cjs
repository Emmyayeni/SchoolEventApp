const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

function handlerFor(name, secrets = {}) {
  let handler;
  const source = fs.readFileSync(path.join(__dirname, `../supabase/functions/${name}/index.ts`), 'utf8');
  const compiled = babel.transformSync(source, { filename: 'index.ts', configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-typescript'] }).code.replace(/^import[^\n]+\n/gm, '');
  vm.runInNewContext(compiled, {
    Deno: { env: { get: key => secrets[key] }, serve: fn => { handler = fn; } },
    Response, Request, console,
    createClient() { throw new Error('Rejected requests must never access the database.'); },
  });
  return handler;
}

for (const [name, secretKey] of [['send-announcement-push', 'ANNOUNCEMENT_WEBHOOK_SECRET'], ['send-event-push', 'EVENT_WEBHOOK_SECRET'], ['send-event-status-push', 'EVENT_WEBHOOK_SECRET']]) {
  test(`${name}: rejects an unconfigured shared secret`, async () => {
    const response = await handlerFor(name)(new Request('https://test.invalid', { method: 'POST' }));
    assert.equal(response.status, 503);
  });
  test(`${name}: rejects requests with an invalid shared secret`, async () => {
    const response = await handlerFor(name, { [secretKey]: 'test-secret' })(new Request('https://test.invalid', { method: 'POST', headers: { 'x-webhook-secret': 'wrong' } }));
    assert.equal(response.status, 401);
  });
  test(`${name}: rejects non-POST requests`, async () => {
    const response = await handlerFor(name)(new Request('https://test.invalid'));
    assert.equal(response.status, 405);
  });
}
test('event webhook does not announce drafts', async () => {
  const response = await handlerFor('send-event-push', { EVENT_WEBHOOK_SECRET: 'test-secret' })(new Request('https://test.invalid', { method: 'POST', headers: { 'x-webhook-secret': 'test-secret', 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'INSERT', record: { id: 'event-1', title: 'Draft', status: 'draft' } }) }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).skipped, true);
});
