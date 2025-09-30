-- Fix subjects table RLS policy
-- Run this in your Supabase SQL Editor

-- Check if subjects table has RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'subjects';

-- Check existing policies on subjects table
SELECT * FROM pg_policies WHERE tablename = 'subjects';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON subjects;
DROP POLICY IF EXISTS "Enable read access for all users" ON subjects;

-- Create a new policy that allows everyone to read subjects
CREATE POLICY "Enable read access for all users" ON subjects
FOR SELECT USING (true);

-- Alternative: If you want to disable RLS completely for subjects (less secure but simpler)
-- ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;

-- Test the policy by trying to select from subjects
SELECT COUNT(*) FROM subjects;
