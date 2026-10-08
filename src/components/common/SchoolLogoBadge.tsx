'use client';

import React from 'react';
import { SchoolProfile, SchoolLogoColorTheme, SchoolLogoShape } from '@/types/database';

interface SchoolLogoBadgeProps {
  profile?: Partial<SchoolProfile>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const THEME_STYLES: Record<
  SchoolLogoColorTheme,
  { bg: string; text: string; border: string; accent: string }
> = {
  emerald_mint: {
    bg: 'bg-gradient-to-br from-emerald-800 to-teal-950',
    text: 'text-emerald-200',
    border: 'border-emerald-500/50',
    accent: 'text-emerald-400',
  },
  indigo_gold: {
    bg: 'bg-gradient-to-br from-indigo-900 to-indigo-950',
    text: 'text-amber-300',
    border: 'border-amber-400/50',
    accent: 'text-amber-400',
  },
  crimson_gold: {
    bg: 'bg-gradient-to-br from-rose-900 to-red-950',
    text: 'text-amber-200',
    border: 'border-amber-400/60',
    accent: 'text-amber-300',
  },
  sapphire_cyan: {
    bg: 'bg-gradient-to-br from-blue-900 to-slate-950',
    text: 'text-cyan-200',
    border: 'border-cyan-400/50',
    accent: 'text-cyan-300',
  },
  slate_bronze: {
    bg: 'bg-gradient-to-br from-slate-800 to-slate-950',
    text: 'text-amber-200',
    border: 'border-amber-500/40',
    accent: 'text-amber-400',
  },
  purple_coral: {
    bg: 'bg-gradient-to-br from-purple-900 to-fuchsia-950',
    text: 'text-rose-200',
    border: 'border-rose-400/50',
    accent: 'text-rose-300',
  },
};

const SIZE_STYLES = {
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-sm font-black',
  xl: 'w-20 h-20 text-xl font-black',
};

const SHAPE_STYLES: Record<SchoolLogoShape, string> = {
  shield: 'rounded-b-2xl rounded-t-lg',
  circle: 'rounded-full',
  rounded_crest: 'rounded-2xl',
  hexagon: 'rounded-xl rotate-0',
};

export const SchoolLogoBadge: React.FC<SchoolLogoBadgeProps> = ({
  profile,
  size = 'md',
  className = '',
}) => {
  const letters = (profile?.logoLetters || profile?.schoolName?.substring(0, 3) || 'SCH').toUpperCase();
  const theme = profile?.logoColorTheme || 'emerald_mint';
  const shape = profile?.logoShape || 'shield';

  const styleTheme = THEME_STYLES[theme] || THEME_STYLES.emerald_mint;
  const sizeStyle = SIZE_STYLES[size];
  const shapeStyle = SHAPE_STYLES[shape];

  if (profile?.customLogoUrl) {
    return (
      <div
        className={`${sizeStyle} ${shapeStyle} overflow-hidden border border-slate-300 shrink-0 shadow-xs ${className}`}
      >
        <img
          src={profile.customLogoUrl}
          alt={profile.schoolName || 'School Logo'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center font-black tracking-wider uppercase shadow-md border ${sizeStyle} ${shapeStyle} ${styleTheme.bg} ${styleTheme.border} ${styleTheme.text} shrink-0 ${className}`}
    >
      {/* Decorative Insignia Star or Crown */}
      <span className="text-[7px] leading-none opacity-80 mb-0.5">★</span>
      <span className="leading-none drop-shadow-xs">{letters.slice(0, 4)}</span>
      <span className="text-[6px] tracking-tighter opacity-60 mt-0.5">SCH</span>
    </div>
  );
};
