import { supabase } from '../lib/supabase';
import { Course, Subject, Enrollment } from '../types/course';

export const courseService = {
  // Get all subjects
  async getSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  // Get all available courses (Simplified version without tutor join)
  async getCourses(gradeLevel?: number): Promise<Course[]> {
    let query = supabase
      .from('courses')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('is_active', true);

    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      // Return empty array instead of throwing error for better UX
      return [];
    }
    
    return data || [];
  },

  // Get courses by tutor
  async getTutorCourses(tutorId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tutor courses:', error);
      return [];
    }
    return data || [];
  },

  // Enroll in a course
  async enrollInCourse(courseId: string): Promise<Enrollment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        student_id: user.id,
        course_id: courseId,
        status: 'active'
      })
      .select(`
        *,
        course:courses(*, subject:subjects(*))
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Get student's enrollments
  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(*, subject:subjects(*))
      `)
      .eq('student_id', studentId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
    return data || [];
  },

  // Create a new course (for tutors)
  async createCourse(courseData: {
    subject_id: string;
    title: string;
    description: string;
    grade_level: number;
    price: number;
    duration_weeks: number;
    max_students: number;
  }): Promise<Course> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('courses')
      .insert({
        tutor_id: user.id,
        ...courseData
      })
      .select(`
        *,
        subject:subjects(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }
};