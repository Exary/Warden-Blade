import { Player } from '../entities/Player.js';
import { CHARACTER_ROSTER } from '../config/characterRoster.js';

const GROUND_Y = 460; // placeholder floor — no real tileset/collision wired up yet
const WALK_SPEED = 3;
const RUN_SPEED = 5.5;
const JUMP_FORCE = 13;
const GRAVITY = 0.6;
const DASH_SPEED = 11;
const DASH_DURATION_MS = 180;

const ATTACK_COMBO_HITS = 3; // the 'Attack' tag bakes in 3 sword swings — split into 1 per press
const COMBO_WINDOW_MS = 700; // reset to hit 1 if you wait too long between presses

/**
 * KEYBINDING SCHEME
 * ------------------------------------------------------------------
 * Left hand does ONLY aiming/walking (A/D) — W/S are deliberately left
 * free for future vertical aiming (up-attack, pogo, etc). Everything
 * else (jump, run, dash, and all abilities) lives on the right hand,
 * across two comfortable rows (J/K/L home row, U/I/O/P/H upper row) so
 * the hand never has to leave its resting position. Letters only —
 * Ctrl/Shift/Space can trigger browser/OS shortcuts on some setups.
 *
 *  A / D      Move left / right (also sets facing + attack direction)
 *  I          Jump / Wall-jump (press again near a wall edge to climb)
 *  U          Dash — works in the air too
 *  O          Run (hold)
 *  J          Attack (sword) — 3-hit combo, one slash per press
 *  K          Mele / kick — placeholder uses 'Spell 2' at 2x speed
 *  L          Secondary ability (Beam) — placeholder uses 'Spell'
 *  P          Supercooling — reserved, not implemented yet
 *  H          Ground Pound (Pisotón) — reserved, not implemented yet
 * Parry has no dedicated key — it triggers automatically when Attack or
 * Mele lands on an enemy attack hitbox (not simulated yet, no enemies here).
 */

export async function mountGameplayTestView(contentEl) {
  contentEl.innerHTML = `
    <div id="game-container"></div>
    <div id="gameplay-legend">
      <b>Controls</b><br>
      A / D — Move &nbsp; | &nbsp; O — Run &nbsp; | &nbsp; I — Jump (again near edge = wall-jump) &nbsp; | &nbsp; U — Dash (works in air)<br>
      J — Attack (combo) &nbsp; | &nbsp; K — Mele &nbsp; | &nbsp; L — Beam &nbsp; | &nbsp; P — Supercooling (n/a) &nbsp; | &nbsp; H — Ground Pound (n/a)
    </div>
    <div id="gameplay-toast"></div>
  `;

  const app = new PIXI.Application();
  await app.init({
    width: 960,
    height: 540,
    backgroundColor: 0x1a1a1a,
    antialias: false,
    roundPixels: true,
  });
  document.getElementById('game-container').appendChild(app.canvas);

  // Placeholder ground line so jump/gravity has something to land on
  const groundGraphic = new PIXI.Graphics()
    .rect(0, GROUND_Y, 960, 4)
    .fill(0x444444);
  app.stage.addChild(groundGraphic);

  const characterEntry = CHARACTER_ROSTER.find((c) => c.jsonUrl); // first fully-wired character
  const player = new Player(characterEntry.jsonUrl, characterEntry.imageUrl);
  const playerSprite = await player.load();
  playerSprite.x = 300;
  playerSprite.y = GROUND_Y;
  playerSprite.scale.set(2.5);
  app.stage.addChild(playerSprite);

  // ------------------------------------------------------------------
  // State
  // ------------------------------------------------------------------
  const keys = {};
  let facing = 1; // 1 = right, -1 = left
  let velocityY = 0;
  let grounded = true;
  let canWallJump = false; // reset when touching a screen edge (fake "wall" for now)
  let dashing = false;
  let dashTimeLeft = 0;
  let actionLock = false; // true while Attack/Mele/Beam is mid-animation

  let comboIndex = 0;
  let comboResetTimer = null;

  function showToast(message) {
    const toast = document.getElementById('gameplay-toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('visible'), 1200);
  }

  function endActionLock() {
    actionLock = false;
    player.sprite.onComplete = null;
  }

  function playOneShot(name, speedMultiplier = 1) {
    actionLock = true;
    player.setState(name, speedMultiplier, true);
    player.sprite.onComplete = endActionLock;
  }

  function playAttackHit() {
    actionLock = true;
    player.playFrameSlice('Attack', comboIndex, ATTACK_COMBO_HITS);
    player.sprite.onComplete = endActionLock;

    comboIndex = (comboIndex + 1) % ATTACK_COMBO_HITS;
    clearTimeout(comboResetTimer);
    comboResetTimer = setTimeout(() => {
      comboIndex = 0;
    }, COMBO_WINDOW_MS);
  }

  function startDash() {
    dashing = true;
    dashTimeLeft = DASH_DURATION_MS;
  }

  function startJump() {
    if (grounded) {
      velocityY = -JUMP_FORCE;
      grounded = false;
    } else if (canWallJump) {
      velocityY = -JUMP_FORCE;
      canWallJump = false;
    }
  }

  // ------------------------------------------------------------------
  // Input — Jump and Dash are handled completely outside the ability
  // lock, unconditionally, so they always work: mid-attack, mid-beam,
  // in the air, doesn't matter. Only J/K/L (the abilities themselves)
  // lock each other out while one is mid-animation.
  // ------------------------------------------------------------------
  function handleKeyDown(e) {
    if (keys[e.code]) return; // ignore auto-repeat while held
    keys[e.code] = true;

    if (e.code === 'KeyI') {
      startJump();
      return;
    }

    if (e.code === 'KeyU') {
      if (!dashing) startDash(); // no ground requirement — air dash allowed
      return;
    }

    if (actionLock) return; // let the current ability animation finish first

    switch (e.code) {
      case 'KeyJ': // Attack — one slash per press, cycling through the 3-hit combo
        playAttackHit();
        break;
      case 'KeyK': // Mele (kick) — reuses Spell 2 at 2x speed, faster/punchier
        playOneShot('Spell 2', 2);
        break;
      case 'KeyL': // Secondary ability (Beam)
        playOneShot('Spell');
        break;
      case 'KeyP': // Supercooling — not implemented yet
        showToast('Supercooling — not implemented yet');
        break;
      case 'KeyH': // Ground Pound — not implemented yet
        showToast('Ground Pound — not implemented yet');
        break;
    }
  }

  function handleKeyUp(e) {
    keys[e.code] = false;
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // ------------------------------------------------------------------
  // Main loop
  // ------------------------------------------------------------------
  app.ticker.add(() => {
    const moveLeft = keys['KeyA'];
    const moveRight = keys['KeyD'];
    const running = keys['KeyO'];

    // --- Dash (overrides normal horizontal movement while active,
    // but does NOT touch vertical velocity — so an air dash keeps
    // falling/rising naturally instead of freezing height) ---
    if (dashing) {
      playerSprite.x += DASH_SPEED * facing;
      dashTimeLeft -= app.ticker.deltaMS;
      if (dashTimeLeft <= 0) dashing = false;
    } else {
      const speed = running ? RUN_SPEED : WALK_SPEED;
      if (moveLeft) {
        playerSprite.x -= speed;
        facing = -1;
      }
      if (moveRight) {
        playerSprite.x += speed;
        facing = 1;
      }
      playerSprite.scale.x = Math.abs(playerSprite.scale.x) * facing;
    }

    // --- Gravity / ground collision (placeholder floor) ---
    velocityY += GRAVITY;
    playerSprite.y += velocityY;
    if (playerSprite.y >= GROUND_Y) {
      playerSprite.y = GROUND_Y;
      velocityY = 0;
      grounded = true;
    }

    // --- Fake "walls" at the screen edges, just to test wall-jump input
    // until real level geometry exists ---
    canWallJump = !grounded && (playerSprite.x <= 40 || playerSprite.x >= 920);

    // --- Animation state (skipped while an attack/ability is playing —
    // it's allowed to keep playing through a jump/dash on top of it) ---
    if (!actionLock && !dashing) {
      const moving = moveLeft || moveRight;
      if (!grounded) {
        player.setState('Jump');
      } else if (moving && running) {
        player.setState('Run');
      } else if (moving) {
        player.setState('Walk');
      } else {
        player.setState('Idle');
      }
    } else if (dashing) {
      player.setState('Dash', 1, true);
    }
  });

  return function destroy() {
    clearTimeout(comboResetTimer);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    app.destroy(true, { children: true });
  };
}
