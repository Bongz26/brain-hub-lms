-- Create tutor_availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tutor_id, day_of_week)
);

-- Enable RLS
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tutor_availability
CREATE POLICY "Users can view all availability" ON tutor_availability
  FOR SELECT USING (true);

CREATE POLICY "Tutors can manage their own availability" ON tutor_availability
  FOR ALL USING (auth.uid() = tutor_id);

-- Insert sample availability data for tutors
-- This will add availability for any tutors in the system
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
