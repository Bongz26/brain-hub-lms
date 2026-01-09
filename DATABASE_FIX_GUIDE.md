# Database Fix Guide - Subject Selection Issue

## 🚨 Problem
You're unable to select subjects when creating a course as a tutor. This is because the `subjects` table doesn't exist in your Supabase database.

## 🔧 Solution

### Option 1: Run SQL Script (Recommended)

1. **Open your Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project
   - Go to the **SQL Editor** tab

2. **Run the Database Setup Script**
   - Copy the contents of `database_setup.sql` file
   - Paste it into the SQL Editor
   - Click **Run** to execute the script

3. **Verify the Setup**
   - Go to the **Table Editor** tab
   - You should see a `subjects` table with 10 subjects
   - Check that other tables exist: `courses`, `profiles`, `bookings`, etc.

### Option 2: Use the Demo Setup Page

1. **Start your app**: `npm start`
2. **Go to Demo Setup**: Navigate to `/demo-setup`
3. **Click "Check DB Status"**: This will show you which tables exist
4. **Click "Setup Demo Data"**: This will create the subjects table and populate it

### Option 3: Manual Database Setup

If the above options don't work, you can manually create the subjects table:

```sql
-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  grade_levels INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert subjects
INSERT INTO subjects (id, name, description, grade_levels) VALUES
('math', 'Mathematics', 'Mathematical concepts and problem solving', ARRAY[9, 10, 11, 12]),
('science', 'Science', 'General science concepts', ARRAY[9, 10, 11, 12]),
('english', 'English', 'English language and literature', ARRAY[9, 10, 11, 12]),
('history', 'History', 'Historical events and analysis', ARRAY[9, 10, 11, 12]),
('physics', 'Physics', 'Physical sciences and mechanics', ARRAY[10, 11, 12]),
('chemistry', 'Chemistry', 'Chemical reactions and properties', ARRAY[10, 11, 12]),
('biology', 'Biology', 'Life sciences and organisms', ARRAY[9, 10, 11, 12]),
('art', 'Art', 'Visual arts and creativity', ARRAY[9, 10, 11, 12]),
('music', 'Music', 'Musical theory and performance', ARRAY[9, 10, 11, 12]),
('computer-science', 'Computer Science', 'Programming and computer concepts', ARRAY[9, 10, 11, 12])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR SELECT USING (true);
```

## 🧪 Testing the Fix

After setting up the database:

1. **Login as a tutor**: Use `sarah.math@brainhub.com` / `demo123`
2. **Go to Course Management**: Click on the "Course Management" tab
3. **Create New Course**: Click "Create New Course"
4. **Check Subject Dropdown**: You should now see all 10 subjects available

## 🔍 Debugging

If you're still having issues:

1. **Check Browser Console**: Open Developer Tools (F12) and look for any error messages
2. **Check Network Tab**: Look for failed API calls to Supabase
3. **Verify Supabase Connection**: Make sure your `.env` file has the correct Supabase URL and key
4. **Check Database Status**: Use the "Check DB Status" button in `/demo-setup`

## 📋 Expected Subjects

After the fix, you should see these subjects in the dropdown:
- Mathematics
- Science
- English
- History
- Physics
- Chemistry
- Biology
- Art
- Music
- Computer Science

## 🎯 Next Steps

Once the subjects are working:
1. Create a test course with a subject selected
2. Verify the course appears in your course list
3. Test the full course creation workflow
4. Try the demo scenarios from the demo guide

---

**Need Help?** Check the browser console for error messages or use the database status checker in the demo setup page.
