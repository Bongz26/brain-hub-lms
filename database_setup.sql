-- Brain Hub LMS Database Setup
-- Run this in your Supabase SQL Editor

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  grade_levels INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subjects
INSERT INTO subjects (id, name, description, grade_levels) VALUES
('math', 'Mathematics', 'Mathematical concepts and problem solving', ARRAY[9, 10, 11, 12]),
('science', 'Science', 'General science concepts', ARRAY[9, 10, 11, 12]),
('english', 'English', 'English language and literature', ARRAY[9, 10, 11, 12]),
('history', 'History', 'Historical events and analysis', ARRAY[9, 10, 11, 12]),
('physics', 'Physics', 'Physical sciences and mechanics', ARRAY[10, 11, 12]),
('chemistry', 'Chemistry', 'Chemical reactions and properties', ARRAY[10, 11, 12]),
('biology', 'Biology', 'Life sciences and organisms', ARRAY[9, 10, 11, 12]),
('art', 'Art', 'Visual arts and creativity', ARRAY[9, 10, 11, 12]),
('music', 'Music', 'Musical theory and performance', ARRAY[9, 10, 11, 12]),
('computer-science', 'Computer Science', 'Programming and computer concepts', ARRAY[9, 10, 11, 12])
ON CONFLICT (id) DO NOTHING;

-- Create courses table if it doesn't exist
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  grade_level INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  duration_weeks INTEGER DEFAULT 12,
  max_students INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('student', 'tutor', 'admin')) DEFAULT 'student',
  bio TEXT,
  subjects TEXT[],
  grade_levels INTEGER[],
  grade_level INTEGER,
  subjects_of_interest TEXT[],
  learning_goals TEXT,
  hourly_rate DECIMAL(10,2),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  meeting_link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materials table if it doesn't exist
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  subject TEXT,
  file_url TEXT,
  file_size TEXT,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points INTEGER DEFAULT 100,
  assignment_type TEXT CHECK (assignment_type IN ('homework', 'quiz', 'project', 'exam')) DEFAULT 'homework',
  instructions TEXT,
  attachments TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for subjects (public read)
CREATE POLICY "Subjects are viewable by everyone" ON subjects FOR SELECT USING (true);

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for courses
CREATE POLICY "Tutors can view their own courses" ON courses FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Tutors can create courses" ON courses FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Tutors can update their own courses" ON courses FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "Tutors can delete their own courses" ON courses FOR DELETE USING (auth.uid() = tutor_id);
CREATE POLICY "Students can view active courses" ON courses FOR SELECT USING (is_active = true);

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id);
CREATE POLICY "Students can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = tutor_id);

-- Create policies for materials
CREATE POLICY "Tutors can manage their own materials" ON materials FOR ALL USING (auth.uid() = tutor_id);
CREATE POLICY "Students can view materials" ON materials FOR SELECT USING (true);

-- Create policies for assignments
CREATE POLICY "Tutors can manage assignments for their courses" ON assignments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = assignments.course_id 
    AND courses.tutor_id = auth.uid()
  )
);
CREATE POLICY "Students can view assignments" ON assignments FOR SELECT USING (true);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
