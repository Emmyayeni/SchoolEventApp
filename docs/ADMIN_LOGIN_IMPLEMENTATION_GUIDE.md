# Admin Login Implementation Guide

## Overview

This guide shows how to integrate admin authentication into your existing NSUK Events app. The flow handles both regular users and admin users, routing them to appropriate dashboards.

---

## Architecture

### Authentication Flow

```
Login Form
    ↓
Validate Credentials
    ↓
Sign In (Supabase)
    ↓
Fetch User Profile
    ↓
Check Admin Status
    ↓
├─ IS ADMIN → AdminNavigator (Admin Dashboard)
│
└─ NOT ADMIN → AppNavigator (Regular Dashboard)
```

---

## Step 1: Update Auth.js

Add a function to check admin status:

```javascript
// In lib/Auth.js

/**
 * Get user's admin role from database
 */
async function getUserAdminRole(userId) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Could not fetch admin role:', error.message);
      return null;
    }

    return data?.role || null;
  } catch (err) {
    console.error('Error fetching admin role:', err);
    return null;
  }
}

/**
 * Map user with admin privileges
 */
async function enrichUserWithAdminInfo(user) {
  if (!user?.id) return user;

  const adminRole = await getUserAdminRole(user.id);
  
  return {
    ...user,
    isAdmin: !!adminRole,
    role: adminRole,
    privileges: {
      canViewDashboard: !!adminRole,
      canManageEvents: !!adminRole,
      canManageUsers: adminRole === 'superadmin',
      canViewAnalytics: !!adminRole,
      canManageSettings: adminRole === 'superadmin',
    },
  };
}

export { getUserAdminRole, enrichUserWithAdminInfo };
```

### Database Schema

Create admin_users table in Supabase:

```sql
-- Create admin_users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'moderator', 'viewer')),
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(id, email)
);

-- Create index for faster lookups
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Sample admin records
INSERT INTO admin_users (id, email, role, created_at) VALUES
  ('superadmin-uuid-here', 'admin@nsuk.edu.ng', 'superadmin', NOW()),
  ('moderator-uuid-here', 'moderator@nsuk.edu.ng', 'moderator', NOW());
```

---

## Step 2: Create Separate Login Component

Create `src/screens/AdminLoginScreen.js`:

```javascript
import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "../theme/theme";
import { ms, scale } from "../utils/responsive";

export default function AdminLoginScreen({
  email,
  password,
  showPassword,
  errors,
  loading,
  onChangeEmail,
  onChangePassword,
  onTogglePassword,
  onLogin,
  onSwitchToStudent,
  onBack = () => {},
}) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View />
      </View>

      <View style={styles.heroBlock}>
        <View style={[styles.badgeIcon, { backgroundColor: colors.primary + "20" }]}>
          <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Admin Portal</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Access administration dashboard
        </Text>
      </View>

      {/* Email Field */}
      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
        <View style={[styles.inputWrap, { borderColor: errors.email ? colors.error : colors.border }]}>
          <Ionicons name="mail" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={email}
            onChangeText={onChangeEmail}
            placeholder="admin@nsuk.edu.ng"
            placeholderTextColor={colors.textSubtle}
            editable={!loading}
          />
        </View>
        {errors.email && <Text style={[styles.error, { color: colors.error }]}>{errors.email}</Text>}
      </View>

      {/* Password Field */}
      <View style={styles.fieldWrap}>
        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <View style={[styles.inputWrap, { borderColor: errors.password ? colors.error : colors.border }]}>
          <Ionicons name="key" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={password}
            onChangeText={onChangePassword}
            placeholder="Enter secure password"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <Pressable onPress={onTogglePassword}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={16} color={colors.primary} />
          </Pressable>
        </View>
        {errors.password && <Text style={[styles.error, { color: colors.error }]}>{errors.password}</Text>}
      </View>

      {errors.general && <Text style={[styles.generalError, { color: colors.error }]}>{errors.general}</Text>}

      {/* Login Button */}
      <Pressable
        style={[styles.loginBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={onLogin}
        disabled={loading}
      >
        <Text style={[styles.loginBtnText, { color: colors.primaryContrast }]}>
          {loading ? "Authenticating..." : "Admin Login"}
        </Text>
      </Pressable>

      {/* Switch to Student Login */}
      <Pressable onPress={onSwitchToStudent} style={styles.switchButton}>
        <Text style={[styles.switchText, { color: colors.primary }]}>
          Not an admin? Login as Student
        </Text>
      </Pressable>

      {/* Security Info */}
      <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
        <Ionicons name="information-circle" size={20} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          This portal is for authorized administrators only. Unauthorized access attempts are logged.
        </Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors, insets) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: scale(16),
      paddingTop: insets.top + scale(12),
      paddingBottom: scale(32),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: scale(24),
    },
    backBtn: {
      width: scale(36),
      height: scale(36),
      borderRadius: scale(18),
      alignItems: "center",
      justifyContent: "center",
    },
    heroBlock: {
      alignItems: "center",
      marginBottom: scale(32),
    },
    badgeIcon: {
      width: scale(64),
      height: scale(64),
      borderRadius: scale(32),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: scale(12),
    },
    title: {
      fontSize: ms(24),
      fontWeight: "800",
      marginBottom: scale(6),
    },
    subtitle: {
      fontSize: ms(13),
      fontWeight: "500",
      textAlign: "center",
    },
    fieldWrap: {
      marginBottom: scale(16),
    },
    label: {
      fontSize: ms(12),
      fontWeight: "700",
      marginBottom: scale(6),
      textTransform: "uppercase",
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: scale(10),
      paddingHorizontal: scale(12),
      height: scale(48),
      gap: scale(8),
    },
    input: {
      flex: 1,
      fontSize: ms(13),
      fontWeight: "500",
    },
    error: {
      fontSize: ms(11),
      fontWeight: "600",
      marginTop: scale(4),
    },
    generalError: {
      fontSize: ms(12),
      fontWeight: "700",
      padding: scale(10),
      borderRadius: scale(8),
      marginBottom: scale(16),
      backgroundColor: "#ef444420",
    },
    loginBtn: {
      borderRadius: scale(12),
      height: scale(48),
      alignItems: "center",
      justifyContent: "center",
      marginvertical: scale(16),
      marginBottom: scale(12),
    },
    loginBtnText: {
      fontSize: ms(14),
      fontWeight: "800",
    },
    switchButton: {
      paddingVertical: scale(12),
      alignItems: "center",
      marginBottom: scale(24),
    },
    switchText: {
      fontSize: ms(12),
      fontWeight: "700",
    },
    infoCard: {
      borderRadius: scale(10),
      padding: scale(12),
      flexDirection: "row",
      gap: scale(10),
      alignItems: "flex-start",
    },
    infoText: {
      flex: 1,
      fontSize: ms(11),
      fontWeight: "500",
      lineHeight: 16,
    },
  });
```

---

## Step 3: Modify App.js Authentication Logic

### Current Structure (Snippet)
```javascript
// In App.js
const [phase, setPhase] = useState("splash");
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

### Update to Support Admin

```javascript
// Add to App.js state
const [phase, setPhase] = useState("splash"); // splash, auth, app, admin
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isAdmin, setIsAdmin] = useState(false);
const [user, setUser] = useState(null);
const [authScreen, setAuthScreen] = useState("login"); // login, admin-login, signup

// Add login handler
const handleLogin = async (email, password) => {
  try {
    const result = await signInWithEmailPassword(email, password);
    
    if (result.error) {
      throw result.error;
    }

    const userData = await getCurrentAppUser();
    const enrichedUser = await enrichUserWithAdminInfo(userData); // NEW

    setUser(enrichedUser);
    setIsAuthenticated(true);
    
    // Route based on admin status
    if (enrichedUser.isAdmin) {
      setIsAdmin(true);
      setPhase("admin");
    } else {
      setPhase("app");
    }
  } catch (err) {
    Alert.alert("Login Failed", err.message);
  }
};

// In render logic
if (phase === "auth") {
  if (authScreen === "admin-login") {
    return <AdminLoginScreen 
      onLogin={handleLogin}
      onSwitchToStudent={() => setAuthScreen("login")}
    />;
  }
  return <LoginScreen 
    onLogin={handleLogin}
    onSwitchToAdmin={() => setAuthScreen("admin-login")}
  />;
}

if (phase === "admin" && isAdmin) {
  return <AdminInterfaceWithNavigator user={user} />;
}

if (phase === "app") {
  return <AppNavigator user={user} />;
}
```

---

## Step 4: Add Admin Login Tab to LoginScreen

Modify `src/screens/LoginScreen.js` to include admin login option:

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
  const { colors } = useAppTheme();
  
  return (
    <View style={styles.container}>
      {/* Existing login UI */}
      
      {/* Add this at the bottom before the signup link */}
      <View style={styles.adminSection}>
        <Pressable onPress={onSwitchToAdmin} style={styles.adminLink}>
          <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
          <Text style={[styles.adminText, { color: colors.primary }]}>
            Admin Login
          </Text>
        </Pressable>
      </View>
      
      {/* Existing footer */}
    </View>
  );
}
```

---

## Step 5: Test Admin Login

### Using Mock Credentials

```javascript
// In dev mode only, add to LoginScreen or separate debug component
if (__DEV__) {
  const testAdminLogin = () => {
    setEmail("admin@nsuk.edu.ng");
    setPassword("AdminPassword123!");
    // Auto-submit after brief delay
    setTimeout(() => handleLogin(), 100);
  };

  return (
    <>
      {/* Login form */}
      <Pressable onPress={testAdminLogin} style={styles.debugBtn}>
        <Text>Quick Admin Login (Dev)</Text>
      </Pressable>
    </>
  );
}
```

### Test Credentials

```
Superadmin:
  Email: admin@nsuk.edu.ng
  Password: AdminPassword123!

Moderator:
  Email: moderator@nsuk.edu.ng
  Password: ModeratorPass123!

Student (regular user):
  Email: student@nsuk.edu.ng
  Password: StudentPass123!
```

---

## Step 6: Set Up Admin Users in Supabase

### Via SQL

```sql
-- Insert admin users after they sign up via signup flow
INSERT INTO auth.users (email, password, email_confirmed_at)
VALUES ('admin@nsuk.edu.ng', crypt('AdminPassword123!', gen_salt('bf')), NOW());

-- Then add to admin_users table
INSERT INTO admin_users (id, email, role)
SELECT id, email, 'superadmin'
FROM auth.users
WHERE email = 'admin@nsuk.edu.ng';
```

### Via Dashboard

1. Go to Supabase Dashboard
2. Go to SQL Editor
3. Run the above SQL
4. Or manually insert rows in the admin_users table

---

## Step 7: Handle Logout for Admin

```javascript
const handleAdminLogout = async () => {
  Alert.alert("Logout", "Are you sure you want to logout?", [
    { text: "Cancel" },
    {
      text: "Logout",
      onPress: async () => {
        try {
          await signOutCurrentUser();
          setIsAdmin(false);
          setIsAuthenticated(false);
          setUser(null);
          setPhase("auth");
        } catch (err) {
          Alert.alert("Error", "Failed to logout");
        }
      },
    },
  ]);
};
```

---

## Security Considerations

### ✅ Do's
- ✅ Check admin status on every login
- ✅ Validate admin permissions on backend
- ✅ Log admin actions
- ✅ Use HTTPS/TLS for all requests
- ✅ Implement rate limiting on login
- ✅ Use secure password hashing (Supabase handles this)

### ❌ Don'ts
- ❌ Store admin flag only on client
- ❌ Trust client-side permission checks
- ❌ Allow password in URL/logs
- ❌ Skip email verification for admins
- ❌ Store sensitive data in AsyncStorage without encryption

### Server-Side Validation

```javascript
// In your API/backend, ALWAYS verify admin status
const isUserAdmin = async (userId) => {
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', userId)
    .single();
  
  return !!data?.role;
};

// Use in API route guards
app.post('/api/admin/create-event', async (req, res) => {
  const userId = req.user.id;
  
  // Always check SERVER-SIDE
  if (!(await isUserAdmin(userId))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  // Process request
});
```

---

## Troubleshooting

### Admin Button Not Showing
- Check `onSwitchToAdmin` prop is passed to LoginScreen
- Verify admin-login screen is rendered conditionally

### Admin Login Fails
- Check email/password in Supabase auth
- Check row exists in admin_users table
- Check role is not NULL
- Verify JWT token is valid

### Role Not Populating
- Verify admin_users table query in `getUserAdminRole()`
- Check RLS policies allow reading admin_users
- Verify user ID matches in both tables

### Routing to Wrong Dashboard
- Check `enrichUserWithAdminInfo()` returns correct data
- Verify `phase` state updates correctly
- Check `isAdmin` flag is set properly

---

## Production Checklist

- [ ] Remove debug/test login buttons
- [ ] Secure admin database with proper RLS
- [ ] Implement 2FA for admin accounts
- [ ] Set up admin action logging
- [ ] Implement rate limiting on login
- [ ] Set up email verification
- [ ] Document admin onboarding process
- [ ] Test all admin permissions
- [ ] Set up monitoring/alerts
- [ ] Create admin user management UI

---

## File Summary

**New/Modified Files:**
1. `AdminLoginExample.js` - Complete implementation
2. `AdminLoginScreen.js` - Admin login UI (create new)
3. `lib/Auth.js` - Add admin helper functions (modify)
4. `App.js` - Add admin routing logic (modify)
5. `src/screens/LoginScreen.js` - Add admin button (modify)

**Database:**
1. Create `admin_users` table in Supabase
2. Add admin role checking logic

---

**Ready to implement? Start with AdminLoginExample.js as reference!**
