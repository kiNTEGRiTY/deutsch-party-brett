import { Board } from '../engine/board.js?v=start-live-preview-35';
import { BOARD_THEME } from '../engine/board-layouts.js?v=start-live-preview-35';
import { FieldType } from '../engine/field-types.js';
import { renderCharacterAvatar } from './characters.js?v=start-live-preview-35';

const VIEWBOX = { width: 1672, height: 941 };

const FIELD_STYLE = {
  [FieldType.NOMEN]: { label: 'N', fill: '#f6c6a9', edge: '#c95845' },
  [FieldType.VERBEN]: { label: 'V', fill: '#d8e6b5', edge: '#579360' },
  [FieldType.ADJEKTIV]: { label: 'A', fill: '#d8e6ed', edge: '#5c8eb4' },
  [FieldType.HELPER]: { label: '?', fill: '#d8f0eb', edge: '#67b9c3' },
  [FieldType.MOVEMENT]: { label: '>>', fill: '#f5d498', edge: '#c88438' },
  [FieldType.TRAP]: { label: '!', fill: '#f5b7a9', edge: '#c95845' },
  [FieldType.REWARD]: { label: '+', fill: '#f6df8c', edge: '#d39a32' },
  [FieldType.PORTAL]: { label: 'P', fill: '#d9cfff', edge: '#765de8' },
  [FieldType.NORMAL]: { label: '*', fill: '#f1d9a5', edge: '#9c7041' }
};

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fieldStyle(field) {
  if (field.id === 0) {
    return { label: 'LOS', fill: '#dce9b8', edge: '#579360' };
  }

  if (field.id === 35) {
    return { label: 'ZIEL', fill: '#f9e196', edge: '#d39a32' };
  }

  if (field.portalRole === 'return') {
    return FIELD_STYLE[FieldType.PORTAL];
  }

  return FIELD_STYLE[field.type] || FIELD_STYLE[FieldType.NORMAL];
}

function renderPath(fields) {
  return fields.map((field) => `${field.x},${field.y}`).join(' ');
}

function renderField(field) {
  const style = fieldStyle(field);
  const isEndpoint = field.id === 0 || field.id === 35;
  const width = isEndpoint ? 128 : 102;
  const height = isEndpoint ? 72 : 60;
  const radius = isEndpoint ? 22 : 18;
  const x = -width / 2;
  const y = -height / 2;
  const angle = Number.isFinite(field.angle) ? field.angle : 0;
  const label = field.displayValue || style.label;

  return `
    <g class="start-preview-field ${field.id === 35 ? 'is-goal' : ''}" transform="translate(${field.x} ${field.y})">
      <g transform="rotate(${angle})">
        <rect class="start-preview-field-shadow" x="${x + 6}" y="${y + 8}" width="${width}" height="${height}" rx="${radius}"></rect>
        <rect class="start-preview-field-card" x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${style.fill}" stroke="${style.edge}"></rect>
        <rect class="start-preview-field-shine" x="${x + 8}" y="${y + 7}" width="${width - 16}" height="${height - 14}" rx="${Math.max(10, radius - 6)}"></rect>
      </g>
      <text class="start-preview-field-label ${isEndpoint ? 'is-endpoint' : ''}" y="${isEndpoint ? 10 : 8}" text-anchor="middle">${escapeHtml(label)}</text>
    </g>
  `;
}

function renderDirectionMarkers(fields) {
  const indexes = [4, 10, 16, 22, 28, 33];

  return indexes.map((index) => {
    const from = fields[index];
    const to = fields[Math.min(fields.length - 1, index + 1)];
    if (!from || !to) {
      return '';
    }

    const x = (from.x + to.x) / 2;
    const y = (from.y + to.y) / 2;
    const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;

    return `
      <g class="start-preview-arrow" transform="translate(${x} ${y}) rotate(${angle})">
        <path d="M-24-13H18L31 0L18 13H-24L-12 0Z"></path>
      </g>
    `;
  }).join('');
}

function renderTokens(fields, step) {
  const positions = [
    3 + (step % 5),
    8 + (step % 6),
    21 + (step % 5)
  ];

  return positions.map((fieldId, index) => {
    const field = fields[fieldId];
    if (!field) {
      return '';
    }

    const active = index === 0;
    const size = active ? 64 : 54;
    const avatarSize = Math.round(size * 0.72);

    return `
      <g class="start-preview-token ${active ? 'is-active' : ''}" transform="translate(${field.x} ${field.y - 18})">
        <ellipse class="start-preview-token-shadow" cy="${Math.round(size * 0.43)}" rx="${Math.round(size * 0.5)}" ry="${Math.round(size * 0.14)}"></ellipse>
        <path class="start-preview-token-stand" d="M ${-size * 0.38} ${-size * 0.4} C ${-size * 0.5} ${-size * 0.08} ${-size * 0.26} ${size * 0.26} 0 ${size * 0.32} C ${size * 0.26} ${size * 0.26} ${size * 0.5} ${-size * 0.08} ${size * 0.38} ${-size * 0.4} C ${size * 0.16} ${-size * 0.53} ${-size * 0.16} ${-size * 0.53} ${-size * 0.38} ${-size * 0.4} Z"></path>
        <foreignObject x="${-avatarSize / 2}" y="${-Math.round(size * 0.56)}" width="${avatarSize}" height="${avatarSize}">
          <div xmlns="http://www.w3.org/1999/xhtml" class="start-preview-token-avatar">
            ${renderCharacterAvatar(index, avatarSize)}
          </div>
        </foreignObject>
        <ellipse class="start-preview-token-base" cy="${Math.round(size * 0.3)}" rx="${Math.round(size * 0.44)}" ry="${Math.round(size * 0.12)}"></ellipse>
      </g>
    `;
  }).join('');
}

function buildMarkup(fields, step) {
  const pathPoints = renderPath(fields);

  return `
    <svg class="start-live-board-svg" viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}" role="img" aria-label="${escapeHtml(BOARD_THEME.worldLabel || BOARD_THEME.name)}">
      <rect class="start-preview-paper" x="0" y="0" width="${VIEWBOX.width}" height="${VIEWBOX.height}"></rect>
      <path class="start-preview-hill start-preview-hill--top" d="M0 218C188 151 360 166 520 192C684 220 760 126 932 150C1080 171 1178 100 1322 127C1464 154 1558 122 1672 72V0H0Z"></path>
      <path class="start-preview-hill start-preview-hill--bottom" d="M0 842C176 780 350 782 520 826C684 870 792 802 960 822C1118 841 1258 772 1408 804C1532 831 1608 801 1672 774V941H0Z"></path>
      <ellipse class="start-preview-pond" cx="835" cy="585" rx="170" ry="58"></ellipse>
      <g class="start-preview-route">
        <polyline class="start-preview-route-shadow" points="${pathPoints}"></polyline>
        <polyline class="start-preview-route-earth" points="${pathPoints}"></polyline>
        <polyline class="start-preview-route-gold" points="${pathPoints}"></polyline>
      </g>
      ${renderDirectionMarkers(fields)}
      <g class="start-preview-fields">
        ${fields.map((field) => renderField(field)).join('')}
      </g>
      <g class="start-preview-tokens">
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
    step = (step + 1) % 18;
  };

  render();
  frame = window.setInterval(render, 2400);

  return {
    destroy() {
      if (frame) {
        window.clearInterval(frame);
      }
    }
  };
}
