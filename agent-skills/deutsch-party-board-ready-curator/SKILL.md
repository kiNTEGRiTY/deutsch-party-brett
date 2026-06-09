---
name: deutsch-party-board-ready-curator
description: Curate which Deutsch Party Brett minigames may appear from dice rolls. Use this skill whenever work touches BOARD_READY_MINIGAME_IDS, BOARD_DEFERRED_MINIGAME_IDS, BOARD_QUARANTINED_MINIGAME_IDS, TOPIC_MINIGAME_MAP, board topic fallbacks, or direct-play versus board-flow promotion decisions.
---

# Deutsch Party Board-Ready Curator

Use this skill to keep the dice board strict. The board is the premium path;
direct play can keep experiments, but dice rolls should not surface unfinished
or generic work.

## Ground Truth

Read these first:

- `js/minigames/quality-gate.js`
- `js/learning/task-generator.js`
- `js/minigames/minigame-registry.js`
- `agent-skills/deutsch-party-minigame-forge/SKILL.md`
- Screenshots in `output/playwright/` from the current pass, if present

## Curation States

- **Board-ready:** verified for board flow with first-viewport screenshot,
  player action, success/failure behavior where applicable, cleanup, and visual
  fit with the Aquarell/cutout product direction.
- **Deferred:** kept as an idea or direct-play candidate, but not allowed from
  dice rolls until it is individually rebuilt or verified.
- **Quarantined:** known weak, broken, misleading, or legacy game that should
  not be promoted without a rewrite.

## Rules

- Do not promote whole packs because they sound premium. Promote individual
  game IDs only.
- Board-ready games should either use the wife/user assets directly or provide
  a strong game-first loop that has been playtested.
- If a setup topic has no verified board-ready game, route it through an
  explicit fallback topic instead of silently leaking weak games into board
  flow.
- Preserve `requestedTopic` when a fallback topic is used, so the product can
  later expose or audit the substitution.
- Keep direct-play curation separate from board-ready curation. Direct play can
  expose experiments; the board path should be stricter.

## Verification

Before reporting a curation change:

- Run `node --check js/minigames/quality-gate.js`.
- Run `node --check js/learning/task-generator.js`.
- Run `npm run validate:routing` to sample every setup topic through
  `generateTask(...)` across normal, challenge, and team board field modes.
- Run `npm run validate:game-loop` to prove board-launched tasks, rewards,
  turn advance, and finish state still behave as a coherent dice loop.
- Sample every topic in `js/learning/topic-registry.js` through
  `generateTask(..., explicitTopic)` and confirm the chosen mini-game is
  board-ready.
- Verify at least one board debug roll still launches a minigame.
- Capture screenshots for any newly promoted game. Removing or deferring games
  does not require screenshots, but the resulting board flow must be tested.

## Output

Report:

- game IDs promoted, deferred, or quarantined
- topic fallbacks added or changed
- evidence used for every promoted board-ready game
- verification commands and board/debug URLs
