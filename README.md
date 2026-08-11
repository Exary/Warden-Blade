# Warden Blade — Base Prototype

## 📁 Project structure

```
warden-blade/
├── index.html
├── css/
│   └── style.css                  ← Pixeloid font, menu + animation test styles
├── js/
│   ├── main.js                    ← entry point, screen switching
│   ├── screens/
│   │   ├── MenuScreen.js          ← alternating parallax backgrounds + music
│   │   ├── ParallaxBackground.js  ← reusable scrolling-layers component
│   │   └── AnimationTestScreen.js ← the animation debug view (lazily loaded)
│   ├── core/
│   │   ├── AsepriteSheetLoader.js ← reads real Aseprite/LibreSprite JSON exports
│   │   ├── SpriteSheetSlicer.js   ← auto-detects frames on sheets with no JSON (fallback)
│   │   └── FrameAnimLoader.js     ← loads standalone-frame animations (Enemy1)
│   ├── entities/
│   │   ├── Player.js
│   │   └── Enemy.js
│   └── config/
│       └── enemyAnimations.js
└── Assets/     ← your full "Assets" folder, exactly as it is on your PC
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

- **Main menu** (new): alternates between four Synth Cities Environment
  background scenes (Synth Cities dusk skyline, Cyberpunk Street neon,
  and Version 2 in both "with traffic" and "empty street" variants), each
  a 3-layer parallax scroll (right to left, farther layers slower), with a
  1.2s crossfade between transitions. Buttons: PLAY / OPTIONS / ANIMATION
  TESTS / QUIT, styled with Pixeloid, loosely following the Ultrakill main
  menu's stacked left-aligned button layout. PLAY, OPTIONS and QUIT are
  placeholders for now (they just show an alert).
- **Animation Tests** button takes you to the existing debug view: loads
  Odysseus (Fire_Warrior, 24 named animations) and Enemy 1, with buttons
  to preview any animation by name. This is now lazily loaded — it only
  loads those assets the first time you click into it, not on page load.

## ⚠️ Open items on the new menu system

- **Only one music track exists in the whole Synth Cities pack**
  (`cyberpunk-street.mp3`) — both background scenes currently reuse it.
  If you find/add a second track meant for the dusk "Synth Cities" scene,
  update its `music` path in `js/screens/MenuScreen.js`.
- **Parallax scroll speeds are estimated**, not pulled from real data —
  the pack doesn't ship JSON metadata with exact speeds for web/JS (only
  a separate Godot project file has that, which isn't part of what we
  downloaded). Tune the `speed` values in `BACKGROUND_SETS` inside
  `MenuScreen.js` by eye once you see it scrolling.
- **Title placeholder**: `#title-placeholder` in `index.html`/`style.css`
  is an empty dashed box reserving space for the logo — swap it for real
  title art whenever it's ready.

## 🔊 Volume control

Press **9** to lower / **0** to raise the master volume. Shows a temporary
bar HUD (auto-hides after ~1.4s). Currently only wired to the menu music,
but built as a shared `AudioSettings` singleton so any future audio
(SFX, gameplay music) can plug into the same volume value.

**Known limitation:** the volume bar HUD is drawn with plain CSS blocks,
not sliced from the `Basic Pixel Health bar and Scroll bar` UI pack — that
sheet's bar segments are packed too tightly together to reliably
auto-detect individual frames without a source file (no `.aseprite`/JSON
came with this particular pack, unlike Fire_Warrior). Swap
`js/ui/VolumeHUD.js`'s rendering for the real sprite once we have clean
per-frame coordinates for it.

## 🧰 About SpriteSheetSlicer.js

This file (the transparency-based auto-detector) isn't used by Fire_Warrior
anymore now that we have real JSON data, but it's kept in the project —
useful for any future sheet that doesn't come with exported JSON metadata
(e.g. a raw sheet from a pack that wasn't made in Aseprite).

## 🔜 Next step

Design the title/logo art to drop into the placeholder box, then start
wiring real combat inputs (attack, dash, jump) on the animation test
screen instead of just Idle/Walk movement testing.
