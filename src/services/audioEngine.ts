/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { platformAdapter } from './platformAdapter';

class CartoonAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;

  constructor() {
    // Listen to YouTube system audio state
    platformAdapter.subscribeAudio((permitted) => {
      if (!permitted && this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      } else if (permitted && !this.isMuted && this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    });

    // Listen to pause/resume
    platformAdapter.subscribePause((paused) => {
      if (paused && this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      } else if (!paused && !this.isMuted && this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    });
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    } else if (!muted && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  private canPlay(): boolean {
    if (this.isMuted) return false;
    if (!platformAdapter.isAudioAllowed()) return false;
    return true;
  }

  /**
   * Cartoon Spring Boing
   */
  public playBoing(): void {
    if (!this.canPlay()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);

    // Add comic wobble
    vibrato.frequency.setValueAtTime(18, now);
    vibratoGain.gain.setValueAtTime(45, now);
    vibrato.connect(osc.frequency);
    vibrato.start(now);
    vibrato.stop(now + 0.45);

    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /**
   * Cartoon Failure Buzzer / "Wah Wah"
   */
  public playBuzzer(): void {
    if (!this.canPlay()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.15);
    osc.frequency.setValueAtTime(95, now + 0.18);
    osc.frequency.linearRampToValueAtTime(80, now + 0.45);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.setValueAtTime(0.3 * this.volume, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Snappy Bubble/Balloon Pop
   */
  public playPop(): void {
    if (!this.canPlay()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Ascending Victory Fanfare (Triumph!)
   */
  public playFanfare(): void {
    if (!this.canPlay()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [
      { f: 523.25, d: 0.1, t: 0 },    // C5
      { f: 659.25, d: 0.1, t: 0.1 },  // E5
      { f: 783.99, d: 0.12, t: 0.2 }, // G5
      { f: 1046.50, d: 0.35, t: 0.32 }, // C6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startT = ctx.currentTime + n.t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, startT);

      gain.gain.setValueAtTime(0.35 * this.volume, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startT);
      osc.stop(startT + n.d);
    });
  }

  /**
   * Comic Troll Laugh ("Heh-Heh-Heh!")
   */
  public playTrollLaugh(): void {
    if (!this.canPlay()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const pulses = [
      { f: 440, t: 0 },
      { f: 490, t: 0.12 },
      { f: 440, t: 0.24 },
      { f: 530, t: 0.38 },
    ];

    pulses.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startT = ctx.currentTime + p.t;

      osc.type = 'square';
      osc.frequency.setValueAtTime(p.f, startT);
      osc.frequency.linearRampToValueAtTime(p.f * 0.85, startT + 0.09);

      gain.gain.setValueAtTime(0.18 * this.volume, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.09);
    });
  }

  /**
   * Clean UI Button Click
   */
  public playClick(): void {
    if (!this.canPlay()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Clock Tick for Countdown Puzzles
   */
  public playTick(): void {
    if (!this.canPlay()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * Cartoon Slide Whistle
   */
  public playSlideWhistle(ascending: boolean = true): void {
    if (!this.canPlay()) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (ascending) {
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);
    } else {
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
    }

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }
}

export const audioEngine = new CartoonAudioEngine();
