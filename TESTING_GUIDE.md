# 🧪 Testing Guide - Brain Hub LMS

## 📋 **Current Status**
- ✅ App compiling successfully
- ✅ 4 new features created (not yet integrated)
- ⚠️ Waiting for port selection (Y/n prompt)
- ⚠️ Database schema needs fixing for bookings

---

## 🚀 **Step 1: Start the Application**

The terminal is asking: `Would you like to run the app on another port instead? » (Y/n)`

**Action**: Type `Y` and press Enter to run on an alternate port (like 3001)

---

## 🧪 **Step 2: Test Existing Features**

### **Test 2.1: Login & Authentication**

1. **Open your browser** to `http://localhost:3001` (or whatever port it shows)
2. **Login as Student**:
   - Email: `mashobanephone@gmail.com`
   - Password: `demo123`
3. **Verify**:
   - ✅ Successfully redirected to dashboard
   - ✅ Student dashboard displays
   - ✅ Profile name shows correctly in header

4. **Logout and Login as Tutor**:
   - Email: `bongzdondas@gmail.com`
   - Password: `demo123`
5. **Verify**:
   - ✅ Tutor dashboard displays
   - ✅ Different UI than student
   - ✅ Course management tab visible

---

### **Test 2.2: Course Management (Tutor)**

While logged in as tutor:

1. **Navigate to "Course Management" tab**
2. **Click "Create New Course"**
3. **Fill in course details**:
   - Title: "Test Course"
   - Description: "Testing course creation"
   - Subject: Select "Mathematics" or "English"
   - Grade: 10
   - Price: 100
   - Max Students: 20
   - Duration: 4 weeks
4. **Click "Create Course"**
5. **Verify**:
   - ✅ Course appears in the list
   - ✅ No errors in console
   - ✅ Success message appears

**⚠️ Known Issue**: If you get "Could not find subject column" error, you need to run the database fix (see Step 4 below)

---

### **Test 2.3: Course Discovery (Student)**

Logout and login as student (`mashobanephone@gmail.com` / `demo123`):

1. **Click "Find Courses"** or navigate to `/matching`
2. **Verify**:
   - ✅ Courses display
   - ✅ "Show All Courses" button works
   - ✅ Search filters work (optional - may require data)
3. **Click on any course card**
4. **Verify**:
   - ✅ Course details show
   - ✅ "Book Session" button visible

---

### **Test 2.4: Session Booking (CRITICAL TEST)**

Still on a course detail page:

1. **Click "Book Session" button**
2. **NEW INTERFACE SHOULD APPEAR**:
   - ✅ Date selection buttons (next 14 days)
   - ✅ Time selection buttons (9 AM - 5 PM)
   - ✅ Duration dropdown
   - ✅ Notes textarea
3. **Select a date** (click any date button)
   - ✅ Button turns blue when selected
4. **Select a time** (click any time button)
   - ✅ Button turns green when selected
5. **Click "Confirm Time"**
   - ✅ Green confirmation box appears showing selected session
6. **Click "Book Session"**

**Expected Outcomes**:
- ❌ **IF DATABASE NOT FIXED**: Error message about missing `end_time` column
- ✅ **IF DATABASE FIXED**: "Session booked successfully!" message

**Check Browser Console (F12)** for detailed logs:
- Look for: `"Attempting to book session with data:"`
- Look for: `"Database error details:"` or `"Booking created successfully:"`

---

## 🔧 **Step 3: Fix Database (If Booking Fails)**

If the booking test failed, run this SQL in **Supabase SQL Editor**:

```sql
-- Fix the bookings table schema
DROP TABLE IF EXISTS bookings CASCADE;

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  tutor_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON bookings
  FOR ALL USING (auth.uid() IS NOT NULL);
```

**After running SQL**:
1. Refresh your browser
2. Try booking again
3. Should now work! ✅

---

## 🎯 **Step 4: Test New Features (Manual URLs)**

Since the new features aren't integrated yet, test them by navigating directly:

### **Test 4.1: Parent Dashboard**
1. **Navigate to**: `http://localhost:3001/parent-dashboard`
2. **Expected**:
   - ❌ May show "Not authorized" (parent role not set up yet)
   - OR ✅ Dashboard displays with mock children data

### **Test 4.2: Events Page**
1. **Navigate to**: `http://localhost:3001/events`
2. **Expected**:
   - ❌ 404 Not Found (route not added yet)
   - Once integrated: ✅ Events page with Sports Day, Science Fair, etc.

### **Test 4.3: Analytics Dashboard**
1. **Navigate to**: `http://localhost:3001/analytics`
2. **Expected**:
   - ❌ 404 Not Found (route not added yet)
   - Once integrated: ✅ Analytics page with charts and metrics

### **Test 4.4: Notifications (In Header)**
1. **Look for bell icon (🔔) in the header**
2. **Expected**:
   - ❌ Not visible (not added to header yet)
   - Once integrated: ✅ Bell icon with notification count

---

## 📊 **Test Results Checklist**

### **✅ Working Right Now:**
- [ ] Login/Logout
- [ ] Student Dashboard
- [ ] Tutor Dashboard
- [ ] Course Creation (tutor)
- [ ] Course Listing (student)
- [ ] Course Search/Filter
- [ ] Profile Management
- [ ] New Booking UI (date/time buttons)

### **⚠️ Needs Database Fix:**
- [ ] Booking Sessions (needs `bookings` table fix)

### **⏳ Not Integrated Yet:**
- [ ] Parent Dashboard (route not added)
- [ ] Events Page (route not added)
- [ ] Analytics Dashboard (route not added)
- [ ] Notification Center (not added to header)

---

## 🐛 **Common Issues & Fixes**

### **Issue 1: "Could not find subject column"**
**Fix**: Run `fix_courses_table.sql` in Supabase to add the subject column to courses table.

### **Issue 2: "Could not find end_time column"**
**Fix**: Run the database fix SQL from Step 3 above.

### **Issue 3: "404 Not Found" for new features**
**Fix**: New features need to be integrated into App.tsx (see INTEGRATION_GUIDE.md).

### **Issue 4: No courses showing**
**Fix**: Login as tutor first and create a course, then login as student to see it.

### **Issue 5: Port already in use**
**Fix**: Press `Y` when asked to run on another port.

---

## 📝 **Testing Notes**

Record your results here:

### **What Works**:
```
[Write your findings here]
```

### **What Doesn't Work**:
```
[Write issues here]
```

### **Browser Console Errors**:
```
[Paste any errors here]
```

---

## 🎯 **Next Steps After Testing**

Based on your test results:

1. **If booking works**: ✅ Proceed to integrate new features
2. **If booking fails**: 🔧 Fix database first
3. **If course creation fails**: 🔧 Fix courses table schema
4. **If everything works**: 🎉 Ready to integrate new features!

---

## 🚀 **Quick Test Commands**

Open browser console (F12) and try these:

### **Check if Supabase is connected**:
```javascript
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
```

### **Check current user**:
```javascript
// Should show user object if logged in
```

### **Test notification (after integration)**:
```javascript
// Will work after NotificationCenter is added
```

---

## 📞 **Get Help**

If you encounter issues:

1. **Check browser console** (F12) for errors
2. **Check terminal** for compilation errors
3. **Check Supabase dashboard** for database issues
4. **Review documentation**:
   - `PROGRESS_SUMMARY.md` - What we've built
   - `INTEGRATION_GUIDE.md` - How to integrate
   - `NEW_FEATURES_SUMMARY.md` - Feature details

---

**Happy Testing!** 🎉

Start by typing `Y` in the terminal to run the app on an alternate port!
