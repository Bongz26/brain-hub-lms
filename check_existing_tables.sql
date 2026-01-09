-- Check what tables you currently have in your database
-- Run this in your Supabase SQL Editor to see your current schema

-- List all tables in your database
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check the structure of your profiles table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if you have any user-related tables
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name LIKE '%user%' 
   OR table_name LIKE '%student%'
   OR table_name LIKE '%tutor%'
   OR column_name LIKE '%user%'
   OR column_name LIKE '%student%'
   OR column_name LIKE '%tutor%'
ORDER BY table_name, ordinal_position;

-- Check auth.users structure (this should exist by default in Supabase)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;
