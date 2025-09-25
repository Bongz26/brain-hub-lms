import React, { useEffect, useState } from 'react';
import { courseService } from '../../services/courseService';
import { Enrollment } from '../../types/course';
import { useAuth } from '../../contexts/AuthContext';

export const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<{enrollmentId: string, courseTitle: string} | null>(null);

  useEffect(() => {
    const loadEnrollments = async () => {
      if (!user) return;
      
      try {
        setError(null);
        const studentEnrollments = await courseService.getStudentEnrollments(user.id);
        setEnrollments(studentEnrollments);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEnrollments();
  }, [user]);

  const handleCancelClick = (enrollmentId: string, courseTitle: string) => {
    setShowCancelConfirm({ enrollmentId, courseTitle });
  };

  const handleCancelConfirm = async (confirmed: boolean) => {
    if (!confirmed || !showCancelConfirm || !user) {
      setShowCancelConfirm(null);
      return;
    }

    try {
      await courseService.cancelEnrollment(showCancelConfirm.enrollmentId);
      // Refresh enrollments
      const updatedEnrollments = await courseService.getStudentEnrollments(user.id);
      setEnrollments(updatedEnrollments);
    } catch (err: any) {
      alert('Error cancelling enrollment: ' + err.message);
    } finally {
      setShowCancelConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading your courses</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Unenrollment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unenroll from "{showCancelConfirm.courseTitle}"?
            </p>
            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => handleCancelConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCancelConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Unenroll
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">Manage your course enrollments and track your progress</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">Enroll in courses to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {enrollment.course?.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Grade {enrollment.course?.grade_level}
                    </span>
                    <span>{enrollment.course?.subject?.name}</span>
                  </div>
                  <p className="text-gray-700 mb-3">{enrollment.course?.description}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    enrollment.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : enrollment.status === 'completed' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    Enrolled on {formatDate(enrollment.enrolled_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Duration:</span> {enrollment.course?.duration_weeks} weeks
                  {' • '}
                  <span className="font-semibold">Price:</span> R{enrollment.course?.price}
                </div>
                
                {enrollment.status === 'active' && (
                  <button
                    onClick={() => handleCancelClick(enrollment.id, enrollment.course?.title || 'this course')}
                    className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 text-sm font-medium"
                  >
                    Unenroll
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};