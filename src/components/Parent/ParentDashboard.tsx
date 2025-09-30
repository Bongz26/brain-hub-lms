import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Layout } from '../Layout/Layout';

interface Child {
  id: string;
  name: string;
  grade: number;
  school: string;
  progress: number;
  lastActive: string;
  courses: number;
  upcomingSessions: number;
}

interface Session {
  id: string;
  course: string;
  tutor: string;
  date: string;
  time: string;
  status: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'completed' | 'pending' | 'late';
  grade?: number;
}

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  useEffect(() => {
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    if (!user) return;

    // Generate current dates for demo
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 5);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 3);

    // Mock data for demonstration with current dates
    const mockChildren: Child[] = [
      {
        id: '1',
        name: 'Nthabiseng Mokoena',
        grade: 10,
        school: 'Phuthaditjhaba High School',
        progress: 85,
        lastActive: yesterday.toISOString(),
        courses: 4,
        upcomingSessions: 2
      },
      {
        id: '2',
        name: 'Tebogo Mokoena',
        grade: 8,
        school: 'Phuthaditjhaba High School',
        progress: 72,
        lastActive: today.toISOString(),
        courses: 3,
        upcomingSessions: 1
      }
    ];

    const mockSessions: Session[] = [
      {
        id: '1',
        course: 'Mathematics',
        tutor: 'Mr. Thabo Radebe',
        date: tomorrow.toISOString(),
        time: '10:00 AM',
        status: 'confirmed'
      },
      {
        id: '2',
        course: 'English',
        tutor: 'Ms. Kgotso Nhlapo',
        date: nextWeek.toISOString(),
        time: '2:00 PM',
        status: 'pending'
      },
      {
        id: '3',
        course: 'Physical Science',
        tutor: 'Mr. Mpho Dlamini',
        date: nextWeek.toISOString(),
        time: '4:00 PM',
        status: 'confirmed'
      }
    ];

    const mockAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Algebra Practice Problems',
        subject: 'Mathematics',
        dueDate: lastWeek.toISOString(),
        status: 'completed',
        grade: 95
      },
      {
        id: '2',
        title: 'Creative Writing Essay',
        subject: 'English',
        dueDate: nextWeek.toISOString(),
        status: 'pending'
      },
      {
        id: '3',
        title: 'Chemistry Lab Report',
        subject: 'Physical Science',
        dueDate: yesterday.toISOString(),
        status: 'late'
      },
      {
        id: '4',
        title: 'History Research Project',
        subject: 'History',
        dueDate: tomorrow.toISOString(),
        status: 'pending'
      }
    ];

    setChildren(mockChildren);
    setUpcomingSessions(mockSessions);
    setRecentAssignments(mockAssignments);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👨‍👩‍👧‍👦 Parent Dashboard</h1>
          <p className="text-gray-600">Monitor your children's learning progress and activities</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div className="text-sm font-medium opacity-90">Total Children</div>
            <div className="text-3xl font-bold mt-2">{children.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div className="text-sm font-medium opacity-90">Active Courses</div>
            <div className="text-3xl font-bold mt-2">{children.reduce((sum, child) => sum + child.courses, 0)}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div className="text-sm font-medium opacity-90">Upcoming Sessions</div>
            <div className="text-3xl font-bold mt-2">{upcomingSessions.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div className="text-sm font-medium opacity-90">Pending Assignments</div>
            <div className="text-3xl font-bold mt-2">{recentAssignments.filter(a => a.status === 'pending').length}</div>
          </div>
        </div>

        {/* Children Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">👶 Children Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <div 
                key={child.id} 
                className={`bg-white rounded-lg shadow-md p-6 border-2 transition-all cursor-pointer hover:shadow-lg ${
                  selectedChild === child.id ? 'border-blue-500' : 'border-gray-200'
                }`}
                onClick={() => setSelectedChild(selectedChild === child.id ? null : child.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-600">Grade {child.grade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{child.progress}%</div>
                    <div className="text-xs text-gray-500">Progress</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span className="font-medium">{child.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        child.progress >= 80 ? 'bg-green-500' : 
                        child.progress >= 60 ? 'bg-blue-500' : 
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${child.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-blue-600">{child.courses}</div>
                    <div className="text-xs text-gray-600">Active Courses</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-purple-600">{child.upcomingSessions}</div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {child.school}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Last active: {new Date(child.lastActive).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">📅 Upcoming Sessions</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {upcomingSessions.length} sessions
              </span>
            </div>
            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50/50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{session.course}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          session.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">👨‍🏫 {session.tutor}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-3">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(session.date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {session.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No upcoming sessions scheduled</p>
              </div>
            )}
          </div>

          {/* Recent Assignments */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">📝 Recent Assignments</h2>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {recentAssignments.length} assignments
              </span>
            </div>
            {recentAssignments.length > 0 ? (
              <div className="space-y-3">
                {recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-start justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          assignment.status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : assignment.status === 'late'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">📚 {assignment.subject}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due: {new Date(assignment.dueDate).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                        </span>
                        {assignment.grade && (
                          <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                            {assignment.grade}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No recent assignments</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/analytics')}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all text-left border border-blue-200 hover:shadow-md"
            >
              <div className="text-blue-600 font-semibold mb-1 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Reports
              </div>
              <div className="text-sm text-gray-600">Detailed progress analytics</div>
            </button>
            <button 
              onClick={() => navigate('/forum')}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all text-left border border-green-200 hover:shadow-md"
            >
              <div className="text-green-600 font-semibold mb-1 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Tutors
              </div>
              <div className="text-sm text-gray-600">Message your child's tutors</div>
            </button>
            <button 
              onClick={() => navigate('/bookings')}
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all text-left border border-purple-200 hover:shadow-md"
            >
              <div className="text-purple-600 font-semibold mb-1 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule Meeting
              </div>
              <div className="text-sm text-gray-600">Book parent-teacher conference</div>
            </button>
            <button 
              onClick={() => navigate('/events')}
              className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all text-left border border-orange-200 hover:shadow-md"
            >
              <div className="text-orange-600 font-semibold mb-1 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                View Events
              </div>
              <div className="text-sm text-gray-600">Check upcoming school events</div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
