'use client';

import React, { useState } from 'react';
import {
  SchoolProfile,
  SchoolLogoColorTheme,
  SchoolLogoShape,
} from '@/types/database';
import { SchoolLogoBadge } from './SchoolLogoBadge';
import {
  X,
  Building2,
  Shield,
  CheckCircle2,
  Palette,
  Sparkles,
  MapPin,
  FileCheck,
  Check,
} from 'lucide-react';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  initialProfile: SchoolProfile;
  onClose: () => void;
  onSave: (updatedProfile: SchoolProfile) => void;
}

const COLOR_THEMES: {
  id: SchoolLogoColorTheme;
  label: string;
  swatch: string;
}[] = [
  { id: 'emerald_mint', label: 'Emerald Forest & Mint', swatch: 'from-emerald-700 to-teal-900 border-emerald-400' },
  { id: 'indigo_gold', label: 'Royal Indigo & Gold', swatch: 'from-indigo-800 to-indigo-950 border-amber-400' },
  { id: 'crimson_gold', label: 'Crimson Maroon & Amber', swatch: 'from-rose-800 to-red-950 border-amber-300' },
  { id: 'sapphire_cyan', label: 'Sapphire Navy & Cyan', swatch: 'from-blue-800 to-slate-950 border-cyan-400' },
  { id: 'slate_bronze', label: 'Slate Charcoal & Bronze', swatch: 'from-slate-700 to-slate-950 border-amber-500' },
  { id: 'purple_coral', label: 'Amethyst Purple & Coral', swatch: 'from-purple-800 to-fuchsia-950 border-rose-300' },
];

const SHAPES: { id: SchoolLogoShape; label: string; icon: string }[] = [
  { id: 'shield', label: 'Shield Crest', icon: '🛡️' },
  { id: 'rounded_crest', label: 'Rounded Crest', icon: '🔲' },
  { id: 'circle', label: 'Round Medallion', icon: '⭕' },
  { id: 'hexagon', label: 'Hexagon Badge', icon: '⬡' },
];

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  initialProfile,
  onClose,
  onSave,
}) => {
  const [schoolName, setSchoolName] = useState(initialProfile.schoolName);
  const [hasAffiliation, setHasAffiliation] = useState(initialProfile.hasAffiliation);
  const [affiliationNumber, setAffiliationNumber] = useState(initialProfile.affiliationNumber || '');
  const [addressLine, setAddressLine] = useState(initialProfile.addressLine);
  const [cityState, setCityState] = useState(initialProfile.cityState);
  const [logoLetters, setLogoLetters] = useState(initialProfile.logoLetters);
  const [logoColorTheme, setLogoColorTheme] = useState<SchoolLogoColorTheme>(initialProfile.logoColorTheme);
  const [logoShape, setLogoShape] = useState<SchoolLogoShape>(initialProfile.logoShape);

  if (!isOpen) return null;

  // Auto-generate initials when school name changes if letters match previous pattern
  const handleSchoolNameChange = (val: string) => {
    setSchoolName(val);
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      const initials = words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
      setLogoLetters(initials);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SchoolProfile = {
      ...initialProfile,
      schoolName: schoolName.trim(),
      hasAffiliation,
      affiliationNumber: hasAffiliation ? affiliationNumber.trim() : undefined,
      addressLine: addressLine.trim(),
      cityState: cityState.trim(),
      logoLetters: logoLetters.trim() || 'SCH',
      logoColorTheme,
      logoShape,
      updatedAt: new Date().toISOString(),
    };
    onSave(updated);
    onClose();
  };

  const currentPreviewProfile: Partial<SchoolProfile> = {
    schoolName,
    logoLetters,
    logoColorTheme,
    logoShape,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92dvh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                School Profile & Insignia Settings
              </h3>
              <p className="text-[11px] text-slate-500">
                Institutional branding for header, PTM sheets & reports
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
        <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-5">
          {/* Live School Insignia Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5 min-w-0">
              <SchoolLogoBadge profile={currentPreviewProfile} size="lg" />
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Insignia Preview
                </div>
                <h4 className="font-extrabold text-sm truncate">{schoolName || 'Your School Name'}</h4>
                <p className="text-[11px] text-slate-300 truncate">
                  {addressLine || 'Institutional Area, Model Town'}, {cityState || 'New Delhi'}
                </p>
                {hasAffiliation && affiliationNumber ? (
                  <span className="text-[10px] font-mono text-emerald-300 font-bold">
                    Affiliation: {affiliationNumber}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">Primary Wing</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: School Name & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Institutional Details</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official School Name
              </label>
              <input
                required
                type="text"
                value={schoolName}
                onChange={(e) => handleSchoolNameChange(e.target.value)}
                placeholder="e.g. Delhi Public Model School"
                className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>Campus / Institutional Area</span>
                </label>
                <input
                  required
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  placeholder="e.g. Institutional Area, Model Town"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City, State & PIN
                </label>
                <input
                  required
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="e.g. New Delhi - 110009"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Affiliation Number (Known or Not) */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">
                  School Board Affiliation Number
                </span>
                <p className="text-[11px] text-slate-500">
                  CBSE / ICSE / State Board registration number for official print documents
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasAffiliation}
                  onChange={(e) => setHasAffiliation(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {hasAffiliation ? (
              <div className="animate-in fade-in duration-150">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Affiliation Code / Registration No.
                </label>
                <input
                  type="text"
                  value={affiliationNumber}
                  onChange={(e) => setAffiliationNumber(e.target.value)}
                  placeholder="e.g. CBSE/AFF/2130045 or ICSE/DL-042"
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900"
                />
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-medium">
                Affiliation number set to <strong>&quot;Recognized Primary Wing&quot;</strong> on report sheets.
              </div>
            )}
          </div>

          {/* Section 3: Dynamic Insignia / Monogram Customization */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              <span>School Insignia & Monogram Letters</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monogram Letters (Up to 4 characters)
              </label>
              <input
                type="text"
                maxLength={4}
                value={logoLetters}
                onChange={(e) => setLogoLetters(e.target.value.toUpperCase())}
                placeholder="e.g. DPMS or MTS"
                className="w-32 text-center text-sm font-black tracking-widest p-2 rounded-xl border border-slate-200 text-slate-900 uppercase"
              />
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Insignia Color Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = logoColorTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setLogoColorTheme(theme.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg bg-gradient-to-br border shadow-xs shrink-0 ${theme.swatch}`}
                      />
                      <span className="text-[11px] font-bold text-slate-800 truncate">
                        {theme.label.split('&')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shape Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Insignia Shape
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SHAPES.map((shp) => {
                  const isSelected = logoShape === shp.id;
                  return (
                    <button
                      key={shp.id}
                      type="button"
                      onClick={() => setLogoShape(shp.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 font-bold text-indigo-950 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">{shp.icon}</span>
                      <span className="text-[11px] font-bold block">{shp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/15 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Update School Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
