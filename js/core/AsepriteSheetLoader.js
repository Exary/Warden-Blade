/**
 * AsepriteSheetLoader
 * ---------------------
 * Loads a sprite sheet exported from Aseprite / LibreSprite as JSON (Hash
 * format) + PNG. Unlike SpriteSheetSlicer (which guesses frame boundaries
 * from transparency), this reads the REAL frame coordinates and animation
 * names straight from the JSON — no guessing, no jitter from inconsistent
 * trimming.
 *
 * Expects the JSON "Hash" format with frameTags, e.g.:
 * {
 *   "frames": { "Fire_Warrior 0.aseprite": { "frame": {x,y,w,h}, ... }, ... },
 *   "meta": { "frameTags": [ { "name": "Idle", "from": 0, "to": 7 }, ... ] }
 * }
 */

export async function loadAsepriteSheet(jsonUrl, imageUrl) {
  const [jsonData, image] = await Promise.all([
    fetch(encodeURI(jsonUrl)).then((r) => r.json()),
    loadImage(encodeURI(imageUrl)),
  ]);

  const baseTexture = PIXI.Texture.from(image);

  // Frames come as an object (Hash format) whose insertion order matches
  // frame index 0, 1, 2... — Object.values() preserves that order for
  // string keys inserted in sequence, which is how LibreSprite writes them.
  const frameList = Object.values(jsonData.frames);

  const frameTextures = frameList.map((f) => {
    const { x, y, w, h } = f.frame;
    return new PIXI.Texture({
      source: baseTexture.source,
      frame: new PIXI.Rectangle(x, y, w, h),
    });
  });

  // Build a { animationName: [textures...] } map from frameTags
  const animations = {};
  for (const tag of jsonData.meta.frameTags) {
    animations[tag.name] = frameTextures.slice(tag.from, tag.to + 1);
  }

  return { animations, frameTextures, raw: jsonData };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${url}`));
    img.src = url;
  });
}
