import { ParallaxBackground } from './ParallaxBackground.js';
import { getVolume, onVolumeChange } from '../core/AudioSettings.js';

/**
 * The Synth Cities Environment pack (ansimuz) ships four usable
 * background scenes across its "city skyline", "Version 1", and
 * "Version 2" folders, each as a 3-layer parallax set. "Version 2" has
 * two interchangeable foreground layers (with/without traffic) — treated
 * here as two separate entries.
 *
 * NOTE: the pack only includes ONE music track total
 * (cyberpunk-street.mp3) — every scene reuses it for now. If more tracks
 * are added later, just point each entry's `music` field at its own file.
 *
 * Speed values are estimates (farthest = slowest, nearest = fastest).
 * The pack doesn't ship a JSON with exact scroll speeds for web/JS —
 * only a separate Godot project file does, which we don't have. Tune
 * these by eye once you see it running.
 */
const MUSIC_TRACK = 'Assets/Synth_Cities/cyberpunk-street-files/Assets/music/cyberpunk-street.mp3';

const BACKGROUND_SETS = [
  {
    name: 'Synth Cities',
    layers: [
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/city skyline/Layers/back.png', speed: 0.2 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/city skyline/Layers/buildings.png', speed: 0.5 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/city skyline/Layers/front.png', speed: 1.1 },
    ],
    music: MUSIC_TRACK,
  },
  {
    name: 'Cyberpunk Street',
    layers: [
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 1/PNG/layers/far-buildings.png', speed: 0.2 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 1/PNG/layers/back-buildings.png', speed: 0.5 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 1/PNG/layers/foreground.png', speed: 1.1 },
    ],
    music: MUSIC_TRACK,
  },
  {
    name: 'Version 2 (with traffic)',
    layers: [
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 2/Layers/back.png', speed: 0.2 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 2/Layers/middle.png', speed: 0.5 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 2/Layers/foreground.png', speed: 1.1 },
    ],
    music: MUSIC_TRACK,
  },
  {
    name: 'Version 2 (empty street)',
    layers: [
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 2/Layers/back.png', speed: 0.2 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 2/Layers/middle.png', speed: 0.5 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 2/Layers/foreground-empty.png', speed: 1.1 },
    ],
    music: MUSIC_TRACK,
  },
];

const SWITCH_INTERVAL_MS = 25000; // how long each background stays up before alternating
const FADE_DURATION_MS = 1200; // crossfade length between backgrounds

export class MenuScreen {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.app = null;
    this.backgrounds = []; // active ParallaxBackground instances (usually 1, briefly 2 during a crossfade)
    this.currentIndex = -1;
    this.switchTimer = null;

    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = getVolume();
    onVolumeChange((v) => (this.audio.volume = v));
  }

  async init() {
    this.app = new PIXI.Application();
    await this.app.init({
      resizeTo: this.containerEl,
      backgroundColor: 0x0a0a12,
      antialias: false,
    });
    this.containerEl.appendChild(this.app.canvas);

    this.app.ticker.add((ticker) => {
      this.backgrounds.forEach((bg) => bg.update(ticker.deltaTime));
    });

    window.addEventListener('resize', () => {
      this.backgrounds.forEach((bg) => bg.resize());
    });

    await this.showBackground(0);
    this.scheduleNextSwitch();

    // Browsers block autoplay with sound until the user interacts with the
    // page at least once — this retries playback on the first click/keypress.
    const resumeAudio = () => {
      this.audio.play().catch(() => {});
      window.removeEventListener('pointerdown', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
    };
    window.addEventListener('pointerdown', resumeAudio);
    window.addEventListener('keydown', resumeAudio);
  }

  async showBackground(index) {
    this.currentIndex = index;
    const set = BACKGROUND_SETS[index];

    const newBackground = new ParallaxBackground(this.app, set.layers);
    await newBackground.load();

    const oldBackground = this.backgrounds[0] || null;
    newBackground.container.alpha = oldBackground ? 0 : 1;
    this.app.stage.addChild(newBackground.container);
    this.backgrounds.push(newBackground);

    if (oldBackground) {
      await this.crossfade(oldBackground, newBackground);
      this.backgrounds = this.backgrounds.filter((bg) => bg !== oldBackground);
      oldBackground.destroy();
    }

    const newSrc = encodeURI(set.music);
    if (this.audio.src !== new URL(newSrc, window.location.href).href) {
      this.audio.src = newSrc;
      this.audio.play().catch(() => {
        // Blocked until user interacts with the page — handled above.
      });
    }
  }

  /** Fades oldBg out and newBg in simultaneously over FADE_DURATION_MS */
  crossfade(oldBg, newBg) {
    return new Promise((resolve) => {
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / FADE_DURATION_MS);
        oldBg.container.alpha = 1 - t;
        newBg.container.alpha = t;
        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });
  }

  scheduleNextSwitch() {
    this.switchTimer = setTimeout(async () => {
      const nextIndex = (this.currentIndex + 1) % BACKGROUND_SETS.length;
      await this.showBackground(nextIndex);
      this.scheduleNextSwitch();
    }, SWITCH_INTERVAL_MS);
  }

  destroy() {
    clearTimeout(this.switchTimer);
    this.audio.pause();
    this.backgrounds.forEach((bg) => bg.destroy());
    if (this.app) this.app.destroy(true);
  }
}
