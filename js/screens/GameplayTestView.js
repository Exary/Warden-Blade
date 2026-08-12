import { Player } from '../entities/Player.js';
import { CHARACTER_ROSTER } from '../config/characterRoster.js';

const GROUND_Y = 460; // placeholder floor — no real tileset/collision wired up yet
const WALK_SPEED = 3;
const RUN_SPEED = 5.5;
const JUMP_FORCE = 13;
const GRAVITY = 0.6;
const DASH_SPEED = 11;
const DASH_DURATION_MS = 180;

/**
 * KEYBINDING SCHEME (left hand = movement, right hand = abilities)
 * ------------------------------------------------------------------
 *  A / D      Move left / right (also sets attack facing direction)
 *  Shift      Run (hold)
 *  Space      Jump / Wall-jump (press again near a wall edge to climb)
 *  Ctrl       Dash
 *  J          Attack (sword)
 *  K          Mele / kick — placeholder uses 'Spell 2' at 2x speed
 *  L          Secondary ability (Beam) — placeholder uses 'Spell'
 *  I          Supercooling — reserved, not implemented yet
 *  U          Ground Pound (Pisotón) — reserved, not implemented yet
 * Parry has no dedicated key — it triggers automatically when Attack or
 * Mele lands on an enemy attack hitbox (not simulated yet, no enemies here).
 */

export async function mountGameplayTestView(contentEl) {
  contentEl.innerHTML = `
    <div id="game-container"></div>
    <div id="gameplay-legend">
      <b>Controls</b><br>
      A / D — Move &nbsp; | &nbsp; Shift — Run &nbsp; | &nbsp; Space — Jump (again near edge = wall-jump)<br>
      Ctrl — Dash &nbsp; | &nbsp; J — Attack &nbsp; | &nbsp; K — Mele &nbsp; | &nbsp; L — Beam<br>
      I — Supercooling (n/a) &nbsp; | &nbsp; U — Ground Pound (n/a)
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

  const characterEntry = CHARACTER_ROSTER[0]; // Fire Warrior — only one for now
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
  let actionLock = false; // true while a one-shot ability animation is playing

  function showToast(message) {
    const toast = document.getElementById('gameplay-toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('visible'), 1200);
  }

  function playOneShot(name, speedMultiplier = 1) {
    actionLock = true;
    player.setState(name, speedMultiplier, true);
    player.sprite.loop = false;
    player.sprite.onComplete = () => {
      actionLock = false;
      player.sprite.onComplete = null;
    };
  }

  // ------------------------------------------------------------------
  // One-shot ability inputs (fire on keydown, not while held)
  // ------------------------------------------------------------------
  function handleKeyDown(e) {
    if (keys[e.code]) return; // ignore auto-repeat while held
    keys[e.code] = true;

    if (actionLock) return; // let the current ability animation finish first

    switch (e.code) {
      case 'KeyJ': // Attack
        playOneShot('Attack');
        break;
      case 'KeyK': // Mele (kick) — reuses Spell 2 at 2x speed, faster/punchier
        playOneShot('Spell 2', 2);
        break;
      case 'KeyL': // Secondary ability (Beam)
        playOneShot('Spell');
        break;
      case 'KeyI': // Supercooling — not implemented yet
        showToast('Supercooling — not implemented yet');
        break;
      case 'KeyU': // Ground Pound — not implemented yet
        showToast('Ground Pound — not implemented yet');
        break;
      case 'ControlLeft':
      case 'ControlRight':
        if (!dashing && grounded) {
          dashing = true;
          dashTimeLeft = DASH_DURATION_MS;
        }
        break;
      case 'Space':
        if (grounded) {
          velocityY = -JUMP_FORCE;
          grounded = false;
        } else if (canWallJump) {
          velocityY = -JUMP_FORCE;
          canWallJump = false;
        }
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
    const running = keys['ShiftLeft'] || keys['ShiftRight'];

    // --- Dash (overrides normal horizontal movement while active) ---
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

    // --- Animation state (skipped while a one-shot ability is playing) ---
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
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    app.destroy(true, { children: true });
  };
}
