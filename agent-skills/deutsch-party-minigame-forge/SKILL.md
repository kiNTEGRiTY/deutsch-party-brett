---
name: deutsch-party-minigame-forge
description: Rewrite and curate Deutsch Party Brett minigames for premium German learning quality. Use this skill whenever work touches js/minigames, minigame selection, learning task generation, direct-play curation, or deciding whether a game should be kept, rewritten, or quarantined.
---

# Deutsch Party Minigame Forge

Use this skill to turn individual game ideas into reliable learning games.

## Ground Truth

Read these first:

- `js/minigames/quality-gate.js`
- `js/minigames/minigame-registry.js`
- `js/learning/task-generator.js`
- `js/learning/languages/de/index.js`
- `js/minigames/core/`

## Quality Standard

A board-ready minigame needs:

- generated or structured German learning content, not hardcoded demo-only data
- a clear player verb within the first seconds
- real success and failure validation
- difficulty scaling through task/settings data
- cleanup for timers/listeners/animation loops
- no auto-win, single-button completion, or purely decorative interaction
- visual fit with the Aquarell/cutout product direction

## Curation Rules

- Keep weak legacy games as idea sources only.
- Board flow must use `filterBoardReadyMinigames` from `js/minigames/quality-gate.js`.
- Promote a game into `BOARD_READY_MINIGAME_IDS` only after code review and runtime verification.
- Keep `QUARANTINED_MINIGAME_IDS` out of board-launched task pools.
- Prefer improving fewer games deeply over keeping hundreds of shallow modules.
- When shrinking or expanding board-ready IDs, audit every `TOPIC_MINIGAME_MAP` topic so each active setup topic still resolves to at least one board-ready game or a deliberate premium fallback.

## Rewrite Workflow

1. Pick one game or one small family of related games.
2. Classify it: keep, rewrite, quarantine, or remove from launcher.
3. Inspect how it receives `task`, `difficulty`, `partyConfig`, and `onComplete`.
4. Replace fixed data with language-module content or local curated content with clear learning goals.
5. Add cleanup returns for timers, listeners, intervals, animation frames, and sounds.
6. Verify via direct launch and board launch where relevant.
7. Update `quality-gate.js` only when evidence supports promotion or quarantine.

## Arcade Verification Checklist

For games that render an `.arcade-stage`, verify the rendered product, not only module syntax:

- direct-launch the game with `?debugMinigame=<id>` and capture a desktop screenshot
- confirm the stage and play area have non-zero width and height in the DOM
- start the game and capture a live screenshot with active pieces visible
- exercise one correct action and one wrong or miss state when the game supports both
- complete the round and verify the result screen reports the expected score
- for games promoted into board flow, verify they do not auto-complete before the first player action and that any timer is either clearly external or deliberately internal
- search visible German UI text for ASCII transliterations such as `waehlen`, `koennen`, `Maedchen`, or `Woerter`
- when touching direct-play menus, scan desktop and mobile screenshots for English placeholders, ASCII transliterations, oversized first-viewport controls, and horizontal overflow
- repeat a mobile viewport around `390x844`, checking for horizontal overflow, internally clipped controls, and HUD/input overlap
- clear timers, animation frames, intervals, listeners, and delayed visual effects in cleanup

## Output

Report:

- game IDs touched
- learning objective
- validation and cleanup behavior
- whether board-ready status changed
- commands/screenshots used for verification
