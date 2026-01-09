-- Simple booking setup that works with your existing structure
-- This creates a bookings table that references your profiles table instead of auth.users

-- 1. Create a simple bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 3. Create simple RLS policies
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Students can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;

-- Allow users to view bookings where they are either the student or tutor
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (
    student_profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()) OR
    tutor_profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );

-- Allow students to create bookings
CREATE POLICY "Students can create bookings" ON bookings
  FOR INSERT WITH CHECK (
    student_profile_id IN (SELECT id FROM profiles WHERE id = auth.uid() AND role = 'student')
  );

-- Allow users to update their own bookings
CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (
    student_profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()) OR
    tutor_profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );

-- Allow users to delete their own bookings
CREATE POLICY "Users can delete their own bookings" ON bookings
  FOR DELETE USING (
    student_profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()) OR
    tutor_profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );

-- 4. Verify the table was created
SELECT 'bookings' as table_name, count(*) as row_count FROM bookings;
