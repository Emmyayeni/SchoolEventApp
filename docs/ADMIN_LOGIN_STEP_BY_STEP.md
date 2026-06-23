# Admin Login - Step-by-Step Integration Guide

## Quick Overview

This guide walks through exact changes needed to add admin login to your existing app.

---

## Phase 1: Database Setup (5 minutes)

### Step 1A: Create Admin Users Table in Supabase

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'moderator', 'viewer')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admins can read admin_users table
CREATE POLICY "Admins read admin table" ON admin_users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('superadmin', 'moderator')
    )
  );
```

### Step 1B: Add Test Admin User

```sql
-- First, create a user via Supabase Auth, then get their UUID
-- Replace 'YOUR-UUID-HERE' with actual UUID

INSERT INTO admin_users (id, email, role) 
VALUES ('YOUR-UUID-HERE', 'admin@nsuk.edu.ng', 'superadmin');

INSERT INTO admin_users (id, email, role) 
VALUES ('YOUR-UUID-HERE-2', 'moderator@nsuk.edu.ng', 'moderator');
```

---

## Phase 2: Update Auth.js (10 minutes)

### Step 2A: Add Admin Helper Functions

**File:** `lib/Auth.js`

Add these functions at the end of the file:

```javascript
/**
 * Fetch user's admin role from database
 */
export async function getUserAdminRole(userId) {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      // User is not an admin if row doesn't exist
      return null;
    }

    return data?.role || null;
  } catch (err) {
    console.error('Error fetching admin role:', err);
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function isUserAdmin(userId) {
  const role = await getUserAdminRole(userId);
  return !!role;
}

/**
 * Get admin privileges based on role
 */
export function getAdminPrivileges(role) {
  const basePrivileges = {
    canViewDashboard: false,
    canManageEvents: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageSettings: false,
  };

  if (!role) return basePrivileges;

  if (role === 'superadmin') {
    return {
      canViewDashboard: true,
      canManageEvents: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canManageSettings: true,
    };
  }

  if (role === 'moderator') {
    return {
      canViewDashboard: true,
      canManageEvents: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canManageSettings: false,
    };
  }

  if (role === 'viewer') {
    return {
      canViewDashboard: true,
      canManageEvents: false,
      canManageUsers: false,
      canViewAnalytics: true,
      canManageSettings: false,
    };
  }

  return basePrivileges;
}

/**
 * Enrich user with admin info
 */
export async function enrichUserWithAdminInfo(user) {
  if (!user?.id) return user;

  const adminRole = await getUserAdminRole(user.id);

  return {
    ...user,
    accountType: adminRole ? 'admin' : user.accountType,
    role: adminRole,
    privileges: getAdminPrivileges(adminRole),
  };
}
```

---

## Phase 3: Update App.js (15 minutes)

### Step 3A: Import Admin Helpers

**File:** `App.js` (top of file)

```javascript
import {
  enrichUserWithAdminInfo,
  isUserAdmin,
} from "./lib/Auth";
import AdminNavigator from "./src/navigation/AdminNavigator";
```

### Step 3B: Update State

**In App component, update state declarations:**

```javascript
// BEFORE
const [phase, setPhase] = useState("splash");
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [user, setUser] = useState(seedUser);

// AFTER
const [phase, setPhase] = useState("splash"); // splash, onboarding, auth, app, admin
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isAdmin, setIsAdmin] = useState(false); // NEW
const [user, setUser] = useState(seedUser);
```

### Step 3C: Update Login Handler

**Find the login handler section and replace:**

```javascript
// FIND THIS:
const handleLogin = useCallback(async (email, password) => {
  try {
    // ... existing code ...
    const { user: authUser } = await signInWithEmailPassword(email, password);
    
    // Get and set user
    const appUser = await getCurrentAppUser();
    setUser(appUser);
    setIsAuthenticated(true);
    setPhase("app");
  } catch (err) {
    // error handling
  }
}, []);

// REPLACE WITH THIS:
const handleLogin = useCallback(async (email, password) => {
  try {
    // Sign in
    const { user: authUser, error } = await signInWithEmailPassword(email, password);
    
    if (error) {
      throw error;
    }

    // Get user with profile
    const appUser = await getCurrentAppUser();
    
    // NEW: Enrich with admin info
    const enrichedUser = await enrichUserWithAdminInfo(appUser);
    
    setUser(enrichedUser);
    setIsAuthenticated(true);
    
    // NEW: Route based on admin status
    if (enrichedUser.role) {
      setIsAdmin(true);
      setPhase("admin");
    } else {
      setIsAdmin(false);
      setPhase("app");
    }
  } catch (err) {
    const errorMsg = getAuthErrorMessage(err);
    Alert.alert("Login Failed", errorMsg);
  }
}, []);
```

### Step 3D: Update Logout Handler

```javascript
const handleLogout = useCallback(async () => {
  try {
    await signOutCurrentUser();
    setIsAuthenticated(false);
    setIsAdmin(false); // NEW
    setUser(seedUser);
    setPhase("auth");
  } catch (err) {
    Alert.alert("Error", "Failed to logout");
  }
}, []);
```

### Step 3E: Update Render Logic

**Find the render section and update:**

```javascript
// FIND THIS section:
if (phase === "app") {
  return renderInShell(
    <AppNavigator
      activeTab={activeTab}
      onTabChange={setActiveTab}
      // ... existing props
    />
  );
}

// ADD THIS BEFORE the app rendering:
if (phase === "admin" && isAdmin && user) {
  return renderInShell(
    <AdminNavigator
      activeScreen="dashboard"
      onNavigate={() => {}}
      dashboardProps={{
        stats: {
          totalEvents: events.length,
          totalUsers: 1, // You'll populate these from your API
          totalRegistrations: events.reduce((sum, e) => sum + (e.registeredCount || 0), 0),
          activeAnnouncements: announcements.length,
        },
        recentEvents: events.slice(0, 5),
        recentUsers: [],
        onManageEvents: () => {},
        onManageUsers: () => {},
        onManageAnnouncements: () => {},
        onViewAnalytics: () => {},
        onBack: handleLogout,
      }}
      manageEventsProps={{
        events: events.map(e => ({
          id: e.id,
          title: e.title,
          date: e.date,
          venue: e.venue,
          organizer: e.organizer,
          image: e.image,
          registeredCount: e.registeredCount || 0,
        })),
        onBack: () => setPhase("admin"),
        onCreateEvent: () => {/* handle */},
        onEditEvent: () => {/* handle */},
        onDeleteEvent: () => {/* handle */},
        onViewEventDetails: () => {/* handle */},
      }}
      manageUsersProps={{
        users: [],
        onBack: () => setPhase("admin"),
        onViewUserDetails: () => {},
        onEditUser: () => {},
        onDisableUser: () => {},
        onResetPassword: () => {},
      }}
      analyticsProps={{
        analytics: {
          totalEvents: events.length,
          totalUsers: 1,
          totalRegistrations: events.reduce((sum, e) => sum + (e.registeredCount || 0), 0),
          averageAttendance: 75,
          eventsByCategory: {},
          usersByDepartment: {},
          registrationTrend: [],
          topEvents: events.slice(0, 5),
        },
        onBack: () => setPhase("admin"),
        onExportReport: () => {},
      }}
      settingsProps={{
        settings: {
          autoApproveEvents: false,
          requireEventDescription: true,
          maxEventsPerUser: 5,
          sendNotifications: true,
          maintenanceMode: false,
        },
        onBack: () => setPhase("admin"),
        onUpdateSettings: () => {},
        onChangePassword: () => {},
        onLogout: handleLogout,
      }}
    />
  );
}
```

---

## Phase 4: Update LoginScreen (5 minutes)

### Step 4A: Add Admin Button

**File:** `src/screens/LoginScreen.js`

Find this section:

```javascript
<View style={styles.footer}>
  <Text style={styles.footerText}>Don&apos;t have an account? </Text>
  <Pressable onPress={onSwitchToSignup}>
    <Text style={styles.signupLink}>Sign Up</Text>
  </Pressable>
</View>
```

**Replace with:**

```javascript
<View style={styles.footer}>
  <Text style={styles.footerText}>Don&apos;t have an account? </Text>
  <Pressable onPress={onSwitchToSignup}>
    <Text style={styles.signupLink}>Sign Up</Text>
  </Pressable>
</View>

{/* NEW: Admin Login Link */}
<View style={styles.adminSection}>
  <Text style={styles.adminDivider}>—————————</Text>
  <Pressable onPress={onSwitchToAdmin}>
    <View style={styles.adminLink}>
      <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
      <Text style={[styles.adminText, { color: colors.primary }]}>
        Admin Access
      </Text>
    </View>
  </Pressable>
  <Text style={styles.adminDivider}>—————————</Text>
</View>
```

### Step 4B: Add Styles

Add to the `getStyles` function:

```javascript
adminSection: {
  alignItems: "center",
  marginTop: scale(16),
  marginBottom: scale(12),
  gap: scale(6),
},
adminDivider: {
  fontSize: ms(10),
  color: colors.textSubtle,
  opacity: 0.5,
},
adminLink: {
  flexDirection: "row",
  alignItems: "center",
  gap: scale(6),
  paddingVertical: scale(6),
},
adminText: {
  fontSize: ms(12),
  fontWeight: "700",
},
```

### Step 4C: Update Props

In the component signature, add:

```javascript
export default function LoginScreen({
  email,
  password,
  showPassword,
  errors,
  loading,
  onChangeEmail,
  onChangePassword,
  onTogglePassword,
  onLogin,
  onSwitchToSignup,
  onSwitchToAdmin, // NEW
  onBack = () => {},
}) {
```

---

## Phase 5: Test the Flow (5 minutes)

### Step 5A: Run the App

```bash
npm start
# or
expo start
```

### Step 5B: Tap Admin Access Link

1. On login screen, tap "Admin Access"
2. Enter test credentials:
   - Email: `admin@nsuk.edu.ng`
   - Password: (whatever you set in Supabase)
3. Should redirect to AdminNavigator

### Step 5C: Debug Tips

If admin login doesn't work:

1. Check browser console for errors
2. Verify admin_users table has data:
   ```sql
   SELECT * FROM admin_users;
   ```
3. Verify user UUID matches in auth.users and admin_users
4. Check Supabase logs for SQL errors
5. Add console logs to `enrichUserWithAdminInfo()`

---

## Phase 6: Secure Admin Access (Optional but Recommended)

### Step 6A: Add Rate Limiting

```javascript
// In handleLogin
const maxLoginAttempts = 5;
const loginAttemptKey = `@nsuk/login_attempts_${email}`;
const timestamp = Date.now();

// Check previous attempts
const prevAttempts = await AsyncStorage.getItem(loginAttemptKey);
if (prevAttempts) {
  const attempts = JSON.parse(prevAttempts);
  const recentAttempts = attempts.filter(t => timestamp - t < 15 * 60 * 1000); // 15 min
  
  if (recentAttempts.length >= maxLoginAttempts) {
    Alert.alert("Too Many Attempts", "Try again in 15 minutes");
    return;
  }
  
  recentAttempts.push(timestamp);
  await AsyncStorage.setItem(loginAttemptKey, JSON.stringify(recentAttempts));
}
```

### Step 6B: Add 2FA (Two-Factor Authentication)

```javascript
// After successful login, if admin:
if (enrichedUser.role && !user2FAVerified) {
  // Show 2FA verification screen
  setPhase("2fa");
  // Only route to admin after 2FA verified
}
```

---

## Checklist

- [ ] Create admin_users table in Supabase
- [ ] Add test admin users
- [ ] Update Auth.js with helper functions
- [ ] Update App.js with admin routing
- [ ] Update LoginScreen with admin button
- [ ] Test admin login works
- [ ] Test admin routes to admin dashboard
- [ ] Test logout works
- [ ] Test regular user still works
- [ ] Hide admin in production login UI (optional)

---

## Common Issues & Fixes

### Issue: "Admin role is null"
**Fix:** Verify admin_users table has correct UUID matching auth.users id

### Issue: "Still goes to regular app after admin login"
**Fix:** Check `if (enrichedUser.role)` condition in handleLogin

### Issue: "Admin button not visible"
**Fix:** Verify `onSwitchToAdmin` prop passed to LoginScreen

### Issue: "Users table not found"
**Fix:** Run SQL to create admin_users table first

### Issue: "RLS policy error"
**Fix:** Ensure RLS policies allow reads for admins

---

## Files Modified Summary

1. **lib/Auth.js** - Added 4 new functions
2. **App.js** - Updated state, login handler, render logic
3. **src/screens/LoginScreen.js** - Added admin button
4. **Supabase (SQL)** - Created admin_users table

---

## Next Steps

1. ✅ Complete all steps above
2. ✅ Test admin login works
3. 📊 Connect AdminNavigator to real data
4. 📝 Implement admin functions (create event, manage users, etc.)
5. 🔒 Add server-side permission checks
6. 📧 Set up admin notifications/logging

---

**You're done! Admin login is now integrated.** 🎉
