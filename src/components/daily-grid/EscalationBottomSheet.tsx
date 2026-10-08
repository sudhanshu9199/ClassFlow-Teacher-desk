'use client';

import React, { useState, useEffect } from 'react';
import {
  Student,
  ObservationCategory,
  ObservationSeverity,
  TeacherActionType,
  Observation,
  HandwritingProfile,
  HandwritingGrade,
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
  PenTool,
  History,
  ListPlus,
  Home,
} from 'lucide-react';

interface EscalationBottomSheetProps {
  isOpen: boolean;
  student: Student | null;
  classNameTitle: string;
  existingObservation?: Observation;
  allObservations?: Observation[];
  handwritingProfile?: HandwritingProfile;
  onClose: () => void;
  onSave: (payload: {
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
  }) => Promise<void>;
}

const CATEGORIES: { id: ObservationCategory; label: string; icon: string }[] = [
  { id: 'incomplete_work', label: 'Incomplete HW', icon: '📝' },
  { id: 'handwriting', label: 'Handwriting & Presentation', icon: '✍️' },
  { id: 'academic', label: 'Academic / Concept', icon: '📐' },
  { id: 'diary', label: 'School Diary', icon: '📖' },
  { id: 'behavioral', label: 'Behavioral', icon: '🤝' },
  { id: 'attendance', label: 'Attendance', icon: '📅' },
];

const HANDWRITING_TAGS = [
  { id: 'neat', label: 'Neat & Clear ✨', desc: 'Good legibility, clean pages' },
  { id: 'improving', label: 'Improving 📈', desc: 'Noticeable trend of improvement' },
  { id: 'needs_practice', label: 'Needs Practice ✍️', desc: 'Requires cursive drill at home' },
  { id: 'alignment', label: '4-Line Alignment 📏', desc: 'Baseline & letter height issues' },
  { id: 'format', label: 'Format & Margins 📐', desc: 'Missing date, rule lines or index' },
  { id: 'exemplary', label: 'Exemplary ⭐', desc: 'Model notebook presentation' },
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
  allObservations = [],
  handwritingProfile,
  onClose,
  onSave,
}) => {
  const [category, setCategory] = useState<ObservationCategory>('incomplete_work');
  const [severity, setSeverity] = useState<ObservationSeverity>('amber');
  const [actionType, setActionType] = useState<TeacherActionType>('Call Parent');
  const [teacherNote, setTeacherNote] = useState('');
  const [obsDate, setObsDate] = useState('2026-10-08');
  const [handwritingTag, setHandwritingTag] = useState<string>('');
  const [pointsInput, setPointsInput] = useState<string>('');
  const [actionForHome, setActionForHome] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setObsDate(today);

    if (existingObservation) {
      setCategory(existingObservation.category);
      setSeverity(existingObservation.severity);
      setActionType(existingObservation.action_type || 'Call Parent');
      setTeacherNote(existingObservation.teacher_note);
      if (existingObservation.date) setObsDate(existingObservation.date);
      if (existingObservation.handwriting_tag) setHandwritingTag(existingObservation.handwriting_tag);
      if (existingObservation.action_for_home) setActionForHome(existingObservation.action_for_home);
      if (existingObservation.structured_points && existingObservation.structured_points.length > 0) {
        setPointsInput(existingObservation.structured_points.join('\n'));
      } else {
        setPointsInput('');
      }
    } else {
      setCategory('incomplete_work');
      setSeverity('amber');
      setActionType('Call Parent');
      setTeacherNote('');
      setHandwritingTag(handwritingProfile?.overall_grade || '');
      setPointsInput('');
      setActionForHome('');
    }
  }, [existingObservation, student, handwritingProfile]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherNote.trim()) return;

    // Parse structured points from textarea
    const parsedPoints = pointsInput
      .split('\n')
      .map((line) => line.replace(/^[-*•\d\.\)]\s*/, '').trim())
      .filter((line) => line.length > 0);

    // Compute handwriting profile update if a tag is selected
    const hwProfileUpdate: Partial<HandwritingProfile> | undefined = handwritingTag
      ? {
          overall_grade: (handwritingTag === 'improving'
            ? 'improving'
            : handwritingTag === 'neat'
            ? 'neat'
            : handwritingTag === 'exemplary'
            ? 'excellent'
            : handwritingTag === 'needs_practice'
            ? 'needs_practice'
            : 'developing') as HandwritingGrade,
          alignment_grade: handwritingTag === 'alignment' ? 'needs_practice' : 'good',
          neatness_grade: handwritingTag === 'neat' || handwritingTag === 'exemplary' ? 'good' : 'fair',
          notes: teacherNote.trim(),
          updated_at: new Date().toISOString(),
        }
      : undefined;

    try {
      setIsSubmitting(true);
      await onSave({
        studentId: student.id,
        category,
        severity,
        actionType,
        teacherNote: teacherNote.trim(),
        structuredPoints: parsedPoints.length > 0 ? parsedPoints : undefined,
        actionForHome: actionForHome.trim() || undefined,
        handwritingTag: handwritingTag || undefined,
        handwritingProfile: hwProfileUpdate,
        date: obsDate || new Date().toISOString().split('T')[0],
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
    const pointsText = pointsInput
      ? `\nPoints for Parent:\n${pointsInput
          .split('\n')
          .filter(Boolean)
          .map((p, i) => `${i + 1}. ${p.trim()}`)
          .join('\n')}`
      : '';
    const message = encodeURIComponent(
      `Namaste, this is regarding ${student.first_name} ${student.last_name} (${classNameTitle}).\nDate: ${obsDate}\nObservation: ${teacherNote || 'Please review homework.'}${pointsText}\nAction at Home: ${actionForHome || 'Check notebook tonight.'}${dossierUrl}\n- Primary Teacher, Delhi Public Model School`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh] animate-in slide-in-from-bottom duration-200">
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
              <p className="text-[11px] text-slate-500">
                Remark Date: {obsDate} • {allObservations.length} historical remarks on file
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Row: Date & Urgency Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Observation Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                <span>Remark Date</span>
              </label>
              <input
                type="date"
                value={obsDate}
                onChange={(e) => setObsDate(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* Severity Pill Switch */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Urgency Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity('amber')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    severity === 'amber'
                      ? 'border-amber-400 bg-amber-50 text-amber-950 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>🟡 Amber</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('red')}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    severity === 'red'
                      ? 'border-rose-400 bg-rose-50 text-rose-950 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                  <span>🔴 High Red</span>
                </button>
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Issue Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id);
                    if (cat.id === 'handwriting' && !handwritingTag) {
                      setHandwritingTag('needs_practice');
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                    category === cat.id
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Handwriting & Notebook Presentation Evaluation */}
          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Handwriting & Presentation Quality</span>
              </label>
              {handwritingTag && (
                <button
                  type="button"
                  onClick={() => setHandwritingTag('')}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Clear Tag
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {HANDWRITING_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setHandwritingTag(handwritingTag === tag.id ? '' : tag.id)}
                  className={`p-2 rounded-lg text-left border text-xs transition-all cursor-pointer ${
                    handwritingTag === tag.id
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs font-bold'
                      : 'border-indigo-200/60 bg-white text-slate-800 hover:bg-indigo-50/60 font-medium'
                  }`}
                >
                  <div className="leading-tight">{tag.label}</div>
                  <div
                    className={`text-[9px] mt-0.5 leading-tight ${
                      handwritingTag === tag.id ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    {tag.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Teacher's Note */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Teacher Observation Note *
            </label>
            <textarea
              required
              rows={2}
              value={teacherNote}
              onChange={(e) => setTeacherNote(e.target.value)}
              placeholder="e.g. Incomplete multiplication table exercise. Letter alignment on 4-line notebook needs practice."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Structured Points for Indian Parents & Student Report */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ListPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Clear Points for Parents & Student (Report Points)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">1 per line</span>
            </div>
            <textarea
              rows={2}
              value={pointsInput}
              onChange={(e) => setPointsInput(e.target.value)}
              placeholder="Point 1: Practice 2-digit multiplication with carrying steps daily&#10;Point 2: Ensure neat handwriting alignment between lines in 4-line notebook"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Action Directive for Home */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-amber-600" />
              <span>Recommended Action at Home (Parent Guidance)</span>
            </label>
            <input
              type="text"
              value={actionForHome}
              onChange={(e) => setActionForHome(e.target.value)}
              placeholder="e.g. Inspect school diary and verify rough calculations before bedtime"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Teacher Action Plan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Teacher Action Plan to Execute
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEACHER_ACTIONS.map((action) => {
                const IconComponent = action.icon;
                const isSelected = actionType === action.id;
                return (
                  <div
                    key={action.id}
                    onClick={() => setActionType(action.id)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {action.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{action.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Remarks Accordion (Multi-Date Continuity) */}
          {allObservations.length > 0 && (
            <div className="pt-1 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full py-2 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Previous Remarks for this Student ({allObservations.length} on file)</span>
                </div>
                <span className="text-[10px] text-indigo-600 underline">
                  {showHistory ? 'Hide History' : 'Show All Dates'}
                </span>
              </button>

              {showHistory && (
                <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 max-h-44 overflow-y-auto">
                  {allObservations.map((obs, idx) => (
                    <div
                      key={obs.id || idx}
                      className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <CalendarDays className="w-3 h-3 text-slate-400" />
                          <span>{obs.date || 'Previous Session'}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              obs.severity === 'red' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {obs.severity === 'red' ? 'High' : 'Amber'}
                          </span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">{obs.action_type}</span>
                      </div>
                      <p className="text-slate-700 font-medium">&quot;{obs.teacher_note}&quot;</p>
                      {obs.structured_points && obs.structured_points.length > 0 && (
                        <div className="text-[11px] text-slate-600 pl-2 border-l-2 border-indigo-200">
                          {obs.structured_points.map((pt, pIdx) => (
                            <div key={pIdx}>• {pt}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
