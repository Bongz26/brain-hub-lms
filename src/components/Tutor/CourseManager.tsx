import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Course, Subject } from '../../types/course';
import { Assignment, Lesson, StudentProgress } from '../../types/lms';

export const CourseManager: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'create' | 'analytics'>('courses');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Load tutor's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('tutor_id', user.id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Load subjects - try with different approaches
      console.log('Attempting to load subjects...');
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      console.log('Subjects loading result:', { subjectsData, subjectsError });

      // Use the subjects from the database
      if (subjectsData && subjectsData.length > 0) {
        console.log('Loaded subjects from database:', subjectsData.length, subjectsData);
        setSubjects(subjectsData);
      } else if (subjectsError) {
        console.log('Error loading subjects:', subjectsError.message);
        console.log('Full error:', subjectsError);
        
        // Fallback subjects based on your database data
        const fallbackSubjects = [
          { id: '7447a711-0212-4d2d-b2d2-eea1d32b16ad', name: 'Mathematics', description: 'Core mathematics curriculum', grade_levels: [4, 5, 6, 7, 8, 9, 10, 11, 12], created_at: new Date().toISOString() },
          { id: 'a178fc6b-d1bb-4088-9151-86a59dec9062', name: 'English Home Language', description: 'English as home language', grade_levels: [4, 5, 6, 7, 8, 9, 10, 11, 12], created_at: new Date().toISOString() },
          { id: 'b58f311b-cd3f-44f3-88eb-3f4009c2d292', name: 'Afrikaans FAL', description: 'Afrikaans as first additional language', grade_levels: [4, 5, 6, 7, 8, 9, 10, 11, 12], created_at: new Date().toISOString() },
          { id: '5c8696a5-5fb2-4f8e-96b5-c7e90e9ee232', name: 'Natural Sciences', description: 'Natural sciences curriculum', grade_levels: [4, 5, 6, 7, 8, 9], created_at: new Date().toISOString() },
          { id: 'aa02ad26-812f-4eb3-91ad-86b5624d19e3', name: 'Social Sciences', description: 'Social sciences curriculum', grade_levels: [4, 5, 6, 7, 8, 9], created_at: new Date().toISOString() },
          { id: 'e991c697-ab1c-478d-9ac1-f3c7aa97b28d', name: 'Physical Sciences', description: 'Physical sciences for higher grades', grade_levels: [10, 11, 12], created_at: new Date().toISOString() },
          { id: '49e56f48-c900-4941-bd18-7fd0936e09f9', name: 'Life Sciences', description: 'Life sciences for higher grades', grade_levels: [10, 11, 12], created_at: new Date().toISOString() },
          { id: '065f3a17-07f2-4abc-bdfa-bc743d82c8c7', name: 'Accounting', description: 'Accounting curriculum', grade_levels: [10, 11, 12], created_at: new Date().toISOString() },
          { id: '27597ee2-e11d-4838-bcbb-cd7ae7a4441d', name: 'Business Studies', description: 'Business studies curriculum', grade_levels: [10, 11, 12], created_at: new Date().toISOString() },
          { id: 'aec0e763-f3b1-4146-a602-e92d72069f79', name: 'English', description: 'English language studies', grade_levels: [10, 11, 12], created_at: new Date().toISOString() }
        ];
        console.log('Using fallback subjects due to database error');
        setSubjects(fallbackSubjects);
      } else {
        console.log('No subjects found in database');
        setSubjects([]);
      }

      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const enrollmentCount = course.enrollments?.length || 0;
    const isActive = course.is_active;

    return (
      <div className={`bg-white rounded-lg shadow-md border-l-4 ${isActive ? 'border-green-500' : 'border-gray-300'} p-6 hover:shadow-lg transition-shadow`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{enrollmentCount}</div>
            <div className="text-xs text-gray-600">Students</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{course.max_students}</div>
            <div className="text-xs text-gray-600">Max Capacity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">R{course.price}</div>
            <div className="text-xs text-gray-600">Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">Grade {course.grade_level}</div>
            <div className="text-xs text-gray-600">Level</div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedCourse(course)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Manage Course
          </button>
          <button
            onClick={() => {/* Toggle course status */}}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isActive 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    );
  };

  const CreateCourseModal: React.FC = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      subject: '',
      grade_level: 10,
      price: 0,
      max_students: 20,
      duration_weeks: 12
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Form submitted with data:', formData);
      
      if (!user) {
        console.log('No user found');
        return;
      }

      setSubmitting(true);
      try {
        // Find the subject name from the selected subject ID
        const selectedSubject = subjects.find(s => s.id === formData.subject);
        const subjectName = selectedSubject ? selectedSubject.name : formData.subject;
        
        console.log('Selected subject:', selectedSubject);
        console.log('Subject name to save:', subjectName);

        // Try with subject column first, fallback to basic fields if it doesn't exist
        const courseData = {
          title: formData.title,
          description: formData.description,
          subject: subjectName,
          grade_level: formData.grade_level,
          price: formData.price,
          max_students: formData.max_students,
          duration_weeks: formData.duration_weeks,
          tutor_id: user.id,
          is_active: true
        };
        
        console.log('Course data to insert:', courseData);

        let { error } = await supabase
          .from('courses')
          .insert(courseData);

        // If subject column doesn't exist, try without it
        if (error && error.message.includes("Could not find the 'subject' column")) {
          console.log('Subject column not found, trying without subject field...');
          const fallbackData = {
            title: formData.title,
            description: formData.description,
            grade_level: formData.grade_level,
            price: formData.price,
            max_students: formData.max_students,
            duration_weeks: formData.duration_weeks,
            tutor_id: user.id,
            is_active: true
          };
          
          console.log('Fallback course data:', fallbackData);
          
          const fallbackResult = await supabase
            .from('courses')
            .insert(fallbackData);
            
          error = fallbackResult.error;
        }

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        console.log('Course created successfully!');

        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          subject: '',
          grade_level: 10,
          price: 0,
          max_students: 20,
          duration_weeks: 12
        });
        loadData();
      } catch (error) {
        console.error('Error creating course:', error);
        alert(`Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 9 }, (_, i) => i + 4).map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (R)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.max_students}
                    onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          ➕ Create New Course
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'courses', label: '📚 My Courses', count: courses.length },
            { id: 'analytics', label: '📊 Analytics', count: null },
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

      {activeTab === 'courses' && (
        <div className="space-y-6">
          {courses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-4">Create your first course to start teaching!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Your First Course
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Course Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{courses.length}</div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {courses.reduce((sum, course) => sum + (course.enrollments?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {courses.filter(c => c.is_active).length}
              </div>
              <div className="text-sm text-gray-600">Active Courses</div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && <CreateCourseModal />}
    </div>
  );
};
