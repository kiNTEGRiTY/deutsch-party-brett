import { BOARD_THEME } from '../engine/board-layouts.js';
import { getFieldMeta } from '../engine/field-types.js';
import { Dice } from '../engine/dice.js';
import { iconCoin, iconDice, iconHome, iconStar } from './icons.js';
import { renderCharacterAvatar } from './characters.js';

const LEGEND_TYPES = ['nomen', 'verben', 'adjektiv', 'helper', 'movement', 'trap', 'reward', 'portal'];

const FIELD_STYLE = {
  nomen: { label: 'N', color: '#d95d4d', text: '#fffaf0' },
  verben: { label: 'V', color: '#2f8c62', text: '#fffaf0' },
  adjektiv: { label: 'A', color: '#4d78b7', text: '#fffaf0' },
  helper: { label: '?', color: '#f0c864', text: '#23352e' },
  movement: { label: '>', color: '#4e9d91', text: '#fffaf0' },
  trap: { label: '!', color: '#a94f3d', text: '#fffaf0' },
  reward: { label: '*', color: '#c19034', text: '#23352e' },
  portal: { label: 'P', color: '#7760b8', text: '#fffaf0' },
  normal: { label: '.', color: '#fff0cf', text: '#23352e' }
};

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

    this.container.innerHTML = `
      <div class="board-shell animate-screen">
        <header class="board-topbar">
          <button id="btn-board-menu" class="board-home-button" type="button">${iconHome(18)} Start</button>
          <div class="board-title">
            <span>${BOARD_THEME.name} · Runde ${this.game.turnManager.getRound()}</span>
            <h1>${BOARD_THEME.worldLabel || 'Deutschpfad'}</h1>
          </div>
          <div class="board-turn-pill" style="--player-accent:${currentPlayer.color};">
            ${currentPlayer.getTokenHTML(42)}
            <div>
              <span>Am Zug</span>
              <strong>${this._escape(currentPlayer.name)}</strong>
            </div>
          </div>
        </header>

        <main class="board-workspace">
          <section class="board-stage" aria-label="Spielbrett">
            <div class="board-frame">
              ${this._renderBoardSvg(this.game.board.getAllFields(), players, currentPlayer)}
            </div>
          </section>

          <aside class="board-sidebar" aria-label="Spielinformationen">
            <section class="board-panel board-panel--field">
              <span class="board-panel-label">Aktuelles Feld</span>
              <strong>${this._fieldTitle(currentField)}</strong>
              <p>${this._fieldPrompt(currentField)}</p>
              <div class="board-current-progress">
                <span style="width:${progress}%; --player-accent:${currentPlayer.color};"></span>
              </div>
            </section>

            <section class="board-panel">
              <div class="board-panel-heading">
                <span class="board-panel-label">Spielstand</span>
                <strong>${players.length} Figuren</strong>
              </div>
              <div class="board-player-list">
                ${players.map((player) => this._renderPlayerCard(player, currentPlayer)).join('')}
              </div>
            </section>

            <section class="board-panel board-panel--legend">
              <span class="board-panel-label">Feldarten</span>
              <div class="board-legend">
                ${LEGEND_TYPES.map((type) => this._renderLegendItem(type)).join('')}
              </div>
            </section>
          </aside>
        </main>

        <footer class="board-dock">
          <button id="dice-roll-button" class="board-dice-button" type="button">
            <span class="board-dice-copy">
              <strong id="dice-prompt">${iconDice(20)} Wuerfeln</strong>
              <small>${this._escape(currentPlayer.name)} zieht auf dem Pfad weiter.</small>
            </span>
            <span class="board-dice" id="dice" aria-hidden="true">${this._renderDiceDots(this.game.dice?.value || 1)}</span>
          </button>
          <div class="board-dock-status">
            <span>Feld ${currentPlayer.position}/${this.game.board.totalFields - 1}</span>
            <strong>${this._fieldTitle(currentField)}</strong>
          </div>
        </footer>
      </div>
    `;

    this._setupBoardActions();
    this._setupDiceHandler();
  }

  _renderBoardSvg(fields, players, currentPlayer) {
    const trailPath = this._buildTrailPath(fields);
    const portalSource = fields.find((field) => field.type === 'portal' && Number.isFinite(field.portalPairId));
    const portalTarget = portalSource ? fields[portalSource.portalPairId] : null;

    return `
      <svg class="board-map" viewBox="0 0 1180 780" role="img" aria-label="Deutsch Party Brett Spielbrett">
        <defs>
          <filter id="boardSoftShadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#23352e" flood-opacity="0.18"></feDropShadow>
          </filter>
          <linearGradient id="boardPathCore" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="#b96d38"></stop>
            <stop offset="46%" stop-color="#e0a84c"></stop>
            <stop offset="100%" stop-color="#f0c864"></stop>
          </linearGradient>
          <marker id="boardArrow" markerWidth="14" markerHeight="14" refX="8" refY="7" orient="auto">
            <path d="M1,1 L13,7 L1,13 Z" fill="#24352e"></path>
          </marker>
        </defs>

        <rect class="board-map-paper" x="18" y="18" width="1144" height="744" rx="8"></rect>
        <path class="board-map-land board-map-land--one" d="M38 655 C178 590 278 606 410 636 C570 672 688 632 808 552 C928 472 1028 482 1142 544 L1142 742 L38 742 Z"></path>
        <path class="board-map-land board-map-land--two" d="M52 142 C170 72 304 94 398 172 C498 256 610 214 708 134 C834 32 1014 48 1138 132 L1138 18 L52 18 Z"></path>
        <path class="board-map-river" d="M744 54 C818 128 820 228 760 326 C704 418 754 502 706 604 C670 682 604 718 548 752"></path>
        <path class="board-map-meadow" d="M78 548 C106 408 142 274 238 188 C316 118 426 106 520 132"></path>

        <g class="board-goal-zone" filter="url(#boardSoftShadow)">
          <path d="M1008 94 L1082 94 L1114 150 L1072 206 L996 206 L958 150 Z"></path>
          <text x="1036" y="146">ZIEL</text>
          <text x="1036" y="174">${fields.length - 1}</text>
        </g>

        <g class="board-path">
          <path class="board-path-shadow" d="${trailPath}"></path>
          <path class="board-path-rail" d="${trailPath}"></path>
          <path class="board-path-core" d="${trailPath}"></path>
          ${this._renderDirectionMarks(fields)}
          ${portalSource && portalTarget ? this._renderPortal(portalSource, portalTarget) : ''}
        </g>

        <g class="board-fields">
          ${fields.map((field) => this._renderField(field, currentPlayer)).join('')}
        </g>

        <g class="board-tokens">
          ${players.map((player) => this._renderToken(player, currentPlayer)).join('')}
        </g>
      </svg>
    `;
  }

  _renderField(field, currentPlayer) {
    const point = this._projectField(field);
    const isStart = field.id === 0;
    const isGoal = field.id === this.game.board.totalFields - 1;
    const isCurrent = currentPlayer.position === field.id;
    const style = FIELD_STYLE[field.type] || FIELD_STYLE.normal;
    const radius = isStart || isGoal ? 34 : 27;
    const label = isStart ? 'Los' : isGoal ? 'Ziel' : this._shortFieldLabel(field);

    return `
      <g class="board-field board-field--${field.type} ${isStart ? 'is-start' : ''} ${isGoal ? 'is-goal' : ''} ${isCurrent ? 'is-current' : ''}" transform="translate(${point.x} ${point.y})" style="--field-color:${style.color}; --field-text:${style.text};">
        <circle class="board-field-halo" r="${radius + 12}"></circle>
        <circle class="board-field-stone" r="${radius}"></circle>
        <text class="board-field-index" y="${isStart || isGoal ? -4 : -8}">${field.id}</text>
        <text class="board-field-label" y="${isStart || isGoal ? 15 : 12}">${this._escape(label)}</text>
      </g>
    `;
  }

  _renderToken(player, currentPlayer) {
    const field = this.game.board.getField(player.position);
    const point = this._projectField(field);
    const active = currentPlayer.id === player.id;
    const offset = this._getTokenOffset(player);
    const size = active ? 58 : 50;
    const x = point.x + offset.x;
    const y = point.y + offset.y;

    return `
      <g id="token-${player.id}" class="board-token ${active ? 'is-active' : ''}" transform="translate(${x} ${y})" style="--player-accent:${player.color};">
        <circle class="board-token-shadow" cy="7" r="${size / 2}"></circle>
        <circle class="board-token-plate" r="${size / 2}"></circle>
        <foreignObject x="${-size / 2 + 4}" y="${-size / 2 + 4}" width="${size - 8}" height="${size - 8}">
          <div xmlns="http://www.w3.org/1999/xhtml" class="board-token-avatar">
            ${renderCharacterAvatar(player.colorIndex, size - 10)}
          </div>
        </foreignObject>
      </g>
    `;
  }

  _renderDirectionMarks(fields) {
    return fields
      .slice(2, -1)
      .filter((field) => field.id % 6 === 2)
      .map((field) => {
        const next = fields[field.id + 1];
        const from = this._projectField(field);
        const to = this._projectField(next);
        const x1 = from.x + (to.x - from.x) * 0.18;
        const y1 = from.y + (to.y - from.y) * 0.18;
        const x2 = from.x + (to.x - from.x) * 0.56;
        const y2 = from.y + (to.y - from.y) * 0.56;
        return `<line class="board-path-arrow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#boardArrow)"></line>`;
      })
      .join('');
  }

  _renderPortal(source, target) {
    const start = this._projectField(source);
    const end = this._projectField(target);
    const cx1 = start.x + 90;
    const cy1 = Math.min(start.y, end.y) - 90;
    const cx2 = end.x - 90;
    const cy2 = Math.min(start.y, end.y) - 90;
    return `<path class="board-portal-link" d="M ${start.x} ${start.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${end.x} ${end.y}"></path>`;
  }

  _renderPlayerCard(player, currentPlayer) {
    const totalSteps = this.game.board.totalFields - 1;
    const progress = Math.round((player.position / totalSteps) * 100);
    const field = this.game.board.getField(player.position);

    return `
      <article class="board-player-card ${player.id === currentPlayer.id ? 'is-current' : ''}" style="--player-accent:${player.color};">
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
      <span class="board-legend-item" style="--field-color:${style.color};">
        <i>${style.label}</i>${getFieldMeta(type).label}
      </span>
    `;
  }

  _buildTrailPath(fields) {
    if (!fields.length) return '';
    const points = fields.map((field) => this._projectField(field));
    if (points.length < 2) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let index = 0; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      const previous = points[index - 1] || current;
      const after = points[index + 2] || next;
      const c1x = current.x + (next.x - previous.x) / 6;
      const c1y = current.y + (next.y - previous.y) / 6;
      const c2x = next.x - (after.x - current.x) / 6;
      const c2y = next.y - (after.y - current.y) / 6;
      path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${next.x} ${next.y}`;
    }
    return path;
  }

  _projectField(field) {
    return {
      x: 26 + field.x * 12,
      y: 30 + field.y * 7.15
    };
  }

  _shortFieldLabel(field) {
    if (field.type === 'nomen') return 'N';
    if (field.type === 'verben') return 'V';
    if (field.type === 'adjektiv') return 'A';
    if (field.type === 'helper') return '?';
    if (field.type === 'movement') return field.displayValue || '>';
    if (field.type === 'trap') return field.displayValue || '!';
    if (field.type === 'reward') return field.rewardMode === 'extra_turn' ? 'x2' : '+';
    if (field.type === 'portal') return 'P';
    return FIELD_STYLE[field.type]?.label || getFieldMeta(field.type).label;
  }

  _fieldTitle(field) {
    if (field.id === 0) return 'Startfeld';
    if (field.id === this.game.board.totalFields - 1) return 'Zielfeld';
    if (field.portalRole === 'return') return `Portalpartner zu Feld ${field.portalPairId}`;
    if (field.type === 'movement') return `Bewegung ${field.displayValue || ''}`.trim();
    if (field.type === 'trap') return `Falle ${field.displayValue || ''}`.trim();
    if (field.type === 'reward') return field.rewardMode === 'extra_turn' ? 'Bonuszug' : 'Belohnung';
    if (field.type === 'portal') return `Portal zu Feld ${field.portalPairId}`;
    return field.focusTitle || getFieldMeta(field.type).label;
  }

  _fieldPrompt(field) {
    if (field.id === 0) return 'Wuerfeln und den ersten Lernschritt machen.';
    if (field.id === this.game.board.totalFields - 1) return 'Wer hier landet, erreicht das Ziel.';
    if (field.type === 'movement') return field.move > 0 ? `${field.move} Felder vor.` : `${Math.abs(field.move)} Felder zurueck.`;
    if (field.type === 'trap') return `Risiko: ${Math.abs(field.move || 0)} Felder zurueck.`;
    if (field.type === 'reward') return field.rewardMode === 'extra_turn' ? 'Sofort noch einmal wuerfeln.' : 'Muenzen sammeln.';
    if (field.type === 'portal') return `Sprung direkt zu Feld ${field.portalPairId}.`;
    if (field.portalRole === 'return') return `Dieses Feld verbindet zurueck zu Feld ${field.portalPairId}.`;
    return field.focusPrompt || 'Deutsch-Aufgabe starten.';
  }

  _getTokenOffset(player) {
    const sameField = this.game.getPlayers().filter((entry) => entry.position === player.position);
    const index = sameField.findIndex((entry) => entry.id === player.id);
    return [
      { x: -22, y: 22 },
      { x: 22, y: -22 },
      { x: -22, y: -22 },
      { x: 22, y: 22 }
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
      if (dicePromptEl) dicePromptEl.textContent = `Wurf: ${value}`;
      await this._resolveMove(value);
    });
  }

  async _resolveMove(diceValue) {
    this.game.movePlayer(diceValue);
    const landedField = this.game.board.getField(this.game.getCurrentPlayer().position);
    const result = this.game.resolveField(landedField);

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

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'board-toast';
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
