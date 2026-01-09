-- CAPS Syllabus and Assessments Setup

-- 1. Update/Insert CAPS Subjects for Grades 5-12
INSERT INTO subjects (id, name, description, grade_levels) VALUES
('math_inter', 'Mathematics (Inter)', 'Mathematics for Intermediate Phase', ARRAY[4, 5, 6]),
('math_senior', 'Mathematics (Senior)', 'Mathematics for Senior Phase', ARRAY[7, 8, 9]),
('math_fet', 'Mathematics (FET)', 'Mathematics for FET Phase', ARRAY[10, 11, 12]),
('ns', 'Natural Sciences', 'Natural Sciences for Senior Phase', ARRAY[7, 8, 9]),
('tech', 'Technology', 'Technology for Senior Phase', ARRAY[7, 8, 9]),
('ems', 'EMS', 'Economic and Management Sciences', ARRAY[7, 8, 9]),
('lo', 'Life Orientation', 'Life Orientation', ARRAY[7, 8, 9, 10, 11, 12])
ON CONFLICT (id) DO UPDATE SET grade_levels = EXCLUDED.grade_levels;

-- 2. Create Assessment Submissions Table (for Test Results)
CREATE TABLE IF NOT EXISTS assessment_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  content TEXT, -- JSON or text answer
  score INTEGER, -- Score obtained
  max_score INTEGER, -- Copied from assignment for historical accuracy
  teacher_feedback TEXT,
  status TEXT CHECK (status IN ('submitted', 'graded', 'pending')) DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Students can view their own submissions" ON assessment_submissions 
  FOR SELECT USING (auth.uid() = student_id);
  
CREATE POLICY "Students can create submissions" ON assessment_submissions 
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Tutors can view/grade submissions for their courses" ON assessment_submissions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM assignments
      JOIN courses ON assignments.course_id = courses.id
      WHERE assignments.id = assessment_submissions.assignment_id
      AND courses.tutor_id = auth.uid()
    )
  );
