export interface Resource {
  id: number;
  title: string;
  type: 'notes' | 'worksheet' | 'presentation' | 'video' | 'guide';
  subject: string;
  uploaded: string;
  downloads: number;
  fileUrl?: string;
}

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string;
  submitted: number;
  total: number;
  instructions?: string;
}

export interface StudentProgress {
  id: number;
  name: string;
  grade: number;
  progress: number;
  lastActive: string;
  assignmentsCompleted: number;
  totalAssignments: number;
}

// Remove Course import since we're not using it in the tutor types