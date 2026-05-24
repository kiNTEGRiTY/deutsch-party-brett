import { BOARD_THEME } from '../engine/board-layouts.js?v=game-feel-cutouts-30';
import { getFieldMeta } from '../engine/field-types.js';
import { Dice } from '../engine/dice.js';
import { iconCoin, iconDice, iconHome, iconStar } from './icons.js';
import { renderCharacterAvatar } from './characters.js?v=game-feel-cutouts-30';
import { SoundManager } from './sound-manager.js?v=game-feel-cutouts-30';

const VIEWBOX = { width: 1672, height: 941 };

const FIELD_STYLE = {
  start: { label: 'LOS', title: 'Start', color: '#48b66f', deep: '#247344', icon: 'LOS' },
  finish: { label: 'ZIEL', title: 'Ziel', color: '#ffc63f', deep: '#8a5a06', icon: 'Z' },
  nomen: { label: 'N', title: 'Nomen', color: '#ef705d', deep: '#9f3d2d', icon: 'Aa' },
  verben: { label: 'V', title: 'Verben', color: '#53be78', deep: '#287c4a', icon: 'tu' },
  adjektiv: { label: 'A', title: 'Adjektive', color: '#5aa7ee', deep: '#24649f', icon: 'wie' },
  helper: { label: '?', title: 'Helfer', color: '#66d2e7', deep: '#25798c', icon: '?' },
  movement: { label: '>>', title: 'Bewegung', color: '#f2a94c', deep: '#9a5c1e', icon: '>>' },
  trap: { label: '!', title: 'Falle', color: '#f15b66', deep: '#9a2731', icon: '!' },
  reward: { label: '+', title: 'Bonus', color: '#ffd35a', deep: '#a06a0a', icon: '+' },
  portal: { label: 'P', title: 'Portal', color: '#8c73ff', deep: '#4b35af', icon: 'P' },
  normal: { label: '.', title: 'Aufgabe', color: '#f2d9a2', deep: '#8c6330', icon: '*' }
};

const DIRECTION_MARKERS = [2, 6, 10, 14, 18, 22, 26, 30, 33];

const MOMENT_DECK = [
  { title: 'Blitzduell', text: 'Zwei Spieler antworten gleichzeitig.' },
  { title: 'Jokerzug', text: 'Ein Hinweis, Tausch oder Bonus kann retten.' },
  { title: 'Teamruf', text: 'Die Gruppe darf einen kurzen Tipp geben.' },
  { title: 'Risiko', text: 'Mehr Punkte oder ein Rueckschritt.' }
];

export class BoardRenderer {
  constructor(containerEl, gameController) {
    this.container = containerEl;
    this.game = gameController;
    this.onMinigameNeeded = null;
    this.onMenuRequested = null;
  }

  render() {
    const players = this.game.getPlayers();
    const currentPlayer = this.game.getCurrentPlayer();
    if (!currentPlayer || !this.game.board) {
      return;
    }

    const currentField = this.game.board.getField(currentPlayer.position);
    const progress = Math.round((currentPlayer.position / (this.game.board.totalFields - 1)) * 100);
    const nextField = this.game.board.getField(Math.min(currentPlayer.position + 1, this.game.board.totalFields - 1));

    if (!this.container.querySelector('.board-shell')) {
      this.container.innerHTML = `
        <div class="board-shell board-shell--integrated animate-screen">
          <div class="board-watercolor-bg" aria-hidden="true"></div>

          <section class="board-map-frame" aria-label="Spielbrett">
            <div class="board-map-art board-map-art--painted" aria-hidden="true"></div>
            <svg class="board-playfield" viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}" preserveAspectRatio="xMidYMin meet" role="img" aria-label="Deutsch Party Brett Spielzustand">
              <defs>
                <linearGradient id="boardPathPremium" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stop-color="#ffe9a8"></stop>
                  <stop offset="0.5" stop-color="#d8a74c"></stop>
                  <stop offset="1" stop-color="#8f5b24"></stop>
                </linearGradient>
                <linearGradient id="fieldGlaze" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stop-color="#ffffff" stop-opacity="0.94"></stop>
                  <stop offset="0.5" stop-color="#fff7dd" stop-opacity="0.42"></stop>
                  <stop offset="1" stop-color="#5a3519" stop-opacity="0.12"></stop>
                </linearGradient>
              </defs>
              <g class="board-static-layer"></g>
              <g class="board-dynamic-layer"></g>
            </svg>
          </section>

          <header class="board-header">
            <button id="btn-board-menu" class="board-home-button" type="button">${iconHome(18)} Start</button>
            <div class="board-title-block">
              <span id="board-round-label"></span>
              <h1>${this._escape(BOARD_THEME.worldLabel || 'Deutsch-Abenteuer')}</h1>
            </div>
            <div class="board-turn-card"></div>
          </header>

          <aside class="board-context-dock" aria-label="Spielinformationen">
            <section class="board-panel board-panel--field"></section>
            <section class="board-panel board-panel--moments">
              <span class="board-panel-kicker">Naechste Momente</span>
              <div class="board-moment-list"></div>
            </section>
          </aside>

          <section class="board-player-rail" aria-label="Figuren"></section>
          <div class="board-progress-chip"></div>

          <footer class="board-action-dock">
            <button id="dice-roll-button" class="board-dice-button" type="button">
              <span class="board-dice-copy">
                <strong id="dice-prompt">${iconDice(20)} Wuerfeln</strong>
                <small id="dice-helper"></small>
              </span>
              <span class="board-dice" id="dice" aria-hidden="true">${this._renderDiceDots(this.game.dice?.value || 1)}</span>
            </button>
            <div class="board-dock-stack"></div>
            <div class="board-dock-tags">
              ${this._renderLegendItem('nomen')}
              ${this._renderLegendItem('helper')}
              ${this._renderLegendItem('trap')}
              ${this._renderLegendItem('reward')}
            </div>
          </footer>
        </div>
      `;

      this._setupBoardActions();
      this._setupDiceHandler();
    }

    this._updateBoardState(players, currentPlayer, currentField, nextField, progress);
  }

  _renderBoardDynamic(players, currentPlayer) {
    const currentField = this.game.board.getField(currentPlayer.position);
    const currentPoint = this._projectField(currentField);
    return `
      <g class="board-current-target" transform="translate(${currentPoint.x} ${currentPoint.y})">
        <ellipse rx="78" ry="46"></ellipse>
      </g>
      <g class="board-token-layer">
        ${players.map((player) => this._renderToken(player, currentPlayer)).join('')}
      </g>
    `;
  }

  _renderBoardStatic() {
    const fields = this.game.board.getAllFields();
    return `
      ${this._renderDecor()}
      ${this._renderPortalBridge(fields)}
      ${this._renderPath(fields)}
      ${this._renderDirectionMarkers(fields)}
      <g class="board-field-layer">
        ${fields.map((field) => this._renderFieldTile(field)).join('')}
      </g>
      ${this._renderLandmarks()}
    `;
  }

  _renderDecor() {
    return `
      <g class="board-map-decor" aria-hidden="true">
        <path class="decor-sky" d="M0 0H1672V246C1458 218 1362 244 1197 215C1020 184 940 228 770 190C590 150 468 220 290 178C184 153 92 176 0 220Z"></path>
        <path class="decor-hill decor-hill--back" d="M0 650C170 590 332 620 492 672C642 721 744 671 900 682C1060 694 1190 758 1348 724C1465 698 1558 645 1672 662V941H0Z"></path>
        <path class="decor-hill decor-hill--front" d="M0 771C156 700 296 710 456 760C626 812 772 770 928 782C1100 796 1216 872 1395 824C1502 795 1594 764 1672 786V941H0Z"></path>
        <path class="decor-river" d="M1338 15C1294 82 1342 146 1392 199C1456 268 1442 354 1372 424C1300 496 1326 578 1392 650C1454 718 1446 802 1396 910"></path>
        <path class="decor-river-light" d="M1349 30C1318 91 1360 149 1410 203C1465 264 1448 344 1384 411C1319 479 1346 566 1407 630C1474 699 1458 782 1412 908"></path>
        <g class="decor-forest">
          <path d="M112 690C74 594 118 512 139 425C168 514 211 594 166 699Z"></path>
          <path d="M184 642C151 560 186 500 207 432C231 509 270 579 230 647Z"></path>
          <path d="M260 604C232 538 260 482 280 424C302 488 335 548 302 608Z"></path>
          <path d="M312 520C284 466 306 414 328 364C349 419 378 474 350 526Z"></path>
          <path d="M166 412C134 346 168 286 190 228C214 295 252 356 214 420Z"></path>
          <path d="M260 382C232 322 258 271 282 221C304 276 338 330 309 388Z"></path>
        </g>
        <g class="decor-fireflies">
          <circle cx="242" cy="384" r="8"></circle>
          <circle cx="302" cy="546" r="7"></circle>
          <circle cx="708" cy="274" r="8"></circle>
          <circle cx="968" cy="618" r="9"></circle>
          <circle cx="1490" cy="338" r="7"></circle>
        </g>
      </g>
    `;
  }

  _renderLandmarks() {
    return `
      <g class="board-landmarks" aria-hidden="true">
        <g class="landmark-start" transform="translate(172 848)">
          <path d="M-74 20H82L62-42H-52Z"></path>
          <text y="7" text-anchor="middle">START</text>
        </g>
        <g class="landmark-castle" transform="translate(1452 272)">
          <path d="M-110 82H110V-20L76-38L42-20L4-52L-34-20L-78-42L-110-18Z"></path>
          <rect x="-74" y="8" width="34" height="74" rx="8"></rect>
          <rect x="39" y="8" width="34" height="74" rx="8"></rect>
          <path d="M-126-18L-78-74L-28-18ZM-42-20L4-92L50-20ZM50-18L78-72L126-18Z"></path>
          <text y="22" text-anchor="middle">SCHLOSS</text>
        </g>
        <g class="landmark-sign" transform="translate(1322 96)">
          <path d="M-96-26H96L82 30H-82Z"></path>
          <text y="4" text-anchor="middle">ZIELPFAD</text>
        </g>
      </g>
    `;
  }

  _renderPath(fields) {
    const points = fields.map((field) => `${field.x},${field.y}`).join(' ');
    return `
      <g class="board-main-path" aria-hidden="true">
        <polyline class="path-shadow" points="${points}"></polyline>
        <polyline class="path-earth" points="${points}"></polyline>
        <polyline class="path-gold" points="${points}"></polyline>
        <polyline class="path-stitched" points="${points}"></polyline>
      </g>
    `;
  }

  _renderDirectionMarkers(fields) {
    return `
      <g class="board-direction-markers" aria-hidden="true">
        ${DIRECTION_MARKERS.map((index) => {
          const from = fields[index];
          const to = fields[Math.min(index + 1, fields.length - 1)];
          if (!from || !to) return '';
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
          return `
            <g transform="translate(${midX} ${midY}) rotate(${angle})">
              <path d="M-24 -14 L20 -14 L34 0 L20 14 L-24 14 L-12 0Z"></path>
            </g>
          `;
        }).join('')}
      </g>
    `;
  }

  _renderPortalBridge(fields) {
    return '';
  }

  _renderFieldTile(field) {
    const style = this._fieldStyle(field);
    const isStart = field.id === 0;
    const isFinish = field.id === this.game.board.totalFields - 1;
    const isPortalReturn = field.portalRole === 'return';
    const displayType = isStart ? 'Start' : isFinish ? 'Ziel' : this._fieldTitle(field);
    const shortLabel = this._shortFieldLabel(field);
    const className = [
      'board-field-node',
      `board-field-node--${field.type}`,
      isStart ? 'is-start' : '',
      isFinish ? 'is-finish' : '',
      field.type === 'portal' || isPortalReturn ? 'is-portal-node' : '',
      isPortalReturn ? 'is-portal-return' : ''
    ].filter(Boolean).join(' ');

    const radius = isStart || isFinish ? 52 : 34;
    const stonePath = this._fieldStonePath(field.id, radius);
    const innerPath = this._fieldStonePath(field.id + 4, radius - 9);
    const washPath = this._fieldStonePath(field.id + 11, radius + 4);

    return `
      <g class="${className}" transform="translate(${field.x} ${field.y})" style="--field-accent:${style.color}; --field-deep:${style.deep};">
        <path class="field-shadow" d="${stonePath}"></path>
        <path class="field-wash" d="${washPath}"></path>
        <path class="field-body" d="${stonePath}"></path>
        <path class="field-glaze" d="${innerPath}"></path>
        <circle class="field-type-dot" cx="${isStart || isFinish ? -18 : -18}" cy="${isStart || isFinish ? -24 : -18}" r="${isStart || isFinish ? 12 : 9}"></circle>
        <text class="field-icon" x="${isStart || isFinish ? -18 : -18}" y="${isStart || isFinish ? -24 : -18}" text-anchor="middle" dominant-baseline="central">${this._escape(style.icon)}</text>
        <text class="field-index" x="${isStart || isFinish ? 20 : 17}" y="${isStart || isFinish ? -27 : -21}" text-anchor="middle">${String(field.id).padStart(2, '0')}</text>
        <text class="field-main" y="${isStart || isFinish ? 9 : 8}" text-anchor="middle">${this._escape(shortLabel)}</text>
      </g>
    `;
  }

  _fieldStonePath(seed = 0, radius = 36) {
    const points = Array.from({ length: 12 }, (_, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 12;
      const wobble = 1 + Math.sin(seed * 1.73 + index * 1.91) * 0.075 + Math.cos(seed * 0.91 + index * 2.37) * 0.045;
      return {
        x: Math.cos(angle) * radius * wobble,
        y: Math.sin(angle) * radius * 0.74 * wobble
      };
    });

    const first = points[0];
    return [
      `M${first.x.toFixed(1)} ${first.y.toFixed(1)}`,
      ...points.map((point, index) => {
        const next = points[(index + 1) % points.length];
        const midX = (point.x + next.x) / 2;
        const midY = (point.y + next.y) / 2;
        return `Q${point.x.toFixed(1)} ${point.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
      }),
      'Z'
    ].join(' ');
  }

  _getBoardSignature() {
    return this.game.board.getAllFields()
      .map((field) => `${field.id}:${field.type}:${field.displayValue || ''}:${field.portalPairId ?? ''}:${field.portalRole || ''}`)
      .join('|');
  }

  _updateBoardState(players, currentPlayer, currentField, nextField, progress) {
    const roundLabel = this.container.querySelector('#board-round-label');
    if (roundLabel) {
      roundLabel.textContent = `Runde ${this.game.turnManager.getRound()} · ${BOARD_THEME.name || 'Aquarellpfad'}`;
    }

    const turnCard = this.container.querySelector('.board-turn-card');
    if (turnCard) {
      turnCard.style.setProperty('--player-accent', currentPlayer.color || '#b9563e');
      turnCard.innerHTML = `
        ${currentPlayer.getTokenHTML(44)}
        <div>
          <span>Am Zug</span>
          <strong>${this._escape(currentPlayer.name)}</strong>
        </div>
      `;
    }

    const fieldPanel = this.container.querySelector('.board-panel--field');
    if (fieldPanel) {
      fieldPanel.innerHTML = `
        <div>
          <span class="board-panel-kicker">Aktuelles Feld</span>
          <strong>${this._fieldTitle(currentField)}</strong>
          <p>${this._fieldPrompt(currentField)}</p>
        </div>
        <div class="board-field-type" style="--field-accent:${this._fieldStyle(currentField).color}">
          <i>${this._shortFieldLabel(currentField)}</i>
          <span>${this._fieldTypeLabel(currentField)}</span>
        </div>
      `;
    }

    const momentList = this.container.querySelector('.board-moment-list');
    if (momentList) {
      momentList.innerHTML = this._renderMomentList(currentField, nextField);
    }

    const playerRail = this.container.querySelector('.board-player-rail');
    if (playerRail) {
      playerRail.innerHTML = players.map((player) => this._renderPlayerSlip(player, currentPlayer)).join('');
    }

    const progressChip = this.container.querySelector('.board-progress-chip');
    if (progressChip) {
      progressChip.innerHTML = `
        <span>${progress}%</span>
        <i><b style="width:${progress}%; --player-accent:${currentPlayer.color || '#b9563e'}"></b></i>
      `;
    }

    const staticLayer = this.container.querySelector('.board-static-layer');
    if (staticLayer) {
      const signature = this._getBoardSignature();
      if (staticLayer.dataset.signature !== signature) {
        staticLayer.innerHTML = this._renderBoardStatic();
        staticLayer.dataset.signature = signature;
      }
    }

    const dynamicLayer = this.container.querySelector('.board-dynamic-layer');
    if (dynamicLayer) {
      dynamicLayer.innerHTML = this._renderBoardDynamic(players, currentPlayer);
    }

    const diceHelper = this.container.querySelector('#dice-helper');
    if (diceHelper) {
      diceHelper.textContent = `${currentPlayer.name} zieht die Figur auf dem klaren Weg weiter.`;
    }

    const dockStack = this.container.querySelector('.board-dock-stack');
    if (dockStack) {
      dockStack.innerHTML = `
        <span>Feld ${currentPlayer.position}/${this.game.board.totalFields - 1}</span>
        <strong>${this._fieldTitle(currentField)}</strong>
      `;
    }
  }

  _renderToken(player, currentPlayer) {
    const field = this.game.board.getField(player.position);
    const point = this._projectField(field);
    const active = currentPlayer.id === player.id;
    const offset = this._getTokenOffset(player);
    const size = active ? 82 : 70;
    const x = point.x + offset.x;
    const y = point.y + offset.y - 18;
    const avatarSize = Math.round(size * 0.74);
    const plateWidth = Math.round(size * 0.86);
    const plateHeight = Math.round(size * 0.95);
    const baseWidth = Math.round(size * 0.95);

    return `
      <g id="token-${player.id}" class="board-token ${active ? 'is-active' : ''}" transform="translate(${x} ${y})" style="--player-accent:${player.color || '#b9563e'}">
        <g class="board-token-body">
          <ellipse class="board-token-cast" cy="${Math.round(size * 0.52)}" rx="${Math.round(size * 0.58)}" ry="${Math.round(size * 0.16)}"></ellipse>
          <path class="board-token-stand" d="M ${-plateWidth / 2} ${-plateHeight / 2} C ${-plateWidth / 2 - 10} ${-plateHeight * 0.16} ${-plateWidth / 2 + 4} ${plateHeight * 0.23} 0 ${plateHeight * 0.38} C ${plateWidth / 2 - 4} ${plateHeight * 0.23} ${plateWidth / 2 + 10} ${-plateHeight * 0.16} ${plateWidth / 2} ${-plateHeight / 2} C ${plateWidth * 0.24} ${-plateHeight * 0.62} ${-plateWidth * 0.24} ${-plateHeight * 0.62} ${-plateWidth / 2} ${-plateHeight / 2} Z"></path>
          <foreignObject x="${-avatarSize / 2}" y="${-Math.round(size * 0.55)}" width="${avatarSize}" height="${avatarSize}">
            <div xmlns="http://www.w3.org/1999/xhtml" class="board-token-avatar">
              ${renderCharacterAvatar(player.colorIndex, avatarSize)}
            </div>
          </foreignObject>
          <ellipse class="board-token-base" cy="${Math.round(size * 0.38)}" rx="${baseWidth / 2}" ry="${Math.round(size * 0.15)}"></ellipse>
          <ellipse class="board-token-base-highlight" cy="${Math.round(size * 0.33)}" rx="${Math.round(baseWidth * 0.35)}" ry="${Math.round(size * 0.055)}"></ellipse>
        </g>
      </g>
    `;
  }

  _renderMomentList(currentField, nextField) {
    const seeded = [
      { title: this._fieldTitle(currentField), text: this._fieldPrompt(currentField) },
      { title: `Danach: ${this._fieldTitle(nextField)}`, text: this._fieldPrompt(nextField) },
      ...MOMENT_DECK
    ];

    return seeded.slice(0, 5).map((moment, index) => `
      <article class="board-moment ${index === 0 ? 'is-now' : ''}">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <div>
          <strong>${this._escape(moment.title)}</strong>
          <p>${this._escape(moment.text)}</p>
        </div>
      </article>
    `).join('');
  }

  _renderPlayerSlip(player, currentPlayer) {
    const totalSteps = this.game.board.totalFields - 1;
    const progress = Math.round((player.position / totalSteps) * 100);
    const field = this.game.board.getField(player.position);

    return `
      <article class="board-player-slip ${player.id === currentPlayer.id ? 'is-current' : ''}" style="--player-accent:${player.color || '#b9563e'}">
        <div class="board-player-head">
          ${player.getTokenHTML(38)}
          <div>
            <strong>${this._escape(player.name)}</strong>
            <span>Feld ${player.position} · ${this._fieldTitle(field)}</span>
          </div>
        </div>
        <div class="board-player-progress"><span style="width:${progress}%;"></span></div>
        <div class="board-player-stats">
          <span>${iconCoin(14)} ${player.coins}</span>
          <span>${iconStar(14)} ${player.stars}</span>
          ${player.extraTurns ? '<span>Bonuszug</span>' : ''}
        </div>
      </article>
    `;
  }

  _renderLegendItem(type) {
    const style = FIELD_STYLE[type] || FIELD_STYLE.normal;
    return `
      <span class="board-legend-pill" style="--field-accent:${style.color}">
        <i>${style.label}</i>${style.title}
      </span>
    `;
  }

  _projectField(field) {
    return {
      x: Number(field?.x) || 0,
      y: Number(field?.y) || 0
    };
  }

  _fieldStyle(field) {
    if (field?.id === 0) return FIELD_STYLE.start;
    if (field?.id === this.game.board.totalFields - 1) return FIELD_STYLE.finish;
    if (field?.portalRole === 'return') return FIELD_STYLE.portal;
    return FIELD_STYLE[field?.type] || FIELD_STYLE.normal;
  }

  _fieldTypeLabel(field) {
    if (field?.id === 0) return 'Start';
    if (field?.id === this.game.board.totalFields - 1) return 'Ziel';
    if (field?.portalRole === 'return') return 'Portal';
    return getFieldMeta(field?.type).label;
  }

  _shortFieldLabel(field) {
    if (field.id === 0) return 'LOS';
    if (field.id === this.game.board.totalFields - 1) return 'ZIEL';
    if (field.type === 'movement') return field.move > 0 ? `+${field.move}` : `${field.move || '<'}`;
    if (field.type === 'trap') return '!';
    if (field.type === 'reward') return field.rewardMode === 'extra_turn' ? 'x2' : '+';
    if (field.type === 'portal') return 'P';
    return this._fieldStyle(field).label;
  }

  _fieldTitle(field) {
    if (!field) return 'Brettfeld';
    if (field.id === 0) return 'Startfeld';
    if (field.id === this.game.board.totalFields - 1) return 'Zielfeld';
    if (field.portalRole === 'return') return `Portalpartner zu Feld ${field.portalPairId}`;
    if (field.type === 'movement') return `Bewegung ${field.displayValue || ''}`.trim();
    if (field.type === 'trap') return `Risiko ${field.displayValue || ''}`.trim();
    if (field.type === 'reward') return field.rewardMode === 'extra_turn' ? 'Bonuszug' : 'Belohnung';
    if (field.type === 'portal') return `Portal zu Feld ${field.portalPairId}`;
    return field.focusTitle || getFieldMeta(field.type).label;
  }

  _fieldPrompt(field) {
    if (!field) return 'Naechster Spielmoment.';
    if (field.id === 0) return 'Wuerfeln und die erste Aufgabe oeffnen.';
    if (field.id === this.game.board.totalFields - 1) return 'Wer hier landet, erreicht das Finale.';
    if (field.type === 'movement') return field.move > 0 ? `${field.move} Felder vor.` : `${Math.abs(field.move || 0)} Felder zurueck.`;
    if (field.type === 'trap') return `Risiko: ${Math.abs(field.move || 0)} Felder zurueck oder Aufgabe retten.`;
    if (field.type === 'reward') return field.rewardMode === 'extra_turn' ? 'Sofort noch einmal wuerfeln.' : 'Muenzen, Sterne oder einen Joker einsammeln.';
    if (field.type === 'portal') return `Sprung direkt zu Feld ${field.portalPairId}.`;
    if (field.portalRole === 'return') return `Dieses Feld verbindet zurueck zu Feld ${field.portalPairId}.`;
    return field.focusPrompt || 'Deutsch-Aufgabe starten.';
  }

  _getTokenOffset(player) {
    const sameField = this.game.getPlayers().filter((entry) => entry.position === player.position);
    const index = sameField.findIndex((entry) => entry.id === player.id);
    return [
      { x: -25, y: 26 },
      { x: 25, y: -24 },
      { x: -25, y: -24 },
      { x: 25, y: 26 }
    ][index] || { x: 0, y: 0 };
  }

  _setupBoardActions() {
    document.getElementById('btn-board-menu')?.addEventListener('click', () => {
      this.onMenuRequested?.();
    });
  }

  _renderDiceDots(value) {
    return Dice.getDotPattern(value).map((visible) => `<span class="board-dice-dot ${visible ? 'is-visible' : ''}"></span>`).join('');
  }

  _setupDiceHandler() {
    const diceButton = document.getElementById('dice-roll-button');
    const diceEl = document.getElementById('dice');
    const dicePromptEl = document.getElementById('dice-prompt');
    if (!diceButton || !diceEl) return;

    diceButton.addEventListener('click', async () => {
      if (this.game.state !== 'playing' || diceEl.classList.contains('is-rolling')) return;

      diceEl.classList.add('is-rolling');
      SoundManager.play('diceRoll');
      if (dicePromptEl) dicePromptEl.textContent = 'Wuerfelt...';

      const rollingHandler = (event) => {
        diceEl.innerHTML = this._renderDiceDots(event.detail.value);
      };

      window.addEventListener('dice:rolling', rollingHandler);
      const value = await this.game.rollDice();
      window.removeEventListener('dice:rolling', rollingHandler);
      diceEl.classList.remove('is-rolling');

      if (!value) {
        if (dicePromptEl) dicePromptEl.textContent = 'Wuerfeln';
        return;
      }

      diceEl.innerHTML = this._renderDiceDots(value);
      SoundManager.play('diceLand');
      if (dicePromptEl) dicePromptEl.textContent = `Wurf: ${value}`;
      await this._resolveMove(value);
    });
  }

  async _resolveMove(diceValue) {
    SoundManager.play('moveStep', { intensity: Math.min(1.4, 0.7 + diceValue * 0.12) });
    this.game.movePlayer(diceValue);
    const landedField = this.game.board.getField(this.game.getCurrentPlayer().position);
    const result = this.game.resolveField(landedField);
    SoundManager.play(landedField.type === 'portal' ? 'portal' : 'fieldLand');

    if (result.action === 'minigame') {
      this.onMinigameNeeded?.(result);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 220));
    this.render();
  }

  update() {
    this.render();
  }

  showToast(message, tone = 'success') {
    const toast = document.createElement('div');
    toast.className = `board-toast board-toast--${tone}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('is-hidden');
      setTimeout(() => toast.remove(), 260);
    }, 1800);
  }

  _escape(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
