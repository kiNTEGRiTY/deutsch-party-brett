---
name: deutsch-party-functional-board-artist
description: Use this skill whenever Deutsch Party Brett board backgrounds, board art, field paths, generated scenery, board assets, or visual map composition are changed. It enforces form-follows-function board art: one playable field route first, art second, no decorative dead ends, no AI scenery with patched-on fields.
---

# Deutsch Party Functional Board Artist

Use this skill when the work touches the board image, board background, board route, field coordinates, field-slot art, or any generated visual map for the board screen.

## Product Rule

The board is not a painting with fields placed on top. The board image is the playable field structure.

Form follows function:

- Author the field route first.
- Build the background around the field route.
- Every prominent path-like shape must be playable or removed.
- Decorative scenery must never imply extra roads, branches, loops, shortcuts, or dead ends.
- Start, finish, turn direction, and the next playable field must be legible before adding atmosphere.
- Use the wife/user assets as real game materials: tokens, cards, cutouts, and reference art. Do not hide weak board logic behind generated scenery.

## Required Files

Read these before changing board art:

- `assets/visual-manifest.json`
- `js/engine/board-layouts.js`
- `js/ui/render-board.js`
- `css/screens/board.css`
- `agent-skills/deutsch-party-board-director/SKILL.md`

## Board-Art Workflow

1. Define the field coordinate list in the `1672 x 941` board coordinate space.
2. Validate that the route is one ordered sequence from field `0` to the final field.
3. Reject self-intersections, branches, detached tiles, alternate scenic paths, and decorative roads.
4. Create or update the board background only after the route is settled.
5. Align the background slots and rendered field nodes to the same coordinates.
6. Verify desktop and mobile screenshots with the debug board URL.

## Quality Gate

Before reporting success, prove:

- The board has a single route with no dead-end branches.
- The background uses the same field count and coordinate space as `board-layouts.js`.
- The rendered fields sit on authored slots, not arbitrary scenery.
- The goal is visible.
- The direction is readable without guessing.
- Tokens sit on the playable fields.
- Mobile still reads as a 16:9 board, not a tiny preview.

## Anti-Patterns

- AI-generated landscape with a road that forks, stops, or loops independently from gameplay.
- Patching missing logic by placing DOM fields somewhere over a decorative image.
- A second visual path behind the actual SVG field route.
- Pretty scenery that competes with Start, Ziel, or the next dice action.
