// Professional LMS Types

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  assignment_type: 'homework' | 'quiz' | 'project' | 'exam';
  instructions: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  attachments?: string[];
  submitted_at: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  attachments?: string[];
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  course_id: string;
  lesson_id?: string;
  assignment_id?: string;
  completion_percentage: number;
  last_accessed: string;
  time_spent: number; // in minutes
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface Announcement {
  id: string;
  course_id: string;
  author_id: string;
  title: string;
  content: string;
  is_important: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  course_id?: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Grade {
  id: string;
  student_id: string;
  assignment_id: string;
  points_earned: number;
  max_points: number;
  feedback?: string;
  graded_by: string;
  graded_at: string;
}

export interface CourseAnalytics {
  course_id: string;
  total_students: number;
  completion_rate: number;
  average_grade: number;
  total_assignments: number;
  total_lessons: number;
  last_activity: string;
}

export interface StudentAnalytics {
  student_id: string;
  total_courses: number;
  completed_courses: number;
  average_grade: number;
  total_time_spent: number;
  assignments_submitted: number;
  assignments_pending: number;
}
