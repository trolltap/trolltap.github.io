/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Grid, Trophy, BarChart2, Settings, HelpCircle, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { MascotImp } from '../MascotImp';
import { TrollMeter } from '../TrollMeter';
import { MascotReaction, MascotSkin, PlayerStats } from '../../types/game';
import { audioEngine } from '../../services/audioEngine';

interface HomeScreenProps {
  stats: PlayerStats;
  currentUnlockedLevel: number;
  onStartGame: () => void;
  onOpenLevels: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPlayablesActive?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  currentUnlockedLevel,
  onStartGame,
  onOpenLevels,
  onOpenStats,
  onOpenSettings,
  onOpenHowToPlay,
  soundEnabled,
  onToggleSound,
  isPlayablesActive = false,
}) => {
  const [mascotReaction, setMascotReaction] = useState<MascotReaction>('smug');

  const pokeMascot = () => {
    audioEngine.playBoing();
    const reactions: MascotReaction[] = ['laugh', 'shock', 'rage', 'wink', 'smug'];
    const next = reactions[Math.floor(Math.random() * reactions.length)];
    setMascotReaction(next);
    setTimeout(() => setMascotReaction('smug'), 1400);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 max-w-md mx-auto select-none">
      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between gap-2 pt-2">
        <TrollMeter
          points={stats.trollPoints}
          compact
          onOpenVault={onOpenStats}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onToggleSound();
              audioEngine.playClick();
            }}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
          <button
            onClick={() => {
              audioEngine.playClick();
              onOpenSettings();
            }}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Centerpiece: Bespoke Title Lockup & Mascot Imp */}
      <div className="flex flex-col items-center text-center my-auto w-full">
        {/* Animated Mascot */}
        <div
          onClick={pokeMascot}
          className="cursor-pointer group relative p-2"
          title="Poke the Imp!"
        >
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider shadow-md animate-bounce">
            Poke Me!
          </div>
          <MascotImp
            reaction={mascotReaction}
            skin={stats.activeSkin}
            size="xl"
            animated
          />
        </div>

        {/* Title Lockup */}
        <div className="mt-2">
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-white drop-shadow-md">
            TROLL<span className="text-amber-400">TAP</span>
          </h1>
          <p className="font-display text-sm sm:text-base text-amber-300/90 font-semibold tracking-wide mt-1">
            Think. Tap. Get Trolled.
          </p>
        </div>

        {/* Platform Indicator */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{isPlayablesActive ? 'YouTube Playables Mode' : 'Standalone Web Mode'}</span>
        </div>
      </div>

      {/* Main Menu Action Buttons */}
      <div className="w-full flex flex-col gap-2.5 pb-2">
        <button
          onClick={() => {
            audioEngine.playPop();
            onStartGame();
          }}
          className="btn-comic w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-display font-bold text-lg uppercase tracking-wider border-2 border-amber-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-950/30"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>Play Level {currentUnlockedLevel}</span>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              audioEngine.playClick();
              onOpenLevels();
            }}
            className="btn-comic py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 font-display font-semibold text-xs border border-slate-700 flex flex-col items-center gap-1 cursor-pointer"
          >
            <Grid className="w-4 h-4 text-cyan-400" />
            <span>Levels (20)</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              onOpenStats();
            }}
            className="btn-comic py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 font-display font-semibold text-xs border border-slate-700 flex flex-col items-center gap-1 cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Vault & Skins</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playClick();
              onOpenHowToPlay();
            }}
            className="btn-comic py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 font-display font-semibold text-xs border border-slate-700 flex flex-col items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>How To Play</span>
          </button>
        </div>

        {/* Flat control hints line */}
        <div className="text-center text-[10px] text-slate-400 font-mono pt-1">
          Space / Enter to Start · Esc Pause · R Quick Retry
        </div>
      </div>
    </div>
  );
};
