import { CHARACTER_ROSTER } from '../config/characterRoster.js';
import { mountGameplayTestView } from './GameplayTestView.js';
import { mountCharacterAnimationBrowser } from './CharacterAnimationBrowser.js';

let currentDestroy = null;

async function switchView(mountFn, ...args) {
  if (currentDestroy) {
    currentDestroy();
    currentDestroy = null;
  }
  const contentEl = document.getElementById('animtest-content');
  currentDestroy = await mountFn(contentEl, ...args);
}

export async function initAnimationTestScreen() {
  const root = document.getElementById('screen-animtest');
  root.innerHTML = `
    <div id="animtest-sidebar">
      <button id="btn-back-to-menu" class="sidebar-btn">&larr; Back to menu</button>
      <button id="btn-gameplay-test" class="sidebar-btn primary">Gameplay Test</button>
      <div class="sidebar-divider">Characters</div>
      <div id="character-list"></div>
    </div>
    <div id="animtest-content"></div>
  `;

  document.getElementById('btn-back-to-menu').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('warden:back-to-menu'));
  });

  document.getElementById('btn-gameplay-test').addEventListener('click', () => {
    switchView(mountGameplayTestView);
  });

  const characterList = document.getElementById('character-list');
  CHARACTER_ROSTER.forEach((entry) => {
    const btn = document.createElement('button');
    btn.className = 'sidebar-btn';
    btn.textContent = entry.label;
    btn.addEventListener('click', () => {
      switchView(mountCharacterAnimationBrowser, entry);
    });
    characterList.appendChild(btn);
  });

  // Default view when entering this screen
  await switchView(mountGameplayTestView);
}
