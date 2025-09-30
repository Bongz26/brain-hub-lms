import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { demoUsers, demoCourses, demoBookings, demoAssignments, demoMaterials } from '../../data/demoData';
import { setupDatabase, checkDatabaseStatus } from '../../utils/databaseSetup';
import { Layout } from '../Layout/Layout';

const DemoSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [dbStatus, setDbStatus] = useState<Record<string, boolean>>({});

  const setupDemoData = async () => {
    setLoading(true);
    setStatus('Setting up database and demo data...');
    setProgress(0);

    try {
      // First, setup the database
      setStatus('Setting up database tables...');
      const dbSetupSuccess = await setupDatabase();
      if (!dbSetupSuccess) {
        setStatus('Database setup failed. Please check your Supabase connection.');
        return;
      }
      setProgress(20);
      // 1. Create demo users and profiles
      setStatus('Creating demo users...');
      for (const tutor of demoUsers.tutors) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: tutor.email,
          password: tutor.password,
        });

        if (authError && !authError.message.includes('already registered')) {
          throw authError;
        }

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              ...tutor.profile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) throw profileError;
        }
      }

      for (const student of demoUsers.students) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: student.email,
          password: student.password,
        });

        if (authError && !authError.message.includes('already registered')) {
          throw authError;
        }

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              ...student.profile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) throw profileError;
        }
      }
      setProgress(25);

      // 2. Create demo courses
      setStatus('Creating demo courses...');
      const { error: coursesError } = await supabase
        .from('courses')
        .upsert(demoCourses.map(course => ({
          ...course,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));

      if (coursesError) throw coursesError;
      setProgress(50);

      // 3. Create demo bookings
      setStatus('Creating demo bookings...');
      const { error: bookingsError } = await supabase
        .from('bookings')
        .upsert(demoBookings.map(booking => ({
          ...booking,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));

      if (bookingsError) throw bookingsError;
      setProgress(75);

      // 4. Create demo assignments
      setStatus('Creating demo assignments...');
      const { error: assignmentsError } = await supabase
        .from('assignments')
        .upsert(demoAssignments.map(assignment => ({
          ...assignment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));

      if (assignmentsError) throw assignmentsError;

      // 5. Create demo materials
      setStatus('Creating demo materials...');
      const { error: materialsError } = await supabase
        .from('materials')
        .upsert(demoMaterials.map(material => ({
          ...material,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));

      if (materialsError) throw materialsError;
      setProgress(100);

      setStatus('Demo data setup complete! 🎉');
    } catch (error) {
      console.error('Error setting up demo data:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearDemoData = async () => {
    if (!window.confirm('Are you sure you want to clear all demo data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setStatus('Clearing demo data...');

    try {
      // Clear all demo data
      await supabase.from('materials').delete().like('tutor_id', 'tutor-%');
      await supabase.from('assignments').delete().like('course_id', 'course-%');
      await supabase.from('bookings').delete().like('student_id', 'student-%');
      await supabase.from('courses').delete().like('id', 'course-%');
      await supabase.from('profiles').delete().like('id', 'tutor-%');
      await supabase.from('profiles').delete().like('id', 'student-%');

      setStatus('Demo data cleared successfully!');
    } catch (error) {
      console.error('Error clearing demo data:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkDbStatus = async () => {
    setLoading(true);
    setStatus('Checking database status...');
    
    try {
      const status = await checkDatabaseStatus();
      setDbStatus(status);
      setStatus('Database status checked successfully!');
    } catch (error) {
      console.error('Error checking database status:', error);
      setStatus('Error checking database status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Demo Setup</h1>
            <p className="text-gray-600 text-lg">
              Set up realistic demo data to showcase Brain Hub LMS features
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo Data Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">👨‍🏫 Tutors (3)</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Sarah Johnson - Mathematics Expert</li>
                    <li>• Mike Peterson - Science Teacher</li>
                    <li>• Emma Davis - English Literature</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">👨‍🎓 Students (3)</h3>
                  <ul className="text-green-700 space-y-1">
                    <li>• Alex Thompson - Grade 10</li>
                    <li>• Jessica Wilson - Grade 11</li>
                    <li>• David Brown - Grade 9</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">📚 Courses (4)</h3>
                  <ul className="text-purple-700 space-y-1">
                    <li>• Advanced Algebra</li>
                    <li>• Chemistry Fundamentals</li>
                    <li>• Creative Writing Workshop</li>
                    <li>• Physics Problem Solving</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">📅 Bookings (3)</h3>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• Scheduled tutoring sessions</li>
                    <li>• Meeting links included</li>
                    <li>• Various subjects covered</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Demo Credentials</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Tutor Accounts:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>📧 sarah.math@brainhub.com / demo123</li>
                      <li>📧 mike.science@brainhub.com / demo123</li>
                      <li>📧 emma.english@brainhub.com / demo123</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Student Accounts:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>📧 alex.student@brainhub.com / demo123</li>
                      <li>📧 jessica.student@brainhub.com / demo123</li>
                      <li>📧 david.student@brainhub.com / demo123</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mb-6">
              <button
                onClick={setupDemoData}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Setting up...' : 'Setup Demo Data'}
              </button>
              <button
                onClick={checkDbStatus}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Check DB Status
              </button>
              <button
                onClick={clearDemoData}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Clear Demo Data
              </button>
            </div>

            {loading && (
              <div className="mb-4">
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{status}</p>
              </div>
            )}

            {status && !loading && (
              <div className={`p-4 rounded-lg ${
                status.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                <p className="font-medium">{status}</p>
              </div>
            )}

            {Object.keys(dbStatus).length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Database Status:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(dbStatus).map(([table, exists]) => (
                    <div key={table} className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${exists ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="capitalize">{table}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Demo Scenarios to Try:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>1. Login as a tutor and create a new course</li>
                <li>2. Login as a student and browse available courses</li>
                <li>3. Book a tutoring session as a student</li>
                <li>4. Manage bookings as a tutor</li>
                <li>5. Upload learning materials as a tutor</li>
                <li>6. View student progress and analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DemoSetup;
