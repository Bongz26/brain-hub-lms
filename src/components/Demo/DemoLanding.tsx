import React from 'react';
import { Link } from 'react-router-dom';

const DemoLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">BH</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Brain Hub LMS</h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Learning Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect students with expert tutors, manage courses, track progress, and create an engaging learning experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/demo-setup" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg"
            >
              🚀 Setup Demo
            </Link>
            <Link 
              to="/" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 font-medium text-lg border border-blue-600"
            >
              Try Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600">Everything you need for effective online learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Tutors</h3>
              <p className="text-gray-600">Connect with qualified tutors across various subjects and grade levels.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Course Management</h3>
              <p className="text-gray-600">Create, organize, and manage comprehensive learning courses with ease.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Session Booking</h3>
              <p className="text-gray-600">Schedule one-on-one tutoring sessions with integrated calendar system.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Monitor student progress and performance with detailed analytics.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Assignments</h3>
              <p className="text-gray-600">Create and manage assignments with automated grading and feedback.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Communication</h3>
              <p className="text-gray-600">Seamless communication between tutors, students, and parents.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Accounts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Try the Demo</h2>
            <p className="text-lg text-gray-600">Login with these demo accounts to explore the platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">👨‍🏫 Tutor Accounts</h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Sarah Johnson - Math Expert</h4>
                  <p className="text-sm text-gray-600 mb-2">sarah.math@brainhub.com</p>
                  <p className="text-xs text-gray-500">Password: demo123</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Mike Peterson - Science Teacher</h4>
                  <p className="text-sm text-gray-600 mb-2">mike.science@brainhub.com</p>
                  <p className="text-xs text-gray-500">Password: demo123</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Emma Davis - English Literature</h4>
                  <p className="text-sm text-gray-600 mb-2">emma.english@brainhub.com</p>
                  <p className="text-xs text-gray-500">Password: demo123</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">👨‍🎓 Student Accounts</h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Alex Thompson - Grade 10</h4>
                  <p className="text-sm text-gray-600 mb-2">alex.student@brainhub.com</p>
                  <p className="text-xs text-gray-500">Password: demo123</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Jessica Wilson - Grade 11</h4>
                  <p className="text-sm text-gray-600 mb-2">jessica.student@brainhub.com</p>
                  <p className="text-xs text-gray-500">Password: demo123</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">David Brown - Grade 9</h4>
                  <p className="text-sm text-gray-600 mb-2">david.student@brainhub.com</p>
                  <p className="text-xs text-gray-500">Password: demo123</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link 
              to="/" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg"
            >
              Start Demo Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 Brain Hub LMS. Professional Learning Management System Demo.</p>
        </div>
      </footer>
    </div>
  );
};

export default DemoLanding;
