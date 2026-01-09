-- Fix the bookings table schema to match what the application expects
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- Drop the existing bookings table if it has the wrong structure
DROP TABLE IF EXISTS bookings CASCADE;

-- Create the bookings table with the correct schema
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

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy
DROP POLICY IF EXISTS "Allow all operations" ON bookings;
CREATE POLICY "Allow all operations" ON bookings
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Verify the table was created correctly
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- Test insert to make sure it works
INSERT INTO bookings (student_id, tutor_id, course_id, start_time, end_time, status, notes)
VALUES (
  'test-student-id',
  'test-tutor-id', 
  'test-course-id',
  NOW(),
  NOW() + INTERVAL '1 hour',
  'pending',
  'Test booking - schema fixed'
);

-- Verify the test insert worked
SELECT * FROM bookings WHERE notes = 'Test booking - schema fixed';

-- Clean up test data
DELETE FROM bookings WHERE notes = 'Test booking - schema fixed';
