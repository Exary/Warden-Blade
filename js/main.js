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
// Main menu — loads immediately on page load
// ------------------------------------------------------------------
const menuScreen = new MenuScreen(document.getElementById('menu-bg-container'));
await menuScreen.init();

// ------------------------------------------------------------------
// Animation Tests screen — only loaded the first time it's opened
// (avoids loading Odysseus' 205 frames before they're needed)
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

// ------------------------------------------------------------------
// Placeholder buttons — not implemented yet
// ------------------------------------------------------------------
document.getElementById('btn-play').addEventListener('click', () => {
  alert('Gameplay is not implemented yet — coming soon!');
});

document.getElementById('btn-options').addEventListener('click', () => {
  alert('Options menu not implemented yet.');
});

document.getElementById('btn-quit').addEventListener('click', () => {
  alert('Browsers do not allow web pages to close themselves for security reasons — this button is a placeholder for now.');
});
