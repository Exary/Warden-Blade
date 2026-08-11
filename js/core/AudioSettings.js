/**
 * AudioSettings
 * ---------------
 * Single source of truth for the game's master volume (0..1), so any
 * screen/scene that plays audio (menu music, future SFX, etc.) can read
 * and react to the current value without needing to be wired together
 * by hand each time.
 */

const listeners = new Set();
let volume = 0.5;

export function getVolume() {
  return volume;
}

export function setVolume(v) {
  volume = Math.min(1, Math.max(0, v));
  listeners.forEach((fn) => fn(volume));
  return volume;
}

/** Returns an unsubscribe function */
export function onVolumeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
