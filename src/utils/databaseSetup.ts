import { supabase } from '../lib/supabase';

export const setupDatabase = async () => {
  console.log('Setting up database tables and data...');

  try {
    // Create subjects table if it doesn't exist
    const { error: subjectsTableError } = await supabase.rpc('create_subjects_table');
    
    if (subjectsTableError && !subjectsTableError.message.includes('already exists')) {
      console.log('Creating subjects table manually...');
      
      // If the RPC doesn't exist, we'll insert subjects directly
      const subjects = [
        {
          id: 'math',
          name: 'Mathematics',
          description: 'Mathematical concepts and problem solving',
          grade_levels: [9, 10, 11, 12],
          created_at: new Date().toISOString()
        },
        {
          id: 'science',
          name: 'Science',
          description: 'General science concepts',
          grade_levels: [9, 10, 11, 12],
          created_at: new Date().toISOString()
        },
        {
          id: 'english',
          name: 'English',
          description: 'English language and literature',
          grade_levels: [9, 10, 11, 12],
          created_at: new Date().toISOString()
        },
        {
          id: 'history',
          name: 'History',
          description: 'Historical events and analysis',
          grade_levels: [9, 10, 11, 12],
          created_at: new Date().toISOString()
        },
        {
          id: 'physics',
          name: 'Physics',
          description: 'Physical sciences and mechanics',
          grade_levels: [10, 11, 12],
          created_at: new Date().toISOString()
        },
        {
          id: 'chemistry',
          name: 'Chemistry',
          description: 'Chemical reactions and properties',
          grade_levels: [10, 11, 12],
          created_at: new Date().toISOString()
        },
        {
          id: 'biology',
          name: 'Biology',
          description: 'Life sciences and organisms',
          grade_levels: [9, 10, 11, 12],
          created_at: new Date().toISOString()
        },
        {
          id: 'art',
          name: 'Art',
          description: 'Visual arts and creativity',
          grade_levels: [9, 10, 11, 12],
          created_at: new Date().toISOString()
        },
        {
          id: 'music',
          name: 'Music',
          description: 'Musical theory and performance',
          grade_levels: [9, 10, 11, 12],
          created_at: new Date().toISOString()
        },
        {
          id: 'computer-science',
          name: 'Computer Science',
          description: 'Programming and computer concepts',
          grade_levels: [9, 10, 11, 12],
          created_at: new Date().toISOString()
        }
      ];

      // Try to insert subjects (this will fail if they already exist, which is fine)
      const { error: insertError } = await supabase
        .from('subjects')
        .upsert(subjects, { onConflict: 'id' });

      if (insertError) {
        console.log('Error inserting subjects:', insertError.message);
      } else {
        console.log('Subjects inserted successfully');
      }
    }

    // Create other necessary tables
    await createTablesIfNotExist();

    console.log('Database setup completed!');
    return true;
  } catch (error) {
    console.error('Error setting up database:', error);
    return false;
  }
};

const createTablesIfNotExist = async () => {
  // This function would contain SQL commands to create tables
  // For now, we'll just log that we're checking for tables
  console.log('Checking for required tables...');
  
  // Check if courses table exists
  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select('id')
    .limit(1);

  if (coursesError) {
    console.log('Courses table may not exist:', coursesError.message);
  } else {
    console.log('Courses table exists');
  }

  // Check if profiles table exists
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (profilesError) {
    console.log('Profiles table may not exist:', profilesError.message);
  } else {
    console.log('Profiles table exists');
  }

  // Check if bookings table exists
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select('id')
    .limit(1);

  if (bookingsError) {
    console.log('Bookings table may not exist:', bookingsError.message);
  } else {
    console.log('Bookings table exists');
  }
};

export const checkDatabaseStatus = async () => {
  console.log('Checking database status...');
  
  const tables = ['subjects', 'courses', 'profiles', 'bookings', 'materials', 'assignments'];
  const status: Record<string, boolean> = {};

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      status[table] = !error;
      if (error) {
        console.log(`${table} table: ${error.message}`);
      } else {
        console.log(`${table} table: OK`);
      }
    } catch (err) {
      status[table] = false;
      console.log(`${table} table: Error`);
    }
  }

  return status;
};
