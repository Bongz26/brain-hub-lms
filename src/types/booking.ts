export interface Booking {
  id: string;
  student_id: string;
  tutor_id: string;
  course_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  meeting_link?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Related data
  tutor?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    subject: string;
  };
}

export interface TutorAvailability {
  id: string;
  tutor_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  tutor_id: string;
  course_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  notes?: string;
}
