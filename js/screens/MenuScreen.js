import { ParallaxBackground } from './ParallaxBackground.js';
import { getVolume, onVolumeChange } from '../core/AudioSettings.js';

/**
 * The Synth Cities Environment pack (ansimuz) ships two distinct
 * background scenes, each as a 3-layer parallax set.
 *
 * NOTE: the pack only includes ONE music track total
 * (cyberpunk-street.mp3) — both scenes reuse it for now. If a second
 * track is added later for the "Synth Cities" (dusk) scene, just point
 * its `music` field at the new file.
 *
 * Speed values are estimates (farthest = slowest, nearest = fastest).
 * The pack doesn't ship a JSON with exact scroll speeds for web/JS —
 * only a separate Godot project file does, which we don't have. Tune
 * these by eye once you see it running.
 */
const BACKGROUND_SETS = [
  {
    name: 'Synth Cities',
    layers: [
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/city skyline/Layers/back.png', speed: 0.2 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/city skyline/Layers/buildings.png', speed: 0.5 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/city skyline/Layers/front.png', speed: 1.1 },
    ],
    music: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/music/cyberpunk-street.mp3',
  },
  {
    name: 'Cyberpunk Street',
    layers: [
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 1/PNG/layers/far-buildings.png', speed: 0.2 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 1/PNG/layers/back-buildings.png', speed: 0.5 },
      { path: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/Version 1/PNG/layers/foreground.png', speed: 1.1 },
    ],
    music: 'Assets/Synth_Cities/cyberpunk-street-files/Assets/music/cyberpunk-street.mp3',
  },
];

const SWITCH_INTERVAL_MS = 25000; // how long each background stays up before alternating

export class MenuScreen {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.app = null;
    this.background = null;
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
      if (this.background) this.background.update(ticker.deltaTime);
    });

    window.addEventListener('resize', () => this.background?.resize());

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

    if (this.background) {
      this.background.destroy();
    }

    this.background = new ParallaxBackground(this.app, set.layers);
    await this.background.load();
    this.app.stage.addChild(this.background.container);

    const newSrc = encodeURI(set.music);
    if (this.audio.src !== new URL(newSrc, window.location.href).href) {
      this.audio.src = newSrc;
      this.audio.play().catch(() => {
        // Blocked until user interacts with the page — handled above.
      });
    }
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
    if (this.background) this.background.destroy();
    if (this.app) this.app.destroy(true);
  }
}
