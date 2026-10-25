/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Trophy, Flame, Zap, Award, Sparkles, Check, Lock } from 'lucide-react';
import { MascotSkin, PlayerStats } from '../../types/game';
import { MascotImp } from '../MascotImp';
import { audioEngine } from '../../services/audioEngine';

interface StatsScreenProps {
  stats: PlayerStats;
  totalLevels: number;
  onSelectSkin: (skin: MascotSkin) => void;
  onBackToHome: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({
  stats,
  totalLevels,
  onSelectSkin,
  onBackToHome,
}) => {
  const skins: { id: MascotSkin; name: string; requiredPoints: number; desc: string }[] = [
    { id: 'classic', name: 'Classic Imp', requiredPoints: 0, desc: 'Original mischievous violet trickster.' },
    { id: 'fancy', name: 'Fancy Imp', requiredPoints: 20, desc: 'Top hat, monocle, and snazzy red bowtie.' },
    { id: 'cyber', name: 'Cyber Imp', requiredPoints: 50, desc: 'Neon green visor and holographic horns.' },
    { id: 'king', name: 'King Imp', requiredPoints: 80, desc: 'Golden crown and royal sovereign aura.' },
  ];

  const trophies = [
    { id: 'troll_initiate', title: 'Troll Initiate', desc: 'Fall for your first comic trap.', unlocked: stats.totalTrollsSuffered >= 1 },
    { id: 'troll_connoisseur', title: 'Troll Connoisseur', desc: 'Amass 50 points in the Troll Meter.', unlocked: stats.trollPoints >= 50 },
    { id: 'big_brain', title: 'Halfway Genius', desc: 'Clear 10 handcrafted levels.', unlocked: stats.completedLevels >= 10 },
    { id: 'king_slayer', title: 'Troll King Slayer', desc: 'Beat the Level 20 Troll King Showdown!', unlocked: stats.completedLevels >= 20 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 max-w-md mx-auto select-none overflow-hidden">
      {/* Header */}
      <header className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
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
          <h2 className="font-display font-bold text-lg text-white">Trophy Vault & Stats</h2>
          <div className="text-[11px] font-mono text-slate-400">Player Record & Cosmetics</div>
        </div>

        <div className="w-8" />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Troll Points</div>
              <div className="text-lg font-mono font-bold text-amber-400 tabular-nums">
                {stats.trollPoints}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Solved</div>
              <div className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                {stats.completedLevels} / {totalLevels}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Best Streak</div>
              <div className="text-lg font-mono font-bold text-cyan-400 tabular-nums">
                {stats.bestStreak}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Total Attempts</div>
              <div className="text-lg font-mono font-bold text-rose-400 tabular-nums">
                {stats.totalAttempts}
              </div>
            </div>
          </div>
        </div>

        {/* Mascot Skin Wardrobe */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Impish Skin Wardrobe</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Unlocks via Troll Meter
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {skins.map((skin) => {
              const isUnlocked = stats.trollPoints >= skin.requiredPoints;
              const isSelected = stats.activeSkin === skin.id;

              return (
                <button
                  key={skin.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isUnlocked) {
                      audioEngine.playPop();
                      onSelectSkin(skin.id);
                    }
                  }}
                  className={`btn-comic p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all text-left ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-400 shadow-md shadow-amber-950/30'
                      : isUnlocked
                      ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500 cursor-pointer'
                      : 'bg-slate-900/50 border-slate-800/60 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <MascotImp
                    reaction="smug"
                    skin={skin.id}
                    size="sm"
                    animated={false}
                  />
                  <div className="w-full text-center">
                    <div className="text-xs font-display font-bold text-white flex items-center justify-center gap-1">
                      {skin.name}
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      {!isUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {isUnlocked
                        ? isSelected
                          ? 'Equipped'
                          : 'Select'
                        : `${skin.requiredPoints} Pts`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trophy Badges */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="text-xs font-display font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <Trophy className="w-4 h-4" />
            <span>Trophies</span>
          </div>

          <div className="space-y-2">
            {trophies.map((t) => (
              <div
                key={t.id}
                className={`p-2.5 rounded-xl border flex items-center gap-3 ${
                  t.unlocked
                    ? 'bg-amber-950/20 border-amber-500/40 text-slate-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    t.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-display font-bold flex items-center gap-1.5">
                    <span>{t.title}</span>
                    {t.unlocked && <span className="text-[10px] text-amber-400 font-mono">✓</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans truncate">
                    {t.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
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
