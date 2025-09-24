import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProfileSetup } from './components/Profile/ProfileSetup';
import { profileService } from './services/profileService';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        if (user) {
          console.log('User found, checking profile...');
          const exists = await profileService.profileExists();
          console.log('Profile exists:', exists);
          setProfileExists(exists);
        } else {
          console.log('No user found');
          setProfileExists(null);
        }
      } catch (err: any) {
        console.error('Error checking profile:', err);
        setError(err.message);
      }
    };

    if (!loading) {
      checkProfile();
    }
  }, [user, loading]);

  console.log('AppContent render:', { loading, user, profileExists, error });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Brain Hub...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show login if no user
  if (!user) {
    return <Login />;
  }

  // Show profile setup if no profile
  if (!profileExists) {
    return <ProfileSetup />;
  }

  // Show dashboard if user has profile
  return <Dashboard />;
};

export default AppContent;