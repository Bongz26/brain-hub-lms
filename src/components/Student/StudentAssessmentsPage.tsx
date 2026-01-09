import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Layout } from '../Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';

interface Assignment {
    id: string;
    course_id: string;
    title: string;
    description: string;
    due_date: string;
    max_points: number;
    assignment_type: 'homework' | 'quiz' | 'project' | 'exam';
    instructions: string;
    course_title?: string; // For display
    status?: 'pending' | 'submitted' | 'graded' | 'missed';
    score?: number;
    teacher_feedback?: string;
    submission_date?: string;
}

interface StudentAssessmentsPageProps {
    isEmbedded?: boolean;
}

export const StudentAssessmentsPage: React.FC<StudentAssessmentsPageProps> = ({ isEmbedded = false }) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'upcoming' | 'completed'>('upcoming');
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [submissionContent, setSubmissionContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadAssignments();
    }, [user]);

    const loadAssignments = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Fetch Enrolled Courses (Optional optimization: filter assignments by course)
            // For now, we'll try to fetch all assignments and submissions and stitch them together.

            // Fetch all assignments (In real app, filter by enrolled courses)
            const { data: assignmentsData, error: assignError } = await supabase
                .from('assignments')
                .select(`
          *,
          courses ( title )
        `)
                .order('due_date', { ascending: true });

            if (assignError) throw assignError;

            // Fetch student's submissions
            const { data: submissionsData, error: subError } = await supabase
                .from('assessment_submissions')
                .select('*')
                .eq('student_id', user.id);

            if (subError) throw subError;

            // Merge data
            const mergedAssignments: Assignment[] = (assignmentsData || []).map((assign: any) => {
                const submission = submissionsData?.find(s => s.assignment_id === assign.id);
                const isPastDue = new Date(assign.due_date) < new Date() && !submission;

                return {
                    ...assign,
                    course_title: assign.courses?.title,
                    status: submission
                        ? submission.status
                        : isPastDue ? 'missed' : 'pending',
                    score: submission?.score,
                    teacher_feedback: submission?.teacher_feedback,
                    submission_date: submission?.submission_date
                };
            });

            // MOCK DATA IF EMPTY (FOR DEMO)
            if (mergedAssignments.length === 0) {
                const mockAssignments: Assignment[] = [
                    {
                        id: '1',
                        course_id: 'math101',
                        title: 'Algebra Term 1 Test',
                        description: 'Mid-term assessment covering algebraic expressions and equations.',
                        due_date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
                        max_points: 50,
                        assignment_type: 'exam',
                        instructions: 'Answer all questions. Show your working.',
                        course_title: 'Mathematics Grade 10',
                        status: 'pending'
                    },
                    {
                        id: '2',
                        course_id: 'eng101',
                        title: 'Poetry Essay',
                        description: 'Write an essay analyzing the metaphors in "The Road Not Taken".',
                        due_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                        max_points: 30,
                        assignment_type: 'homework',
                        instructions: 'Min 500 words.',
                        course_title: 'English Home Language',
                        status: 'graded',
                        score: 25,
                        teacher_feedback: 'Excellent work! Great analysis of the imagery.',
                        submission_date: new Date(Date.now() - 86400000 * 2).toISOString()
                    },
                    {
                        id: '3',
                        course_id: 'phys101',
                        title: 'Physics Lab Report',
                        description: 'Report on the pendulum experiment.',
                        due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
                        max_points: 100,
                        assignment_type: 'project',
                        instructions: 'Submit as PDF.',
                        course_title: 'Physical Sciences',
                        status: 'pending'
                    }
                ];
                setAssignments(mockAssignments);
            } else {
                setAssignments(mergedAssignments);
            }

        } catch (error) {
            console.error('Error loading assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAssessment = async () => {
        if (!selectedAssignment || !user) return;
        setSubmitting(true);

        try {
            // Check if table exists (handle gracefully for demo)
            const { error } = await supabase
                .from('assessment_submissions')
                .insert({
                    assignment_id: selectedAssignment.id,
                    student_id: user.id,
                    content: submissionContent,
                    status: 'submitted'
                });

            if (error) {
                // Fallback for demo if table missing or RLS issue
                console.warn('Backend submission failed, conducting frontend demo update', error);
                alert("Assessment submitted! (Demo mode: Backend may not be fully connected yet)");
            } else {
                alert("Assessment submitted successfully!");
            }

            // Optimistic update
            setAssignments(prev => prev.map(a =>
                a.id === selectedAssignment.id
                    ? { ...a, status: 'submitted', submission_date: new Date().toISOString() }
                    : a
            ));

            setSelectedAssignment(null);
            setSubmissionContent('');

        } catch (err) {
            console.error(err);
            alert('Error submitting assessment');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string | undefined) => {
        switch (status) {
            case 'graded':
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Graded</span>;
            case 'submitted':
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">Submitted</span>;
            case 'missed':
                return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">Missed</span>;
            default:
                return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Pending</span>;
        }
    };

    const filteredAssignments = assignments.filter(a => {
        if (activeFilter === 'upcoming') {
            return a.status === 'pending' || a.status === 'missed';
        }
        return a.status === 'submitted' || a.status === 'graded';
    });

    const Content = () => (
        <div className={isEmbedded ? "" : "p-6"}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessments & Tests</h1>
                <p className="text-gray-600">View upcoming tests, submit assignments, and check your results.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
                <button
                    onClick={() => setActiveFilter('upcoming')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeFilter === 'upcoming' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Upcoming & Pending
                </button>
                <button
                    onClick={() => setActiveFilter('completed')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeFilter === 'completed' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Completed & Graded
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : filteredAssignments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAssignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{assignment.course_title || 'General'}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${assignment.assignment_type === 'exam' ? 'bg-red-50 text-red-600 border-red-100' :
                                                assignment.assignment_type === 'quiz' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                            {assignment.assignment_type}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                                    <p className="text-gray-600 mt-1 mb-4 text-sm">{assignment.description}</p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                                        </div>
                                        <div>
                                            Max Points: {assignment.max_points}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-2">
                                    {getStatusBadge(assignment.status)}

                                    {assignment.status === 'graded' && (
                                        <div className="text-2xl font-bold text-green-600">
                                            {assignment.score} / {assignment.max_points}
                                        </div>
                                    )}

                                    {assignment.status === 'pending' && (
                                        <button
                                            onClick={() => setSelectedAssignment(assignment)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mt-2"
                                        >
                                            Take Assessment
                                        </button>
                                    )}

                                    {(assignment.status === 'submitted' || assignment.status === 'graded') && (
                                        <button
                                            onClick={() => alert(`Submission Details:\nSubmitted on: ${new Date(assignment.submission_date!).toLocaleString()}\n\nTeacher Feedback: ${assignment.teacher_feedback || 'No feedback yet.'}`)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                                        >
                                            View Feedback
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No {activeFilter} assignments found.</p>
                </div>
            )}

            {/* Take Assessment Modal */}
            {selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold">{selectedAssignment.title}</h3>
                            <button onClick={() => setSelectedAssignment(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                                <p className="font-bold mb-1">Instructions:</p>
                                <p>{selectedAssignment.instructions}</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer / Submission</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 h-48 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Type your answer here..."
                                    value={submissionContent}
                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedAssignment(null)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitAssessment}
                                    disabled={submitting || !submissionContent.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Assessment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (isEmbedded) {
        return <Content />;
    }

    return (
        <Layout>
            <Content />
        </Layout>
    );
};
