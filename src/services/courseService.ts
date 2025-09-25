import { supabase } from '../lib/supabase';
import { Course, Subject, Enrollment } from '../types/course';

// Simple cache to avoid frequent API calls
let coursesCache: Course[] | null = null;
let subjectsCache: Subject[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

const retryOperation = async <T>(operation: () => Promise<T>, retries = 3): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    if (retries > 0 && error.message.includes('busy')) {
      console.log(`Server busy, retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};
export const courseService = {
  // Get all subjects with caching
  async getSubjects(): Promise<Subject[]> {
    if (subjectsCache && Date.now() - lastFetchTime < CACHE_DURATION) {
      return subjectsCache;
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) {
        console.warn('Error fetching subjects, using cache:', error);
        return subjectsCache || [];
      }

      subjectsCache = data || [];
      lastFetchTime = Date.now();
      return subjectsCache;
    } catch (error) {
      console.warn('Exception fetching subjects, using cache:', error);
      return subjectsCache || [];
    }
  },

  // Get all available courses with caching
  async getCourses(gradeLevel?: number): Promise<Course[]> {
    if (coursesCache && Date.now() - lastFetchTime < CACHE_DURATION) {
      return this.filterCourses(coursesCache, gradeLevel);
    }

    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          subject:subjects(*),
          enrollments!left(count)
        `)
        .eq('is_active', true);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching courses, using cache:', error);
        return coursesCache ? this.filterCourses(coursesCache, gradeLevel) : [];
      }

      coursesCache = data || [];
      lastFetchTime = Date.now();
      return this.filterCourses(coursesCache, gradeLevel);
    } catch (error) {
      console.warn('Exception fetching courses, using cache:', error);
      return coursesCache ? this.filterCourses(coursesCache, gradeLevel) : [];
    }
  },

  // Helper method to filter courses by grade level
  filterCourses(courses: Course[], gradeLevel?: number): Course[] {
    if (!gradeLevel) return courses;
    return courses.filter(course => course.grade_level === gradeLevel);
  },

  // ENROLLMENT FUNCTIONALITY
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

      // Check course capacity
      const { data: course } = await supabase
        .from('courses')
        .select('max_students, enrollments(count)')
        .eq('id', courseId)
        .single();

      if (course && course.enrollments && course.enrollments[0].count >= course.max_students) {
        throw new Error('This course is full');
      }

      // Create enrollment
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId,
          status: 'active'
        })
        .select(`
          *,
          course:courses(*, 
            subject:subjects(*),
            tutor:profiles(first_name, last_name)
          )
        `)
        .single();

      if (error) throw error;
      
      // Clear cache to reflect new enrollment
      coursesCache = null;
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
        .select(`
          *,
          course:courses(*, 
            subject:subjects(*),
            tutor:profiles(first_name, last_name)
          )
        `)
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
      
      // Clear cache
      coursesCache = null;
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