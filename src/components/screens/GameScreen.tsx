/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Pause,
  Lightbulb,
  ArrowLeft,
  Star,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { LevelDefinition, LevelProgress, MascotReaction, MascotSkin, PlayerStats } from '../../types/game';
import { MascotImp } from '../MascotImp';
import { TrollMeter } from '../TrollMeter';
import { PuzzleStage } from '../PuzzleStage';
import { audioEngine } from '../../services/audioEngine';

interface GameScreenProps {
  level: LevelDefinition;
  levelProgress: LevelProgress;
  stats: PlayerStats;
  totalLevels: number;
  onWinLevel: (levelId: number, attempts: number) => void;
  onFailLevel: (levelId: number) => void;
  onNextLevel: () => void;
  onBackToLevels: () => void;
  onBackToHome: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  level,
  levelProgress,
  stats,
  totalLevels,
  onWinLevel,
  onFailLevel,
  onNextLevel,
  onBackToLevels,
  onBackToHome,
  soundEnabled,
  onToggleSound,
}) => {
  // Game state
  const [attemptsThisSession, setAttemptsThisSession] = useState(1);
  const [stageKey, setStageKey] = useState(0); // increment to reset puzzle
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'FAILED' | 'PAUSED'>('PLAYING');
  const [failReason, setFailReason] = useState<string>('');
  const [mascotReaction, setMascotReaction] = useState<MascotReaction>('smug');
  const [mascotDialogue, setMascotDialogue] = useState<string>('Go ahead, make a move...');
  const [showHintModal, setShowHintModal] = useState(false);

  // Reset stage
  const resetStage = useCallback(() => {
    setGameState('PLAYING');
    setFailReason('');
    setStageKey((k) => k + 1);
    setMascotReaction('smug');
    setMascotDialogue('Go ahead, make a move...');
  }, []);

  // Handle Win
  const handleWin = useCallback(() => {
    setGameState('WON');
    setMascotReaction('shock');
    setMascotDialogue(level.winExplanation);
    onWinLevel(level.id, attemptsThisSession);
  }, [level, attemptsThisSession, onWinLevel]);

  // Handle Fail
  const handleFail = useCallback(
    (customReason?: string) => {
      setGameState('FAILED');
      setAttemptsThisSession((a) => a + 1);
      setFailReason(customReason || level.trollTrapExplanation);
      setMascotReaction('laugh');
      setMascotDialogue(level.trollTrapExplanation);
      onFailLevel(level.id);
    },
    [level, onFailLevel]
  );

  // Keyboard controls: R = Retry, Space/Enter = Win Continue or Retry, Esc = Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (gameState !== 'PLAYING') {
          audioEngine.playPop();
          resetStage();
        }
      } else if (e.key === 'Escape') {
        setGameState((curr) => (curr === 'PAUSED' ? 'PLAYING' : 'PAUSED'));
      } else if (e.key === ' ' || e.key === 'Enter') {
        if (gameState === 'FAILED') {
          audioEngine.playPop();
          resetStage();
        } else if (gameState === 'WON') {
          audioEngine.playPop();
          onNextLevel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, resetStage, onNextLevel]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-3 sm:p-4 max-w-md mx-auto select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* TOP HUD BAR */}
      {/* ========================================================================= */}
      <header className="w-full flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              audioEngine.playClick();
              onBackToLevels();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Level Select"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[11px] font-mono text-slate-400">
              STAGE {String(level.id).padStart(2, '0')} / {totalLevels}
            </div>
            <div className="text-xs font-display font-bold text-white truncate max-w-[120px]">
              {level.title}
            </div>
          </div>
        </div>

        {/* Compact Troll Meter */}
        <TrollMeter points={stats.trollPoints} compact />

        <div className="flex items-center gap-1">
          {/* Hint Button */}
          <button
            onClick={() => {
              audioEngine.playClick();
              setShowHintModal(true);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 hover:bg-slate-800 cursor-pointer"
            title="Hint"
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          {/* Quick Restart */}
          <button
            onClick={() => {
              audioEngine.playPop();
              resetStage();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Retry (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Pause */}
          <button
            onClick={() => {
              audioEngine.playClick();
              setGameState('PAUSED');
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Pause (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* PUZZLE INSTRUCTION CARD */}
      {/* ========================================================================= */}
      <div className="w-full my-2 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center justify-between gap-3 z-10">
        <div className="flex-1">
          <div className="text-[10px] font-display font-bold uppercase tracking-wider text-amber-400">
            Puzzle Objective
          </div>
          <div className="text-sm sm:text-base font-display font-bold text-white leading-snug mt-0.5">
            {level.instruction}
          </div>
        </div>
        <div className="shrink-0 p-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono">
          #{level.id}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE INTERACTIVE PUZZLE STAGE */}
      {/* ========================================================================= */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[300px]">
        <PuzzleStage
          key={`${level.id}-${stageKey}`}
          levelId={level.id}
          onWin={handleWin}
          onFail={handleFail}
          onTrollPenalty={() => {
            // troll penalty adds +10 to troll meter
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* MASCOT DIALOGUE & REACTION STRIP */}
      {/* ========================================================================= */}
      <div className="w-full p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex items-center gap-3 z-10">
        <MascotImp
          reaction={mascotReaction}
          skin={stats.activeSkin}
          size="sm"
          animated
        />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-display font-bold uppercase tracking-wider text-amber-400">
            Impish:
          </div>
          <div className="text-xs text-slate-200 italic truncate font-sans">
            "{mascotDialogue}"
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-400 shrink-0">
          Try #{attemptsThisSession}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WIN MODAL OVERLAY */}
      {/* ========================================================================= */}
      {gameState === 'WON' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 animate-comic-pop">
          <div className="w-full max-w-xs p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/50 shadow-2xl flex flex-col items-center text-center">
            {/* Stars */}
            <div className="flex gap-1.5 mb-2 text-amber-400">
              <Star className="w-6 h-6 fill-amber-400 animate-bounce" />
              <Star className="w-6 h-6 fill-amber-400 animate-bounce delay-100" />
              <Star
                className={`w-6 h-6 ${
                  attemptsThisSession <= 2 ? 'fill-amber-400 animate-bounce delay-200' : 'text-slate-600'
                }`}
              />
            </div>

            <h2 className="font-display font-bold text-2xl text-emerald-400 uppercase tracking-tight">
              GENIUS MOVE!
            </h2>
            <p className="text-xs text-slate-300 mt-1 mb-4 leading-relaxed font-sans">
              {level.winExplanation}
            </p>

            <MascotImp
              reaction="shock"
              skin={stats.activeSkin}
              size="md"
              animated
            />

            <div className="text-[11px] text-amber-300/80 font-mono mt-3 mb-4">
              Solved in {attemptsThisSession} {attemptsThisSession === 1 ? 'try' : 'tries'}!
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => {
                  audioEngine.playPop();
                  onNextLevel();
                }}
                className="btn-comic w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-display font-bold text-base uppercase tracking-wider border-2 border-emerald-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>{level.id < totalLevels ? 'Next Level ➔' : 'Finish Campaign!'}</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  onBackToLevels();
                }}
                className="btn-comic w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer"
              >
                Level Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FAIL / TROLLED MODAL OVERLAY */}
      {/* ========================================================================= */}
      {gameState === 'FAILED' && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 animate-comic-pop">
          <div className="w-full max-w-xs p-6 rounded-3xl bg-slate-900 border-2 border-rose-500/60 shadow-2xl flex flex-col items-center text-center">
            <div className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-display font-bold text-xs uppercase tracking-wider mb-2 animate-pulse">
              🔥 You Got Trolled!
            </div>

            <h2 className="font-display font-bold text-3xl text-rose-400 uppercase tracking-tight">
              TOO EASY!
            </h2>
            <p className="text-xs text-slate-300 mt-1 mb-3 leading-relaxed font-sans">
              {failReason}
            </p>

            <MascotImp
              reaction="laugh"
              skin={stats.activeSkin}
              size="md"
              animated
            />

            {/* Troll Points Reward for falling for trick */}
            <div className="mt-3 mb-4 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>+10 Troll Meter Points!</span>
            </div>

            <button
              onClick={() => {
                audioEngine.playPop();
                resetStage();
              }}
              className="btn-comic w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-display font-bold text-base uppercase tracking-wider border-2 border-rose-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Instant Retry (Space / R)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAUSE MODAL */}
      {/* ========================================================================= */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 animate-comic-pop">
          <div className="w-full max-w-xs p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col items-center text-center">
            <h2 className="font-display font-bold text-2xl text-white uppercase tracking-wider mb-4">
              Game Paused
            </h2>

            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={() => {
                  audioEngine.playClick();
                  setGameState('PLAYING');
                }}
                className="btn-comic w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-display font-bold text-sm uppercase tracking-wider border border-amber-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Resume Game</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playPop();
                  resetStage();
                }}
                className="btn-comic w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Level</span>
              </button>

              <button
                onClick={() => {
                  onToggleSound();
                  audioEngine.playClick();
                }}
                className="btn-comic w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                <span>{soundEnabled ? 'Mute Sound' : 'Enable Sound'}</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  onBackToLevels();
                }}
                className="btn-comic w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 cursor-pointer"
              >
                Level Select
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  onBackToHome();
                }}
                className="btn-comic w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs border border-slate-700 cursor-pointer"
              >
                Exit to Title
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HINT MODAL */}
      {/* ========================================================================= */}
      {showHintModal && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-6 animate-comic-pop">
          <div className="w-full max-w-xs p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 mb-2">
              <Lightbulb className="w-6 h-6 fill-amber-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">
              Troll Clue
            </h3>
            <p className="text-xs text-amber-200/90 leading-relaxed font-sans mb-4">
              "{level.hint}"
            </p>
            <button
              onClick={() => {
                audioEngine.playClick();
                setShowHintModal(false);
              }}
              className="btn-comic w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-display font-bold text-xs border border-amber-300 cursor-pointer"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
