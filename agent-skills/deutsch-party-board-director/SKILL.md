---
name: deutsch-party-board-director
description: Improve the Deutsch Party Brett board-game experience: dice flow, token movement, path clarity, board coordinates, turn feedback, and integration between the board and minigames. Use this skill whenever work touches js/engine, js/ui/render-board.js, board-layouts, dice, player movement, or board screenshots.
---

# Deutsch Party Board Director

Use this skill to keep the app a real board game, not a menu of isolated minigames.

## Ground Truth

Read these first:

- `AGENTS.md`
- `assets/visual-manifest.json`
- `js/engine/board-layouts.js`
- `js/engine/board.js`
- `js/engine/game-controller.js`
- `js/ui/render-board.js`
- `css/screens/board.css`

## Board Principles

- The board image is the map. Do not draw a second competing path.
- Start, goal, direction, current player, and next action must be visible without guessing.
- Tokens must feel like cutout standees on the board, not icons inside badges.
- The right/bottom UI should support the turn, not cover the board's important path.
- On mobile, the board art should still read as a dominant 16:9 game surface; secondary panels must become compact overlays instead of pushing the image into a small preview strip.
- Simulation state belongs in `js/engine`; rendering belongs in `js/ui`.

## Workflow

1. Identify whether the change is simulation, rendering, layout, or feedback.
2. Keep board coordinates in the `1672 x 941` image space.
3. Preserve board-launched minigame selection through the quality gate.
4. When a board roll launches a minigame, pass the landing player as the task actor; do not infer the actor from a later turn state.
5. Use the debug URL:
   `http://127.0.0.1:4175/?debugBoard=1&debugPlayers=2&debugPositions=3,8&debugCurrent=0`
6. Capture desktop and mobile screenshots after visual changes.
7. Critique the screenshots before calling the work good.

## Verification

Use at minimum:

- `node --check` on changed JS files
- local HTTP 200 check
- Playwright desktop screenshot
- Playwright mobile screenshot
- inspect the desktop screenshot for a dead table-apron gap between the map and turn controls; keep the board map visually dominant without hiding start, goal, tokens, or the next action
- on wide/tall desktop viewports, measure the gap between the board map and the player/dice feedback row; tighten dead space only with responsive guards so short desktop and mobile layouts do not overlap the map
- on mobile, preserve compact player-state feedback near the dice when space allows; hiding all player slips makes the board feel less like a multi-player dice game
- a board-task generator sample when task selection changes
- for dice-flow changes, click the dice in the board debug route and verify rolling state, final value, token movement, landing feedback, and console cleanliness
- when a board roll launches a minigame, verify the minigame shell still reads as a board-launched task, not a generic standalone worksheet

## Output

Report:

- user-visible board improvement
- files changed
- screenshots captured
- remaining visual or gameplay risks
