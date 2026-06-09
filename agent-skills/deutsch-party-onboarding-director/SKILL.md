---
name: deutsch-party-onboarding-director
description: Use this skill whenever Deutsch Party Brett start, setup, onboarding, player selection, topic selection, first-run flow, or start-screen board previews are changed. It keeps the entry flow playful, asset-led, mobile-usable, and connected to the real board game.
---

# Deutsch Party Onboarding Director

Use this skill for the first screens a player sees: Start, Setup, profile/continue choices, player selection, topic/difficulty setup, and any board preview shown before play.

## Product Rule

The onboarding is part of the board game, not a form wizard. It should feel like arranging a handmade game table with the user's cutout characters and then starting a dice round.

## Ground Truth

Read these before changing onboarding:

- `index.html`
- `css/screens/start.css`
- `css/screens/setup.css`
- `js/app.js`
- `js/ui/render-setup.js`
- `js/ui/render-start-preview.js`
- `agent-skills/deutsch-party-asset-curator/SKILL.md`
- `agent-skills/deutsch-party-board-director/SKILL.md`

## Standards

- Start-screen board previews must render from `Board` or `js/engine/board-layouts.js`; never use decorative duplicate paths.
- The first mobile setup step must show all primary choices for the current decision without making the user guess that hidden cards exist.
- The setup stepper may scroll horizontally on mobile, but the active step and next action must stay visible.
- Use the wife/user cutout characters as the visual anchor for player setup.
- Keep mobile cards compact enough for touch, but do not reduce labels into unclear abbreviations.
- Avoid dashboard/form language. Prefer table-game words: Partie, Figur, Stufe, Themen, Tempo, Start.
- Keep footer actions reachable without covering the active choices.

## Verification

Use at minimum:

- `node --check js/app.js` and any changed setup/start renderer file
- `npm run validate:board` when a board preview or board import changes
- `npm run validate:minigames` when direct-start routes or menu handoff changes
- Playwright screenshot of Start desktop and mobile when Start changes
- Playwright screenshot of Setup mobile step 1 and player selection when Setup changes
- Browser console check with zero errors and zero warnings
- A DOM measurement or visual check proving mobile title/copy/actions do not overlap

## Anti-Patterns

- Static fake mini-board art that can drift from the real route.
- Giant mobile cards that hide the first decision below the fold.
- Form-style setup screens with no game-table feeling.
- Start or setup screens that advertise a board state the real board cannot produce.
