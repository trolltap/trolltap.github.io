/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenState = 'HOME' | 'GAME' | 'LEVEL_SELECT' | 'STATS' | 'SETTINGS';

export type MascotReaction = 'smug' | 'laugh' | 'shock' | 'rage' | 'triumph' | 'thinking' | 'wink';

export type MascotSkin = 'classic' | 'cyber' | 'king' | 'fancy';

export interface LevelProgress {
  id: number;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 1 to 3 stars based on attempts taken
  attempts: number;
  trollsCount: number;
  bestTimeSeconds?: number;
}

export interface LevelDefinition {
  id: number;
  title: string;
  instruction: string;
  hint: string;
  trollTrapExplanation: string;
  winExplanation: string;
  category: 'logic' | 'fake_ui' | 'timing' | 'physics' | 'reflex' | 'drag';
  estimatedSeconds: number;
}

export interface PlayerStats {
  totalAttempts: number;
  completedLevels: number;
  trollPoints: number; // Fills the animated Troll Meter
  totalTrollsSuffered: number;
  currentStreak: number;
  bestStreak: number;
  unlockedSkins: MascotSkin[];
  activeSkin: MascotSkin;
  unlockedTrophies: string[];
}

export interface GameSettings {
  soundEnabled: boolean;
  sfxVolume: number; // 0.0 to 1.0
  vibrationEnabled: boolean;
  reducedMotion: boolean;
}

export interface Trophy {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  requiredTrollPoints?: number;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface VersionedSaveData {
  version: number;
  appVersion: string;
  savedAt: number;
  highestUnlockedLevel: number;
  levels: LevelProgress[];
  stats: PlayerStats;
  settings: GameSettings;
}

export interface YouTubePlayablesStatus {
  isAvailable: boolean;
  isFirstFrameSent: boolean;
  isGameReadySent: boolean;
  isAudioPermitted: boolean;
  isSystemPaused: boolean;
  storageBackend: 'ytgame-cloud' | 'local-storage-dev';
  saveStatus: SaveStatus;
  lastSaveTime: number | null;
  lastSaveError: string | null;
  savePayloadSizeBytes: number;
}

