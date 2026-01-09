-- Simple script to set up tutor availability without conflicts

-- First, create the tutor_availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'tutor_availability_tutor_id_day_of_week_key'
    ) THEN
        ALTER TABLE tutor_availability ADD CONSTRAINT tutor_availability_tutor_id_day_of_week_key 
        UNIQUE (tutor_id, day_of_week);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all availability" ON tutor_availability;
DROP POLICY IF EXISTS "Tutors can manage their own availability" ON tutor_availability;

-- Create RLS policies for tutor_availability
CREATE POLICY "Users can view all availability" ON tutor_availability
  FOR SELECT USING (true);

CREATE POLICY "Tutors can manage their own availability" ON tutor_availability
  FOR ALL USING (auth.uid() = tutor_id);

-- Clear existing availability data to avoid duplicates
DELETE FROM tutor_availability;

-- Insert sample availability data for tutors (Monday to Friday, 9 AM to 5 PM)
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  p.id as tutor_id,
  day_num as day_of_week,
  '09:00:00'::time as start_time,
  '17:00:00'::time as end_time,
  true as is_available
FROM profiles p
CROSS JOIN generate_series(1, 5) as day_num -- Monday to Friday
WHERE p.role = 'tutor';

-- Insert weekend availability (Saturday and Sunday, 10 AM to 3 PM)
INSERT INTO tutor_availability (tutor_id, day_of_week, start_time, end_time, is_available)
SELECT 
  p.id as tutor_id,
  day_num as day_of_week,
  '10:00:00'::time as start_time,
  '15:00:00'::time as end_time,
  true as is_available
FROM profiles p
CROSS JOIN generate_series(0, 6) as day_num -- Sunday (0) and Saturday (6)
WHERE p.role = 'tutor' AND day_num IN (0, 6);
