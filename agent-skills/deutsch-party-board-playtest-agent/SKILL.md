---
name: deutsch-party-board-playtest-agent
description: Playtest Deutsch Party Brett as a browser board game. Use this skill whenever work touches dice flow, turn changes, board-to-minigame handoff, rewards, finish state, saved board state, board screenshots, or claims that the app is playable. It turns subjective "looks good" into repeatable checks.
---

# Deutsch Party Board Playtest Agent

Use this skill to prove the game still works as a dice board game after visual,
engine, UI, or minigame changes.

## Mission

Protect the core loop:

1. Start a local two-player board state.
2. Show a dominant 16:9 field-first board.
3. Roll or simulate movement.
4. Land the correct cutout token on the correct field.
5. Resolve the field into either a board-ready minigame or a coherent board event.
6. Complete the minigame or event.
7. Return to the board with the next valid player, reward, and resume state.

## Ground Truth

Read these when the task touches their surface:

- `js/engine/game-controller.js`
- `js/engine/board.js`
- `js/engine/turn.js`
- `js/ui/render-board.js`
- `js/ui/render-minigame.js`
- `js/learning/task-generator.js`
- `js/minigames/quality-gate.js`
- `scripts/validate-board-game-loop.mjs`
- `agent-skills/deutsch-party-board-director/SKILL.md`
- `agent-skills/deutsch-party-functional-board-artist/SKILL.md`
- `agent-skills/deutsch-party-board-ready-curator/SKILL.md`

## Required Checks

Run the deterministic loop guard when board flow, rewards, task launch, or turn
state changes:

```bash
npm run validate:game-loop
```

This guard must prove:

- 36 sequential board fields exist.
- Required field type counts are present.
- Nomen, Verben, and Adjektive fields launch board-ready minigames.
- Board minigame completion grants reward, records stats, advances turn, and
  returns to idle dice flow.
- Helper, reward, movement, trap, and portal fields resolve without leaving the
  board in a non-resumable state.
- Finish state marks the player finished and ends a two-player game cleanly.

For visual or interaction changes, also run:

```bash
npm run validate:board
npm run validate:routing
```

Then start the app and use the debug URL:

```bash
PORT=4175 npm start
```

```text
http://127.0.0.1:4175/?debugBoard=1&debugPlayers=2&debugPositions=3,8&debugCurrent=0
```

Capture at least:

- desktop screenshot
- mobile screenshot
- 16:9 landscape screenshot when board scale or chrome changes
- console check with zero warnings/errors

## Review Standard

Do not call a playtest good if any of these are visible:

- board is a small preview instead of the main play surface
- fields look pasted over unrelated art
- any scenic mark implies a second route, branch, shortcut, or dead end
- the active token is not clearly on its field
- the dice action is hidden, disabled, or visually disconnected from the board
- board-launched minigame looks like a generic direct-play worksheet
- completion leaves the wrong player active or the board not resumable

## Output

Report:

- exact command results
- screenshots captured
- what the playtest proved
- what still feels weak or unverified
