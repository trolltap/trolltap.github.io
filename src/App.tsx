/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameSettings, LevelProgress, MascotSkin, PlayerStats, ScreenState } from './types/game';
import { LEVELS } from './data/levels';
import { storageService, INITIAL_SETTINGS, INITIAL_STATS, createInitialLevels } from './services/storage';
import { platformAdapter } from './services/platformAdapter';
import { audioEngine } from './services/audioEngine';
import { HomeScreen } from './components/screens/HomeScreen';
import { GameScreen } from './components/screens/GameScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { StatsScreen } from './components/screens/StatsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { HowToPlayModal } from './components/screens/HowToPlayModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('HOME');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [levelsProgress, setLevelsProgress] = useState<LevelProgress[]>(createInitialLevels(20));
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [showSlowNotice, setShowSlowNotice] = useState<boolean>(false);

  // Initialize storage and YouTube Playables lifecycle with bulletproof timeout fallback
  useEffect(() => {
    let isMounted = true;

    // 1. YouTube Playables firstFrameReady()
    try {
      platformAdapter.sendFirstFrameReady();
    } catch (e) {
      console.warn('[App] firstFrameReady invocation note:', e);
    }

    // Safety timeout: if loading takes longer than 1.2s, display manual skip button
    const slowTimer = setTimeout(() => {
      if (isMounted && !isLoaded) {
        setShowSlowNotice(true);
      }
    }, 1200);

    // Hard safety timeout: if still not loaded after 2.5s, force transition to Home
    const forceLoadTimer = setTimeout(() => {
      if (isMounted && !isLoaded) {
        console.warn('[App] Hard timeout reached, proceeding to Home screen with defaults.');
        setIsLoaded(true);
        platformAdapter.sendGameReady();
      }
    }, 2500);

    // 2. Load game data
    storageService
      .init()
      .then((saveData) => {
        if (!isMounted) return;
        clearTimeout(slowTimer);
        clearTimeout(forceLoadTimer);
        setLevelsProgress(saveData.levels);
        setStats(saveData.stats);
        setSettings(saveData.settings);
        audioEngine.setMuted(!saveData.settings.soundEnabled);
        audioEngine.setVolume(saveData.settings.sfxVolume);
        setIsLoaded(true);

        // 3. YouTube Playables gameReady()
        platformAdapter.sendGameReady();
      })
      .catch((err) => {
        console.error('[App] storageService.init() caught error:', err);
        if (!isMounted) return;
        clearTimeout(slowTimer);
        clearTimeout(forceLoadTimer);
        setInitError('Storage initialization failed. Starting in safe offline mode.');
        setIsLoaded(true);
        platformAdapter.sendGameReady();
      });

    return () => {
      isMounted = false;
      clearTimeout(slowTimer);
      clearTimeout(forceLoadTimer);
    };
  }, []);

  // Flush pending save to cloud whenever platform signals pause
  useEffect(() => {
    const unsubPause = platformAdapter.subscribePause((paused) => {
      if (paused) {
        storageService.flushSave();
      }
    });
    return unsubPause;
  }, []);

  // Sync state to storage whenever it updates
  const persistState = useCallback(
    (newLevels: LevelProgress[], newStats: PlayerStats, newSettings: GameSettings) => {
      setLevelsProgress(newLevels);
      setStats(newStats);
      setSettings(newSettings);
      storageService.save(newLevels, newStats, newSettings);
    },
    []
  );

  // Handle winning a level
  const handleWinLevel = useCallback(
    (levelId: number, attemptsThisSession: number) => {
      const starsEarned = attemptsThisSession === 1 ? 3 : attemptsThisSession <= 3 ? 2 : 1;

      const updatedLevels = levelsProgress.map((lvl) => {
        if (lvl.id === levelId) {
          return {
            ...lvl,
            completed: true,
            stars: Math.max(lvl.stars, starsEarned),
            attempts: lvl.attempts + attemptsThisSession,
          };
        }
        // Unlock next level
        if (lvl.id === levelId + 1) {
          return { ...lvl, unlocked: true };
        }
        return lvl;
      });

      const nextCompletedCount = updatedLevels.filter((l) => l.completed).length;
      const nextStreak = stats.currentStreak + 1;

      const updatedStats: PlayerStats = {
        ...stats,
        totalAttempts: stats.totalAttempts + attemptsThisSession,
        completedLevels: nextCompletedCount,
        currentStreak: nextStreak,
        bestStreak: Math.max(stats.bestStreak, nextStreak),
      };

      persistState(updatedLevels, updatedStats, settings);
    },
    [levelsProgress, stats, settings, persistState]
  );

  // Handle failing / falling for a troll trap
  const handleFailLevel = useCallback(
    (levelId: number) => {
      const updatedLevels = levelsProgress.map((lvl) => {
        if (lvl.id === levelId) {
          return {
            ...lvl,
            attempts: lvl.attempts + 1,
            trollsCount: lvl.trollsCount + 1,
          };
        }
        return lvl;
      });

      const nextTrollPoints = stats.trollPoints + 10;
      const updatedSkins = [...stats.unlockedSkins];

      // Milestone unlocks
      if (nextTrollPoints >= 20 && !updatedSkins.includes('fancy')) updatedSkins.push('fancy');
      if (nextTrollPoints >= 50 && !updatedSkins.includes('cyber')) updatedSkins.push('cyber');
      if (nextTrollPoints >= 80 && !updatedSkins.includes('king')) updatedSkins.push('king');

      const updatedStats: PlayerStats = {
        ...stats,
        totalAttempts: stats.totalAttempts + 1,
        totalTrollsSuffered: stats.totalTrollsSuffered + 1,
        trollPoints: nextTrollPoints,
        currentStreak: 0,
        unlockedSkins: updatedSkins,
      };

      persistState(updatedLevels, updatedStats, settings);
    },
    [levelsProgress, stats, settings, persistState]
  );

  // Advance to next level
  const handleNextLevel = useCallback(() => {
    if (activeLevelId < LEVELS.length) {
      setActiveLevelId((prev) => prev + 1);
    } else {
      // Completed all 20 levels!
      setCurrentScreen('LEVEL_SELECT');
    }
  }, [activeLevelId]);

  // Skin selection
  const handleSelectSkin = useCallback(
    (skin: MascotSkin) => {
      const updatedStats = { ...stats, activeSkin: skin };
      setStats(updatedStats);
      storageService.updateSkin(skin);
    },
    [stats]
  );

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    const next = !settings.soundEnabled;
    const updated = { ...settings, soundEnabled: next };
    setSettings(updated);
    audioEngine.setMuted(!next);
    storageService.save(levelsProgress, stats, updated);
  }, [settings, levelsProgress, stats]);

  // Reset all progress
  const handleResetData = useCallback(async () => {
    const reset = await storageService.resetProgress();
    setLevelsProgress(reset.levels);
    setStats(reset.stats);
    setActiveLevelId(1);
    setCurrentScreen('HOME');
  }, []);

  const highestUnlocked = levelsProgress.reduce(
    (max, l) => (l.unlocked ? Math.max(max, l.id) : max),
    1
  );

  const activeLevelDef = LEVELS.find((l) => l.id === activeLevelId) || LEVELS[0];
  const activeLevelProgress = levelsProgress.find((l) => l.id === activeLevelId) || {
    id: activeLevelId,
    unlocked: true,
    completed: false,
    stars: 0,
    attempts: 0,
    trollsCount: 0,
  };

  return (
    <div
      className={`relative w-full h-[100dvh] max-h-[100dvh] flex flex-col items-center justify-center bg-slate-950 text-slate-100 overflow-hidden font-sans ${
        settings.reducedMotion ? '' : 'transition-colors duration-300'
      }`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Portrait Container Clamped to 480px on desktop, full-width on mobile */}
      <main className="relative w-full max-w-md h-full flex flex-col justify-between z-10">
        {!isLoaded ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mb-4 shadow-xl animate-bounce">
              😈
            </div>
            <div className="font-display font-bold text-3xl text-white tracking-tight">
              TROLL<span className="text-amber-400">TAP</span>
            </div>
            <div className="text-xs font-mono text-slate-400 mt-1 mb-4">Preparing Mischief...</div>

            {/* Error or Slow Notice with Manual Play button */}
            {(showSlowNotice || initError) && (
              <div className="w-full max-w-xs p-3 rounded-2xl bg-slate-900 border border-amber-500/30 flex flex-col items-center gap-2 animate-comic-pop">
                <span className="text-[11px] text-amber-300 font-sans">
                  {initError || 'Connection standby. Ready to play!'}
                </span>
                <button
                  onClick={() => {
                    setIsLoaded(true);
                    platformAdapter.sendGameReady();
                  }}
                  className="btn-comic px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Enter Game ➔
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {currentScreen === 'HOME' && (
              <HomeScreen
                stats={stats}
                currentUnlockedLevel={highestUnlocked}
                onStartGame={() => {
                  setActiveLevelId(highestUnlocked);
                  setCurrentScreen('GAME');
                }}
                onOpenLevels={() => setCurrentScreen('LEVEL_SELECT')}
                onOpenStats={() => setCurrentScreen('STATS')}
                onOpenSettings={() => setCurrentScreen('SETTINGS')}
                onOpenHowToPlay={() => setShowHowToPlay(true)}
                soundEnabled={settings.soundEnabled}
                onToggleSound={handleToggleSound}
                isPlayablesActive={platformAdapter.isPlayablesActive()}
              />
            )}

            {currentScreen === 'GAME' && (
              <GameScreen
                level={activeLevelDef}
                levelProgress={activeLevelProgress}
                stats={stats}
                totalLevels={LEVELS.length}
                onWinLevel={handleWinLevel}
                onFailLevel={handleFailLevel}
                onNextLevel={handleNextLevel}
                onBackToLevels={() => setCurrentScreen('LEVEL_SELECT')}
                onBackToHome={() => setCurrentScreen('HOME')}
                soundEnabled={settings.soundEnabled}
                onToggleSound={handleToggleSound}
              />
            )}

            {currentScreen === 'LEVEL_SELECT' && (
              <LevelSelectScreen
                levels={LEVELS}
                progress={levelsProgress}
                onSelectLevel={(id) => {
                  setActiveLevelId(id);
                  setCurrentScreen('GAME');
                }}
                onBackToHome={() => setCurrentScreen('HOME')}
                trollPoints={stats.trollPoints}
              />
            )}

            {currentScreen === 'STATS' && (
              <StatsScreen
                stats={stats}
                totalLevels={LEVELS.length}
                onSelectSkin={handleSelectSkin}
                onBackToHome={() => setCurrentScreen('HOME')}
              />
            )}

            {currentScreen === 'SETTINGS' && (
              <SettingsScreen
                settings={settings}
                onUpdateSettings={(newSet) => {
                  setSettings(newSet);
                  storageService.save(levelsProgress, stats, newSet);
                }}
                onResetData={handleResetData}
                onBackToHome={() => setCurrentScreen('HOME')}
              />
            )}

            {showHowToPlay && (
              <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
