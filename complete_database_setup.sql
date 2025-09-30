-- Complete database setup for the LMS booking system
-- Run this script in your Supabase SQL Editor

-- 1. Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create tutor_availability table
CREATE TABLE IF NOT EXISTS tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tutor_id, day_of_week)
);

-- 3. Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'completed', 'dropped')) DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- 4. Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Students can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete their own bookings" ON bookings;

CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY "Students can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY "Users can delete their own bookings" ON bookings
  FOR DELETE USING (auth.uid() = student_id OR auth.uid() = tutor_id);

-- 6. Create RLS policies for tutor_availability
DROP POLICY IF EXISTS "Users can view all availability" ON tutor_availability;
DROP POLICY IF EXISTS "Tutors can manage their own availability" ON tutor_availability;

CREATE POLICY "Users can view all availability" ON tutor_availability
  FOR SELECT USING (true);

CREATE POLICY "Tutors can manage their own availability" ON tutor_availability
  FOR ALL USING (auth.uid() = tutor_id);

-- 7. Create RLS policies for enrollments
DROP POLICY IF EXISTS "Users can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can create enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can update their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Tutors can view enrollments for their courses" ON enrollments;

CREATE POLICY "Users can view their own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own enrollments" ON enrollments
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Tutors can view enrollments for their courses" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = enrollments.course_id 
      AND courses.tutor_id = auth.uid()
    )
  );

-- 8. Insert sample availability data for existing tutors
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  p.id as tutor_id,
  day_num as day_of_week,
  '09:00:00'::time as start_time,
  '17:00:00'::time as end_time,
  true as is_available
FROM profiles p
CROSS JOIN generate_series(1, 5) as day_num -- Monday to Friday
WHERE p.role = 'tutor'
ON CONFLICT (tutor_id, day_of_week) DO NOTHING;

-- 9. Insert weekend availability
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  p.id as tutor_id,
  day_num as day_of_week,
  '10:00:00'::time as start_time,
  '15:00:00'::time as end_time,
  true as is_available
FROM profiles p
CROSS JOIN generate_series(0, 6) as day_num
WHERE p.role = 'tutor' AND day_num IN (0, 6) -- Sunday and Saturday
ON CONFLICT (tutor_id, day_of_week) DO NOTHING;

-- 10. Verify tables were created
SELECT 'bookings' as table_name, count(*) as row_count FROM bookings
UNION ALL
SELECT 'tutor_availability' as table_name, count(*) as row_count FROM tutor_availability
UNION ALL
SELECT 'enrollments' as table_name, count(*) as row_count FROM enrollments;
