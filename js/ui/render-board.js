import { BOARD_THEME } from '../engine/board-layouts.js?v=start-fullscreen-47';
import { getFieldMeta } from '../engine/field-types.js';
import { Dice } from '../engine/dice.js';
import { iconCoin, iconDice, iconHome, iconStar } from './icons.js';
import { renderCharacterAvatar } from './characters.js?v=start-fullscreen-47';
import { SoundManager } from './sound-manager.js?v=start-fullscreen-47';

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
        ${this._renderPaperTexture()}
        ${this._renderBoardLandmarks()}
        ${this._renderFieldRouteBackground(fields)}
      </g>
    `;
  }

  _renderPaperTexture() {
    return `
      <g class="board-paper-texture" aria-hidden="true">
        <path class="paper-wash paper-wash--top" d="M0 232C196 176 334 184 498 216C662 248 760 172 922 198C1084 224 1200 178 1360 196C1494 212 1578 186 1672 154V0H0Z"></path>
        <path class="paper-wash paper-wash--bottom" d="M0 783C166 740 330 736 502 772C672 808 788 744 960 766C1130 788 1244 720 1410 744C1536 762 1608 740 1672 710V941H0Z"></path>
        <path class="paper-fiber" d="M102 104C294 78 476 116 660 92C840 68 1034 106 1220 78C1374 55 1515 76 1626 48"></path>
        <path class="paper-fiber" d="M46 844C228 806 414 846 594 820C780 792 944 842 1138 808C1308 778 1476 802 1634 760"></path>
        <path class="paper-fiber" d="M134 464C320 430 476 470 650 444C820 418 978 468 1158 436C1328 406 1470 434 1588 398"></path>
      </g>
    `;
  }

  _renderBoardLandmarks() {
    return `
      <g class="board-landmarks" aria-hidden="true">
        <g class="landmark-start" transform="translate(191 526)">
          <path d="M-92 -25H58L84 0L58 25H-92L-70 0Z"></path>
          <text y="8" text-anchor="middle">START</text>
        </g>
        <g class="landmark-goal" transform="translate(1328 96)">
          <path d="M-116 -24H116L96 31H-96Z"></path>
          <path d="M-74 -24L-48 -62L-12 -24ZM-18 -24L18 -76L54 -24ZM50 -24L76 -62L102 -24Z"></path>
          <text y="13" text-anchor="middle">ZIEL</text>
        </g>
      </g>
    `;
  }

  _renderFieldRouteBackground(fields) {
    return `
      <g class="board-field-route-background" aria-hidden="true">
        <g class="board-route-band-layer">
          ${fields.slice(0, -1).map((field, index) => this._renderRouteBand(field, fields[index + 1])).join('')}
        </g>
        <g class="board-field-connector-layer">
          ${fields.slice(0, -1).map((field, index) => this._renderFieldConnector(field, fields[index + 1])).join('')}
        </g>
        <g class="board-field-socket-layer">
          ${fields.map((field) => this._renderFieldSocket(field)).join('')}
        </g>
      </g>
    `;
  }

  _renderRouteBand(from, to) {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.max(76, Math.hypot(dx, dy) + 30);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return `
      <g class="route-band" transform="translate(${midX} ${midY}) rotate(${angle})">
        <rect class="route-band-shadow" x="${-length / 2}" y="-51" width="${length}" height="102" rx="51"></rect>
        <rect class="route-band-paper" x="${-length / 2}" y="-44" width="${length}" height="88" rx="44"></rect>
        <rect class="route-band-wash" x="${-length / 2 + 14}" y="-28" width="${Math.max(28, length - 28)}" height="56" rx="28"></rect>
      </g>
    `;
  }

  _renderFieldConnector(from, to) {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.max(40, Math.hypot(dx, dy) - 66);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    return `
      <g class="field-connector" transform="translate(${midX} ${midY}) rotate(${angle})">
        <rect class="field-connector-paper" x="${-length / 2}" y="-19" width="${length}" height="38" rx="19"></rect>
        <path class="field-connector-thread" d="M ${-length / 2 + 13} 0 H ${length / 2 - 13}"></path>
      </g>
    `;
  }

  _renderFieldSocket(field) {
    const style = this._fieldStyle(field);
    const isStart = field.id === 0;
    const isFinish = field.id === this.game.board.totalFields - 1;
    const width = isStart || isFinish ? 178 : 146;
    const height = isStart || isFinish ? 98 : 90;
    const angle = Number.isFinite(field.angle) ? field.angle : 0;
    const shape = this._paperTilePath(width, height);

    return `
      <g class="field-socket ${isStart ? 'is-start' : ''} ${isFinish ? 'is-finish' : ''}" transform="translate(${field.x} ${field.y}) rotate(${angle})" style="--field-accent:${style.color}; --field-deep:${style.deep};">
        <path class="field-socket-shadow" d="${shape}" transform="translate(0 9)"></path>
        <path class="field-socket-wash" d="${shape}"></path>
        <path class="field-socket-paper" d="${shape}"></path>
        <path class="field-socket-grain" d="M ${-width * 0.28} ${-height * 0.12} C ${-width * 0.08} ${-height * 0.23} ${width * 0.16} ${-height * 0.2} ${width * 0.32} ${-height * 0.07}"></path>
      </g>
    `;
  }

  _paperTilePath(width, height) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return [
      `M ${-halfWidth + 18} ${-halfHeight + 2}`,
      `C ${-halfWidth + 36} ${-halfHeight - 8} ${halfWidth - 33} ${-halfHeight - 7} ${halfWidth - 16} ${-halfHeight + 5}`,
      `C ${halfWidth + 5} ${-halfHeight + 21} ${halfWidth + 3} ${halfHeight - 22} ${halfWidth - 15} ${halfHeight - 7}`,
      `C ${halfWidth - 34} ${halfHeight + 9} ${-halfWidth + 34} ${halfHeight + 8} ${-halfWidth + 15} ${halfHeight - 5}`,
      `C ${-halfWidth - 4} ${halfHeight - 21} ${-halfWidth - 5} ${-halfHeight + 19} ${-halfWidth + 18} ${-halfHeight + 2}`,
      'Z'
    ].join(' ');
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
    const tileWidth = isStart || isFinish ? 138 : 108;
    const tileHeight = isStart || isFinish ? 76 : 64;
    const badgeX = isStart || isFinish ? -36 : -31;
    const badgeY = isStart || isFinish ? -26 : -22;
    const indexX = isStart || isFinish ? 36 : 31;
    const indexY = isStart || isFinish ? -26 : -22;
    const angle = Number.isFinite(field.angle) ? field.angle : 0;
    const shadowShape = this._paperTilePath(tileWidth, tileHeight);
    const washShape = this._paperTilePath(tileWidth + 8, tileHeight + 8);
    const bodyShape = this._paperTilePath(tileWidth, tileHeight);
    const glazeShape = this._paperTilePath(tileWidth - 14, tileHeight - 14);
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
          <path class="field-shadow" d="${shadowShape}" transform="translate(0 7)"></path>
          <path class="field-wash" d="${washShape}"></path>
          <path class="field-body" d="${bodyShape}"></path>
          <path class="field-glaze" d="${glazeShape}"></path>
        </g>
        <circle class="field-type-dot" cx="${badgeX}" cy="${badgeY}" r="${isStart || isFinish ? 13 : 10}"></circle>
        <text class="field-icon" x="${badgeX}" y="${badgeY}" text-anchor="middle" dominant-baseline="central">${this._escape(style.icon)}</text>
        <text class="field-index" x="${indexX}" y="${indexY}" text-anchor="middle">${String(field.id).padStart(2, '0')}</text>
        <text class="field-main" y="${isStart || isFinish ? 13 : 12}" text-anchor="middle">${this._escape(shortLabel)}</text>
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
