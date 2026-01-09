export interface Profile {
  id: string;
  role: 'student' | 'tutor' | 'parent' | 'admin' | 'school';
  first_name: string;
  last_name: string;
  grade_level?: number;
  school_name?: string;
  phone_number?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProfileData {
  role: 'student' | 'tutor' | 'parent' | 'admin' | 'school';
  first_name: string;
  last_name: string;
  grade_level?: number;
  school_name?: string;
  phone_number?: string;
}