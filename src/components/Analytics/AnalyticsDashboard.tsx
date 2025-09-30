import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../Layout/Layout';

interface AnalyticsData {
  overallProgress: number;
  completedAssignments: number;
  totalAssignments: number;
  attendanceRate: number;
  averageGrade: number;
  weeklyStudyHours: number[];
  subjectPerformance: {
    subject: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  recentActivity: {
    date: string;
    activity: string;
    score?: number;
  }[];
}

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'term'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user) return;

    // Mock analytics data
    const mockData: AnalyticsData = {
      overallProgress: 78,
      completedAssignments: 24,
      totalAssignments: 30,
      attendanceRate: 95,
      averageGrade: 82,
      weeklyStudyHours: [12, 15, 10, 18, 14, 16, 13],
      subjectPerformance: [
        { subject: 'Mathematics', score: 85, trend: 'up' },
        { subject: 'English', score: 78, trend: 'stable' },
        { subject: 'Science', score: 90, trend: 'up' },
        { subject: 'History', score: 72, trend: 'down' },
        { subject: 'Physical Education', score: 88, trend: 'up' }
      ],
      recentActivity: [
        { date: '2024-01-15', activity: 'Completed Math Assignment', score: 95 },
        { date: '2024-01-14', activity: 'Attended English Session' },
        { date: '2024-01-13', activity: 'Submitted Science Project', score: 88 },
        { date: '2024-01-12', activity: 'Completed Quiz - History', score: 76 }
      ]
    };

    setAnalytics(mockData);
    setLoading(false);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <span className="text-green-600">↗</span>;
      case 'down':
        return <span className="text-red-600">↘</span>;
      default:
        return <span className="text-gray-600">→</span>;
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  if (loading || !analytics) {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Analytics</h1>
            <p className="text-gray-600">Track your progress and performance</p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'term'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Overall Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.overallProgress}%</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(analytics.overallProgress)}`}
                  style={{ width: `${analytics.overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Assignments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.completedAssignments}/{analytics.totalAssignments}
                </p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {Math.round((analytics.completedAssignments / analytics.totalAssignments) * 100)}% completion rate
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Attendance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.attendanceRate}%</p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4 font-medium">Excellent attendance!</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Grade</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.averageGrade}%</p>
              </div>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⭐</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">Above average performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Study Hours Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Study Hours</h2>
            <div className="flex items-end justify-between h-48 gap-2">
              {analytics.weeklyStudyHours.map((hours, index) => {
                const maxHours = Math.max(...analytics.weeklyStudyHours);
                const height = (hours / maxHours) * 100;
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="text-xs font-medium text-gray-600 mb-2">{hours}h</div>
                    <div
                      className="w-full bg-blue-600 rounded-t transition-all hover:bg-blue-700"
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">{days[index]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject Performance */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Subject Performance</h2>
            <div className="space-y-4">
              {analytics.subjectPerformance.map((subject, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">{subject.subject}</span>
                      <span className="ml-2">{getTrendIcon(subject.trend)}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{subject.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(subject.score)}`}
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{activity.activity}</p>
                    <p className="text-sm text-gray-600">{new Date(activity.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  {activity.score && (
                    <span className={`px-4 py-2 rounded-lg font-semibold ${
                      activity.score >= 80 ? 'bg-green-100 text-green-800' :
                      activity.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {activity.score}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Insights & Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">🎯 Strong Performance</h3>
              <p className="text-sm text-gray-600">Science and Mathematics showing excellent results. Keep up the great work!</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">⚠️ Needs Attention</h3>
              <p className="text-sm text-gray-600">History performance trending down. Consider booking extra tutoring sessions.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">🔥 Streak</h3>
              <p className="text-sm text-gray-600">14 days of consistent study! You're on track to achieve your goals.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsDashboard;
