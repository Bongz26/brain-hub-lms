import React from 'react';
import { supabase } from './lib/supabase';

interface Props {
  materialId: string;
}

const MaterialDownloadButton: React.FC<Props> = ({ materialId }) => {
  const handleDownload = async () => {
    try {
      const { error } = await supabase.rpc('increment_download_count', { material_id: materialId });
      if (error) throw error;
      alert('Download counted!');
    } catch (error) {
      console.error('Error updating download count:', error);
      alert('Failed to count download. Please try again.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
    >
      Download Material
    </button>
  );
};

export default MaterialDownloadButton;