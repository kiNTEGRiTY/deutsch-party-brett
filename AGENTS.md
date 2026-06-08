# Deutsch Party Brett Agent Rules

This repo is the canonical app worktree for `kiNTEGRiTY/deutsch-party-brett`.

## Product Direction

- Build a premium German learning board game, not a generic web demo.
- Use the wife/user-provided visual assets as the main visual source.
- Prefer the Aquarell paper/cutout direction: warm, handmade, modern, playful, and high quality.
- Do not reintroduce glassmorphism, old card UI, browser-retro styling, fake previews, or loose widgets pasted over the board.
- Discard weak legacy systems when they block product quality. Keep individual minigame ideas only after critical review.

## Asset Rules

- Treat `assets/visual-manifest.json` as the asset policy.
- Primary board art is `assets/img/premium/watercolor-premium-board.png`.
- Primary token art is `assets/img/premium/user-reference/cutouts/`.
- Do not promote `assets/img/premium/generated-wife-style/`, `assets/img/premium/characters/`, HEIC files, or raw source photos into the primary shipped UI without explicit review.
- Board coordinates are authored in the `1672 x 941` image coordinate space.

## Gameplay Rules

- Keep simulation state outside the renderer.
- Board rendering may be SVG/DOM, but game rules stay in `js/engine` and task selection stays in `js/learning`.
- Board-launched minigames must pass through `js/minigames/quality-gate.js`.
- Quarantined minigames can remain in the repo as idea sources, but should not enter the board flow until rewritten and tested.

## Verification

- After visual board or UI changes, run the app locally and capture Playwright screenshots for desktop and mobile.
- After task/minigame selection changes, run a generator sample that proves quarantined IDs are not selected.
- Run `node --check` on changed JavaScript modules.
- Do not claim the full product goal is complete unless the board, assets, minigame quality, learning value, and deployment are all verified.
