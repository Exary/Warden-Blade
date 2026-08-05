/**
 * SpriteSheetSlicer
 * -------------------
 * Some asset packs (like Fire_Warrior) don't use a uniform grid: each
 * animation row has its own height, and each frame inside that row has
 * its own width (a "trimmed" export typical of Aseprite).
 *
 * Instead of measuring pixels by hand, this function loads the image into
 * a hidden canvas, reads the alpha channel, and automatically detects:
 *   - Row bands (separated by fully transparent lines) = animations
 *   - Column bands inside each row = individual frames
 *
 * Returns { image, rows } where rows is an array of animations, and each
 * animation is an array of rectangles { x, y, width, height }.
 */

export async function autoSliceSheet(imageUrl) {
  const img = await loadImage(imageUrl);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const { data } = ctx.getImageData(0, 0, img.width, img.height);
  const width = img.width;
  const height = img.height;

  // --- 1. Detect row bands (animations) ---
  const rowHasContent = new Array(height).fill(false);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        rowHasContent[y] = true;
        break;
      }
    }
  }
  const rowBands = findBands(rowHasContent, 2); // ignore bands < 2px (noise/artifacts)

  // --- 2. Inside each row, detect columns (frames) ---
  const rows = rowBands.map(([y0, y1]) => {
    const colHasContent = new Array(width).fill(false);
    for (let x = 0; x < width; x++) {
      for (let y = y0; y < y1; y++) {
        if (data[(y * width + x) * 4 + 3] > 0) {
          colHasContent[x] = true;
          break;
        }
      }
    }
    const colBands = findBands(colHasContent, 1);
    return colBands.map(([x0, x1]) => ({
      x: x0,
      y: y0,
      width: x1 - x0,
      height: y1 - y0,
    }));
  });

  return { image: img, rows };
}

/** Finds contiguous bands of "true" in a boolean array. minSize discards noise. */
function findBands(hasContentArray, minSize = 1) {
  const bands = [];
  let inBand = false;
  let start = 0;

  for (let i = 0; i < hasContentArray.length; i++) {
    if (hasContentArray[i] && !inBand) {
      start = i;
      inBand = true;
    } else if (!hasContentArray[i] && inBand) {
      if (i - start >= minSize) bands.push([start, i]);
      inBand = false;
    }
  }
  if (inBand && hasContentArray.length - start >= minSize) {
    bands.push([start, hasContentArray.length]);
  }
  return bands;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${url}`));
    img.src = url;
  });
}
