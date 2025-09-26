import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from './lib/supabase'; // Adjust path to your Supabase client
import { Link } from 'react-router-dom';

// Define types for form inputs and tutor data
interface FormInputs {
  subject: string;
  grade: string;
  language: string;
  location: string;
}

interface Tutor {
  id: string;
  name: string;
  subjects: string[];
  language: string;
  location: string;
  bio: string;
  photo_url: string;
}

// Mock AI scoring function
const calculateMatchScore = (tutor: Tutor, prefs: FormInputs): number => {
  let score = 0;
  if (tutor.subjects.includes(prefs.subject)) score += 40;
  if (tutor.language === prefs.language) score += 30;
  if (tutor.location === prefs.location) score += 20;
  if (prefs.grade && tutor.subjects.some((s) => s.includes(prefs.grade))) score += 10;
  return score;
};

const MatchingPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<(Tutor & { score: number })[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch tutors from Supabase on mount
  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('tutors').select('*');
      if (error) {
        console.error('Error fetching tutors:', error);
      } else {
        setTutors(data || []);
      }
      setLoading(false);
    };
    fetchTutors();
  }, []);

  // Handle form submission
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    const matches = tutors
      .map((tutor) => ({
        ...tutor,
        score: calculateMatchScore(tutor, data),
      }))
      .filter((tutor) => tutor.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Show top 3 matches
    setFilteredTutors(matches);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Find Your Perfect Tutor</h1>
        
        {/* Form */}
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
                <option value="Physical Science">Physical Science</option>
                <option value="English">English</option>
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
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
              {errors.grade && <p className="text-red-500 text-sm">{errors.grade.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                {...register('language', { required: 'Language is required' })}
                className="mt-1 block w-full p-2 border rounded-md"
              >
                <option value="">Select Language</option>
                <option value="Zulu">Zulu</option>
                <option value="Sotho">Sotho</option>
                <option value="English">English</option>
              </select>
              {errors.language && <p className="text-red-500 text-sm">{errors.language.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                {...register('location', { required: 'Location is required' })}
                className="mt-1 block w-full p-2 border rounded-md"
              >
                <option value="">Select Location</option>
                <option value="Phuthaditjhaba">Phuthaditjhaba</option>
                <option value="Harrismith">Harrismith</option>
                <option value="Online">Online</option>
              </select>
              {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Find Tutors'}
          </button>
        </form>

        {/* Results */}
        {loading && <p className="text-center">Loading tutors...</p>}
        {filteredTutors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTutors.map((tutor) => (
              <div key={tutor.id} className="bg-white p-4 rounded-lg shadow-md">
                <img
                  src={tutor.photo_url || 'https://via.placeholder.com/150'}
                  alt={tutor.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold text-center">{tutor.name}</h2>
                <p className="text-gray-600">Subjects: {tutor.subjects.join(', ')}</p>
                <p className="text-gray-600">Language: {tutor.language}</p>
                <p className="text-gray-600">Location: {tutor.location}</p>
                <p className="text-gray-600">Match Score: <span className="text-green-600">{tutor.score}%</span></p>
                <p className="text-gray-500 text-sm mt-2">{tutor.bio}</p>
                <Link
                  to={`/tutor/${tutor.id}`}
                  className="block mt-4 text-center bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        )}
        {filteredTutors.length === 0 && !loading && (
          <p className="text-center text-gray-600">No tutors found. Try different filters.</p>
        )}
      </div>
    </div>
  );
};

export default MatchingPage;