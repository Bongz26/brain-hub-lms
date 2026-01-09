import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { StudentCourseManager } from './StudentCourseManager';
import { StudentMaterialsPage } from './StudentMaterialsPage';
import { StudentAssessmentsPage } from './StudentAssessmentsPage';
import { Layout } from '../Layout/Layout';

interface StudentDashboardProps {
  user: any;
  profile: any;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, profile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'materials' | 'assignments'>('overview');
  const [materials, setMaterials] = useState<any[]>([]); // Used in fetchMaterials
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) console.error('Error fetching materials:', error);
      else setMaterials(data || []);
      setLoading(false);
    };
    fetchMaterials();
  }, []);

  const downloadMaterial = async (fileUrl: string, title: string) => { // Used in download buttons
    const { data } = supabase.storage.from('tutor-materials').getPublicUrl(fileUrl);
    if (data.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Space</h1>
          <p className="text-gray-600 text-sm">Access materials, submit assignments, and track your progress</p>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'courses', label: '🎓 My Courses' },
              { id: 'materials', label: '📚 Materials' },
              { id: 'assignments', label: '📝 Assignments' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Available Materials</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Pending Assignments</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="text-2xl font-bold text-purple-600">75%</div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Materials from Your Tutor</h2>
              <div className="space-y-3">
                {materials.length > 0 ? (
                  materials.slice(0, 3).map((material) => (
                    <div key={material.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-shadow">
                      <div>
                        <h4 className="font-semibold">{material.title}</h4>
                        <p className="text-sm text-gray-600">{material.subject} • {new Date(material.created_at).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => downloadMaterial(material.file_url, material.title)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 font-medium"
                      >
                        Download
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No recent materials.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/matching" className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors text-center">
                  🔍 Find Courses
                </Link>
                <Link to="/bookings" className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium transition-colors text-center">
                  📅 View Bookings
                </Link>
                <Link to="/events" className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-medium transition-colors text-center">
                  🎉 School Events
                </Link>
                <Link to="/analytics" className="bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 font-medium transition-colors text-center">
                  📊 My Analytics
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && <StudentCourseManager />}

        {activeTab === 'materials' && (
          <StudentMaterialsPage isEmbedded={true} />
        )}

        {activeTab === 'assignments' && (
          <StudentAssessmentsPage isEmbedded={true} />
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;