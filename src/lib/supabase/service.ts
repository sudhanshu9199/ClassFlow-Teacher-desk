import { createClient, isSupabaseConfigured } from './client';
import {
  DailyClassData,
  DailyGridStudentItem,
  Observation,
  SubmissionStatus,
  ClassItem,
  Student,
  TeacherActionType,
  InterventionStatus,
  AttentionQueueItem,
  StudentPtmReport,
  ClassConsolidatedRow,
} from '@/types/database';
import { getInitialDailyClassData, MOCK_CLASSES, MOCK_TEACHER } from './mock-data';

const STORAGE_KEY_PREFIX = 'classflow_daily_';
const CLASSES_STORAGE_KEY = 'classflow_classes_list';
const ATTENTION_STORAGE_KEY = 'classflow_attention_queue';

// Client-side cache/state manager for mock / local mode
const getLocalData = (classId: string): DailyClassData => {
  if (typeof window === 'undefined') {
    return getInitialDailyClassData(classId);
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${classId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading from localStorage', err);
  }

  const initial = getInitialDailyClassData(classId);
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${classId}`, JSON.stringify(initial));
  } catch {}
  return initial;
};

const saveLocalData = (classId: string, data: DailyClassData): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${classId}`, JSON.stringify(data));
  } catch (err) {
    console.error('Failed saving to localStorage', err);
  }
};

export const ClassFlowService = {
  isLiveSupabase(): boolean {
    return isSupabaseConfigured();
  },

  async getAllClasses(): Promise<ClassItem[]> {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(CLASSES_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {}
    }
    return MOCK_CLASSES;
  },

  async createClass(newClass: Omit<ClassItem, 'id' | 'created_at'>): Promise<ClassItem> {
    const created: ClassItem = {
      ...newClass,
      id: `class-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      totalStudents: 0,
    };

    if (typeof window !== 'undefined') {
      try {
        const existing = await this.getAllClasses();
        const updated = [...existing, created];
        localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to create class locally', err);
      }
    }
    return created;
  },

  async getNextRollNumber(classId: string): Promise<number> {
    const currentData = await this.getDailyClassData(classId);
    if (!currentData || currentData.students.length === 0) return 1;
    const rolls = currentData.students.map((s) => s.student.roll_number);
    return Math.max(...rolls) + 1;
  },

  async addStudentsToClass(
    classId: string,
    newStudents: {
      rollNumber: number;
      firstName: string;
      lastName: string;
      phone: string;
      fatherName?: string;
      motherName?: string;
      admissionNumber?: string;
    }[]
  ): Promise<DailyClassData> {
    const currentData = await this.getDailyClassData(classId);
    const mapped: DailyGridStudentItem[] = newStudents.map((s) => ({
      student: {
        id: `stud-${Date.now().toString(36)}-${s.rollNumber}-${Math.random().toString(36).substring(2, 6)}`,
        admission_number: s.admissionNumber || `ADM-2026-${s.rollNumber.toString().padStart(3, '0')}`,
        roll_number: s.rollNumber,
        first_name: s.firstName,
        last_name: s.lastName,
        father_name: s.fatherName || '',
        mother_name: s.motherName || '',
        primary_contact: s.phone,
      },
      submissionStatus: 'pending',
      recentMissingCount: 0,
    }));

    const updatedData: DailyClassData = {
      ...currentData,
      students: [...currentData.students, ...mapped].sort(
        (a, b) => a.student.roll_number - b.student.roll_number
      ),
    };

    saveLocalData(classId, updatedData);

    // Sync totalStudents count in class list
    if (typeof window !== 'undefined') {
      try {
        const storedClasses = localStorage.getItem(CLASSES_STORAGE_KEY);
        if (storedClasses) {
          const list: ClassItem[] = JSON.parse(storedClasses);
          const idx = list.findIndex((c) => c.id === classId);
          if (idx !== -1) {
            list[idx].totalStudents = updatedData.students.length;
            localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(list));
          }
        }
      } catch {}
    }

    return updatedData;
  },

  async updateStudentInClass(
    classId: string,
    studentId: string,
    updated: {
      rollNumber: number;
      firstName: string;
      lastName: string;
      phone: string;
      fatherName?: string;
      motherName?: string;
      admissionNumber?: string;
    }
  ): Promise<DailyClassData> {
    const currentData = await this.getDailyClassData(classId);
    const updatedStudents = currentData.students.map((item) => {
      if (item.student.id === studentId) {
        return {
          ...item,
          student: {
            ...item.student,
            roll_number: updated.rollNumber,
            first_name: updated.firstName,
            last_name: updated.lastName,
            primary_contact: updated.phone,
            father_name: updated.fatherName ?? item.student.father_name,
            mother_name: updated.motherName ?? item.student.mother_name,
            admission_number: updated.admissionNumber ?? item.student.admission_number,
          },
        };
      }
      return item;
    });

    updatedStudents.sort((a, b) => a.student.roll_number - b.student.roll_number);
    const updatedData: DailyClassData = { ...currentData, students: updatedStudents };
    saveLocalData(classId, updatedData);
    return updatedData;
  },

  async removeStudentFromClass(
    classId: string,
    studentId: string
  ): Promise<DailyClassData> {
    const currentData = await this.getDailyClassData(classId);
    const updatedStudents = currentData.students.filter(
      (item) => item.student.id !== studentId
    );

    const updatedData: DailyClassData = { ...currentData, students: updatedStudents };
    saveLocalData(classId, updatedData);

    // Sync totalStudents count in class list
    if (typeof window !== 'undefined') {
      try {
        const storedClasses = localStorage.getItem(CLASSES_STORAGE_KEY);
        if (storedClasses) {
          const list: ClassItem[] = JSON.parse(storedClasses);
          const idx = list.findIndex((c) => c.id === classId);
          if (idx !== -1) {
            list[idx].totalStudents = updatedData.students.length;
            localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(list));
          }
        }
      } catch {}
    }

    return updatedData;
  },

  async getDailyClassData(classId: string): Promise<DailyClassData> {
    const supabase = createClient();

    if (!supabase) {
      return getLocalData(classId);
    }

    try {
      const { data: classData, error: classErr } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classErr || !classData) {
        return getLocalData(classId);
      }

      // 2. Fetch Teacher
      const { data: teacherData } = await supabase
        .from('staff')
        .select('*')
        .eq('id', classData.class_teacher_id)
        .single();

      // 3. Fetch latest assignment
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', classId)
        .order('due_date', { ascending: false })
        .limit(1)
        .single();

      // 4. Fetch enrolled students
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('students (*)')
        .eq('class_id', classId);

      const enrolledStudents = (enrollments || []).map((e: any) => e.students).filter(Boolean);
      enrolledStudents.sort((a: any, b: any) => a.roll_number - b.roll_number);

      const asgId = assignmentData?.id;
      let submissionsMap: Record<string, { status: SubmissionStatus; id: string }> = {};

      if (asgId) {
        const { data: subs } = await supabase
          .from('submissions')
          .select('*')
          .eq('assignment_id', asgId);

        (subs || []).forEach((s: any) => {
          submissionsMap[s.student_id] = { status: s.status, id: s.id };
        });
      }

      const { data: activeObs } = await supabase
        .from('observations')
        .select('*')
        .eq('class_id', classId)
        .neq('status', 'resolved');

      const obsMap: Record<string, Observation> = {};
      (activeObs || []).forEach((o: any) => {
        obsMap[o.student_id] = o;
      });

      const students: DailyGridStudentItem[] = enrolledStudents.map((st: Student) => {
        const subInfo = submissionsMap[st.id];
        return {
          student: st,
          submissionStatus: subInfo?.status || 'pending',
          submissionId: subInfo?.id,
          existingObservation: obsMap[st.id],
          recentMissingCount: subInfo?.status === 'missing' ? 1 : 0,
        };
      });

      return {
        classInfo: classData,
        assignment: assignmentData || {
          id: 'temp-asg',
          class_id: classId,
          title: 'Daily Homework',
          type: 'homework',
          due_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        },
        students,
        teacher: teacherData || MOCK_TEACHER,
      };
    } catch (err) {
      console.error('Error connecting to Supabase in getDailyClassData', err);
      return getLocalData(classId);
    }
  },

  async updateSubmissionStatus(
    classId: string,
    studentId: string,
    assignmentId: string,
    newStatus: SubmissionStatus
  ): Promise<{ success: boolean; submissionId?: string }> {
    const supabase = createClient();

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('submissions')
          .upsert(
            {
              assignment_id: assignmentId,
              student_id: studentId,
              status: newStatus,
              logged_at: new Date().toISOString(),
            },
            { onConflict: 'assignment_id,student_id' }
          )
          .select('id')
          .single();

        if (error) throw error;
        return { success: true, submissionId: data?.id };
      } catch (err) {
        console.error('Supabase submission upsert failed, updating locally', err);
      }
    }

    const current = getLocalData(classId);
    const updatedStudents = current.students.map((item) => {
      if (item.student.id === studentId) {
        return {
          ...item,
          submissionStatus: newStatus,
          recentMissingCount:
            newStatus === 'missing'
              ? Math.max(1, item.recentMissingCount + 1)
              : Math.max(0, item.recentMissingCount - 1),
        };
      }
      return item;
    });

    saveLocalData(classId, { ...current, students: updatedStudents });
    return { success: true };
  },

  async markAllRemainingSubmitted(
    classId: string,
    assignmentId: string
  ): Promise<{ success: boolean; updatedCount: number }> {
    const current = getLocalData(classId);
    let count = 0;

    const updatedStudents = current.students.map((item) => {
      if (item.submissionStatus === 'pending') {
        count++;
        return {
          ...item,
          submissionStatus: 'submitted' as SubmissionStatus,
        };
      }
      return item;
    });

    saveLocalData(classId, { ...current, students: updatedStudents });

    const supabase = createClient();
    if (supabase) {
      try {
        const pendingStudents = current.students.filter((s) => s.submissionStatus === 'pending');
        const rows = pendingStudents.map((s) => ({
          assignment_id: assignmentId,
          student_id: s.student.id,
          status: 'submitted',
          logged_at: new Date().toISOString(),
        }));

        if (rows.length > 0) {
          await supabase.from('submissions').upsert(rows, { onConflict: 'assignment_id,student_id' });
        }
      } catch (err) {
        console.error('Supabase bulk upsert failed', err);
      }
    }

    return { success: true, updatedCount: count };
  },

  async saveObservation(
    classId: string,
    payload: {
      studentId: string;
      category: Observation['category'];
      severity: Observation['severity'];
      actionType: TeacherActionType;
      teacherNote: string;
      status?: InterventionStatus;
    }
  ): Promise<{ success: boolean; observation: Observation }> {
    const newObs: Observation = {
      id: `obs-${Date.now().toString(36)}`,
      student_id: payload.studentId,
      class_id: classId,
      teacher_id: MOCK_TEACHER.id,
      category: payload.category,
      severity: payload.severity,
      action_type: payload.actionType,
      teacher_note: payload.teacherNote,
      status: payload.status || 'todo',
      created_at: new Date().toISOString(),
    };

    const current = getLocalData(classId);
    const updatedStudents = current.students.map((item) => {
      if (item.student.id === payload.studentId) {
        return {
          ...item,
          existingObservation: newObs,
        };
      }
      return item;
    });

    saveLocalData(classId, { ...current, students: updatedStudents });
    return { success: true, observation: newObs };
  },

  async resolveObservation(classId: string, studentId: string): Promise<boolean> {
    const current = getLocalData(classId);
    const updatedStudents = current.students.map((item) => {
      if (item.student.id === studentId && item.existingObservation) {
        return {
          ...item,
          existingObservation: {
            ...item.existingObservation,
            status: 'resolved' as InterventionStatus,
            resolved_at: new Date().toISOString(),
          },
        };
      }
      return item;
    });

    saveLocalData(classId, { ...current, students: updatedStudents });
    return true;
  },

  async getAttentionQueue(): Promise<AttentionQueueItem[]> {
    const classes = await this.getAllClasses();
    const items: AttentionQueueItem[] = [];

    for (const c of classes) {
      const data = await this.getDailyClassData(c.id);
      data.students.forEach((st) => {
        const obs = st.existingObservation;
        const isRed = obs?.severity === 'red' || st.recentMissingCount >= 2;
        const isAmber = obs?.severity === 'amber' || st.recentMissingCount === 1;

        if (isRed || isAmber) {
          items.push({
            student: st.student,
            classInfo: c,
            urgencyLevel: isRed ? 'HIGH_PRIORITY_RED' : 'MEDIUM_PRIORITY_AMBER',
            recentMissingCount: st.recentMissingCount,
            activeObservation: obs,
            suggestedAction: obs?.action_type || (isRed ? 'Call Parent' : 'Assign Remedial Work'),
          });
        }
      });
    }

    return items.sort((a, b) => (a.urgencyLevel === 'HIGH_PRIORITY_RED' ? -1 : 1));
  },

  async getStudentPtmReport(
    studentId: string,
    classId?: string,
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<StudentPtmReport> {
    let targetClassData: DailyClassData | null = null;
    let studentItem: DailyGridStudentItem | undefined;

    if (classId) {
      targetClassData = await this.getDailyClassData(classId);
      studentItem = targetClassData.students.find((s) => s.student.id === studentId);
    }

    if (!studentItem) {
      const classes = await this.getAllClasses();
      for (const c of classes) {
        const d = await this.getDailyClassData(c.id);
        const match = d.students.find((s) => s.student.id === studentId);
        if (match) {
          targetClassData = d;
          studentItem = match;
          break;
        }
      }
    }

    if (!targetClassData || !studentItem) {
      targetClassData = await this.getDailyClassData('class-4a-math');
      studentItem = targetClassData.students[0];
    }

    return {
      student: studentItem.student,
      classInfo: targetClassData.classInfo,
      timeframe,
      startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      stats: {
        totalAssignments: 5,
        submitted: 4,
        missing: studentItem.submissionStatus === 'missing' ? 1 : 0,
        incomplete: studentItem.submissionStatus === 'incomplete' ? 1 : 0,
        completionPct: 80,
      },
      assessments: [
        {
          title: 'Periodic Test 1: Mental Math & Operations',
          date: '2026-10-02',
          maxMarks: 25,
          marksObtained: 18.5,
          percentage: 74,
        },
      ],
      observations: studentItem.existingObservation ? [studentItem.existingObservation] : [],
    };
  },

  async getClassConsolidatedReport(classId: string): Promise<ClassConsolidatedRow[]> {
    const classData = await this.getDailyClassData(classId);

    return classData.students.map((s) => {
      const isRed = s.existingObservation?.severity === 'red' || s.recentMissingCount >= 2;
      const isAmber = s.existingObservation?.severity === 'amber' || s.recentMissingCount === 1;

      return {
        rollNumber: s.student.roll_number,
        admissionNumber: s.student.admission_number,
        studentName: `${s.student.first_name} ${s.student.last_name}`,
        primaryContact: s.student.primary_contact,
        totalHw: 5,
        hwSubmitted: s.submissionStatus === 'submitted' ? 5 : 4,
        hwCompletionPct: s.submissionStatus === 'submitted' ? 100 : 80,
        avgTestPct: 76,
        redFlags: isRed ? 1 : 0,
        amberFlags: isAmber ? 1 : 0,
        interventionStatus: isRed ? 'High Attention' : isAmber ? 'Monitor' : 'On Track',
      };
    });
  },
};
