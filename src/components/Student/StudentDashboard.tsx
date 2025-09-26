import React from 'react';

const StudentDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Space</h1>
        <p className="text-gray-600">Access materials, submit assignments, and track your progress</p>
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
          <div className="flex justify-between items-center p-3 border border-gray-100 rounded hover:bg-gray-50">
            <div>
              <h4 className="font-semibold">Algebra Worksheet</h4>
              <p className="text-sm text-gray-600">Mathematics • Posted 2 days ago</p>
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              Download
            </button>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-100 rounded hover:bg-gray-50">
            <div>
              <h4 className="font-semibold">Science Project Guidelines</h4>
              <p className="text-sm text-gray-600">Science • Posted 1 week ago</p>
            </div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; // Added export to fix the module error