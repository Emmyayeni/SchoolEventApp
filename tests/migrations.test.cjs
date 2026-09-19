const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');

test('database migrations preserve records, enforce count visibility and allow catalog reads', async () => {
  const db = new PGlite();
  try {
    // Local fixtures only. No network or real-account credentials are used.
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema public, auth to anon, authenticated;
    `);
    const baseline = fs.readFileSync(path.join(__dirname, '../SUPABASE_FULL_SCHEMA.sql'), 'utf8');
    for (const name of ['profiles', 'admin_users', 'events', 'event_registrations', 'event_bookmarks', 'announcements', 'notifications', 'user_settings']) {
      const definition = baseline.match(new RegExp(`create table if not exists public\\.${name} \\([\\s\\S]*?\\n\\);`));
      assert.ok(definition, `baseline definition for ${name}`);
      await db.exec(definition[0]);
    }
    const registrationRules = baseline.match(/create or replace function public\.handle_event_registration_rules\(\)[\s\S]*?\$\$;/);
    await db.exec(registrationRules[0]);
    const student = '00000000-0000-0000-0000-000000000001';
    const organizer = '00000000-0000-0000-0000-000000000002';
    const disabled = '00000000-0000-0000-0000-000000000003';
    const moderator = '00000000-0000-0000-0000-000000000004';
    await db.exec(`
      insert into auth.users values ('${student}'), ('${organizer}'), ('${disabled}'), ('${moderator}');
      insert into public.profiles(id, account_type) values
        ('${student}', 'student'), ('${organizer}', 'organizer'), ('${disabled}', 'student'), ('${moderator}', 'staff');
      insert into public.admin_users(id, role) values ('${moderator}', 'moderator');
      update profiles set avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80' where id = '${student}';
      update profiles set avatar_url = 'https://example.test/uploaded-photo.jpg' where id = '${organizer}';
      insert into events(title,category,description,event_date,start_time,venue,organizer,created_by,image_url)
      values ('Existing event', 'Custom category', 'Existing description', '2099-01-01', '12:00', 'Hall', 'Organizer', '${organizer}',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80');
    `);
    const migrations = ['202609130001_account_approval.sql', '202609140001_mobile_data.sql', '202609190001_event_end_time.sql'];
    for (let pass = 0; pass < 2; pass++) {
      for (const name of migrations) await db.exec(fs.readFileSync(path.join(__dirname, '../supabase/migrations', name), 'utf8'));
    }
    assert.equal((await db.query('select count(*)::int as n from profiles')).rows[0].n, 4);
    assert.equal((await db.query('select avatar_url from profiles where id=$1', [student])).rows[0].avatar_url, null);
    assert.equal((await db.query('select avatar_url from profiles where id=$1', [organizer])).rows[0].avatar_url, 'https://example.test/uploaded-photo.jpg');
    assert.equal((await db.query("select image_url from events where title='Existing event'")).rows[0].image_url, null);
    assert.match(String((await db.query("select end_time from events where title='Existing event'")).rows[0].end_time), /13:00/);
    assert.equal((await db.query("select name from event_categories where name='Custom category'")).rows.length, 1);
    await db.exec(`update profiles set account_status = 'disabled' where id = '${disabled}';`);
    const eventIds = ['00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000103'];
    for (let i = 0; i < eventIds.length; i++) {
      await db.query(`insert into events(id,title,category,description,event_date,start_time,venue,organizer,created_by,target_audience,status)
        values ($1,'Test event','Workshop','Test description','2099-01-01','12:00','Test venue','Test organizer',$2,$3,$4)`,
      [eventIds[i], organizer, i === 1 ? 'staff' : 'all', i === 2 ? 'draft' : 'published']);
    }
    assert.equal((await db.query('select end_time::text from events where id=$1', [eventIds[0]])).rows[0].end_time, null);
    await db.query(`insert into event_registrations(event_id,user_id,status) values ($1,$2,'registered'),($1,$3,'registered'),($1,$4,'waitlisted')`,
      [eventIds[0], student, organizer, disabled]);
    await db.exec(`alter table event_registrations enable row level security;
      create policy only_own on event_registrations for select to authenticated using (user_id=auth.uid());
      grant select on event_registrations to authenticated;`);
    async function asUser(id) {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
      await db.exec('set role authenticated');
    }
    await asUser(student);
    assert.equal((await db.query('select count(*)::int as n from event_registrations')).rows[0].n, 1);
    const counts = await db.query('select * from get_event_registration_counts($1::uuid[])', [eventIds]);
    assert.deepEqual(counts.rows.map(row => [row.event_id, Number(row.registered_count)]), [[eventIds[0], 2]]);
    await assert.rejects(db.query('select * from get_event_registration_counts($1::uuid[])', [Array(201).fill(eventIds[0])]), /at most 200/);
    await asUser(organizer);
    assert.equal((await db.query('select * from get_event_registration_counts($1::uuid[])', [eventIds])).rows.length, 3);
    await asUser(moderator);
    assert.equal((await db.query('select * from get_event_registration_counts($1::uuid[])', [eventIds])).rows.length, 3);
    await asUser(disabled);
    assert.equal((await db.query('select * from get_event_registration_counts($1::uuid[])', [eventIds])).rows.length, 0);
    await db.exec('reset role; set role anon;');
    for (const name of ['academic_faculties', 'academic_departments', 'academic_levels']) {
      assert.ok((await db.query(`select count(*)::int as n from ${name}`)).rows[0].n > 0);
    }
    await assert.rejects(db.query('select * from get_event_registration_counts($1::uuid[])', [eventIds]), /permission denied/);
    await assert.rejects(db.exec("insert into academic_levels(name) values ('Unauthorized')"), /permission denied/);
  } finally { await db.close(); }
});
