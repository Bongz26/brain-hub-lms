import { supabase } from '../lib/supabase';

export interface TutorMaterial {
  id: string;
  tutor_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  title: string;
  subject: string;
  grade_level: number;
  file_type_category: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export const fileService = {
  // Upload a file to materials bucket
  async uploadMaterial(file: File, tutorId: string, metadata: {
    title: string;
    subject: string;
    gradeLevel: number;
    fileType: string;
  }): Promise<TutorMaterial> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${tutorId}/${fileName}`;

    // Check file size (25MB limit for free tier)
    if (file.size > 25 * 1024 * 1024) {
      throw new Error('File size must be less than 25MB');
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/mpeg',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed. Please upload PDF, Word, Excel, PowerPoint, images, or videos.');
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Store file metadata in database
    const { data: dbData, error: dbError } = await supabase
      .from('tutor_materials')
      .insert({
        tutor_id: tutorId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        title: metadata.title,
        subject: metadata.subject,
        grade_level: metadata.gradeLevel,
        file_type_category: metadata.fileType
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return dbData;
  },

  // Get download URL for a file
  async getDownloadUrl(filePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('materials')
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiry

    if (error) throw error;
    return data?.signedUrl || '';
  },

  // Get tutor's materials
  async getTutorMaterials(tutorId: string): Promise<TutorMaterial[]> {
    const { data, error } = await supabase
      .from('tutor_materials')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Delete a material
  async deleteMaterial(materialId: string, filePath: string): Promise<void> {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('materials')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('tutor_materials')
      .delete()
      .eq('id', materialId);

    if (dbError) throw dbError;
  },

  // Get file preview URL (for images/PDFs)
  async getPreviewUrl(filePath: string): Promise<string> {
    const { data } = await supabase.storage
      .from('materials')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  // Increment download count - FIXED VERSION
  async incrementDownloadCount(materialId: string): Promise<void> {
    // First get the current count
    const { data: currentMaterial, error: fetchError } = await supabase
      .from('tutor_materials')
      .select('download_count')
      .eq('id', materialId)
      .single();

    if (fetchError) throw fetchError;

    // Then update with the incremented value
    const { error: updateError } = await supabase
      .from('tutor_materials')
      .update({ 
        download_count: (currentMaterial?.download_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', materialId);

    if (updateError) throw updateError;
  }
};