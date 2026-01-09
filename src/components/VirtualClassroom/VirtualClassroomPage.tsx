import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../Layout/Layout';

interface ClassSession {
  id: string;
  title: string;
  tutor: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  meetingLink: string;
  status: 'scheduled' | 'live' | 'completed';
  participants: number;
  maxParticipants: number;
  hasRecording: boolean;
  recordingUrl?: string;
}

export const VirtualClassroomPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'live' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    // Generate current dates for 2025
    const today = new Date('2025-10-01');
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Mock virtual classroom sessions with 2025 dates
    const mockSessions: ClassSession[] = [
      {
        id: '1',
        title: 'Mathematics - Algebra Review',
        tutor: 'Mr. Thabo Radebe',
        subject: 'Mathematics',
        date: today.toISOString().split('T')[0],
        time: '10:00 AM',
        duration: 60,
        meetingLink: 'https://zoom.us/j/123456789',
        status: 'live',
        participants: 12,
        maxParticipants: 25,
        hasRecording: false
      },
      {
        id: '2',
        title: 'Physical Sciences - Chemistry Basics',
        tutor: 'Ms. Lerato Mofokeng',
        subject: 'Physical Sciences',
        date: tomorrow.toISOString().split('T')[0],
        time: '2:00 PM',
        duration: 90,
        meetingLink: 'https://teams.microsoft.com/meet/abc123',
        status: 'scheduled',
        participants: 8,
        maxParticipants: 20,
        hasRecording: false
      },
      {
        id: '3',
        title: 'English - Essay Writing Workshop',
        tutor: 'Mr. Kgotso Nhlapo',
        subject: 'English',
        date: yesterday.toISOString().split('T')[0],
        time: '3:00 PM',
        duration: 60,
        meetingLink: 'https://zoom.us/j/987654321',
        status: 'completed',
        participants: 15,
        maxParticipants: 20,
        hasRecording: true,
        recordingUrl: 'https://example.com/recording/essay-writing'
      }
    ];

    setSessions(mockSessions);
    setLoading(false);
  };

  const generateMeetingLink = () => {
    // In real app, this would integrate with Zoom/Teams API
    const randomId = Math.floor(Math.random() * 1000000000);
    return `https://zoom.us/j/${randomId}`;
  };

  const createVirtualClassroom = () => {
    const newLink = generateMeetingLink();
    alert(`🎥 Virtual Classroom Created!\n\nMeeting Link: ${newLink}\n\nShare this link with your students.`);
    setShowCreateModal(false);
  };

  const joinSession = (session: ClassSession) => {
    if (session.status === 'live') {
      window.open(session.meetingLink, '_blank');
    } else {
      alert(`📅 This session is scheduled for ${session.date} at ${session.time}. You can join when it starts!`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-600 text-white animate-pulse';
      case 'scheduled':
        return 'bg-blue-600 text-white';
      case 'completed':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return session.status === 'live';
    if (activeFilter === 'upcoming') return session.status === 'scheduled';
    if (activeFilter === 'past') return session.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎥 Virtual Classroom</h1>
            <p className="text-gray-600">Join live sessions or watch recordings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
          >
            + Create New Session
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          {[
            { value: 'all', label: 'All Sessions', icon: '📚' },
            { value: 'live', label: 'Live Now', icon: '🔴' },
            { value: 'upcoming', label: 'Upcoming', icon: '📅' },
            { value: 'past', label: 'Recordings', icon: '🎬' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeFilter === filter.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
              }`}
            >
              {filter.icon} {filter.label}
            </button>
          ))}
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Session Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{session.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(session.status)}`}>
                    {session.status === 'live' ? '🔴 LIVE' : session.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-blue-100">{session.subject} • {session.tutor}</p>
              </div>

              {/* Session Details */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(session.date).toLocaleDateString()} at {session.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{session.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Participants</p>
                    <p className="font-medium text-gray-900">
                      {session.participants}/{session.maxParticipants}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Platform</p>
                    <p className="font-medium text-gray-900">
                      {session.meetingLink.includes('zoom') ? 'Zoom' : 'Teams'}
                    </p>
                  </div>
                </div>

                {/* Participants Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Capacity</span>
                    <span>{Math.round((session.participants / session.maxParticipants) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(session.participants / session.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  {session.status === 'live' ? (
                    <button
                      onClick={() => joinSession(session)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium animate-pulse"
                    >
                      🔴 Join Live Session
                    </button>
                  ) : session.status === 'scheduled' ? (
                    <>
                      <button
                        onClick={() => joinSession(session)}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-medium"
                      >
                        📅 Session Details
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(session.meetingLink)}
                        className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium"
                      >
                        📋 Copy Link
                      </button>
                    </>
                  ) : (
                    <>
                      {session.hasRecording && (
                        <button
                          onClick={() => window.open(session.recordingUrl, '_blank')}
                          className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all font-medium"
                        >
                          🎬 Watch Recording
                        </button>
                      )}
                      <button
                        className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-all font-medium"
                      >
                        ✓ Completed
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Session Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🎥 Create Virtual Classroom</h2>
              
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Choose Your Platform:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        createVirtualClassroom();
                      }}
                      className="p-6 bg-white rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <div className="text-4xl mb-2">📹</div>
                      <h4 className="font-semibold">Zoom Meeting</h4>
                      <p className="text-sm text-gray-600 mt-1">Auto-generate Zoom link</p>
                    </button>
                    <button
                      onClick={() => {
                        const link = 'https://teams.microsoft.com/meet/' + Math.random().toString(36).substring(7);
                        alert(`🎥 Teams Meeting Created!\n\nLink: ${link}`);
                        setShowCreateModal(false);
                      }}
                      className="p-6 bg-white rounded-lg border-2 border-purple-600 hover:bg-purple-50 transition-all"
                    >
                      <div className="text-4xl mb-2">💼</div>
                      <h4 className="font-semibold">Microsoft Teams</h4>
                      <p className="text-sm text-gray-600 mt-1">Generate Teams link</p>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Features Included:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="text-green-600 mr-2">✓</span>
                      Screen Sharing
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="text-green-600 mr-2">✓</span>
                      Whiteboard
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="text-green-600 mr-2">✓</span>
                      Chat Messaging
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="text-green-600 mr-2">✓</span>
                      Session Recording
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="text-green-600 mr-2">✓</span>
                      File Sharing
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="text-green-600 mr-2">✓</span>
                      Breakout Rooms
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Virtual Classroom Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">🎥</div>
              <h4 className="font-semibold mb-1">HD Video</h4>
              <p className="text-sm text-blue-100">Crystal clear video quality</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🖊️</div>
              <h4 className="font-semibold mb-1">Whiteboard</h4>
              <p className="text-sm text-blue-100">Interactive digital whiteboard</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📱</div>
              <h4 className="font-semibold mb-1">Mobile Ready</h4>
              <p className="text-sm text-blue-100">Join from any device</p>
            </div>
            <div>
              <div className="text-4xl mb-2">🎬</div>
              <h4 className="font-semibold mb-1">Recordings</h4>
              <p className="text-sm text-blue-100">Review sessions anytime</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VirtualClassroomPage;
