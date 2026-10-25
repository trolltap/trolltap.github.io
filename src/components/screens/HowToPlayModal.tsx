/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, X, Sparkles, Flame, CheckCircle, Lightbulb } from 'lucide-react';
import { MascotImp } from '../MascotImp';
import { audioEngine } from '../../services/audioEngine';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-comic-pop">
      <div className="w-full max-w-sm max-h-[90vh] flex flex-col justify-between p-5 rounded-3xl bg-slate-900 border-2 border-amber-500/40 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">How To Play</h3>
              <div className="text-[10px] font-mono text-slate-400">TrollTap Survival Guide</div>
            </div>
          </div>
          <button
            onClick={() => {
              audioEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mascot Greeting */}
        <div className="flex items-center gap-3 my-3 p-3 rounded-2xl bg-purple-950/30 border border-purple-500/30">
          <MascotImp reaction="wink" size="sm" animated />
          <div className="text-xs text-purple-200 italic font-sans leading-relaxed">
            "Think you can outsmart me across 20 levels? Here's how to survive..."
          </div>
        </div>

        {/* 4 Rules */}
        <div className="space-y-2.5 my-2">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5">
            <span className="text-base">🧐</span>
            <div>
              <div className="text-xs font-display font-bold text-amber-300">1. Question the Obvious</div>
              <div className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
                The most obvious button is usually a booby trap. Look at labels, countdowns, and colors.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5">
            <span className="text-base">🤏</span>
            <div>
              <div className="text-xs font-display font-bold text-cyan-300">2. Experiment & Drag</div>
              <div className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
                Try dragging objects onto instructions, peeling sticky notes, or rotating controls.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5">
            <span className="text-base">🔥</span>
            <div>
              <div className="text-xs font-display font-bold text-rose-300">3. Troll Meter Rewards</div>
              <div className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
                Falling for tricks adds +10 points to your Troll Meter, unlocking fancy character skins!
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5">
            <span className="text-base">💡</span>
            <div>
              <div className="text-xs font-display font-bold text-emerald-300">4. 100% Deterministic</div>
              <div className="text-[11px] text-slate-300 font-sans mt-0.5 leading-snug">
                Every level has a fair, discoverable solution. Stuck? Tap the lightbulb for a hint!
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            audioEngine.playPop();
            onClose();
          }}
          className="btn-comic w-full mt-3 py-3 rounded-xl bg-amber-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider border border-amber-300 cursor-pointer shadow-md"
        >
          Let's Play!
        </button>
      </div>
    </div>
  );
};
