/**
 * Configuration confirmed from the real file list of
 * Hero_And_Opponents/1 Enemy/PNG (Szadi art.).
 *
 * NOTE: each enemy in the pack (1 through 5) has DIFFERENT frame counts
 * per animation. This file covers Enemy 1; when we add the others, copy
 * this block and adjust the "count" values based on their own PNG folder.
 */

export const ENEMY1_CONFIG = {
  basePath: 'Assets/Hero_And_Opponents/1 Enemy/PNG',
  animations: {
    idle: { prefix: 'idle-', count: 4 },
    walk: { prefix: 'walk-', count: 6 },
    jump: { prefix: 'jump-', count: 6 },
    hit: { prefix: 'hit-', count: 3 },
    dead: { prefix: 'dead-', count: 4 },
    attackA: { prefix: 'attack-A', count: 8 },
    attackB: { prefix: 'attack-B', count: 11 },
  },
  // Frames per second per animation (tweak by eye once it's running)
  fps: {
    idle: 6,
    walk: 10,
    jump: 10,
    hit: 12,
    dead: 8,
    attackA: 14,
    attackB: 14,
  },
};
