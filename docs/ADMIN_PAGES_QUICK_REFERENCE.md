# Admin Pages - Quick Reference Guide

## 📁 Files Created

### Screen Components (in `src/screens/`)
1. **AdminDashboard.js** - Main hub with stats and quick actions
2. **ManageEventsScreen.js** - Event management and administration
3. **ManageUsersScreen.js** - User management and administration
4. **AdminAnalyticsScreen.js** - Analytics, insights, and reporting
5. **AdminSettingsScreen.js** - Configuration and admin settings

### Navigation (in `src/navigation/`)
6. **AdminNavigator.js** - Navigation controller for admin screens

### Documentation
7. **ADMIN_PAGES_DOCUMENTATION.md** - Comprehensive documentation
8. **AdminIntegration.example.js** - Integration example with mock data

---

## 🎯 Screen Overview

| Screen | Purpose | Key Features |
|--------|---------|--------------|
| **AdminDashboard** | Admin overview | Stats grid, Quick actions, Recent items |
| **ManageEventsScreen** | Event administration | Search, Filter, Edit, Delete, View details |
| **ManageUsersScreen** | User administration | Search, Filter, Edit, Disable, Reset password |
| **AdminAnalyticsScreen** | Analytics & insights | Metrics, Charts, Top events, Engagement data |
| **AdminSettingsScreen** | Configuration | Event settings, Notifications, System, Security |

---

## 🎨 Design Features

✅ **Consistent Theme** - Uses app-wide color palette and styling
✅ **Responsive Layout** - Adapts to all screen sizes
✅ **Dark Mode Support** - Fully compatible with theme system
✅ **Icons** - Semantic Ionicons throughout
✅ **Accessibility** - Proper touch targets, labels, contrast

---

## 🔧 Component Props Summary

### AdminDashboard
```javascript
{
  stats: { totalEvents, totalUsers, totalRegistrations, activeAnnouncements },
  recentEvents: [],
  recentUsers: [],
  onManageEvents: () => {},
  onManageUsers: () => {},
  onManageAnnouncements: () => {},
  onViewAnalytics: () => {},
  onBack: () => {},
}
```

### ManageEventsScreen
```javascript
{
  events: [],
  onBack: () => {},
  onCreateEvent: () => {},
  onEditEvent: (id) => {},
  onDeleteEvent: (id) => {},
  onViewEventDetails: (id) => {},
}
```

### ManageUsersScreen
```javascript
{
  users: [],
  onBack: () => {},
  onViewUserDetails: (id) => {},
  onEditUser: (id) => {},
  onDisableUser: (id) => {},
  onResetPassword: (id) => {},
}
```

### AdminAnalyticsScreen
```javascript
{
  analytics: {
    totalEvents, totalUsers, totalRegistrations, averageAttendance,
    eventsByCategory: {}, usersByDepartment: {}, 
    registrationTrend: [], topEvents: []
  },
  onBack: () => {},
  onExportReport: () => {},
}
```

### AdminSettingsScreen
```javascript
{
  settings: {
    autoApproveEvents, requireEventDescription, maxEventsPerUser,
    sendNotifications, maintenanceMode
  },
  onBack: () => {},
  onUpdateSettings: (settings) => {},
  onChangePassword: (pwd) => {},
  onLogout: () => {},
}
```

---

## 📊 Admin Dashboard Screens

### 1️⃣ Dashboard Screen
**Icon:** dashboard | **Route:** `/admin`

**Features:**
- 4 key stat cards (Events, Users, Registrations, Announcements)
- 4 quick action buttons (Events, Users, Announce, Analytics)
- Recent events preview (3 items)
- Recent users preview (3 items)

**Typical Flow:**
```
Dashboard → Click Actions → Navigate to specific admin screen
         └→ Click Recent Items → View details
```

### 2️⃣ Manage Events Screen
**Icon:** list | **Route:** `/admin/events`

**Features:**
- **Search:** Real-time text search by title/organizer
- **Filter:** By status (All, Upcoming, Past)
- **Display:** Event cards with image, meta, and actions
- **Actions:** Edit & Delete on each event
- **Empty State:** "No events found" message

**Data Shown per Event:**
- Title, Organizer name
- Date formatted
- Venue location
- Registered count
- Status badge (if past event)

**Typical Flow:**
```
List → Search/Filter → Select Event → Edit/Delete/View
```

### 3️⃣ Manage Users Screen
**Icon:** people | **Route:** `/admin/users`

**Features:**
- **Stats Bar:** Total, Students, Staff counts
- **Search:** By name, email, or department
- **Filter:** By role (All, Student, Staff)
- **Display:** User cards with avatar and details
- **Expandable Actions:** Edit, Reset Password, Disable

**Data Shown per User:**
- Avatar or initials
- Full name
- Role and department/designation
- Email address

**Typical Flow:**
```
List → Search/Filter → Select User → Expand Actions → Choose Action
```

### 4️⃣ Analytics & Reports Screen
**Icon:** analytics | **Route:** `/admin/analytics`

**Features:**
- **4 Metric Cards:** Total events, users, registrations, avg attendance
- **Category Chart:** Events grouped by category with progress bars
- **Top Events:** Ranking of most registered events
- **Engagement Insights:** Peak hours, popular venues, avg size
- **Export:** PDF report generation

**Charts & Visualizations:**
- Progress bars for category distribution
- Top events ranking with ratings
- Key insights with icons

**Typical Flow:**
```
Analytics → View Metrics/Charts → Scroll for Insights → Export Report
```

### 5️⃣ Settings Screen
**Icon:** settings | **Route:** `/admin/settings`

**Features:**
- **Event Management:** Auto-approve, Require description, Max events
- **Notifications:** Toggle notifications on/off
- **System:** Maintenance mode toggle
- **Security:** Change password, 2FA setup
- **Account:** Version info, Logout

**Settings Categories:**
- Event Management (3 settings)
- Notifications (1 setting)
- System (1 setting)
- Security & Account (2 actions)
- About (1 info)

**Typical Flow:**
```
Settings → Adjust Toggles/Values → Changes Auto-Save
        → Change Password/2FA
        → Logout
```

---

## 🚀 Quick Start Integration

### Step 1: Import in App.js
```javascript
import AdminNavigator from './src/navigation/AdminNavigator';
```

### Step 2: Check Admin Status
```javascript
if (user?.accountType === 'admin' || user?.isAdmin) {
  return <AdminNavigator {...props} />;
}
```

### Step 3: Pass Data & Handlers
```javascript
<AdminNavigator
  activeScreen="dashboard"
  dashboardProps={{ stats, recentEvents, recentUsers, ... }}
  manageEventsProps={{ events, ... }}
  manageUsersProps={{ users, ... }}
  analyticsProps={{ analytics, ... }}
  settingsProps={{ settings, ... }}
/>
```

---

## 📱 Responsive Breakpoints

- **Mobile:** 320px - 480px (default optimization)
- **Tablet:** 768px - 1024px (supported)
- **iPad:** 1024px+ (supported)
- **Landscape:** All orientations supported

All designs use `scale()` for layout units and `ms()` for typography.

---

## 🎨 Color Usage

| Element | Color | Purpose |
|---------|-------|---------|
| Primary buttons/icons | `colors.primary` | Primary actions |
| Card backgrounds | `colors.surface` | Content containers |
| Text | `colors.text` | Primary text |
| Muted text | `colors.textMuted` | Secondary text |
| Borders | `colors.border` | Dividers |
| Error actions | `colors.error` | Destructive actions |
| Accents | `colors.accent` | Highlights |

---

## 🔐 Permissions & Security

### Suggested Role-Based Access:
- **Admin:** Full access to all screens
- **Moderator:** Events & Analytics only
- **Editor:** Events management only
- **Viewer:** Analytics & Dashboard only

### Implement in handlers:
```javascript
const canManageUsers = user.role === 'admin';
const canApproveEvents = ['admin', 'moderator'].includes(user.role);
```

---

## 🧪 Testing Scenarios

### Dashboard Tests
- [ ] All 4 stats display correctly
- [ ] Quick action buttons navigate
- [ ] Recent items populate
- [ ] Dark mode toggle works

### Event Management Tests
- [ ] Search filters matches
- [ ] Status filter works
- [ ] Edit dialog opens
- [ ] Delete confirmation appears
- [ ] Empty state displays

### User Management Tests
- [ ] Stats update with filter
- [ ] Search finds users
- [ ] Action menu expands
- [ ] Actions trigger correctly
- [ ] User info displays

### Analytics Tests
- [ ] Metrics calculate correctly
- [ ] Charts render
- [ ] Top events sort by registrations
- [ ] Export button works
- [ ] Insights are relevant

### Settings Tests
- [ ] Toggles persist
- [ ] Text input accepts numbers
- [ ] Password change works
- [ ] Logout clears session
- [ ] Mode affects all screens

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Colors not updating | Ensure theme provider wraps admin screens |
| Search not working | Check search state is being set and memoized |
| Lists not updating | Verify data is being passed and arrays update |
| Styling looks off | Check `scale()` is defined in responsive.js |
| Icons not showing | Ensure @expo/vector-icons is installed |
| Performance slow | Check FlatList is used for long lists |

---

## 📚 File Structure

```
src/
├── screens/
│   ├── AdminDashboard.js
│   ├── ManageEventsScreen.js
│   ├── ManageUsersScreen.js
│   ├── AdminAnalyticsScreen.js
│   └── AdminSettingsScreen.js
├── navigation/
│   └── AdminNavigator.js
└── theme/
    └── theme.js (already exists)

root/
├── ADMIN_PAGES_DOCUMENTATION.md
└── AdminIntegration.example.js
```

---

## 🔗 Navigation Structure

```
App
├── User Role Check
│   ├── (Admin) → AdminNavigator
│   │   ├── AdminDashboard
│   │   ├── ManageEventsScreen
│   │   ├── ManageUsersScreen
│   │   ├── AdminAnalyticsScreen
│   │   └── AdminSettingsScreen
│   └── (Regular) → AppNavigator
```

---

## 💡 Pro Tips

1. **Cache Analytics**: Store analytics data with timestamps to reduce recalculation
2. **Pagination**: Add pagination to event/user lists for better performance
3. **Search Debounce**: Add debounce to search inputs for large datasets
4. **Bulk Actions**: Add checkboxes for bulk edit/delete operations
5. **Audit Logs**: Log all admin actions for security and compliance
6. **Notifications**: Real-time admin notifications for new registrations
7. **Exports**: Support multiple formats (PDF, CSV, Excel)
8. **History**: Track changes to events and users with timestamps

---

## 📖 Documentation

- **Full Docs:** See `ADMIN_PAGES_DOCUMENTATION.md`
- **Examples:** See `AdminIntegration.example.js`
- **Integration:** Copy patterns from existing screens in `src/screens/`

---

## ✨ Features Summary

- ✅ 5 comprehensive admin screens
- ✅ Theme-integrated design
- ✅ Responsive layouts
- ✅ Dark mode support
- ✅ Search & filtering
- ✅ Analytics & charts
- ✅ User management
- ✅ Event management
- ✅ Settings configuration
- ✅ Action confirmations
- ✅ Empty states
- ✅ Loading states
- ✅ Error handling

---

**Ready to integrate? Start with `AdminIntegration.example.js` as reference!**
