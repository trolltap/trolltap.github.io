# TrollTap — Think. Tap. Get Trolled.

> A mobile-first, portrait-oriented HTML5 rage-comedy trick puzzle game engineered for high-retention casual play and compliant integration with the **YouTube Playables SDK**.

---

## 1. Project Overview

**TrollTap** challenges players with deceptively simple instructions that conceal hilarious, deterministic trick-puzzle mechanics. Inspired by lateral-thinking classics like *The Impossible Quiz* and *Brain Out*, every level is 100% solvable without relying on random luck or broken hitboxes.

### Core Features
- **20 Distinct Handcrafted Levels**: Every level features a unique mechanic (reverse logic, fake UI buttons, moving exits, multi-touch drag puzzles, countdown defusals, physical seesaw balancing, dark room flashlights, and a 3-round Troll King boss showdown).
- **Animated Troll Meter**: Falling for obvious traps awards +10 Troll Points, unlocking original comic villain cosmetic skins and trophies.
- **Original Comic Villain Mascot (Impish)**: An expressive, original cartoon SVG character with real-time facial reactions (smug, laughing, dizzy/shocked, angry rage, and triumph).
- **Cartoon Soundboard (Web Audio API)**: Zero-dependency procedural synthesis generating comic boings, buzzers, slide whistles, tick-tocks, and triumph fanfares.
- **Dual Persistence Strategy**: Automatic handshake with YouTube Playables Cloud Storage (`ytgame.game.loadData` / `ytgame.game.saveData`) with seamless offline fallback to `localStorage`.

---

## 2. YouTube Playables Integration Layer

All platform-specific code is isolated in `src/services/platformAdapter.ts` adhering strictly to current official YouTube Playables SDK v1 standards:

1. **SDK Script Inclusion**: Included in `index.html` via `<script src="https://www.youtube.com/game_api/v1"></script>`.
2. **Lifecycle Handshake**:
   - `ytgame.game.firstFrameReady()`: Invoked upon initial DOM mount when the loading container begins rendering.
   - `ytgame.game.gameReady()`: Invoked strictly when all level configurations, procedural audio contexts, and storage records are loaded and interactive.
3. **Audio Management**:
   - Subscribed to `ytgame.system.onAudioEnabledChange(cb)` to synchronize system audio mutes with the game's Web Audio master output.
   - Mute state persists across soft reloads.
4. **Pause & Resume**:
   - Subscribed to `ytgame.system.onPause(cb)` and `ytgame.system.onResume(cb)`.
   - Halts all active countdown timers (Level 1, Level 6, Level 9) and suspends audio rendering when platform overlays open or window blurs.
5. **Cloud Save Contract**:
   - Complies with YouTube's strict rule requiring `await ytgame.game.loadData()` to be called prior to `saveData()`.

---

## 3. Extending & Adding Levels

Levels are defined in `src/data/levels.ts` using the clean `LevelDefinition` interface:

```typescript
export interface LevelDefinition {
  id: number;
  title: string;
  instruction: string;
  hint: string;
  trollTrapExplanation: string;
  winExplanation: string;
  category: 'logic' | 'fake_ui' | 'timing' | 'physics' | 'reflex';
  estimatedSeconds: number;
}
```

To add a new level:
1. Append a new object to the `LEVELS` array in `src/data/levels.ts`.
2. Implement the corresponding case block in `src/components/PuzzleStage.tsx` with deterministic `triggerWin()` and `triggerFail(reason)` callbacks.

---

## 4. Local Development & Static Hosting

### Running Locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

### Building for Static Hosting (GitHub Pages, Cloudflare Pages, Netlify, Vercel)
```bash
npm run build
```
The production bundle will be output to `/dist`. It contains pure static HTML, CSS, and JS with zero server-side runtime requirements.

---

## 5. Testing & Verification Checklist

- [x] **20 / 20 Handcrafted Levels Solvable**: Each stage has an exact discoverable solution.
- [x] **Instant Retry (<100ms)**: Pressing `R` or tapping `Retry` immediately resets the active stage state without memory leaks or duplicated listeners.
- [x] **Troll Meter & Unlocks**: Accumulating points unlocks the Fancy Imp (20 pts), Cyber Imp (50 pts), and King Imp (80 pts).
- [x] **Soundboard Resiliency**: Procedural Web Audio API synthesizer gracefully starts after user interaction and respects master mute and browser tab visibility.
- [x] **Responsive Viewport**: Portrait 9:16 mobile-first layout with desktop clamping (`max-w-md`) and touch gesture support.
- [x] **YouTube Playables Certification Diagnostics**: Settings menu displays live SDK availability and method verification status.
