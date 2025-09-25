import { supabase } from '../lib/supabase';
import { Course, Subject, Enrollment } from '../types/course';

// Simple cache to avoid frequent API calls
let coursesCache: Course[] | null = null;
let subjectsCache: Subject[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

export const courseService = {
  // Get all subjects with caching
  async getSubjects(): Promise<Subject[]> {
    // Return cached data if available and not expired
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

  // Get all available courses with caching and error handling
  async getCourses(gradeLevel?: number): Promise<Course[]> {
    // Return cached data if available and not expired
    if (coursesCache && Date.now() - lastFetchTime < CACHE_DURATION) {
      return this.filterCourses(coursesCache, gradeLevel);
    }

    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          subject:subjects(*)
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

  // Get courses by tutor
  async getTutorCourses(tutorId: string): Promise<Course[]> {
    try {
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
          course:courses(*, subject:subjects(*))
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

    try {
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
      
      // Clear cache when new course is added
      coursesCache = null;
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }
};