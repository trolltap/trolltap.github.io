/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SaveStatus, YouTubePlayablesStatus } from '../types/game';

// Declare standard YouTube Playables SDK global interface
declare global {
  interface Window {
    ytgame?: {
      game: {
        firstFrameReady: () => void;
        gameReady: () => void;
        loadData: () => Promise<string | null>;
        saveData: (data: string) => Promise<void>;
      };
      system: {
        isAudioEnabled: () => boolean;
        onAudioEnabledChange: (callback: (enabled: boolean) => void) => void;
        onPause: (callback: () => void) => void;
        onResume: (callback: () => void) => void;
      };
    };
  }
}

type PauseResumeListener = (paused: boolean) => void;
type AudioChangeListener = (enabled: boolean) => void;
type SaveStatusListener = (status: SaveStatus, error?: string | null) => void;

const YOUTUBE_MAX_PAYLOAD_BYTES = 3 * 1024 * 1024; // 3 MiB platform ceiling

class PlatformAdapterService {
  private hasFirstFrame = false;
  private hasGameReady = false;
  private isSystemPaused = false;
  private isAudioPermitted = true;

  // Storage lifecycle guards
  private hasLoadedCompleted = false;
  private isUsingDevFallback = false;
  private isSaveInFlight = false;
  private pendingSavePayload: { key: string; dataString: string } | null = null;

  // Diagnostics & Status
  private saveStatus: SaveStatus = 'idle';
  private lastSaveTime: number | null = null;
  private lastSaveError: string | null = null;
  private lastPayloadSize: number = 0;

  // Observers
  private pauseListeners: Set<PauseResumeListener> = new Set();
  private audioListeners: Set<AudioChangeListener> = new Set();
  private saveStatusListeners: Set<SaveStatusListener> = new Set();

  constructor() {
    this.initPlatformListeners();
  }

  private initPlatformListeners(): void {
    if (typeof window === 'undefined') return;

    // Detect YouTube Playables SDK
    if (window.ytgame?.system) {
      try {
        this.isAudioPermitted = window.ytgame.system.isAudioEnabled();
        window.ytgame.system.onAudioEnabledChange((enabled: boolean) => {
          this.isAudioPermitted = enabled;
          this.audioListeners.forEach((cb) => cb(enabled));
        });

        window.ytgame.system.onPause(() => {
          this.isSystemPaused = true;
          this.pauseListeners.forEach((cb) => cb(true));
          // If a save is queued, immediately flush on pause
          this.flushPendingSave();
        });

        window.ytgame.system.onResume(() => {
          this.isSystemPaused = false;
          this.pauseListeners.forEach((cb) => cb(false));
        });
      } catch (e) {
        console.warn('[PlatformAdapter] Error setting up ytgame system listeners:', e);
      }
    }

    // Always hook browser visibility & window blur as standard fallback protection
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseListeners.forEach((cb) => cb(true));
        this.flushPendingSave();
      } else if (!this.isSystemPaused) {
        this.pauseListeners.forEach((cb) => cb(false));
      }
    });

    window.addEventListener('blur', () => {
      this.pauseListeners.forEach((cb) => cb(true));
      this.flushPendingSave();
    });

    window.addEventListener('focus', () => {
      if (!this.isSystemPaused && !document.hidden) {
        this.pauseListeners.forEach((cb) => cb(false));
      }
    });
  }

  /**
   * Signal that the game has painted its first visual frame
   */
  public sendFirstFrameReady(): void {
    if (this.hasFirstFrame) return;
    this.hasFirstFrame = true;

    if (window.ytgame?.game?.firstFrameReady) {
      try {
        window.ytgame.game.firstFrameReady();
        console.log('[PlatformAdapter] ytgame.game.firstFrameReady() sent successfully.');
      } catch (err) {
        console.warn('[PlatformAdapter] Error calling ytgame.game.firstFrameReady():', err);
      }
    }
  }

  /**
   * Signal that all assets/saves are loaded and the player can now interact
   */
  public sendGameReady(): void {
    if (this.hasGameReady) return;
    this.hasGameReady = true;

    if (window.ytgame?.game?.gameReady) {
      try {
        window.ytgame.game.gameReady();
        console.log('[PlatformAdapter] ytgame.game.gameReady() sent successfully.');
      } catch (err) {
        console.warn('[PlatformAdapter] Error calling ytgame.game.gameReady():', err);
      }
    }
  }

  /**
   * Check if running in verified YouTube Playables environment
   */
  public isPlayablesActive(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
      typeof window.ytgame?.game?.loadData === 'function' &&
      typeof window.ytgame?.game?.saveData === 'function' &&
      !this.isUsingDevFallback
    );
  }

  /**
   * Load saved game progress on startup using ytgame.game.loadData().
   * YouTube Playables Requirement: Must complete before saveData() can be called.
   * If running outside YouTube (standalone/dev), seamlessly falls back to localStorage.
   */
  public async loadGameData(key: string): Promise<string | null> {
    // 1. Attempt YouTube Playables Cloud Load if SDK is detected
    if (window.ytgame?.game?.loadData) {
      try {
        // Race with timeout in case parent iframe is not the YouTube host
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => {
            console.warn('[PlatformAdapter] ytgame.game.loadData timed out. Using dev fallback.');
            resolve(null);
          }, 1500)
        );

        const cloudData = await Promise.race([
          window.ytgame.game.loadData().catch((err) => {
            console.warn('[PlatformAdapter] ytgame.game.loadData error:', err);
            return null;
          }),
          timeoutPromise,
        ]);

        if (cloudData !== null && typeof cloudData === 'string') {
          this.hasLoadedCompleted = true;
          this.isUsingDevFallback = false;
          this.lastPayloadSize = cloudData.length;
          console.log('[PlatformAdapter] Successfully loaded cloud progress from ytgame.');
          return cloudData;
        } else {
          // If null or timed out in dev preview, fall back to dev storage
          this.isUsingDevFallback = true;
        }
      } catch (err) {
        console.warn('[PlatformAdapter] Error executing ytgame.game.loadData:', err);
        this.isUsingDevFallback = true;
      }
    } else {
      this.isUsingDevFallback = true;
    }

    // 2. Clearly separated development-only fallback for browser preview testing
    try {
      this.hasLoadedCompleted = true;
      const localData = localStorage.getItem(key);
      if (localData) {
        this.lastPayloadSize = localData.length;
      }
      return localData;
    } catch (e) {
      console.warn('[PlatformAdapter DEV Fallback] localStorage read failed:', e);
      return null;
    }
  }

  /**
   * Save game progress.
   * Strict Platform Rules:
   * 1. Must NOT be called before loadData() completes.
   * 2. Must not exceed 3 MiB.
   * 3. Prevents overlapping concurrent writes via request coalescing.
   * 4. Includes automatic retry on transient failure.
   */
  public async saveGameData(key: string, dataString: string): Promise<boolean> {
    // Enforce 3 MiB platform payload limit
    const byteSize = new Blob([dataString]).size;
    this.lastPayloadSize = byteSize;
    if (byteSize > YOUTUBE_MAX_PAYLOAD_BYTES) {
      const err = `Payload size (${byteSize} bytes) exceeds YouTube limit of 3 MiB.`;
      console.error('[PlatformAdapter]', err);
      this.updateSaveStatus('error', err);
      return false;
    }

    // Strict Rule: Never save before loadData has completed
    if (!this.hasLoadedCompleted) {
      console.warn('[PlatformAdapter] Cannot call saveData() before loadData() completes. Waiting...');
      await this.loadGameData(key);
    }

    // Coalesce rapid saves: If a save is already in-flight, queue the latest payload
    if (this.isSaveInFlight) {
      this.pendingSavePayload = { key, dataString };
      return true;
    }

    this.isSaveInFlight = true;
    this.updateSaveStatus('saving');

    try {
      // Production YouTube Cloud Save
      if (this.isPlayablesActive() && window.ytgame?.game?.saveData) {
        let success = false;
        let lastErr: unknown = null;

        // Try with 1 retry on transient failure
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const timeoutPromise = new Promise<void>((_, reject) =>
              setTimeout(() => reject(new Error('saveData timed out')), 2000)
            );
            await Promise.race([window.ytgame.game.saveData(dataString), timeoutPromise]);
            success = true;
            break;
          } catch (e) {
            lastErr = e;
            console.warn(`[PlatformAdapter] ytgame.game.saveData attempt ${attempt} failed:`, e);
            if (attempt < 2) {
              await new Promise((r) => setTimeout(r, 250)); // Short backoff
            }
          }
        }

        if (success) {
          this.lastSaveTime = Date.now();
          this.updateSaveStatus('saved');
          // Mirror to dev storage as offline backup
          this.writeToDevLocalStorage(key, dataString);
        } else {
          const errMsg = lastErr instanceof Error ? lastErr.message : 'Cloud save failed';
          this.updateSaveStatus('error', errMsg);
          // Still write to local storage as safety backup
          this.writeToDevLocalStorage(key, dataString);
          return false;
        }
      } else {
        // Development Preview Fallback (localStorage)
        this.writeToDevLocalStorage(key, dataString);
        this.lastSaveTime = Date.now();
        this.updateSaveStatus('saved');
      }

      return true;
    } finally {
      this.isSaveInFlight = false;
      // If another save was queued while this one was saving, process it now
      if (this.pendingSavePayload) {
        const next = this.pendingSavePayload;
        this.pendingSavePayload = null;
        this.saveGameData(next.key, next.dataString);
      }
    }
  }

  private writeToDevLocalStorage(key: string, dataString: string): void {
    try {
      localStorage.setItem(key, dataString);
    } catch (e) {
      console.warn('[PlatformAdapter DEV Fallback] localStorage write failed:', e);
    }
  }

  /**
   * Immediately flush any queued save before pausing or unloading
   */
  public flushPendingSave(): void {
    if (this.pendingSavePayload && !this.isSaveInFlight) {
      const next = this.pendingSavePayload;
      this.pendingSavePayload = null;
      this.saveGameData(next.key, next.dataString);
    }
  }

  private updateSaveStatus(status: SaveStatus, error: string | null = null): void {
    this.saveStatus = status;
    this.lastSaveError = error;
    this.saveStatusListeners.forEach((cb) => cb(status, error));
  }

  public isAudioAllowed(): boolean {
    return this.isAudioPermitted;
  }

  public subscribePause(callback: PauseResumeListener): () => void {
    this.pauseListeners.add(callback);
    return () => this.pauseListeners.delete(callback);
  }

  public subscribeAudio(callback: AudioChangeListener): () => void {
    this.audioListeners.add(callback);
    return () => this.audioListeners.delete(callback);
  }

  public subscribeSaveStatus(callback: SaveStatusListener): () => void {
    this.saveStatusListeners.add(callback);
    return () => this.saveStatusListeners.delete(callback);
  }

  public getStatus(): YouTubePlayablesStatus {
    const isYtActive = this.isPlayablesActive();
    return {
      isAvailable: typeof window !== 'undefined' && Boolean(window.ytgame),
      isFirstFrameSent: this.hasFirstFrame,
      isGameReadySent: this.hasGameReady,
      isAudioPermitted: this.isAudioPermitted,
      isSystemPaused: this.isSystemPaused,
      storageBackend: isYtActive ? 'ytgame-cloud' : 'local-storage-dev',
      saveStatus: this.saveStatus,
      lastSaveTime: this.lastSaveTime,
      lastSaveError: this.lastSaveError,
      savePayloadSizeBytes: this.lastPayloadSize,
    };
  }
}

export const platformAdapter = new PlatformAdapterService();
