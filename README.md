# Warden Blade — Base Prototype

## 📁 Project structure

```
warden-blade/
├── index.html
├── css/
│   └── style.css                        ← fonts, menu, sidebar, gameplay HUD, credits modal
├── js/
│   ├── main.js                          ← entry point, screen switching
│   ├── screens/
│   │   ├── MenuScreen.js                ← alternating parallax backgrounds + music
│   │   ├── ParallaxBackground.js        ← reusable scrolling-layers component
│   │   ├── AnimationTestScreen.js       ← sidebar hub (Gameplay Test + character list)
│   │   ├── GameplayTestView.js          ← live keyboard-controlled character test
│   │   └── CharacterAnimationBrowser.js ← per-character animation preview (old debug view)
│   ├── core/
│   │   ├── AsepriteSheetLoader.js       ← reads real Aseprite/LibreSprite JSON exports
│   │   ├── SpriteSheetSlicer.js         ← auto-detects frames when no JSON exists (fallback)
│   │   ├── FrameAnimLoader.js           ← loads standalone-frame animations (Enemy1)
│   │   └── AudioSettings.js             ← shared volume singleton
│   ├── ui/
│   │   ├── VolumeHUD.js                 ← 9/0 keys, temporary bar HUD
│   │   └── CreditsModal.js              ← credits overlay
│   ├── entities/
│   │   ├── Player.js
│   │   └── Enemy.js
│   └── config/
│       ├── enemyAnimations.js
│       ├── characterRoster.js           ← characters listed in the sidebar
│       └── credits.js                   ← every asset pack + author + link
└── Assets/     ← your full "Assets" folder, exactly as it is on your PC
```

## 🕹️ Gameplay Test — keybinding scheme

**Left hand only handles aiming/walking (`A`/`D`)** — `W`/`S` are
deliberately left free for future vertical aiming (up-attack, pogo, etc).
Everything else — jump, run, dash, and every ability — lives on the right
hand, across two comfortable rows so it never has to leave its resting
position. Letters only, on purpose — Ctrl/Shift/Space can trigger browser
or OS shortcuts on some setups.

| Key | Action |
|---|---|
| `A` / `D` | Move left / right (also sets facing + attack direction) |
| `I` | Jump — press again near a screen edge to simulate a wall-jump (placeholder; real wall detection needs the actual level tileset) |
| `U` | Dash — works in the air too |
| `O` (hold) | Run |
| `J` | Attack (sword) — the pack's `Attack` tag actually bakes in a 3-hit combo in one animation, so each press plays just one slash (one third of the frame range), cycling through the combo; wait too long between presses (700ms) and it resets to hit 1 |
| `K` | Mele (kick) — placeholder uses the `Spell 2` animation at 2x speed, so it reads faster/punchier than a normal attack instead of just reusing Attack |
| `L` | Secondary ability (Beam) — placeholder uses `Spell` |
| `P` | Supercooling — mechanic not implemented, but plays `transformation` as its placeholder visual |
| `H` | Ground Pound (Pisotón) — reserved, not implemented yet |

**Jump and Dash are always available** — mid-attack, mid-beam, in the air,
doesn't matter. Only `J`/`K`/`L` (the abilities themselves) lock each
other out while one is still mid-animation.

**Parry has no dedicated key** — per design, it should trigger automatically
when Attack or Mele lands on an enemy's attack hitbox at the right moment.
Not simulated yet since there's no enemy in this test scene.

**Crouch, Slide, and Roll are intentionally not implemented** (descoped for
now, per direction).

**Attack hitboxes note:** once real combat hitboxes are implemented, they
will be defined in code relative to the character's logical facing
direction/position — NOT derived from the sprite's visual bounding box.
This sidesteps any inconsistency from the sprite mirroring (body + sword
together) when the character turns around.

⚠️ This view runs on a placeholder flat floor with no real collision —
there's no level tileset wired in yet. Physics (gravity, ground, "walls")
are all temporary stand-ins to be replaced once Legacy Fantasy - Debug Map
gets wired up as an actual level.

## 🧑‍🤝‍🧑 Character roster (sidebar)

`js/config/characterRoster.js` lists every character. **Fire Warrior** has
real animation data and works fully. **Merakintsugi** (the $15 Platformer
Character Pack) is listed as a "pending" placeholder entry — Marco is
considering buying it, so it's already wired into the roster/credits
structurally, but has no `jsonUrl`/`imageUrl` yet and just shows an
informational message when selected. Add the real paths once/if it's
purchased and exported the same way Fire Warrior was (LibreSprite JSON).

## 🗂️ Adding your assets (no reorganizing needed)

1. Copy your entire `Assets` folder directly into the repo folder, at the
   same level as `index.html` — nothing inside it needs to be moved or
   renamed, the code already points at the real paths.
2. Key paths currently in use:
   - `Assets/Fire_Warrior/Fire_WarriorAseprite/Fire_Warrior.json` + `.png`
   - `Assets/Hero_And_Opponents/1 Enemy/PNG/idle-1.png` (and the rest)
   - `Assets/Synth_Cities/cyberpunk-street-files/Assets/...` (menu backgrounds + music)
   - `Assets/Legacy_Fantasy/Legacy Fantasy - Debug Map/Assets/Tiles.png` (not wired into code yet — reserved for the first real level)

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

Testing directly on the live GitHub Pages URL also works fine and skips
this step entirely.

## 📝 Commit naming style ("Option 3")

Formal version number + a self-aware/funny one-line description of what
actually changed:

```
Pre-Alpha 0.0.9 - "Odysseus can now kick things, sort of"
```

Bump the patch number (0.0.X) for small iterative changes, minor (0.X.0)
for a meaningfully new system (e.g. the heat/supercooling system going
in), and major (X.0.0) reserved for actual playable milestones.

## 🔍 What this prototype currently does

- **Main menu**: alternates between four Synth Cities Environment
  background scenes with a 1.2s crossfade between transitions. Buttons:
  PLAY / OPTIONS / ANIMATION TESTS / CREDITS, styled with Pixeloid,
  loosely following the Ultrakill main menu's stacked button layout.
  PLAY and OPTIONS are still placeholders (just show an alert).
- **Animation Tests** now opens a hub with a left sidebar:
  - **Gameplay Test** (default view): live, keyboard-controlled Odysseus
    using the keybinding scheme above, with an on-screen legend and a
    small toast for "not implemented yet" abilities.
  - **Character list**: pick a character to preview all of its named
    animations individually via buttons (the old debug view). Only
    "Fire Warrior" exists in the list for now.
- **Credits**: semi-transparent modal (menu background still visible
  behind it) listing every asset pack used, with author + itch.io link.
  Closes via the × button or by clicking outside the panel.

## 🔊 Volume control

Press **9** to lower / **0** to raise the master volume. Shows a temporary
bar HUD (auto-hides after ~1.4s). Currently only wired to the menu music,
but built as a shared `AudioSettings` singleton so any future audio can
plug into the same volume value.

**Known limitation:** the volume bar HUD is drawn with plain CSS blocks,
not sliced from the `Basic Pixel Health bar and Scroll bar` UI pack — that
sheet's bar segments are packed too tightly together to reliably
auto-detect individual frames without a source file. Swap
`js/ui/VolumeHUD.js`'s rendering for the real sprite once we have clean
per-frame coordinates for it.

## 🎵 Music (found by Marco, not yet wired into code)

Three free BGM packs by doranarasi, way more than needed for the whole
game (menu, combat, bosses, ambient):
- SHMUP BGM Pack (40 tracks) — https://doranarasi.itch.io/shmup-bgm-pack
- JRPG Battle BGM Pack 1 (20 tracks, 10 normal + 10 boss) — https://doranarasi.itch.io/jrpg-battle-bgm-pack-1
- SHMUP MIDI Pack (40 tracks, raw MIDI-source versions of the SHMUP BGM Pack) — https://doranarasi.itch.io/shmup-midi-pack

License: ogg & m4a formats are free, commercial use OK, no credit
required (appreciated), cannot be used for NFT content, cannot be
resold/redistributed as-is. Not wired into the code yet — still need to
pick specific tracks for specific contexts (menu vs combat vs boss).

## ⚠️ Other open items

- **Only one music track exists in the whole Synth Cities pack** — all
  four menu background scenes reuse it.
- **Parallax scroll speeds are estimated**, not pulled from real data —
  tune the `speed` values in `MenuScreen.js` by eye.
- **Title placeholder**: `#title-placeholder` is an empty dashed box —
  swap it for real title art whenever it's ready.
- **Mele and Secondary ability visuals are placeholders**: Mele reuses
  `Spell 2` (2x speed), Secondary reuses `Spell` — neither has a real VFX
  layered on top yet (BDragon1727 effects packs aren't wired in).

## 🔜 Next step

Wire up the Legacy Fantasy - Debug Map tileset as real level geometry
(replacing the placeholder flat floor and fake screen-edge "walls" in
Gameplay Test), then layer in real VFX for Attack/Mele/Beam.
