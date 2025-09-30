-- Rename existing users in the database with QwaQwa/Harrismith names
-- Run this in your Supabase SQL Editor

-- First, let's see what users you currently have
SELECT 
  p.id,
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  p.school_name
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.created_at;

-- Update the tutor with email bongzdondas@gmail.com
UPDATE profiles 
SET 
  first_name = 'Thabo',
  last_name = 'Radebe',
  school_name = 'Phuthaditjhaba High School',
  phone_number = '058 713 4567',
  bio = 'Experienced Mathematics and Physical Sciences tutor from QwaQwa. 8 years teaching Grades 8-12.'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'bongzdondas@gmail.com'
);

-- Update the student with email mashobanephone@gmail.com
UPDATE profiles 
SET 
  first_name = 'Nthabiseng',
  last_name = 'Mokoena',
  school_name = 'Phuthaditjhaba High School',
  phone_number = '073 456 7890',
  bio = 'Grade 10 student passionate about Mathematics and Science'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'mashobanephone@gmail.com'
);

-- If you have other users, update them too
-- Pattern: Update by email or by role and order

-- Update any other tutors (if they exist)
UPDATE profiles 
SET 
  first_name = 'Lerato',
  last_name = 'Mofokeng',
  school_name = 'Harrismith Secondary School',
  phone_number = '058 622 5678',
  bio = 'Passionate Physical Sciences educator from Harrismith. Specializing in Chemistry and Physics.'
WHERE role = 'tutor' 
  AND id NOT IN (
    SELECT id FROM auth.users WHERE email = 'bongzdondas@gmail.com'
  )
LIMIT 1;

-- Update another tutor
UPDATE profiles 
SET 
  first_name = 'Kgotso',
  last_name = 'Nhlapo',
  school_name = 'Witsieshoek High School',
  phone_number = '058 713 6789',
  bio = 'English language and literature specialist. Helping students excel in communication.'
WHERE role = 'tutor' 
  AND first_name NOT IN ('Thabo', 'Lerato')
LIMIT 1;

-- Update any other students (if they exist)
UPDATE profiles 
SET 
  first_name = 'Tebogo',
  last_name = 'Moloi',
  school_name = 'Harrismith Secondary School',
  phone_number = '082 345 6789',
  grade_level = 11,
  bio = 'Grade 11 student focused on Sciences and Mathematics'
WHERE role = 'student' 
  AND id NOT IN (
    SELECT id FROM auth.users WHERE email = 'mashobanephone@gmail.com'
  )
LIMIT 1;

UPDATE profiles 
SET 
  first_name = 'Palesa',
  last_name = 'Twala',
  school_name = 'Phamong High School',
  phone_number = '084 234 5678',
  grade_level = 9,
  bio = 'Aspiring scientist from QwaQwa'
WHERE role = 'student' 
  AND first_name NOT IN ('Nthabiseng', 'Tebogo')
LIMIT 1;

UPDATE profiles 
SET 
  first_name = 'Sipho',
  last_name = 'Nkosi',
  school_name = 'Intabazwe High School',
  phone_number = '073 567 8901',
  grade_level = 12,
  bio = 'Matriculant preparing for final exams'
WHERE role = 'student' 
  AND first_name NOT IN ('Nthabiseng', 'Tebogo', 'Palesa')
LIMIT 1;

-- Update any parents
UPDATE profiles 
SET 
  first_name = 'Mamello',
  last_name = 'Malope',
  school_name = 'Phamong High School',
  phone_number = '073 789 0123',
  bio = 'Parent of 2 children at Phamong High School'
WHERE role = 'parent'
LIMIT 1;

-- Update remaining profiles with common QwaQwa names
UPDATE profiles 
SET 
  first_name = CASE 
    WHEN role = 'student' AND grade_level < 10 THEN 'Boitumelo'
    WHEN role = 'student' AND grade_level >= 10 THEN 'Lebohang'
    WHEN role = 'tutor' THEN 'Dikeledi'
    WHEN role = 'parent' THEN 'Refiloe'
    ELSE first_name
  END,
  last_name = CASE 
    WHEN role = 'student' AND grade_level < 10 THEN 'Khumalo'
    WHEN role = 'student' AND grade_level >= 10 THEN 'Motaung'
    WHEN role = 'tutor' THEN 'Tshabalala'
    WHEN role = 'parent' THEN 'Moshoeshoe'
    ELSE last_name
  END,
  school_name = CASE 
    WHEN school_name LIKE '%Horizon%' THEN 'Phuthaditjhaba High School'
    WHEN school_name LIKE '%High%' THEN 'Harrismith Secondary School'
    ELSE 'Phamong High School'
  END
WHERE first_name IN ('Sarah', 'Mike', 'Emma', 'John', 'Jane', 'Test');

-- Update course names to include local context
UPDATE courses
SET 
  title = CASE 
    WHEN title LIKE '%Math%' THEN 'Mathematics Excellence - Phuthaditjhaba'
    WHEN title LIKE '%Science%' THEN 'Physical Sciences Mastery - QwaQwa'
    WHEN title LIKE '%English%' THEN 'English Proficiency - Harrismith'
    WHEN title LIKE '%Life%' THEN 'Life Sciences - Free State Curriculum'
    ELSE title
  END,
  description = CASE 
    WHEN description IS NOT NULL THEN description || ' Tailored for QwaQwa and Harrismith learners.'
    ELSE 'Quality tutoring for Free State students. Grades 4-12.'
  END
WHERE title NOT LIKE '%Phuthaditjhaba%' 
  AND title NOT LIKE '%QwaQwa%'
  AND title NOT LIKE '%Harrismith%';

-- Verify the updates
SELECT 
  p.first_name,
  p.last_name,
  p.role,
  p.school_name,
  p.phone_number,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.role, p.last_name;

-- Show updated courses
SELECT 
  id,
  title,
  description,
  grade_level,
  tutor_id
FROM courses
ORDER BY created_at DESC
LIMIT 10;
