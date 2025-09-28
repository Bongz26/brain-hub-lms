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

interface Course {
  id: string;
  title: string;
  description: string;
  grade_level: number;
  subject_id: string;
  tutor_id: string;
  price: number;
  is_active?: boolean;
}

interface Tutor {
  id: string;
  qualifications: string;
  experience_years: number;
  hourly_rate: number;
  availability: object;
  is_verified: boolean;
  rating: number;
  total_sessions: number;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  school_name: string;
  bio: string;
  avatar_url: string;
}

interface Subject {
  id: string;
  name: string;
  grade_levels: number[];
}

interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string;
  created_at: string;
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
  const [tutors, setTutors] = useState<Record<string, Tutor>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [filteredCourses, setFilteredCourses] = useState<(Course & { score: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true);
        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
          return;
        }
        console.log('Courses loaded:', coursesData);
        setCourses(coursesData || []);

        // Fetch tutors
        const { data: tutorsData, error: tutorsError } = await supabase
          .from('tutors')
          .select('*');
        if (tutorsError) {
          console.error('Error fetching tutors:', tutorsError);
        } else {
          const tutorsMap = tutorsData?.reduce((acc, tutor) => {
            acc[tutor.id] = tutor;
            return acc;
          }, {} as Record<string, Tutor>) || {};
          setTutors(tutorsMap);
        }

        // Fetch profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'tutor');
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else {
          const profilesMap = profilesData?.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, Profile>) || {};
          setProfiles(profilesMap);
        }

        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');
        if (subjectsError) {
          console.error('Error fetching subjects:', subjectsError);
        } else {
          const subjectsMap = subjectsData?.reduce((acc, subject) => {
            acc[subject.id] = subject;
            return acc;
          }, {} as Record<string, Subject>) || {};
          setSubjects(subjectsMap);
        }

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*');
        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else {
          const reviewsMap = reviewsData?.reduce((acc, review) => {
            if (!acc[review.course_id]) acc[review.course_id] = [];
            acc[review.course_id].push(review);
            return acc;
          }, {} as Record<string, Review[]>) || {};
          setReviews(reviewsMap);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSafeAvatarUrl = (course: Course): string => {
    const profile = profiles[course.tutor_id];
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjMwIiBmaWxsPSIjOEU5MEE2Ii8+CjxwYXRoIGQ9Ik0wIDE1MEMwIDEzMyA0My4zMzMzIDEyNS43NSw3NSAxMjUuNzVDMTA2LjY2NyAxMjUuNzUsMTUwIDEzMyAxNTAgMTUwSDBaIiBmaWxsPSIjOEU5MEE2Ii8+Cjwvc3ZnPgo=';
  };

  const handleImageError = (courseId: string) => {
    setImageErrors(prev => new Set(prev).add(courseId));
  };

  const getGradeFromTitle = (course: Course): number => {
    const title = course.title.toLowerCase();
    const gradeMatch = title.match(/grade\s*(\d+)|gr\s*(\d+)|g\s*(\d+)/i);
    if (gradeMatch) {
      for (let i = 1; i <= 3; i++) {
        if (gradeMatch[i]) {
          const grade = parseInt(gradeMatch[i]);
          if (grade >= 1 && grade <= 12) return grade;
        }
      }
    }
    const numberMatch = title.match(/\b(\d+)\b/);
    if (numberMatch) {
      const grade = parseInt(numberMatch[1]);
      if (grade >= 1 && grade <= 12) return grade;
    }
    return course.grade_level;
  };

  const getSubjectName = (course: Course): string => {
    const subject = subjects[course.subject_id];
    if (subject?.name) {
      return subject.name;
    }
    const title = course.title.toLowerCase();
    if (title.includes('math') || title.includes('algebra')) return 'Mathematics';
    if (title.includes('science') && title.includes('physical')) return 'Physical Sciences';
    if (title.includes('english') || title.includes('writing')) return 'English Home Language';
    if (title.includes('science') && title.includes('natural')) return 'Natural Sciences';
    if (title.includes('accounting')) return 'Accounting';
    return 'Unknown';
  };

  const getGradeLevels = (course: Course): number[] => {
    const titleGrade = getGradeFromTitle(course);
    const subject = subjects[course.subject_id];
    if (subject?.grade_levels) {
      return subject.grade_levels;
    }
    return [titleGrade];
  };

  const getSchoolName = (course: Course): string => {
    const profile = profiles[course.tutor_id];
    if (profile?.school_name) {
      return profile.school_name;
    }
    return 'Unknown School';
  };

  const getIsVerified = (course: Course): boolean => {
    const tutor = tutors[course.tutor_id];
    return tutor?.is_verified || false;
  };

  const getRating = (course: Course): number => {
    const tutor = tutors[course.tutor_id];
    return tutor?.rating ? parseFloat(tutor.rating.toString()) : 0;
  };

  const getTutorName = (course: Course): string => {
    const profile = profiles[course.tutor_id];
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return 'Unknown Tutor';
  };

  const getExperienceYears = (course: Course): number => {
    const tutor = tutors[course.tutor_id];
    return tutor?.experience_years || 0;
  };

  const getHourlyRate = (course: Course): number => {
    const tutor = tutors[course.tutor_id];
    return tutor?.hourly_rate ? parseFloat(tutor.hourly_rate.toString()) : 0;
  };

  const getAverageRating = (courseId: string): number => {
    const courseReviews = reviews[courseId] || [];
    if (courseReviews.length === 0) return 0;
    const total = courseReviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((total / courseReviews.length).toFixed(1));
  };

  const calculateMatchScore = (course: Course, prefs: FormInputs): number => {
    let score = 0;
    const subjectName = getSubjectName(course);
    const gradeLevels = getGradeLevels(course);
    const schoolName = getSchoolName(course);
    const isVerified = getIsVerified(course);
    const rating = getRating(course);
    console.log('Scoring course:', course.title);
    console.log('Course subject:', subjectName);
    console.log('Course grade levels:', gradeLevels);
    console.log('Course school:', schoolName);
    console.log('Course verified:', isVerified);
    console.log('Course rating:', rating);
    console.log('User prefs:', prefs);

    if (subjectName === prefs.subject) score += 40;
    if (gradeLevels.includes(parseInt(prefs.grade))) score += 30;
    if (schoolName === prefs.location) score += 20;
    if (isVerified) score += 5;
    if (rating >= 4.0) score += 5;

    console.log('Final score:', score);
    return score;
  };

  const submitReview = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      return;
    }
    const rating = (document.getElementById(`rating-${courseId}`) as HTMLInputElement)?.value;
    const comment = (document.getElementById(`comment-${courseId}`) as HTMLTextAreaElement)?.value;
    if (!rating || parseInt(rating) < 1 || parseInt(rating) > 5) {
      alert('Please select a valid rating (1-5).');
      return;
    }
    const { error } = await supabase
      .from('reviews')
      .insert({ user_id: user.id, course_id: courseId, rating: parseInt(rating), comment });
    if (error) {
      console.error('Error submitting review:', error.message);
    } else {
      const { data } = await supabase.from('reviews').select('*').eq('course_id', courseId);
      setReviews(prev => ({ ...prev, [courseId]: data || [] }));
      (document.getElementById(`rating-${courseId}`) as HTMLInputElement).value = '';
      (document.getElementById(`comment-${courseId}`) as HTMLTextAreaElement).value = '';
      setSelectedCourse(null);
    }
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    console.log('Form submitted with data:', data);
    setHasSearched(true);
    if (courses.length === 0) {
      console.log('No courses available to search');
      setFilteredCourses([]);
      return;
    }

    const matches = courses
      .map((course) => ({
        ...course,
        score: calculateMatchScore(course, data),
      }))
      .filter((course) => course.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    console.log('Final matches found:', matches);
    setFilteredCourses(matches);
  };

  const getDisplayGrade = (course: Course): string => {
    const gradeLevels = getGradeLevels(course);
    return `Grade ${gradeLevels[0]}`;
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
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physical Sciences">Physical Sciences</option>
                <option value="English Home Language">English Home Language</option>
                <option value="Natural Sciences">Natural Sciences</option>
                <option value="Accounting">Accounting</option>
              </select>
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade</label>
              <select
                {...register('grade', { required: 'Grade is required' })}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Grade</option>
                <option value="6">Grade 6</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
              {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                {...register('location', { required: 'Location is required' })}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Location</option>
                <option value="Phuthaditjhaba High">Phuthaditjhaba</option>
                <option value="University Of Cape TOwn">Cape Town</option>
              </select>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading Courses...' : 'Find Courses'}
          </button>
        </form>

        {loading && (
          <div className="text-center py-8">
            <p className="text-lg">Loading courses...</p>
          </div>
        )}

        {!loading && courses.length === 0 && (
          <div className="text-center py-8">
            <p className="text-lg text-red-600">No courses found in the database.</p>
            <p className="text-gray-500">Please check your database connection and data.</p>
          </div>
        )}

        {!loading && hasSearched && filteredCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Top Matching Courses ({filteredCourses.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-center mb-4">
                    <img
                      src={getSafeAvatarUrl(course)}
                      alt={getTutorName(course)}
                      className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                      onError={() => handleImageError(course.id)}
                    />
                    <h3 className="text-xl font-semibold text-gray-800">{course.title}</h3>
                    <p className="text-sm text-gray-500">Matching as: {getDisplayGrade(course)}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">
                      <span className="font-medium">Tutor:</span> {getTutorName(course)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Subject:</span> {getSubjectName(course)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Grade Level:</span> {getDisplayGrade(course)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Location:</span> {getSchoolName(course)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Course Price:</span> R{parseFloat(course.price.toString()).toFixed(2)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Hourly Rate:</span> R{getHourlyRate(course).toFixed(2)}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Rating:</span> {getAverageRating(course.id)}/5
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Verified:</span> 
                      <span className={getIsVerified(course) ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                        {getIsVerified(course) ? 'Yes' : 'No'}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Experience:</span> {getExperienceYears(course)} years
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Match Score:</span> 
                      <span className="font-bold text-green-600 ml-1">{course.score}%</span>
                    </p>
                  </div>

                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">{course.description}</p>
                  
                  <div className="space-y-2">
                    <Link
                      to={`/course/${course.id}`}
                      className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Course Details
                    </Link>
                    <SessionBookButton tutorId={course.tutor_id} />
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Add Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && hasSearched && filteredCourses.length === 0 && courses.length > 0 && (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600 mb-2">No matching courses found for your criteria.</p>
            <p className="text-gray-500">Try adjusting your search filters.</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>Available courses: {courses.length}</p>
              <p>Available subjects: {Array.from(new Set(courses.map(c => getSubjectName(c)))).join(', ')}</p>
              <p>Available grades in titles: {Array.from(new Set(courses.map(c => getGradeFromTitle(c)))).sort((a, b) => a - b).join(', ')}</p>
            </div>
          </div>
        )}

        {!loading && !hasSearched && courses.length > 0 && (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">
              Ready to find your perfect course? Fill out the form above to get started!
            </p>
            <p className="text-gray-500 mt-2">
              We have {courses.length} active courses available.
            </p>
          </div>
        )}

        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Review for {selectedCourse.title}</h2>
              <form onSubmit={(e) => submitReview(e, selectedCourse.id)}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                  <input
                    type="number"
                    id={`rating-${selectedCourse.id}`}
                    min="1"
                    max="5"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Comment</label>
                  <textarea
                    id={`comment-${selectedCourse.id}`}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(null)}
                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;