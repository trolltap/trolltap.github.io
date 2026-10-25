/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Smartphone,
  Eye,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { GameSettings, YouTubePlayablesStatus } from '../../types/game';
import { platformAdapter } from '../../services/platformAdapter';
import { audioEngine } from '../../services/audioEngine';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetData: () => void;
  onBackToHome: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onBackToHome,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const playablesStatus: YouTubePlayablesStatus = platformAdapter.getStatus();

  const handleTestVibrate = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };

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
          <h2 className="font-display font-bold text-lg text-white">Settings</h2>
          <div className="text-[11px] font-mono text-slate-400">Audio, Motion & Platform</div>
        </div>

        <div className="w-8" />
      </header>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* Audio Section */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="text-xs font-display font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span>Cartoon Soundboard</span>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Synthesized Audio Effects</div>
              <div className="text-[10px] text-slate-400">Boings, buzzers, pops, and fanfares</div>
            </div>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                onUpdateSettings({ ...settings, soundEnabled: next });
                audioEngine.setMuted(!next);
                if (next) audioEngine.playPop();
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                settings.soundEnabled
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
            >
              {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Volume Slider */}
          {settings.soundEnabled && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Volume</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ ...settings, sfxVolume: val });
                  audioEngine.setVolume(val);
                }}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
              />
            </div>
          )}
        </div>

        {/* Haptics & Accessibility */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="text-xs font-display font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4" />
            <span>Haptics & Comfort</span>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Vibration Feedback</div>
              <div className="text-[10px] text-slate-400">Where supported by device</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestVibrate}
                className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700 cursor-pointer"
              >
                Test
              </button>
              <button
                onClick={() => {
                  const next = !settings.vibrationEnabled;
                  onUpdateSettings({ ...settings, vibrationEnabled: next });
                  if (next) handleTestVibrate();
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.vibrationEnabled ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.vibrationEnabled ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-bold text-white">Reduce Animations</div>
              <div className="text-[10px] text-slate-400">Disable screen shakes & jiggles</div>
            </div>
            <button
              onClick={() => {
                onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.reducedMotion ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.reducedMotion ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* YouTube Playables SDK Status Panel */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="text-xs font-display font-bold uppercase tracking-wider text-purple-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>YouTube Playables Integration</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">v1 SDK</span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Environment:</span>
              <span className={playablesStatus.isAvailable ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {playablesStatus.isAvailable ? 'YouTube Playables Host' : 'Standalone / Browser Preview'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">firstFrameReady():</span>
              <span className={playablesStatus.isFirstFrameSent ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {playablesStatus.isFirstFrameSent ? 'Sent ✓' : 'Pending'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">gameReady():</span>
              <span className={playablesStatus.isGameReadySent ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {playablesStatus.isGameReadySent ? 'Sent ✓' : 'Pending'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Storage Backend:</span>
              <span className={playablesStatus.storageBackend === 'ytgame-cloud' ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
                {playablesStatus.storageBackend === 'ytgame-cloud'
                  ? 'ytgame.game.saveData (Cloud)'
                  : 'localStorage (Dev Fallback)'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Save Status:</span>
              <span className={
                playablesStatus.saveStatus === 'saved'
                  ? 'text-emerald-400 font-bold'
                  : playablesStatus.saveStatus === 'saving'
                  ? 'text-amber-400 font-bold animate-pulse'
                  : playablesStatus.saveStatus === 'error'
                  ? 'text-rose-400 font-bold'
                  : 'text-slate-400'
              }>
                {playablesStatus.saveStatus === 'saved'
                  ? 'Saved ✓'
                  : playablesStatus.saveStatus === 'saving'
                  ? 'Saving in progress...'
                  : playablesStatus.saveStatus === 'error'
                  ? `Failed: ${playablesStatus.lastSaveError || 'Error'}`
                  : 'Idle'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Payload Size:</span>
              <span className="text-slate-300 font-bold">
                {(playablesStatus.savePayloadSizeBytes / 1024).toFixed(2)} KB / 3072 KB Max
              </span>
            </div>
          </div>
        </div>

        {/* Data Reset */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-900/40">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Game Progress</span>
            </button>
          ) : (
            <div className="space-y-2 text-center">
              <div className="text-xs text-rose-300 font-bold">Reset all 20 levels and Troll Points?</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetData();
                    setShowResetConfirm(false);
                    audioEngine.playPop();
                  }}
                  className="btn-comic flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-comic flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
