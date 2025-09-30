import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types/profile';
import NotificationCenter from '../Notifications/NotificationCenter';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error loading profile:', error);
          } else {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">Brain Hub LMS</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            {profile?.role === 'student' && (
              <Link 
                to="/matching" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Find Courses
              </Link>
            )}
            <Link 
              to="/bookings" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {profile?.role === 'tutor' ? 'Student Bookings' : 'My Bookings'}
            </Link>
            <Link 
              to="/events" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Events
            </Link>
            <Link 
              to="/shop" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Shop
            </Link>
            <Link 
              to="/transportation" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Transport
            </Link>
            <Link 
              to="/virtual-classroom" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Classroom
            </Link>
            <Link 
              to="/forum" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Forum
            </Link>
            {profile?.role === 'student' && (
              <>
                <Link 
                  to="/quizzes" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Quizzes
                </Link>
                <Link 
                  to="/analytics" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Analytics
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showMobileMenu ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-1 sm:space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {profile?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : user?.email || 'User'
                    }
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {profile?.role || 'User'}
                  </p>
                </div>
                <svg className="hidden sm:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <Link
                    to="/help"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Help & Support
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                📊 Dashboard
              </Link>
              {profile?.role === 'student' && (
                <Link
                  to="/matching"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setShowMobileMenu(false)}
                >
                  🔍 Find Courses
                </Link>
              )}
              <Link
                to="/bookings"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                📅 {profile?.role === 'tutor' ? 'Student Bookings' : 'My Bookings'}
              </Link>
              <Link
                to="/events"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                🎉 Events
              </Link>
              <Link
                to="/shop"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                🛒 Shop
              </Link>
              <Link
                to="/transportation"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                🚌 Transport
              </Link>
              <Link
                to="/virtual-classroom"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                💻 Virtual Classroom
              </Link>
              <Link
                to="/forum"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                💬 Forum
              </Link>
              {profile?.role === 'student' && (
                <>
                  <Link
                    to="/quizzes"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    📝 Quizzes
                  </Link>
                  <Link
                    to="/analytics"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    📊 Analytics
                  </Link>
                </>
              )}
              <hr className="my-2" />
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setShowMobileMenu(false)}
              >
                👤 Profile Settings
              </Link>
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  handleLogout();
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                🚪 Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
