import { BOARD_THEME } from '../engine/board-layouts.js?v=premium-curation-32';
import { getFieldMeta } from '../engine/field-types.js';
import { Dice } from '../engine/dice.js';
import { iconCoin, iconDice, iconHome, iconStar } from './icons.js';
import { renderCharacterAvatar } from './characters.js?v=premium-curation-32';
import { SoundManager } from './sound-manager.js?v=premium-curation-32';

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

const MOMENT_DECK = [
  { title: 'Blitzduell', text: 'Zwei Spieler antworten gleichzeitig.' },
  { title: 'Jokerzug', text: 'Ein Hinweis, Tausch oder Bonus kann retten.' },
  { title: 'Teamruf', text: 'Die Gruppe darf einen kurzen Tipp geben.' },
  { title: 'Risiko', text: 'Mehr Punkte oder ein Rückschritt.' }
];

export class BoardRenderer {
  constructor(containerEl, gameController) {
    this.container = containerEl;
    this.game = gameController;
    this.onMinigameNeeded = null;
    this.onMenuRequested = null;
    this._movementPreview = null;
    this._isResolvingMove = false;
  }

  render() {
    const players = this.game.getPlayers();
    const currentPlayer = this.game.getCurrentPlayer();
    if (!currentPlayer || !this.game.board) {
      return;
    }

    const currentPosition = this._getPlayerRenderPosition(currentPlayer);
    const currentField = this.game.board.getField(currentPosition);
    const progress = Math.round((currentPosition / (this.game.board.totalFields - 1)) * 100);
    const nextField = this.game.board.getField(Math.min(currentPosition + 1, this.game.board.totalFields - 1));

    if (!this.container.querySelector('.board-shell')) {
      this.container.innerHTML = `
        <div class="board-shell board-shell--integrated animate-screen">
          <div class="board-watercolor-bg" aria-hidden="true"></div>

          <section class="board-map-frame" aria-label="Spielbrett">
            <div class="board-map-art board-map-art--paper" aria-hidden="true"></div>
            <svg class="board-playfield" viewBox="0 0 ${VIEWBOX.width} ${VIEWBOX.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Deutsch Party Brett Spielzustand">
              <defs>
                <linearGradient id="boardPathPremium" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stop-color="#ffe9a8"></stop>
                  <stop offset="0.5" stop-color="#d8a74c"></stop>
                  <stop offset="1" stop-color="#8f5b24"></stop>
                </linearGradient>
                <linearGradient id="boardPaperPremium" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stop-color="#f7e8c2"></stop>
                  <stop offset="0.58" stop-color="#ecd09a"></stop>
                  <stop offset="1" stop-color="#c79758"></stop>
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
              <span class="board-panel-kicker">Nächste Momente</span>
              <div class="board-moment-list"></div>
            </section>
          </aside>

          <section class="board-player-rail" aria-label="Figuren"></section>
          <div class="board-progress-chip"></div>
          <aside class="board-landing-card" aria-live="polite" aria-hidden="true"></aside>

          <footer class="board-action-dock">
            <button id="dice-roll-button" class="board-dice-button" type="button">
              <span class="board-dice-copy">
                <span class="board-dice-kicker">Würfelzug</span>
                <strong id="dice-prompt">${iconDice(20)} Würfeln</strong>
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
    const currentField = this.game.board.getField(this._getPlayerRenderPosition(currentPlayer));
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
      ${this._renderBoardArtwork(fields)}
      ${this._renderDirectionMarkers(fields)}
      <g class="board-field-layer">
        ${fields.map((field) => this._renderFieldTile(field)).join('')}
      </g>
    `;
  }

  _renderBoardArtwork(fields) {
    return `
      <g class="board-artwork-layer" aria-hidden="true">
        <rect class="board-paper-sheet" x="0" y="0" width="${VIEWBOX.width}" height="${VIEWBOX.height}"></rect>
        <path class="board-hill board-hill--top" d="M0 218C188 151 360 166 520 192C684 220 760 126 932 150C1080 171 1178 100 1322 127C1464 154 1558 122 1672 72V0H0Z"></path>
        <path class="board-hill board-hill--bottom" d="M0 842C176 780 350 782 520 826C684 870 792 802 960 822C1118 841 1258 772 1408 804C1532 831 1608 801 1672 774V941H0Z"></path>
        <ellipse class="board-pond board-pond--outer" cx="835" cy="585" rx="170" ry="58"></ellipse>
        <ellipse class="board-pond board-pond--inner" cx="835" cy="585" rx="118" ry="34"></ellipse>
        ${this._renderSceneryTrees()}
        ${this._renderPath(fields)}
        ${this._renderBoardLandmarks()}
      </g>
    `;
  }

  _renderSceneryTrees() {
    const trees = [
      { x: 92, y: 396, scale: 1.08 },
      { x: 505, y: 156, scale: 0.82 },
      { x: 1590, y: 410, scale: 1.06 }
    ];

    return `
      <g class="board-scenery-trees">
        ${trees.map((tree) => `
          <g transform="translate(${tree.x} ${tree.y}) scale(${tree.scale})">
            <path d="M0-126C-39-48-39 18-14 66L0 72L14 66C39 18 39-48 0-126Z"></path>
            <path class="tree-shadow" d="M-36 73C-16 63 22 62 42 74C16 86-18 86-36 73Z"></path>
          </g>
        `).join('')}
      </g>
    `;
  }

  _renderBoardLandmarks() {
    return `
      <g class="board-landmarks" aria-hidden="true">
        <g class="landmark-start" transform="translate(146 552)">
          <path d="M-76 18H76L58-42H-56Z"></path>
          <text y="6" text-anchor="middle">START</text>
        </g>
        <g class="landmark-goal" transform="translate(1135 133)">
          <path d="M-124 58H124V2L82-14L40 2L0-30L-40 2L-82-14L-124 2Z"></path>
          <path d="M-142 2L-82-48L-24 2ZM-50 2L0-60L52 2ZM52 2L82-48L142 2Z"></path>
          <text y="24" text-anchor="middle">ZIEL</text>
        </g>
      </g>
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
    const markerIndexes = new Set([2, 6, 10, 14, 18, 22, 26, 30, fields.length - 2]);
    return `
      <g class="board-direction-markers" aria-hidden="true">
        ${fields.slice(0, -1).map((field, index) => {
          if (!markerIndexes.has(index)) return '';
          const from = fields[index];
          const to = fields[Math.min(index + 1, fields.length - 1)];
          if (!from || !to) return '';
          const midX = (from.x + to.x) / 2;
          const midY = (from.y + to.y) / 2;
          const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;
          return `
            <g transform="translate(${midX} ${midY}) rotate(${angle})">
              <path d="M-28 -16 L24 -16 L39 0 L24 16 L-28 16 L-14 0Z"></path>
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
    const tileWidth = isStart || isFinish ? 118 : 98;
    const tileHeight = isStart || isFinish ? 68 : 60;
    const tileRadius = isStart || isFinish ? 20 : 18;
    const tileX = -tileWidth / 2;
    const tileY = -tileHeight / 2;
    const angle = Number.isFinite(field.angle) ? field.angle : 0;
    const className = [
      'board-field-node',
      `board-field-node--${field.type}`,
      isStart ? 'is-start' : '',
      isFinish ? 'is-finish' : '',
      field.type === 'portal' || isPortalReturn ? 'is-portal-node' : '',
      isPortalReturn ? 'is-portal-return' : ''
    ].filter(Boolean).join(' ');

    return `
      <g class="${className}" transform="translate(${field.x} ${field.y})" style="--field-accent:${style.color}; --field-deep:${style.deep};">
        <g class="field-shape" transform="rotate(${angle})">
          <rect class="field-shadow" x="${tileX}" y="${tileY + 7}" width="${tileWidth}" height="${tileHeight}" rx="${tileRadius}"></rect>
          <rect class="field-wash" x="${tileX - 4}" y="${tileY - 4}" width="${tileWidth + 8}" height="${tileHeight + 8}" rx="${tileRadius + 4}"></rect>
          <rect class="field-body" x="${tileX}" y="${tileY}" width="${tileWidth}" height="${tileHeight}" rx="${tileRadius}"></rect>
          <rect class="field-glaze" x="${tileX + 7}" y="${tileY + 7}" width="${tileWidth - 14}" height="${tileHeight - 14}" rx="${Math.max(10, tileRadius - 5)}"></rect>
        </g>
        <circle class="field-type-dot" cx="${isStart || isFinish ? -29 : -25}" cy="${isStart || isFinish ? -22 : -19}" r="${isStart || isFinish ? 12 : 9}"></circle>
        <text class="field-icon" x="${isStart || isFinish ? -29 : -25}" y="${isStart || isFinish ? -22 : -19}" text-anchor="middle" dominant-baseline="central">${this._escape(style.icon)}</text>
        <text class="field-index" x="${isStart || isFinish ? 31 : 27}" y="${isStart || isFinish ? -23 : -19}" text-anchor="middle">${String(field.id).padStart(2, '0')}</text>
        <text class="field-main" y="${isStart || isFinish ? 10 : 9}" text-anchor="middle">${this._escape(shortLabel)}</text>
        <title>${this._escape(`Feld ${field.id}: ${displayType}`)}</title>
      </g>
    `;
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
      diceHelper.textContent = `${currentPlayer.name} zieht die Figur weiter.`;
    }

    const dockStack = this.container.querySelector('.board-dock-stack');
    if (dockStack) {
      const currentPosition = this._getPlayerRenderPosition(currentPlayer);
      dockStack.innerHTML = `
        <span>Feld ${currentPosition}/${this.game.board.totalFields - 1}</span>
        <strong>${this._fieldTitle(currentField)}</strong>
      `;
    }
  }

  _renderToken(player, currentPlayer) {
    const field = this.game.board.getField(this._getPlayerRenderPosition(player));
    const point = this._projectField(field);
    const active = currentPlayer.id === player.id || this._movementPreview?.playerId === player.id;
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
    const position = this._getPlayerRenderPosition(player);
    const progress = Math.round((position / totalSteps) * 100);
    const field = this.game.board.getField(position);

    return `
      <article class="board-player-slip ${player.id === currentPlayer.id ? 'is-current' : ''}" style="--player-accent:${player.color || '#b9563e'}">
        <div class="board-player-head">
          ${player.getTokenHTML(38)}
          <div>
            <strong>${this._escape(player.name)}</strong>
            <span>Feld ${position} · ${this._fieldTitle(field)}</span>
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
    if (!field) return 'Nächster Spielmoment.';
    if (field.id === 0) return 'Würfeln und die erste Aufgabe öffnen.';
    if (field.id === this.game.board.totalFields - 1) return 'Wer hier landet, erreicht das Finale.';
    if (field.type === 'movement') return field.move > 0 ? `${field.move} Felder vor.` : `${Math.abs(field.move || 0)} Felder zurück.`;
    if (field.type === 'trap') return `Risiko: ${Math.abs(field.move || 0)} Felder zurück oder Aufgabe retten.`;
    if (field.type === 'reward') return field.rewardMode === 'extra_turn' ? 'Sofort noch einmal würfeln.' : 'Münzen, Sterne oder einen Joker einsammeln.';
    if (field.type === 'portal') return `Sprung direkt zu Feld ${field.portalPairId}.`;
    if (field.portalRole === 'return') return `Dieses Feld verbindet zurück zu Feld ${field.portalPairId}.`;
    return field.focusPrompt || 'Deutsch-Aufgabe starten.';
  }

  _getTokenOffset(player) {
    const playerPosition = this._getPlayerRenderPosition(player);
    const sameField = this.game.getPlayers()
      .filter((entry) => this._getPlayerRenderPosition(entry) === playerPosition);
    const index = sameField.findIndex((entry) => entry.id === player.id);
    return [
      { x: -25, y: 26 },
      { x: 25, y: -24 },
      { x: -25, y: -24 },
      { x: 25, y: 26 }
    ][index] || { x: 0, y: 0 };
  }

  _getPlayerRenderPosition(player) {
    if (this._movementPreview?.playerId === player?.id) {
      return this._movementPreview.position;
    }
    return player?.position ?? 0;
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
      if (this.game.state !== 'playing' || this._isResolvingMove || diceEl.classList.contains('is-rolling')) return;

      diceButton.disabled = true;
      diceButton.classList.add('is-busy');
      diceEl.classList.add('is-rolling');
      SoundManager.play('diceRoll');
      if (dicePromptEl) dicePromptEl.textContent = 'Würfelt...';

      const rollingHandler = (event) => {
        diceEl.innerHTML = this._renderDiceDots(event.detail.value);
      };

      try {
        window.addEventListener('dice:rolling', rollingHandler);
        const value = await this.game.rollDice();
        window.removeEventListener('dice:rolling', rollingHandler);
        diceEl.classList.remove('is-rolling');

        if (!value) {
          if (dicePromptEl) dicePromptEl.textContent = 'Würfeln';
          return;
        }

        diceEl.innerHTML = this._renderDiceDots(value);
        SoundManager.play('diceLand');
        if (dicePromptEl) dicePromptEl.textContent = `Wurf: ${value}`;
        await this._resolveMove(value);
      } finally {
        window.removeEventListener('dice:rolling', rollingHandler);
        diceEl.classList.remove('is-rolling');
        diceButton.classList.remove('is-busy');
        diceButton.disabled = false;
      }
    });
  }

  async _resolveMove(diceValue) {
    if (this._isResolvingMove) {
      return;
    }

    this._isResolvingMove = true;

    try {
      const player = this.game.getCurrentPlayer();
      const startPosition = player.position;
      const destination = this.game.board.getDestination(startPosition, diceValue);

      await this._animateBoardMove(player, startPosition, destination, { diceValue, label: 'Schritt' });

      this.game.movePlayer(diceValue);
      this._movementPreview = null;
      this.render();

      const landedField = this.game.board.getField(player.position);
      const result = this.game.resolveField(landedField);
      SoundManager.play(landedField.type === 'portal' ? 'portal' : 'fieldLand');

      if (result.action === 'minigame') {
        await this._showLandingCard(player, landedField, result);
        this._hideLandingCard();
        this.onMinigameNeeded?.({ ...result, player });
        return;
      }

      const animatedFieldEffect = await this._animateResolvedFieldEffect(player, landedField.id, result);

      await new Promise((resolve) => setTimeout(resolve, animatedFieldEffect ? 120 : 220));
      this.render();
    } finally {
      this._movementPreview = null;
      this._isResolvingMove = false;
    }
  }

  async _showLandingCard(player, field, result) {
    const card = this.container.querySelector('.board-landing-card');
    if (!card || !field || !player) {
      return;
    }

    const style = this._fieldStyle(field);
    const modeLabel = result?.mode === 'team'
      ? 'Teamaufgabe'
      : result?.mode === 'challenge'
        ? 'Blitzaufgabe'
        : 'Einzelaufgabe';

    card.style.setProperty('--field-accent', style.color);
    card.innerHTML = `
      <div class="board-landing-player">
        ${player.getTokenHTML(38)}
        <span>${this._escape(player.name)} landet</span>
      </div>
      <div class="board-landing-copy">
        <span>Feld ${field.id}/${this.game.board.totalFields - 1} · ${modeLabel}</span>
        <strong>${this._escape(this._fieldTitle(field))}</strong>
        <p>${this._escape(this._fieldPrompt(field))}</p>
      </div>
      <div class="board-landing-type">
        <i>${this._escape(this._shortFieldLabel(field))}</i>
        <span>${this._escape(this._fieldTypeLabel(field))}</span>
      </div>
    `;
    card.classList.add('is-visible');
    card.setAttribute('aria-hidden', 'false');
    this._setDiceHelper(`${player.name}: Aufgabe auf ${this._fieldTitle(field)} startet.`);

    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  _hideLandingCard() {
    const card = this.container.querySelector('.board-landing-card');
    if (!card) {
      return;
    }

    card.classList.remove('is-visible');
    card.setAttribute('aria-hidden', 'true');
  }

  async _animateResolvedFieldEffect(player, landedPosition, result) {
    if (!player || !result || result.blocked) {
      return false;
    }

    const isAnimatedEffect = ['movement', 'trap', 'portal'].includes(result.action);
    if (!isAnimatedEffect) {
      return false;
    }

    const targetPosition = Number.isFinite(result.newPos)
      ? result.newPos
      : Number.isFinite(result.targetId)
        ? result.targetId
        : player.position;

    if (!Number.isFinite(targetPosition) || targetPosition === landedPosition) {
      return false;
    }

    if (result.action === 'portal') {
      await this._animateBoardJump(player, landedPosition, targetPosition, 'Portal');
      return true;
    }

    const isForward = targetPosition > landedPosition;
    const label = result.action === 'trap'
      ? 'Rückweg'
      : isForward
        ? 'Bonusweg'
        : 'Umweg';

    this._movementPreview = { playerId: player.id, position: landedPosition };
    this.render();
    this._setDiceHelper(`${player.name}: ${label} startet auf Feld ${landedPosition}.`);
    await new Promise((resolve) => setTimeout(resolve, 180));

    await this._animateBoardMove(player, landedPosition, targetPosition, {
      label,
      diceValue: Math.abs(targetPosition - landedPosition),
      stepDelay: result.action === 'trap' ? 175 : 150,
      sound: result.action === 'trap' ? 'failSoft' : 'moveStep'
    });

    return true;
  }

  async _animateBoardJump(player, startPosition, destination, label = 'Sprung') {
    this._movementPreview = { playerId: player.id, position: startPosition };
    this.render();
    this._setDiceHelper(`${player.name}: ${label} von Feld ${startPosition} zu Feld ${destination}.`);
    SoundManager.play('portal');
    await new Promise((resolve) => setTimeout(resolve, 240));

    this._movementPreview = { playerId: player.id, position: destination };
    this.render();
    this._setDiceHelper(`${player.name}: angekommen auf Feld ${destination}.`);
    await new Promise((resolve) => setTimeout(resolve, 320));
  }

  async _animateBoardMove(player, startPosition, destination, movement = {}) {
    const distance = Math.abs(destination - startPosition);
    if (!player || distance === 0) {
      return;
    }

    const options = typeof movement === 'number' ? { diceValue: movement } : movement;
    const direction = Math.sign(destination - startPosition);
    const diceValue = Number.isFinite(options.diceValue) ? options.diceValue : distance;
    const label = options.label || 'Schritt';
    const stepDelay = Number.isFinite(options.stepDelay) ? options.stepDelay : 145;
    const sound = options.sound || 'moveStep';

    for (let step = 1; step <= distance; step += 1) {
      const position = startPosition + direction * step;
      this._movementPreview = {
        playerId: player.id,
        position,
        step,
        totalSteps: distance
      };

      SoundManager.play(sound, { intensity: Math.min(1.4, 0.7 + diceValue * 0.12) });
      this.render();

      this._setDiceHelper(`${player.name}: ${label} ${step}/${distance} zu Feld ${position}.`);

      await new Promise((resolve) => setTimeout(resolve, step === distance ? Math.max(190, stepDelay) : stepDelay));
    }
  }

  _setDiceHelper(message) {
    const diceHelper = this.container.querySelector('#dice-helper');
    if (diceHelper) {
      diceHelper.textContent = message;
    }
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
