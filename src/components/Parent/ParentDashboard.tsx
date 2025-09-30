import React, { useEffect, useState } from 'react';
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
  const [children, setChildren] = useState<Child[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentData();
  }, [user]);

  const loadParentData = async () => {
    if (!user) return;

    // Mock data for demonstration
    const mockChildren: Child[] = [
      {
        id: '1',
        name: 'Nthabiseng Mokoena',
        grade: 10,
        school: 'Phuthaditjhaba High School',
        progress: 85,
        lastActive: '2024-01-15',
        courses: 4,
        upcomingSessions: 2
      },
      {
        id: '2',
        name: 'Tebogo Mokoena',
        grade: 8,
        school: 'Phuthaditjhaba High School',
        progress: 72,
        lastActive: '2024-01-14',
        courses: 3,
        upcomingSessions: 1
      }
    ];

    const mockSessions: Session[] = [
      {
        id: '1',
        course: 'Mathematics',
        tutor: 'Mr. Thabo Radebe',
        date: '2024-01-20',
        time: '10:00 AM',
        status: 'confirmed'
      },
      {
        id: '2',
        course: 'English',
        tutor: 'Mr. Kgotso Nhlapo',
        date: '2024-01-22',
        time: '2:00 PM',
        status: 'pending'
      }
    ];

    const mockAssignments: Assignment[] = [
      {
        id: '1',
        title: 'Algebra Homework',
        subject: 'Mathematics',
        dueDate: '2024-01-18',
        status: 'completed',
        grade: 95
      },
      {
        id: '2',
        title: 'Essay Writing',
        subject: 'English',
        dueDate: '2024-01-25',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Science Project',
        subject: 'Science',
        dueDate: '2024-01-15',
        status: 'late'
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
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Dashboard</h1>
          <p className="text-gray-600">Monitor your children's learning progress and activities</p>
        </div>

        {/* Children Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {children.map((child) => (
            <div key={child.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{child.name}</h3>
                  <p className="text-gray-600">Grade {child.grade} • {child.school}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{child.progress}%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${child.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{child.courses}</div>
                  <div className="text-gray-600">Active Courses</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{child.upcomingSessions}</div>
                  <div className="text-gray-600">Upcoming Sessions</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Last active: {new Date(child.lastActive).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 Upcoming Sessions</h2>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{session.course}</h4>
                    <p className="text-sm text-gray-600">with {session.tutor}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString()} at {session.time}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    session.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📝 Recent Assignments</h2>
            <div className="space-y-4">
              {recentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                    <p className="text-sm text-gray-600">{assignment.subject}</p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    {assignment.grade && (
                      <p className="text-sm font-medium text-green-600">Grade: {assignment.grade}%</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assignment.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : assignment.status === 'late'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
              <div className="text-blue-600 font-medium">📊 View Detailed Reports</div>
              <div className="text-sm text-gray-600">See comprehensive progress analytics</div>
            </button>
            <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
              <div className="text-green-600 font-medium">💬 Contact Tutors</div>
              <div className="text-sm text-gray-600">Send messages to your child's tutors</div>
            </button>
            <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
              <div className="text-purple-600 font-medium">📅 Schedule Meeting</div>
              <div className="text-sm text-gray-600">Book a parent-teacher conference</div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
