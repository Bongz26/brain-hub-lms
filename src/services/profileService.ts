import { supabase } from '../lib/supabase';
import { Profile, CreateProfileData } from '../types/profile';

export const profileService = {
  // Get current user's profile
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error);
    }

    return data;
  },

  // Create or update profile
  async upsertProfile(profileData: CreateProfileData): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Check if profile exists
  async profileExists(): Promise<boolean> {
    const profile = await this.getCurrentProfile();
    return !!profile;
  }
};