export type Database = {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          grade_level: number;
          max_students: number | null;
          price: number | null;
          tutor_id: string | null;
          subject_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          grade_level: number;
          max_students?: number | null;
          price?: number | null;
          tutor_id?: string | null;
          subject_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          status: string;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          status?: string;
          enrolled_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          role: string;
          grade_level: number | null;
          avatar_url: string | null;
          bio: string | null;
          phone_number: string | null;
          school_name: string | null;
          created_at: string;
          updated_at: string | null;
        };
      };
    };
  };
};