import { autoSliceSheet } from '../core/SpriteSheetSlicer.js';

export class Player {
  constructor(sheetUrl) {
    this.sheetUrl = sheetUrl;
    this.rows = []; // rectángulos detectados, uno por fila de animación
    this.rowTextures = []; // PIXI.Texture recortadas, por fila
    this.sprite = null;
  }

  async load() {
    // encodeURI escapes spaces and special characters in the path
    const { image, rows } = await autoSliceSheet(encodeURI(this.sheetUrl));
    this.rows = rows;

    const baseTexture = PIXI.Texture.from(image);

    this.rowTextures = rows.map((row) =>
      row.map(
        (f) =>
          new PIXI.Texture({
            source: baseTexture.source,
            frame: new PIXI.Rectangle(f.x, f.y, f.width, f.height),
          })
      )
    );

    this.sprite = new PIXI.AnimatedSprite(this.rowTextures[0]);
    this.sprite.anchor.set(0.5, 1);
    this.sprite.animationSpeed = 0.15;
    this.sprite.play();
    return this.sprite;
  }

  /** Switches to the animation on detected row N (see debug panel) */
  setRow(index, fps = 10, loop = true) {
    if (!this.rowTextures[index]) return;
    this.sprite.textures = this.rowTextures[index];
    this.sprite.animationSpeed = fps / 60;
    this.sprite.loop = loop;
    this.sprite.gotoAndPlay(0);
  }
}
