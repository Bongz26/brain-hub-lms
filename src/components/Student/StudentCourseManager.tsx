import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Course, Enrollment } from '../../types/course';
import { Assignment, StudentProgress } from '../../types/lms';

export const StudentCourseManager: React.FC = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'available' | 'assignments' | 'progress'>('enrolled');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load enrolled courses
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses:course_id (
            *,
            subjects:subject_id (*),
            profiles:tutor_id (first_name, last_name)
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrollmentsError) throw enrollmentsError;

      // Load available courses (not enrolled)
      const enrolledCourseIds = enrollmentsData?.map(e => e.course_id) || [];
      const { data: availableData, error: availableError } = await supabase
        .from('courses')
        .select(`
          *,
          subjects:subject_id (*),
          profiles:tutor_id (first_name, last_name)
        `)
        .eq('is_active', true)
        .not('id', 'in', `(${enrolledCourseIds.join(',')})`);

      if (availableError) throw availableError;

      // Load assignments for enrolled courses
      if (enrolledCourseIds.length > 0) {
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*')
          .in('course_id', enrolledCourseIds)
          .order('due_date', { ascending: true });

        if (assignmentsError) throw assignmentsError;
        setAssignments(assignmentsData || []);
      }

      setEnrolledCourses(enrollmentsData?.map(e => e.courses).filter(Boolean) || []);
      setAvailableCourses(availableData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId,
          status: 'active'
        });

      if (error) throw error;

      // Reload data
      loadData();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const EnrolledCourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const courseProgress = progress.find(p => p.course_id === course.id);
    const courseAssignments = assignments.filter(a => a.course_id === course.id);
    const pendingAssignments = courseAssignments.filter(a => 
      new Date(a.due_date) > new Date() && 
      !a.submissions?.some((s: any) => s.student_id === user?.id)
    );

    return (
      <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Tutor: {course.tutor?.first_name} {course.tutor?.last_name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {courseProgress?.completion_percentage || 0}%
            </div>
            <div className="text-xs text-gray-600">Progress</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${courseProgress?.completion_percentage || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{courseAssignments.length}</div>
            <div className="text-xs text-gray-600">Total Assignments</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{pendingAssignments.length}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm font-medium">
            Enter Course
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium">
            View Progress
          </button>
        </div>
      </div>
    );
  };

  const AvailableCourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const enrollmentCount = course.enrollments?.length || 0;
    const isFull = enrollmentCount >= course.max_students;

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Tutor: {course.tutor?.first_name} {course.tutor?.last_name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">R{course.price}</div>
            <div className="text-xs text-gray-600">Price</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">Grade {course.grade_level}</div>
            <div className="text-xs text-gray-600">Level</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">{enrollmentCount}/{course.max_students}</div>
            <div className="text-xs text-gray-600">Students</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{course.duration_weeks}w</div>
            <div className="text-xs text-gray-600">Duration</div>
          </div>
        </div>

        <button
          onClick={() => enrollInCourse(course.id)}
          disabled={isFull}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
            isFull
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isFull ? 'Course Full' : 'Enroll Now'}
        </button>
      </div>
    );
  };

  const AssignmentCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
    const isOverdue = new Date(assignment.due_date) < new Date();
    const isDueSoon = new Date(assignment.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000);
    const hasSubmission = assignment.submissions?.some((s: any) => s.student_id === user?.id);

    return (
      <div className={`bg-white rounded-lg shadow-md border-l-4 ${
        hasSubmission ? 'border-green-500' : 
        isOverdue ? 'border-red-500' : 
        isDueSoon ? 'border-orange-500' : 'border-blue-500'
      } p-4 hover:shadow-lg transition-shadow`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${
              hasSubmission ? 'text-green-600' : 
              isOverdue ? 'text-red-600' : 
              isDueSoon ? 'text-orange-600' : 'text-blue-600'
            }`}>
              {hasSubmission ? 'Submitted' : 
               isOverdue ? 'Overdue' : 
               isDueSoon ? 'Due Soon' : 'Pending'}
            </div>
            <div className="text-xs text-gray-500">
              Due: {new Date(assignment.due_date).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {assignment.max_points} points • {assignment.assignment_type}
          </div>
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 font-medium">
            {hasSubmission ? 'View Submission' : 'Submit Work'}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Learning Journey</h2>
        <p className="text-gray-600 text-sm mt-1">Manage your courses, assignments, and track your progress</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'enrolled', label: '📚 My Courses', count: enrolledCourses.length },
            { id: 'available', label: '🔍 Available Courses', count: availableCourses.length },
            { id: 'assignments', label: '📝 Assignments', count: assignments.length },
            { id: 'progress', label: '📊 Progress', count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} {tab.count !== null && `(${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'enrolled' && (
        <div className="space-y-6">
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No enrolled courses</h3>
              <p className="text-gray-600 mb-4">Browse available courses to start your learning journey!</p>
              <button
                onClick={() => setActiveTab('available')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {enrolledCourses.map(course => (
                <EnrolledCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="space-y-6">
          {availableCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">No available courses</h3>
              <p className="text-gray-600">Check back later for new courses!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {availableCourses.map(course => (
                <AvailableCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
              <p className="text-gray-600">Assignments will appear here once you enroll in courses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{enrolledCourses.length}</div>
              <div className="text-sm text-gray-600">Enrolled Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {assignments.filter(a => a.submissions?.some((s: any) => s.student_id === user?.id)).length}
              </div>
              <div className="text-sm text-gray-600">Completed Assignments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Math.round(progress.reduce((sum, p) => sum + p.completion_percentage, 0) / (progress.length || 1))}%
              </div>
              <div className="text-sm text-gray-600">Average Progress</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
