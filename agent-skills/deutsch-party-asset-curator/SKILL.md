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
- Relevant CSS under `css/screens/`

## Decisions

- Primary board: `assets/img/premium/watercolor-premium-board.png`
- Primary start/setup/table surfaces: the `assets/img/premium/watercolor-premium-*.png` set
- Primary characters: transparent cutouts in `assets/img/premium/user-reference/cutouts/`
- Word-card photos and crops are source/reference or handmade-mode material unless polished into a final card system.

## Do Not Promote Without Review

- `assets/img/premium/generated-wife-style/`
- `assets/img/premium/characters/`
- `assets/img/premium/start-hero-forest.png`
- `assets/img/premium/board-enchanted-backdrop.png`
- HEIC files and raw source photos

## Workflow

1. Identify the visual surface: board, characters, cards, UI, or minigame stage.
2. Check `assets/visual-manifest.json` for status and provenance.
3. If the asset is missing from the manifest, add it before using it in production UI.
4. Keep board coordinates in the `1672 x 941` coordinate space.
5. Avoid style mixing. One screen should not combine handmade cutouts, generic generated characters, and unrelated fantasy art.
6. Board-launched minigames should preserve the active player's original cutout identity in the shell, so the handoff still feels like a board turn instead of a generic worksheet.
7. After integration, capture desktop and mobile screenshots and inspect the actual rendered result.

## Output

When reporting, include:

- asset paths used
- provenance/status decision
- screenshots or verification commands
- any asset risks, especially file size, browser support, metadata, or style mismatch
