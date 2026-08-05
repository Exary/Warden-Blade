/**
 * FrameAnimLoader
 * -----------------
 * For packs like "Hero and Opponents" (Szadi art.), where each frame is a
 * standalone PNG named e.g. "idle-1.png", "attack-A1.png", etc.
 * No centering needed: each image is already ready to use as-is.
 */

/** Builds the path list: basePath + prefix + i + ".png" */
export function buildFrameSequence(basePath, prefix, count, startIndex = 1) {
  const paths = [];
  for (let i = startIndex; i <= count; i++) {
    paths.push(`${basePath}/${prefix}${i}.png`);
  }
  return paths;
}

/** Loads all textures for an animation and returns them as an array of PIXI.Texture */
export async function loadFrameAnimation(basePath, prefix, count, startIndex = 1) {
  const paths = buildFrameSequence(basePath, prefix, count, startIndex);
  // encodeURI escapes spaces and special characters in folder/file names
  const textures = await Promise.all(paths.map((p) => PIXI.Assets.load(encodeURI(p))));
  return textures;
}
