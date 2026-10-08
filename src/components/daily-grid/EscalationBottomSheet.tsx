'use client';

import React, { useState, useEffect } from 'react';
import {
  Student,
  ObservationCategory,
  ObservationSeverity,
  TeacherActionType,
  Observation,
} from '@/types/database';
import {
  X,
  AlertCircle,
  Flag,
  PhoneCall,
  MessageCircle,
  GraduationCap,
  BookOpen,
  UserCheck,
  CalendarDays,
  Sparkles,
  Check,
} from 'lucide-react';

interface EscalationBottomSheetProps {
  isOpen: boolean;
  student: Student | null;
  classNameTitle: string;
  existingObservation?: Observation;
  onClose: () => void;
  onSave: (payload: {
    studentId: string;
    category: ObservationCategory;
    severity: ObservationSeverity;
    actionType: TeacherActionType;
    teacherNote: string;
  }) => Promise<void>;
}

const CATEGORIES: { id: ObservationCategory; label: string; icon: string }[] = [
  { id: 'incomplete_work', label: 'Incomplete HW', icon: '📝' },
  { id: 'academic', label: 'Academic / Concept', icon: '📐' },
  { id: 'diary', label: 'School Diary', icon: '📖' },
  { id: 'behavioral', label: 'Behavioral', icon: '🤝' },
  { id: 'attendance', label: 'Attendance', icon: '📅' },
];

const TEACHER_ACTIONS: { id: TeacherActionType; label: string; desc: string; icon: any }[] = [
  {
    id: 'Call Parent',
    label: 'Call Parent / Guardian',
    desc: 'Direct phone conversation regarding homework or concept struggle',
    icon: PhoneCall,
  },
  {
    id: 'WhatsApp Message',
    label: 'Send Official WhatsApp Update',
    desc: 'Share pre-drafted progress update directly to parent WhatsApp',
    icon: MessageCircle,
  },
  {
    id: 'Assign Remedial Work',
    label: 'Assign Remedial Practice',
    desc: 'Give focused worksheet or practice questions for revision',
    icon: GraduationCap,
  },
  {
    id: 'School Diary Note',
    label: 'Write Note in School Diary',
    desc: 'Ask parent to inspect and sign school handbook / diary',
    icon: BookOpen,
  },
  {
    id: '1-on-1 Counseling',
    label: '1-on-1 Discussion with Student',
    desc: 'Understand personal difficulty or lack of attention in class',
    icon: UserCheck,
  },
  {
    id: 'Schedule PTM Slot',
    label: 'Schedule Parent Meeting (PTM)',
    desc: 'Reserve a formal 10-minute conference during next PTM',
    icon: CalendarDays,
  },
];

export const EscalationBottomSheet: React.FC<EscalationBottomSheetProps> = ({
  isOpen,
  student,
  classNameTitle,
  existingObservation,
  onClose,
  onSave,
}) => {
  const [category, setCategory] = useState<ObservationCategory>('incomplete_work');
  const [severity, setSeverity] = useState<ObservationSeverity>('amber');
  const [actionType, setActionType] = useState<TeacherActionType>('Call Parent');
  const [teacherNote, setTeacherNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingObservation) {
      setCategory(existingObservation.category);
      setSeverity(existingObservation.severity);
      setActionType(existingObservation.action_type || 'Call Parent');
      setTeacherNote(existingObservation.teacher_note);
    } else {
      setCategory('incomplete_work');
      setSeverity('amber');
      setActionType('Call Parent');
      setTeacherNote('');
    }
  }, [existingObservation, student]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNote.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        studentId: student.id,
        category,
        severity,
        actionType,
        teacherNote: teacherNote.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = () => {
    const raw = student.primary_contact.replace(/[^0-9]/g, '');
    const cleanPhone = raw.length === 10 ? `91${raw}` : raw;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const dossierUrl = origin ? `\nAcademic Dossier: ${origin}/students/${student.id}/ptm` : '';
    const message = encodeURIComponent(
      `Namaste, this is regarding ${student.first_name} ${student.last_name} (${classNameTitle}).\n${teacherNote || 'Please review homework and school notebook tonight.'}${dossierUrl}\n- Mrs. Sunita Sharma, Delhi Public Model School`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs ${
                severity === 'red'
                  ? 'bg-rose-600'
                  : 'bg-amber-500'
              }`}
            >
              <Flag className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  Roll #{student.roll_number} • {student.first_name} {student.last_name}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {classNameTitle}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Teacher Intervention & Action Plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          {/* Severity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Urgency Level
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSeverity('amber')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  severity === 'amber'
                    ? 'border-amber-400 bg-amber-50/80 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold">🟡 Amber Warning</div>
                  <div className="text-[10px] text-slate-500 font-normal">Minor concept struggle / 1 missed HW</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSeverity('red')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                  severity === 'red'
                    ? 'border-rose-400 bg-rose-50/80 text-rose-950 font-bold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-rose-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold">🔴 High Priority Red</div>
                  <div className="text-[10px] text-slate-500 font-normal">2+ missed tasks / severe struggle</div>
                </div>
              </button>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Issue Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                    category === cat.id
                      ? 'border-slate-800 bg-slate-900 text-white shadow-xs font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Action Plan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Action Plan to Execute
            </label>
            <div className="space-y-2">
              {TEACHER_ACTIONS.map((action) => {
                const IconComponent = action.icon;
                const isSelected = actionType === action.id;
                return (
                  <div
                    key={action.id}
                    onClick={() => setActionType(action.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {action.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher's Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Teacher Observation Note
            </label>
            <textarea
              required
              rows={3}
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="e.g. Needs help with 2-digit division. Did not submit notebook for past 2 days."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Quick Communication Shortcut if WhatsApp / Phone */}
          {student.primary_contact && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                  Parent Contact
                </span>
                <p className="text-xs font-bold text-emerald-950">{student.primary_contact}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${student.primary_contact.replace(/[^0-9]/g, '')}`}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-emerald-700"
                >
                  <PhoneCall className="w-3 h-3" />
                  Call
                </a>
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-200"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-700" />
                  WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !teacherNote.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : 'Save Action Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
