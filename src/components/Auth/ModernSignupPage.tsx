import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

const ModernSignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [role, setRole] = useState<'student' | 'tutor' | 'parent'>('student');
  const [gradeLevel, setGradeLevel] = useState(10);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const availableSubjects = [
    'Mathematics',
    'Mathematical Literacy',
    'Physical Sciences',
    'Life Sciences',
    'English Home Language',
    'Afrikaans FAL',
    'Accounting',
    'Business Studies',
    'Economic & Management Sciences',
    'Natural Sciences'
  ];

  const handleSubjectToggle = (subject: string) => {
    setSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

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
            phone_number: phone,
            grade_level: role === 'student' ? gradeLevel : undefined,
            bio: `New ${role} on Brain Hub LMS`,
            avatar_url: 'https://via.placeholder.com/100',
          });
        if (profileError) throw profileError;

        alert('🎉 Registration successful! Welcome to Brain Hub LMS. You can now log in.');
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !role) {
      setError('Please select your role');
      return;
    }
    if (step === 2 && (!email || !password || !confirmPassword)) {
      setError('Please fill in all required fields');
      return;
    }
    if (step === 2 && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Brain Hub LMS
              </span>
            </Link>
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Already have an account? <span className="text-blue-600">Sign In</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3].map((num) => (
                <React.Fragment key={num}>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                    step >= num 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`w-24 h-1 mx-2 transition-all ${
                      step > num ? 'bg-blue-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-4 max-w-md mx-auto">
              <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                Choose Role
              </span>
              <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                Account Info
              </span>
              <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                Personal Details
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
            <form onSubmit={handleSignup}>
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Choose Role */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Welcome to Brain Hub! 👋
                    </h2>
                    <p className="text-gray-600">
                      Let's get started by selecting your role
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Student Card */}
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-8 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        role === 'student'
                          ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-6xl mb-4">🎓</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Student</h3>
                      <p className="text-sm text-gray-600">
                        Learn from expert tutors and excel in your studies
                      </p>
                      {role === 'student' && (
                        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">
                          ✓ Selected
                        </div>
                      )}
                    </button>

                    {/* Tutor Card */}
                    <button
                      type="button"
                      onClick={() => setRole('tutor')}
                      className={`p-8 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        role === 'tutor'
                          ? 'border-green-600 bg-gradient-to-br from-green-50 to-green-100 shadow-lg'
                          : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-6xl mb-4">👨‍🏫</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Tutor</h3>
                      <p className="text-sm text-gray-600">
                        Share your knowledge and help students succeed
                      </p>
                      {role === 'tutor' && (
                        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-600 text-white text-xs font-medium">
                          ✓ Selected
                        </div>
                      )}
                    </button>

                    {/* Parent Card */}
                    <button
                      type="button"
                      onClick={() => setRole('parent')}
                      className={`p-8 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        role === 'parent'
                          ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Parent</h3>
                      <p className="text-sm text-gray-600">
                        Monitor your child's learning journey and progress
                      </p>
                      {role === 'parent' && (
                        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-medium">
                          ✓ Selected
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Account Information */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Create Your Account 🔐
                    </h2>
                    <p className="text-gray-600">
                      Set up your login credentials
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">At least 6 characters long</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Personal Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Tell Us About Yourself 📝
                    </h2>
                    <p className="text-gray-600">
                      Just a few more details to personalize your experience
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., New Horizon College"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="e.g., 061 412 8252"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Grade Level for Students */}
                  {role === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grade Level *
                      </label>
                      <select
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(parseInt(e.target.value))}
                      >
                        {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                          <option key={grade} value={grade}>Grade {grade}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Subjects for Students */}
                  {role === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Subjects You Need Help With (Optional)
                      </label>
                      <p className="text-xs text-gray-500 mb-3">Select all that apply. You can change this later.</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableSubjects.map((subject) => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => handleSubjectToggle(subject)}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              subjects.includes(subject)
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-200 hover:border-blue-300 text-gray-700'
                            }`}
                          >
                            {subjects.includes(subject) && '✓ '}
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subjects for Tutors */}
                  {role === 'tutor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Subjects You Can Teach (Optional)
                      </label>
                      <p className="text-xs text-gray-500 mb-3">Select all that apply. You can update this in your profile.</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableSubjects.map((subject) => (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => handleSubjectToggle(subject)}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              subjects.includes(subject)
                                ? 'border-green-600 bg-green-50 text-green-600'
                                : 'border-gray-200 hover:border-green-300 text-gray-700'
                            }`}
                          >
                            {subjects.includes(subject) && '✓ '}
                            {subject}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </span>
                      ) : (
                        '🎉 Complete Registration'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-1">Secure & Private</h3>
              <p className="text-sm text-gray-600">Your data is encrypted and protected</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-1">Quick Setup</h3>
              <p className="text-sm text-gray-600">Get started in under 2 minutes</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-1">Expert Tutors</h3>
              <p className="text-sm text-gray-600">Learn from qualified professionals</p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6 text-center">Why Join Brain Hub?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="text-3xl mr-4">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Flexible Scheduling</h4>
                  <p className="text-blue-100 text-sm">Book sessions that fit your timetable</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-3xl mr-4">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Track Progress</h4>
                  <p className="text-blue-100 text-sm">Monitor improvement with detailed analytics</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-3xl mr-4">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Quality Materials</h4>
                  <p className="text-blue-100 text-sm">Access worksheets, notes, and resources</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-3xl mr-4">✓</div>
                <div>
                  <h4 className="font-semibold mb-1">Community Events</h4>
                  <p className="text-blue-100 text-sm">Join Sports Day and academic competitions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSignupPage;
