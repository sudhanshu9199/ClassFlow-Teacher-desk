'use client';

import React, { useState, useEffect } from 'react';
import { Student, ClassItem } from '@/types/database';
import {
  X,
  Plus,
  Upload,
  UserPlus,
  Users,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  FileText,
  Phone,
  Sparkles,
  ArrowRight,
  Download,
  FileUp,
} from 'lucide-react';
import Link from 'next/link';

interface ParsedStudentRow {
  rollNumber: number;
  firstName: string;
  lastName: string;
  phone: string;
  fatherName?: string;
  motherName?: string;
  admissionNumber?: string;
}

interface ClassRosterManagerModalProps {
  isOpen: boolean;
  classInfo: ClassItem;
  currentStudents: Student[];
  onClose: () => void;
  onAddStudents: (newStudents: ParsedStudentRow[]) => Promise<void>;
  onUpdateStudent: (studentId: string, updated: ParsedStudentRow) => Promise<void>;
  onRemoveStudent: (studentId: string) => Promise<void>;
}

export const ClassRosterManagerModal: React.FC<ClassRosterManagerModalProps> = ({
  isOpen,
  classInfo,
  currentStudents,
  onClose,
  onAddStudents,
  onUpdateStudent,
  onRemoveStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'smart_import' | 'single' | 'roster_list'>('smart_import');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Single Student Form State
  const [singleRoll, setSingleRoll] = useState<number>(1);
  const [singleFirstName, setSingleFirstName] = useState('');
  const [singleLastName, setSingleLastName] = useState('');
  const [singlePhone, setSinglePhone] = useState('');
  const [singleFatherName, setSingleFatherName] = useState('');
  const [singleAdmission, setSingleAdmission] = useState('');
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);

  // 2. Smart Import State
  const [rawPasteText, setRawPasteText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedStudentRow[]>([]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 3. Edit Student State
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ParsedStudentRow>({
    rollNumber: 1,
    firstName: '',
    lastName: '',
    phone: '',
    fatherName: '',
    admissionNumber: '',
  });

  // Calculate Next Roll Number
  const nextAvailableRoll = currentStudents.length > 0
    ? Math.max(...currentStudents.map((s) => s.roll_number)) + 1
    : 1;

  // File Upload Ingestion Handler (CSV / TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawPasteText(text);
      }
    };
    reader.readAsText(file);
  };

  // Drag & Drop Ingestion
  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setRawPasteText(text);
      }
    };
    reader.readAsText(file);
  };

  // Load 10 Authentic CBSE Primary Demo Students
  const handleLoadDemoStudents = () => {
    const demoList = [
      `1. Aarav Sharma, 9811122331, Mr. Vivek Sharma`,
      `2. Ananya Patel, 9822233442, Mr. Rajesh Patel`,
      `3. Devansh Gupta, 9833344553, Mr. Sunil Gupta`,
      `4. Ishaan Verma, 9844455664, Mr. Sanjay Verma`,
      `5. Kavya Singh, 9855566775, Mr. Dharmendra Singh`,
      `6. Meera Nair, 9866677886, Mr. Suresh Nair`,
      `7. Rohan Joshi, 9877788997, Mr. Amit Joshi`,
      `8. Sanya Malhotra, 9888899008, Mr. Vikram Malhotra`,
      `9. Vihaan Reddy, 9899900119, Mr. Venkat Reddy`,
      `10. Zara Khan, 9800011220, Mr. Tariq Khan`,
    ].join('\\n');
    setRawPasteText(demoList);
  };

  // Export Class Roster to Clean CSV
  const handleExportRosterCSV = () => {
    if (currentStudents.length === 0) return;
    const headers = ['Roll Number', 'Admission Number', 'First Name', 'Last Name', 'Parent Contact', 'Father Name'];
    const rows = currentStudents.map((st) => [
      st.roll_number,
      st.admission_number || '',
      st.first_name,
      st.last_name,
      st.primary_contact,
      st.father_name || '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${classInfo.name.replace(/\\s+/g, '_')}_Roster_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (isOpen) {
      setSingleRoll(nextAvailableRoll);
      setSingleAdmission(`ADM-2026-${nextAvailableRoll.toString().padStart(3, '0')}`);
      if (currentStudents.length === 0) {
        setActiveTab('smart_import');
      }
    }
  }, [isOpen, currentStudents.length, nextAvailableRoll]);

  // Real-time Parser for Smart Paste
  useEffect(() => {
    if (!rawPasteText.trim()) {
      setParsedPreview([]);
      return;
    }

    const lines = rawPasteText.split('\n');
    const rows: ParsedStudentRow[] = [];
    let autoRoll = nextAvailableRoll;

    lines.forEach((line) => {
      const clean = line.trim();
      if (!clean) return;

      // Format 1: Tab-separated (Excel / Google Sheets) or Comma-separated
      // Columns: Roll [0], FullName [1], Phone [2], FatherName [3], AdmissionNo [4]
      const parts = clean.split(/[\t,]+/).map((s) => s.trim());

      let roll = autoRoll;
      let fullName = '';
      let phone = '+91 98000-00000';
      let fatherName = '';
      let admissionNumber = '';

      if (parts.length >= 2 && !isNaN(parseInt(parts[0], 10))) {
        roll = parseInt(parts[0], 10);
        fullName = parts[1];
        if (parts[2]) phone = parts[2];
        if (parts[3]) fatherName = parts[3];
        if (parts[4]) admissionNumber = parts[4];
      } else if (clean.match(/^(\d+)[\.\)\-]\s*(.*)/)) {
        // Format 2: Numbered WhatsApp list (e.g. "1. Aarav Sharma - 9811122331 (Father: Vivek Sharma)")
        const match = clean.match(/^(\d+)[\.\)\-]\s*(.*)/)!;
        roll = parseInt(match[1], 10);
        const rest = match[2];

        // Check for Father tag
        const fatherMatch = rest.match(/father[:\s-]+([^\)\,\-]+)/i);
        if (fatherMatch) {
          fatherName = fatherMatch[1].trim();
        }

        // Check for phone
        const phoneMatch = rest.match(/(\+?91[\s\-]?[0-9]{10}|[0-9]{10})/);
        if (phoneMatch) {
          phone = phoneMatch[1].trim();
        }

        fullName = rest.replace(/father[:\s-]+[^\)\,\-]+/i, '').replace(/(\+?91[\s\-]?[0-9]{10}|[0-9]{10})/, '').replace(/[\(\)\-\:\,]/g, '').trim();
      } else {
        // Format 3: Plain Student Name per line
        fullName = clean;
        roll = autoRoll++;
      }

      // Name Splitter
      const nameParts = fullName.split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || 'Student';
      const lastName = nameParts.slice(1).join(' ') || '';

      rows.push({
        rollNumber: roll,
        firstName,
        lastName,
        phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
        fatherName: fatherName || '',
        admissionNumber: admissionNumber || `ADM-2026-${roll.toString().padStart(3, '0')}`,
      });
    });

    setParsedPreview(rows);
  }, [rawPasteText, nextAvailableRoll]);

  if (!isOpen) return null;

  // Handle Single Student Submit
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFirstName.trim()) return;

    setIsSubmittingSingle(true);
    try {
      await onAddStudents([
        {
          rollNumber: Number(singleRoll),
          firstName: singleFirstName.trim(),
          lastName: singleLastName.trim(),
          phone: singlePhone.trim() || '+91 98000-00000',
          fatherName: singleFatherName.trim() || undefined,
          admissionNumber: singleAdmission.trim() || undefined,
        },
      ]);
      setSingleFirstName('');
      setSingleLastName('');
      setSingleFatherName('');
      setSinglePhone('');
      setSingleRoll((prev) => prev + 1);
      setSingleAdmission(`ADM-2026-${(singleRoll + 1).toString().padStart(3, '0')}`);
      setActiveTab('roster_list');
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  // Handle Batch Import Submit
  const handleBatchSubmit = async () => {
    if (parsedPreview.length === 0) return;
    setIsSubmittingBatch(true);
    try {
      await onAddStudents(parsedPreview);
      setRawPasteText('');
      setParsedPreview([]);
      setActiveTab('roster_list');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  // Start Edit
  const handleStartEdit = (st: Student) => {
    setEditingStudentId(st.id);
    setEditForm({
      rollNumber: st.roll_number,
      firstName: st.first_name,
      lastName: st.last_name,
      phone: st.primary_contact,
      fatherName: st.father_name || '',
      admissionNumber: st.admission_number || '',
    });
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingStudentId) return;
    await onUpdateStudent(editingStudentId, editForm);
    setEditingStudentId(null);
  };

  // Filtered Roster
  const filteredStudents = currentStudents.filter((st) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${st.first_name} ${st.last_name}`.toLowerCase();
    const roll = st.roll_number.toString();
    const phone = st.primary_contact.toLowerCase();
    return fullName.includes(term) || roll.includes(term) || phone.includes(term);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Manage Class Roster
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {classInfo.name} ({classInfo.subject})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentStudents.length} students currently enrolled in this class
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('smart_import')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'smart_import'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Import (WhatsApp/Excel)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'single'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Single Student</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('roster_list')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'roster_list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Current Roster ({currentStudents.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* =========================================================================
              TAB 1: SMART IMPORT / COPY-PASTE (2026 TREND)
             ========================================================================= */}
          {activeTab === 'smart_import' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-xs text-emerald-950">
                  <div className="font-extrabold text-sm text-emerald-900 mb-0.5">
                    2026 Multi-Format Clipboard Ingestion
                  </div>
                  <p className="text-emerald-800/90 leading-relaxed">
                    Paste student lists directly from <strong>Excel / Google Sheets</strong>, school registers, or <strong>WhatsApp group rosters</strong>. The intelligent parser will automatically extract Roll Numbers, Names, Phone numbers, and Parents!
                  </p>
                </div>
              </div>

              {/* 2026 Ingestion Action Bar: Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Paste or Drop Roster Data
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadDemoStudents}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200/80 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Load 10 authentic CBSE primary student profiles for testing"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>⚡ Load CBSE Demo (10 Students)</span>
                  </button>

                  <label className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer">
                    <FileUp className="w-3 h-3 text-slate-600" />
                    <span>Upload CSV / TXT</span>
                    <input
                      type="file"
                      accept=".csv,.txt,.tsv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Drag and Drop Zone + Textarea */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDropFile}
                className={`relative rounded-2xl border-2 transition-all ${
                  isDragging
                    ? 'border-dashed border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <textarea
                  rows={5}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder={`Drag & drop a CSV file here, or paste from WhatsApp / Excel:\n\n1. Aarav Sharma, 9811122331, Mr. Vivek Sharma\n2. Ananya Patel - 9822233442 (Father: Rajesh Patel)\nDevansh Gupta\nIshaan Verma\t9844455664\tSanjay Verma`}
                  className="w-full text-xs font-mono p-3.5 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-transparent placeholder:text-slate-400 resize-y"
                />

                {isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-xs rounded-2xl pointer-events-none">
                    <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                      <FileUp className="w-4 h-4" />
                      <span>Drop CSV / TXT File to Parse</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Parsed Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        Parsed Preview ({parsedPreview.length} Students)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Ready to Add
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setParsedPreview([])}
                      className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Roll</th>
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">Phone</th>
                          <th className="py-2.5 px-3">Father Name</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {parsedPreview.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-mono font-bold text-slate-900">
                              #{row.rollNumber}
                            </td>
                            <td className="py-2 px-3 text-slate-900 font-semibold">
                              {row.firstName} {row.lastName}
                            </td>
                            <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                              {row.phone}
                            </td>
                            <td className="py-2 px-3 text-slate-500 text-[11px]">
                              {row.fatherName || '—'}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  setParsedPreview((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                title="Remove row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button
                    type="button"
                    onClick={handleBatchSubmit}
                    disabled={isSubmittingBatch}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isSubmittingBatch
                        ? 'Enrolling Students...'
                        : `Confirm & Add ${parsedPreview.length} Students to ${classInfo.name}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: SINGLE STUDENT FORM
             ========================================================================= */}
          {activeTab === 'single' && (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Roll No *
                  </label>
                  <input
                    required
                    type="number"
                    value={singleRoll}
                    onChange={(e) => setSingleRoll(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div className="col-span-1 sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admission Number
                  </label>
                  <input
                    type="text"
                    value={singleAdmission}
                    onChange={(e) => setSingleAdmission(e.target.value)}
                    placeholder="e.g. ADM-2026-107"
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    First Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={singleFirstName}
                    onChange={(e) => setSingleFirstName(e.target.value)}
                    placeholder="e.g. Aarav"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Last / Family Name
                  </label>
                  <input
                    type="text"
                    value={singleLastName}
                    onChange={(e) => setSingleLastName(e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Father / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={singleFatherName}
                    onChange={(e) => setSingleFatherName(e.target.value)}
                    placeholder="e.g. Mr. Vivek Sharma"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Parent Phone / WhatsApp *
                  </label>
                  <input
                    required
                    type="text"
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                    placeholder="+91 98111-22331"
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingSingle || !singleFirstName.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/15 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isSubmittingSingle
                      ? 'Saving Student...'
                      : `Add Student to ${classInfo.name}`}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              TAB 3: CURRENT CLASS ROSTER (EDIT & REMOVE)
             ========================================================================= */}
          {activeTab === 'roster_list' && (
            <div className="space-y-3">
              {/* Roster Controls: Export CSV & Quick Add */}
              <div className="flex items-center justify-between gap-2 pb-1">
                <div className="text-xs text-slate-500 font-medium">
                  Showing <strong className="text-slate-900">{filteredStudents.length}</strong> of{' '}
                  <strong className="text-slate-900">{currentStudents.length}</strong> enrolled students
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleExportRosterCSV}
                    disabled={currentStudents.length === 0}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200/80 flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Export class roster as a CSV spreadsheet"
                  >
                    <Download className="w-3 h-3 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('single')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name, roll number, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              {/* Student Rows */}
              <div className="space-y-2">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No students match your search.
                  </div>
                ) : (
                  filteredStudents.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-800 font-mono font-bold text-xs shrink-0 border border-slate-200">
                          <span className="text-[8px] uppercase tracking-tighter opacity-60">Roll</span>
                          <span>#{st.roll_number.toString().padStart(2, '0')}</span>
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {st.first_name} {st.last_name}
                          </h4>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                            <span className="font-mono">{st.primary_contact}</span>
                            {st.father_name && (
                              <>
                                <span>•</span>
                                <span>Father: {st.father_name}</span>
                              </>
                            )}
                            {st.admission_number && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {st.admission_number}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Link to PTM Sheet */}
                        <Link
                          href={`/students/${st.id}/ptm?classId=${classInfo.id}`}
                          className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="View 1-Page PTM Dossier"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(st)}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Student Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Remove ${st.first_name} ${st.last_name} (Roll #${st.roll_number}) from ${classInfo.name}?`
                              )
                            ) {
                              onRemoveStudent(st.id);
                            }
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove from Class Roster"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Edit Sub-Modal */}
        {editingStudentId && (
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">
                Edit Student Details
              </span>
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Roll</label>
                <input
                  type="number"
                  value={editForm.rollNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, rollNumber: Number(e.target.value) })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveEdit}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
