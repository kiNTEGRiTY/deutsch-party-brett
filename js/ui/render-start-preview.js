import { Board } from '../engine/board.js?v=minigame-menu-mobile-46';
import { BOARD_THEME } from '../engine/board-layouts.js?v=minigame-menu-mobile-46';
import { FieldType } from '../engine/field-types.js';
import { renderCharacterAvatar } from './characters.js?v=minigame-menu-mobile-46';

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

function paperTilePath(width, height) {
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return [
    `M ${-halfWidth + 16} ${-halfHeight + 2}`,
    `C ${-halfWidth + 32} ${-halfHeight - 7} ${halfWidth - 30} ${-halfHeight - 7} ${halfWidth - 15} ${-halfHeight + 4}`,
    `C ${halfWidth + 4} ${-halfHeight + 18} ${halfWidth + 2} ${halfHeight - 19} ${halfWidth - 14} ${halfHeight - 6}`,
    `C ${halfWidth - 31} ${halfHeight + 8} ${-halfWidth + 31} ${halfHeight + 8} ${-halfWidth + 14} ${halfHeight - 5}`,
    `C ${-halfWidth - 3} ${halfHeight - 18} ${-halfWidth - 4} ${-halfHeight + 17} ${-halfWidth + 16} ${-halfHeight + 2}`,
    'Z'
  ].join(' ');
}

function renderField(field) {
  const style = fieldStyle(field);
  const isEndpoint = field.id === 0 || field.id === 35;
  const width = isEndpoint ? 132 : 108;
  const height = isEndpoint ? 74 : 64;
  const angle = Number.isFinite(field.angle) ? field.angle : 0;
  const label = field.displayValue || style.label;
  const shape = paperTilePath(width, height);
  const shine = paperTilePath(width - 14, height - 14);

  return `
    <g class="start-preview-field ${field.id === 35 ? 'is-goal' : ''}" transform="translate(${field.x} ${field.y})">
      <g transform="rotate(${angle})">
        <path class="start-preview-field-shadow" d="${shape}" transform="translate(6 8)"></path>
        <path class="start-preview-field-card" d="${shape}" fill="${style.fill}" stroke="${style.edge}"></path>
        <path class="start-preview-field-shine" d="${shine}"></path>
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

function renderRouteBand(from, to) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(70, Math.hypot(dx, dy) + 24);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return `
    <g class="start-preview-route-band" transform="translate(${midX} ${midY}) rotate(${angle})">
      <rect class="start-preview-route-band-shadow" x="${-length / 2}" y="-45" width="${length}" height="90" rx="45"></rect>
      <rect class="start-preview-route-band-paper" x="${-length / 2}" y="-38" width="${length}" height="76" rx="38"></rect>
      <rect class="start-preview-route-band-wash" x="${-length / 2 + 12}" y="-24" width="${Math.max(28, length - 24)}" height="48" rx="24"></rect>
    </g>
  `;
}

function renderFieldConnector(from, to) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(34, Math.hypot(dx, dy) - 58);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return `
    <g class="start-preview-connector" transform="translate(${midX} ${midY}) rotate(${angle})">
      <rect class="start-preview-connector-paper" x="${-length / 2}" y="-15" width="${length}" height="30" rx="15"></rect>
      <path class="start-preview-connector-thread" d="M ${-length / 2 + 11} 0 H ${length / 2 - 11}"></path>
    </g>
  `;
}

function renderFieldSocket(field) {
  const style = fieldStyle(field);
  const isEndpoint = field.id === 0 || field.id === 35;
  const width = isEndpoint ? 152 : 124;
  const height = isEndpoint ? 86 : 74;
  const angle = Number.isFinite(field.angle) ? field.angle : 0;
  const shape = paperTilePath(width, height);

  return `
    <g class="start-preview-socket ${isEndpoint ? 'is-endpoint' : ''}" transform="translate(${field.x} ${field.y}) rotate(${angle})" style="--preview-accent:${style.edge};">
      <path class="start-preview-socket-shadow" d="${shape}" transform="translate(0 8)"></path>
      <path class="start-preview-socket-paper" d="${shape}"></path>
    </g>
  `;
}

function renderPaperTexture() {
  return `
    <g class="start-preview-paper-texture" aria-hidden="true">
      <path class="start-preview-paper-wash start-preview-paper-wash--top" d="M0 232C196 176 334 184 498 216C662 248 760 172 922 198C1084 224 1200 178 1360 196C1494 212 1578 186 1672 154V0H0Z"></path>
      <path class="start-preview-paper-wash start-preview-paper-wash--bottom" d="M0 783C166 740 330 736 502 772C672 808 788 744 960 766C1130 788 1244 720 1410 744C1536 762 1608 740 1672 710V941H0Z"></path>
      <path class="start-preview-paper-fiber" d="M102 104C294 78 476 116 660 92C840 68 1034 106 1220 78C1374 55 1515 76 1626 48"></path>
      <path class="start-preview-paper-fiber" d="M46 844C228 806 414 846 594 820C780 792 944 842 1138 808C1308 778 1476 802 1634 760"></path>
      <path class="start-preview-paper-fiber" d="M134 464C320 430 476 470 650 444C820 418 978 468 1158 436C1328 406 1470 434 1588 398"></path>
    </g>
  `;
}

function renderLandmarks() {
  return `
    <g class="start-preview-landmarks" aria-hidden="true">
      <g transform="translate(191 526)">
        <path d="M-92 -25H58L84 0L58 25H-92L-70 0Z"></path>
        <text y="8" text-anchor="middle">START</text>
      </g>
      <g transform="translate(1328 96)">
        <path d="M-116 -24H116L96 31H-96Z"></path>
        <path d="M-74 -24L-48 -62L-12 -24ZM-18 -24L18 -76L54 -24ZM50 -24L76 -62L102 -24Z"></path>
        <text y="13" text-anchor="middle">ZIEL</text>
      </g>
    </g>
  `;
}

function renderRouteSurface(fields) {
  return `
    <g class="start-preview-route-surface" aria-hidden="true">
      <g class="start-preview-route-band-layer">
        ${fields.slice(0, -1).map((field, index) => renderRouteBand(field, fields[index + 1])).join('')}
      </g>
      <g class="start-preview-connector-layer">
        ${fields.slice(0, -1).map((field, index) => renderFieldConnector(field, fields[index + 1])).join('')}
      </g>
      <g class="start-preview-socket-layer">
        ${fields.map((field) => renderFieldSocket(field)).join('')}
      </g>
    </g>
  `;
}

function buildMarkup(fields, step) {
  return `
    <svg class="start-live-board-svg" viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}" role="img" aria-label="${escapeHtml(BOARD_THEME.worldLabel || BOARD_THEME.name)}">
      <rect class="start-preview-paper" x="0" y="0" width="${VIEWBOX.width}" height="${VIEWBOX.height}"></rect>
      ${renderPaperTexture()}
      ${renderLandmarks()}
      ${renderRouteSurface(fields)}
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
