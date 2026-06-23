# Admin Pages Documentation

## Overview

This documentation covers the newly created admin pages that provide comprehensive administrative functionality for the events management application.

## Generated Files

### Screen Components

1. **AdminDashboard.js** - Main admin overview dashboard
   - Stats grid showing total events, users, registrations, and announcements
   - Quick action buttons for easy navigation
   - Recent events and users preview
   - Props: `stats`, `recentEvents`, `recentUsers`, callback handlers

2. **ManageEventsScreen.js** - Event management interface
   - Search and filter events by status (all, upcoming, past)
   - View all events with details
   - Edit and delete events with confirmation dialogs
   - Event card displays date, venue, registration count, and status
   - Props: `events`, callback handlers for CRUD operations

3. **ManageUsersScreen.js** - User management interface
   - Search and filter users by role (all, student, staff)
   - Display user statistics (total, students, staff)
   - View user details with avatar
   - Actions: Edit user, reset password, disable user
   - Expandable action menu for each user
   - Props: `users`, callback handlers for user operations

4. **AdminAnalyticsScreen.js** - Analytics and reporting
   - Key metrics display (total events, users, registrations, avg attendance)
   - Events by category chart with progress bars
   - Top events ranking
   - Engagement insights (peak hours, popular venues, avg event size)
   - PDF export functionality
   - Props: `analytics`, callback handlers for reporting

5. **AdminSettingsScreen.js** - Admin configuration
   - Event management settings (auto-approve, require description, max events)
   - Notification settings
   - System maintenance mode toggle
   - Security: password change, 2FA setup
   - Account information and logout
   - Props: `settings`, callback handlers for configuration

### Navigation

6. **AdminNavigator.js** - Navigation controller for admin screens
   - Manages navigation between different admin screens
   - Similar pattern to existing AppNavigator
   - Supports dynamic screen switching

## Integration Guide

### 1. Basic Setup in App.js

```javascript
import AdminNavigator from "./src/navigation/AdminNavigator";

// In your main App component:
const [adminScreen, setAdminScreen] = useState("dashboard");

// Render admin interface when user is admin
if (isAdminUser) {
  return (
    <AdminNavigator
      activeScreen={adminScreen}
      onNavigate={setAdminScreen}
      dashboardProps={{
        stats: adminStats,
        recentEvents: recentEvents,
        recentUsers: recentUsers,
        onManageEvents: () => setAdminScreen("events"),
        onManageUsers: () => setAdminScreen("users"),
        onManageAnnouncements: () => setAdminScreen("announcements"),
        onViewAnalytics: () => setAdminScreen("analytics"),
        onBack: () => setAdminScreen("dashboard"),
      }}
      manageEventsProps={{
        events: allEvents,
        onBack: () => setAdminScreen("dashboard"),
        onCreateEvent: handleCreateEvent,
        onEditEvent: handleEditEvent,
        onDeleteEvent: handleDeleteEvent,
        onViewEventDetails: handleViewEventDetails,
      }}
      // ... other screen props
    />
  );
}
```

### 2. Data Structure

#### Admin Stats Object
```javascript
{
  totalEvents: number,
  totalUsers: number,
  totalRegistrations: number,
  activeAnnouncements: number,
}
```

#### Analytics Object
```javascript
{
  totalEvents: number,
  totalUsers: number,
  totalRegistrations: number,
  averageAttendance: number,
  eventsByCategory: { category: count, ... },
  usersByDepartment: { department: count, ... },
  registrationTrend: [],
  topEvents: [
    {
      id: number,
      title: string,
      registeredCount: number,
      rating: number,
    }
  ],
}
```

#### Event Object (for admin)
```javascript
{
  id: number,
  title: string,
  organizer: string,
  date: string,
  venue: string,
  image?: string,
  registeredCount: number,
  capacity?: number,
  category?: string,
}
```

#### User Object (for admin)
```javascript
{
  id: number,
  fullName: string,
  email: string,
  accountType: "student" | "staff",
  department?: string,
  level?: string,
  roleDesignation?: string,
  avatar?: string,
}
```

#### Settings Object
```javascript
{
  autoApproveEvents: boolean,
  requireEventDescription: boolean,
  maxEventsPerUser: number,
  sendNotifications: boolean,
  maintenanceMode: boolean,
}
```

### 3. Handler Functions

#### Dashboard Handlers
```javascript
{
  onManageEvents: () => void,
  onManageUsers: () => void,
  onManageAnnouncements: () => void,
  onViewAnalytics: () => void,
  onBack: () => void,
}
```

#### Event Management Handlers
```javascript
{
  onBack: () => void,
  onCreateEvent: () => void,
  onEditEvent: (eventId: number) => void,
  onDeleteEvent: (eventId: number) => void,
  onViewEventDetails: (eventId: number) => void,
}
```

#### User Management Handlers
```javascript
{
  onBack: () => void,
  onViewUserDetails: (userId: number) => void,
  onEditUser: (userId: number) => void,
  onDisableUser: (userId: number) => void,
  onResetPassword: (userId: number) => void,
}
```

#### Analytics Handlers
```javascript
{
  onBack: () => void,
  onExportReport: () => void,
}
```

#### Settings Handlers
```javascript
{
  onBack: () => void,
  onUpdateSettings: (settings: object) => void,
  onChangePassword: (currentPassword: string) => void,
  onLogout: () => void,
}
```

## Design Features

### Theme Integration
- All screens use `useAppTheme()` hook for consistent theming
- Supports light and dark modes
- Uses the existing color palette from theme.js

### Responsive Design
- Uses `scale()` function for layout sizing
- Uses `ms()` function for font sizing with moderation
- Adapts to different screen sizes automatically

### UI Patterns Used
- Consistent header with back button
- Search and filter functionality
- Card-based layouts
- Action buttons with icons
- Empty state messages
- Progress bars and data visualization
- List items with metadata
- Toggle switches for settings

### Icons
- Uses Ionicons from @expo/vector-icons
- Consistent icon sizing and colors
- Semantically appropriate icons for each section

## Usage Examples

### Display Admin Dashboard
```javascript
<AdminDashboard
  stats={{
    totalEvents: 45,
    totalUsers: 250,
    totalRegistrations: 1200,
    activeAnnouncements: 3,
  }}
  recentEvents={events.slice(0, 3)}
  recentUsers={users.slice(0, 3)}
  onManageEvents={() => console.log("Manage Events")}
  onManageUsers={() => console.log("Manage Users")}
  onManageAnnouncements={() => console.log("Manage Announcements")}
  onViewAnalytics={() => console.log("View Analytics")}
  onBack={() => console.log("Back")}
/>
```

### Manage Events with Search
```javascript
<ManageEventsScreen
  events={allEvents}
  onBack={() => navigate('dashboard')}
  onCreateEvent={() => navigate('createEvent')}
  onEditEvent={(id) => handleEditEvent(id)}
  onDeleteEvent={(id) => handleDeleteEvent(id)}
  onViewEventDetails={(id) => navigate('eventDetails', id)}
/>
```

### Manage Users with Filters
```javascript
<ManageUsersScreen
  users={allUsers}
  onBack={() => navigate('dashboard')}
  onViewUserDetails={(id) => navigate('userDetails', id)}
  onEditUser={(id) => handleEditUser(id)}
  onDisableUser={(id) => handleDisableUser(id)}
  onResetPassword={(id) => handleResetPassword(id)}
/>
```

### View Analytics
```javascript
<AdminAnalyticsScreen
  analytics={{
    totalEvents: 45,
    totalUsers: 250,
    totalRegistrations: 1200,
    averageAttendance: 75,
    eventsByCategory: {
      Seminar: 15,
      Workshop: 12,
      Sports: 18,
    },
    topEvents: [
      { id: 1, title: "Tech Summit", registeredCount: 250, rating: 4.8 },
      { id: 2, title: "Football", registeredCount: 180, rating: 4.5 },
    ],
  }}
  onBack={() => navigate('dashboard')}
  onExportReport={() => handleExport()}
/>
```

### Admin Settings
```javascript
<AdminSettingsScreen
  settings={{
    autoApproveEvents: false,
    requireEventDescription: true,
    maxEventsPerUser: 5,
    sendNotifications: true,
    maintenanceMode: false,
  }}
  onBack={() => navigate('dashboard')}
  onUpdateSettings={(settings) => saveSettings(settings)}
  onChangePassword={(pwd) => changePassword(pwd)}
  onLogout={() => logout()}
/>
```

## Customization

### Styling
All screens use inline `StyleSheet.create()` with dynamic colors from theme. To customize:

1. **Colors**: Modify theme.js to change the color palette
2. **Spacing**: Adjust `scale()` values in StyleSheet definitions
3. **Typography**: Adjust `ms()` values for font sizes

### Functionality
To extend functionality:

1. Add new stats to dashboard metrics
2. Add new filters to event/user management screens
3. Add new chart types to analytics screen
4. Add new settings categories to settings screen

### Components
To create similar reusable components:

1. **StatCard**: For displaying key metrics
2. **ActionButton**: For admin quick actions
3. **EventManageCard**: For event listings
4. **UserManageCard**: For user listings
5. **SettingToggle**: For boolean settings
6. **Section**: For grouping related settings

## Performance Considerations

- All screens use `useMemo()` for filtered/computed data
- FlatList is used for long lists (ManageEventsScreen, ManageUsersScreen)
- ScrollView is used for short or mixed content
- Search and filters are optimized with memoization

## Accessibility

- All interactive elements are properly sized (min 48px touch targets)
- Icons have associated text labels
- Color is not the only indicator (includes text/icons)
- Good contrast ratios for text
- Semantic HTML-like structure with proper text hierarchy

## Navigation Flow

```
AdminNavigator
├── AdminDashboard (home)
│   ├── → ManageEventsScreen (onManageEvents)
│   ├── → ManageUsersScreen (onManageUsers)
│   ├── → AdminAnalyticsScreen (onViewAnalytics)
│   └── → AdminSettingsScreen (onManageAnnouncements)
├── ManageEventsScreen
│   ├── → AdminDashboard (onBack)
│   ├── → CreateEventScreen (onCreateEvent)
│   └── → EditEventScreen (onEditEvent)
├── ManageUsersScreen
│   ├── → AdminDashboard (onBack)
│   ├── → UserDetailsScreen (onViewUserDetails)
│   └── → EditUserScreen (onEditUser)
├── AdminAnalyticsScreen
│   └── → AdminDashboard (onBack)
└── AdminSettingsScreen
    └── → AdminDashboard (onBack)
```

## Future Enhancements

Potential features to add:

1. **Event Moderation**: Approve/reject pending events
2. **User Roles**: Assign different admin levels (superadmin, moderator, etc.)
3. **Activity Logs**: Track all admin actions
4. **Backup/Restore**: Data backup functionality
5. **Email Templates**: Customize notification emails
6. **Advanced Reporting**: Custom report builder
7. **Bulk Operations**: Bulk edit/delete events or users
8. **Announcements Management**: Full announcement CRUD
9. **API Integrations**: Connect to external services
10. **Audit Trail**: Complete action history with timestamps

## Troubleshooting

### Common Issues

1. **Theme colors not updating**: Ensure `useAppTheme()` is called and theme provider wraps the component
2. **Data not showing**: Check that data props are being passed and have correct structure
3. **Search not working**: Verify search text is being captured in state
4. **Sluggish list performance**: Consider paginating large lists or using FlatList

### Testing

Test the following scenarios:
- Switching between admin screens
- Searching and filtering
- Creating/editing/deleting items
- Settings changes persisting
- Dark mode compatibility
- Landscape orientation
- Different text lengths (truncation)
- Empty states

## Support

For issues or questions, refer to:
- Theme configuration: see `src/theme/theme.js`
- Responsive utilities: see `src/utils/responsive.js`
- Component patterns: see existing screens in `src/screens/`
