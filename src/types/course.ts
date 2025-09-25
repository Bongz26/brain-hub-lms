export interface Subject {
  id: string;
  name: string;
  description: string;
  grade_levels: number[];
  created_at: string;
}

export interface Course {
  id: string;
  tutor_id: string;
  subject_id: string;
  title: string;
  description: string;
  grade_level: number;
  price: number;
  duration_weeks: number;
  max_students: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subject?: Subject;
  tutor?: {
    first_name: string;
    last_name: string;
  };
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'completed' | 'cancelled';
  course?: Course;
}