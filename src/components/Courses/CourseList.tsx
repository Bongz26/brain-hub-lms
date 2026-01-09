import React, { useEffect, useState } from 'react';
import { courseService } from '../../services/courseService';
import { Course, Subject } from '../../types/course';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export const CourseList: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);
        
        const [subjectsData, coursesData] = await Promise.all([
          courseService.getSubjects(),
          courseService.getCourses()
        ]);
        
        setSubjects(subjectsData);
        setCourses(coursesData);
      } catch (error: any) {
        console.error('Error loading data:', error);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredCourses = courses.filter(course => {
    if (selectedGrade && course.grade_level !== selectedGrade) return false;
    if (selectedSubject && course.subject_id !== selectedSubject) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading courses</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Courses</h1>
        <p className="text-gray-600 mb-6">Discover courses tailored for South African Grade 4-12 students</p>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <select 
            className="border border-gray-300 rounded-md p-2 flex-1"
            value={selectedGrade || ''}
            onChange={(e) => setSelectedGrade(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">All Grades</option>
            {Array.from({ length: 9 }, (_, i) => i + 4).map(grade => (
              <option key={grade} value={grade}>Grade {grade}</option>
            ))}
          </select>

          <select 
            className="border border-gray-300 rounded-md p-2 flex-1"
            value={selectedSubject || ''}
            onChange={(e) => setSelectedSubject(e.target.value || null)}
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredCourses.length} of {courses.length} courses
          {selectedGrade && ` for Grade ${selectedGrade}`}
          {selectedSubject && ` in ${subjects.find(s => s.id === selectedSubject)?.name}`}
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 && courses.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg">No courses found matching your filters.</p>
          <button 
            onClick={() => {
              setSelectedGrade(null);
              setSelectedSubject(null);
            }}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        </div>
      )}

      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses available</h3>
          <p className="text-gray-500">Check back later for new courses.</p>
        </div>
      )}
    </div>
  );
};

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load user profile to check role
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          setProfile(data);
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (user && profile?.role === 'student') {
        const enrolled = await courseService.isEnrolledInCourse(course.id);
        setIsEnrolled(enrolled);
      }
    };
    checkEnrollment();
  }, [user, course.id, profile]);

  const handleEnroll = async () => {
    if (!user) {
      alert('Please log in to enroll in courses');
      return;
    }
    
    // Prevent tutors from enrolling
    if (profile?.role === 'tutor') {
      alert('Tutors cannot enroll in courses. Switch to student account or create your own courses.');
      return;
    }
    
    setEnrolling(true);
    try {
      await courseService.enrollInCourse(course.id);
      setIsEnrolled(true);
      alert('🎉 Successfully enrolled in the course!');
    } catch (error: any) {
      alert('Error enrolling: ' + error.message);
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (price: any) => {
    if (typeof price === 'number') {
      return price.toFixed(2);
    }
    if (typeof price === 'string') {
      return parseFloat(price).toFixed(2);
    }
    return '0.00';
  };

  const getSubjectName = () => {
    if (course.subject && course.subject.name) {
      return course.subject.name;
    }
    return 'General Subject';
  };

  // Different button based on user role
  const renderActionButton = () => {
    if (loadingProfile) {
      return (
        <button disabled className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md font-medium">
          Loading...
        </button>
      );
    }

    if (!user) {
      return (
        <button
          onClick={() => alert('Please log in to enroll in courses')}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 font-medium"
        >
          Login to Enroll
        </button>
      );
    }

    if (profile?.role === 'tutor') {
      return (
        <button
          disabled
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md font-medium"
        >
          👨‍🏫 Tutor Account
        </button>
      );
    }

    if (isEnrolled) {
      return (
        <button
          disabled
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium"
        >
          ✓ Already Enrolled
        </button>
      );
    }

    return (
      <button
        onClick={handleEnroll}
        disabled={enrolling}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200 font-medium"
      >
        {enrolling ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Enrolling...
          </span>
        ) : (
          'Enroll Now'
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded whitespace-nowrap ml-2">
            Grade {course.grade_level}
          </span>
        </div>
        
        <p className="text-blue-600 font-medium mb-2">{getSubjectName()}</p>
        <p className="text-gray-700 mb-4 line-clamp-3">{course.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-green-600">
            R{formatPrice(course.price)}
          </span>
          <span className="text-sm text-gray-500">
            {course.duration_weeks} week{course.duration_weeks !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
          <span className="truncate">
            Tutor: {course.tutor_id ? 'Available' : 'Expert Tutor'}
          </span>
          <span>{course.max_students} spots</span>
        </div>

        {renderActionButton()}
      </div>
    </div>
  );
};