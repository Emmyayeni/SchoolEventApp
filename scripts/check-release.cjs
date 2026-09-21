const fs = require('node:fs');
const path = require('node:path');
const { expo } = require('../app.json');
const eas = require('../eas.json');
let failed = false;
function check(ok, message) { console.log(`${ok ? 'OK' : 'BLOCKED'} ${message}`); if (!ok) failed = true; }
check(Boolean(expo.extra?.eas?.projectId), 'EAS project ID');
check(eas.build.production.android.buildType === 'app-bundle', 'Production Android App Bundle profile');
for (const file of [expo.icon, expo.android.adaptiveIcon.foregroundImage, ...expo.plugins.filter(p => Array.isArray(p)).map(p => p[1].image || p[1].icon).filter(Boolean)]) {
  check(fs.existsSync(path.resolve(__dirname, '..', file)), `Asset exists: ${file}`);
}
const firebaseFile = process.env.GOOGLE_SERVICES_JSON || path.resolve(__dirname, '../google-services.json');
if (process.env.EAS_BUILD_PLATFORM === 'ios') console.log('INFO Android Firebase checks skipped for the iOS build.');
else if (!fs.existsSync(firebaseFile)) check(false, 'Firebase Android configuration missing. Add google-services.json locally or set the EAS file variable GOOGLE_SERVICES_JSON.');
else {
  try {
    const firebase = JSON.parse(fs.readFileSync(firebaseFile, 'utf8'));
    check(firebase.client?.some(client => client.client_info?.android_client_info?.package_name === expo.android.package), `Firebase client must match ${expo.android.package}`);
  } catch { check(false, 'Firebase configuration must be valid JSON'); }
}
console.log('MANUAL: Verify the FCM V1 service-account key in EAS Credentials (Android).');
console.log('MANUAL: Verify APNs credentials and a physical-device build before an iOS release.');
console.log('MANUAL: Deploy both Supabase push functions, configure their secrets/webhooks, and verify delivery plus tap navigation on an installed build.');
process.exitCode = failed ? 1 : 0;
