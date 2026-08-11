import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { ENEMY1_CONFIG } from '../config/enemyAnimations.js';

export async function initAnimationTestScreen() {
  const debugPanel = document.getElementById('debug-panel');
  debugPanel.innerHTML = '<p>Loading assets...</p>';

  const app = new PIXI.Application();
  await app.init({
    width: 960,
    height: 540,
    backgroundColor: 0x1a1a1a,
    antialias: false,
    roundPixels: true,
  });
  document.getElementById('game-container').appendChild(app.canvas);

  // ------------------------------------------------------------------
  // Odysseus (Fire_Warrior) — loaded from the real JSON exported via
  // LibreSprite, with named animations and a consistent anchor point.
  // ------------------------------------------------------------------
  const player = new Player(
    'Assets/Fire_Warrior/Fire_WarriorAseprite/Fire_Warrior.json',
    'Assets/Fire_Warrior/Fire_WarriorAseprite/Fire_Warrior.png'
  );
  const playerSprite = await player.load();
  playerSprite.x = 300;
  playerSprite.y = 420;
  playerSprite.scale.set(2.5);
  app.stage.addChild(playerSprite);

  // ------------------------------------------------------------------
  // Enemy 1 (Hero and Opponents)
  // ------------------------------------------------------------------
  const enemy = new Enemy(ENEMY1_CONFIG);
  const enemySprite = await enemy.load();
  enemySprite.x = 680;
  enemySprite.y = 420;
  enemySprite.scale.set(2.5);
  app.stage.addChild(enemySprite);

  // ------------------------------------------------------------------
  // Debug panel: real animation names, click to preview
  // ------------------------------------------------------------------
  const animNames = player.getAnimationNames();
  debugPanel.innerHTML = `<p><b>${animNames.length} named animations loaded for Odysseus.</b><br>
Click any button to preview it on the character.</p>`;

  let debugPreviewActive = false;

  animNames.forEach((name) => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.onclick = () => {
      debugPreviewActive = true; // locks the preview until a real input takes over
      player.setState(name);
    };
    debugPanel.appendChild(btn);
  });

  // ------------------------------------------------------------------
  // Basic test movement, wired to the real named animations
  // ------------------------------------------------------------------
  const keys = {};
  window.addEventListener('keydown', (e) => (keys[e.key] = true));
  window.addEventListener('keyup', (e) => (keys[e.key] = false));

  app.ticker.add(() => {
    const moving = keys['ArrowRight'] || keys['ArrowLeft'];

    if (keys['ArrowRight']) {
      playerSprite.x += 3;
      playerSprite.scale.x = Math.abs(playerSprite.scale.x);
      debugPreviewActive = false;
    }
    if (keys['ArrowLeft']) {
      playerSprite.x -= 3;
      playerSprite.scale.x = -Math.abs(playerSprite.scale.x);
      debugPreviewActive = false;
    }

    if (!debugPreviewActive) {
      player.setState(moving ? 'Walk' : 'Idle');
    }

    // Simple enemy: walks in place to test the "walk" state
    enemy.setState('walk');
  });
}
