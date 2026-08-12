import { loadAsepriteSheet } from '../core/AsepriteSheetLoader.js';

export class Player {
  constructor(jsonUrl, imageUrl) {
    this.jsonUrl = jsonUrl;
    this.imageUrl = imageUrl;
    this.animations = {}; // { Idle: [tex...], Walk: [tex...], ... }
    this.sprite = null;
    this.currentState = null;
  }

  async load() {
    const { animations } = await loadAsepriteSheet(this.jsonUrl, this.imageUrl);
    this.animations = animations;

    this.sprite = new PIXI.AnimatedSprite(this.animations.Idle);
    // All frames share the same 126x92 canvas (untrimmed export), so a
    // fixed anchor stays visually consistent across every animation —
    // this is what fixes the "floating torso" jitter.
    this.sprite.anchor.set(0.5, 1);
    this.setState('Idle');
    this.sprite.play();
    return this.sprite;
  }

  /**
   * Switches to a named animation, e.g. player.setState('Walk')
   * speedMultiplier lets a caller play the same animation faster/slower
   * without needing a duplicate animation — e.g. Mele reuses 'Spell 2' at
   * 2x speed so it reads as a quicker, punchier hit than a normal cast.
   */
  setState(name, speedMultiplier = 1, force = false) {
    if ((this.currentState === name && !force) || !this.animations[name]) return;
    this.currentState = name;

    const isOneShot = ['Attack', 'JumpAttack', 'CrouchAttack', 'Hit', 'HitEff', 'Death', 'DeathEff', 'transformation', 'Spell', 'Spell 2'].includes(name);

    this.sprite.textures = this.animations[name];
    this.sprite.animationSpeed = 0.2 * speedMultiplier;
    this.sprite.loop = !isOneShot;
    this.sprite.gotoAndPlay(0);
  }

  /** Lists all available animation names (useful for a debug panel) */
  getAnimationNames() {
    return Object.keys(this.animations);
  }
}
