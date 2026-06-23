# Admin Pages - Reusable Components Library

This document outlines all the reusable components created within the admin pages that can be extracted and used in other parts of your application.

## Component Directory

### 1. StatCard Component

**File:** `AdminDashboard.js`

**Purpose:** Display a single metric with icon, value, and label

**Props:**
```javascript
{
  icon: string,        // Ionicon name
  label: string,       // Metric label
  value: number,       // Metric value
  color: string,       // Icon color
  colors: object,      // Theme colors
  styles: object,      // Stylesheet
}
```

**Usage Example:**
```javascript
<StatCard
  icon="calendar"
  label="Total Events"
  value={45}
  color={colors.primary}
  colors={colors}
  styles={styles}
/>
```

**Features:**
- Icon with background tint
- Large value display
- Label text
- Responsive sizing

---

### 2. ActionButton Component

**File:** `AdminDashboard.js`

**Purpose:** Quick action button with icon and label

**Props:**
```javascript
{
  icon: string,        // Ionicon name
  label: string,       // Button label
  onPress: function,   // Press handler
  colors: object,      // Theme colors
  styles: object,      // Stylesheet
}
```

**Usage Example:**
```javascript
<ActionButton
  icon="calendar-outline"
  label="Events"
  onPress={() => handleNavigate('events')}
  colors={colors}
  styles={styles}
/>
```

**Features:**
- Configurable icon
- Press state feedback
- Centered layout
- Flexible sizing

---

### 3. EventManageCard Component

**File:** `ManageEventsScreen.js`

**Purpose:** Display event information with management actions

**Props:**
```javascript
{
  event: {
    id, title, organizer, date, venue, image,
    registeredCount, capacity, category
  },
  colors: object,
  styles: object,
  onEdit: function,
  onDelete: function,
  onView: function,
}
```

**Usage Example:**
```javascript
<EventManageCard
  event={event}
  colors={colors}
  styles={styles}
  onEdit={() => handleEditEvent(event.id)}
  onDelete={() => handleDeleteEvent(event.id)}
  onView={() => handleViewEvent(event.id)}
/>
```

**Features:**
- Event image thumbnail
- Event details (date, venue, organizer)
- Registration count
- Past event badge
- Edit/Delete action buttons
- Meta information display

---

### 4. UserManageCard Component

**File:** `ManageUsersScreen.js`

**Purpose:** Display user information with management options

**Props:**
```javascript
{
  user: {
    id, fullName, email, accountType, department,
    level, roleDesignation, avatar
  },
  colors: object,
  styles: object,
  onView: function,
  onEdit: function,
  onDisable: function,
  onResetPassword: function,
}
```

**Usage Example:**
```javascript
<UserManageCard
  user={user}
  colors={colors}
  styles={styles}
  onView={() => handleViewUser(user.id)}
  onEdit={() => handleEditUser(user.id)}
  onDisable={() => handleDisableUser(user.id)}
  onResetPassword={() => handleResetPassword(user.id)}
/>
```

**Features:**
- User avatar with fallback
- User details (name, role, email)
- Expandable action menu
- Multiple action options
- Meta information

---

### 5. StatBadge Component

**File:** `ManageUsersScreen.js`

**Purpose:** Display stat counts in compact badge format

**Props:**
```javascript
{
  label: string,       // Stat label
  value: number,       // Stat value
  colors: object,      // Theme colors
  styles: object,      // Stylesheet
}
```

**Usage Example:**
```javascript
<StatBadge
  label="Total"
  value={250}
  colors={colors}
  styles={styles}
/>
```

**Features:**
- Bold value display
- Muted label
- Compact sizing
- Border styling

---

### 6. MetricCard Component

**File:** `AdminAnalyticsScreen.js`

**Purpose:** Display metrics with change indicators

**Props:**
```javascript
{
  icon: string,        // Ionicon name
  title: string,       // Metric title
  value: string,       // Metric value
  change: string,      // Change indicator (e.g., "+12%")
  colors: object,      // Theme colors
  styles: object,      // Stylesheet
}
```

**Usage Example:**
```javascript
<MetricCard
  icon="calendar"
  title="Total Events"
  value="45"
  change="+12%"
  colors={colors}
  styles={styles}
/>
```

**Features:**
- Icon with colored background
- Value and title
- Change percentage
- Colored up/down indicator
- Responsive grid layout

---

### 7. InsightRow Component

**File:** `AdminAnalyticsScreen.js`

**Purpose:** Display key insight with icon and value

**Props:**
```javascript
{
  icon: string,        // Ionicon name
  label: string,       // Insight label
  value: string,       // Insight value
  colors: object,      // Theme colors
}
```

**Usage Example:**
```javascript
<InsightRow
  icon="trending-up"
  label="Peak Registration Hour"
  value="2:00 PM - 3:00 PM"
  colors={colors}
/>
```

**Features:**
- Icon with color
- Horizontal layout
- Labeled and valued text
- Clean typography

---

### 8. Divider Component

**File:** `AdminAnalyticsScreen.js`

**Purpose:** Visual separator between sections

**Props:**
```javascript
{
  colors: object,      // Theme colors
}
```

**Usage Example:**
```javascript
<Divider colors={colors} />
```

**Features:**
- Thin separator line
- Theme-aware color
- Minimal styling

---

### 9. SettingToggle Component

**File:** `AdminSettingsScreen.js`

**Purpose:** Boolean setting with toggle switch

**Props:**
```javascript
{
  label: string,          // Setting label
  description: string,    // Setting description
  value: boolean,         // Current value
  onToggle: function,     // Toggle handler
  colors: object,         // Theme colors
  styles: object,         // Stylesheet
  warning: boolean,       // Optional warning indicator
}
```

**Usage Example:**
```javascript
<SettingToggle
  label="Auto-approve Events"
  description="Automatically approve new events"
  value={settings.autoApproveEvents}
  onToggle={() => handleToggle('autoApproveEvents')}
  colors={colors}
  styles={styles}
/>
```

**Features:**
- Label and description
- iOS-style toggle switch
- Color-coded based on value
- Warning support

---

### 10. SettingButton Component

**File:** `AdminSettingsScreen.js`

**Purpose:** Action button within settings with icon

**Props:**
```javascript
{
  icon: string,           // Ionicon name
  label: string,          // Button label
  description: string,    // Button description
  onPress: function,      // Press handler
  colors: object,         // Theme colors
  styles: object,         // Stylesheet
}
```

**Usage Example:**
```javascript
<SettingButton
  icon="key-outline"
  label="Change Password"
  description="Update your admin password"
  onPress={handleChangePassword}
  colors={colors}
  styles={styles}
/>
```

**Features:**
- Icon with background
- Label and description
- Pressable state
- Navigation arrow indicator

---

### 11. Section Component

**File:** `AdminSettingsScreen.js`

**Purpose:** Group related settings under a title

**Props:**
```javascript
{
  title: string,          // Section title
  children: ReactNode,    // Section content
  colors: object,         // Theme colors
  styles: object,         // Stylesheet
}
```

**Usage Example:**
```javascript
<Section title="Event Management" colors={colors} styles={styles}>
  <SettingToggle ... />
  <SettingToggle ... />
</Section>
```

**Features:**
- Section header
- Accent-colored title
- Card-like container
- Grouped children

---

## Extraction Guide

### To Extract a Component:

1. **Identify** the component function in its file
2. **Copy** the entire function including helper functions
3. **Extract** the associated StyleSheet (if using dynamic styles)
4. **Import** required dependencies:
   - `Ionicons` from "@expo/vector-icons"
   - `useAppTheme` from theme (if using colors)
   - React Native components
   - responsive utilities

### Example Extraction:

**Original:**
```javascript
// In AdminDashboard.js
function StatCard({ icon, label, value, color, colors, styles }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      {/* JSX */}
    </View>
  );
}
```

**Extracted to `components/StatCard.js`:**
```javascript
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../theme/theme";
import { scale, ms } from "../utils/responsive";

export default function StatCard({ icon, label, value, color }) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* JSX */}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      // styles
    },
  });
```

---

## Component Dependencies

### Required Imports (All Components)
```javascript
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../theme/theme";
import { scale, ms } from "../utils/responsive";
```

### React Native Imports
- **UI Components:** `View`, `Text`, `Pressable`, `Image`, `Switch`, `TextInput`
- **Lists:** `FlatList`, `SectionList`, `ScrollView`
- **Utilities:** `StyleSheet`, `Alert`

### External Dependencies
- `react` - hooks (useMemo, useState, useCallback)
- `@expo/vector-icons` - Ionicons
- `react-native-safe-area-context` - SafeAreaView, useSafeAreaInsets

---

## Component Customization

### Common Customizations

#### 1. Change Colors
```javascript
// In createStyles
const createStyles = (colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.primary,  // Change this
      borderColor: colors.border,
    },
  });
```

#### 2. Adjust Spacing
```javascript
// Update scale values
padding: scale(16),  // Adjust number (16 is pixels)
marginTop: scale(12),
```

#### 3. Modify Sizing
```javascript
// Update ms values for fonts
fontSize: ms(14),    // Adjust number (14 is base size)
fontWeight: "700",   // Change weight
```

#### 4. Change Icons
```javascript
// Replace icon name
<Ionicons name="settings" size={24} color={colors.primary} />
// → Different icon
<Ionicons name="cog" size={24} color={colors.primary} />
```

---

## Combining Components

### Example: Custom Metrics Section

```javascript
function CustomMetricsDisplay() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Metrics</Text>
      
      <View style={styles.grid}>
        <MetricCard
          icon="trending-up"
          title="Growth"
          value="25%"
          change="+5%"
          colors={colors}
          styles={styles}
        />
        <MetricCard
          icon="people"
          title="Users"
          value="1,250"
          change="+12%"
          colors={colors}
          styles={styles}
        />
      </View>
    </View>
  );
}
```

---

## Testing Components in Isolation

### Mock Data Examples

```javascript
// Event Mock
const mockEvent = {
  id: 1,
  title: "Tech Seminar",
  organizer: "CS dept",
  date: "2026-04-10",
  venue: "Hall A",
  image: "https://example.com/image.jpg",
  registeredCount: 150,
};

// User Mock
const mockUser = {
  id: 1,
  fullName: "John Doe",
  email: "john@example.com",
  accountType: "student",
  department: "CS",
  level: "300",
  avatar: "https://example.com/avatar.jpg",
};

// Analytics Mock
const mockAnalytics = {
  totalEvents: 45,
  totalUsers: 250,
  averageAttendance: 75,
};
```

---

## Performance Optimization

### For List Components (EventManageCard, UserManageCard)
- Use `FlatList` with `keyExtractor`
- Implement `useMemo` for computed properties
- Use `useCallback` for handlers
- Consider `useCallback` for onPress handlers

### For Static Components (StatCard, MetricCard)
- Memo-ize with `React.memo()`
- Cache StyleSheet calculations

### Example:
```javascript
import React, { memo } from "react";

const StatCard = memo(({ icon, label, value, color, colors, styles }) => {
  // Component code
});

export default StatCard;
```

---

## Accessibility Tips

1. **Always include labels** with icons
2. **Use semantic sizes** - keep touch targets 48x48 minimum
3. **Test contrast** - verify text is readable
4. **Provide alternatives** - don't rely on color alone
5. **Add descriptions** - use `accessible` and `accessibilityLabel` props

Example:
```javascript
<Pressable
  accessible={true}
  accessibilityLabel="Delete event"
  accessibilityRole="button"
>
  <Ionicons name="trash" size={20} />
</Pressable>
```

---

## Further Development

### Potential New Components
- **FilterChip** - Multi-select filter option
- **DataTable** - Sortable data table
- **StatusBadge** - Event/user status indicator
- **ProgressRing** - Circular progress indicator
- **ActivityIndicator** - Loading state
- **EmptyState** - Empty list state
- **ErrorBoundary** - Error handling
- **Skeleton** - Loading skeleton

---

## Support & Reference

- **Theme Docs:** `src/theme/theme.js`
- **Responsive Utils:** `src/utils/responsive.js`
- **Icon Gallery:** Use Ionicons official docs
- **React Native Docs:** https://reactnative.dev

---

**All components are production-ready and fully themed!**
