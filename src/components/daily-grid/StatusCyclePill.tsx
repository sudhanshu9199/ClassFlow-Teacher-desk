'use client';

import React from 'react';
import { SubmissionStatus } from '@/types/database';
import { Check, AlertTriangle, X, UserX, HelpCircle } from 'lucide-react';

interface StatusCyclePillProps {
  status: SubmissionStatus;
  rollNumber: number;
  onChange: (nextStatus: SubmissionStatus) => void;
  disabled?: boolean;
}

const CYCLE_ORDER: SubmissionStatus[] = ['submitted', 'incomplete', 'missing', 'absent'];

export const StatusCyclePill: React.FC<StatusCyclePillProps> = ({
  status,
  rollNumber,
  onChange,
  disabled = false,
}) => {
  const handleCycle = () => {
    if (disabled) return;
    const currentIndex = CYCLE_ORDER.indexOf(status);
    const nextIndex = (currentIndex + 1) % CYCLE_ORDER.length;
    onChange(CYCLE_ORDER[nextIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleCycle();
    } else if (e.key === '1') {
      onChange('submitted');
    } else if (e.key === '2') {
      onChange('incomplete');
    } else if (e.key === '3') {
      onChange('missing');
    } else if (e.key === '4') {
      onChange('absent');
    }
  };

  const getConfig = () => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Submitted',
          short: '✓ Done',
          icon: <Check className="w-4 h-4 stroke-[2.5]" />,
          classes: 'status-pill-submitted',
          ariaLabel: `Roll ${rollNumber}: Submitted. Tap to cycle.`,
        };
      case 'incomplete':
        return {
          label: 'Incomplete',
          short: '△ Partial',
          icon: <AlertTriangle className="w-4 h-4 stroke-[2.5]" />,
          classes: 'status-pill-incomplete',
          ariaLabel: `Roll ${rollNumber}: Incomplete homework. Tap to cycle.`,
        };
      case 'missing':
        return {
          label: 'Missing',
          short: '✗ Missing',
          icon: <X className="w-4 h-4 stroke-[2.5]" />,
          classes: 'status-pill-missing',
          ariaLabel: `Roll ${rollNumber}: Missing homework. Tap to cycle.`,
        };
      case 'absent':
        return {
          label: 'Absent',
          short: 'A Absent',
          icon: <UserX className="w-4 h-4 stroke-[2.5]" />,
          classes: 'status-pill-absent',
          ariaLabel: `Roll ${rollNumber}: Absent student. Tap to cycle.`,
        };
      case 'pending':
      default:
        return {
          label: 'Tap to Mark',
          short: '— Log',
          icon: <HelpCircle className="w-4 h-4 text-slate-400" />,
          classes: 'status-pill-pending',
          ariaLabel: `Roll ${rollNumber}: Unmarked. Tap to mark as submitted.`,
        };
    }
  };

  const config = getConfig();

  return (
    <button
      type="button"
      onClick={handleCycle}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={config.ariaLabel}
      title="Tap to cycle status (Space/Enter to cycle, 1: Submitted, 2: Incomplete, 3: Missing, 4: Absent)"
      className={`touch-target-48 tap-tactile px-3 py-2 rounded-xl font-medium text-xs sm:text-sm tracking-tight inline-flex items-center gap-1.5 transition-all select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${config.classes}`}
    >
      {config.icon}
      <span className="font-semibold">{config.label}</span>
    </button>
  );
};
