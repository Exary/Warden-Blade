/**
 * ParallaxBackground
 * ---------------------
 * Loads a set of layered images and scrolls each one horizontally
 * (right to left) at its own speed, using PIXI.TilingSprite so the
 * scroll loops seamlessly regardless of screen width.
 *
 * layers: [{ path: 'assets/back.png', speed: 0.2 }, ...]
 * Speed is in "tile pixels per frame at delta=1" — farther layers should
 * use smaller values, closer layers larger values, to fake depth.
 */

export class ParallaxBackground {
  constructor(app, layers) {
    this.app = app;
    this.layerConfigs = layers;
    this.container = new PIXI.Container();
    this.sprites = [];
  }

  async load() {
    for (const { path, speed } of this.layerConfigs) {
      const texture = await PIXI.Assets.load(encodeURI(path));

      const sprite = new PIXI.TilingSprite({
        texture,
        width: this.app.screen.width,
        height: this.app.screen.height,
      });

      // Scale so every layer fills the screen height, keeping aspect ratio,
      // even though the source images have different resolutions.
      const scale = this.app.screen.height / texture.height;
      sprite.tileScale.set(scale);

      this.sprites.push({ sprite, speed });
      this.container.addChild(sprite);
    }
  }

  update(delta) {
    for (const { sprite, speed } of this.sprites) {
      sprite.tilePosition.x -= speed * delta;
    }
  }

  resize() {
    for (const { sprite } of this.sprites) {
      sprite.width = this.app.screen.width;
      sprite.height = this.app.screen.height;
    }
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
