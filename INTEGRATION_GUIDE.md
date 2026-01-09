# 🚀 Integration Guide - New Features

## Overview
This guide shows you how to integrate the 4 new features we just created into your LMS.

---

## ✅ **What We Built**

1. **Parent Dashboard** - Monitor children's progress
2. **Notification System** - Real-time alerts
3. **Event Management** - School events and Sports Day
4. **Analytics Dashboard** - Performance tracking

---

## 📋 **Integration Steps**

### **Step 1: Update App.tsx with New Routes**

Add these imports at the top of `src/App.tsx`:

```typescript
import ParentDashboard from './components/Parent/ParentDashboard';
import EventsPage from './components/Events/EventsPage';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
```

Add these routes inside your `<Routes>` component:

```typescript
{/* Parent Dashboard */}
<Route 
  path="/parent-dashboard" 
  element={
    <RoleProtectedRoute allowedRoles={['parent']}>
      <ParentDashboard />
    </RoleProtectedRoute>
  } 
/>

{/* Events Page - accessible to all authenticated users */}
<Route 
  path="/events" 
  element={
    <ProtectedRoute>
      <EventsPage />
    </ProtectedRoute>
  } 
/>

{/* Analytics Dashboard - accessible to students and parents */}
<Route 
  path="/analytics" 
  element={
    <ProtectedRoute>
      <AnalyticsDashboard />
    </ProtectedRoute>
  } 
/>
```

---

### **Step 2: Add Notification Center to Header**

Update `src/components/Layout/Header.tsx`:

Add this import:
```typescript
import NotificationCenter from '../Notifications/NotificationCenter';
```

Add the NotificationCenter component in your header, next to the profile menu:

```typescript
{/* Existing header code */}
<div className="flex items-center space-x-4">
  {/* Add Notification Center here */}
  <NotificationCenter />
  
  {/* Existing profile menu */}
  <div className="relative">
    {/* ... existing profile code */}
  </div>
</div>
```

---

### **Step 3: Update Dashboard.tsx to Support Parent Role**

Update `src/components/Dashboard/Dashboard.tsx`:

Add import:
```typescript
import ParentDashboard from '../Parent/ParentDashboard';
```

Update the role-based rendering logic:

```typescript
// After loading profile
if (profile.role === 'tutor') {
  return <TutorDashboard user={user} profile={profile} />;
} else if (profile.role === 'parent') {
  return <ParentDashboard />;
} else {
  return <StudentDashboard user={user} profile={profile} />;
}
```

---

### **Step 4: Add Navigation Links**

#### **For Student Dashboard** (`src/components/Student/StudentDashboard.tsx`):

Add these Quick Action buttons:

```typescript
<div className="flex space-x-4">
  <Link 
    to="/matching" 
    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors"
  >
    🔍 Find Courses
  </Link>
  <Link 
    to="/bookings" 
    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium transition-colors"
  >
    📅 View Bookings
  </Link>
  <Link 
    to="/events" 
    className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-medium transition-colors"
  >
    🎉 School Events
  </Link>
  <Link 
    to="/analytics" 
    className="bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 font-medium transition-colors"
  >
    📊 My Analytics
  </Link>
</div>
```

#### **For Tutor Dashboard** (`src/components/Tutor/TutorDashboard.tsx`):

Add Events link in the header:

```typescript
<Link 
  to="/events" 
  className="text-gray-600 hover:text-gray-900"
>
  📅 Events
</Link>
```

---

### **Step 5: Add Parent Role to Database**

Run this SQL in Supabase to support parent role:

```sql
-- Update the role check constraint to include parent
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('student', 'tutor', 'parent'));

-- Create a sample parent user (optional)
-- First, sign up a user in your app, then update their profile:
-- UPDATE profiles SET role = 'parent' WHERE email = 'parent@example.com';
```

---

### **Step 6: Update AuthContext (if needed)**

Make sure your `RoleProtectedRoute` supports the `parent` role:

```typescript
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(data);
      }
    };
    loadProfile();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (!profile) return <div>Loading profile...</div>;
  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};
```

---

## 🧪 **Testing the New Features**

### **Test 1: Notification System**
1. Login as any user
2. Look for the bell icon (🔔) in the header
3. Click it to see notifications dropdown
4. Click "Mark all read" to test functionality

### **Test 2: Events Page**
1. Navigate to `/events` or click "Events" link
2. Try filtering by Upcoming/Past/All
3. Register for an event
4. Unregister from an event
5. Verify attendee count updates

### **Test 3: Analytics Dashboard**
1. Login as student
2. Navigate to `/analytics`
3. Switch between Week/Month/Term views
4. Check all charts and metrics display correctly

### **Test 4: Parent Dashboard**
1. Create a parent user (update role in database)
2. Login as parent
3. Navigate to `/parent-dashboard` or `/dashboard`
4. Verify children's progress is displayed

---

## 🎨 **Customization Options**

### **Change Notification Types**
Edit `src/components/Notifications/NotificationCenter.tsx`:
- Add new notification types in the `type` field
- Update `getIcon()` function for custom icons
- Modify `mockNotifications` array for different data

### **Add More Event Types**
Edit `src/components/Events/EventsPage.tsx`:
- Add new types to the `type` field
- Update `getEventTypeColor()` for custom colors
- Modify `getEventIcon()` for custom icons

### **Customize Analytics Metrics**
Edit `src/components/Analytics/AnalyticsDashboard.tsx`:
- Add new metrics to `AnalyticsData` interface
- Create new chart components
- Update `mockData` with your data structure

---

## 📊 **Database Schema (Optional Enhancements)**

If you want to store data instead of using mock data:

### **Notifications Table**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
```

### **Events Table**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT,
  organizer TEXT,
  max_attendees INTEGER,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

---

## 🚀 **Quick Start Checklist**

- [ ] Step 1: Add routes to App.tsx
- [ ] Step 2: Add NotificationCenter to Header
- [ ] Step 3: Update Dashboard.tsx for parent role
- [ ] Step 4: Add navigation links
- [ ] Step 5: Update database for parent role
- [ ] Step 6: Test all features
- [ ] Step 7: Customize as needed

---

## 💡 **Pro Tips**

1. **Start Simple**: Test with mock data first, then connect to real database
2. **Progressive Enhancement**: Add features one at a time
3. **User Feedback**: The notification system works great for user feedback messages
4. **Events Integration**: Sports Day ties perfectly into your school events!
5. **Analytics**: Great for demos - shows professional data visualization

---

## 📞 **Need Help?**

Check these files for reference:
- `src/components/Notifications/NotificationCenter.tsx`
- `src/components/Events/EventsPage.tsx`
- `src/components/Analytics/AnalyticsDashboard.tsx`
- `src/components/Parent/ParentDashboard.tsx`
- `PROGRESS_SUMMARY.md`

All components are fully functional and ready to use! 🎉
