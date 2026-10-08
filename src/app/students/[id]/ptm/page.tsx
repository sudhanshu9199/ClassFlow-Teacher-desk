'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  Share2,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  BookOpen,
  Phone,
  MessageCircle,
  Clock,
  Sparkles,
  Download,
  PenTool,
} from 'lucide-react';
import { ClassFlowService } from '@/lib/supabase/service';
import { StudentPtmReport } from '@/types/database';
import { SchoolLogoBadge } from '@/components/common/SchoolLogoBadge';
import { DEFAULT_SCHOOL_PROFILE } from '@/lib/supabase/mock-data';

export default function StudentPtmDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const searchParams = useSearchParams();
  const classIdParam = searchParams.get('classId') || undefined;

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [report, setReport] = useState<StudentPtmReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await ClassFlowService.getStudentPtmReport(studentId, classIdParam, timeframe);
        setReport(data);
      } catch (err) {
        console.error('Failed to load student PTM report', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [studentId, classIdParam, timeframe]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!report) return;
    const phone = report.student.primary_contact.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Official Progress Report for ${report.student.first_name} ${report.student.last_name} (${report.classInfo.name}). Homework Completion: ${report.stats.completionPct}%. Test Score: 74%. - Delhi Public Model School Primary Wing.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Generating Official 1-Page PTM Dossier...</p>
        </div>
      </div>
    );
  }

  const { student, classInfo, stats, assessments, observations } = report;
  const schoolProfile = report.schoolProfile || DEFAULT_SCHOOL_PROFILE;

  return (
    <div className="min-h-screen bg-slate-100/80 pb-20 print:p-0 print:bg-white print:m-0">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 print:hidden animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Action Nav Bar (Hidden during Print) */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs print:hidden safe-top">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href={`/classes/${classInfo.id}/daily`}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Daily Grid</span>
          </Link>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  timeframe === tf ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md shadow-slate-900/15 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print 1-Page A4</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main 1-Page Printable Dossier Container */}
      <main className="max-w-3xl mx-auto px-4 pt-6 print:p-0 print:m-0 print:max-w-none">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/90 print:border-none print:shadow-none print:p-6 print:rounded-none">
          {/* Institutional Letterhead with Dynamic Insignia */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <SchoolLogoBadge profile={schoolProfile} size="lg" />
              <div>
                <h1 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight leading-tight uppercase">
                  {schoolProfile.school_name}
                </h1>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Primary Wing (Classes 1 to 6) •{' '}
                  {schoolProfile.affiliation_known
                    ? `${schoolProfile.board_affiliation || 'CBSE'} Affiliation No: ${schoolProfile.affiliation_number}`
                    : 'Affiliation: Primary Education Directorate'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {schoolProfile.institutional_area}, {schoolProfile.campus_locality}, {schoolProfile.city} • Official Student PTM Dossier
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono font-extrabold text-xs border border-slate-200">
                AY 2026–2027
              </span>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                Generated {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Student Profile Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Student Name
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                {student.first_name} {student.last_name}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Roll & Admission
              </span>
              <span className="font-bold text-slate-800">
                Roll #{student.roll_number.toString().padStart(2, '0')} • {student.admission_number || 'ADM-2026'}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Class & Section
              </span>
              <span className="font-bold text-slate-800">
                {classInfo.name} ({classInfo.subject})
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Parent Contact
              </span>
              <span className="font-mono font-bold text-slate-800">
                {student.primary_contact}
                {student.father_name && <span className="block text-[10px] text-slate-500 font-sans font-medium">F: {student.father_name}</span>}
              </span>
            </div>
          </div>

          {/* Core Metrics: Homework Completion & Assessments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* Homework Stats */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider text-slate-700">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Homework Completion ({timeframe})</span>
                </div>
                <span className="text-base font-black font-mono text-emerald-700">
                  {stats.completionPct}%
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                  <div className="font-extrabold text-emerald-800">{stats.submitted}</div>
                  <div className="text-[9px] uppercase text-emerald-700 font-medium">Done</div>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                  <div className="font-extrabold text-amber-800">{stats.incomplete}</div>
                  <div className="text-[9px] uppercase text-amber-700 font-medium">Partial</div>
                </div>
                <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
                  <div className="font-extrabold text-rose-800">{stats.missing}</div>
                  <div className="text-[9px] uppercase text-rose-700 font-medium">Missed</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <div className="font-extrabold text-slate-800">{stats.totalAssignments}</div>
                  <div className="text-[9px] uppercase text-slate-600 font-medium">Total</div>
                </div>
              </div>
            </div>

            {/* Assessment Performance */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider text-slate-700">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Periodic Assessment Scores</span>
                </div>
                <span className="text-base font-black font-mono text-indigo-700">
                  {assessments[0]?.percentage || 74}% Avg
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                {assessments.map((test, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                      {test.title}
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {test.marksObtained}/{test.maxMarks} ({test.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2026 Handwriting & Notebook Presentation Assessment */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider text-slate-800">
                <PenTool className="w-4 h-4 text-indigo-600" />
                <span>Handwriting & Notebook Presentation Assessment</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200 capitalize">
                {report.handwriting?.overall_grade === 'needs_practice'
                  ? '✍️ Practice Required'
                  : report.handwriting?.overall_grade === 'improving'
                  ? '📈 Improvement Trend'
                  : report.handwriting?.overall_grade === 'neat'
                  ? '✨ Neat & Clear'
                  : report.handwriting?.overall_grade === 'excellent'
                  ? '⭐ Exemplary Penmanship'
                  : 'Developing Discipline'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-2">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">4-Line Baseline Alignment</span>
                <span className="font-extrabold text-slate-800 capitalize">
                  {report.handwriting?.alignment_grade === 'needs_practice' ? '⚠️ Needs 4-Line Guide' : '✓ Good Line Discipline'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Letter Formation & Cursive</span>
                <span className="font-extrabold text-slate-800 capitalize">
                  {report.handwriting?.letter_formation_grade || 'Clear & Legible'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Neatness & Erasures</span>
                <span className="font-extrabold text-slate-800 capitalize">
                  {report.handwriting?.neatness_grade === 'needs_practice' ? '⚠️ Frequent Rubbing' : '✓ Clean & Neat Pages'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Margin & Date Format</span>
                <span className="font-extrabold text-slate-800 capitalize">
                  {report.handwriting?.formatting_grade || '✓ Regular Margin & Index'}
                </span>
              </div>
            </div>

            {report.handwriting?.notes && (
              <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 mt-2 font-medium">
                <span className="font-bold text-indigo-950">Teacher Note on Penmanship:</span> &quot;{report.handwriting.notes}&quot;
              </p>
            )}
          </div>

          {/* Chronological Teacher Observations Across Dates & Clear Points */}
          <div className="border border-slate-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Chronological Teacher Remarks & Action Points ({observations.length} on record)</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Multi-Date Timeline
              </span>
            </div>

            {observations.length === 0 ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-medium">
                ✓ Student is fully on track. No active behavioral or academic flags recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {observations.map((obs, idx) => (
                  <div
                    key={obs.id || idx}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                      obs.severity === 'red'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                          📅 {obs.date || 'Recent Entry'}
                        </span>
                        <span className="font-extrabold uppercase text-[10px] tracking-wider">
                          {obs.severity === 'red' ? '🔴 High Priority' : '🟡 Amber Warning'}
                        </span>
                        {obs.handwriting_tag && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                            ✍️ {obs.handwriting_tag}
                          </span>
                        )}
                      </div>
                      <span className="font-bold underline text-[11px]">
                        Action: {obs.action_type || obs.suggested_admin_action}
                      </span>
                    </div>

                    <p className="font-medium">
                      &quot;{obs.teacher_note}&quot;
                    </p>

                    {/* Clear Structured Points for Indian Parents & Student */}
                    {obs.structured_points && obs.structured_points.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200 space-y-1">
                        <div className="text-[10px] font-extrabold uppercase text-slate-700 tracking-wider">
                          Clear Points for Parents & Student:
                        </div>
                        <ol className="list-decimal list-inside space-y-0.5 text-slate-800 font-medium pl-1">
                          {obs.structured_points.map((point, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">
                              {point}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Action for Home Guidance */}
                    {obs.action_for_home && (
                      <div className="p-2 rounded-lg bg-amber-100/60 border border-amber-300 text-amber-950 text-[11px] font-medium flex items-center gap-1.5">
                        <span className="font-bold shrink-0">🏠 Home Follow-Up:</span>
                        <span>{obs.action_for_home}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3 Institutional Sign-off Blocks */}
          <div className="pt-6 border-t-2 border-dashed border-slate-300 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="h-10 border-b border-slate-400 mb-1" />
              <div className="text-xs font-extrabold text-slate-900">Mrs. Sunita Sharma</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Class Teacher</div>
            </div>

            <div>
              <div className="h-10 border-b border-slate-400 mb-1" />
              <div className="text-xs font-extrabold text-slate-900">Mr. Rajesh Gupta</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Primary Section Coordinator</div>
            </div>

            <div>
              <div className="h-10 border-b border-slate-400 mb-1" />
              <div className="text-xs font-extrabold text-slate-900">Parent / Guardian Signature</div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Date & Acknowledgment</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
