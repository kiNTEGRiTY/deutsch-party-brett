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
- board-launched games must preserve the active player's cutout identity in
  visible hero/player elements; avoid hardcoded placeholder avatars when
  `task.players` and `task.currentPlayerId` are available
- the first viewport contains the actual play material and player choices; no primary card, board, target, or control may sit below the fold in the tested desktop or mobile launch

## Curation Rules

- Keep weak legacy games as idea sources only.
- Board flow must use `filterBoardReadyMinigames` from `js/minigames/quality-gate.js`.
- The direct-play menu must also stay premium-curated: do not expose deferred,
  quarantined, or non-board-ready games from `getCuratedDirectPlayGroups`.
- Promote a game into `BOARD_READY_MINIGAME_IDS` only after code review and runtime verification.
- Use `agent-skills/deutsch-party-board-ready-curator/SKILL.md` before changing board-ready, deferred, quarantined, or topic fallback pools.
- Keep `QUARANTINED_MINIGAME_IDS` out of board-launched task pools.
- Keep generic or not-yet-verified games in a deferred/direct-play state instead of letting them appear from dice rolls.
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
- internal timers must be visible in the game HUD and must not begin before the
  first player action unless the shell shows an explicit external countdown
- confirm the first screenshot is already playable: target, real game material, and the main answer/action controls are visible without scrolling
- search visible German UI text for ASCII transliterations such as `waehlen`, `koennen`, `Maedchen`, or `Woerter`
- when touching direct-play menus, scan desktop and mobile screenshots for English placeholders, ASCII transliterations, oversized first-viewport controls, and horizontal overflow
- repeat a mobile viewport around `390x844`, checking for horizontal overflow, internally clipped controls, and HUD/input overlap
- for arcade games, measure the mobile topbar, game HUD, playfield, and controls;
  navigation must not overlap the objective HUD, and the main playfield must
  not be hidden by `overflow: hidden` clipping
- clear timers, animation frames, intervals, listeners, and delayed visual effects in cleanup
- when testing many board-ready games in sequence, guard external timers against stale callbacks so an old timer cannot finish a newly launched game
- run `npm run validate:minigames` after changing direct-play groups, board-ready
  IDs, deferred IDs, quarantined IDs, or minigame registry exports

## Output

Report:

- game IDs touched
- learning objective
- validation and cleanup behavior
- whether board-ready status changed
- commands/screenshots used for verification
