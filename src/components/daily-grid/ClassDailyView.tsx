'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  DailyClassData,
  DailyGridStudentItem,
  Observation,
  SubmissionStatus,
  TeacherActionType,
  ObservationCategory,
  ObservationSeverity,
  SchoolProfile,
  HandwritingProfile,
} from '@/types/database';
import { DailyGridHeader } from './DailyGridHeader';
import { AcceleratorBanner } from './AcceleratorBanner';
import { StudentRowCard } from './StudentRowCard';
import { EscalationBottomSheet } from './EscalationBottomSheet';
import { ClassRosterManagerModal } from './ClassRosterManagerModal';
import { ClassFlowService } from '@/lib/supabase/service';
import { DEFAULT_SCHOOL_PROFILE } from '@/lib/supabase/mock-data';
import { CheckCircle, AlertTriangle, ArrowRight, RotateCcw, Sparkles, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';

interface ClassDailyViewProps {
  initialData: DailyClassData;
  classId: string;
}

export const ClassDailyView: React.FC<ClassDailyViewProps> = ({ initialData, classId }) => {
  const [data, setData] = useState<DailyClassData>(initialData);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [previousStates, setPreviousStates] = useState<DailyClassData | null>(null);
  const [selectedStudentForFlag, setSelectedStudentForFlag] =
    useState<DailyGridStudentItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function loadProfile() {
      const profile = await ClassFlowService.getSchoolProfile();
      setSchoolProfile(profile);
    }
    loadProfile();
  }, []);

  const isLiveSupabase = ClassFlowService.isLiveSupabase();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3200);
  };

  // Status Counts
  const totalStudents = data.students.length;
  const submittedCount = data.students.filter((s) => s.submissionStatus === 'submitted').length;
  const incompleteCount = data.students.filter((s) => s.submissionStatus === 'incomplete').length;
  const missingCount = data.students.filter((s) => s.submissionStatus === 'missing').length;
  const absentCount = data.students.filter((s) => s.submissionStatus === 'absent').length;
  const pendingCount = data.students.filter((s) => s.submissionStatus === 'pending').length;
  const flaggedCount = data.students.filter((s) => Boolean(s.existingObservation)).length;

  const unmarkedOrNonSubmitted = data.students.filter(
    (s) => s.submissionStatus !== 'submitted'
  );

  // 1. Single Student Status Cycle
  const handleStatusChange = async (studentId: string, nextStatus: SubmissionStatus) => {
    // Optimistic Update
    setData((prev) => ({
      ...prev,
      students: prev.students.map((item) =>
        item.student.id === studentId ? { ...item, submissionStatus: nextStatus } : item
      ),
    }));

    // Async persist
    startTransition(async () => {
      try {
        await ClassFlowService.updateSubmissionStatus(
          classId,
          studentId,
          data.assignment.id,
          nextStatus
        );
      } catch (err) {
        console.error('Failed to persist submission status:', err);
      }
    });
  };

  // 2. 1-Tap Accelerator: Mark All Remaining as Submitted
  const handleMarkAllSubmitted = async () => {
    const targets = unmarkedOrNonSubmitted.map((s) => s.student.id);
    if (targets.length === 0) return;

    // Save previous for Undo
    setPreviousStates(data);

    // Optimistic batch update
    setData((prev) => ({
      ...prev,
      students: prev.students.map((item) =>
        targets.includes(item.student.id)
          ? { ...item, submissionStatus: 'submitted' }
          : item
      ),
    }));

    showToast(`Marked ${targets.length} students as Submitted!`);

    startTransition(async () => {
      try {
        await ClassFlowService.markAllRemainingSubmitted(classId, data.assignment.id);
      } catch (err) {
        console.error('Failed to batch mark submitted:', err);
      }
    });
  };

  // 3. Undo Accelerator
  const handleUndo = () => {
    if (previousStates) {
      setData(previousStates);
      setPreviousStates(null);
      showToast('Reverted last batch submission');
    }
  };

  // 4. Open Flag Bottom Sheet
  const handleOpenFlag = (item: DailyGridStudentItem) => {
    setSelectedStudentForFlag(item);
    setIsSheetOpen(true);
  };

  // 5. Save Observation / Flag / Handwriting Profile
  const handleSaveObservation = async (payload: {
    studentId: string;
    category: ObservationCategory;
    severity: ObservationSeverity;
    actionType: TeacherActionType;
    teacherNote: string;
    structuredPoints?: string[];
    actionForHome?: string;
    handwritingTag?: string;
    handwritingProfile?: Partial<HandwritingProfile>;
    date?: string;
  }) => {
    const tempObs: Observation = {
      id: `temp-${Date.now()}`,
      student_id: payload.studentId,
      class_id: classId,
      teacher_id: data.teacher.id,
      category: payload.category,
      severity: payload.severity,
      action_type: payload.actionType,
      teacher_note: payload.teacherNote,
      structured_points: payload.structuredPoints,
      action_for_home: payload.actionForHome,
      handwriting_tag: payload.handwritingTag,
      date: payload.date || new Date().toISOString().split('T')[0],
      status: 'todo',
      created_at: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      students: prev.students.map((item) => {
        if (item.student.id !== payload.studentId) return item;
        const currentAll = item.allObservations || (item.existingObservation ? [item.existingObservation] : []);
        return {
          ...item,
          existingObservation: tempObs,
          allObservations: [tempObs, ...currentAll.filter((o) => o.id !== tempObs.id)],
          handwritingProfile: payload.handwritingProfile
            ? ({ ...(item.handwritingProfile || {}), ...payload.handwritingProfile } as HandwritingProfile)
            : item.handwritingProfile,
        };
      }),
    }));

    showToast(
      `Saved remark (${payload.severity === 'red' ? '🔴 High Red' : '🟡 Amber'}): ${payload.actionType}`
    );

    // Persist
    startTransition(async () => {
      try {
        if (payload.handwritingProfile) {
          await ClassFlowService.saveHandwritingProfile(classId, payload.studentId, payload.handwritingProfile);
        }
        await ClassFlowService.saveObservation(classId, {
          studentId: payload.studentId,
          category: payload.category,
          severity: payload.severity,
          actionType: payload.actionType,
          teacherNote: payload.teacherNote,
          structuredPoints: payload.structuredPoints,
          actionForHome: payload.actionForHome,
          handwritingTag: payload.handwritingTag,
          date: payload.date,
        });

        // Re-sync full data
        const refreshed = await ClassFlowService.getDailyClassData(classId);
        setData(refreshed);
      } catch (err) {
        console.error('Failed to save remark:', err);
      }
    });
  };

  // 6. Roster Management Handlers
  const handleAddStudents = async (newStudents: any[]) => {
    try {
      const updated = await ClassFlowService.addStudentsToClass(classId, newStudents);
      setData(updated);
      showToast(`Enrolled ${newStudents.length} students into ${data.classInfo.name}!`);
    } catch (err) {
      console.error('Failed to add students to class:', err);
    }
  };

  const handleUpdateStudent = async (studentId: string, updatedFields: any) => {
    try {
      const updated = await ClassFlowService.updateStudentInClass(classId, studentId, updatedFields);
      setData(updated);
      showToast(`Updated student details for Roll #${updatedFields.rollNumber}!`);
    } catch (err) {
      console.error('Failed to update student:', err);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const updated = await ClassFlowService.removeStudentFromClass(classId, studentId);
      setData(updated);
      showToast('Removed student from class roster.');
    } catch (err) {
      console.error('Failed to remove student:', err);
    }
  };

  const isClassFullyLogged = totalStudents > 0 && pendingCount === 0;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          {previousStates && (
            <button
              onClick={handleUndo}
              className="text-emerald-400 hover:text-emerald-300 font-bold text-xs underline shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Undo
            </button>
          )}
        </div>
      )}

      {/* Header Container */}
      <DailyGridHeader
        classInfo={data.classInfo}
        assignment={data.assignment}
        teacher={data.teacher}
        totalStudents={totalStudents}
        submittedCount={submittedCount}
        isLiveSupabase={isLiveSupabase}
        schoolProfile={schoolProfile}
        onOpenRosterModal={() => setIsRosterModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {totalStudents === 0 ? (
          /* Empty State when class has no students */
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 text-center shadow-xs space-y-4 mt-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <Users className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                No Students in {data.classInfo.name} Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
                Add your students to start logging daily homework and tracking academic interventions. You can copy-paste directly from WhatsApp or Excel!
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Import or Add Students to {data.classInfo.name}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Accelerator Banner */}
            <AcceleratorBanner
              unmarkedCount={unmarkedOrNonSubmitted.length}
              totalStudents={totalStudents}
              onMarkAllSubmitted={handleMarkAllSubmitted}
              onUndo={handleUndo}
              canUndo={Boolean(previousStates)}
            />

            {/* Quick Summary Pill Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-semibold overflow-x-auto gap-2">
              <div className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                <span>✓ Submitted:</span>
                <span className="font-extrabold">{submittedCount}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg shrink-0">
                <span>△ Incomplete:</span>
                <span className="font-extrabold">{incompleteCount}</span>
              </div>

              <div className="flex items-center gap-1 text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg shrink-0">
                <span>✗ Missing:</span>
                <span className="font-extrabold">{missingCount}</span>
              </div>

              <div className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                <span>A Absent:</span>
                <span className="font-extrabold">{absentCount}</span>
              </div>

              {flaggedCount > 0 && (
                <div className="flex items-center gap-1 text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg shrink-0">
                  <span>🚩 Flags:</span>
                  <span className="font-extrabold">{flaggedCount}</span>
                </div>
              )}
            </div>

            {/* Student Roster List */}
            <div className="space-y-2.5">
              {data.students.map((item) => (
                <StudentRowCard
                  key={item.student.id}
                  item={item}
                  onStatusChange={handleStatusChange}
                  onOpenFlagSheet={handleOpenFlag}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-3 px-4 safe-bottom z-30 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-medium">Class Status</div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
              {isClassFullyLogged ? (
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> All Students Logged
                </span>
              ) : (
                <span>
                  {submittedCount}/{totalStudents} submitted •{' '}
                  <span className="text-amber-600">{pendingCount} pending</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/classes/${classId}/reports`}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs"
            >
              Reports
            </Link>

            <Link
              href="/attention-queue"
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-md shadow-slate-900/15 hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Attention Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Flag / Action Bottom Sheet */}
      <EscalationBottomSheet
        isOpen={isSheetOpen}
        student={selectedStudentForFlag?.student || null}
        classNameTitle={data.classInfo.name}
        existingObservation={selectedStudentForFlag?.existingObservation}
        allObservations={
          selectedStudentForFlag?.allObservations ||
          (selectedStudentForFlag?.existingObservation ? [selectedStudentForFlag.existingObservation] : [])
        }
        handwritingProfile={selectedStudentForFlag?.handwritingProfile}
        onClose={() => setIsSheetOpen(false)}
        onSave={handleSaveObservation}
      />

      {/* Roster Manager Modal (Direct In-Class Student Management) */}
      <ClassRosterManagerModal
        isOpen={isRosterModalOpen}
        classInfo={data.classInfo}
        currentStudents={data.students.map((s) => s.student)}
        onClose={() => setIsRosterModalOpen(false)}
        onAddStudents={handleAddStudents}
        onUpdateStudent={handleUpdateStudent}
        onRemoveStudent={handleRemoveStudent}
      />
    </div>
  );
};
