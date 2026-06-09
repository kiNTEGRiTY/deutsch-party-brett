import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { BOARD_THEME, STANDARD_BOARD_LAYOUT } from '../js/engine/board-layouts.js';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VIEWBOX = { width: 1672, height: 941 };
const EXPECTED_FIELD_COUNT = 36;
const SAFE_CENTER_BOUNDS = {
  minX: 110,
  maxX: VIEWBOX.width - 110,
  minY: 120,
  maxY: 720
};
const MAX_SEGMENT_LENGTH = 180;
const MIN_SEGMENT_LENGTH = 70;

const failures = [];

function fail(message) {
  failures.push(message);
}

function distance(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function orientation(a, b, c) {
  const value = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  if (Math.abs(value) < 0.0001) return 0;
  return value > 0 ? 1 : -1;
}

function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  return o1 !== o2 && o3 !== o4;
}

function assertBoardGeometry() {
  if (STANDARD_BOARD_LAYOUT.length !== EXPECTED_FIELD_COUNT) {
    fail(`Expected ${EXPECTED_FIELD_COUNT} fields, found ${STANDARD_BOARD_LAYOUT.length}.`);
  }

  STANDARD_BOARD_LAYOUT.forEach((field, index) => {
    if (field.id !== index) {
      fail(`Field ${index} has non-sequential id ${field.id}.`);
    }

    if (!Number.isFinite(field.x) || !Number.isFinite(field.y) || !Number.isFinite(field.angle)) {
      fail(`Field ${index} has non-finite geometry: ${JSON.stringify(field)}.`);
    }

    if (
      field.x < SAFE_CENTER_BOUNDS.minX ||
      field.x > SAFE_CENTER_BOUNDS.maxX ||
      field.y < SAFE_CENTER_BOUNDS.minY ||
      field.y > SAFE_CENTER_BOUNDS.maxY
    ) {
      fail(`Field ${index} center is outside safe board bounds: (${field.x}, ${field.y}).`);
    }
  });

  for (let index = 0; index < STANDARD_BOARD_LAYOUT.length - 1; index += 1) {
    const segmentLength = distance(STANDARD_BOARD_LAYOUT[index], STANDARD_BOARD_LAYOUT[index + 1]);
    if (segmentLength > MAX_SEGMENT_LENGTH) {
      fail(`Path segment ${index}-${index + 1} is too long (${segmentLength.toFixed(1)}px).`);
    }
    if (segmentLength < MIN_SEGMENT_LENGTH) {
      fail(`Path segment ${index}-${index + 1} is too short (${segmentLength.toFixed(1)}px); fields will read as patched-on clutter.`);
    }
  }

  for (let left = 0; left < STANDARD_BOARD_LAYOUT.length - 1; left += 1) {
    for (let right = left + 1; right < STANDARD_BOARD_LAYOUT.length - 1; right += 1) {
      if (Math.abs(left - right) <= 1) continue;

      if (
        segmentsIntersect(
          STANDARD_BOARD_LAYOUT[left],
          STANDARD_BOARD_LAYOUT[left + 1],
          STANDARD_BOARD_LAYOUT[right],
          STANDARD_BOARD_LAYOUT[right + 1]
        )
      ) {
        fail(`Path self-intersection between segments ${left}-${left + 1} and ${right}-${right + 1}.`);
      }
    }
  }
}

function assertFunctionFirstRendering() {
  const renderer = readFileSync(resolve(rootDir, 'js/ui/render-board.js'), 'utf8');
  const layout = readFileSync(resolve(rootDir, 'js/engine/board-layouts.js'), 'utf8');
  const boardCss = readFileSync(resolve(rootDir, 'css/screens/board.css'), 'utf8');

  if (BOARD_THEME.art?.boardBackdrop) {
    fail('BOARD_THEME.art.boardBackdrop must stay empty; the board must be drawn from field geometry.');
  }

  if (renderer.includes('<image') || renderer.includes('board-artwork-image')) {
    fail('render-board.js must not place fields over an external board image.');
  }

  if (renderer.includes('board-main-path') || renderer.includes('path-gold')) {
    fail('render-board.js must not draw a separate decorative path under the fields.');
  }

  [
    'board-route-band-layer',
    'route-band',
    'board-field-connector-layer',
    'field-connector',
    'paper-fiber',
    'board-field-socket-layer',
    'field-socket',
    '_renderFieldSocket'
  ].forEach((token) => {
    if (renderer.includes(token) || boardCss.includes(token)) {
      fail(`Board rendering must not use old road/connector token "${token}"; the background must be field tiles first.`);
    }
  });

  [
    'board-hill',
    'board-pond',
    'board-scenery-trees',
    'board-map-decor',
    'decor-river',
    '_renderSceneryTrees',
    '_renderDecor'
  ].forEach((token) => {
    if (renderer.includes(token)) {
      fail(`render-board.js must not render scenic backdrop token "${token}"; the board background must be built from fields.`);
    }
  });

  if (
    !renderer.includes('_renderFunctionalFieldBackground(fields)') ||
    !renderer.includes('board-field-built-background') ||
    !renderer.includes('board-field-join-layer') ||
    !renderer.includes('board-field-layer')
  ) {
    fail('render-board.js must draw field-built background, join markers, and playable fields from the same field list.');
  }

  [
    'word-card-crops',
    'contact-sheet',
    'watercolor-premium-board',
    'board-enchanted-backdrop'
  ].forEach((token) => {
    if (boardCss.includes(token)) {
      fail(`board.css must not use backdrop/collage token "${token}" behind the board fields.`);
    }
  });

  if (/board-map-art--paper::before[\s\S]{0,500}url\(/.test(boardCss)) {
    fail('board.css must not place image backdrops behind the field-built board.');
  }

  if (
    !layout.includes('single sequential route') ||
    !layout.includes('no branch art') ||
    !layout.includes('no decorative trail')
  ) {
    fail('board-layouts.js must document the field-first single-route invariant.');
  }
}

assertBoardGeometry();
assertFunctionFirstRendering();

if (failures.length) {
  console.error('Board layout validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Board layout validation passed: ${EXPECTED_FIELD_COUNT} field-first slots, one route, no backdrop image, no socket patch layer.`);
