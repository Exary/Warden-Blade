import { getVolume, setVolume, onVolumeChange } from '../core/AudioSettings.js';

const STEP = 0.1;
const BAR_COUNT = 10;
const HIDE_DELAY_MS = 1400;

let hudEl = null;
let hideTimer = null;

function buildHUD() {
  const wrapper = document.createElement('div');
  wrapper.id = 'volume-hud';

  const bars = document.createElement('div');
  bars.id = 'volume-bars';
  for (let i = 0; i < BAR_COUNT; i++) {
    const bar = document.createElement('span');
    bar.className = 'volume-bar';
    bars.appendChild(bar);
  }

  const label = document.createElement('div');
  label.id = 'volume-label';
  label.textContent = 'VOLUME';

  wrapper.appendChild(bars);
  wrapper.appendChild(label);
  document.body.appendChild(wrapper);
  return wrapper;
}

function render(volume) {
  if (!hudEl) hudEl = buildHUD();

  const filledCount = Math.round(volume * BAR_COUNT);
  hudEl.querySelectorAll('.volume-bar').forEach((el, i) => {
    el.classList.toggle('filled', i < filledCount);
  });

  hudEl.classList.add('visible');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => hudEl.classList.remove('visible'), HIDE_DELAY_MS);
}

/**
 * Wires the 9 / 0 keys to lower/raise the shared volume, and shows a
 * temporary bar HUD (Pixeloid-styled) whenever it changes.
 *
 * NOTE: this is drawn with CSS, not sliced from the Basic Pixel Health
 * bar / Scroll bar UI pack — that sheet's bar segments are packed too
 * tightly together to reliably auto-detect individual frames without a
 * source file. Swap this out for the real sprite once we have clean
 * per-frame data for it.
 */
export function initVolumeHUD() {
  window.addEventListener('keydown', (e) => {
    if (e.key === '9') render(setVolume(getVolume() - STEP));
    if (e.key === '0') render(setVolume(getVolume() + STEP));
  });

  onVolumeChange(render);
}
