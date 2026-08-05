# Warden Blade — Base Prototype

## 📁 Project structure

```
warden-blade/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js                    ← entry point
│   ├── core/
│   │   ├── SpriteSheetSlicer.js   ← auto-detects frames on non-uniform sheets (Fire_Warrior)
│   │   └── FrameAnimLoader.js     ← loads standalone-frame animations (Enemy1)
│   ├── entities/
│   │   ├── Player.js
│   │   └── Enemy.js
│   └── config/
│       └── enemyAnimations.js
└── Assets/     ← your full "Assets" folder goes here, exactly as it is on
                   your PC, no reorganizing needed. The code already points
                   to the real paths inside it (Fire_Warrior/, Hero_And_Opponents/, etc.)
```

## 🗂️ Adding your assets (no reorganizing needed)

1. Copy your entire `Assets` folder (from `D:\My Fucking Stuff\Assets`)
   directly into the repo folder, at the same level as `index.html`
2. That's it — nothing needs to be moved or renamed inside it. The code
   already points to the exact confirmed paths:
   - `Assets/Fire_Warrior/Fire_WarriorAseprite/Fire_Warrior.json`
   - `Assets/Fire_Warrior/Fire_WarriorAseprite/Fire_Warrior.png`
     (these two are the LibreSprite export — the JSON + PNG pair with real
     animation names and pixel-accurate frame coordinates. Drop them into
     the existing `Fire_WarriorAseprite` folder, next to the `.aseprite`
     source files)
   - `Assets/Hero_And_Opponents/1 Enemy/PNG/idle-1.png` (and the rest)

You can upload the whole `Assets` folder (with ALL packs, not just these
two) without any issue — the current prototype only uses Fire_Warrior and
Enemy1, everything else just sits there waiting to be wired up later.

⚠️ Note: uploading the full folder also uploads files you don't actually
need in the final game (previews, .psd, .aseprite, license files, etc.).
Nothing breaks, it just makes the repo heavier than strictly necessary.
Not a problem for this prototype — worth cleaning up later if cloning/
pushing ever starts feeling slow.

## ▶️ Testing it on your PC BEFORE pushing to GitHub

Important: **you can't just double-click `index.html` to open it.** The
code uses ES Modules (`import`/`export`), which browsers block for
security reasons when a file is opened directly from disk (`file:///...`).
You need to serve it from a local server, even a simple one:

**Option A — Python (if you have it installed):**
```
cd warden-blade
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option B — VS Code:**
Install the "Live Server" extension, right-click on `index.html` →
"Open with Live Server".

## 🐙 GitHub repo setup

Already covered in-chat via GitHub Desktop — clone the repo, drop the
project files + `Assets` folder in, commit, push.

## 📝 Commit naming style ("Option 3")

Formal version number + a self-aware/funny one-line description of what
actually changed. Keeps things trackable long-term while keeping the fun
"parody devlog" tone:

```
Pre-Alpha 0.0.1 - "the machete doesn't know it's a laser blade yet"
Pre-Alpha 0.0.2 - "Odysseus can walk, sort of"
Pre-Alpha 0.0.3 - "Enemy1 stopped floating in place, mostly"
```

Bump the patch number (0.0.X) for small iterative changes, minor (0.X.0)
for a meaningfully new system (e.g. the heat/supercooling system going
in), and major (X.0.0) reserved for actual playable milestones (e.g. "the
prologue is fully playable start to finish").

## 🔍 What this prototype currently does

- Loads Odysseus (Fire_Warrior) from the real LibreSprite JSON export —
  24 named animations (Idle, Walk, Run, Attack, Dash, etc.), pixel-accurate
  frame coordinates, consistent anchor point across all of them (this is
  what fixed the earlier "floating torso" jitter)
- Loads Enemy 1 with its real animations (idle, walk, jump, hit, dead,
  attack A, attack B)
- Debug panel: buttons for every real animation name, click to preview
- Arrow key movement, now wired to the real Idle/Walk animations

## 🧰 About SpriteSheetSlicer.js

This file (the transparency-based auto-detector) isn't used by Fire_Warrior
anymore now that we have real JSON data, but it's kept in the project —
useful for any future sheet that doesn't come with exported JSON metadata
(e.g. a raw sheet from a pack that wasn't made in Aseprite).

## 🔜 Next step

Fine-tune animation speeds per state (right now everything defaults to the
same speed), then start wiring real combat inputs (attack, dash, jump)
instead of just Idle/Walk movement testing.
