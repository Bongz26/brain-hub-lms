-- Add parent role support to the profiles table
-- Run this in your Supabase SQL Editor

-- Update the role check constraint to include parent
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('student', 'tutor', 'parent', 'admin', 'school'));

-- Optional: Create a sample parent user
-- First, you need to sign up a user in your app, then run this to change their role:
-- UPDATE profiles SET role = 'parent' WHERE email = 'parent@example.com';

-- Or update an existing user to be a parent:
-- UPDATE profiles SET role = 'parent' WHERE id = 'YOUR-USER-ID-HERE';

-- Verify the constraint was updated
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
  INNER JOIN pg_class rel ON rel.oid = con.conrelid
  INNER JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'profiles'
  AND con.conname = 'profiles_role_check';
