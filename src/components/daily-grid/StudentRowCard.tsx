'use client';

import React from 'react';
import Link from 'next/link';
import { DailyGridStudentItem, SubmissionStatus } from '@/types/database';
import { StatusCyclePill } from './StatusCyclePill';
import { Flag, AlertCircle, Plus, FileText } from 'lucide-react';

interface StudentRowCardProps {
  item: DailyGridStudentItem;
  onStatusChange: (studentId: string, nextStatus: SubmissionStatus) => void;
  onOpenFlagSheet: (student: DailyGridStudentItem) => void;
}

export const StudentRowCard: React.FC<StudentRowCardProps> = ({
  item,
  onStatusChange,
  onOpenFlagSheet,
}) => {
  const { student, submissionStatus, existingObservation, recentMissingCount } = item;

  const hasActiveFlag = Boolean(existingObservation);
  const flagSeverity = existingObservation?.severity;

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
        hasActiveFlag && flagSeverity === 'red'
          ? 'bg-rose-50/40 border-rose-200/80 shadow-xs'
          : hasActiveFlag && flagSeverity === 'amber'
          ? 'bg-amber-50/40 border-amber-200/80 shadow-xs'
          : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Roll Number + Student Details */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Monospace Roll Number Badge */}
          <div
            className={`w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xs border shadow-xs select-none ${
              hasActiveFlag && flagSeverity === 'red'
                ? 'bg-rose-100/80 text-rose-900 border-rose-300'
                : hasActiveFlag && flagSeverity === 'amber'
                ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <span className="text-[9px] uppercase tracking-tighter opacity-60">Roll</span>
            <span className="text-sm leading-none font-extrabold">
              #{student.roll_number.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                {student.first_name} {student.last_name}
              </h4>

              {/* Urgency badges */}
              {recentMissingCount >= 2 && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <AlertCircle className="w-2.5 h-2.5" />
                  {recentMissingCount} Missed
                </span>
              )}

              {/* Handwriting Evaluation Badge */}
              {item.handwritingProfile && (
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    item.handwritingProfile.overall_grade === 'needs_practice'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : item.handwritingProfile.overall_grade === 'improving'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  }`}
                  title={item.handwritingProfile.notes || 'Handwriting profile assessment'}
                >
                  {item.handwritingProfile.overall_grade === 'needs_practice' && '✍️ Penmanship'}
                  {item.handwritingProfile.overall_grade === 'improving' && '📈 Improving HW'}
                  {(item.handwritingProfile.overall_grade === 'neat' || item.handwritingProfile.overall_grade === 'excellent') && '✨ Neat Penmanship'}
                  {item.handwritingProfile.overall_grade === 'developing' && '📝 Developing'}
                </span>
              )}

              {/* Multi-date Historical Remarks Badge */}
              {item.allObservations && item.allObservations.length > 1 && (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-300"
                  title={`${item.allObservations.length} remarks recorded across different dates`}
                >
                  📅 {item.allObservations.length} Dates Logged
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
              <span>{student.admission_number}</span>
              {student.father_name && (
                <>
                  <span>•</span>
                  <span>Father: {student.father_name}</span>
                </>
              )}
              {item.lastScoreRemarks && (
                <>
                  <span>•</span>
                  <span className="truncate max-w-[140px] sm:max-w-[220px] text-slate-600">
                    {item.lastScoreRemarks}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Status Pill & Flag Launcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Pill (48px Touch Target) */}
          <StatusCyclePill
            status={submissionStatus}
            rollNumber={student.roll_number}
            onChange={(next) => onStatusChange(student.id, next)}
          />

          {/* Quick Flag Button */}
          {hasActiveFlag ? (
            <button
              type="button"
              onClick={() => onOpenFlagSheet(item)}
              aria-label={`View flag for ${student.first_name}`}
              className={`touch-target-48 tap-tactile px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                flagSeverity === 'red'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-rose-900/20'
                  : 'bg-amber-500 text-white border-amber-600 shadow-amber-900/20'
              }`}
              title={existingObservation?.teacher_note}
            >
              <Flag className="w-3.5 h-3.5 fill-white stroke-none" />
              <span className="hidden sm:inline">
                {flagSeverity === 'red' ? 'Red Flag' : 'Amber Flag'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenFlagSheet(item)}
              aria-label={`Flag ${student.first_name} for coordinator escalation`}
              className="touch-target-48 tap-tactile px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer flex items-center gap-1"
              title="Escalate to Coordinator"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Flag</span>
            </button>
          )}

          {/* PTM Report Link Button */}
          <Link
            href={`/students/${student.id}/ptm`}
            className="touch-target-48 tap-tactile p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 cursor-pointer flex items-center justify-center transition-colors"
            title={`View 1-Page PTM Dossier for ${student.first_name}`}
          >
            <FileText className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Flag Note Snippet (if active) */}
      {hasActiveFlag && existingObservation && (
        <div
          onClick={() => onOpenFlagSheet(item)}
          className={`mt-2.5 pt-2 border-t text-[11px] sm:text-xs flex items-center justify-between cursor-pointer ${
            flagSeverity === 'red'
              ? 'border-rose-200/80 text-rose-900'
              : 'border-amber-200/80 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {existingObservation.date && (
              <span className="font-mono text-[10px] font-bold px-1 py-0.2 rounded bg-black/5 shrink-0">
                {existingObservation.date.slice(5)}
              </span>
            )}
            <span className="font-bold uppercase tracking-wider text-[10px]">
              Action:
            </span>
            <span className="font-medium underline decoration-dotted">
              {existingObservation.action_type || existingObservation.suggested_admin_action || 'Action Plan'}
            </span>
            <span className="text-slate-600 truncate max-w-[200px]">
              — &quot;{existingObservation.teacher_note}&quot;
            </span>
            {existingObservation.structured_points && existingObservation.structured_points.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 shrink-0">
                {existingObservation.structured_points.length} Pts
              </span>
            )}
          </div>
          <span className="text-[10px] opacity-70 underline shrink-0 ml-2">Edit</span>
        </div>
      )}
    </div>
  );
};
