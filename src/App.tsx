import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './App.css';

// Initialize Supabase (replace with your Supabase project details)
const supabase = createClient(
  'https://plbgqgoglmsjqjjuovoa.supabase.co', // e.g., https://xyz.supabase.co
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYmdxZ29nbG1zanFqanVvdm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NjIzNzksImV4cCI6MjA3NDIzODM3OX0.WGEOxghdxXdzkp-ZFQvBT0CzHbTZqO4ijeYUL_s_jtw'
);

interface Resource {
  id: number;
  name: string;
  subject: string;
  grade: number;
  type: 'worksheet' | 'notes' | 'past_paper' | null;
  link: string;
  is_dbe: boolean;
}

interface Quiz {
  id: number;
  subject: string;
  grade: number;
  question: string;
  correct_answer: string;
  options: string[];
}

interface QuizResult {
  id: number;
  question: string;
  answer: string;
  is_correct: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  role: 'student' | 'tutor' | 'admin';
  grade?: number;
  subjects: string[];
}

interface StudentProgress {
  subject: string;
  completion_percentage: number;
}

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchQuizResults(session.user.id);
        fetchStudentProgress(session.user.id);
      }
      setLoading(false);
    });

    fetchResources();
    fetchQuizzes();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchQuizResults(session.user.id);
        fetchStudentProgress(session.user.id);
      } else {
        setProfile(null);
        setQuizResults([]);
        setStudentProgress([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
    if (error) console.error('Profile fetch error:', error);
  };

  const fetchResources = async () => {
    const { data, error } = await supabase.from('resources').select('*');
    if (data) {
      console.log('Fetched resources:', data);
      setResources(data);
      localStorage.setItem('resources', JSON.stringify(data));
    }
    if (error) console.error('Resources fetch error:', error);
    if (!navigator.onLine) {
      const cached = localStorage.getItem('resources');
      if (cached) {
        const parsed = JSON.parse(cached);
        console.log('Cached resources:', parsed);
        setResources(parsed);
      }
    }
  };

  const fetchQuizzes = async () => {
    const { data, error } = await supabase.from('quizzes').select('*');
    if (data) setQuizzes(data);
    if (error) console.error('Quizzes fetch error:', error);
  };

  const fetchQuizResults = async (userId: string) => {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setQuizResults(data);
    if (error) console.error('Quiz results fetch error:', error);
  };

  const fetchStudentProgress = async (userId: string) => {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', userId);
    if (data) setStudentProgress(data);
    if (error) console.error('Progress fetch error:', error);
  };

  const updateStudentProgress = async (userId: string, subject: string, newPercentage: number) => {
    const { error } = await supabase
      .from('student_progress')
      .upsert({
        user_id: userId,
        subject,
        completion_percentage: newPercentage,
      }, { onConflict: 'user_id, subject' });
    if (!error) fetchStudentProgress(userId);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <Router>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} font-sans`}>
        <header className="bg-blue-900 text-white p-4 sticky top-0 z-50 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Katleho MyTutor</h1>
              <p className="text-sm opacity-80">CAPS-Aligned Tutoring (Grades 4–12)</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="bg-gray-700 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition"
              >
                {darkMode ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={toggleSidebar}
                className="lg:hidden bg-blue-700 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
              >
                {sidebarOpen ? 'Close' : 'Menu'}
              </button>
            </div>
          </div>
        </header>

        {user && (
          <nav
            className={`bg-blue-800 text-white w-64 p-6 fixed h-full z-40 transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0`}
          >
            <ul className="space-y-6">
              <li>
                <Link to="/" className="text-lg hover:text-blue-300 transition" onClick={() => setSidebarOpen(false)}>
                  Dashboard
                </Link>
              </li>
              {profile?.role === 'tutor' && (
                <li>
                  <Link to="/tutor" className="text-lg hover:text-blue-300 transition" onClick={() => setSidebarOpen(false)}>
                    Tutor Dashboard
                  </Link>
                </li>
              )}
              {profile?.role === 'admin' && (
                <li>
                  <Link to="/admin" className="text-lg hover:text-blue-300 transition" onClick={() => setSidebarOpen(false)}>
                    Admin Dashboard
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                      showNotification('Signed out successfully');
                    } catch (error) {
                      console.error('Sign-out error:', error);
                      showNotification('Sign-out failed. Try again.');
                    }
                  }}
                  className="text-lg text-red-300 hover:text-red-400 transition"
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </nav>
        )}

        <main className="flex-grow container mx-auto p-6 lg:ml-64 max-w-7xl">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<StudentDashboard user={user} profile={profile} resources={resources} quizzes={quizzes} quizResults={quizResults} setQuizResults={setQuizResults} updateStudentProgress={updateStudentProgress} studentProgress={studentProgress} showNotification={showNotification} />} />
              <Route path="/tutor" element={<TutorDashboard user={user} profile={profile} studentProgress={studentProgress} showNotification={showNotification} />} />
              <Route path="/admin" element={<AdminDashboard profile={profile} resources={resources} quizzes={quizzes} fetchResources={fetchResources} fetchQuizzes={fetchQuizzes} showNotification={showNotification} />} />
            </Routes>
          )}
        </main>

        {notification && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {notification}
          </div>
        )}

        <footer className="bg-blue-900 text-white text-center p-4 shadow-inner">
          <div className="container mx-auto">
            <p>Contact: info@katlehotutors.co.za | +27 61 412 8252</p>
            <p className="text-sm opacity-80">&copy; 2025 Katleho Private Tutors</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

const StudentDashboard: React.FC<{
  user: any;
  profile: UserProfile | null;
  resources: Resource[];
  quizzes: Quiz[];
  quizResults: QuizResult[];
  setQuizResults: React.Dispatch<React.SetStateAction<QuizResult[]>>;
  updateStudentProgress: (userId: string, subject: string, newPercentage: number) => Promise<void>;
  studentProgress: StudentProgress[];
  showNotification: (message: string) => void;
}> = ({ user, profile, resources, quizzes, quizResults, setQuizResults, updateStudentProgress, studentProgress, showNotification }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [quizAnswer, setQuizAnswer] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [resourceSearch, setResourceSearch] = useState('');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Rendering resources:', resources);
  }, [resources]);

  const handleAuth = async () => {
    try {
      setError('');
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        await supabase.from('users').insert({
          id: data.user?.id,
          email,
          role: 'student',
          grade: 12,
          subjects: ['Mathematics', 'Physical Sciences', 'English FAL', 'Life Orientation', 'Afrikaans FAL'],
        });
        showNotification('Sign-up successful! Check your email to verify.');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const submitQuiz = async (quiz: Quiz) => {
    const isCorrect = quizAnswer.trim().toLowerCase() === quiz.correct_answer.toLowerCase();
    const { error } = await supabase.from('quiz_results').insert({
      user_id: user.id,
      question: quiz.question,
      answer: quizAnswer,
      is_correct: isCorrect,
    });
    if (!error) {
      setQuizResults([...quizResults, {
        id: Date.now(),
        question: quiz.question,
        answer: quizAnswer,
        is_correct: isCorrect,
        created_at: new Date().toISOString(),
      }]);
      const newPercentage = Math.min(100, (quizResults.filter(r => r.is_correct && r.question.includes(quiz.subject)).length + (isCorrect ? 1 : 0)) * 10);
      await updateStudentProgress(user.id, quiz.subject, newPercentage);
      showNotification(isCorrect ? 'Correct answer!' : 'Incorrect. Try again!');
      setQuizAnswer('');
      setCurrentQuizIndex((prev) => (prev + 1) % quizzes.length);
    } else {
      showNotification('Quiz submission failed.');
    }
  };

  const downloadResource = async (resource: Resource) => {
    if (!navigator.onLine) {
      showNotification('Downloads unavailable offline.');
      return;
    }
    try {
      if (resource.is_dbe) {
        showNotification('Opening DBE resource...');
        window.open(resource.link, '_blank');
      } else {
        showNotification(`Downloading ${resource.name}...`);
        const link = document.createElement('a');
        link.href = resource.link;
        link.download = `${resource.name}.pdf`;
        link.click();
      }
    } catch (error) {
      showNotification('Download failed. Try again.');
    }
  };

  const filteredResources = resources.filter(r =>
    (!selectedGrade || r.grade === selectedGrade) &&
    (!selectedSubject || r.subject === selectedSubject) &&
    (resourceSearch ? r.name.toLowerCase().includes(resourceSearch.toLowerCase()) : true)
  );

  if (!user) {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
          />
        </div>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <button
          onClick={handleAuth}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 transition"
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-3 text-blue-600 text-center w-full text-sm hover:underline dark:text-blue-400"
        >
          {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
        </button>
      </section>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex] || quizzes[0];

  return (
    <>
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          Welcome, {profile?.email} ({profile?.role === 'student' ? `Grade ${profile?.grade}` : profile?.role})
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Access CAPS-aligned resources, take quizzes, and track progress. Download resources for offline use!
        </p>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Search Resources</label>
          <input
            type="text"
            value={resourceSearch}
            onChange={(e) => setResourceSearch(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name..."
          />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:space-x-4">
          <div className="flex-1 mb-4 sm:mb-0">
            <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Grade</label>
            <select
              onChange={(e) => setSelectedGrade(e.target.value ? Number(e.target.value) : null)}
              className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Grades</option>
              {[4, 6, 7, 8, 9, 10, 11, 12].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Subject</label>
            <select
              onChange={(e) => setSelectedSubject(e.target.value || null)}
              className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {['Mathematics', 'Physical Sciences', 'English FAL', 'Life Orientation', 'Afrikaans FAL'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">CAPS-Aligned Resources</h3>
          <ul className="space-y-3">
            {filteredResources.map(resource => (
              <li
                key={resource.id}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              >
                <div>
                  <span className="text-gray-900 dark:text-white font-medium">{resource.name} (Grade {resource.grade})</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    {resource.type ? resource.type.replace('_', ' ') : 'Unknown Type'} {resource.is_dbe ? '(DBE)' : ''}
                  </span>
                </div>
                <button
                  onClick={() => downloadResource(resource)}
                  className="text-blue-600 hover:underline dark:text-blue-400 text-sm"
                >
                  {navigator.onLine ? (resource.is_dbe ? 'View DBE' : 'Download') : 'Offline'}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Practice Quiz: {currentQuiz?.subject || 'Maths'} (10 Marks)</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
            <p className="mb-4 text-gray-900 dark:text-white font-medium">{currentQuiz?.question}</p>
            {currentQuiz?.options?.map((option, index) => (
              <label key={index} className="block mb-2">
                <input
                  type="radio"
                  name="quiz-answer"
                  value={option}
                  checked={quizAnswer === option}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
            <button
              onClick={() => submitQuiz(currentQuiz)}
              disabled={!quizAnswer}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              Submit
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Quiz History</h3>
          <ul className="space-y-3">
            {quizResults.map(result => (
              <li
                key={result.id}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm text-gray-900 dark:text-white"
              >
                {result.question}: {result.answer} ({result.is_correct ? 'Correct' : 'Incorrect'})
                <span className="text-sm text-gray-500 dark:text-gray-400 block mt-1">
                  {new Date(result.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Your Progress</h3>
        {studentProgress.map(progress => (
          <div key={progress.subject} className="mb-4">
            <p className="text-gray-600 dark:text-gray-300 mb-2">{progress.subject}: {progress.completion_percentage}%</p>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.completion_percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};

const TutorDashboard: React.FC<{ user: any; profile: UserProfile | null; studentProgress: StudentProgress[]; showNotification: (message: string) => void; }> = ({ profile, studentProgress, showNotification }) => {
  const [averageScores, setAverageScores] = useState<{ subject: string; average: number }[]>([]);

  useEffect(() => {
    const mockAverages = studentProgress.map(p => ({
      subject: p.subject,
      average: p.completion_percentage,
    }));
    setAverageScores(mockAverages);
  }, [studentProgress]);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Tutor Dashboard</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Manage student progress for {profile?.email}
      </p>
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Average Student Scores</h3>
        {averageScores.map(score => (
          <p key={score.subject} className="text-gray-600 dark:text-gray-300 mb-2">
            {score.subject}: {score.average}% average
          </p>
        ))}
        <button onClick={() => showNotification('Reports refreshed')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Refresh Reports
        </button>
      </div>
    </section>
  );
};

const AdminDashboard: React.FC<{
  profile: UserProfile | null;
  resources: Resource[];
  quizzes: Quiz[];
  fetchResources: () => Promise<void>;
  fetchQuizzes: () => Promise<void>;
  showNotification: (message: string) => void;
}> = ({ profile, resources, quizzes, fetchResources, fetchQuizzes, showNotification }) => {
  const [newResource, setNewResource] = useState({
    name: '',
    subject: '',
    grade: 12,
    type: 'worksheet' as 'worksheet' | 'notes' | 'past_paper',
    link: '',
    is_dbe: false,
  });
  const [newQuiz, setNewQuiz] = useState({
    subject: '',
    grade: 12,
    question: '',
    correct_answer: '',
    options: ['', '', ''], // At least 3 options
  });
  const [resourceError, setResourceError] = useState('');
  const [quizError, setQuizError] = useState('');

  if (profile?.role !== 'admin') {
    return (
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-300">Only admins can access this dashboard.</p>
      </section>
    );
  }

  const handleAddResource = async () => {
    if (!navigator.onLine) {
      showNotification('Cannot add resources offline.');
      return;
    }
    if (!newResource.name || !newResource.subject || !newResource.link) {
      setResourceError('Name, subject, and link are required.');
      return;
    }
    try {
      const { error } = await supabase.from('resources').insert([newResource]);
      if (error) throw error;
      setNewResource({ name: '', subject: '', grade: 12, type: 'worksheet', link: '', is_dbe: false });
      setResourceError('');
      fetchResources();
      showNotification('Resource added successfully.');
    } catch (error) {
      setResourceError('Failed to add resource.');
      showNotification('Failed to add resource.');
    }
  };

  const handleDeleteResource = async (id: number) => {
    if (!navigator.onLine) {
      showNotification('Cannot delete resources offline.');
      return;
    }
    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
      fetchResources();
      showNotification('Resource deleted successfully.');
    } catch (error) {
      showNotification('Failed to delete resource.');
    }
  };

  const handleAddQuiz = async () => {
    if (!navigator.onLine) {
      showNotification('Cannot add quizzes offline.');
      return;
    }
    if (!newQuiz.subject || !newQuiz.question || !newQuiz.correct_answer || newQuiz.options.some(o => !o)) {
      setQuizError('All fields and at least 3 options are required.');
      return;
    }
    try {
      const { error } = await supabase.from('quizzes').insert([newQuiz]);
      if (error) throw error;
      setNewQuiz({ subject: '', grade: 12, question: '', correct_answer: '', options: ['', '', ''] });
      setQuizError('');
      fetchQuizzes();
      showNotification('Quiz added successfully.');
    } catch (error) {
      setQuizError('Failed to add quiz.');
      showNotification('Failed to add quiz.');
    }
  };

  const handleDeleteQuiz = async (id: number) => {
    if (!navigator.onLine) {
      showNotification('Cannot delete quizzes offline.');
      return;
    }
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) throw error;
      fetchQuizzes();
      showNotification('Quiz deleted successfully.');
    } catch (error) {
      showNotification('Failed to delete quiz.');
    }
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Manage CAPS-aligned resources and quizzes for {profile?.email}</p>

      {/* Manage Resources */}
      <div className="mb-12">
        <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Manage Resources</h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Name</label>
              <input
                type="text"
                value={newResource.name}
                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Algebra Worksheet"
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Subject</label>
              <select
                value={newResource.subject}
                onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subject</option>
                {['Mathematics', 'Physical Sciences', 'English FAL', 'Life Orientation', 'Afrikaans FAL'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Grade</label>
              <select
                value={newResource.grade}
                onChange={(e) => setNewResource({ ...newResource, grade: Number(e.target.value) })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {[4, 6, 7, 8, 9, 10, 11, 12].map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Type</label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as 'worksheet' | 'notes' | 'past_paper' })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="worksheet">Worksheet</option>
                <option value="notes">Notes</option>
                <option value="past_paper">Past Paper</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Link</label>
              <input
                type="text"
                value={newResource.link}
                onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., https://www.education.gov.za/..."
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">DBE Resource</label>
              <input
                type="checkbox"
                checked={newResource.is_dbe}
                onChange={(e) => setNewResource({ ...newResource, is_dbe: e.target.checked })}
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
              />
            </div>
          </div>
          {resourceError && <p className="text-red-500 mt-4 text-sm">{resourceError}</p>}
          <button
            onClick={handleAddResource}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add Resource
          </button>
        </div>
        <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Existing Resources</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-900 dark:text-white">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Type</th>
                <th className="p-3">Link</th>
                <th className="p-3">DBE</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(resource => (
                <tr key={resource.id} className="border-b dark:border-gray-600">
                  <td className="p-3">{resource.name}</td>
                  <td className="p-3">{resource.subject}</td>
                  <td className="p-3">{resource.grade}</td>
                  <td className="p-3">{resource.type ? resource.type.replace('_', ' ') : 'Unknown'}</td>
                  <td className="p-3 truncate max-w-xs">
                    <a href={resource.link} className="text-blue-600 hover:underline dark:text-blue-400">{resource.link}</a>
                  </td>
                  <td className="p-3">{resource.is_dbe ? 'Yes' : 'No'}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Quizzes */}
      <div>
        <h3 className="text-xl font-medium mb-4 text-gray-900 dark:text-white">Manage Quizzes</h3>
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Subject</label>
              <select
                value={newQuiz.subject}
                onChange={(e) => setNewQuiz({ ...newQuiz, subject: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subject</option>
                {['Mathematics', 'Physical Sciences', 'English FAL', 'Life Orientation', 'Afrikaans FAL'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Grade</label>
              <select
                value={newQuiz.grade}
                onChange={(e) => setNewQuiz({ ...newQuiz, grade: Number(e.target.value) })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {[4, 6, 7, 8, 9, 10, 11, 12].map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Question</label>
              <input
                type="text"
                value={newQuiz.question}
                onChange={(e) => setNewQuiz({ ...newQuiz, question: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Simplify 2x + 3x - 5"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Correct Answer</label>
              <input
                type="text"
                value={newQuiz.correct_answer}
                onChange={(e) => setNewQuiz({ ...newQuiz, correct_answer: e.target.value })}
                className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5x - 5"
              />
            </div>
            {newQuiz.options.map((option, index) => (
              <div key={index}>
                <label className="block text-gray-700 dark:text-gray-200 mb-2 text-sm font-medium">Option {index + 1}</label>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const updatedOptions = [...newQuiz.options];
                    updatedOptions[index] = e.target.value;
                    setNewQuiz({ ...newQuiz, options: updatedOptions });
                  }}
                  className="border border-gray-300 dark:border-gray-600 p-3 rounded-lg w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
              </div>
            ))}
          </div>
          {quizError && <p className="text-red-500 mt-4 text-sm">{quizError}</p>}
          <button
            onClick={handleAddQuiz}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Add Quiz
          </button>
        </div>
        <h4 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Existing Quizzes</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-900 dark:text-white">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-600">
                <th className="p-3">Subject</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Question</th>
                <th className="p-3">Correct Answer</th>
                <th className="p-3">Options</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(quiz => (
                <tr key={quiz.id} className="border-b dark:border-gray-600">
                  <td className="p-3">{quiz.subject}</td>
                  <td className="p-3">{quiz.grade}</td>
                  <td className="p-3">{quiz.question}</td>
                  <td className="p-3">{quiz.correct_answer}</td>
                  <td className="p-3">{quiz.options.join(', ')}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default App;
