/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Lock, Star, Flame, Trophy } from 'lucide-react';
import { LevelDefinition, LevelProgress } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';

interface LevelSelectScreenProps {
  levels: LevelDefinition[];
  progress: LevelProgress[];
  onSelectLevel: (levelId: number) => void;
  onBackToHome: () => void;
  trollPoints: number;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  levels,
  progress,
  onSelectLevel,
  onBackToHome,
  trollPoints,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 max-w-md mx-auto select-none overflow-hidden">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <button
          onClick={() => {
            audioEngine.playClick();
            onBackToHome();
          }}
          className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
          title="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h2 className="font-display font-bold text-lg text-white">Select Level</h2>
          <div className="text-[11px] font-mono text-slate-400">
            20 Handcrafted Challenges
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>{trollPoints}</span>
        </div>
      </header>

      {/* Grid of 20 Levels */}
      <div className="flex-1 overflow-y-auto py-3 pr-1 grid grid-cols-4 sm:grid-cols-5 gap-2.5">
        {levels.map((lvl) => {
          const prog = progress.find((p) => p.id === lvl.id) || {
            unlocked: lvl.id === 1,
            completed: false,
            stars: 0,
            attempts: 0,
          };

          return (
            <button
              key={lvl.id}
              disabled={!prog.unlocked}
              onClick={() => {
                if (prog.unlocked) {
                  audioEngine.playPop();
                  onSelectLevel(lvl.id);
                }
              }}
              className={`btn-comic aspect-square rounded-2xl flex flex-col items-center justify-between p-2 border-2 transition-all ${
                !prog.unlocked
                  ? 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                  : prog.completed
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:border-emerald-400 cursor-pointer shadow-md'
                  : 'bg-slate-900 border-amber-500/50 text-amber-300 hover:border-amber-400 cursor-pointer shadow-md'
              }`}
            >
              {/* Level Number */}
              <span className="font-mono font-bold text-sm">
                {String(lvl.id).padStart(2, '0')}
              </span>

              {/* Center Icon */}
              <div className="my-auto">
                {!prog.unlocked ? (
                  <Lock className="w-4 h-4 text-slate-500" />
                ) : prog.completed ? (
                  <div className="flex text-amber-400 gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <Star className="w-3 h-3 fill-amber-400" />
                    {prog.stars >= 3 && <Star className="w-3 h-3 fill-amber-400" />}
                  </div>
                ) : (
                  <span className="text-[10px] font-display font-bold uppercase text-amber-400">
                    PLAY
                  </span>
                )}
              </div>

              {/* Status footer */}
              <div className="text-[9px] font-mono text-slate-400 truncate w-full text-center">
                {prog.completed ? `✓ Done` : prog.unlocked ? `Open` : `Locked`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Back Button */}
      <div className="pt-2 border-t border-slate-800 w-full">
        <button
          onClick={() => {
            audioEngine.playClick();
            onBackToHome();
          }}
          className="btn-comic w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-display font-semibold text-xs border border-slate-700 cursor-pointer"
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};
