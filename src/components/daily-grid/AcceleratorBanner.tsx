'use client';

import React from 'react';
import { Zap, CheckCircle2, RotateCcw } from 'lucide-react';

interface AcceleratorBannerProps {
  unmarkedCount: number;
  totalStudents: number;
  onMarkAllSubmitted: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export const AcceleratorBanner: React.FC<AcceleratorBannerProps> = ({
  unmarkedCount,
  totalStudents,
  onMarkAllSubmitted,
  onUndo,
  canUndo = false,
}) => {
  return (
    <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 shadow-lg shadow-emerald-950/15 border border-emerald-700/40 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center p-1 bg-emerald-500/20 text-emerald-300 rounded-lg">
              <Zap className="w-4 h-4 fill-emerald-400 stroke-none" />
            </span>
            <h3 className="font-semibold text-sm tracking-tight text-white">
              Staff Room 60s Accelerator
            </h3>
            {unmarkedCount > 0 ? (
              <span className="bg-emerald-400/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-mono font-medium">
                {unmarkedCount} pending
              </span>
            ) : (
              <span className="bg-emerald-400/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> All {totalStudents} Logged
              </span>
            )}
          </div>
          <p className="text-xs text-emerald-200/80 mt-1">
            Tap to mark all unsubmitted students as completed in 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canUndo && onUndo && (
            <button
              type="button"
              onClick={onUndo}
              className="touch-target-48 tap-tactile px-3 py-2 text-xs font-medium text-emerald-200 hover:text-white bg-white/10 hover:bg-white/15 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Undo last accelerator batch"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}

          <button
            type="button"
            onClick={onMarkAllSubmitted}
            disabled={unmarkedCount === 0}
            className={`touch-target-48 tap-tactile w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm tracking-tight inline-flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              unmarkedCount > 0
                ? 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950 active:bg-emerald-200 shadow-emerald-950/30'
                : 'bg-emerald-950/60 text-emerald-500/50 cursor-not-allowed border border-emerald-800/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>
              {unmarkedCount > 0
                ? `Mark ${unmarkedCount} Remaining as Submitted`
                : 'All Students Submitted'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
