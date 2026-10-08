import {
  TeacherProfile,
  ClassItem,
  Student,
  Assignment,
  DailyGridStudentItem,
  DailyClassData,
  Observation,
} from '@/types/database';

export const MOCK_TEACHER: TeacherProfile = {
  id: 'teacher-sunita-sharma-101',
  email: 'sunita.sharma@primary.edu.in',
  full_name: 'Mrs. Sunita Sharma',
  school_name: 'Model Primary School',
  phone: '+91 98100-11223',
  created_at: new Date().toISOString(),
};

export const MOCK_CLASSES: ClassItem[] = [
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

export const MOCK_CLASS: ClassItem = MOCK_CLASSES[0];

export const MOCK_ASSIGNMENT: Assignment = {
  id: 'asg-ex-4-3-division',
  class_id: MOCK_CLASS.id,
  title: 'Ex 4.3: Division with Remainders (Notebook Check)',
  description: 'Page 54, Exercise 4.3 Questions 1 through 10 in class math notebook.',
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
  },
];

export const INITIAL_OBSERVATIONS: Observation[] = [
  {
    id: 'obs-ananya-01',
    student_id: 'stud-ananya-patel',
    class_id: 'class-4a-math',
    teacher_id: MOCK_TEACHER.id,
    category: 'incomplete_work',
    severity: 'red',
    teacher_note: 'Missed 2 consecutive division homeworks and scored 11.5/25 in PT1. Notebook incomplete.',
    action_type: 'Call Parent',
    status: 'todo',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'obs-ishaan-02',
    student_id: 'stud-ishaan-verma',
    class_id: 'class-4a-math',
    teacher_id: MOCK_TEACHER.id,
    category: 'academic',
    severity: 'amber',
    teacher_note: 'Scored 9/25 in PT1 operations test. Recommended for 3:15 PM remedial batch.',
    action_type: 'Assign Remedial Work',
    status: 'todo',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const getInitialDailyClassData = (classId?: string): DailyClassData => {
  const chosenClass = MOCK_CLASSES.find((c) => c.id === classId) || MOCK_CLASS;

  const students: DailyGridStudentItem[] = [
    {
      student: MOCK_STUDENTS[0], // Aarav
      submissionStatus: 'submitted',
      recentMissingCount: 0,
      lastScoreRemarks: 'PT1: 24/25 • Excellent problem solving',
    },
    {
      student: MOCK_STUDENTS[1], // Ananya
      submissionStatus: 'missing',
      existingObservation: INITIAL_OBSERVATIONS[0],
      recentMissingCount: 2,
      lastScoreRemarks: 'PT1: 11.5/25 • Struggling with multi-step division',
    },
    {
      student: MOCK_STUDENTS[2], // Devansh
      submissionStatus: 'submitted',
      recentMissingCount: 0,
      lastScoreRemarks: 'PT1: 19/25 • Good grasp of concepts',
    },
    {
      student: MOCK_STUDENTS[3], // Ishaan
      submissionStatus: 'incomplete',
      existingObservation: INITIAL_OBSERVATIONS[1],
      recentMissingCount: 1,
      lastScoreRemarks: 'PT1: 9/25 • Needs remedial assistance',
    },
    {
      student: MOCK_STUDENTS[4], // Diya
      submissionStatus: 'submitted',
      recentMissingCount: 0,
      lastScoreRemarks: 'PT1: 23.5/25 • Very neat presentation',
    },
    {
      student: MOCK_STUDENTS[5], // Kabir
      submissionStatus: 'submitted',
      recentMissingCount: 0,
      lastScoreRemarks: 'PT1: 20/25 • Consistent performance',
    },
  ];

  return {
    classInfo: chosenClass,
    assignment: MOCK_ASSIGNMENT,
    students,
    teacher: MOCK_TEACHER,
  };
};
