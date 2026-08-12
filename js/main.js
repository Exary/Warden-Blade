import { MenuScreen } from './screens/MenuScreen.js';
import { initVolumeHUD } from './ui/VolumeHUD.js';
import { showCredits } from './ui/CreditsModal.js';

// Keeps pixel art crisp when scaled up (default is smooth/blurry linear scaling)
PIXI.TextureSource.defaultOptions.scaleMode = 'nearest';

// Volume control (9 = down, 0 = up) — works on every screen
initVolumeHUD();

const screens = {
  menu: document.getElementById('screen-menu'),
  animtest: document.getElementById('screen-animtest'),
};

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('active', key === name);
  });
}

// ------------------------------------------------------------------
// Button wiring happens FIRST, before loading anything heavy — this
// way the menu stays clickable/functional even if the background or
// music fails to load for some reason (missing file, wrong path, etc).
// ------------------------------------------------------------------
let animTestInitialized = false;

document.getElementById('btn-animtest').addEventListener('click', async () => {
  showScreen('animtest');
  if (!animTestInitialized) {
    animTestInitialized = true;
    const { initAnimationTestScreen } = await import('./screens/AnimationTestScreen.js');
    await initAnimationTestScreen();
  }
});

// The animation test screen's sidebar dispatches this instead of holding
// its own reference back to the menu-switching logic.
document.addEventListener('warden:back-to-menu', () => {
  showScreen('menu');
});

document.getElementById('btn-play').addEventListener('click', () => {
  alert('Gameplay is not implemented yet — coming soon!');
});

document.getElementById('btn-options').addEventListener('click', () => {
  alert('Options menu not implemented yet.');
});

document.getElementById('btn-credits').addEventListener('click', () => {
  showCredits();
});

// ------------------------------------------------------------------
// Main menu background/music — loaded after buttons are already wired.
// Wrapped in try/catch so a failed asset load doesn't break navigation.
// ------------------------------------------------------------------
const menuScreen = new MenuScreen(document.getElementById('menu-bg-container'));
try {
  await menuScreen.init();
} catch (err) {
  console.error('Menu background failed to load — buttons still work.', err);
}
