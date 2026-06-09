import { Board } from '../engine/board.js';
import { BOARD_THEME } from '../engine/board-layouts.js?v=premium-curation-32';
import { FieldType } from '../engine/field-types.js';

const VIEWBOX = 1000;
const TILE_W = 76;
const TILE_H = 58;
const BIG_TILE_W = 112;
const BIG_TILE_H = 72;

const FIELD_STYLE = {
  [FieldType.NOMEN]: { label: 'N', sub: 'Nomen', fill: '#ff8b92', edge: '#f45c69' },
  [FieldType.VERBEN]: { label: 'V', sub: 'Verb', fill: '#68d88e', edge: '#2faa68' },
  [FieldType.ADJEKTIV]: { label: 'A', sub: 'Adj', fill: '#79bcff', edge: '#4a85ff' },
  [FieldType.HELPER]: { label: 'H', sub: 'Tipp', fill: '#ffd676', edge: '#f2ab1e' },
  [FieldType.MOVEMENT]: { label: '±', sub: 'Move', fill: '#79e5df', edge: '#31b9bb' },
  [FieldType.TRAP]: { label: '!', sub: 'Falle', fill: '#ff9b76', edge: '#f06f40' },
  [FieldType.REWARD]: { label: '+', sub: 'Bonus', fill: '#ffb5df', edge: '#ee5ba6' },
  [FieldType.PORTAL]: { label: '↔', sub: 'Portal', fill: '#c7adff', edge: '#845bff' }
};

const PLAYER_STYLE = [
  { fill: '#4d89ff', edge: '#254db0', label: '1' },
  { fill: '#ff6d8f', edge: '#c43862', label: '2' },
  { fill: '#56d88f', edge: '#1d9358', label: '3' },
  { fill: '#ffd65a', edge: '#c58a09', label: '4' }
];

function toPoint(field) {
  return {
    x: field.x * 10,
    y: field.y * 10
  };
}

function buildSmoothPath(fields) {
  if (!fields.length) {
    return '';
  }

  const points = fields.map(toPoint);
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1];
    const current = points[index];
    const cx = (prev.x + current.x) / 2;
    const cy = (prev.y + current.y) / 2;
    path += ` Q ${prev.x} ${prev.y} ${cx} ${cy}`;
  }

  const last = points[points.length - 1];
  path += ` T ${last.x} ${last.y}`;
  return path;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderField(field, index) {
  const { x, y } = toPoint(field);
  const style = FIELD_STYLE[field.type] || FIELD_STYLE[FieldType.NOMEN];
  const isStart = index === 0;
  const isGoal = index === 35;
  const isSpecial = isStart || isGoal;
  const width = isSpecial ? BIG_TILE_W : TILE_W;
  const height = isSpecial ? BIG_TILE_H : TILE_H;
  const radius = isSpecial ? 24 : 18;
  const originX = x - width / 2;
  const originY = y - height / 2;
  const label = isStart ? 'START' : isGoal ? 'ZIEL' : style.label;
  const sub = isStart ? '0' : isGoal ? '35' : (field.displayValue || style.sub);
  const glowClass = isGoal ? 'preview-goal' : field.type === FieldType.PORTAL ? 'preview-portal' : '';

  return `
    <g class="preview-tile ${glowClass}" transform="translate(${originX} ${originY})">
      <rect class="preview-tile-shadow" x="6" y="12" width="${width}" height="${height}" rx="${radius}" />
      <rect class="preview-tile-card" width="${width}" height="${height}" rx="${radius}" fill="${isSpecial ? '#fff7df' : style.fill}" stroke="${isSpecial ? '#e8b83d' : style.edge}" stroke-width="${isSpecial ? 5 : 4}" />
      <rect class="preview-tile-shine" x="4" y="4" width="${width - 8}" height="${Math.max(16, height * 0.3)}" rx="${Math.max(10, radius - 8)}" />
      <text class="preview-tile-label ${isSpecial ? 'is-special' : ''}" x="${width / 2}" y="${isSpecial ? 28 : 25}">${escapeHtml(label)}</text>
      <text class="preview-tile-sub ${isSpecial ? 'is-special' : ''}" x="${width / 2}" y="${isSpecial ? 49 : 45}">${escapeHtml(sub)}</text>
    </g>
  `;
}

function renderPortalLink(fields) {
  const portal = fields.find((field) => field.type === FieldType.PORTAL);
  if (!portal || portal.portalPairId === undefined) {
    return '';
  }

  const pair = fields.find((field) => field.id === portal.portalPairId);
  if (!pair) {
    return '';
  }

  const start = toPoint(portal);
  const end = toPoint(pair);
  const midX = (start.x + end.x) / 2;
  const controlY = Math.min(start.y, end.y) - 90;
  const path = `M ${start.x} ${start.y} C ${start.x} ${controlY}, ${end.x} ${controlY}, ${end.x} ${end.y}`;

  return `
    <path class="preview-portal-link preview-portal-link--glow" d="${path}" />
    <path class="preview-portal-link preview-portal-link--dash" d="${path}" />
  `;
}

function renderTokens(fields, step) {
  const positions = [
    step % 12,
    5 + (step % 11),
    14 + (step % 9)
  ];

  return positions.map((fieldId, index) => {
    const field = fields[fieldId];
    if (!field) {
      return '';
    }

    const { x, y } = toPoint(field);
    const token = PLAYER_STYLE[index];
    const active = index === 0;

    return `
      <g class="preview-token ${active ? 'is-active' : ''}" transform="translate(${x} ${y})">
        <circle class="preview-token-ring" r="${active ? 26 : 22}" />
        <circle class="preview-token-body" r="${active ? 20 : 17}" fill="${token.fill}" stroke="${token.edge}" stroke-width="4" />
        <text class="preview-token-label" y="6">${token.label}</text>
      </g>
    `;
  }).join('');
}

function buildMarkup(fields, step) {
  const path = buildSmoothPath(fields);

  return `
    <svg class="start-live-board-svg" viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" role="img" aria-label="${escapeHtml(BOARD_THEME.name)} Brettvorschau">
      <defs>
        <linearGradient id="previewTrailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff2b4" />
          <stop offset="50%" stop-color="#ffe07a" />
          <stop offset="100%" stop-color="#ffd15a" />
        </linearGradient>
        <filter id="previewSoftGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect class="start-live-board-backplate" x="0" y="0" width="${VIEWBOX}" height="${VIEWBOX}" rx="54" />
      <path class="preview-trail preview-trail--shadow" d="${path}" />
      <path class="preview-trail preview-trail--base" d="${path}" />
      <path class="preview-trail preview-trail--pulse" d="${path}" />
      ${renderPortalLink(fields)}
      <g class="preview-fields">
        ${fields.map((field, index) => renderField(field, index)).join('')}
      </g>
      <g class="preview-tokens">
        ${renderTokens(fields, step)}
      </g>
    </svg>
  `;
}

export function mountStartPreview(root) {
  if (!root) {
    return null;
  }

  let step = 0;
  let frame = null;
  const board = new Board(true, BOARD_THEME.id);

  const render = () => {
    root.innerHTML = buildMarkup(board.fields, step);
    step = (step + 1) % 24;
  };

  render();
  frame = window.setInterval(render, 2800);

  return {
    destroy() {
      if (frame) {
        window.clearInterval(frame);
      }
    }
  };
}
