import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Course {
  id: string;
  title: string;
  description: string;
  grade_level: number;
  subject?: string;
  subject_id?: string;
  tutor_id: string;
  price: number;
  max_students: number;
  duration_weeks: number;
  is_active: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url: string;
  school_name: string;
}

interface Subject {
  id: string;
  name: string;
  description?: string;
  grade_levels: number[];
}

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [tutor, setTutor] = useState<Profile | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState(false);

  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!id) {
        setError('Course ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (courseError) {
          console.error('Error loading course:', courseError);
          setError('Course not found or inactive');
          return;
        }

        setCourse(courseData);

        // Load tutor profile
        const { data: tutorData, error: tutorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', courseData.tutor_id)
          .single();

        if (!tutorError && tutorData) {
          setTutor(tutorData);
        }

        // Load subject details if subject_id exists
        if (courseData.subject_id) {
          const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('*')
            .eq('id', courseData.subject_id)
            .single();

          if (!subjectError && subjectData) {
            setSubject(subjectData);
          }
        }

      } catch (err) {
        console.error('Error loading course details:', err);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    loadCourseDetails();
  }, [id]);

  const handleBookSession = () => {
    if (!user) {
      alert('Please log in to book a session');
      navigate('/');
      return;
    }
    setBookingModal(true);
  };

  const handleEnroll = async () => {
    if (!user || !course) {
      alert('Please log in to enroll in this course');
      navigate('/');
      return;
    }

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: course.id,
          enrolled_at: new Date().toISOString(),
          status: 'active'
        });

      if (error) {
        console.error('Error enrolling:', error);
        alert('Failed to enroll in course. You may already be enrolled.');
        return;
      }

      alert('Successfully enrolled in the course!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error enrolling:', err);
      alert('Failed to enroll in course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/matching')}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-lg text-gray-600">{course.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">R{course.price}</div>
              <div className="text-sm text-gray-600">per course</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-1">Subject</h3>
              <p className="text-gray-600">{course.subject || subject?.name || 'Not specified'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-1">Grade Level</h3>
              <p className="text-gray-600">Grade {course.grade_level}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-1">Duration</h3>
              <p className="text-gray-600">{course.duration_weeks} weeks</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleBookSession}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium transition-colors"
              disabled={!user}
            >
              📅 Book Session
            </button>
            <button
              onClick={handleEnroll}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              disabled={!user}
            >
              📚 Enroll in Course
            </button>
            <button
              onClick={() => navigate('/matching')}
              className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-medium transition-colors"
            >
              ← Back to Courses
            </button>
          </div>
        </div>

        {/* Tutor Information */}
        {tutor && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Tutor</h2>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {tutor.first_name?.[0]}{tutor.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {tutor.first_name} {tutor.last_name}
                </h3>
                <p className="text-gray-600 mb-2">{tutor.school_name}</p>
                <p className="text-gray-700">{tutor.bio || 'Experienced tutor with a passion for teaching.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Course Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Maximum Students</h3>
              <p className="text-gray-600">{course.max_students} students</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Course Status</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                course.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {course.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal Placeholder */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Book a Session</h3>
            <p className="text-gray-600 mb-4">
              This feature is coming soon! For now, you can enroll in the course to get started.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setBookingModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setBookingModal(false);
                  handleEnroll();
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Enroll Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
