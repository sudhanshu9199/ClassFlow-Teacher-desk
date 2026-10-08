export type SubmissionStatus = 'submitted' | 'incomplete' | 'missing' | 'absent' | 'pending';
export type ObservationSeverity = 'amber' | 'red' | 'green';
export type ObservationCategory =
  | 'academic'
  | 'behavioral'
  | 'incomplete_work'
  | 'attendance'
  | 'diary'
  | 'handwriting';

export type TeacherActionType =
  | 'Call Parent'
  | 'WhatsApp Message'
  | 'Assign Remedial Work'
  | 'School Diary Note'
  | '1-on-1 Counseling'
  | 'Schedule PTM Slot'
  | 'Handwriting Practice Drill';

export type InterventionStatus = 'todo' | 'in_progress' | 'resolved';

// School Branding & Institutional Settings (2026 Edition)
export type SchoolLogoShape = 'shield' | 'circle' | 'rounded_crest' | 'hexagon';
export type SchoolLogoColorTheme =
  | 'indigo_gold'
  | 'emerald_mint'
  | 'crimson_gold'
  | 'sapphire_cyan'
  | 'slate_bronze'
  | 'purple_coral';

export interface SchoolProfile {
  id?: string;
  schoolName: string;
  school_name?: string; // compatibility alias
  hasAffiliation: boolean;
  affiliation_known?: boolean; // compatibility alias
  affiliationNumber?: string; // e.g. "CBSE/AFF/2130045" or "ICSE/ND-042"
  affiliation_number?: string; // compatibility alias
  board_affiliation?: string; // e.g. "CBSE" or "ICSE"
  addressLine: string; // e.g. "Institutional Area, Model Town"
  institutional_area?: string; // compatibility alias
  campus_locality?: string; // compatibility alias
  city?: string; // compatibility alias
  cityState: string; // e.g. "New Delhi - 110009"
  logoLetters: string; // e.g. "DPMS" or "MTS"
  logoColorTheme: SchoolLogoColorTheme;
  logoShape: SchoolLogoShape;
  customLogoUrl?: string;
  updatedAt?: string;
  updated_at?: string;
}

// Handwriting & Notebook Presentation Assessment (Primary Wing Classes 1-6)
export type HandwritingQuality = 'neat_and_clear' | 'good' | 'average' | 'needs_improvement';
export type HandwritingAlignment = 'proper_baseline' | 'slanted' | 'floats_above_line';
export type HandwritingNeatness = 'very_tidy' | 'frequent_erasures' | 'overwriting_blots';
export type HandwritingFormation = 'clear_letter_sizing' | 'uneven_sizing' | 'joined_cursive_good';
export type HandwritingFormat = 'follows_date_margin' | 'missing_margins_headings';
export type HandwritingTrend = 'improving' | 'steady' | 'declining';
export type HandwritingGrade = 'neat' | 'improving' | 'needs_practice' | 'developing' | 'excellent';

export interface HandwritingProfile {
  quality: HandwritingQuality;
  alignment: HandwritingAlignment;
  neatness: HandwritingNeatness;
  formation: HandwritingFormation;
  format: HandwritingFormat;
  trend: HandwritingTrend;
  remarks?: string;
  notes?: string;
  overall_grade?: HandwritingGrade;
  alignment_grade?: string;
  letter_formation_grade?: string;
  neatness_grade?: string;
  formatting_grade?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface TeacherProfile {
  id: string;
  email: string;
  full_name: string;
  school_name?: string;
  phone?: string;
  created_at?: string;
}

export type Staff = TeacherProfile;

export interface ClassItem {
  id: string;
  name: string;
  subject: string;
  grade_level?: number;
  section?: string;
  academic_year?: string;
  teacher_id?: string;
  class_teacher_id?: string;
  created_at?: string;
  totalStudents?: number;
}

export interface Student {
  id: string;
  admission_number?: string;
  roll_number: number;
  first_name: string;
  last_name: string;
  father_name?: string;
  mother_name?: string;
  primary_contact: string;
  created_at?: string;
  handwriting?: HandwritingProfile;
}

export interface Assignment {
  id: string;
  class_id: string;
  title: string;
  description?: string;
  type: 'homework' | 'classwork' | 'project';
  due_date: string;
  created_at?: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: SubmissionStatus;
  logged_at: string;
}

// Enhanced for multi-date observations with structured points for Indian parents
export interface Observation {
  id: string;
  student_id: string;
  class_id: string;
  teacher_id: string;
  category: ObservationCategory;
  severity: ObservationSeverity;
  teacher_note: string;
  action_type: TeacherActionType;
  suggested_admin_action?: string;
  status: InterventionStatus;
  parent_contacted_at?: string;
  resolved_at?: string;
  created_at: string;
  date?: string; // Explicit date format: "04 Oct 2026" or YYYY-MM-DD
  structured_points?: string[]; // Clear bullet points for parents
  action_for_home?: string; // Action item for parent / student
  handwriting_tag?: string; // Quick tag if related to presentation
}

export interface DailyGridStudentItem {
  student: Student;
  submissionStatus: SubmissionStatus;
  submissionId?: string;
  existingObservation?: Observation;
  allObservations?: Observation[]; // All historical remarks for this student across dates
  recentMissingCount: number;
  lastScoreRemarks?: string;
  handwriting?: HandwritingProfile;
  handwritingProfile?: HandwritingProfile; // compatibility alias
}

export interface DailyClassData {
  classInfo: ClassItem;
  assignment: Assignment;
  students: DailyGridStudentItem[];
  teacher: TeacherProfile;
}

export interface AttentionQueueItem {
  student: Student;
  classInfo: ClassItem;
  urgencyLevel: 'HIGH_PRIORITY_RED' | 'MEDIUM_PRIORITY_AMBER' | 'ON_TRACK_GREEN';
  recentMissingCount: number;
  activeObservation?: Observation;
  allObservations?: Observation[];
  suggestedAction: TeacherActionType;
  handwriting?: HandwritingProfile;
  handwritingProfile?: HandwritingProfile;
}

export interface StudentPtmReport {
  student: Student;
  classInfo: ClassItem;
  schoolProfile?: SchoolProfile;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate: string;
  endDate: string;
  stats: {
    totalAssignments: number;
    submitted: number;
    missing: number;
    incomplete: number;
    completionPct: number;
  };
  assessments: {
    title: string;
    date: string;
    maxMarks: number;
    marksObtained: number;
    percentage: number;
  }[];
  observations: Observation[]; // All historical observations sorted by date
  handwritingSummary?: HandwritingProfile;
  handwriting?: HandwritingProfile; // compatibility alias
}

export interface ClassConsolidatedRow {
  rollNumber: number;
  admissionNumber?: string;
  studentName: string;
  primaryContact: string;
  totalHw: number;
  hwSubmitted: number;
  hwCompletionPct: number;
  avgTestPct: number;
  redFlags: number;
  amberFlags: number;
  handwritingGrade: string; // e.g. "Neat & Clear", "Needs Practice"
  interventionStatus: 'High Attention' | 'Monitor' | 'On Track';
}
