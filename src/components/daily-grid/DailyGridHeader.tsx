'use client';

import React from 'react';
import Link from 'next/link';
import { ClassItem, Assignment, Staff, SchoolProfile } from '@/types/database';
import { ArrowLeft, BookOpen, Calendar, Database, Sparkles, Users } from 'lucide-react';
import { SchoolLogoBadge } from '@/components/common/SchoolLogoBadge';

interface DailyGridHeaderProps {
  classInfo: ClassItem;
  assignment: Assignment;
  teacher: Staff;
  totalStudents: number;
  submittedCount: number;
  isLiveSupabase: boolean;
  schoolProfile?: SchoolProfile;
  onOpenRosterModal?: () => void;
}

export const DailyGridHeader: React.FC<DailyGridHeaderProps> = ({
  classInfo,
  assignment,
  teacher,
  totalStudents,
  submittedCount,
  isLiveSupabase,
  schoolProfile,
  onOpenRosterModal,
}) => {
  const completionPct =
    totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs safe-top">
      <div className="max-w-2xl mx-auto px-4 py-3">
        {/* Top line: Navigation, School Insignia, Mode badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="touch-target-48 tap-tactile -ml-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">My Classes</span>
            </Link>

            {schoolProfile && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                <SchoolLogoBadge profile={schoolProfile} size="sm" />
                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px] sm:max-w-[180px]">
                  {schoolProfile.school_name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenRosterModal && (
              <button
                type="button"
                onClick={onOpenRosterModal}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 shadow-xs"
                title="Add or edit students in this class"
              >
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Roster ({totalStudents})</span>
              </button>
            )}

            {isLiveSupabase ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Database className="w-3 h-3 text-emerald-600" />
                Live Supabase
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                title="Running with Seed Data Mock. Add SUPABASE_URL in .env.local to go live."
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Dual-Mode Seed Mock
              </span>
            )}
          </div>
        </div>

        {/* Main Title & Class Info */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {classInfo.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                {classInfo.subject}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {teacher.full_name}
              </span>
            </div>

            {/* Assignment & Date row */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600 flex-wrap">
              <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[240px] sm:max-w-[340px]">
                  {assignment.title}
                </span>
              </span>

              <span className="text-slate-300">•</span>

              <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Today (Dismissal Wrap-up)</span>
              </span>
            </div>
          </div>

          {/* Quick Progress Metric */}
          <div className="text-right shrink-0">
            <div className="text-base sm:text-lg font-black font-mono text-emerald-700 leading-none">
              {submittedCount}/{totalStudents}
            </div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              {completionPct}% Done
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>
    </header>
  );
};
