import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../Layout/Layout';

interface ForumTopic {
  id: string;
  title: string;
  category: 'general' | 'homework' | 'study-tips' | 'announcements';
  author: string;
  authorRole: string;
  content: string;
  replies: number;
  views: number;
  lastActivity: string;
  isPinned: boolean;
  isLocked: boolean;
}

interface Reply {
  id: string;
  topicId: string;
  author: string;
  authorRole: string;
  content: string;
  createdAt: string;
  likes: number;
}

export const CommunityForum: React.FC = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'homework' | 'study-tips' | 'announcements'>('all');
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicForm, setNewTopicForm] = useState({
    title: '',
    category: 'general' as 'general' | 'homework' | 'study-tips' | 'announcements',
    content: ''
  });
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = () => {
    const mockTopics: ForumTopic[] = [
      {
        id: '1',
        title: 'Tips for studying Mathematics effectively',
        category: 'study-tips',
        author: 'Nthabiseng Mokoena',
        authorRole: 'student',
        content: 'Hey everyone! I wanted to share some tips that helped me improve my math grades...',
        replies: 12,
        views: 45,
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        isPinned: true,
        isLocked: false
      },
      {
        id: '2',
        title: 'Help needed with Algebra homework',
        category: 'homework',
        author: 'Tebogo Moloi',
        authorRole: 'student',
        content: 'Can someone explain how to solve quadratic equations? I\'m stuck on question 5...',
        replies: 8,
        views: 23,
        lastActivity: new Date(Date.now() - 7200000).toISOString(),
        isPinned: false,
        isLocked: false
      },
      {
        id: '3',
        title: 'Important: Updated Class Schedule',
        category: 'announcements',
        author: 'Mr. Thabo Radebe',
        authorRole: 'tutor',
        content: 'Please note the following changes to our class schedule for next week...',
        replies: 5,
        views: 89,
        lastActivity: new Date(Date.now() - 86400000).toISOString(),
        isPinned: true,
        isLocked: true
      },
      {
        id: '4',
        title: 'Study group for Physical Sciences?',
        category: 'general',
        author: 'Palesa Twala',
        authorRole: 'student',
        content: 'Looking to form a study group for Physical Sciences. Anyone interested?',
        replies: 15,
        views: 67,
        lastActivity: new Date(Date.now() - 172800000).toISOString(),
        isPinned: false,
        isLocked: false
      }
    ];
    setTopics(mockTopics);
  };

  const loadReplies = (topicId: string) => {
    const mockReplies: Reply[] = [
      {
        id: '1',
        topicId: topicId,
        author: 'Mr. Thabo Radebe',
        authorRole: 'tutor',
        content: 'Great question! Let me explain the step-by-step process...',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        likes: 8
      },
      {
        id: '2',
        topicId: topicId,
        author: 'Sipho Nkosi',
        authorRole: 'student',
        content: 'Thanks for the explanation! This really helps.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        likes: 3
      }
    ];
    setReplies(mockReplies);
  };

  const createTopic = () => {
    if (!newTopicForm.title || !newTopicForm.content) {
      alert('Please fill in all fields');
      return;
    }

    const newTopic: ForumTopic = {
      id: Date.now().toString(),
      title: newTopicForm.title,
      category: newTopicForm.category,
      author: 'You',
      authorRole: 'student',
      content: newTopicForm.content,
      replies: 0,
      views: 0,
      lastActivity: new Date().toISOString(),
      isPinned: false,
      isLocked: false
    };

    setTopics(prev => [newTopic, ...prev]);
    alert('✅ Topic created successfully!');
    setShowNewTopic(false);
    setNewTopicForm({ title: '', category: 'general', content: '' });
  };

  const postReply = () => {
    if (!replyText || !selectedTopic) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      topicId: selectedTopic.id,
      author: 'You',
      authorRole: 'student',
      content: replyText,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setReplies(prev => [...prev, newReply]);
    setTopics(prev =>
      prev.map(t => t.id === selectedTopic.id ? { ...t, replies: t.replies + 1 } : t)
    );
    setReplyText('');
    alert('✅ Reply posted!');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'homework':
        return '📝';
      case 'study-tips':
        return '💡';
      case 'announcements':
        return '📢';
      default:
        return '💬';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'homework':
        return 'bg-blue-100 text-blue-800';
      case 'study-tips':
        return 'bg-green-100 text-green-800';
      case 'announcements':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTopics = activeCategory === 'all'
    ? topics
    : topics.filter(t => t.category === activeCategory);

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Community Forum</h1>
            <p className="text-gray-600">Connect with students and tutors, ask questions, share knowledge</p>
          </div>
          <button
            onClick={() => setShowNewTopic(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-medium"
          >
            + New Topic
          </button>
        </div>

        {/* Category Filters */}
        <div className="mb-6 flex gap-3 flex-wrap">
          {[
            { value: 'all', label: 'All Topics', icon: '📚' },
            { value: 'general', label: 'General', icon: '💬' },
            { value: 'homework', label: 'Homework Help', icon: '📝' },
            { value: 'study-tips', label: 'Study Tips', icon: '💡' },
            { value: 'announcements', label: 'Announcements', icon: '📢' }
          ].map((category) => (
            <button
              key={category.value}
              onClick={() => setActiveCategory(category.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeCategory === category.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => {
                setSelectedTopic(topic);
                loadReplies(topic.id);
              }}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {topic.isPinned && <span className="text-yellow-600">📌</span>}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(topic.category)}`}>
                      {getCategoryIcon(topic.category)} {topic.category}
                    </span>
                    {topic.isLocked && <span className="text-gray-600">🔒</span>}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                    {topic.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{topic.content}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {topic.author}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {topic.replies} replies
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {topic.views} views
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Topic Modal */}
        {selectedTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                {/* Topic Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedTopic.category)}`}>
                      {getCategoryIcon(selectedTopic.category)} {selectedTopic.category}
                    </span>
                    {selectedTopic.isPinned && <span>📌 Pinned</span>}
                    {selectedTopic.isLocked && <span>🔒 Locked</span>}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedTopic.title}</h2>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Posted by {selectedTopic.author} ({selectedTopic.authorRole})</span>
                    <span>{selectedTopic.replies} replies</span>
                    <span>{selectedTopic.views} views</span>
                  </div>
                </div>

                {/* Original Post */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTopic.content}</p>
                </div>

                {/* Replies */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-gray-900">Replies ({replies.length})</h3>
                  {replies.map((reply) => (
                    <div key={reply.id} className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {reply.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{reply.author}</p>
                            <p className="text-xs text-gray-500">{reply.authorRole}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(reply.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{reply.content}</p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        👍 Like ({reply.likes})
                      </button>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                {!selectedTopic.isLocked && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post a Reply
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Share your thoughts..."
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={postReply}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Post Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedTopic(null);
                    setReplies([]);
                    setReplyText('');
                  }}
                  className="w-full border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Topic Modal */}
        {showNewTopic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Topic</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newTopicForm.category}
                    onChange={(e) => setNewTopicForm({ ...newTopicForm, category: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">💬 General Discussion</option>
                    <option value="homework">📝 Homework Help</option>
                    <option value="study-tips">💡 Study Tips</option>
                    <option value="announcements">📢 Announcements</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newTopicForm.title}
                    onChange={(e) => setNewTopicForm({ ...newTopicForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Help with Algebra homework"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                  <textarea
                    value={newTopicForm.content}
                    onChange={(e) => setNewTopicForm({ ...newTopicForm, content: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Describe your question or topic in detail..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowNewTopic(false);
                      setNewTopicForm({ title: '', category: 'general', content: '' });
                    }}
                    className="flex-1 border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTopic}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg font-medium"
                  >
                    Create Topic
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Guidelines */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">📜 Community Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Be respectful and supportive of all members</li>
            <li>• Stay on topic and provide helpful responses</li>
            <li>• No spam or inappropriate content</li>
            <li>• Give credit when sharing others' work</li>
            <li>• Report any issues to moderators</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityForum;
