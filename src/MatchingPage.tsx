import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from './lib/supabase';
import { Link } from 'react-router-dom';
import SessionBookButton from './SessionBookButton';

interface FormInputs {
  subject: string;
  grade: string;
  location: string;
}

interface Profile {
  first_name: string;
  last_name: string;
  role: string;
  school_name: string;
  bio: string;
  avatar_url: string;
}

interface Tutor {
  qualifications: string;
  experience_years: number;
  hourly_rate: number;
  availability: object;
  is_verified: boolean;
  rating: number;
  total_sessions: number;
}

interface Subject {
  name: string;
  grade_levels: number[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  grade_level: number;
  subject_id: string;
  tutor_id: string;
  price: number;
  is_active: boolean;
  profile?: Profile;
  tutor?: Tutor;
  subject?: Subject;
}

const MatchingPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      subject: '',
      grade: '',
      location: '',
    },
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<(Course & { score: number })[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, title, description, grade_level, subject_id, tutor_id, price, is_active,
          profiles(first_name, last_name, role, school_name, bio, avatar_url),
          tutors(qualifications, experience_years, hourly_rate, availability, is_verified, rating, total_sessions),
          subjects(name, grade_levels)
        `)
        .eq('is_active', true);
      console.log('Raw Query Data (Post-Fetch):', data); // Moved after setLoading(false) for clarity
      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const calculateMatchScore = (course: Course, prefs: FormInputs): number => {
    let score = 0;
    const tutor = course.tutor;
    const profile = course.profile;
    const subject = course.subject;
    console.log('Course:', course, 'Prefs:', prefs); // Debug log
    if (!tutor || !profile || !subject) return score;
    if (subject.name.toLowerCase() === prefs.subject.toLowerCase()) score += 40;
    if (subject.grade_levels.includes(parseInt(prefs.grade))) score += 30; // Convert string to number
    if (profile.school_name.toLowerCase() === prefs.location.toLowerCase()) score += 20;
    if (tutor.is_verified) score += 5;
    if (tutor.rating >= 4.0) score += 5;
    console.log('Score for', course.title, ':', score); // Debug score
    return score;
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const matches = courses
      .map((course) => ({
        ...course,
        score: calculateMatchScore(course, data),
      }))
      .filter((course) => course.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    setFilteredCourses(matches);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Find Your Perfect Course</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select
                {...register('subject', { required: 'Subject is required' })}
                className="mt-1 block w-full p-2 border rounded-md"
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physical Sciences">Physical Sciences</option>
                <option value="English Home Language">English Home Language</option>
                <option value="Natural Sciences">Natural Sciences</option>
                <option value="Accounting">Accounting</option>
              </select>
              {errors.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade</label>
              <select
                {...register('grade', { required: 'Grade is required' })}
                className="mt-1 block w-full p-2 border rounded-md"
              >
                <option value="">Select Grade</option>
                <option value="6">Grade 6</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
              {errors.grade && <p className="text-red-500 text-sm">{errors.grade.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                {...register('location', { required: 'Location is required' })}
                className="mt-1 block w-full p-2 border rounded-md"
              >
                <option value="">Select Location</option>
                <option value="Phuthaditjhaba High">Phuthaditjhaba</option>
                <option value="University Of Cape TOwn">Cape Town</option>
              </select>
              {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Find Courses'}
          </button>
        </form>

        {loading && <p className="text-center">Loading courses...</p>}
        {filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white p-4 rounded-lg shadow-md">
                <img
                  src={course.profile?.avatar_url || 'https://via.placeholder.com/150'}
                  alt={`${course.profile?.first_name || 'Tutor'} ${course.profile?.last_name || ''}`}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-center">{course.title}</h2>
                <p className="text-gray-600">Tutor: {course.profile ? `${course.profile.first_name} ${course.profile.last_name}` : 'Unknown'}</p>
                <p className="text-gray-600">Subject: {course.subject?.name || 'N/A'}</p>
                <p className="text-gray-600">Grade: {course.grade_level}</p>
                <p className="text-gray-600">Location: {course.profile?.school_name || 'N/A'}</p>
                <p className="text-gray-600">Price: R{course.price}</p>
                <p className="text-gray-600">Hourly Rate: R{course.tutor?.hourly_rate || 'N/A'}</p>
                <p className="text-gray-600">Rating: {course.tutor?.rating || 'N/A'}/5</p>
                <p className="text-gray-600">Verified: {course.tutor?.is_verified ? 'Yes' : 'No'}</p>
                <p className="text-gray-600">Match Score: <span className="text-green-600">{course.score}%</span></p>
                <p className="text-gray-500 text-sm mt-2">{course.description}</p>
                <Link
                  to={`/course/${course.id}`}
                  className="block mt-4 text-center bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                >
                  Enroll Now
                </Link>
                <SessionBookButton tutorId={course.tutor_id} />
              </div>
            ))}
          </div>
        )}
        {filteredCourses.length === 0 && !loading && (
          <p className="text-center text-gray-600">No courses found. Try different filters.</p>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;