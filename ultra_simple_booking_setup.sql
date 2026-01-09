-- Ultra simple booking setup - no foreign keys, just basic table
-- This will work regardless of your existing table structure

-- 1. Create a very simple bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,  -- Just store the user ID as text
  tutor_id TEXT NOT NULL,    -- Just store the tutor ID as text
  course_id TEXT NOT NULL,   -- Just store the course ID as text
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 3. Create very simple RLS policies
DROP POLICY IF EXISTS "Allow all operations" ON bookings;

-- Allow all authenticated users to do everything (for demo purposes)
CREATE POLICY "Allow all operations" ON bookings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Test insert
INSERT INTO bookings (student_id, tutor_id, course_id, start_time, end_time, status, notes)
VALUES (
  'test-student-id',
  'test-tutor-id', 
  'test-course-id',
  NOW(),
  NOW() + INTERVAL '1 hour',
  'pending',
  'Test booking'
);

-- 5. Verify it worked
SELECT * FROM bookings WHERE notes = 'Test booking';

-- 6. Clean up test data
DELETE FROM bookings WHERE notes = 'Test booking';
