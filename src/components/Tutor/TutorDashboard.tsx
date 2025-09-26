import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Resource, Assignment } from '../../types/tutor';
import { supabase } from '../../lib/supabase';
import { MaterialsManager } from './MaterialsManager';

export const TutorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'materials' | 'students' | 'assignments' | 'communication'>('materials');
  const [students, setStudents] = useState<any[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    // Load tutor's students and materials
    loadTutorData();
  }, [user]);

  const loadTutorData = async () => {
    if (!user) return;
    
    // In a real app, these would be API calls to get tutor's assigned students and materials
    const mockStudents = [
      { id: 1, name: 'Sarah Johnson', grade: 10, progress: 75, lastActive: '2024-01-15' },
      { id: 2, name: 'Mike Peterson', grade: 9, progress: 60, lastActive: '2024-01-14' },
      { id: 3, name: 'Emma Davis', grade: 11, progress: 85, lastActive: '2024-01-16' }
    ];
    
    const mockResources: Resource[] = [
      { id: 1, title: 'Algebra Basics', type: 'worksheet', subject: 'Mathematics', uploaded: '2024-01-10', downloads: 15 },
      { id: 2, title: 'Chemistry Lab Notes', type: 'notes', subject: 'Science', uploaded: '2024-01-12', downloads: 8 },
      { id: 3, title: 'Essay Writing Guide', type: 'guide', subject: 'English', uploaded: '2024-01-08', downloads: 22 }
    ];
    
    const mockAssignments: Assignment[] = [
      { id: 1, title: 'Algebra Homework', subject: 'Mathematics', dueDate: '2024-01-20', submitted: 2, total: 3 },
      { id: 2, title: 'Science Project', subject: 'Science', dueDate: '2024-01-25', submitted: 1, total: 3 }
    ];
    
    setStudents(mockStudents);
    setResources(mockResources);
    setAssignments(mockAssignments);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Workspace</h1>
        <p className="text-gray-600">Share materials, track progress, and support your students</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{students.length}</div>
          <div className="text-sm text-gray-600">Students</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{resources.length}</div>
          <div className="text-sm text-gray-600">Resources</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{assignments.length}</div>
          <div className="text-sm text-gray-600">Active Assignments</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {students.length > 0 ? (students.reduce((acc, student) => acc + student.progress, 0) / students.length).toFixed(0) : 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Progress</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'materials', label: '📚 Learning Materials', icon: '📚' },
            { id: 'students', label: '👥 My Students', icon: '👥' },
            { id: 'assignments', label: '📝 Assignments', icon: '📝' },
            { id: 'communication', label: '💬 Communication', icon: '💬' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Materials Tab - Using the real MaterialsManager */}
        {activeTab === 'materials' && <MaterialsManager />}
        
        {/* Other tabs remain the same */}
        {activeTab === 'students' && <StudentsTab students={students} />}
        {activeTab === 'assignments' && <AssignmentsTab assignments={assignments} />}
        {activeTab === 'communication' && <CommunicationTab students={students} />}
      </div>
    </div>
  );
};

// Students Tab Component (Keep this as is)
const StudentsTab: React.FC<{ students: any[] }> = ({ students }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Students</h2>
      
      <div className="grid gap-4">
        {students.map(student => (
          <div key={student.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{student.name}</h4>
                <div className="flex space-x-3 text-sm text-gray-600 mt-1">
                  <span>Grade {student.grade}</span>
                  <span>•</span>
                  <span>Last active: {student.lastActive}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">{student.progress}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${student.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-3">
              <button className="text-blue-600 hover:text-blue-800 text-sm">View Progress</button>
              <button className="text-green-600 hover:text-green-800 text-sm">Send Message</button>
              <button className="text-purple-600 hover:text-purple-800 text-sm">Assign Work</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Assignments Tab Component (Keep this as is)
const AssignmentsTab: React.FC<{ assignments: Assignment[] }> = ({ assignments }) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
          ➕ Create Assignment
        </button>
      </div>

      <div className="grid gap-4">
        {assignments.map(assignment => (
          <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{assignment.title}</h4>
                <div className="flex space-x-3 text-sm text-gray-600 mt-1">
                  <span>{assignment.subject}</span>
                  <span>•</span>
                  <span>Due: {assignment.dueDate}</span>
                  <span>•</span>
                  <span>{assignment.submitted}/{assignment.total} submitted</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded text-xs ${
                  assignment.submitted === assignment.total ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {assignment.submitted === assignment.total ? 'Completed' : 'In Progress'}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-3">
              <button className="text-blue-600 hover:text-blue-800 text-sm">View Submissions</button>
              <button className="text-green-600 hover:text-green-800 text-sm">Grade Work</button>
              <button className="text-purple-600 hover:text-purple-800 text-sm">Extend Deadline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Communication Tab Component (Keep this as is)
const CommunicationTab: React.FC<{ students: any[] }> = ({ students }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Communication</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Quick Message</h3>
          <select className="w-full border border-gray-300 rounded p-2 mb-3">
            <option>Select student...</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>{student.name}</option>
            ))}
          </select>
          <textarea 
            className="w-full border border-gray-300 rounded p-2 mb-3" 
            rows={4}
            placeholder="Type your message..."
          ></textarea>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Send Message
          </button>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Announcements</h3>
          <textarea 
            className="w-full border border-gray-300 rounded p-2 mb-3" 
            rows={4}
            placeholder="Type announcement for all students..."
          ></textarea>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Post Announcement
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;