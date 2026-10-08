'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Share2,
  Download,
  Calendar,
  User,
  Users,
  CheckCircle,
  FileSpreadsheet,
  FileText,
  Building2,
  Sparkles,
  PenTool,
} from 'lucide-react';
import { ClassFlowService } from '@/lib/supabase/service';
import {
  DailyClassData,
  StudentPtmReport,
  ClassConsolidatedRow,
} from '@/types/database';
import { SchoolLogoBadge } from '@/components/common/SchoolLogoBadge';
import { DEFAULT_SCHOOL_PROFILE } from '@/lib/supabase/mock-data';

export default function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.id;

  const [activeTab, setActiveTab] = useState<'individual' | 'class_ledger'>('individual');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [classData, setClassData] = useState<DailyClassData | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [ptmReport, setPtmReport] = useState<StudentPtmReport | null>(null);
  const [ledgerRows, setLedgerRows] = useState<ClassConsolidatedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await ClassFlowService.getDailyClassData(classId);
        setClassData(data);
        if (data.students.length > 0) {
          const firstId = data.students[0].student.id;
          setSelectedStudentId(firstId);
          const [indiv, ledger] = await Promise.all([
            ClassFlowService.getStudentPtmReport(firstId, classId, timeframe),
            ClassFlowService.getClassConsolidatedReport(classId),
          ]);
          setPtmReport(indiv);
          setLedgerRows(ledger);
        }
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classId]);

  const handleStudentChange = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setLoading(true);
    const indiv = await ClassFlowService.getStudentPtmReport(studentId, classId, timeframe);
    setPtmReport(indiv);
    setLoading(false);
  };

  const handleTimeframeChange = async (tf: 'daily' | 'weekly' | 'monthly') => {
    setTimeframe(tf);
    if (selectedStudentId) {
      setLoading(true);
      const indiv = await ClassFlowService.getStudentPtmReport(selectedStudentId, classId, tf);
      setPtmReport(indiv);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `ClassFlow Report: ${classData?.classInfo.name}`,
          text: `Official progress report for ${classData?.classInfo.name} (${classData?.classInfo.subject}).`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      alert('Link copied to clipboard for WhatsApp/Email sharing!');
    }
  };

  const exportCsv = () => {
    if (!ledgerRows.length) return;
    const headers = ['Roll No', 'Name', 'Phone', 'HW Assigned', 'HW Submitted', 'HW %', 'Test Avg %', 'Handwriting', 'Status'];
    const rows = ledgerRows.map((r) => [
      r.rollNumber,
      `"${r.studentName}"`,
      `"${r.primaryContact}"`,
      r.totalHw,
      r.hwSubmitted,
      `${r.hwCompletionPct}%`,
      `${r.avgTestPct}%`,
      `"${r.handwritingGrade || 'Neat'}"`,
      r.interventionStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${classData?.classInfo.name}_Consolidated_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!classData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-sm font-semibold text-slate-500">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      {/* Top Navbar (Hidden when printing) */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 safe-top print:hidden">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/classes/${classId}/daily`}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
                <span>Reports & Exports</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                  {classData.classInfo.name}
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">{classData.classInfo.subject} • Academic Year 2026-2027</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs"
              title="Print 1-Page PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Tab & Timeframe Navigation */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex items-center justify-between gap-3 overflow-x-auto">
          {/* Format Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'individual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Student PTM Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('class_ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'class_ledger'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Class-Wide Ledger</span>
            </button>
          </div>

          {/* Timeframe Chips */}
          <div className="flex items-center gap-1.5 shrink-0">
            {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                  timeframe === tf
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-5">
        {activeTab === 'individual' ? (
          <div className="space-y-4">
            {/* Student Picker (Hidden when printing) */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 print:hidden">
              <span className="text-xs font-bold text-slate-700">Select Student:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                {classData.students.map((st) => (
                  <option key={st.student.id} value={st.student.id}>
                    Roll #{st.student.roll_number.toString().padStart(2, '0')} — {st.student.first_name}{' '}
                    {st.student.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Printable 1-Page PTM Dossier Sheet */}
            {ptmReport && (
              <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                {/* Official School Header with Dynamic Insignia */}
                <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <SchoolLogoBadge profile={ptmReport.schoolProfile || DEFAULT_SCHOOL_PROFILE} size="md" />
                    <div>
                      <div className="text-[10px] font-extrabold tracking-widest uppercase text-slate-500">
                        Official Student Performance & PTM Brief
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                        {ptmReport.schoolProfile?.school_name || classData.teacher.school_name || 'DELHI PUBLIC MODEL SCHOOL'}
                      </h2>
                      <p className="text-xs text-slate-600 font-medium">
                        {classData.classInfo.name} • {classData.classInfo.subject} • Academic Session 2026-2027
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {ptmReport.schoolProfile?.institutional_area || 'Institutional Area'}, {ptmReport.schoolProfile?.campus_locality || 'Model Town'}, {ptmReport.schoolProfile?.city || 'New Delhi'} •{' '}
                        {ptmReport.schoolProfile?.affiliation_known
                          ? `${ptmReport.schoolProfile?.board_affiliation || 'CBSE'} Affiliation No: ${ptmReport.schoolProfile?.affiliation_number}`
                          : 'State Primary Directorate'}
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

                {/* Student Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Student Name</span>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {ptmReport.student.first_name} {ptmReport.student.last_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Roll Number</span>
                    <div className="font-bold text-slate-900">
                      #{ptmReport.student.roll_number.toString().padStart(2, '0')}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Parent Contact</span>
                    <div className="font-bold text-slate-900">{ptmReport.student.primary_contact}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Report Period</span>
                    <div className="font-bold text-indigo-700 capitalize">{timeframe} Review</div>
                  </div>
                </div>

                {/* Section 1: Homework Consistency */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-3">
                    1. Homework & Daily Submission Consistency
                  </h3>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-lg font-black text-slate-900">
                        {ptmReport.stats.completionPct}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Completion Rate</div>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="text-lg font-black text-emerald-800">
                        {ptmReport.stats.submitted} / {ptmReport.stats.totalAssignments}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold uppercase">Submitted</div>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="text-lg font-black text-amber-800">
                        {ptmReport.stats.incomplete}
                      </div>
                      <div className="text-[10px] text-amber-700 font-semibold uppercase">Incomplete</div>
                    </div>
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                      <div className="text-lg font-black text-rose-800">
                        {ptmReport.stats.missing}
                      </div>
                      <div className="text-[10px] text-rose-700 font-semibold uppercase">Missing</div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Periodic Tests & Assessments */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 mb-3">
                    2. Periodic Assessments & Unit Tests
                  </h3>
                  <div className="space-y-2">
                    {ptmReport.assessments.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{a.title}</span>
                          <span className="text-[11px] text-slate-500 block">Date: {a.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900">
                            {a.marksObtained} / {a.maxMarks}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold block">
                            ({a.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Handwriting & Notebook Presentation Assessment */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                      <span>3. Handwriting & Notebook Presentation Assessment</span>
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 capitalize">
                      {ptmReport.handwriting?.overall_grade === 'needs_practice'
                        ? '✍️ Practice Required'
                        : ptmReport.handwriting?.overall_grade === 'improving'
                        ? '📈 Improvement Trend'
                        : ptmReport.handwriting?.overall_grade === 'neat' || ptmReport.handwriting?.overall_grade === 'excellent'
                        ? '✨ Neat & Clear'
                        : 'Developing Discipline'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">4-Line Baseline Alignment</span>
                      <span className="font-bold text-slate-800">
                        {ptmReport.handwriting?.alignment_grade === 'needs_practice' ? '⚠️ Alignment Drill' : '✓ Good Line Discipline'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Letter Formation & Cursive</span>
                      <span className="font-bold text-slate-800">
                        {ptmReport.handwriting?.letter_formation_grade || 'Clear & Legible'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Neatness & Erasures</span>
                      <span className="font-bold text-slate-800">
                        {ptmReport.handwriting?.neatness_grade === 'needs_practice' ? '⚠️ Frequent Erasures' : '✓ Clean & Neat'}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Margins & Date Format</span>
                      <span className="font-bold text-slate-800">
                        {ptmReport.handwriting?.formatting_grade || '✓ Regular Margin'}
                      </span>
                    </div>
                  </div>

                  {ptmReport.handwriting?.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2 font-medium">
                      <span className="font-bold text-slate-900">Penmanship Note:</span> &quot;{ptmReport.handwriting.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Section 4: Chronological Teacher Remarks & Action Points */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <span>4. Teacher Remarks Across Dates ({ptmReport.observations.length} on file)</span>
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Timeline Log
                    </span>
                  </div>

                  {ptmReport.observations.length > 0 ? (
                    <div className="space-y-2.5">
                      {ptmReport.observations.map((obs, i) => (
                        <div key={obs.id || i} className="p-3 bg-indigo-50/40 border border-indigo-200 rounded-xl text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                                📅 {obs.date || 'Recent Entry'}
                              </span>
                              <span className="font-extrabold text-indigo-950">
                                Action: {obs.action_type}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                obs.severity === 'red' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                              }`}
                            >
                              {obs.severity === 'red' ? 'High Priority' : 'Attention'}
                            </span>
                          </div>

                          <p className="text-slate-800 font-medium">&quot;{obs.teacher_note}&quot;</p>

                          {/* Clear Points for Parents */}
                          {obs.structured_points && obs.structured_points.length > 0 && (
                            <div className="p-2 rounded-lg bg-white/80 border border-slate-200 space-y-0.5">
                              <div className="text-[10px] font-extrabold uppercase text-slate-700 tracking-wider">
                                Clear Points for Parents & Student:
                              </div>
                              <ul className="space-y-0.5 text-slate-700 font-medium pl-1">
                                {obs.structured_points.map((pt, ptIdx) => (
                                  <li key={ptIdx}>• {pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {obs.action_for_home && (
                            <div className="p-2 rounded-lg bg-amber-100/70 border border-amber-300 text-amber-950 text-[11px] font-medium">
                              <span className="font-bold">🏠 Home Guidance:</span> {obs.action_for_home}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                      ✓ Student has shown consistent performance with no active behavioral or academic flags.
                    </div>
                  )}
                </div>

                {/* Signature Block */}
                <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="h-10 border-b border-slate-400 max-w-[180px] mx-auto" />
                    <span className="font-bold text-slate-800 block mt-1.5">Class / Subject Teacher</span>
                    <span className="text-[10px] text-slate-500">{classData.teacher.full_name}</span>
                  </div>

                  <div>
                    <div className="h-10 border-b border-slate-400 max-w-[180px] mx-auto" />
                    <span className="font-bold text-slate-800 block mt-1.5">Parent / Guardian Signature</span>
                    <span className="text-[10px] text-slate-500">Date: ____________________</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Class-Wide Consolidated Ledger */
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {classData.classInfo.name} — Full Class Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  {ledgerRows.length} Students • Sorted by Roll Number
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportCsv}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-slate-800"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Download Excel/CSV</span>
                </button>
              </div>
            </div>

            {/* Tabular Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">Roll</th>
                      <th className="py-3 px-3.5">Student Name</th>
                      <th className="py-3 px-3.5">Contact</th>
                      <th className="py-3 px-3.5 text-center">HW Status</th>
                      <th className="py-3 px-3.5 text-center">Test Avg</th>
                      <th className="py-3 px-3.5 text-center">Handwriting</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerRows.map((row) => (
                      <tr key={row.rollNumber} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                          #{row.rollNumber.toString().padStart(2, '0')}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          {row.studentName}
                        </td>
                        <td className="py-3 px-3.5 text-slate-500">{row.primaryContact}</td>
                        <td className="py-3 px-3.5 text-center font-bold">
                          <span
                            className={
                              row.hwCompletionPct >= 80 ? 'text-emerald-700' : 'text-rose-700'
                            }
                          >
                            {row.hwSubmitted}/{row.totalHw} ({row.hwCompletionPct}%)
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center font-bold text-slate-800">
                          {row.avgTestPct}%
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {row.handwritingGrade === 'needs_practice'
                              ? '✍️ Practice'
                              : row.handwritingGrade === 'improving'
                              ? '📈 Improving'
                              : row.handwritingGrade === 'neat' || row.handwritingGrade === 'excellent'
                              ? '✨ Neat'
                              : 'Developing'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.interventionStatus === 'High Attention'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : row.interventionStatus === 'Monitor'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {row.interventionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
