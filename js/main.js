import { MenuScreen } from './screens/MenuScreen.js';

// Keeps pixel art crisp when scaled up (default is smooth/blurry linear scaling)
PIXI.TextureSource.defaultOptions.scaleMode = 'nearest';

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

document.getElementById('btn-back-to-menu').addEventListener('click', () => {
  showScreen('menu');
});

document.getElementById('btn-play').addEventListener('click', () => {
  alert('Gameplay is not implemented yet — coming soon!');
});

document.getElementById('btn-options').addEventListener('click', () => {
  alert('Options menu not implemented yet.');
});

document.getElementById('btn-quit').addEventListener('click', () => {
  alert('Browsers do not allow web pages to close themselves for security reasons — this button is a placeholder for now.');
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

