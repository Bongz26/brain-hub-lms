import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    console.log('Supabase connection test:', { data, error });
    return !error;
  } catch (err) {
    console.error('Supabase test failed:', err);
    return false;
  }
};