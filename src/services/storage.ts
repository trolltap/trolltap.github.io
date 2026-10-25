/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSettings, LevelProgress, MascotSkin, PlayerStats, VersionedSaveData } from '../types/game';
import { platformAdapter } from './platformAdapter';

export const SAVE_SCHEMA_VERSION = 1;
export const APP_VERSION = '1.1.0';
export const STORAGE_KEY = 'trolltap_progress_v1';

export const INITIAL_SETTINGS: GameSettings = {
  soundEnabled: true,
  sfxVolume: 0.8,
  vibrationEnabled: true,
  reducedMotion: false,
};

export const INITIAL_STATS: PlayerStats = {
  totalAttempts: 0,
  completedLevels: 0,
  trollPoints: 0,
  totalTrollsSuffered: 0,
  currentStreak: 0,
  bestStreak: 0,
  unlockedSkins: ['classic'],
  activeSkin: 'classic',
  unlockedTrophies: [],
};

export function createInitialLevels(count: number = 20): LevelProgress[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    unlocked: i === 0, // Level 1 starts unlocked
    completed: false,
    stars: 0,
    attempts: 0,
    trollsCount: 0,
  }));
}

export function createDefaultSaveData(): VersionedSaveData {
  return {
    version: SAVE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    savedAt: Date.now(),
    highestUnlockedLevel: 1,
    levels: createInitialLevels(20),
    stats: { ...INITIAL_STATS },
    settings: { ...INITIAL_SETTINGS },
  };
}

/**
 * Robust JSON Parser & Schema Migration.
 * Handles empty data, syntax errors, partial fields, and future/past version migrations.
 */
export function sanitizeAndMigrateSave(raw: string | null): VersionedSaveData {
  const fallback = createDefaultSaveData();
  if (!raw || typeof raw !== 'string' || raw.trim() === '') {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      console.warn('[Storage] Corrupted save payload (not an object), using defaults.');
      return fallback;
    }

    // 1. Validate & merge levels array
    let levels = createInitialLevels(20);
    if (Array.isArray(parsed.levels)) {
      levels = levels.map((defaultLvl) => {
        const found = parsed.levels.find((l: unknown) => l && typeof l === 'object' && (l as LevelProgress).id === defaultLvl.id);
        if (found) {
          return {
            id: defaultLvl.id,
            unlocked: Boolean(found.unlocked ?? defaultLvl.unlocked),
            completed: Boolean(found.completed ?? false),
            stars: typeof found.stars === 'number' ? Math.max(0, Math.min(3, found.stars)) : 0,
            attempts: typeof found.attempts === 'number' ? Math.max(0, found.attempts) : 0,
            trollsCount: typeof found.trollsCount === 'number' ? Math.max(0, found.trollsCount) : 0,
            bestTimeSeconds: typeof found.bestTimeSeconds === 'number' ? found.bestTimeSeconds : undefined,
          };
        }
        return defaultLvl;
      });
    }

    // Ensure Level 1 is always unlocked
    if (levels.length > 0) {
      levels[0].unlocked = true;
    }

    // Compute highest unlocked level
    const highestUnlockedLevel = levels.reduce(
      (max, l) => (l.unlocked ? Math.max(max, l.id) : max),
      1
    );

    // 2. Validate & merge stats
    const pStats = parsed.stats || {};
    const validSkins: MascotSkin[] = ['classic', 'cyber', 'king', 'fancy'];
    const unlockedSkins: MascotSkin[] = Array.isArray(pStats.unlockedSkins)
      ? pStats.unlockedSkins.filter((s: unknown) => validSkins.includes(s as MascotSkin))
      : ['classic'];

    if (!unlockedSkins.includes('classic')) {
      unlockedSkins.unshift('classic');
    }

    const activeSkin: MascotSkin = validSkins.includes(pStats.activeSkin)
      ? pStats.activeSkin
      : 'classic';

    const stats: PlayerStats = {
      totalAttempts: typeof pStats.totalAttempts === 'number' ? Math.max(0, pStats.totalAttempts) : 0,
      completedLevels: typeof pStats.completedLevels === 'number' ? Math.max(0, pStats.completedLevels) : levels.filter((l) => l.completed).length,
      trollPoints: typeof pStats.trollPoints === 'number' ? Math.max(0, pStats.trollPoints) : 0,
      totalTrollsSuffered: typeof pStats.totalTrollsSuffered === 'number' ? Math.max(0, pStats.totalTrollsSuffered) : 0,
      currentStreak: typeof pStats.currentStreak === 'number' ? Math.max(0, pStats.currentStreak) : 0,
      bestStreak: typeof pStats.bestStreak === 'number' ? Math.max(0, pStats.bestStreak) : 0,
      unlockedSkins,
      activeSkin,
      unlockedTrophies: Array.isArray(pStats.unlockedTrophies) ? pStats.unlockedTrophies : [],
    };

    // 3. Validate & merge settings
    const pSet = parsed.settings || {};
    const settings: GameSettings = {
      soundEnabled: pSet.soundEnabled !== false,
      sfxVolume: typeof pSet.sfxVolume === 'number' ? Math.max(0, Math.min(1, pSet.sfxVolume)) : INITIAL_SETTINGS.sfxVolume,
      vibrationEnabled: pSet.vibrationEnabled !== false,
      reducedMotion: Boolean(pSet.reducedMotion),
    };

    return {
      version: SAVE_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
      highestUnlockedLevel,
      levels,
      stats,
      settings,
    };
  } catch (err) {
    console.error('[Storage] Error parsing saved JSON, recovering with defaults:', err);
    return fallback;
  }
}

class GameStorageService {
  private cache: VersionedSaveData = createDefaultSaveData();
  private isLoaded = false;

  /**
   * Initializes and restores progress.
   * Conforms to YouTube Playables contract: awaits loadData() before any saving.
   */
  public async init(): Promise<VersionedSaveData> {
    if (this.isLoaded) return this.cache;

    try {
      const raw = await platformAdapter.loadGameData(STORAGE_KEY);
      this.cache = sanitizeAndMigrateSave(raw);
    } catch (e) {
      console.warn('[Storage] Load failure, safely falling back to defaults:', e);
      this.cache = createDefaultSaveData();
    } finally {
      this.isLoaded = true;
    }

    return this.cache;
  }

  public getLevels(): LevelProgress[] {
    return this.cache.levels;
  }

  public getStats(): PlayerStats {
    return this.cache.stats;
  }

  public getSettings(): GameSettings {
    return this.cache.settings;
  }

  public getCache(): VersionedSaveData {
    return this.cache;
  }

  /**
   * Save game progress automatically.
   */
  public async save(levels: LevelProgress[], stats: PlayerStats, settings: GameSettings): Promise<boolean> {
    const highestUnlockedLevel = levels.reduce(
      (max, l) => (l.unlocked ? Math.max(max, l.id) : max),
      1
    );

    this.cache = {
      version: SAVE_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      savedAt: Date.now(),
      highestUnlockedLevel,
      levels,
      stats,
      settings,
    };

    const dataString = JSON.stringify(this.cache);
    return await platformAdapter.saveGameData(STORAGE_KEY, dataString);
  }

  public flushSave(): void {
    platformAdapter.flushPendingSave();
  }

  public async resetProgress(): Promise<VersionedSaveData> {
    this.cache = createDefaultSaveData();
    await this.save(this.cache.levels, this.cache.stats, this.cache.settings);
    return this.cache;
  }

  public updateSkin(skin: MascotSkin): void {
    this.cache.stats.activeSkin = skin;
    this.save(this.cache.levels, this.cache.stats, this.cache.settings);
  }
}

export const storageService = new GameStorageService();
