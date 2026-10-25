/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

interface TrollMeterProps {
  points: number;
  maxPoints?: number;
  compact?: boolean;
  onOpenVault?: () => void;
  className?: string;
}

export const TrollMeter: React.FC<TrollMeterProps> = ({
  points,
  maxPoints = 100,
  compact = false,
  onOpenVault,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (points / maxPoints) * 100));

  if (compact) {
    return (
      <button
        onClick={onOpenVault}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer ${className}`}
        title="Troll Meter: Click to view rewards & skins"
      >
        <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
        <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">
          {points}
        </span>
      </button>
    );
  }

  return (
    <div
      onClick={onOpenVault}
      className={`relative p-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-lg shadow-amber-950/20 backdrop-blur-sm cursor-pointer hover:border-amber-400 transition-all ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <div className="text-xs font-display font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              Troll Meter
              <Sparkles className="w-3 h-3 text-amber-300" />
            </div>
            <div className="text-[11px] text-slate-400">
              Fills when you fall for tricks
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-base font-mono font-bold text-amber-300 tabular-nums">
            {points}
          </span>
          <span className="text-xs text-slate-500 font-mono">/{maxPoints}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3 rounded-full bg-slate-800/90 overflow-hidden border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-500 transition-all duration-700 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          {/* Animated shine line */}
          <div className="absolute inset-0 bg-white/20 w-1/3 skew-x-12 animate-pulse" />
        </div>
      </div>

      {/* Milestone Indicators */}
      <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono text-slate-400 px-0.5">
        <span className={points >= 20 ? 'text-amber-400 font-bold' : ''}>20 (Fancy)</span>
        <span className={points >= 50 ? 'text-cyan-400 font-bold' : ''}>50 (Cyber)</span>
        <span className={points >= 80 ? 'text-purple-400 font-bold' : ''}>80 (King)</span>
        <span className={points >= 100 ? 'text-rose-400 font-bold' : ''}>100 (Master)</span>
      </div>
    </div>
  );
};
