import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from './lib/supabase';
import { Link } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
// import SessionBookButton from './SessionBookButton'; // Unused import

interface FormInputs {
  subject: string;
  grade: string;
  location: string;
}

interface LoginForm {
  email: string;
  password: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  grade_level: number;
  subject_id?: string;
  subject?: string;
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

interface Availability {
  id: string;
  tutor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Booking {
  id: string;
  user_id: string;
  tutor_id: string;
  course_id: string;
  booking_date: string;
  status: string;
  created_at: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  extendedProps: { tutorId: string; courseId: string };
}

const MatchingPage: React.FC = () => {
  const { register: registerSearch, handleSubmit: handleSubmitSearch, formState: { errors: searchErrors } } = useForm<FormInputs>({
    defaultValues: {
      subject: '',
      grade: '',
      location: '',
    },
  });
  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors } } = useForm<LoginForm>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [tutors, setTutors] = useState<Record<string, Tutor>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [subjects, setSubjects] = useState<Record<string, Subject>>({});
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});
  const [availability, setAvailability] = useState<Record<string, Availability[]>>({});
  const [bookings, setBookings] = useState<Booking[]>([]); // Used in bookSession function
  const [filteredCourses, setFilteredCourses] = useState<(Course & { score: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set()); // Used in handleImageError function
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<any>(null); // TODO: Replace with proper User type from Supabase
  const [editAvailability, setEditAvailability] = useState<{ tutorId: string; day: number } | null>(null);
  const [bookingModal, setBookingModal] = useState<Course | null>(null);
  const [loginModal, setLoginModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingForm, setBookingForm] = useState({ notes: '', duration: 60 });
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const [coursesData, tutorsData, profilesData, subjectsData, reviewsData, availabilityData, bookingsData] = await Promise.all([
          supabase.from('courses').select('*').eq('is_active', true),
          supabase.from('tutors').select('*'),
          supabase.from('profiles').select('*').eq('role', 'tutor'),
          supabase.from('subjects').select('*'),
          supabase.from('reviews').select('*'),
          supabase.from('tutor_availability').select('*'),
          supabase.from('bookings').select('*'),
        ]);

        if (coursesData.error) {
          console.error('Error fetching courses:', coursesData.error);
        } else {
          console.log('Loaded courses:', coursesData.data);
          setCourses(coursesData.data || []);
        }

        if (tutorsData.error) console.error('Error fetching tutors:', tutorsData.error);
        else setTutors(tutorsData.data?.reduce((acc, tutor) => ({ ...acc, [tutor.id]: tutor }), {}) || {});

        if (profilesData.error) console.error('Error fetching profiles:', profilesData.error);
        else setProfiles(profilesData.data?.reduce((acc, profile) => ({ ...acc, [profile.id]: profile }), {}) || {});

        if (subjectsData.error) console.error('Error fetching subjects:', subjectsData.error);
        else setSubjects(subjectsData.data?.reduce((acc, subject) => ({ ...acc, [subject.id]: subject }), {}) || {});

        if (reviewsData.error) console.error('Error fetching reviews:', reviewsData.error);
        else setReviews(reviewsData.data?.reduce((acc, review) => ({ ...acc, [review.course_id]: [...(acc[review.course_id] || []), review] }), {}) || {});

        if (availabilityData.error) console.error('Error fetching availability:', availabilityData.error);
        else setAvailability(availabilityData.data?.reduce((acc, avail) => ({ ...acc, [avail.tutor_id]: [...(acc[avail.tutor_id] || []), avail] }), {}) || {});

        if (bookingsData.error) console.error('Error fetching bookings:', bookingsData.error);
        else setBookings(bookingsData.data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const getSafeAvatarUrl = (course: Course): string => {
    const profile = profiles[course.tutor_id];
    if (profile?.avatar_url) return profile.avatar_url;
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNjAiIHI9IjMwIiBmaWxsPSIjOEU5MEE2Ii8+CjxwYXRoIGQ9Ik0wIDE1MEMwIDEzMyA0My4zMzMzIDEyNS43NSw3NSAxMjUuNzVDMTA2LjY2NyAxMjUuNzUsMTUwIDEzMyAxNTAgMTUwSDBaIiBmaWxsPSIjOEU5MEE2Ii8+Cjwvc3ZnPgo=';
  };

  const handleImageError = (courseId: string) => {
    setImageErrors(prev => new Set(prev).add(courseId));
  };

  const getGradeFromTitle = (course: Course): number => {
    const title = course.title.toLowerCase();
    const gradeMatch = title.match(/grade\s*(\d+)|gr\s*(\d+)|g\s*(\d+)/i);
    if (gradeMatch) for (let i = 1; i <= 3; i++) if (gradeMatch[i]) {
      const grade = parseInt(gradeMatch[i]);
      if (grade >= 1 && grade <= 12) return grade;
    }
    const numberMatch = title.match(/\b(\d+)\b/);
    if (numberMatch) {
      const grade = parseInt(numberMatch[1]);
      if (grade >= 1 && grade <= 12) return grade;
    }
    return course.grade_level;
  };

  const getSubjectName = (course: Course): string => {
    // Check if course has subject field (new format) or subject_id (old format)
    if (course.subject) {
      return course.subject;
    }

    if (course.subject_id) {
      const subject = subjects[course.subject_id];
      if (subject?.name) return subject.name;
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
    if (course.subject_id) {
      const subject = subjects[course.subject_id];
      if (subject?.grade_levels) return subject.grade_levels;
    }
    return [titleGrade];
  };

  const getSchoolName = (course: Course): string => {
    const profile = profiles[course.tutor_id];
    if (profile?.school_name) return profile.school_name;
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
    if (profile?.first_name && profile?.last_name) return `${profile.first_name} ${profile.last_name}`;
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

    // More flexible matching - give points even for partial matches
    if (subjectName === prefs.subject) score += 40;
    else if (prefs.subject && subjectName.toLowerCase().includes(prefs.subject.toLowerCase())) score += 20;

    if (gradeLevels.includes(parseInt(prefs.grade))) score += 30;
    else if (prefs.grade && Math.abs(gradeLevels[0] - parseInt(prefs.grade)) <= 2) score += 15; // Within 2 grades

    if (schoolName === prefs.location) score += 20;
    else if (prefs.location && schoolName.toLowerCase().includes(prefs.location.toLowerCase())) score += 10;

    if (isVerified) score += 5;
    if (rating >= 4.0) score += 5;

    // Give base score to all courses so they show up
    score += 10;

    return score;
  };

  const submitReview = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      setLoginModal(true);
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
    if (error) console.error('Error submitting review:', error.message);
    else {
      const { data } = await supabase.from('reviews').select('*').eq('course_id', courseId);
      setReviews(prev => ({ ...prev, [courseId]: data || [] }));
      (document.getElementById(`rating-${courseId}`) as HTMLInputElement).value = '';
      (document.getElementById(`comment-${courseId}`) as HTMLTextAreaElement).value = '';
      setSelectedCourse(null);
    }
  };

  const updateAvailability = async (tutorId: string, day: number, startTime: string, endTime: string) => {
    if (!user || !tutors[user.id]) {
      alert('Please log in as a tutor to set availability.');
      setLoginModal(true);
      return;
    }
    const { error } = await supabase
      .from('tutor_availability')
      .upsert(
        { tutor_id: tutorId, day_of_week: day, start_time: startTime, end_time: endTime, is_available: true },
        { onConflict: 'tutor_id,day_of_week' }
      );
    if (error) console.error('Error updating availability:', error.message);
    else {
      const { data } = await supabase.from('tutor_availability').select('*').eq('tutor_id', tutorId);
      setAvailability(prev => ({ ...prev, [tutorId]: data || [] }));
      setEditAvailability(null);
    }
  };

  const bookSession = async (course: Course, start: string) => {
    if (!user) {
      alert('Please log in to book a session.');
      setLoginModal(true);
      return;
    }
    const bookingDate = new Date(start).toISOString();
    const { error } = await supabase
      .from('bookings')
      .insert({ user_id: user.id, tutor_id: course.tutor_id, course_id: course.id, booking_date: bookingDate });
    if (error) console.error('Error booking session:', error.message);
    else {
      setBookings(prev => [...prev, { id: crypto.randomUUID(), user_id: user.id, tutor_id: course.tutor_id, course_id: course.id, booking_date: bookingDate, status: 'pending', created_at: new Date().toISOString() }]);
      setBookingModal(null);
    }
  };

  const onSubmitSearch: SubmitHandler<FormInputs> = (data) => {
    if (!user) {
      alert('Please log in to search for courses.');
      setLoginModal(true);
      return;
    }
    setHasSearched(true);

    console.log('Search data:', data);
    console.log('Available courses:', courses);

    if (courses.length === 0) {
      console.log('No courses available');
      setFilteredCourses([]);
      return;
    }

    const matches = courses
      .map((course) => {
        const score = calculateMatchScore(course, data);
        console.log(`Course: ${course.title}, Score: ${score}, Grade: ${course.grade_level}, Subject: ${getSubjectName(course)}`);
        return {
          ...course,
          score: score,
        };
      })
      .filter((course) => course.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Show more courses

    console.log('Filtered matches:', matches);
    setFilteredCourses(matches);
  };

  const handleLogin: SubmitHandler<LoginForm> = async (data) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) alert('Login failed: ' + error.message);
    else setLoginModal(false);
  };

  const getDisplayGrade = (course: Course): string => {
    const gradeLevels = getGradeLevels(course);
    return `Grade ${gradeLevels[0]}`;
  };

  const getAvailabilityText = (tutorId: string): string => {
    const avail = availability[tutorId] || [];
    if (avail.length === 0) return 'No availability set';
    return avail.map(a => `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][a.day_of_week]}: ${a.start_time} - ${a.end_time}`).join(', ');
  };

  const getCalendarEvents = (tutorId: string): CalendarEvent[] => {
    const avail = availability[tutorId] || [];
    const events: CalendarEvent[] = [];
    const now = new Date();
    avail.forEach(a => {
      const day = a.day_of_week;
      const [startHours, startMinutes] = a.start_time.split(':').map(Number);
      const [endHours, endMinutes] = a.end_time.split(':').map(Number);
      const startDate = new Date(now);
      startDate.setDate(now.getDate() + (day - now.getDay() + 7) % 7);
      startDate.setHours(startHours, startMinutes, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(endHours, endMinutes, 0, 0);
      if (startDate >= now) {
        events.push({
          id: a.id,
          title: 'Available',
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: false,
          extendedProps: { tutorId: tutorId, courseId: courses.find(c => c.tutor_id === tutorId)?.id || '' },
        });
      }
    });
    return events;
  };

  const handleEventClick = (info: any) => {
    if (user && bookingModal) {
      bookSession(bookingModal, info.event.startStr);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    if (!user) {
      alert('Please log in to book a session');
      return;
    }

    const start = selectInfo.startStr;
    const end = selectInfo.endStr;

    setSelectedTimeSlot({ start, end });

    // Clear the selection
    selectInfo.view.calendar.unselect();
  };

  const handleSimpleTimeSelection = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const endDateTime = new Date(startDateTime.getTime() + bookingForm.duration * 60000);

    setSelectedTimeSlot({
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString()
    });
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    // Generate next 14 days
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  };

  const getAvailableTimes = () => {
    return [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
    ];
  };

  const handleBookSession = async () => {
    if (!user || !bookingModal || !selectedTimeSlot) {
      alert('Please select a time slot to book');
      return;
    }

    console.log('Attempting to book session with data:', {
      student_id: user.id,
      tutor_id: bookingModal.tutor_id,
      course_id: bookingModal.id,
      start_time: selectedTimeSlot.start,
      end_time: selectedTimeSlot.end,
      status: 'pending',
      notes: bookingForm.notes
    });

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          student_id: user.id,
          tutor_id: bookingModal.tutor_id,
          course_id: bookingModal.id,
          start_time: selectedTimeSlot.start,
          end_time: selectedTimeSlot.end,
          status: 'pending',
          notes: bookingForm.notes,
          created_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error('Database error details:', error);
        alert(`Failed to book session: ${error.message}. Please check if the bookings table exists.`);
        return;
      }

      console.log('Booking created successfully:', data);
      alert('Session booked successfully! The tutor will confirm your booking.');
      setBookingModal(null);
      setSelectedTimeSlot(null);
      setSelectedDate('');
      setSelectedTime('');
      setBookingForm({ notes: '', duration: 60 });
    } catch (err) {
      console.error('Exception during booking:', err);

      // Fallback: If database fails, show a success message anyway for demo purposes
      if (err instanceof Error && err.message.includes('relation "bookings" does not exist')) {
        alert('Session booking request submitted! (Note: Bookings table not set up yet - this is a demo booking)');
        setBookingModal(null);
        setSelectedTimeSlot(null);
        setSelectedDate('');
        setSelectedTime('');
        setBookingForm({ notes: '', duration: 60 });
        return;
      }

      alert(`Failed to book session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <nav className="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Brain Hub LMS</h1>
          {user ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setUser(null);
              }}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => setLoginModal(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Log In
            </button>
          )}
        </nav>

        <form onSubmit={handleSubmitSearch(onSubmitSearch)} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <select
                {...registerSearch('subject')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physical Sciences">Physical Sciences</option>
                <option value="English Home Language">English Home Language</option>
                <option value="English">English</option>
                <option value="Natural Sciences">Natural Sciences</option>
                <option value="Accounting">Accounting</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade</label>
              <select
                {...registerSearch('grade')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Grades</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                {...registerSearch('location')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Locations</option>
                <option value="Phuthaditjhaba High">Phuthaditjhaba</option>
                <option value="University Of Cape TOwn">Cape Town</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              disabled={loading}
            >
              {loading ? 'Loading Courses...' : 'Find Courses'}
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('Showing all courses');
                setFilteredCourses(courses.map(course => ({ ...course, score: 50 })));
                setHasSearched(true);
              }}
              className="flex-1 bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Show All Courses
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Top Matching Courses ({filteredCourses.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto max-h-[70vh] pr-4">
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
                    <p className="text-gray-600">
                      <span className="font-medium">Availability:</span> {getAvailabilityText(course.tutor_id)}
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
                    <button
                      onClick={() => setBookingModal(course)}
                      className="block w-full text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                      disabled={!user}
                    >
                      Book Session
                    </button>
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                      disabled={!user}
                    >
                      Add Review
                    </button>
                    {user?.id === course.tutor_id && (
                      <button
                        onClick={() => setEditAvailability({ tutorId: course.tutor_id, day: new Date().getDay() })}
                        className="block w-full text-center bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
                      >
                        Set Availability
                      </button>
                    )}
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

        {editAvailability && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Set Availability for {getTutorName({ tutor_id: editAvailability.tutorId } as any)}</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const startTime = (document.getElementById(`start-${editAvailability.tutorId}-${editAvailability.day}`) as HTMLInputElement)?.value;
                const endTime = (document.getElementById(`end-${editAvailability.tutorId}-${editAvailability.day}`) as HTMLInputElement)?.value;
                if (startTime && endTime) updateAvailability(editAvailability.tutorId, editAvailability.day, startTime, endTime);
              }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Day: {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][editAvailability.day]}</label>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    id={`start-${editAvailability.tutorId}-${editAvailability.day}`}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    id={`end-${editAvailability.tutorId}-${editAvailability.day}`}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditAvailability(null)}
                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Save Availability
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {bookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Book Session for {bookingModal.title}</h2>

              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Select Date</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {getAvailableDates().map((date) => {
                      const dateObj = new Date(date);
                      const isSelected = selectedDate === date;
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          <div>{dateObj.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div>{dateObj.getDate()}</div>
                          <div className="text-xs">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Select Time</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getAvailableTimes().map((time) => {
                      const isSelected = selectedTime === time;
                      return (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-colors ${isSelected
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Session Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Session Details</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Duration
                      </label>
                      <select
                        value={bookingForm.duration}
                        onChange={(e) => setBookingForm({ ...bookingForm, duration: parseInt(e.target.value) })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (optional)
                      </label>
                      <textarea
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                        placeholder="Any specific topics you'd like to focus on..."
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Selected Time Display */}
                {selectedDate && selectedTime && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Selected Session:</h4>
                    <p className="text-green-700">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} at {selectedTime}
                    </p>
                    <p className="text-green-600 text-sm">
                      Duration: {bookingForm.duration} minutes
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setBookingModal(null);
                      setSelectedTimeSlot(null);
                      setSelectedDate('');
                      setSelectedTime('');
                      setBookingForm({ notes: '', duration: 60 });
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSimpleTimeSelection}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    Confirm Time
                  </button>
                  <button
                    type="button"
                    onClick={handleBookSession}
                    disabled={!selectedTimeSlot}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    Book Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Log In</h2>
              <form onSubmit={handleSubmitLogin(handleLogin)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    {...registerLogin('email', { required: 'Email is required' })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                  {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    {...registerLogin('password', { required: 'Password is required' })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  />
                  {loginErrors.password && <p className="text-red-500 text-sm mt-1">{loginErrors.password.message}</p>}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setLoginModal(false)}
                    className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Log In
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