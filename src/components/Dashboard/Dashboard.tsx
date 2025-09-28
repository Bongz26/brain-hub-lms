import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { profileService } from '../../services/profileService';
import { Profile } from '../../types/profile';
import { EditProfile } from '../Profile/EditProfile';
import { ProfileSetup } from '../Profile/ProfileSetup';
import { TutorDashboard } from '../Tutor/TutorDashboard';
import StudentDashboard from '../Student/StudentDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const userProfile = await profileService.getCurrentProfile();
          console.log('Fetched profile:', userProfile); // Debug log
          setProfile(userProfile);
        } catch (error) {
          console.error('Error loading profile:', error);
          setProfile(null); // No profile found
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleProfileUpdate = async () => {
    const updatedProfile = await profileService.getCurrentProfile();
    setProfile(updatedProfile);
    setShowEditProfile(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no profile exists, show profile setup
  if (!profile) {
    return <ProfileSetup />;
  }

  // Route based on user role
  if (profile.role === 'tutor') {
    return <TutorDashboard />;
  } else if (profile.role === 'student') {
    return <StudentDashboard user={user} profile={profile} />;
  } else if (profile.role === 'admin') {
    return <div className="max-w-7xl mx-auto px-4 py-8">Admin Dashboard (TBD)</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Brain Hub LMS</h1>
          <div className="flex items-center space-x-6">
            <span className="text-gray-700">
              Welcome, {profile?.first_name || user?.email || 'User'}
            </span>
            <button
              onClick={() => setShowEditProfile(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-blue-800">User Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong className="text-blue-700">Name:</strong> {profile?.first_name || ''} {profile?.last_name || ''}</p>
                  <p><strong className="text-blue-700">Role:</strong> <span className="capitalize">{profile?.role || ''}</span></p>
                  <p><strong className="text-blue-700">Grade:</strong> {profile?.grade_level ? `Grade ${profile.grade_level}` : 'N/A'}</p>
                  <p><strong className="text-blue-700">School:</strong> {profile?.school_name || 'Not specified'}</p>
                  <p><strong className="text-blue-700">Phone:</strong> {profile?.phone_number || 'Not specified'}</p>
                  {profile?.bio && <p><strong className="text-blue-700">Bio:</strong> {profile.bio}</p>}
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4 text-green-800">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
                  >
                    Browse Courses
                  </button>
                  <button
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-200 font-medium"
                  >
                    My Courses
                  </button>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition duration-200 font-medium"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-yellow-800">Profile Completion</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: profile?.school_name && profile?.phone_number ? '100%' : profile?.school_name || profile?.phone_number ? '75%' : '50%' }}
                ></div>
              </div>
              <p className="text-sm text-yellow-700">
                {profile?.school_name && profile?.phone_number
                  ? '🎉 Profile complete! You have full access to all features.'
                  : 'Complete your profile to unlock all features.'}
              </p>
              {(!profile?.school_name || !profile?.phone_number) && (
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add missing information →
                </button>
              )}
            </div>
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
              <p className="text-gray-600 text-center py-4">
                Your learning activity will appear here once you enroll in courses.
              </p>
            </div>
          </div>
        </div>
      </main>

      {showEditProfile && (
        <EditProfile
          onCancel={() => setShowEditProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Dashboard;