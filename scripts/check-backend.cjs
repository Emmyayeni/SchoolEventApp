const fs = require('node:fs');
const dotenv = require('dotenv');

async function main() {
  const config = {};
  for (const file of ['.env', '.env.production', '.env.local']) {
    if (fs.existsSync(file)) Object.assign(config, dotenv.parse(fs.readFileSync(file)));
  }
  Object.assign(config, process.env);
  const url = config.EXPO_PUBLIC_SUPABASE_URL;
  const key = config.EXPO_PUBLIC_SUPABASE_ANON_KEY || config.EXPO_PUBLIC_SUPABASE_KEY;
  if (!url || !key) throw new Error('Set the public Supabase URL and key in .env.local.');
  const tables = {
    profiles: 'id,account_type,account_status,expo_push_token',
    events: 'id,event_date,start_time,capacity,status',
    event_registrations: 'event_id,user_id,status',
    announcements: 'id,attachment_urls,target_audience',
    notifications: 'id,event_id,announcement_id,is_read,source_key',
    admin_users: 'id,role',
  };
  for (const [table, columns] of Object.entries(tables)) {
    // limit=0 checks schema compatibility without retrieving user records.
    const response = await fetch(`${url}/rest/v1/${table}?select=${columns}&limit=0`, {
      headers: { apikey: key }, signal: AbortSignal.timeout(15000),
    });
    if (response.ok) console.log(`OK ${table}: expected columns available`);
    else {
      const error = await response.json().catch(() => ({}));
      console.error(`FAIL ${table}: HTTP ${response.status} ${error.message || ''}`);
      process.exitCode = 1;
    }
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
