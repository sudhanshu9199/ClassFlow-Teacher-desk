export type SubmissionStatus = 'submitted' | 'incomplete' | 'missing' | 'absent' | 'pending';
export type ObservationSeverity = 'amber' | 'red';
export type ObservationCategory = 'academic' | 'behavioral' | 'incomplete_work' | 'attendance' | 'diary';

export type TeacherActionType =
  | 'Call Parent'
  | 'WhatsApp Message'
  | 'Assign Remedial Work'
  | 'School Diary Note'
  | '1-on-1 Counseling'
  | 'Schedule PTM Slot';

export type InterventionStatus = 'todo' | 'in_progress' | 'resolved';

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
}

export interface DailyGridStudentItem {
  student: Student;
  submissionStatus: SubmissionStatus;
  submissionId?: string;
  existingObservation?: Observation;
  recentMissingCount: number;
  lastScoreRemarks?: string;
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
  suggestedAction: TeacherActionType;
}

export interface StudentPtmReport {
  student: Student;
  classInfo: ClassItem;
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
  observations: Observation[];
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
  interventionStatus: 'High Attention' | 'Monitor' | 'On Track';
}
