import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface StudentDashboardProps {
  user: any;
  profile: any;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, profile }) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase
        .from('tutor_materials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) console.error('Error fetching materials:', error);
      else setMaterials(data || []);
      setLoading(false);
    };
    fetchMaterials();
  }, []);

  const downloadMaterial = async (fileUrl: string, title: string) => {
    const { data } = supabase.storage.from('tutor-materials').getPublicUrl(fileUrl);
    if (data.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Space</h1>
        <p className="text-gray-600 text-sm">Access materials, submit assignments, and track your progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-shadow">
            <div>
              <h4 className="font-semibold">Algebra Worksheet</h4>
              <p className="text-sm text-gray-600">Mathematics • Posted 2 days ago</p>
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 font-medium">
              Download
            </button>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-shadow">
            <div>
              <h4 className="font-semibold">Science Project Guidelines</h4>
              <p className="text-sm text-gray-600">Science • Posted 1 week ago</p>
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 font-medium">
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link to="/matching" className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors">
            🔍 Find Courses
          </Link>
          <Link to="/bookings" className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium transition-colors">
            📅 View Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;