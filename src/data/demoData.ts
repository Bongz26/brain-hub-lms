// Demo Data for Brain Hub LMS
// This file contains realistic demo data for showcasing the platform

export const demoUsers = {
  tutors: [
    {
      id: 'tutor-1',
      email: 'sarah.math@brainhub.com',
      password: 'demo123',
      profile: {
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'tutor',
        bio: 'Mathematics expert with 8 years of teaching experience. Specializes in Algebra, Calculus, and Statistics.',
        subjects: ['Mathematics', 'Statistics'],
        grade_levels: ['9', '10', '11', '12'],
        hourly_rate: 45,
        avatar_url: null,
        is_active: true
      }
    },
    {
      id: 'tutor-2',
      email: 'mike.science@brainhub.com',
      password: 'demo123',
      profile: {
        first_name: 'Mike',
        last_name: 'Peterson',
        role: 'tutor',
        bio: 'Science teacher passionate about making complex concepts simple. Expert in Chemistry and Physics.',
        subjects: ['Chemistry', 'Physics', 'Biology'],
        grade_levels: ['9', '10', '11', '12'],
        hourly_rate: 50,
        avatar_url: null,
        is_active: true
      }
    },
    {
      id: 'tutor-3',
      email: 'emma.english@brainhub.com',
      password: 'demo123',
      profile: {
        first_name: 'Emma',
        last_name: 'Davis',
        role: 'tutor',
        bio: 'English Literature graduate with expertise in essay writing, creative writing, and literature analysis.',
        subjects: ['English', 'Literature', 'Writing'],
        grade_levels: ['9', '10', '11', '12'],
        hourly_rate: 40,
        avatar_url: null,
        is_active: true
      }
    }
  ],
  students: [
    {
      id: 'student-1',
      email: 'alex.student@brainhub.com',
      password: 'demo123',
      profile: {
        first_name: 'Alex',
        last_name: 'Thompson',
        role: 'student',
        grade_level: '10',
        subjects_of_interest: ['Mathematics', 'Physics'],
        learning_goals: 'Improve math skills and prepare for college entrance exams',
        is_active: true
      }
    },
    {
      id: 'student-2',
      email: 'jessica.student@brainhub.com',
      password: 'demo123',
      profile: {
        first_name: 'Jessica',
        last_name: 'Wilson',
        role: 'student',
        grade_level: '11',
        subjects_of_interest: ['Chemistry', 'Biology'],
        learning_goals: 'Excel in science subjects and pursue pre-med track',
        is_active: true
      }
    },
    {
      id: 'student-3',
      email: 'david.student@brainhub.com',
      password: 'demo123',
      profile: {
        first_name: 'David',
        last_name: 'Brown',
        role: 'student',
        grade_level: '9',
        subjects_of_interest: ['English', 'Mathematics'],
        learning_goals: 'Build strong foundation for high school success',
        is_active: true
      }
    }
  ]
};

export const demoCourses = [
  {
    id: 'course-1',
    title: 'Advanced Algebra',
    description: 'Comprehensive course covering advanced algebraic concepts including quadratic equations, polynomials, and functions.',
    subject: 'Mathematics',
    grade_level: 10,
    tutor_id: 'tutor-1',
    price: 299,
    duration_weeks: 8,
    max_students: 15,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    topics: [
      'Quadratic Equations',
      'Polynomial Functions',
      'Rational Expressions',
      'Exponential Functions',
      'Logarithmic Functions'
    ]
  },
  {
    id: 'course-2',
    title: 'Physical Sciences Fundamentals',
    description: 'Master the basics of physical sciences including atomic structure, chemical bonding, and reaction mechanisms.',
    subject: 'Physical Sciences',
    grade_level: 11,
    tutor_id: 'tutor-2',
    price: 349,
    duration_weeks: 10,
    max_students: 12,
    is_active: true,
    created_at: '2024-01-05T00:00:00Z',
    topics: [
      'Atomic Structure',
      'Chemical Bonding',
      'Stoichiometry',
      'Acids and Bases',
      'Organic Chemistry Basics'
    ]
  },
  {
    id: 'course-3',
    title: 'Creative Writing Workshop',
    description: 'Develop your creative writing skills through various exercises, peer reviews, and personalized feedback.',
    subject: 'English',
    grade_level: 9,
    tutor_id: 'tutor-3',
    price: 199,
    duration_weeks: 6,
    max_students: 20,
    is_active: true,
    created_at: '2024-01-10T00:00:00Z',
    topics: [
      'Character Development',
      'Plot Structure',
      'Dialogue Writing',
      'Descriptive Language',
      'Story Endings'
    ]
  },
  {
    id: 'course-4',
    title: 'Life Sciences Problem Solving',
    description: 'Learn effective problem-solving strategies for life sciences with focus on biology, genetics, and ecology.',
    subject: 'Life Sciences',
    grade_level: 12,
    tutor_id: 'tutor-2',
    price: 399,
    duration_weeks: 12,
    max_students: 10,
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
    topics: [
      'Cell Biology',
      'Genetics',
      'Evolution',
      'Ecology',
      'Human Biology'
    ]
  }
];

export const demoBookings = [
  {
    id: 'booking-1',
    student_id: 'student-1',
    tutor_id: 'tutor-1',
    course_id: 'course-1',
    title: 'Algebra Review Session',
    description: 'Review quadratic equations and polynomial functions',
    start_time: '2024-01-20T14:00:00Z',
    end_time: '2024-01-20T15:00:00Z',
    status: 'scheduled',
    meeting_link: 'https://meet.google.com/abc-defg-hij',
    notes: 'Focus on quadratic formula and graphing',
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: 'booking-2',
    student_id: 'student-2',
    tutor_id: 'tutor-2',
    course_id: 'course-2',
    title: 'Chemistry Lab Help',
    description: 'Help with titration calculations and lab report',
    start_time: '2024-01-22T16:00:00Z',
    end_time: '2024-01-22T17:00:00Z',
    status: 'scheduled',
    meeting_link: 'https://meet.google.com/xyz-1234-abc',
    notes: 'Student needs help with molarity calculations',
    created_at: '2024-01-19T14:30:00Z'
  },
  {
    id: 'booking-3',
    student_id: 'student-3',
    tutor_id: 'tutor-3',
    course_id: 'course-3',
    title: 'Essay Writing Workshop',
    description: 'One-on-one essay writing guidance',
    start_time: '2024-01-25T15:30:00Z',
    end_time: '2024-01-25T16:30:00Z',
    status: 'scheduled',
    meeting_link: 'https://meet.google.com/def-5678-ghi',
    notes: 'Working on college application essay',
    created_at: '2024-01-20T09:15:00Z'
  }
];

export const demoAssignments = [
  {
    id: 'assignment-1',
    course_id: 'course-1',
    title: 'Quadratic Equations Practice',
    description: 'Solve 20 quadratic equations using different methods',
    due_date: '2024-01-25T23:59:59Z',
    max_points: 100,
    assignment_type: 'homework',
    instructions: 'Show all work and use the quadratic formula where applicable',
    attachments: ['worksheet.pdf'],
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'assignment-2',
    course_id: 'course-2',
    title: 'Chemical Bonding Lab Report',
    description: 'Write a comprehensive lab report on ionic and covalent bonding',
    due_date: '2024-01-28T23:59:59Z',
    max_points: 150,
    assignment_type: 'project',
    instructions: 'Include hypothesis, procedure, results, and conclusion',
    attachments: ['lab_instructions.pdf', 'data_sheet.xlsx'],
    created_at: '2024-01-16T00:00:00Z'
  },
  {
    id: 'assignment-3',
    course_id: 'course-3',
    title: 'Short Story Creation',
    description: 'Write a 1000-word short story using the elements we discussed',
    due_date: '2024-01-30T23:59:59Z',
    max_points: 200,
    assignment_type: 'project',
    instructions: 'Focus on character development and plot structure',
    attachments: ['story_guidelines.pdf'],
    created_at: '2024-01-18T00:00:00Z'
  }
];

export const demoMaterials = [
  {
    id: 'material-1',
    tutor_id: 'tutor-1',
    title: 'Algebra Formula Sheet',
    description: 'Comprehensive formula reference for algebra students',
    type: 'reference',
    subject: 'Mathematics',
    file_url: '/materials/algebra_formulas.pdf',
    file_size: '2.3 MB',
    downloads: 45,
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 'material-2',
    tutor_id: 'tutor-2',
    title: 'Chemistry Lab Safety Guide',
    description: 'Essential safety procedures for chemistry laboratory work',
    type: 'guide',
    subject: 'Chemistry',
    file_url: '/materials/lab_safety.pdf',
    file_size: '1.8 MB',
    downloads: 32,
    created_at: '2024-01-12T00:00:00Z'
  },
  {
    id: 'material-3',
    tutor_id: 'tutor-3',
    title: 'Creative Writing Prompts',
    description: '50 inspiring writing prompts to spark creativity',
    type: 'worksheet',
    subject: 'English',
    file_url: '/materials/writing_prompts.pdf',
    file_size: '3.1 MB',
    downloads: 67,
    created_at: '2024-01-14T00:00:00Z'
  }
];

export const demoStats = {
  totalStudents: 150,
  totalTutors: 25,
  totalCourses: 45,
  totalBookings: 320,
  averageRating: 4.8,
  completionRate: 87
};
