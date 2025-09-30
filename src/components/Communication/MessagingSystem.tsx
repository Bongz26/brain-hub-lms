import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  receiver_id: string;
  receiver_name: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  author_name: string;
  author_role: string;
  created_at: string;
  priority: 'normal' | 'high' | 'urgent';
}

export const MessagingSystem: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');
  const [showCompose, setShowCompose] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // Compose Message Form
  const [composeForm, setComposeForm] = useState({
    receiver: '',
    subject: '',
    message: ''
  });

  // Announcement Form
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'normal' as 'normal' | 'high' | 'urgent'
  });

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
    loadMessages();
    loadAnnouncements();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(data);
  };

  const loadMessages = async () => {
    // Mock messages for demo
    const mockMessages: Message[] = [
      {
        id: '1',
        sender_id: 'tutor-1',
        sender_name: 'Mr. Thabo Radebe',
        sender_role: 'tutor',
        receiver_id: user?.id || '',
        receiver_name: 'You',
        subject: 'Great progress on your assignment!',
        message: 'Hi! I wanted to let you know that your recent math assignment was excellent. Keep up the great work!',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        sender_id: 'tutor-2',
        sender_name: 'Ms. Lerato Mofokeng',
        sender_role: 'tutor',
        receiver_id: user?.id || '',
        receiver_name: 'You',
        subject: 'Reminder: Science Project Due',
        message: 'Don\'t forget your science project is due this Friday. Let me know if you need any help!',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        sender_id: 'student-1',
        sender_name: 'Sipho Nkosi',
        sender_role: 'student',
        receiver_id: user?.id || '',
        receiver_name: 'You',
        subject: 'Question about homework',
        message: 'Hi, I have a question about problem 5 on page 23. Could you help me understand it better?',
        read: true,
        created_at: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    setMessages(mockMessages);
  };

  const loadAnnouncements = async () => {
    // Mock announcements
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: 'School Sports Day - This Saturday!',
        message: 'Join us for our annual Sports Day event this Saturday at 8 AM. All students are encouraged to participate. There will be various athletic events and prizes!',
        author_name: 'Administration',
        author_role: 'admin',
        created_at: new Date().toISOString(),
        priority: 'high'
      },
      {
        id: '2',
        title: 'New Course Available: Advanced Mathematics',
        message: 'We\'re excited to announce a new Advanced Mathematics course for Grade 11 and 12 students. Registration is now open!',
        author_name: 'Mr. Thabo Radebe',
        author_role: 'tutor',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        priority: 'normal'
      },
      {
        id: '3',
        title: 'Updated Transportation Schedule',
        message: 'Please note: Route B pickup time has been changed to 7:00 AM starting next week. Drop-off times remain unchanged.',
        author_name: 'Transport Coordinator',
        author_role: 'admin',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        priority: 'urgent'
      }
    ];
    setAnnouncements(mockAnnouncements);
  };

  const sendMessage = async () => {
    if (!composeForm.receiver || !composeForm.subject || !composeForm.message) {
      alert('Please fill in all fields');
      return;
    }

    // In real app, this would save to database
    alert('✅ Message sent successfully!');
    setShowCompose(false);
    setComposeForm({ receiver: '', subject: '', message: '' });
  };

  const postAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) {
      alert('Please fill in all fields');
      return;
    }

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: announcementForm.title,
      message: announcementForm.message,
      author_name: profile?.first_name + ' ' + profile?.last_name || 'You',
      author_role: profile?.role || 'user',
      created_at: new Date().toISOString(),
      priority: announcementForm.priority
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);
    alert('✅ Announcement posted successfully!');
    setShowAnnouncement(false);
    setAnnouncementForm({ title: '', message: '', priority: 'normal' });
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg => msg.id === messageId ? { ...msg, read: true } : msg)
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-600 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-600 bg-orange-50';
      default:
        return 'border-l-4 border-blue-600 bg-blue-50';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">💬 Communication Center</h2>
          <div className="flex gap-3">
            {profile?.role === 'tutor' && (
              <button
                onClick={() => setShowAnnouncement(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                📢 New Announcement
              </button>
            )}
            <button
              onClick={() => setShowCompose(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              ✉️ New Message
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'messages'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Messages ({messages.filter(m => !m.read).length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'announcements'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Announcements ({announcements.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'messages' ? (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <p>No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message);
                    markAsRead(message.id);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    !message.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {message.sender_name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {message.sender_name}
                            {!message.read && <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>}
                          </h4>
                          <p className="text-xs text-gray-500">{message.sender_role}</p>
                        </div>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{message.subject}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-4">{getTimeAgo(message.created_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-6 rounded-lg ${getPriorityColor(announcement.priority)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📢</span>
                    <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                  </div>
                  {announcement.priority !== 'normal' && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      announcement.priority === 'urgent'
                        ? 'bg-red-600 text-white'
                        : 'bg-orange-600 text-white'
                    }`}>
                      {announcement.priority.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-3">{announcement.message}</p>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Posted by {announcement.author_name}</span>
                  <span>{getTimeAgo(announcement.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">✉️ New Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To: *
                </label>
                <select
                  value={composeForm.receiver}
                  onChange={(e) => setComposeForm({ ...composeForm, receiver: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select recipient...</option>
                  <option value="tutor-1">Mr. Thabo Radebe (Tutor)</option>
                  <option value="tutor-2">Ms. Lerato Mofokeng (Tutor)</option>
                  <option value="student-1">Sipho Nkosi (Student)</option>
                  <option value="admin">Administration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject: *
                </label>
                <input
                  type="text"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Question about homework"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message: *
                </label>
                <textarea
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Type your message here..."
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowCompose(false);
                    setComposeForm({ receiver: '', subject: '', message: '' });
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={sendMessage}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg font-medium"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Announcement Modal */}
      {showAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📢 New Announcement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title: *
                </label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Important Update"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority:
                </label>
                <select
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message: *
                </label>
                <textarea
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Type your announcement here..."
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowAnnouncement(false);
                    setAnnouncementForm({ title: '', message: '', priority: 'normal' });
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={postAnnouncement}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg font-medium"
                >
                  Post Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {selectedMessage.sender_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedMessage.sender_name}</h3>
                <p className="text-sm text-gray-500">{selectedMessage.sender_role}</p>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedMessage.subject}</h2>
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">{selectedMessage.message}</p>
            <div className="text-sm text-gray-500 mb-6">
              Sent {getTimeAgo(selectedMessage.created_at)}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setShowCompose(true);
                  setComposeForm({
                    ...composeForm,
                    receiver: selectedMessage.sender_id,
                    subject: `Re: ${selectedMessage.subject}`
                  });
                }}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingSystem;
