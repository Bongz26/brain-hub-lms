import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [role, setRole] = useState<'student' | 'tutor' | 'parent'>('student');
  const [gradeLevel, setGradeLevel] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            role: role,
            school_name: schoolName,
            grade_level: role === 'student' ? gradeLevel : undefined,
            bio: `New ${role} profile`,
            avatar_url: 'https://via.placeholder.com/100',
          });
        if (profileError) throw profileError;

        alert('Signup successful! You can now log in.');
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Brain Hub as a student, tutor, or parent
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'student' 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-3xl mb-2">🎓</div>
                <div className="font-medium">Student</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('tutor')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'tutor' 
                    ? 'border-green-600 bg-green-50 text-green-600' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-3xl mb-2">👨‍🏫</div>
                <div className="font-medium">Tutor</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  role === 'parent' 
                    ? 'border-purple-600 bg-purple-50 text-purple-600' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-3xl mb-2">👨‍👩‍👧</div>
                <div className="font-medium">Parent</div>
              </button>
            </div>
          </div>

          <div>
            <input
              type="email"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="School Name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </div>
          
          {/* Grade Level for Students */}
          {role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade Level
              </label>
              <select
                required
                className="relative block w-full px-3 py-2 border border-gray-300 rounded-md"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(parseInt(e.target.value))}
              >
                {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;