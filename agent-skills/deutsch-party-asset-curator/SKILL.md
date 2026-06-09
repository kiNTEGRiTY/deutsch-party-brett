---
name: deutsch-party-asset-curator
description: Curate and integrate Deutsch Party Brett visual assets. Use this skill whenever work touches board art, wife/user cutouts, word-card photos, asset provenance, visual manifests, image optimization, or decisions about which assets should be production versus reference only.
---

# Deutsch Party Asset Curator

Use this skill to keep the game visually anchored in the real handmade asset direction.

## Ground Truth

Read these first:

- `assets/visual-manifest.json`
- `js/engine/board-layouts.js`
- `js/ui/characters.js`
- `js/minigames/quality-gate.js`
- Relevant CSS under `css/screens/`

## Decisions

- Primary board: function-first renderer using `js/engine/board-layouts.js`, `js/ui/render-board.js`, and `css/screens/board.css`.
- Primary start/setup/table surfaces: the `assets/img/premium/watercolor-premium-*.png` set
- Primary characters: transparent cutouts in `assets/img/premium/user-reference/cutouts/`
- Board-ready minigame scenes should prefer the real wife/user card photos,
  word-card crops, and cutout sheets over generic generated table/backdrop art.
- Start and onboarding board previews must render from the real board geometry or be removed. Do not use static decorative mini-paths that can drift away from the playable route.
- Word-card photos and crops are source/reference or handmade-mode material unless polished into a final card system.
- `assets/img/premium/functional-field-board.svg` is retired reference material. Do not restore it as a separate board backdrop under rendered fields.

## Do Not Promote Without Review

- `assets/img/premium/functional-field-board.svg`
- `assets/img/premium/generated-wife-style/`
- `assets/img/premium/characters/`
- `assets/img/premium/watercolor-premium-board.png`
- `assets/img/premium/start-hero-forest.png`
- `assets/img/premium/board-enchanted-backdrop.png`
- `assets/img/premium/watercolor-premium-game-table.png` inside board-ready
  minigames, unless the screen has been explicitly reviewed as a neutral UI
  material rather than a fake game board/backdrop
- HEIC files and raw source photos

## Workflow

1. Identify the visual surface: board, characters, cards, UI, or minigame stage.
2. Check `assets/visual-manifest.json` for status and provenance.
3. If the asset is missing from the manifest, add it before using it in production UI.
4. Keep board coordinates in the `1672 x 941` coordinate space.
5. Avoid style mixing. One screen should not combine handmade cutouts, generic generated characters, and unrelated fantasy art.
6. If a UI surface previews the board, verify it imports or derives from `js/engine/board-layouts.js`/`Board` rather than hand-drawn duplicate coordinates.
7. Board-launched minigames should preserve the active player's original cutout identity in the shell, so the handoff still feels like a board turn instead of a generic worksheet.
8. Any minigame promoted to `BOARD_READY_MINIGAME_IDS` must also have a matching
   `BOARD_READY_MINIGAME_EVIDENCE` entry with source module, wife/user asset
   families, proof, and quality reason.
9. Search changed minigame code for generic fallback assets before sign-off:
   `rg -n "watercolor-premium-game-table|board-enchanted-backdrop" js css`.
10. Run `npm run validate:minigames`; it rejects board-ready games without
    wife/user asset evidence or with forbidden generated/backdrop assets.
11. After integration, capture desktop and mobile screenshots and inspect the actual rendered result.

## Output

When reporting, include:

- asset paths used
- provenance/status decision
- screenshots or verification commands
- any asset risks, especially file size, browser support, metadata, or style mismatch
