import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { Profile } from '../../types/profile';

interface EditProfileProps {
  onCancel: () => void;
  onUpdate: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ onCancel, onUpdate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    grade_level: 8,
    school_name: '',
    phone_number: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const profile = await profileService.getCurrentProfile();
        if (profile) {
          setFormData({
            first_name: profile.first_name,
            last_name: profile.last_name,
            grade_level: profile.grade_level || 8,
            school_name: profile.school_name || '',
            phone_number: profile.phone_number || '',
            bio: profile.bio || ''
          });
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await profileService.upsertProfile({
        role: 'student', // This would come from existing profile
        ...formData
      });
      onUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'grade_level' ? parseInt(value) : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="first_name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="last_name"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Grade Level</label>
            <select
              name="grade_level"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.grade_level}
              onChange={handleChange}
            >
              {Array.from({ length: 9 }, (_, i) => i + 4).map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">School Name</label>
            <input
              type="text"
              name="school_name"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.school_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              name="bio"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};