-- Update demo data with common QwaQwa and Harrismith names
-- Run this in your Supabase SQL Editor

-- Update existing profiles with local names
-- This assumes you have profiles in your database

-- Update tutor profiles with QwaQwa/Harrismith area names
UPDATE profiles 
SET 
  first_name = 'Thabo',
  last_name = 'Mokoena',
  school_name = 'Phuthaditjhaba High School',
  bio = 'Experienced Mathematics tutor from QwaQwa with 5 years of teaching experience'
WHERE role = 'tutor' 
  AND email LIKE '%bongz%'
LIMIT 1;

UPDATE profiles 
SET 
  first_name = 'Lerato',
  last_name = 'Moloi',
  school_name = 'Harrismith Secondary School',
  bio = 'Passionate about Physical Sciences. Helping students excel in grades 10-12'
WHERE role = 'tutor' 
  AND email NOT LIKE '%bongz%'
  AND role = 'tutor'
LIMIT 1;

-- Update student profiles
UPDATE profiles 
SET 
  first_name = 'Nthabiseng',
  last_name = 'Twala',
  school_name = 'Phamong High School',
  bio = 'Grade 10 student passionate about learning'
WHERE role = 'student'
  AND email LIKE '%masho%'
LIMIT 1;

-- If you want to add more sample users with QwaQwa/Harrismith names:

-- Sample QwaQwa/Harrismith area names you can use:

-- FIRST NAMES (Male):
-- Thabo, Sipho, Lehlohonolo, Tebogo, Tshepo, Karabo, Kgotso, Lebohang, Mzwandile, Mpho

-- FIRST NAMES (Female):
-- Nthabiseng, Lerato, Palesa, Mamello, Refiloe, Dikeledi, Tshepiso, Boitumelo, Keabetswe, Nomvula

-- LAST NAMES (Common in QwaQwa/Free State):
-- Mokoena, Moloi, Twala, Nkosi, Nhlapo, Tshabalala, Mofokeng, Radebe, Malope, Khumalo

-- SCHOOLS (QwaQwa/Harrismith Area):
-- Phuthaditjhaba High School
-- Harrismith Secondary School
-- Phamong High School
-- Tshiame Secondary School
-- Witsieshoek High School
-- Mautse High School
-- QwaQwa Combined School
-- Intabazwe High School
-- Thabo Mofutsanyana High School
-- Bergview High School

-- LOCATIONS (QwaQwa/Harrismith):
-- Phuthaditjhaba
-- Harrismith
-- QwaQwa Township
-- Witsieshoek
-- Tshiame
-- Mautse
-- Intabazwe
-- Bluegumbosch
-- Kestell
-- Monontsha

-- Example: Insert new demo users with local names
-- Uncomment and modify as needed:

/*
-- Insert demo tutor from QwaQwa
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('thabo.mokoena@brainhub.co.za', crypt('demo123', gen_salt('bf')), NOW());

INSERT INTO profiles (id, first_name, last_name, role, school_name, phone_number, bio, grade_level)
SELECT 
  id,
  'Thabo',
  'Mokoena',
  'tutor',
  'Phuthaditjhaba High School',
  '058 713 0000',
  'Experienced Mathematics and Physical Sciences tutor',
  12
FROM auth.users WHERE email = 'thabo.mokoena@brainhub.co.za';

-- Insert demo student from Harrismith
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('nthabiseng.moloi@brainhub.co.za', crypt('demo123', gen_salt('bf')), NOW());

INSERT INTO profiles (id, first_name, last_name, role, school_name, phone_number, grade_level)
SELECT 
  id,
  'Nthabiseng',
  'Moloi',
  'student',
  'Harrismith Secondary School',
  '058 622 0000',
  10
FROM auth.users WHERE email = 'nthabiseng.moloi@brainhub.co.za';

-- Insert demo parent from QwaQwa
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('lerato.twala@brainhub.co.za', crypt('demo123', gen_salt('bf')), NOW());

INSERT INTO profiles (id, first_name, last_name, role, school_name, phone_number)
SELECT 
  id,
  'Lerato',
  'Twala',
  'parent',
  'Phamong High School',
  '058 713 1234'
FROM auth.users WHERE email = 'lerato.twala@brainhub.co.za';
*/

-- Verify the updates
SELECT 
  first_name,
  last_name,
  role,
  school_name,
  email
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY role, last_name;
