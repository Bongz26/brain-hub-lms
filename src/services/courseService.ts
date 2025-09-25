import { supabase } from '../lib/supabase';
import { Course, Subject, Enrollment } from '../types/course';

export const courseService = {
  // Get all subjects
  async getSubjects(): Promise<Subject[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching subjects:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Exception fetching subjects:', error);
      return [];
    }
  },

  // Get all available courses
  async getCourses(gradeLevel?: number): Promise<Course[]> {
    try {
      let query = supabase
        .from('courses')
        .select('*')
        .eq('is_active', true);

      if (gradeLevel) {
        query = query.eq('grade_level', gradeLevel);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
        return [];
      }

      // If we have courses, get subjects separately
      if (data && data.length > 0) {
        const coursesWithSubjects = await Promise.all(
          data.map(async (course) => {
            try {
              const { data: subjectData } = await supabase
                .from('subjects')
                .select('*')
                .eq('id', course.subject_id)
                .single();
              
              return {
                ...course,
                subject: subjectData
              };
            } catch (subjectError) {
              console.warn('Could not fetch subject for course:', course.id);
              return course;
            }
          })
        );
        
        return coursesWithSubjects;
      }
      
      return data || [];
    } catch (error) {
      console.error('Exception fetching courses:', error);
      return [];
    }
  },

  // Get courses by tutor
  async getTutorCourses(tutorId: string): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tutor courses:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Exception fetching tutor courses:', error);
      return [];
    }
  },

  // Enroll in a course
  async enrollInCourse(courseId: string): Promise<Enrollment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (existingEnrollment) {
        throw new Error('You are already enrolled in this course');
      }

      // Create enrollment
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId,
          status: 'active'
        })
        .select('*')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  // Get student's enrollments
  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', studentId)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrollments:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Exception fetching enrollments:', error);
      return [];
    }
  },

  // Cancel enrollment
  async cancelEnrollment(enrollmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ status: 'cancelled' })
        .eq('id', enrollmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      throw error;
    }
  },

  // Check if user is enrolled in a course
  async isEnrolledInCourse(courseId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      const { data } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'active')
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }
};