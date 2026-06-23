/**
 * ADMIN_DEBUG_INTEGRATION.md
 * 
 * Quick reference for integrating AdminLoginDebugUtils into your app
 * This provides testing capabilities for admin login during development
 */

# Admin Debug Utilities Integration Guide

## Overview

`AdminLoginDebugUtils.js` provides development tools for testing admin login functionality without needing real Supabase data. It includes:

- **Mock Credentials**: Pre-configured test accounts (superadmin, moderator, viewer)
- **Debug Menu**: Modal interface to select and test login flows
- **Debug Button**: Floating button for quick access to debug menu
- **Troubleshooting Guide**: Common issues and solutions

## Installation

### Step 1: Add Debug Button to App.js

In your `App.js`, import and add the debug button:

```javascript
import { AdminDebugButton } from './AdminLoginDebugUtils';

export default function App() {
  // ... existing code ...

  return (
    <View style={{ flex: 1 }}>
      {/* Your app content */}
      {/* Admin debug button - automatically hides in production */}
      <AdminDebugButton />
    </View>
  );
}
```

### Step 2: Use Mock Credentials in LoginScreen

In `src/screens/LoginScreen.js`, use the debug credentials:

```javascript
import { MOCK_ADMIN_CREDENTIALS } from '../../AdminLoginDebugUtils';

function LoginScreen({ navigation, onSwitchToAdmin, ...props }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Quick test login function
  const handleQuickAdminLogin = () => {
    const testCred = MOCK_ADMIN_CREDENTIALS.superadmin;
    setEmail(testCred.email);
    setPassword(testCred.password);
    // Trigger login immediately
    setTimeout(() => handleLogin(), 100);
  };

  // Add this button to your UI (only in dev mode)
  if (__DEV__) {
    return (
      <View>
        {/* Your existing login form */}
        {/* ... */}

        {/* Debug: Quick login buttons */}
        <View style={styles.debugSection}>
          <Pressable 
            style={styles.debugBtn}
            onPress={handleQuickAdminLogin}
          >
            <Text>🧪 Quick Admin Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    // Your normal render
  );
}
```

### Step 3: Use in Authentication Handler

In your login handler, use mock data during development:

```javascript
import { MOCK_ADMIN_CREDENTIALS } from './AdminLoginDebugUtils';

async function handleLogin() {
  const { email, password } = loginForm;

  // In development, you can use mock credentials
  if (__DEV__) {
    const mockCred = MOCK_ADMIN_CREDENTIALS.superadmin;
    if (email === mockCred.email && password === mockCred.password) {
      console.log('✅ Mock admin login successful');
      
      // Simulate authenticated user
      const mockUser = {
        id: 'mock-' + Date.now(),
        email: mockCred.email,
        fullName: mockCred.fullName,
        role: mockCred.role,
        privileges: mockCred.privileges,
        isAdmin: true,
      };

      setAppUser(mockUser);
      setPhase('admin');
      return;
    }
  }

  // Real login...
  try {
    const user = await signInWithEmailPassword(email, password);
    // ... rest of your login logic
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

## Mock Credentials

Three test accounts are available:

### 1. Superadmin
- Email: `admin@nsuk.edu.ng`
- Password: `AdminPassword123!`
- Role: `superadmin`
- Privileges: ALL ✓

### 2. Moderator
- Email: `moderator@nsuk.edu.ng`
- Password: `ModeratorPass123!`
- Role: `moderator`
- Privileges: Dashboard, Events, Users, Analytics

### 3. Viewer
- Email: `viewer@nsuk.edu.ng`
- Password: `ViewerPass123!`
- Role: `viewer`
- Privileges: Dashboard, Analytics only

## Using the Debug Menu

1. **Open Debug Menu**: Tap the debug button (bug icon) in bottom-right corner
2. **Select Credentials**: Choose from 3 pre-configured accounts
3. **Copy Credentials**: Use "Copy to Clipboard" to get email/password
4. **Paste & Test**: Use in login form to test
5. **Check Features**: Reference the "Features to Test" checklist
6. **Troubleshoot**: Check "Troubleshooting" section for common issues

## Features Testing Checklist

Use the debug menu's testing checklist to verify:

- [ ] Admin dashboard loads
- [ ] Stat cards display correctly
- [ ] Event management accessible
- [ ] User management accessible
- [ ] Analytics show data
- [ ] Settings adjustable
- [ ] Logout works
- [ ] Permissions enforced

## Common Test Scenarios

### Scenario 1: Test Full Admin Flow
1. Open debug menu
2. Select "Dr. Admin User" (superadmin)
3. Copy credentials from menu
4. Go to LoginScreen
5. Paste credentials
6. Tap Login
7. Verify: AdminNavigator loads with dashboard

### Scenario 2: Test Permission Restrictions
1. Login with Moderator account
2. Navigate to Settings
3. Verify: Settings screen shows as disabled/read-only
4. Check: Moderator cannot change admin settings

### Scenario 3: Test Regular User Still Works
1. Use regular user credentials (not admin)
2. Login
3. Verify: Routes to regular AppNavigator
4. Verify: Admin screens not accessible

### Scenario 4: Test Logout
1. Login as admin
2. Navigate to AdminSettings
3. Tap Logout
4. Verify: Redirects to LoginScreen
5. Verify: Previous session cleared

## Troubleshooting via Debug Menu

### Issue: Admin not found
**Solution from menu**: Check admin_users table UUID matches auth.users

### Issue: Routes to regular app instead of admin
**Solution from menu**: Verify enrichUserWithAdminInfo() returns role correctly

### Issue: Admin button not showing
**Solution from menu**: Check LoginScreen gets onSwitchToAdmin prop

### Issue: RLS policy errors
**Solution from menu**: Verify RLS allows reading admin_users table

## Environment Variables

The debug utilities automatically:
- ✅ Hide in production (`__DEV__` check)
- ✅ Hide debug button in production
- ✅ Log to console only in development

**Important**: Debug utilities are safe for production builds - they simply won't display.

## Debugging Tips

### Tip 1: Console Logging
The debug menu logs selected credentials to console:
```javascript
console.log('Selected:', selectedCredential);
console.log('Credentials:', MOCK_ADMIN_CREDENTIALS[selectedCredential]);
```

Monitor console for login flow debugging.

### Tip 2: Mock vs Real Credentials
During development:
1. Test with **mock credentials first** via debug menu
2. Then test with **real Supabase users**
3. Finally test with **actual admin accounts**

### Tip 3: Feature Toggle Testing
Use different admin roles to test permission levels:
- Superadmin: Full access
- Moderator: Management access
- Viewer: Read-only access

### Tip 4: Network Debugging
If mock login works but real login fails:
1. Check network requests in React Native debugger
2. Verify Supabase URL and API key
3. Check admin_users table RLS policies
4. Verify UUID matching between tables

## Integration with Existing Screens

### In HomeScreen
```javascript
// Add debug context switcher
if (__DEV__) {
  <Pressable onPress={() => {
    // Quick switch to admin without re-login
    setPhase('admin');
  }}>
    <Text>👤 Switch to Admin (Dev)</Text>
  </Pressable>
}
```

### In ProfileScreen
```javascript
// Show current user role (debug info)
if (__DEV__) {
  <Text>Role: {appUser?.role || 'regular'}</Text>
  <Text>Admin: {appUser?.isAdmin ? 'Yes' : 'No'}</Text>
}
```

### In SettingsScreen
```javascript
// Add reset to mock state button
if (__DEV__) {
  <Pressable onPress={() => {
    const mockUser = MOCK_ADMIN_CREDENTIALS.superadmin;
    setAppUser(mockUser);
    setPhase('admin');
  }}>
    <Text>🔧 Reset to Mock Admin</Text>
  </Pressable>
}
```

## Removing Debug Utilities from Production

When ready for production:

1. **Option A: Keep (Recommended)**
   - Leave `AdminLoginDebugUtils.js` in project
   - Utilities automatically hidden via `__DEV__` checks
   - No performance impact in production build

2. **Option B: Remove**
   - Delete `AdminLoginDebugUtils.js`
   - Remove `<AdminDebugButton />` from App.js
   - Remove debug imports from screens

3. **Option C: Conditional Import**
   ```javascript
   let AdminDebugButton;
   if (__DEV__) {
     const { AdminDebugButton: DebugBtn } = require('./AdminLoginDebugUtils');
     AdminDebugButton = DebugBtn;
   }
   ```

## Best Practices

✅ **Do:**
- Use debug menu for initial development
- Test all 3 credential types
- Reference troubleshooting guide
- Keep in codebase for future debugging
- Use mock login for CI/CD testing

❌ **Don't:**
- Ship with credentials hardcoded in non-debug files
- Use debug menu credentials in production
- Rely only on mock testing (test with real data too)
- Leave console.log debug statements in production code

## Performance Notes

- Debug utilities: ~50KB uncompressed
- Debug button: Only renders in dev mode
- No performance impact in production build
- Mock data: In-memory, no network calls

## Next Steps

1. ✅ Integrate `AdminLoginDebugUtils` into App.js
2. ✅ Add debug button to main screen
3. ✅ Test all 3 mock credentials
4. ✅ Use troubleshooting guide if issues found
5. ✅ Test real Supabase authentication
6. ✅ Test permission restrictions
7. ✅ Deploy to production (utilities safely hidden)

## Support

If you encounter issues:

1. Check debug menu's "Troubleshooting" section
2. Review this integration guide
3. Check console logs (enable in React Native debugger)
4. Verify admin_users table exists in Supabase
5. Verify RLS policies are correctly set
