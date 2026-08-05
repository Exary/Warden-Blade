import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { ENEMY1_CONFIG } from './config/enemyAnimations.js';

const debugPanel = document.getElementById('debug-panel');
debugPanel.innerHTML = '<p>Loading assets...</p>';

const app = new PIXI.Application();
await app.init({
  width: 960,
  height: 540,
  backgroundColor: 0x1a1a1a,
  antialias: false,
});
document.getElementById('game-container').appendChild(app.canvas);

// ------------------------------------------------------------------
// Odysseus (Fire_Warrior) — uses the NoEffect version as a "clean" base
// ------------------------------------------------------------------
const player = new Player(
  'Assets/Fire_Warrior/Fire_Warrior/Fire_Warrior/Fire_WarriorNoEffect-Sheet.png'
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
// Debug panel: the Fire_Warrior sheet doesn't come with row labels,
// so we need to eyeball each row to figure out which animation it is.
// Click each button to preview it on the character.
// ------------------------------------------------------------------
debugPanel.innerHTML = `<p><b>${player.rows.length} animation rows detected in Fire_Warrior.</b><br>
Click each one to preview it, and note the number down — we'll need it to build
the final animation mapping (idle, walk, dash, etc.) in the next step.</p>`;

player.rows.forEach((row, i) => {
  const btn = document.createElement('button');
  btn.textContent = `Row ${i} (${row.length} frames)`;
  btn.onclick = () => player.setRow(i);
  debugPanel.appendChild(btn);
});

// ------------------------------------------------------------------
// Very basic test movement (just to see the sprite respond)
// Placeholder: once we identify which row is "walk", this will hook
// into the real animation instead of just moving the still sprite.
// ------------------------------------------------------------------
const keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

app.ticker.add(() => {
  if (keys['ArrowRight']) {
    playerSprite.x += 3;
    playerSprite.scale.x = Math.abs(playerSprite.scale.x);
  }
  if (keys['ArrowLeft']) {
    playerSprite.x -= 3;
    playerSprite.scale.x = -Math.abs(playerSprite.scale.x);
  }

  // Simple enemy: walks in place to test the "walk" state
  enemy.setState('walk');
});
