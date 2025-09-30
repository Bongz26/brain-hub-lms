import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ModernSignupPage from './components/Auth/ModernSignupPage';
import ErrorBoundary from './components/ErrorBoundary';
import MatchingPage from './MatchingPage';
import { ProfilePage } from './components/Profile/ProfilePage';
import StudentBookings from './components/Student/StudentBookings';
import TutorBookings from './components/Tutor/TutorBookings';
import DemoLanding from './components/Demo/DemoLanding';
import DemoSetup from './components/Demo/DemoSetup';
import CourseDetail from './components/Courses/CourseDetail';
// New feature imports
import ParentDashboard from './components/Parent/ParentDashboard';
import EventsPage from './components/Events/EventsPage';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import TransportationPage from './components/Transportation/TransportationPage';
import ShopPage from './components/Shop/ShopPage';
import MessagingSystem from './components/Communication/MessagingSystem';
import VirtualClassroomPage from './components/VirtualClassroom/VirtualClassroomPage';
import CommunityForum from './components/Community/CommunityForum';
import InteractiveQuiz from './components/Quiz/InteractiveQuiz';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

// Role-based Protected Route Component
const RoleProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
      setProfileLoading(false);
    };

    loadProfile();
  }, [user]);
  
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Role-based Bookings Route Component
const BookingsRoute: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.role === 'tutor') {
    return <TutorBookings />;
  } else if (profile?.role === 'student') {
    return <StudentBookings />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><ModernSignupPage /></PublicRoute>} />
      <Route path="/demo" element={<DemoLanding />} />
      <Route path="/demo-setup" element={<DemoSetup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/matching" element={<RoleProtectedRoute allowedRoles={['student']}><MatchingPage /></RoleProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><BookingsRoute /></ProtectedRoute>} />
      <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
      {/* New feature routes */}
      <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
      <Route path="/parent-dashboard" element={<RoleProtectedRoute allowedRoles={['parent']}><ParentDashboard /></RoleProtectedRoute>} />
      <Route path="/transportation" element={<ProtectedRoute><TransportationPage /></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagingSystem /></ProtectedRoute>} />
      <Route path="/virtual-classroom" element={<ProtectedRoute><VirtualClassroomPage /></ProtectedRoute>} />
      <Route path="/forum" element={<ProtectedRoute><CommunityForum /></ProtectedRoute>} />
      <Route path="/quizzes" element={<ProtectedRoute><InteractiveQuiz /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><div>Admin Dashboard (TBD)</div></ProtectedRoute>} />
      <Route path="/forgot-password" element={<div>Forgot Password Page (TBD)</div>} />
      </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
    </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;