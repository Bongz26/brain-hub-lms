-- Test script to check if bookings table exists and is accessible

-- Check if bookings table exists
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- If the above returns no rows, the table doesn't exist
-- If it returns rows, the table exists and shows its structure

-- Test inserting a sample booking (this will fail if table doesn't exist or RLS is blocking)
-- Uncomment the lines below to test:

-- INSERT INTO bookings (
--   student_id,
--   tutor_id, 
--   course_id,
--   start_time,
--   end_time,
--   status,
--   notes
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000', -- dummy UUID
--   '00000000-0000-0000-0000-000000000000', -- dummy UUID  
--   'test-course-id',
--   NOW(),
--   NOW() + INTERVAL '1 hour',
--   'pending',
--   'Test booking'
-- );

-- Check RLS policies on bookings table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'bookings';
