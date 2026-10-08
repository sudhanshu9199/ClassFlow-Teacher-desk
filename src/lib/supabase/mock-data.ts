import {
  TeacherProfile,
  ClassItem,
  Student,
  Assignment,
  DailyGridStudentItem,
  DailyClassData,
  Observation,
  SchoolProfile,
  HandwritingProfile,
} from '@/types/database';

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'Delhi Public Model School',
  school_name: 'Delhi Public Model School',
  hasAffiliation: true,
  affiliation_known: true,
  affiliationNumber: 'CBSE/AFF/2130045',
  affiliation_number: 'CBSE/AFF/2130045',
  board_affiliation: 'CBSE',
  addressLine: 'Institutional Area, Model Town',
  institutional_area: 'Institutional Area',
  campus_locality: 'Model Town',
  city: 'New Delhi',
  cityState: 'New Delhi - 110009',
  logoLetters: 'DPMS',
  logoColorTheme: 'emerald_mint',
  logoShape: 'shield',
  updatedAt: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const MOCK_TEACHER: TeacherProfile = {
  id: 'teacher-sunita-sharma-101',
  email: 'sunita.sharma@primary.edu.in',
  full_name: 'Mrs. Sunita Sharma',
  school_name: 'Delhi Public Model School',
  phone: '+91 98100-11223',
  created_at: new Date().toISOString(),
};

// CLEAN SLATE: Default two assigned classes REMOVED as requested.
// Classes will be created by the teacher or loaded on demand.
export const MOCK_CLASSES: ClassItem[] = [];

// Fallback demo classes available only if user explicitly clicks "Load Sample Demo Class"
export const SAMPLE_DEMO_CLASSES: ClassItem[] = [
  {
    id: 'class-4a-math',
    name: 'Class 4-A',
    subject: 'Mathematics',
    grade_level: 4,
    section: 'A',
    academic_year: '2026-2027',
    teacher_id: MOCK_TEACHER.id,
    totalStudents: 6,
    created_at: new Date().toISOString(),
  },
  {
    id: 'class-5b-evs',
    name: 'Class 5-B',
    subject: 'EVS & Science',
    grade_level: 5,
    section: 'B',
    academic_year: '2026-2027',
    teacher_id: MOCK_TEACHER.id,
    totalStudents: 5,
    created_at: new Date().toISOString(),
  },
];

export const MOCK_CLASS: ClassItem = {
  id: 'class-default',
  name: 'Primary Class',
  subject: 'General Subjects',
  grade_level: 4,
  section: 'A',
  academic_year: '2026-2027',
  teacher_id: MOCK_TEACHER.id,
  totalStudents: 0,
  created_at: new Date().toISOString(),
};

export const MOCK_ASSIGNMENT: Assignment = {
  id: 'asg-today',
  class_id: 'class-default',
  title: 'Daily Classwork & Homework Notebook Check',
  description: 'Notebook check for completed exercise questions and handwriting neatness.',
  type: 'homework',
  due_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
};

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'stud-aarav-sharma',
    admission_number: 'ADM-2026-101',
    roll_number: 1,
    first_name: 'Aarav',
    last_name: 'Sharma',
    father_name: 'Mr. Vivek Sharma',
    mother_name: 'Mrs. Priya Sharma',
    primary_contact: '+91 98111-22331',
    handwriting: {
      quality: 'neat_and_clear',
      alignment: 'proper_baseline',
      neatness: 'very_tidy',
      formation: 'joined_cursive_good',
      format: 'follows_date_margin',
      trend: 'steady',
      remarks: 'Neat cursive presentation with clear 4-line baseline alignment.',
      updatedAt: '2026-10-06',
    },
  },
  {
    id: 'stud-ananya-patel',
    admission_number: 'ADM-2026-102',
    roll_number: 2,
    first_name: 'Ananya',
    last_name: 'Patel',
    father_name: 'Mr. Rajesh Patel',
    mother_name: 'Mrs. Meena Patel',
    primary_contact: '+91 98222-33442',
    handwriting: {
      quality: 'needs_improvement',
      alignment: 'slanted',
      neatness: 'frequent_erasures',
      formation: 'uneven_sizing',
      format: 'missing_margins_headings',
      trend: 'declining',
      remarks: 'Uneven letter sizing, frequent scratching, and missing margin line.',
      updatedAt: '2026-10-06',
    },
  },
  {
    id: 'stud-devansh-gupta',
    admission_number: 'ADM-2026-103',
    roll_number: 3,
    first_name: 'Devansh',
    last_name: 'Gupta',
    father_name: 'Mr. Amit Gupta',
    mother_name: 'Mrs. Ritu Gupta',
    primary_contact: '+91 98333-44553',
    handwriting: {
      quality: 'good',
      alignment: 'proper_baseline',
      neatness: 'very_tidy',
      formation: 'clear_letter_sizing',
      format: 'follows_date_margin',
      trend: 'improving',
      remarks: 'Consistent neatness, improved spacing between words.',
      updatedAt: '2026-10-05',
    },
  },
  {
    id: 'stud-ishaan-verma',
    admission_number: 'ADM-2026-104',
    roll_number: 4,
    first_name: 'Ishaan',
    last_name: 'Verma',
    father_name: 'Mr. Sanjay Verma',
    mother_name: 'Mrs. Pooja Verma',
    primary_contact: '+91 98444-55664',
    handwriting: {
      quality: 'average',
      alignment: 'floats_above_line',
      neatness: 'overwriting_blots',
      formation: 'uneven_sizing',
      format: 'follows_date_margin',
      trend: 'improving',
      remarks: 'Tends to hurry through work causing ink smudges, but letter formation is improving.',
      updatedAt: '2026-10-06',
    },
  },
  {
    id: 'stud-diya-iyer',
    admission_number: 'ADM-2026-105',
    roll_number: 5,
    first_name: 'Diya',
    last_name: 'Iyer',
    father_name: 'Mr. Karthik Iyer',
    mother_name: 'Mrs. Deepa Iyer',
    primary_contact: '+91 98555-66775',
    handwriting: {
      quality: 'neat_and_clear',
      alignment: 'proper_baseline',
      neatness: 'very_tidy',
      formation: 'joined_cursive_good',
      format: 'follows_date_margin',
      trend: 'improving',
      remarks: 'Exemplary notebook presentation with clear headings and colored underline.',
      updatedAt: '2026-10-04',
    },
  },
  {
    id: 'stud-kabir-mehta',
    admission_number: 'ADM-2026-106',
    roll_number: 6,
    first_name: 'Kabir',
    last_name: 'Mehta',
    father_name: 'Mr. Rahul Mehta',
    mother_name: 'Mrs. Suman Mehta',
    primary_contact: '+91 98666-77886',
    handwriting: {
      quality: 'good',
      alignment: 'proper_baseline',
      neatness: 'very_tidy',
      formation: 'clear_letter_sizing',
      format: 'follows_date_margin',
      trend: 'steady',
      remarks: 'Legible and clear. Good margins maintained throughout.',
      updatedAt: '2026-10-06',
    },
  },
];

// Multi-date historical observations for students with clear structured points for Indian parents
export const INITIAL_OBSERVATIONS: Observation[] = [
  // Ananya Patel - Remark 1 (Oct 2): Handwriting & Presentation
  {
    id: 'obs-ananya-01',
    student_id: 'stud-ananya-patel',
    class_id: 'class-4a-math',
    teacher_id: MOCK_TEACHER.id,
    category: 'handwriting',
    severity: 'amber',
    teacher_note: 'Handwriting in math notebook is hurried with frequent ink erasures and missing margin lines.',
    action_type: 'Handwriting Practice Drill',
    status: 'in_progress',
    date: '2026-10-02',
    created_at: new Date('2026-10-02T14:45:00').toISOString(),
    structured_points: [
      'Letter Formation: Uneven number sizing in calculations.',
      'Margin Discipline: Math rough work done inside main margin instead of rough column.',
      'Neatness: Overwriting numbers makes calculation steps difficult to verify.',
    ],
    action_for_home: 'Draw a 1-inch right-side rough work margin and practice 1 page of neat number writing daily.',
    handwriting_tag: 'Uneven sizing & frequent overwriting',
  },
  // Ananya Patel - Remark 2 (Oct 4): Homework & Concept Struggle
  {
    id: 'obs-ananya-02',
    student_id: 'stud-ananya-patel',
    class_id: 'class-4a-math',
    teacher_id: MOCK_TEACHER.id,
    category: 'incomplete_work',
    severity: 'red',
    teacher_note: 'Missed 2 consecutive division homeworks and scored 11.5/25 in PT1. Notebook incomplete.',
    action_type: 'Call Parent',
    status: 'todo',
    date: '2026-10-04',
    created_at: new Date('2026-10-04T15:10:00').toISOString(),
    structured_points: [
      'Homework Non-Submission: Ex 4.2 and Ex 4.3 remain unattempted in homework notebook.',
      'Concept Struggle: Struggling with 2-digit divisor subtraction steps.',
      'PT1 Diagnostic: Scored 11.5/25 due to incomplete division steps.',
    ],
    action_for_home: 'Complete Ex 4.2 pending sums under parental supervision and revise table of 7 and 8 tonight.',
    handwriting_tag: 'Hurried work during sums',
  },
  // Ananya Patel - Remark 3 (Oct 6): School Diary Remark
  {
    id: 'obs-ananya-03',
    student_id: 'stud-ananya-patel',
    class_id: 'class-4a-math',
    teacher_id: MOCK_TEACHER.id,
    category: 'diary',
    severity: 'amber',
    teacher_note: 'School diary not signed by guardian for 2 consecutive days.',
    action_type: 'School Diary Note',
    status: 'todo',
    date: '2026-10-06',
    created_at: new Date('2026-10-06T14:50:00').toISOString(),
    structured_points: [
      'Diary Sign-Off: Teacher remarks in student handbook acknowledged by student but not countersigned by guardian.',
      'Communication: Please check school diary page 18.',
    ],
    action_for_home: 'Kindly inspect and sign the school diary daily to acknowledge homework assignments.',
  },
  // Ishaan Verma - Multi-date Remark (Oct 5): Remedial Practice
  {
    id: 'obs-ishaan-01',
    student_id: 'stud-ishaan-verma',
    class_id: 'class-4a-math',
    teacher_id: MOCK_TEACHER.id,
    category: 'academic',
    severity: 'amber',
    teacher_note: 'Scored 9/25 in PT1 operations test. Recommended for 3:15 PM remedial batch.',
    action_type: 'Assign Remedial Work',
    status: 'todo',
    date: '2026-10-05',
    created_at: new Date('2026-10-05T15:05:00').toISOString(),
    structured_points: [
      'Arithmetic Accuracy: Basic addition is sound, but multiplication carry-over needs revision.',
      'Remedial Group: Enrolled in 3:15 PM staff room remedial practice batch.',
    ],
    action_for_home: 'Practice 5 multiplication sums with 2-digit carryover daily.',
    handwriting_tag: 'Baseline alignment improving',
  },
];

// Clean Slate: No pre-marked default markings! All students start with 'pending'
export const getInitialDailyClassData = (classId?: string): DailyClassData => {
  const chosenClass = SAMPLE_DEMO_CLASSES.find((c) => c.id === classId) || {
    id: classId || 'class-custom',
    name: 'Class Section',
    subject: 'Subject',
    grade_level: 4,
    section: 'A',
    academic_year: '2026-2027',
    teacher_id: MOCK_TEACHER.id,
    totalStudents: 0,
    created_at: new Date().toISOString(),
  };

  // Clean Slate: Status is 'pending' (clean unlogged state) for all students!
  const students: DailyGridStudentItem[] = MOCK_STUDENTS.map((student) => {
    const studentObs = INITIAL_OBSERVATIONS.filter((o) => o.student_id === student.id);
    const latestObs = studentObs[studentObs.length - 1];

    return {
      student,
      submissionStatus: 'pending', // CLEAN SLATE: NOT pre-marked!
      recentMissingCount: 0,
      existingObservation: latestObs,
      allObservations: studentObs,
      handwriting: student.handwriting,
      lastScoreRemarks: student.id === 'stud-aarav-sharma' ? 'PT1: 24/25' : undefined,
    };
  });

  return {
    classInfo: chosenClass,
    assignment: {
      ...MOCK_ASSIGNMENT,
      class_id: chosenClass.id,
    },
    students,
    teacher: MOCK_TEACHER,
  };
};
