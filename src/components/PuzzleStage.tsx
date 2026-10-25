/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Key,
  Lock,
  Apple,
  Cake,
  Flame,
  ArrowRight,
  Shield,
  Lightbulb,
  Check,
  X,
  Volume2,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface PuzzleStageProps {
  levelId: number;
  onWin: () => void;
  onFail: (customReason?: string) => void;
  onTrollPenalty: () => void;
  instructionRef?: React.RefObject<HTMLDivElement | null>;
  trollMeterRef?: React.RefObject<HTMLDivElement | null>;
}

export const PuzzleStage: React.FC<PuzzleStageProps> = ({
  levelId,
  onWin,
  onFail,
  onTrollPenalty,
}) => {
  // Common states used across levels
  const [levelTimer, setLevelTimer] = useState<number>(0);
  const isResolvedRef = useRef(false);

  useEffect(() => {
    isResolvedRef.current = false;
  }, [levelId]);

  const triggerWin = useCallback(() => {
    if (isResolvedRef.current) return;
    isResolvedRef.current = true;
    audioEngine.playFanfare();
    // Defer callback so it never executes during a component's render or state calculation phase
    setTimeout(() => {
      onWin();
    }, 0);
  }, [onWin]);

  const triggerFail = useCallback(
    (reason?: string) => {
      if (isResolvedRef.current) return;
      isResolvedRef.current = true;
      audioEngine.playBuzzer();
      audioEngine.playTrollLaugh();
      setTimeout(() => {
        onTrollPenalty();
        onFail(reason);
      }, 0);
    },
    [onFail, onTrollPenalty]
  );

  // ----------------------------------------------------
  // LEVEL 1: Don't Touch The Red Button!
  // ----------------------------------------------------
  const [l1Countdown, setL1Countdown] = useState(3);
  const l1TimeRef = useRef(3);
  useEffect(() => {
    if (levelId !== 1) return;
    l1TimeRef.current = 3;
    setL1Countdown(3);
    const interval = setInterval(() => {
      l1TimeRef.current -= 1;
      setL1Countdown(l1TimeRef.current);
      if (l1TimeRef.current <= 0) {
        clearInterval(interval);
      } else {
        audioEngine.playTick();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [levelId]);

  // ----------------------------------------------------
  // LEVEL 2: Catch The Golden Key
  // ----------------------------------------------------
  const [l2KeyPos, setL2KeyPos] = useState({ x: 50, y: 45 });
  const [l2LockPos, setL2LockPos] = useState({ x: 18, y: 70 });
  const [l2IsDraggingLock, setL2IsDraggingLock] = useState(false);

  const dodgeKey = () => {
    audioEngine.playSlideWhistle(true);
    setL2KeyPos({
      x: 20 + Math.random() * 60,
      y: 25 + Math.random() * 45,
    });
  };

  // ----------------------------------------------------
  // LEVEL 3: Feed The Hungry Imp
  // ----------------------------------------------------
  const [l3FoodPos, setL3FoodPos] = useState({ x: 50, y: 72 });
  const [l3Dragging, setL3Dragging] = useState(false);

  // ----------------------------------------------------
  // LEVEL 4: Exit Is On The Right ->
  // ----------------------------------------------------
  const [l4WallOffset, setL4WallOffset] = useState(0); // 0% to -80%

  // ----------------------------------------------------
  // LEVEL 5: Paint Them All Yellow
  // ----------------------------------------------------
  const [l5Shapes, setL5Shapes] = useState({ triangle: false, circle: false, square: true });
  const [l5BucketPos, setL5BucketPos] = useState({ x: 80, y: 80 });

  // ----------------------------------------------------
  // LEVEL 6: Defuse Bomb in 5 Seconds
  // ----------------------------------------------------
  const [l6BombTime, setL6BombTime] = useState(5);
  const [l6Unplugged, setL6Unplugged] = useState(false);
  const l6TimeRef = useRef(5);
  useEffect(() => {
    if (levelId !== 6) return;
    l6TimeRef.current = 5;
    setL6BombTime(5);
    setL6Unplugged(false);
    const interval = setInterval(() => {
      l6TimeRef.current -= 1;
      setL6BombTime(l6TimeRef.current);
      if (l6TimeRef.current <= 0) {
        clearInterval(interval);
        if (!isResolvedRef.current) {
          triggerFail('Time ran out! KABOOM!');
        }
      } else {
        audioEngine.playTick();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [levelId, triggerFail]);

  // ----------------------------------------------------
  // LEVEL 7: Tap by Screen Size
  // ----------------------------------------------------
  const [l7Step, setL7Step] = useState(0);

  // ----------------------------------------------------
  // LEVEL 8: Spot The Difference (Mustache Swipe)
  // ----------------------------------------------------
  const [l8MustacheRemoved, setL8MustacheRemoved] = useState(false);

  // ----------------------------------------------------
  // LEVEL 9: Freeze! Don't Move!
  // ----------------------------------------------------
  const [l9Dodged, setL9Dodged] = useState(false);
  const [l9AnvilY, setL9AnvilY] = useState(-50);
  const l9DodgedRef = useRef(false);
  useEffect(() => {
    if (levelId !== 9) return;
    l9DodgedRef.current = false;
    setL9Dodged(false);
    setL9AnvilY(-50);
    const fallTimer = setTimeout(() => {
      setL9AnvilY(60); // Anvil drops!
    }, 1800);

    const crushCheck = setTimeout(() => {
      if (!l9DodgedRef.current && !isResolvedRef.current) {
        triggerFail('Squashed flat! Survival always overrides the rules!');
      } else if (l9DodgedRef.current && !isResolvedRef.current) {
        triggerWin();
      }
    }, 3200);

    return () => {
      clearTimeout(fallTimer);
      clearTimeout(crushCheck);
    };
  }, [levelId, triggerFail, triggerWin]);

  // ----------------------------------------------------
  // LEVEL 10: Pop All 5 Balloons
  // ----------------------------------------------------
  const [l10Balloons, setL10Balloons] = useState([
    { id: 1, popped: false, color: 'bg-rose-500' },
    { id: 2, popped: false, color: 'bg-sky-500' },
    { id: 3, popped: false, color: 'bg-amber-500' },
    { id: 4, popped: false, color: 'bg-emerald-500' },
    { id: 5, popped: false, isSteel: true, color: 'bg-slate-400' },
  ]);
  const [l10PinPos, setL10PinPos] = useState({ x: 85, y: 15 });

  // ----------------------------------------------------
  // LEVEL 11: Which Way is Up? (Compass)
  // ----------------------------------------------------
  const [l11Rotation, setL11Rotation] = useState(90);

  // ----------------------------------------------------
  // LEVEL 12: Stuck 99% Download
  // ----------------------------------------------------
  const [l12Progress, setL12Progress] = useState(99);

  // ----------------------------------------------------
  // LEVEL 13: Turn Off The Lights
  // ----------------------------------------------------
  const [l13BulbRemoved, setL13BulbRemoved] = useState(false);

  // ----------------------------------------------------
  // LEVEL 14: Pick The Winner (Turtle vs Cheetah)
  // ----------------------------------------------------
  const [l14FinishLineX, setL14FinishLineX] = useState(85);
  const [l14RaceRunning, setL14RaceRunning] = useState(false);
  const [l14TurtleX, setL14TurtleX] = useState(15);
  const [l14CheetahX, setL14CheetahX] = useState(15);

  // ----------------------------------------------------
  // LEVEL 15: Tap 10 Times Fast
  // ----------------------------------------------------
  const [l15Taps, setL15Taps] = useState(0);
  const [l15Relocated, setL15Relocated] = useState(false);
  const [l15CanTapTen, setL15CanTapTen] = useState(false);

  // ----------------------------------------------------
  // LEVEL 16: Crack The Safe (Code 7-3-9-1)
  // ----------------------------------------------------
  const [l16Entered, setL16Entered] = useState<string>('');
  const [l16NoteMoved, setL16NoteMoved] = useState(false);

  // ----------------------------------------------------
  // LEVEL 17: Balance The Seesaw
  // ----------------------------------------------------
  const [l17Balanced, setL17Balanced] = useState(false);

  // ----------------------------------------------------
  // LEVEL 18: Dark Room Flashlight
  // ----------------------------------------------------
  const [l18Flashlight, setL18Flashlight] = useState({ x: 50, y: 50 });
  const [l18FrameTilted, setL18FrameTilted] = useState(false);

  // ----------------------------------------------------
  // LEVEL 20: Troll King Showdown (3 Phases)
  // ----------------------------------------------------
  const [l20Phase, setL20Phase] = useState<1 | 2 | 3>(1);
  const [l20ShieldPos, setL20ShieldPos] = useState({ x: 50, y: 75 });
  const [l20BlastFiring, setL20BlastFiring] = useState(false);

  // Drag utility handler
  const handleTouchOrMouseMove = (e: React.MouseEvent | React.TouchEvent, cb: (x: number, y: number) => void) => {
    const target = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const px = ((clientX - target.left) / target.width) * 100;
    const py = ((clientY - target.top) / target.height) * 100;
    cb(Math.max(0, Math.min(100, px)), Math.max(0, Math.min(100, py)));
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* ========================================================================= */}
      {/* LEVEL 1: Don't Touch The Red Button! */}
      {/* ========================================================================= */}
      {levelId === 1 && (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-xs animate-comic-pop">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">Safety Lock:</span>
            <div className="text-2xl font-mono font-bold text-amber-400">
              {l1Countdown > 0 ? `00:0${l1Countdown}` : 'UNLOCKED!'}
            </div>
          </div>

          {l1Countdown > 0 ? (
            <button
              onClick={() => triggerFail('You pressed the red button before the timer expired!')}
              className="btn-comic w-48 h-48 rounded-full bg-gradient-to-b from-rose-500 to-red-700 text-white font-display font-bold text-xl uppercase tracking-wider border-4 border-red-950 flex flex-col items-center justify-center gap-2 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <Flame className="w-10 h-10 fill-white text-white animate-pulse" />
              <span>DO NOT TAP</span>
            </button>
          ) : (
            <button
              onClick={() => triggerWin()}
              className="btn-comic w-48 h-48 rounded-full bg-gradient-to-b from-emerald-400 to-green-600 text-white font-display font-bold text-xl uppercase tracking-wider border-4 border-emerald-950 flex flex-col items-center justify-center gap-2 shadow-2xl cursor-pointer hover:scale-105 animate-comic-shake"
            >
              <Check className="w-12 h-12 stroke-[3]" />
              <span>TAP ME NOW!</span>
            </button>
          )}

          <div className="text-xs text-slate-400 text-center">
            {l1Countdown > 0 ? 'Wait for the safe signal...' : 'The button is now green and safe!'}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: Catch The Golden Key */}
      {/* ========================================================================= */}
      {levelId === 2 && (
        <div
          className="relative w-full h-80 rounded-2xl bg-slate-900/60 border border-slate-800 p-4"
          onMouseMove={(e) => {
            if (l2IsDraggingLock) {
              handleTouchOrMouseMove(e, (x, y) => {
                setL2LockPos({ x, y });
                // Check if lock overlaps key
                const dx = Math.abs(x - l2KeyPos.x);
                const dy = Math.abs(y - l2KeyPos.y);
                if (dx < 12 && dy < 12) {
                  triggerWin();
                }
              });
            }
          }}
          onTouchMove={(e) => {
            if (l2IsDraggingLock) {
              handleTouchOrMouseMove(e, (x, y) => {
                setL2LockPos({ x, y });
                const dx = Math.abs(x - l2KeyPos.x);
                const dy = Math.abs(y - l2KeyPos.y);
                if (dx < 12 && dy < 12) {
                  triggerWin();
                }
              });
            }
          }}
          onTouchEnd={() => setL2IsDraggingLock(false)}
          onMouseUp={() => setL2IsDraggingLock(false)}
        >
          {/* Dodging Key */}
          <div
            style={{ left: `${l2KeyPos.x}%`, top: `${l2KeyPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-150 ease-out p-3 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50"
            onMouseEnter={dodgeKey}
            onTouchStart={dodgeKey}
            onClick={() => {
              dodgeKey();
              audioEngine.playBuzzer();
            }}
          >
            <Key className="w-8 h-8 fill-amber-400 text-amber-300" />
          </div>

          {/* Draggable Lock */}
          <div
            style={{ left: `${l2LockPos.x}%`, top: `${l2LockPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-4 rounded-2xl bg-indigo-600 text-white border-2 border-indigo-400 shadow-xl flex flex-col items-center gap-1 select-none touch-none"
            onMouseDown={() => {
              audioEngine.playBoing();
              setL2IsDraggingLock(true);
            }}
            onTouchStart={() => {
              audioEngine.playBoing();
              setL2IsDraggingLock(true);
            }}
          >
            <Lock className="w-8 h-8" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Drag Me</span>
          </div>

          <div className="absolute bottom-3 inset-x-0 text-center text-xs text-slate-400 pointer-events-none">
            The key dodges your fingers! Bring the lock TO the key!
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: Feed The Hungry Imp */}
      {/* ========================================================================= */}
      {levelId === 3 && (
        <div
          className="relative w-full h-80 flex flex-col items-center justify-between p-4"
          onMouseMove={(e) => {
            if (l3Dragging) {
              handleTouchOrMouseMove(e, (x, y) => {
                setL3FoodPos({ x, y });
                // If dragged near the top instruction area (y < 25)
                if (y < 22) {
                  triggerWin();
                }
              });
            }
          }}
          onTouchMove={(e) => {
            if (l3Dragging) {
              handleTouchOrMouseMove(e, (x, y) => {
                setL3FoodPos({ x, y });
                if (y < 22) {
                  triggerWin();
                }
              });
            }
          }}
          onMouseUp={() => setL3Dragging(false)}
          onTouchEnd={() => setL3Dragging(false)}
        >
          {/* Target: The word "Imp" in the instruction zone */}
          <div className="p-3 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 text-amber-300 font-display font-bold text-sm text-center">
            Word Target: [Imp]
          </div>

          {/* Deceptive Imp Mascot in Center */}
          <div
            onClick={() => {
              audioEngine.playBuzzer();
              triggerFail("Impish doesn't want you to tap him directly!");
            }}
            className="p-4 rounded-full bg-purple-900/40 border border-purple-500/30 cursor-pointer text-center"
          >
            <div className="text-3xl">😈</div>
            <div className="text-[10px] text-purple-300 mt-1">Impish (Hungry)</div>
          </div>

          {/* Draggable Cake Slice */}
          <div
            style={{ left: `${l3FoodPos.x}%`, top: `${l3FoodPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-3 rounded-2xl bg-rose-600 text-white shadow-xl flex items-center gap-2 select-none touch-none border border-rose-400"
            onMouseDown={() => {
              audioEngine.playBoing();
              setL3Dragging(true);
            }}
            onTouchStart={() => {
              audioEngine.playBoing();
              setL3Dragging(true);
            }}
          >
            <Cake className="w-8 h-8" />
            <span className="text-xs font-bold">Tasty Cake</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 4: Exit Is On The Right -> */}
      {/* ========================================================================= */}
      {levelId === 4 && (
        <div className="relative w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
          {/* Sliding wall */}
          <div
            style={{ transform: `translateX(${l4WallOffset}%)` }}
            className="absolute inset-0 bg-slate-800 p-6 flex flex-col items-center justify-center gap-4 transition-transform duration-200"
          >
            <div className="text-lg font-display font-bold text-slate-200">Corridor Waypoint</div>
            <button
              onClick={() => triggerFail('A brick wall collapsed! The sign pointed into a dead end!')}
              className="btn-comic px-6 py-4 rounded-2xl bg-emerald-600 text-white font-display font-bold text-lg flex items-center gap-3 border-2 border-emerald-400 cursor-pointer"
            >
              <span>EXIT DOOR</span>
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </button>

            {/* Slider hint */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-slate-400">Slide wall to the left:</span>
              <button
                onClick={() => {
                  audioEngine.playSlideWhistle(false);
                  setL4WallOffset(-80);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-amber-300 font-bold border border-slate-600 cursor-pointer"
              >
                ◀ Slide Left
              </button>
            </div>
          </div>

          {/* Hidden Exit behind the wall */}
          <div className="absolute right-6 flex flex-col items-center gap-2">
            <button
              onClick={() => triggerWin()}
              className="btn-comic p-6 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-display font-bold text-lg border-2 border-amber-300 shadow-2xl cursor-pointer hover:scale-105"
            >
              <div className="text-3xl mb-1">🚪✨</div>
              <span>REAL EXIT!</span>
            </button>
            <span className="text-[11px] text-amber-400 font-mono">Found secret path!</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 5: Paint Them All Yellow! */}
      {/* ========================================================================= */}
      {levelId === 5 && (
        <div
          className="relative w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between"
          onMouseMove={(e) => {
            handleTouchOrMouseMove(e, (x, y) => {
              // If bucket is dragged near shapes, paint them
              if (y < 45) {
                if (x < 35) setL5Shapes((s) => ({ ...s, triangle: true }));
                else if (x < 65) setL5Shapes((s) => ({ ...s, circle: true }));
                else setL5Shapes((s) => ({ ...s, square: true }));

                // Check win condition
                if (l5Shapes.triangle && l5Shapes.circle && l5Shapes.square) {
                  triggerWin();
                }
              }
            });
          }}
          onTouchMove={(e) => {
            handleTouchOrMouseMove(e, (x, y) => {
              if (y < 45) {
                if (x < 35) setL5Shapes((s) => ({ ...s, triangle: true }));
                else if (x < 65) setL5Shapes((s) => ({ ...s, circle: true }));
                else setL5Shapes((s) => ({ ...s, square: true }));

                if (l5Shapes.triangle && l5Shapes.circle && l5Shapes.square) {
                  triggerWin();
                }
              }
            });
          }}
        >
          {/* 3 Shapes */}
          <div className="flex items-center justify-around w-full mt-4">
            {/* Triangle */}
            <div
              onClick={() => {
                audioEngine.playPop();
                setL5Shapes((s) => ({ ...s, triangle: !s.triangle, circle: !s.circle }));
              }}
              className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-sm cursor-pointer border-2 transition-colors ${
                l5Shapes.triangle
                  ? 'bg-yellow-400 text-slate-900 border-yellow-200'
                  : 'bg-blue-600 text-white border-blue-400'
              }`}
            >
              ▲
            </div>

            {/* Circle */}
            <div
              onClick={() => {
                audioEngine.playPop();
                setL5Shapes((s) => ({ ...s, circle: !s.circle, square: !s.square }));
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer border-2 transition-colors ${
                l5Shapes.circle
                  ? 'bg-yellow-400 text-slate-900 border-yellow-200'
                  : 'bg-rose-600 text-white border-rose-400'
              }`}
            >
              ●
            </div>

            {/* Square */}
            <div
              onClick={() => {
                audioEngine.playPop();
                setL5Shapes((s) => ({ ...s, square: !s.square, triangle: !s.triangle }));
              }}
              className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer border-2 transition-colors ${
                l5Shapes.square
                  ? 'bg-yellow-400 text-slate-900 border-yellow-200'
                  : 'bg-purple-600 text-white border-purple-400'
              }`}
            >
              ■
            </div>
          </div>

          {/* Yellow Paint Bucket */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                audioEngine.playPop();
                setL5Shapes({ triangle: true, circle: true, square: true });
                triggerWin();
              }}
              className="btn-comic p-4 rounded-2xl bg-amber-400 text-slate-950 font-display font-bold flex items-center gap-3 border-2 border-amber-300 shadow-lg cursor-pointer"
            >
              <div className="text-2xl">🪣🎨</div>
              <span>USE YELLOW PAINT BUCKET</span>
            </button>
            <span className="text-xs text-slate-400 mt-2">
              Sweep over shapes or tap to pour!
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 6: Defuse In 5 Seconds! */}
      {/* ========================================================================= */}
      {levelId === 6 && (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-xs">
          {/* Bomb Visual */}
          <div className="relative p-6 rounded-3xl bg-slate-900 border-2 border-slate-700 flex flex-col items-center shadow-2xl">
            <div className="text-xs font-mono uppercase text-slate-400">Bomb Timer</div>
            <div className="text-4xl font-mono font-bold text-rose-500 animate-pulse my-2">
              00:0{l6BombTime}
            </div>

            {/* Wires */}
            <div className="flex gap-4 my-3">
              <button
                onClick={() => triggerFail('You cut the RED wire! KABOOM!')}
                className="w-8 h-20 rounded-full bg-rose-500 border-2 border-rose-300 cursor-pointer hover:opacity-80 active:scale-95"
                title="Red Wire"
              />
              <button
                onClick={() => triggerFail('You cut the SKY BLUE wire! Night sky is dark! KABOOM!')}
                className="w-8 h-20 rounded-full bg-sky-400 border-2 border-sky-200 cursor-pointer hover:opacity-80 active:scale-95"
                title="Sky Blue Wire"
              />
              <button
                onClick={() => triggerFail('Dark navy was close, but wire cutting triggered the fuse!')}
                className="w-8 h-20 rounded-full bg-slate-950 border-2 border-slate-600 cursor-pointer hover:opacity-80 active:scale-95"
                title="Dark Wire"
              />
            </div>

            {/* Power Cord Plugged In */}
            <div className="mt-2 flex flex-col items-center">
              <button
                onClick={() => {
                  audioEngine.playPop();
                  setL6Unplugged(true);
                  triggerWin();
                }}
                className="btn-comic px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs border border-amber-300 flex items-center gap-2 cursor-pointer"
              >
                <span>🔌 PULL OUT WALL PLUG</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 7: Tap From Smallest to Largest (By Screen Size!) */}
      {/* ========================================================================= */}
      {levelId === 7 && (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm">
          <div className="text-xs font-mono text-amber-400">
            Step: {l7Step} / 3 creatures selected
          </div>

          <div className="flex items-end justify-around w-full gap-2">
            {/* 1. Giant Ant (140px) */}
            <button
              onClick={() => {
                if (l7Step === 2) {
                  audioEngine.playPop();
                  triggerWin();
                } else {
                  triggerFail('Real ants are small, but this ant is HUGE on your screen!');
                }
              }}
              className="btn-comic flex flex-col items-center p-3 rounded-2xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-amber-400"
            >
              <div className="text-6xl">🐜</div>
              <span className="text-[11px] font-bold text-slate-300 mt-2">ANT</span>
              <span className="text-[9px] font-mono text-slate-500">140px Screen Size</span>
            </button>

            {/* 2. Medium Dog (70px) */}
            <button
              onClick={() => {
                if (l7Step === 1) {
                  audioEngine.playPop();
                  setL7Step(2);
                } else {
                  triggerFail('Dog is not the smallest on this screen!');
                }
              }}
              className="btn-comic flex flex-col items-center p-3 rounded-2xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-amber-400"
            >
              <div className="text-3xl">🐕</div>
              <span className="text-[11px] font-bold text-slate-300 mt-2">DOG</span>
              <span className="text-[9px] font-mono text-slate-500">70px Screen Size</span>
            </button>

            {/* 3. Tiny Elephant (30px) */}
            <button
              onClick={() => {
                if (l7Step === 0) {
                  audioEngine.playPop();
                  setL7Step(1);
                } else {
                  triggerFail('Elephant was already smallest on screen!');
                }
              }}
              className="btn-comic flex flex-col items-center p-3 rounded-2xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-amber-400"
            >
              <div className="text-sm">🐘</div>
              <span className="text-[11px] font-bold text-slate-300 mt-2">ELEPHANT</span>
              <span className="text-[9px] font-mono text-slate-500">30px Screen Size</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 8: Spot The Difference (Mustache Swipe) */}
      {/* ========================================================================= */}
      {levelId === 8 && (
        <div className="flex items-center justify-center gap-6 w-full max-w-sm">
          {/* Left Imp (Normal) */}
          <div
            onClick={() => triggerFail("Left Imp is genuine! Nothing weird here!")}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center cursor-pointer"
          >
            <div className="text-5xl">😈</div>
            <span className="text-xs text-slate-400 mt-2 font-bold">Imp A</span>
          </div>

          {/* Right Imp (With removable mustache) */}
          <div className="relative p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
            <div className="text-5xl relative">
              😈
              {!l8MustacheRemoved && (
                <button
                  onClick={() => {
                    audioEngine.playSlideWhistle(true);
                    setL8MustacheRemoved(true);
                    triggerWin();
                  }}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 text-2xl hover:scale-125 cursor-pointer select-none"
                  title="Swipe off fake mustache"
                >
                  🥸
                </button>
              )}
            </div>
            <span className="text-xs text-slate-400 mt-2 font-bold">Imp B</span>
            <span className="text-[10px] text-amber-400">Swipe mustache!</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 9: Freeze! Don't Move! */}
      {/* ========================================================================= */}
      {levelId === 9 && (
        <div className="relative w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col items-center justify-between p-4">
          <div className="text-xs font-mono text-rose-400 animate-pulse">
            ⚠️ LASER SWEEP ACTIVE - DO NOT MOVE ⚠️
          </div>

          {/* Falling 16-Ton Anvil */}
          <div
            style={{ top: `${l9AnvilY}%` }}
            className="absolute left-1/2 -translate-x-1/2 text-5xl transition-all duration-700 ease-in pointer-events-none"
          >
            ⚓ 16-TONS
          </div>

          {/* Player avatar that can be dragged or tapped to dodge */}
          <div
            onClick={() => {
              audioEngine.playBoing();
              l9DodgedRef.current = true;
              setL9Dodged(true);
              triggerWin();
            }}
            className={`cursor-pointer transition-transform duration-300 p-4 rounded-2xl bg-amber-500 text-slate-950 font-display font-bold flex flex-col items-center gap-1 ${
              l9Dodged ? 'translate-x-28 bg-emerald-400' : 'animate-comic-shake'
            }`}
          >
            <div className="text-3xl">🏃‍♂️</div>
            <span className="text-xs">DODGE THE ANVIL!</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 10: Pop All 5 Balloons */}
      {/* ========================================================================= */}
      {levelId === 10 && (
        <div
          className="relative w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 p-4"
          onMouseMove={(e) => {
            handleTouchOrMouseMove(e, (x, y) => {
              setL10PinPos({ x, y });
              // Check if pin touches steel balloon (id: 5)
              if (x > 65 && x < 85 && y > 30 && y < 65) {
                audioEngine.playPop();
                setL10Balloons((prev) =>
                  prev.map((b) => (b.id === 5 ? { ...b, popped: true } : b))
                );
                triggerWin();
              }
            });
          }}
          onTouchMove={(e) => {
            handleTouchOrMouseMove(e, (x, y) => {
              setL10PinPos({ x, y });
              if (x > 65 && x < 85 && y > 30 && y < 65) {
                audioEngine.playPop();
                setL10Balloons((prev) =>
                  prev.map((b) => (b.id === 5 ? { ...b, popped: true } : b))
                );
                triggerWin();
              }
            });
          }}
        >
          {/* Balloons */}
          <div className="flex items-center justify-around h-full">
            {l10Balloons.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  if (b.isSteel) {
                    audioEngine.playBuzzer();
                    triggerFail('CLANG! Metal balloon cannot be popped by finger taps!');
                  } else {
                    audioEngine.playPop();
                    setL10Balloons((prev) =>
                      prev.map((item) => (item.id === b.id ? { ...item, popped: true } : item))
                    );
                  }
                }}
                className={`w-14 h-20 rounded-full cursor-pointer flex items-center justify-center font-bold text-white transition-transform ${
                  b.popped ? 'opacity-0 pointer-events-none scale-0' : 'animate-float'
                } ${b.color}`}
              >
                {b.isSteel ? '🔩' : '🎈'}
              </button>
            ))}
          </div>

          {/* Sharp Pin Tool */}
          <div
            style={{ left: `${l10PinPos.x}%`, top: `${l10PinPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs border border-amber-200 cursor-grab active:cursor-grabbing shadow-xl"
          >
            📍 DRAG NEEDLE
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 11: Which Way is Up? (Compass) */}
      {/* ========================================================================= */}
      {levelId === 11 && (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-xs">
          <div className="relative w-48 h-48 rounded-full border-4 border-slate-700 bg-slate-900 flex items-center justify-center shadow-2xl">
            {/* Dial Labels */}
            <span className="absolute top-2 font-mono font-bold text-amber-400">N</span>
            <span className="absolute right-2 font-mono font-bold text-slate-400">E</span>
            <span className="absolute bottom-2 font-mono font-bold text-slate-400">S</span>
            <span className="absolute left-2 font-mono font-bold text-slate-400">W</span>

            {/* Compass Needle (Always points to rotation angle) */}
            <div
              style={{ transform: `rotate(${l11Rotation}deg)` }}
              className="w-1.5 h-36 bg-gradient-to-t from-slate-400 via-rose-500 to-rose-600 rounded-full transition-transform duration-300"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                audioEngine.playClick();
                const next = (l11Rotation - 90 + 360) % 360;
                setL11Rotation(next);
                if (next === 0 || next === 360) triggerWin();
              }}
              className="btn-comic px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-sm border border-slate-700 cursor-pointer"
            >
              ↺ Rotate Left
            </button>
            <button
              onClick={() => {
                audioEngine.playClick();
                const next = (l11Rotation + 90) % 360;
                setL11Rotation(next);
                if (next === 0 || next === 360) triggerWin();
              }}
              className="btn-comic px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-sm border border-slate-700 cursor-pointer"
            >
              Rotate Right ↻
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 12: Stuck 99% Download */}
      {/* ========================================================================= */}
      {levelId === 12 && (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-center">
            <div className="text-sm font-bold text-slate-300">SYSTEM UPDATE</div>
            <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
              {l12Progress}%
            </div>
          </div>

          {/* Progress Bar with draggable handle */}
          <div className="relative w-full h-6 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-150"
              style={{ width: `${l12Progress}%` }}
            />
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => triggerFail('Clicking Cancel reset the progress back to 0%!')}
              className="btn-comic flex-1 py-3 rounded-xl bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-700 cursor-pointer"
            >
              Cancel Download
            </button>
            <button
              onClick={() => {
                audioEngine.playPop();
                setL12Progress(100);
                triggerWin();
              }}
              className="btn-comic flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs border border-emerald-400 cursor-pointer"
            >
              Push to 100% ➔
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 13: Turn Off The Lights */}
      {/* ========================================================================= */}
      {levelId === 13 && (
        <div
          className={`relative w-full h-80 rounded-2xl border p-6 flex flex-col items-center justify-between transition-colors duration-500 ${
            l13BulbRemoved ? 'bg-slate-950 border-slate-900' : 'bg-amber-100/10 border-amber-500/30'
          }`}
        >
          {/* Hanging lightbulb */}
          <div className="flex flex-col items-center">
            <div className="w-1 h-16 bg-slate-600" />
            <button
              onClick={() => {
                audioEngine.playClick();
                setL13BulbRemoved(true);
                triggerWin();
              }}
              className="btn-comic p-4 rounded-full bg-amber-400 text-slate-950 shadow-2xl shadow-amber-400/50 cursor-pointer border-2 border-amber-200"
              title="Unscrew lightbulb"
            >
              <Lightbulb className="w-10 h-10 fill-amber-300" />
            </button>
            <span className="text-[11px] text-amber-300 mt-2 font-bold">Unscrew Lightbulb</span>
          </div>

          {/* Light Switch */}
          <button
            onClick={() => {
              audioEngine.playBuzzer();
              triggerFail('Impish flipped the light switch back on instantly!');
            }}
            className="btn-comic px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700 cursor-pointer"
          >
            Flick Wall Switch
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 14: Pick The Winner (Turtle vs Cheetah) */}
      {/* ========================================================================= */}
      {levelId === 14 && (
        <div className="relative w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between">
          {/* Race Track */}
          <div className="relative w-full h-40 rounded-xl bg-slate-800 p-2 flex flex-col justify-around">
            {/* Finish Line */}
            <div
              style={{ left: `${l14FinishLineX}%` }}
              className="absolute top-0 bottom-0 w-2 bg-gradient-to-b from-amber-400 via-rose-500 to-amber-400 z-10"
            >
              <span className="absolute -top-4 -left-6 text-[10px] font-bold text-amber-400">FINISH</span>
            </div>

            {/* Turtle Lane */}
            <div className="flex items-center gap-2">
              <span className="text-2xl transition-transform" style={{ transform: `translateX(${l14TurtleX}px)` }}>
                🐢
              </span>
              <span className="text-xs text-slate-400">Turtle Lane</span>
            </div>

            {/* Cheetah Lane */}
            <div className="flex items-center gap-2">
              <span className="text-2xl transition-transform" style={{ transform: `translateX(${l14CheetahX}px)` }}>
                🐆
              </span>
              <span className="text-xs text-slate-400">Cheetah Lane</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                audioEngine.playSlideWhistle(false);
                setL14FinishLineX(25); // Move finish line right in front of turtle!
              }}
              className="btn-comic flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs border border-indigo-400 cursor-pointer"
            >
              Move Finish Line Close 🏁
            </button>
            <button
              onClick={() => {
                audioEngine.playPop();
                if (l14FinishLineX < 35) {
                  triggerWin();
                } else {
                  triggerFail('Cheetah ran backward chasing butterflies! You lost!');
                }
              }}
              className="btn-comic flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs border border-emerald-400 cursor-pointer"
            >
              START RACE 🏁
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 15: Tap 10 Times Fast */}
      {/* ========================================================================= */}
      {levelId === 15 && (
        <div className="relative w-full h-80 flex flex-col items-center justify-center p-4">
          <div className="text-sm font-mono text-amber-400 mb-4">
            Count: {l15Taps} / 10
          </div>

          <button
            onClick={() => {
              const next = l15Taps + 1;
              audioEngine.playPop();
              if (next === 9) {
                setL15Relocated(true);
                setTimeout(() => setL15CanTapTen(true), 1000);
              }
              if (next === 10) {
                if (!l15CanTapTen) {
                  triggerFail('You panic-tapped while it was relocating!');
                } else {
                  triggerWin();
                }
              }
              setL15Taps(next);
            }}
            className={`btn-comic px-8 py-5 rounded-3xl font-display font-bold text-lg cursor-pointer transition-all ${
              l15Relocated
                ? 'absolute top-4 right-4 bg-rose-600 text-white border-2 border-rose-400'
                : 'bg-indigo-600 text-white border-2 border-indigo-400'
            }`}
          >
            {l15Taps === 9 ? (l15CanTapTen ? '10 (Safe Tap!)' : 'HOLD ON...') : `TAP (${l15Taps})`}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 16: Crack The Safe (Code 7-3-9-1) */}
      {/* ========================================================================= */}
      {levelId === 16 && (
        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-xs p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="relative w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-700">
            <span className="font-mono text-xl tracking-widest text-amber-400">
              {l16Entered.padEnd(4, '•')}
            </span>

            {/* Peelable sticky note */}
            {!l16NoteMoved ? (
              <button
                onClick={() => {
                  audioEngine.playSlideWhistle(true);
                  setL16NoteMoved(true);
                }}
                className="px-3 py-1.5 rounded bg-yellow-400 text-slate-950 font-bold text-[10px] shadow cursor-pointer"
              >
                Top Secret Note
              </button>
            ) : (
              <span className="font-mono text-xs text-emerald-400 font-bold">
                Code: 7391
              </span>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((k) => (
              <button
                key={k}
                onClick={() => {
                  audioEngine.playClick();
                  if (k === 'C') {
                    setL16Entered('');
                  } else if (k === '✓') {
                    if (l16Entered === '7391') {
                      triggerWin();
                    } else {
                      triggerFail('Incorrect passcode! The alarm triggered!');
                    }
                  } else if (l16Entered.length < 4) {
                    const next = l16Entered + k;
                    setL16Entered(next);
                    if (next === '7391') {
                      setTimeout(triggerWin, 200);
                    }
                  }
                }}
                className="btn-comic p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-sm border border-slate-700 cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 17: Balance The Seesaw */}
      {/* ========================================================================= */}
      {levelId === 17 && (
        <div className="relative w-full h-80 rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between">
          <div className="text-xs font-mono text-center text-slate-400">
            {l17Balanced ? 'Balanced!' : 'Heavy anvil weighing down left side!'}
          </div>

          {/* Seesaw Beam */}
          <div className="relative w-full flex items-center justify-center my-12">
            <div
              className={`w-full h-3 bg-amber-500 rounded-full transition-transform duration-500 ${
                l17Balanced ? 'rotate-0' : '-rotate-12'
              }`}
            />
            {/* Fulcrum triangle */}
            <div className="absolute top-3 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-slate-600" />

            {/* Left Weight */}
            <div className="absolute -top-12 left-4 text-3xl">🪨 500kg</div>

            {/* Right Weight (Added when tapped/dragged) */}
            {l17Balanced && (
              <div className="absolute -top-12 right-4 text-3xl animate-comic-pop">
                🔥 Troll Meter
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                audioEngine.playPop();
                setL17Balanced(true);
                triggerWin();
              }}
              className="btn-comic px-6 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs border border-amber-300 flex items-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-slate-950" />
              <span>PLACE TROLL METER ON RIGHT SIDE</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 18: Dark Room Star Hunt */}
      {/* ========================================================================= */}
      {levelId === 18 && (
        <div
          className="relative w-full h-80 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden cursor-crosshair"
          onMouseMove={(e) => {
            handleTouchOrMouseMove(e, (x, y) => setL18Flashlight({ x, y }));
          }}
          onTouchMove={(e) => {
            handleTouchOrMouseMove(e, (x, y) => setL18Flashlight({ x, y }));
          }}
        >
          {/* Picture frame hiding star */}
          <div
            style={{ left: '65%', top: '40%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <button
              onClick={() => {
                audioEngine.playSlideWhistle(true);
                setL18FrameTilted(true);
              }}
              className={`p-4 rounded-xl bg-amber-900/40 border-2 border-amber-600 text-xs text-amber-200 transition-transform ${
                l18FrameTilted ? 'rotate-45' : ''
              }`}
            >
              🖼️ Mona Imp Frame
            </button>
          </div>

          {/* Golden Star revealed behind frame */}
          {l18FrameTilted && (
            <button
              onClick={() => {
                audioEngine.playFanfare();
                triggerWin();
              }}
              style={{ left: '65%', top: '40%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 p-3 text-3xl cursor-pointer hover:scale-125 transition-transform"
            >
              ⭐
            </button>
          )}

          {/* Flashlight Beam effect */}
          <div
            style={{
              background: `radial-gradient(circle 90px at ${l18Flashlight.x}% ${l18Flashlight.y}%, transparent 40%, rgba(2, 6, 23, 0.96) 90%)`,
            }}
            className="absolute inset-0 pointer-events-none"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 19: Opposite Day! */}
      {/* ========================================================================= */}
      {levelId === 19 && (
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-xs">
          <div className="text-center font-display font-bold text-amber-400 text-sm">
            EVERYTHING MEANS THE OPPOSITE!
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => {
                audioEngine.playFanfare();
                triggerWin();
              }}
              className="btn-comic flex-1 py-6 rounded-2xl bg-emerald-600 text-white font-display font-bold text-base border-2 border-emerald-400 flex flex-col items-center gap-2 cursor-pointer"
            >
              <Check className="w-8 h-8 stroke-[3]" />
              <span>GREEN YES</span>
            </button>

            <button
              onClick={() => {
                audioEngine.playBuzzer();
                triggerFail('On Opposite Day, No means Yes and Yes means No!');
              }}
              className="btn-comic flex-1 py-6 rounded-2xl bg-rose-600 text-white font-display font-bold text-base border-2 border-rose-400 flex flex-col items-center gap-2 cursor-pointer"
            >
              <X className="w-8 h-8 stroke-[3]" />
              <span>RED NO</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 20: The Troll King Showdown */}
      {/* ========================================================================= */}
      {levelId === 20 && (
        <div className="flex flex-col items-center justify-between w-full h-80 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono font-bold text-amber-400">
              Troll King Battle: Round {l20Phase} / 3
            </span>
            <span className="text-xs text-purple-300">👑 Final Boss</span>
          </div>

          {/* Phase 1: Which hand has the coin? */}
          {l20Phase === 1 && (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  audioEngine.playFanfare();
                  setL20Phase(2);
                }}
                className="text-4xl hover:scale-125 transition-transform cursor-pointer"
                title="Coin on crown!"
              >
                👑 🪙
              </button>
              <span className="text-xs text-amber-300 font-bold">
                King: "Guess which hand holds my gold coin!"
              </span>
              <div className="flex gap-4">
                <button
                  onClick={() => triggerFail("Both hands were empty! The coin was hidden on his crown!")}
                  className="btn-comic px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700 cursor-pointer"
                >
                  Left Fist ✊
                </button>
                <button
                  onClick={() => triggerFail("Both hands were empty! The coin was hidden on his crown!")}
                  className="btn-comic px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700 cursor-pointer"
                >
                  Right Fist ✊
                </button>
              </div>
            </div>
          )}

          {/* Phase 2: Press the button that does NOT say press */}
          {l20Phase === 2 && (
            <div className="flex flex-col items-center gap-4">
              <span className="text-xs text-amber-300 font-bold">
                King: "Press the button that does NOT tell you to press!"
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => triggerFail("That button says PRESS!")}
                  className="btn-comic px-3 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700 cursor-pointer"
                >
                  Press Me
                </button>
                <button
                  onClick={() => triggerFail("That button also says PRESS!")}
                  className="btn-comic px-3 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700 cursor-pointer"
                >
                  Do Not Press
                </button>
                <button
                  onClick={() => {
                    audioEngine.playFanfare();
                    setL20Phase(3);
                  }}
                  className="btn-comic px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs border border-emerald-400 cursor-pointer"
                >
                  Nothing
                </button>
              </div>
            </div>
          )}

          {/* Phase 3: Reflect the Troll King's Blast */}
          {l20Phase === 3 && (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="text-4xl animate-comic-shake">⚡😈⚡</div>
              <span className="text-xs text-rose-400 font-bold">
                King is firing a mega troll blast! Defend yourself!
              </span>
              <button
                onClick={() => {
                  audioEngine.playFanfare();
                  triggerWin();
                }}
                className="btn-comic px-6 py-3 rounded-2xl bg-amber-400 text-slate-950 font-display font-bold text-sm border-2 border-amber-200 flex items-center gap-2 cursor-pointer shadow-xl hover:scale-105"
              >
                <Shield className="w-5 h-5 fill-slate-950" />
                <span>REFLECT BLAST WITH SHIELD!</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
