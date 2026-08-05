import { loadFrameAnimation } from '../core/FrameAnimLoader.js';

export class Enemy {
  constructor(config) {
    this.config = config;
    this.animations = {};
    this.sprite = null;
    this.currentState = null;
  }

  async load() {
    for (const [name, def] of Object.entries(this.config.animations)) {
      this.animations[name] = await loadFrameAnimation(
        this.config.basePath,
        def.prefix,
        def.count
      );
    }

    this.sprite = new PIXI.AnimatedSprite(this.animations.idle);
    this.sprite.anchor.set(0.5, 1);
    this.setState('idle');
    this.sprite.play();
    return this.sprite;
  }

  setState(name) {
    if (this.currentState === name || !this.animations[name]) return;
    this.currentState = name;

    const fps = this.config.fps[name] || 8;
    const isOneShot = name === 'dead' || name.startsWith('attack') || name === 'hit';

    this.sprite.textures = this.animations[name];
    this.sprite.animationSpeed = fps / 60;
    this.sprite.loop = !isOneShot;
    this.sprite.gotoAndPlay(0);
  }
}
