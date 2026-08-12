import { CREDITS } from '../config/credits.js';

let modalEl = null;

function build() {
  const overlay = document.createElement('div');
  overlay.id = 'credits-overlay';

  const panel = document.createElement('div');
  panel.id = 'credits-panel';

  const closeBtn = document.createElement('button');
  closeBtn.id = 'credits-close';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close credits');
  closeBtn.onclick = hideCredits;

  const title = document.createElement('h2');
  title.textContent = 'Credits';

  const list = document.createElement('ul');
  list.id = 'credits-list';
  CREDITS.forEach(({ role, asset, author, url }) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="credits-role">${role}</span>
      <a href="${url}" target="_blank" rel="noopener">${asset}</a> — ${author}`;
    list.appendChild(li);
  });

  panel.appendChild(closeBtn);
  panel.appendChild(title);
  panel.appendChild(list);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Clicking the dark backdrop (outside the panel) also closes it
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideCredits();
  });

  return overlay;
}

export function showCredits() {
  if (!modalEl) modalEl = build();
  modalEl.classList.add('visible');
}

export function hideCredits() {
  if (modalEl) modalEl.classList.remove('visible');
}
