'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  PhoneCall,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Flag,
  FileText,
  Filter,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';
import { ClassFlowService } from '@/lib/supabase/service';
import { AttentionQueueItem, ClassItem, SchoolProfile } from '@/types/database';
import { SchoolLogoBadge } from '@/components/common/SchoolLogoBadge';
import { DEFAULT_SCHOOL_PROFILE } from '@/lib/supabase/mock-data';

export default function AttentionQueuePage() {
  const [items, setItems] = useState<AttentionQueueItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'red' | 'amber'>('all');
  const [loading, setLoading] = useState(true);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [qItems, cls, profile] = await Promise.all([
          ClassFlowService.getAttentionQueue(),
          ClassFlowService.getAllClasses(),
          ClassFlowService.getSchoolProfile(),
        ]);
        setItems(qItems);
        setClasses(cls);
        setSchoolProfile(profile);
      } catch (err) {
        console.error('Failed to load attention queue', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleResolve = async (classId: string, studentId: string) => {
    setResolvedIds((prev) => [...prev, studentId]);
    showToast('Intervention marked as Resolved! 🎉');
    await ClassFlowService.resolveObservation(classId, studentId);
  };

  const filteredItems = items.filter((item) => {
    if (resolvedIds.includes(item.student.id)) return false;
    if (selectedClassId !== 'all' && item.classInfo.id !== selectedClassId) return false;
    if (selectedFilter === 'red' && item.urgencyLevel !== 'HIGH_PRIORITY_RED') return false;
    if (selectedFilter === 'amber' && item.urgencyLevel !== 'MEDIUM_PRIORITY_AMBER') return false;
    return true;
  });

  const redCount = items.filter(
    (i) => !resolvedIds.includes(i.student.id) && i.urgencyLevel === 'HIGH_PRIORITY_RED'
  ).length;

  const amberCount = items.filter(
    (i) => !resolvedIds.includes(i.student.id) && i.urgencyLevel === 'MEDIUM_PRIORITY_AMBER'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <SchoolLogoBadge profile={schoolProfile} size="sm" />
            <div>
              <h1 className="font-extrabold text-base text-slate-900 tracking-tight flex items-center gap-2">
                <span>Attention Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                  {filteredItems.length} Pending
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                {schoolProfile.school_name} • Parent Triage
              </p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="max-w-2xl mx-auto px-4 pb-3 pt-1 flex items-center gap-2 overflow-x-auto">
          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.subject})
              </option>
            ))}
          </select>

          {/* Urgency Chips */}
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All ({redCount + amberCount})
          </button>

          <button
            onClick={() => setSelectedFilter('red')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              selectedFilter === 'red'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <span>🔴 Urgent Red</span>
            <span>({redCount})</span>
          </button>

          <button
            onClick={() => setSelectedFilter('amber')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              selectedFilter === 'amber'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <span>🟡 Amber</span>
            <span>({amberCount})</span>
          </button>
        </div>
      </header>

      {/* Main List */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3.5">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold">
            Analyzing student records & calculating priorities...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="font-extrabold text-base text-slate-900">All Clear! No Pending Interventions</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Every student is on track or scheduled actions have been completed for today.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isRed = item.urgencyLevel === 'HIGH_PRIORITY_RED';
            const rawPhone = item.student.primary_contact.replace(/[^0-9]/g, '');
            const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const dossierUrl = origin ? `\nAcademic Dossier: ${origin}/students/${item.student.id}/ptm?classId=${item.classInfo.id}` : '';
            const waMessage = encodeURIComponent(
              `Namaste, this is an update regarding ${item.student.first_name} ${item.student.last_name} (${item.classInfo.name} - ${item.classInfo.subject}).\n${item.activeObservation?.teacher_note || 'Please check school homework tonight.'}${dossierUrl}\n- Mrs. Sunita Sharma, Delhi Public Model School`
            );

            return (
              <div
                key={`${item.classInfo.id}-${item.student.id}`}
                className={`p-4 rounded-2xl border transition-all bg-white shadow-xs ${
                  isRed ? 'border-rose-300 ring-1 ring-rose-200/50' : 'border-amber-300 ring-1 ring-amber-200/50'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xs border shadow-xs ${
                        isRed
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-tighter opacity-60">Roll</span>
                      <span className="text-sm leading-none font-extrabold">
                        #{item.student.roll_number.toString().padStart(2, '0')}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {item.student.first_name} {item.student.last_name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isRed ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {isRed ? '🔴 Urgent Intervention' : '🟡 Monitor'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {item.classInfo.name} • {item.classInfo.subject}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleResolve(item.classInfo.id, item.student.id)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex items-center gap-1 text-[11px] font-bold shrink-0 cursor-pointer"
                    title="Mark Resolved"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                </div>

                {/* Reason & Notes Box */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-700 font-bold">
                    <span>Action Needed:</span>
                    <span className="text-indigo-700 font-extrabold">{item.suggestedAction}</span>
                  </div>

                  {item.recentMissingCount > 0 && (
                    <div className="text-rose-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{item.recentMissingCount} consecutive missing / incomplete homeworks</span>
                    </div>
                  )}

                  {item.activeObservation?.teacher_note && (
                    <p className="text-slate-600 text-[11px] italic">
                      &quot;{item.activeObservation.teacher_note}&quot;
                    </p>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-[11px] text-slate-500">
                    Parent: <span className="font-bold text-slate-700">{item.student.primary_contact}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-slate-800 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-emerald-700 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <Link
                      href={`/students/${item.student.id}/ptm?classId=${item.classInfo.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 hover:bg-slate-50 transition-colors"
                      title="Open 1-Page Printable PTM Sheet"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PTM Sheet</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
