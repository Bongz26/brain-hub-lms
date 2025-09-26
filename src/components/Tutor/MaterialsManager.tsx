import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fileService, TutorMaterial } from '../../services/fileService';

export const MaterialsManager: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materials, setMaterials] = useState<TutorMaterial[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{materialId: string, filePath: string, title: string} | null>(null);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    subject: '',
    gradeLevel: 10,
    fileType: 'notes' as 'notes' | 'worksheet' | 'presentation' | 'video' | 'guide'
  });

  useEffect(() => {
    loadMaterials();
  }, [user]);

  const loadMaterials = async () => {
    if (!user) return;
    
    try {
      const tutorMaterials = await fileService.getTutorMaterials(user.id);
      setMaterials(tutorMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate form
    if (!newMaterial.title.trim() || !newMaterial.subject.trim()) {
      alert('Please provide a title and subject for the material.');
      return;
    }

    setUploading(true);
    try {
      await fileService.uploadMaterial(file, user.id, newMaterial);
      
      // Refresh materials list
      await loadMaterials();
      
      // Reset form
      setNewMaterial({
        title: '',
        subject: '',
        gradeLevel: 10,
        fileType: 'notes'
      });
      
      alert('🎉 Material uploaded successfully!');
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteClick = (materialId: string, filePath: string, title: string) => {
    setShowDeleteConfirm({ materialId, filePath, title });
  };

  const handleDeleteConfirm = async (confirmed: boolean) => {
    if (!confirmed || !showDeleteConfirm || !user) {
      setShowDeleteConfirm(null);
      return;
    }

    try {
      await fileService.deleteMaterial(showDeleteConfirm.materialId, showDeleteConfirm.filePath);
      await loadMaterials();
      alert('Material deleted successfully.');
    } catch (error: any) {
      alert('Delete failed: ' + error.message);
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleDownload = async (material: TutorMaterial) => {
    try {
      const downloadUrl = await fileService.getDownloadUrl(material.file_path);
      await fileService.incrementDownloadCount(material.id);
      
      // Create temporary link for download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = material.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Refresh to update download count
      await loadMaterials();
    } catch (error: any) {
      alert('Download failed: ' + error.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel')) return '📊';
    if (fileType.includes('powerpoint')) return '📽️';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎬';
    return '📎';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-4 justify-end">
              <button
                onClick={() => handleDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Learning Materials</h2>
        <span className="text-sm text-gray-600">{materials.length} materials</span>
      </div>

      {/* Upload Section */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6 border-2 border-dashed border-blue-200">
        <h3 className="font-semibold mb-4 text-lg text-blue-900">Share New Material</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              placeholder="e.g., Algebra Worksheet 1"
              value={newMaterial.title}
              onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded p-2"
              placeholder="e.g., Mathematics"
              value={newMaterial.subject}
              onChange={(e) => setNewMaterial({...newMaterial, subject: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newMaterial.gradeLevel}
              onChange={(e) => setNewMaterial({...newMaterial, gradeLevel: parseInt(e.target.value)})}
            >
              {Array.from({ length: 9 }, (_, i) => i + 4).map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
            <select
              className="w-full border border-gray-300 rounded p-2"
              value={newMaterial.fileType}
              onChange={(e) => setNewMaterial({...newMaterial, fileType: e.target.value as any})}
            >
              <option value="notes">Notes</option>
              <option value="worksheet">Worksheet</option>
              <option value="presentation">Presentation</option>
              <option value="video">Video</option>
              <option value="guide">Study Guide</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !newMaterial.title.trim() || !newMaterial.subject.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {uploading ? '📤 Uploading...' : '📁 Choose File & Upload'}
          </button>
          <div className="text-sm text-gray-600">
            <p>• Max 25MB file size</p>
            <p>• Supported: PDF, Word, Excel, PowerPoint, Images, Videos</p>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="space-y-4">
        {materials.map(material => (
          <div key={material.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4 flex-1">
                <span className="text-3xl">{getFileIcon(material.file_type)}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900">{material.title}</h4>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
                    <span className="bg-gray-100 px-2 py-1 rounded">📄 {material.file_name}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">💾 {formatFileSize(material.file_size)}</span>
                    <span className="bg-blue-100 px-2 py-1 rounded">📚 {material.subject}</span>
                    <span className="bg-green-100 px-2 py-1 rounded">🎓 Grade {material.grade_level}</span>
                    <span className="bg-purple-100 px-2 py-1 rounded">⬇️ {material.download_count} downloads</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">📅 {formatDate(material.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button 
                  onClick={() => handleDownload(material)}
                  className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 font-medium"
                >
                  Download
                </button>
                <button 
                  onClick={() => handleDeleteClick(material.id, material.file_path, material.title)}
                  className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {materials.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No materials yet</h3>
            <p>Share your first learning material to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};