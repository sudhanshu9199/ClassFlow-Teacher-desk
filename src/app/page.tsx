'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Layers,
  X,
  Building2,
  Settings,
  Trash2,
} from 'lucide-react';
import { ClassFlowService } from '@/lib/supabase/service';
import { ClassItem, TeacherProfile, Student, SchoolProfile } from '@/types/database';
import { MOCK_TEACHER, DEFAULT_SCHOOL_PROFILE, SAMPLE_DEMO_CLASSES } from '@/lib/supabase/mock-data';
import { ClassRosterManagerModal } from '@/components/daily-grid/ClassRosterManagerModal';
import { SchoolLogoBadge } from '@/components/common/SchoolLogoBadge';
import { SchoolSettingsModal } from '@/components/common/SchoolSettingsModal';

export default function HomePage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teacher, setTeacher] = useState<TeacherProfile>(MOCK_TEACHER);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddStudentsOpen, setIsAddStudentsOpen] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<string>('');

  // 2026 Contextual Student Roster Manager Modal State
  const [rosterModalClass, setRosterModalClass] = useState<ClassItem | null>(null);
  const [rosterStudents, setRosterStudents] = useState<Student[]>([]);

  // New Class Form State
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(4);

  // Bulk Students Form State
  const [bulkInputText, setBulkInputText] = useState('');
  const [singleRoll, setSingleRoll] = useState('');
  const [singleFirstName, setSingleFirstName] = useState('');
  const [singleLastName, setSingleLastName] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [uploadMode, setUploadMode] = useState<'bulk' | 'single'>('bulk');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [cls, profile] = await Promise.all([
        ClassFlowService.getAllClasses(),
        ClassFlowService.getSchoolProfile(),
      ]);
      setClasses(cls);
      setSchoolProfile(profile);
      if (cls.length > 0) {
        setSelectedClassForStudents(cls[0].id);
      }
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  const handleOpenRoster = async (cls: ClassItem) => {
    setRosterModalClass(cls);
    const data = await ClassFlowService.getDailyClassData(cls.id);
    setRosterStudents(data.students.map((s) => s.student));
  };

  const handleRosterAddStudents = async (newStudents: any[]) => {
    if (!rosterModalClass) return;
    const updatedData = await ClassFlowService.addStudentsToClass(rosterModalClass.id, newStudents);
    setRosterStudents(updatedData.students.map((s) => s.student));
    const refreshedClasses = await ClassFlowService.getAllClasses();
    setClasses(refreshedClasses);
    showToast(`Enrolled ${newStudents.length} students into ${rosterModalClass.name}!`);
  };

  const handleRosterUpdateStudent = async (studentId: string, updated: any) => {
    if (!rosterModalClass) return;
    const updatedData = await ClassFlowService.updateStudentInClass(rosterModalClass.id, studentId, updated);
    setRosterStudents(updatedData.students.map((s) => s.student));
    showToast('Updated student details successfully!');
  };

  const handleRosterRemoveStudent = async (studentId: string) => {
    if (!rosterModalClass) return;
    const updatedData = await ClassFlowService.removeStudentFromClass(rosterModalClass.id, studentId);
    setRosterStudents(updatedData.students.map((s) => s.student));
    const refreshedClasses = await ClassFlowService.getAllClasses();
    setClasses(refreshedClasses);
    showToast('Removed student from class roster.');
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    if (!window.confirm(`Are you sure you want to delete "${className}"? This will remove all associated submissions.`)) {
      return;
    }
    const updated = await ClassFlowService.deleteClass(classId);
    setClasses(updated);
    showToast(`Deleted "${className}" successfully.`);
  };

  const handleLoadDemoClasses = async () => {
    // Populate demo classes
    localStorage.setItem('classflow_classes_list', JSON.stringify(SAMPLE_DEMO_CLASSES));
    const refreshed = await ClassFlowService.getAllClasses();
    setClasses(refreshed);
    showToast('Loaded demo class (Class 4-A) with sample students!');
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !newClassSubject.trim()) return;

    const created = await ClassFlowService.createClass({
      name: newClassName.trim(),
      subject: newClassSubject.trim(),
      grade_level: Number(newClassGrade),
      section: 'A',
      academic_year: '2026-2027',
      teacher_id: teacher.id,
    });

    setClasses((prev) => [...prev, created]);
    setIsAddClassOpen(false);
    setNewClassName('');
    setNewClassSubject('');
    showToast(`Created ${created.name} (${created.subject}) successfully!`);
    handleOpenRoster(created);
  };

  const handleAddStudents = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForStudents) return;

    const parsedStudents: { rollNumber: number; firstName: string; lastName: string; phone: string }[] = [];

    if (uploadMode === 'single') {
      if (!singleFirstName.trim() || !singleRoll) return;
      parsedStudents.push({
        rollNumber: parseInt(singleRoll, 10),
        firstName: singleFirstName.trim(),
        lastName: singleLastName.trim(),
        phone: singlePhone.trim() || '+91 98000-00000',
      });
    } else {
      // Bulk Parser: handles formats like:
      // 1, Aarav Sharma, 9811122331
      // or "1. Aarav Sharma"
      const lines = bulkInputText.split('\n');
      lines.forEach((line, idx) => {
        const clean = line.trim();
        if (!clean) return;
        const parts = clean.split(/[,\t]+/).map((s) => s.trim());
        let roll = idx + 1;
        let name = clean;
        let phone = '+91 98000-00000';

        if (parts.length >= 2 && !isNaN(parseInt(parts[0], 10))) {
          roll = parseInt(parts[0], 10);
          name = parts[1];
          if (parts[2]) phone = parts[2];
        } else if (clean.match(/^(\d+)[\.\)]\s*(.*)/)) {
          const m = clean.match(/^(\d+)[\.\)]\s*(.*)/)!;
          roll = parseInt(m[1], 10);
          name = m[2];
        }

        const nameParts = name.split(/\s+/);
        parsedStudents.push({
          rollNumber: roll,
          firstName: nameParts[0] || 'Student',
          lastName: nameParts.slice(1).join(' ') || '',
          phone,
        });
      });
    }

    if (parsedStudents.length === 0) return;

    await ClassFlowService.addStudentsToClass(selectedClassForStudents, parsedStudents);
    setIsAddStudentsOpen(false);
    setBulkInputText('');
    setSingleFirstName('');
    setSingleLastName('');
    setSingleRoll('');
    setSinglePhone('');
    showToast(`Added ${parsedStudents.length} students to class roster!`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-24">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 safe-top sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SchoolLogoBadge profile={schoolProfile} size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base text-slate-900 tracking-tight">
                  ClassFlow
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Teacher Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {schoolProfile.school_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Configure School Name, CBSE Affiliation & Custom Crest"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">School Settings</span>
            </button>

            <div className="text-right hidden sm:block border-l border-slate-200 pl-2.5">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>Dismissal Wrap-up</span>
              </div>
              <div className="text-[11px] text-slate-400">Post-Class Duty</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Welcome Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Subject & Class Teacher
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {teacher.full_name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Managing {classes.length} {classes.length === 1 ? 'class' : 'classes'} • {schoolProfile.campus_locality}, {schoolProfile.city}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddClassOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Class</span>
            </button>
          </div>
        </div>

        {/* Quick Access Grid: Attention Queue & Coordinator Portal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Quick Access to Attention Queue */}
          <Link
            href="/attention-queue"
            className="block bg-gradient-to-r from-rose-500 to-amber-600 text-white p-4 rounded-2xl shadow-md shadow-rose-500/15 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <span>Attention Queue</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-white/20 rounded-full">
                      Teacher Triage
                    </span>
                  </h3>
                  <p className="text-xs text-white/90">
                    Call parents or send WhatsApp updates
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Quick Access to Coordinator Desk */}
          <Link
            href="/coordinator/review"
            className="block bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all group border border-slate-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs">
                  <Building2 className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-2">
                    <span>Coordinator Desk</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-full">
                      Admin
                    </span>
                  </h3>
                  <p className="text-xs text-white/80">
                    Review escalations & remedial approvals
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Classes Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                My Assigned Classes ({classes.length})
              </h3>
            </div>

            {classes.length > 0 && (
              <button
                type="button"
                onClick={() => handleOpenRoster(classes[0])}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Students</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {classes.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl font-bold">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">No Classes Added Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Create your first subject or class section to start rapid 60-second homework tracking.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsAddClassOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Class</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadDemoClasses}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Load Sample Demo Class</span>
                  </button>
                </div>
              </div>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-800 border border-slate-200 shrink-0 font-black text-sm">
                      {cls.name.split(' ')[1] || 'CL'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-slate-900">{cls.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {cls.subject}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Academic Year {cls.academic_year || '2026-2027'} • Primary Division
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                    {/* Contextual Roster Management Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenRoster(cls)}
                      className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title={`Manage students enrolled in ${cls.name}`}
                    >
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Students ({cls.totalStudents ?? 0})</span>
                    </button>

                    <Link
                      href={`/classes/${cls.id}/reports`}
                      className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reports</span>
                    </Link>

                    <Link
                      href={`/classes/${cls.id}/daily`}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>60s Daily</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDeleteClass(cls.id, cls.name)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title={`Delete ${cls.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* MODAL: ADD CLASS */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-extrabold text-sm text-slate-900">Add New Class</h3>
              <button onClick={() => setIsAddClassOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Class Name & Section
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Class 5-A, Grade 3, Batch B"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mathematics, Science, English, Hindi"
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Grade Level (1 to 6)
                </label>
                <select
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(Number(e.target.value))}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      Class / Grade {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddClassOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / IMPORT STUDENTS */}
      {isAddStudentsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90dvh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-extrabold text-sm text-slate-900">Add / Import Students</h3>
              <button onClick={() => setIsAddStudentsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudents} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Target Class
                </label>
                <select
                  value={selectedClassForStudents}
                  onChange={(e) => setSelectedClassForStudents(e.target.value)}
                  className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 bg-slate-50"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setUploadMode('bulk')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    uploadMode === 'bulk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  📋 Bulk Copy-Paste (Fast)
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('single')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    uploadMode === 'single' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  ✍️ Single Student Form
                </button>
              </div>

              {uploadMode === 'bulk' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Paste Student List (Excel / WhatsApp / Plain text)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Format: <code>RollNo, Full Name, Phone</code> OR numbered list (e.g. <code>1. Aarav Sharma</code>)
                  </p>
                  <textarea
                    rows={6}
                    required
                    value={bulkInputText}
                    onChange={(e) => setBulkInputText(e.target.value)}
                    placeholder={"1, Aarav Sharma, 9811122331\n2, Ananya Patel, 9822233442\n3, Devansh Gupta, 9833344553"}
                    className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Roll No</label>
                      <input
                        required
                        type="number"
                        placeholder="1"
                        value={singleRoll}
                        onChange={(e) => setSingleRoll(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                      <input
                        required
                        type="text"
                        placeholder="Aarav"
                        value={singleFirstName}
                        onChange={(e) => setSingleFirstName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        placeholder="Sharma"
                        value={singleLastName}
                        onChange={(e) => setSingleLastName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="+91 98111-22331"
                      value={singlePhone}
                      onChange={(e) => setSinglePhone(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentsOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Import Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2026 CONTEXTUAL CLASS ROSTER MANAGER MODAL */}
      {rosterModalClass && (
        <ClassRosterManagerModal
          isOpen={!!rosterModalClass}
          classInfo={rosterModalClass}
          currentStudents={rosterStudents}
          onClose={() => setRosterModalClass(null)}
          onAddStudents={handleRosterAddStudents}
          onUpdateStudent={handleRosterUpdateStudent}
          onRemoveStudent={handleRosterRemoveStudent}
        />
      )}

      {/* 2026 INSTITUTIONAL SCHOOL PROFILE & INSIGNIA MODAL */}
      <SchoolSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(updated) => {
          setSchoolProfile(updated);
          showToast(`Updated school settings for ${updated.school_name}!`);
        }}
        initialProfile={schoolProfile}
      />
    </div>
  );
}
