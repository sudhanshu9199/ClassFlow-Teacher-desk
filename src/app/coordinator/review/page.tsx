'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  Printer,
  ChevronLeft,
  Filter,
  Stamp,
  UserCheck,
  Calendar,
  Layers,
  FileText,
  Search,
} from 'lucide-react';
import { ClassFlowService } from '@/lib/supabase/service';
import { AttentionQueueItem, ClassItem } from '@/types/database';

export default function CoordinatorReviewPage() {
  const [queueItems, setQueueItems] = useState<AttentionQueueItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'red' | 'amber'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Administrative action tracking
  const [stampedNotes, setStampedNotes] = useState<Record<string, boolean>>({});
  const [remedialAllocated, setRemedialAllocated] = useState<Record<string, boolean>>({});
  const [approvedItems, setApprovedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const [items, clsList] = await Promise.all([
        ClassFlowService.getAttentionQueue(),
        ClassFlowService.getAllClasses(),
      ]);
      setQueueItems(items);
      setClasses(clsList);
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // Stamp Diary Note Action
  const handleIssueDiaryStamp = (studentId: string, studentName: string) => {
    setStampedNotes((prev) => ({ ...prev, [studentId]: true }));
    showToast(`Official School Diary Stamp issued for ${studentName}!`);
  };

  // Allocate Remedial Batch Action
  const handleAllocateRemedial = (studentId: string, studentName: string) => {
    setRemedialAllocated((prev) => ({ ...prev, [studentId]: true }));
    showToast(`Allocated ${studentName} to 3:15 PM Primary Remedial Batch.`);
  };

  // Approve and Resolve Escalation
  const handleApproveIntervention = async (item: AttentionQueueItem) => {
    await ClassFlowService.resolveObservation(item.classInfo.id, item.student.id);
    setApprovedItems((prev) => ({ ...prev, [item.student.id]: true }));
    showToast(`Intervention approved and closed for ${item.student.first_name} ${item.student.last_name}`);
    setTimeout(() => {
      setQueueItems((prev) => prev.filter((q) => q.student.id !== item.student.id));
    }, 400);
  };

  // WhatsApp Link for Coordinator
  const getCoordinatorWhatsAppLink = (item: AttentionQueueItem) => {
    const rawPhone = item.student.primary_contact.replace(/[^0-9]/g, '');
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const msg =
      `*Official Communication — Delhi Public Model School (Primary Wing)*\n\n` +
      `Dear Parent / Guardian of *${item.student.first_name} ${item.student.last_name}* (Roll #${item.student.roll_number}, ${item.classInfo.name}),\n\n` +
      `This is *Mr. Rajesh Gupta*, Primary Section Academic Coordinator.\n\n` +
      `Class teacher *Mrs. Sunita Sharma* has submitted today's wrap-up report highlighting homework non-submission and concept difficulty in ${item.classInfo.subject}.\n\n` +
      `📌 *Coordinator Recommendation:* ${item.suggestedAction}\n` +
      `📝 *Teacher Observation:* "${item.activeObservation?.teacher_note || 'Multiple assignments missing.'}"\n\n` +
      `Please ensure notebooks are completed. You may also view the complete 1-page Academic Dossier at: ${typeof window !== 'undefined' ? window.location.origin : ''}/students/${item.student.id}/ptm?classId=${item.classInfo.id}\n\n` +
      `Regards,\n*Office of Primary Academic Coordinator*\nDelhi Public Model School`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  };

  // Filtered Items
  const filteredItems = queueItems.filter((item) => {
    // Class filter
    if (selectedClassFilter !== 'all' && item.classInfo.id !== selectedClassFilter) {
      return false;
    }
    // Severity filter
    if (severityFilter === 'red' && item.urgencyLevel !== 'HIGH_PRIORITY_RED') return false;
    if (severityFilter === 'amber' && item.urgencyLevel !== 'MEDIUM_PRIORITY_AMBER') return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fullName = `${item.student.first_name} ${item.student.last_name}`.toLowerCase();
      const roll = item.student.roll_number.toString();
      const clsName = item.classInfo.name.toLowerCase();
      return fullName.includes(q) || roll.includes(q) || clsName.includes(q);
    }
    return true;
  });

  const redCount = queueItems.filter((i) => i.urgencyLevel === 'HIGH_PRIORITY_RED').length;
  const amberCount = queueItems.filter((i) => i.urgencyLevel === 'MEDIUM_PRIORITY_AMBER').length;

  return (
    <div className="min-h-screen bg-slate-100/80 pb-20 print:bg-white print:p-0">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Coordinator Top Navigation Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 safe-top sticky top-0 z-20 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Return to Teacher Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  <span>Coordinator Review Desk</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Primary Wing
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400">
                Mr. Rajesh Gupta • Delhi Public Model School (Classes 1–6)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Summary</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        {/* Printable Letterhead (Only visible during print) */}
        <div className="hidden print:block text-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">
            Delhi Public Model School
          </h2>
          <p className="text-xs text-slate-600">
            Primary Section Academic Coordinator Desk — End-of-Day Escalation Ledger
          </p>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
            <span>Coordinator: Mr. Rajesh Gupta</span>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Queue</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {queueItems.length}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Cross-class submissions</p>
          </div>

          <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200/80 shadow-xs">
            <div className="flex items-center justify-between text-rose-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Red Alerts</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-950">
              {redCount}
            </div>
            <p className="text-[10px] text-rose-700/80 mt-0.5">Urgent parent outreach</p>
          </div>

          <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 shadow-xs">
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Amber Warnings</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-950">
              {amberCount}
            </div>
            <p className="text-[10px] text-amber-700/80 mt-0.5">Remedial monitoring</p>
          </div>

          <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-200/80 shadow-xs">
            <div className="flex items-center justify-between text-indigo-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">3:15 PM Remedial</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-indigo-950">
              {Object.keys(remedialAllocated).length}
            </div>
            <p className="text-[10px] text-indigo-700/80 mt-0.5">Allocated seats today</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                severityFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Priorities ({queueItems.length})
            </button>
            <button
              onClick={() => setSeverityFilter('red')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                severityFilter === 'red'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              🔴 Red Alerts ({redCount})
            </button>
            <button
              onClick={() => setSeverityFilter('amber')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                severityFilter === 'amber'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              🟡 Amber ({amberCount})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Class Selector Dropdown */}
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs font-medium p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.subject})
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Triage Cards Feed */}
        <div className="space-y-3.5">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                All Escalations Resolved
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No active student intervention flags pending review for the selected filter.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isRed = item.urgencyLevel === 'HIGH_PRIORITY_RED';
              const isStamped = stampedNotes[item.student.id];
              const isRemedial = remedialAllocated[item.student.id];
              const isApproved = approvedItems[item.student.id];

              return (
                <div
                  key={item.student.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl border p-4 sm:p-5 shadow-xs transition-all ${
                    isRed
                      ? 'border-rose-200/90 hover:border-rose-300'
                      : 'border-amber-200/90 hover:border-amber-300'
                  }`}
                >
                  {/* Top Row: Student Roll, Name, Severity Badge & Class */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xs shrink-0 border ${
                          isRed
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <span className="text-[8px] uppercase tracking-tighter opacity-70">
                          Roll
                        </span>
                        <span>#{item.student.roll_number.toString().padStart(2, '0')}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                            {item.student.first_name} {item.student.last_name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isRed
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isRed ? '🔴 High Priority Red' : '🟡 Amber Warning'}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-700">
                            {item.classInfo.name} ({item.classInfo.subject})
                          </span>
                          <span>•</span>
                          <span>Contact: {item.student.primary_contact}</span>
                          {item.student.father_name && (
                            <>
                              <span>•</span>
                              <span>Father: {item.student.father_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/students/${item.student.id}/ptm?classId=${item.classInfo.id}`}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                      title="Inspect student's official 1-page A4 PTM dossier"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">PTM Dossier</span>
                    </Link>
                  </div>

                  {/* Middle Row: Observation Details & Teacher Request */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-bold text-slate-700">
                        Teacher Flagged Action:
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-indigo-700 text-[11px]">
                        {item.suggestedAction}
                      </span>
                    </div>

                    <p className="text-slate-700 italic">
                      &quot;{item.activeObservation?.teacher_note ||
                        `Recorded ${item.recentMissingCount} consecutive missing assignments.`}&quot;
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                      <span>Recent Missing HW Count: <strong className="text-slate-700">{item.recentMissingCount}</strong></span>
                      <span>•</span>
                      <span>Submitted by: Mrs. Sunita Sharma</span>
                    </div>
                  </div>

                  {/* Institutional Action Status Tags */}
                  {(isStamped || isRemedial) && (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      {isStamped && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 border border-emerald-300">
                          <Stamp className="w-3 h-3" />
                          <span>Official Diary Stamp Granted</span>
                        </span>
                      )}
                      {isRemedial && (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 text-[11px] font-bold flex items-center gap-1 border border-indigo-300">
                          <Clock className="w-3 h-3" />
                          <span>3:15 PM Remedial Confirmed</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Row: Coordinator Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Direct Phone Call */}
                      <a
                        href={`tel:${item.student.primary_contact.replace(/[^0-9]/g, '')}`}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                        <span>Call Guardian</span>
                      </a>

                      {/* Official Coordinator WhatsApp */}
                      <a
                        href={getCoordinatorWhatsAppLink(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Coordinator WhatsApp</span>
                      </a>

                      {/* Issue Diary Stamp */}
                      <button
                        type="button"
                        onClick={() => handleIssueDiaryStamp(item.student.id, item.student.first_name)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isStamped
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <Stamp className="w-3.5 h-3.5" />
                        <span>{isStamped ? 'Stamp Issued' : 'Stamp Diary'}</span>
                      </button>

                      {/* Allocate Remedial Batch */}
                      <button
                        type="button"
                        onClick={() => handleAllocateRemedial(item.student.id, item.student.first_name)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isRemedial
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isRemedial ? 'Remedial Set' : '3:15 PM Remedial'}</span>
                      </button>
                    </div>

                    {/* Approve & Resolve */}
                    <button
                      type="button"
                      onClick={() => handleApproveIntervention(item)}
                      disabled={isApproved}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ml-auto"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isApproved ? 'Approved' : 'Approve & Clear'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
