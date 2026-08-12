import { Player } from '../entities/Player.js';

/**
 * Loads one character (by roster entry) and shows a button per named
 * animation to preview it. Mounts everything inside contentEl, and
 * returns a destroy() function so the caller can tear it down cleanly
 * when switching to another view.
 */
export async function mountCharacterAnimationBrowser(contentEl, characterEntry) {
  contentEl.innerHTML = `
    <div id="game-container"></div>
    <div id="debug-panel"><p>Loading ${characterEntry.label}...</p></div>
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

  const player = new Player(characterEntry.jsonUrl, characterEntry.imageUrl);
  const playerSprite = await player.load();
  playerSprite.x = 480;
  playerSprite.y = 420;
  playerSprite.scale.set(2.5);
  app.stage.addChild(playerSprite);

  const debugPanel = document.getElementById('debug-panel');
  const animNames = player.getAnimationNames();
  debugPanel.innerHTML = `<p><b>${animNames.length} named animations loaded for ${characterEntry.label}.</b><br>
Click any button to preview it on the character.</p>`;

  animNames.forEach((name) => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.onclick = () => player.setState(name);
    debugPanel.appendChild(btn);
  });

  return function destroy() {
    app.destroy(true, { children: true });
  };
}
