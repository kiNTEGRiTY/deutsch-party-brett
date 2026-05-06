/**
 * Render Board - integrated learning board with a curved path and themed stones.
 */

import { BOARD_THEME } from '../engine/board-layouts.js';
import { getFieldMeta, getFieldIconSVG } from '../engine/field-types.js';
import { Dice } from '../engine/dice.js';
import { iconCoin, iconDice, iconHome, iconStar } from '../ui/icons.js';

const LEGEND_TYPES = ['nomen', 'verben', 'adjektiv', 'helper', 'movement', 'trap', 'reward', 'portal'];

export class BoardRenderer {
  constructor(containerEl, gameController) {
    this.container = containerEl;
    this.game = gameController;
    this.onMinigameNeeded = null;
    this.onMenuRequested = null;
  }

  render() {
    const players = this.game.getPlayers();
    const board = this.game.board;
    const currentPlayer = this.game.getCurrentPlayer();
    const currentField = board.getField(currentPlayer.position);
    const totalSteps = board.totalFields - 1;

    this.container.innerHTML = `
      <div class="dp-board-shell">
        <header class="dp-board-header">
          <div class="dp-board-status">
            <div class="dp-board-status-label">Aktiver Spieler</div>
            <div class="dp-board-status-main">
              <span class="dp-player-chip" style="--player-accent:${currentPlayer.color};">${currentPlayer.name}</span>
              <div class="dp-board-status-copy">
                <strong>Feld ${currentPlayer.position} · ${this._getFieldHeadline(currentField)}</strong>
                <span>${this._getFieldPrompt(currentField)}</span>
              </div>
            </div>
          </div>
          <div class="dp-board-header-actions">
            <div class="dp-round-chip">Runde ${this.game.turnManager.getRound()}</div>
            <button class="dp-menu-button" id="btn-board-menu" type="button">
              ${iconHome(18)}
              <span>Menü</span>
            </button>
          </div>
        </header>

        <div class="dp-board-main">
          <section class="dp-board-center">
            <div class="dp-board-stage-wrap">
              <div class="dp-board-stage">
                ${this._renderBackdrop()}
                ${this._renderTrail(board.getAllFields())}
                ${board.getAllFields().map((field) => this._renderField(field)).join('')}
                ${players.map((player) => this._renderToken(player)).join('')}
              </div>
            </div>
          </section>

          <aside class="dp-board-sidebar">
            <section class="dp-side-card">
              <h2 class="dp-side-title">Punktestand</h2>
              <div class="dp-scoreboard">
                ${players.map((player) => this._renderScoreEntry(player, currentPlayer, totalSteps)).join('')}
              </div>
            </section>

            <section class="dp-side-card">
              <h2 class="dp-side-title">Legende</h2>
              <div class="dp-legend">
                ${LEGEND_TYPES.map((type) => this._renderLegendItem(type)).join('')}
              </div>
            </section>

            <section class="dp-side-card">
              <h2 class="dp-side-title">Aufgaben im Spiel</h2>
              <div class="dp-task-chip-list">
                ${BOARD_THEME.interactions.map((label) => `<span class="dp-task-chip">${label}</span>`).join('')}
              </div>
              <div class="dp-learning-focus">
                <div class="dp-learning-focus-kicker">Lernfokus auf diesem Feld</div>
                <strong>${this._getLearningFocusTitle(currentField)}</strong>
                <p>${this._getFieldPrompt(currentField)}</p>
              </div>
              <div class="dp-values">
                ${BOARD_THEME.values.map((value) => `<span class="dp-value-chip">${value}</span>`).join('')}
              </div>
            </section>
          </aside>
        </div>

        <footer class="dp-board-footer">
          <button class="dp-dice-button" id="dice-roll-button" type="button">
            <div class="dp-dice-copy">
              <div class="dp-dice-title">
                ${iconDice(22)}
                <span id="dice-prompt">Würfeln</span>
              </div>
              <div class="dp-dice-subtitle">Nächster Zug von ${currentPlayer.name}</div>
            </div>
            <div class="dp-dice" id="dice">${this._renderDiceDots(1)}</div>
          </button>
        </footer>
      </div>
    `;

    this._setupBoardActions();
    this._setupDiceHandler();
  }

  _renderBackdrop() {
    return `
      <svg class="dp-board-backdrop" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id="dp-board-glow" cx="50%" cy="48%" r="62%">
            <stop offset="0%" stop-color="#faf8e5" />
            <stop offset="100%" stop-color="#dceecf" />
          </radialGradient>
          <linearGradient id="dp-meadow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#edf7df" />
            <stop offset="100%" stop-color="#d2ebc0" />
          </linearGradient>
          <linearGradient id="dp-clearing" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f4f8da" />
            <stop offset="100%" stop-color="#e1f0c4" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" rx="8" fill="url(#dp-board-glow)"></rect>
        <rect x="7" y="9" width="86" height="82" rx="19" fill="url(#dp-meadow)" opacity="0.5"></rect>
        <path d="M8 100 L8 18 Q18 11 32 14 T58 15 T84 12 T92 17 L92 100 Z" fill="url(#dp-clearing)" opacity="0.82"></path>
        <g opacity="0.32">
          <circle cx="12" cy="12" r="3.8" fill="#fff6cf"></circle>
          <circle cx="18" cy="17" r="2.1" fill="#fff6cf"></circle>
          <circle cx="89" cy="14" r="3.1" fill="#fff6cf"></circle>
          <circle cx="84" cy="82" r="2.3" fill="#fff6cf"></circle>
        </g>
        <g opacity="0.55">
          <circle cx="10" cy="74" r="6" fill="#d8ebbf"></circle>
          <circle cx="90" cy="30" r="7" fill="#d8ebbf"></circle>
          <circle cx="86" cy="88" r="5" fill="#d8ebbf"></circle>
        </g>
        <g class="dp-scene-start" transform="translate(8 89)">
          <rect x="0" y="0" width="10" height="4.6" rx="1.3" fill="#fff7e8" stroke="#ba8439" stroke-width="0.7"></rect>
          <path d="M1.5 4 L3.1 1.7 L4.9 3.3 L6.8 1.4 L8.5 3.8" stroke="#6e9248" stroke-width="0.7" fill="none" stroke-linecap="round"></path>
        </g>
        <g class="dp-scene-goal" transform="translate(80 28)">
          <rect x="-2.8" y="-4.2" width="5.6" height="6.8" rx="1" fill="#fff8ea" stroke="#d3972f" stroke-width="0.7"></rect>
          <path d="M0 -6.4 L0 -1.4 L4.2 -3.8 Z" fill="#ffcb4d" stroke="#d28b12" stroke-width="0.6"></path>
        </g>
        <g class="dp-scene-tree" transform="translate(6 18)">
          <circle cx="3" cy="3" r="3.8" fill="#8fc56d"></circle>
          <circle cx="6.2" cy="4.2" r="3.1" fill="#74b158"></circle>
          <rect x="4" y="5.4" width="1.8" height="4.8" rx="0.5" fill="#8a6945"></rect>
        </g>
        <g class="dp-scene-tree" transform="translate(88 60)">
          <circle cx="3" cy="3" r="3.8" fill="#8fc56d"></circle>
          <circle cx="6.2" cy="4.2" r="3.1" fill="#74b158"></circle>
          <rect x="4" y="5.4" width="1.8" height="4.8" rx="0.5" fill="#8a6945"></rect>
        </g>
      </svg>
    `;
  }

  _renderTrail(fields) {
    const segments = fields
      .slice(0, -1)
      .map((field) => this._renderBridgeSegment(field, fields[field.id + 1]))
      .join('');

    const portalSource = fields.find((field) => field.type === 'portal' && Number.isFinite(field.portalPairId));
    const portalTarget = portalSource ? fields[portalSource.portalPairId] : null;
    const portalPath = portalSource && portalTarget
      ? `
        <path class="dp-portal-link-shadow" d="${this._buildPortalPath(portalSource, portalTarget)}"></path>
        <path class="dp-portal-link" d="${this._buildPortalPath(portalSource, portalTarget)}"></path>
      `
      : '';

    return `
      <svg class="dp-board-trail" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id="dp-trail-arrowhead" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#5c804c"></path>
          </marker>
        </defs>
        ${segments}
        ${portalPath}
      </svg>
    `;
  }

  _renderBridgeSegment(fromField, toField) {
    if (!fromField || !toField) {
      return '';
    }

    const dx = toField.x - fromField.x;
    const dy = toField.y - fromField.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 0.1) {
      return '';
    }

    const plankCount = Math.max(1, Math.floor(distance / 4.2));
    const planks = Array.from({ length: plankCount }, (_, index) => {
      const t = (index + 1) / (plankCount + 1);
      const cx = fromField.x + dx * t;
      const cy = fromField.y + dy * t;
      const perpX = (-dy / distance) * 1.35;
      const perpY = (dx / distance) * 1.35;
      return `
        <line
          class="dp-bridge-plank"
          x1="${cx - perpX}"
          y1="${cy - perpY}"
          x2="${cx + perpX}"
          y2="${cy + perpY}"
        ></line>
      `;
    }).join('');

    const directionArrow = fromField.id % 6 === 2
      ? `
        <line
          class="dp-bridge-arrow"
          x1="${fromField.x + dx * 0.3}"
          y1="${fromField.y + dy * 0.3}"
          x2="${fromField.x + dx * 0.66}"
          y2="${fromField.y + dy * 0.66}"
          marker-end="url(#dp-trail-arrowhead)"
        ></line>
      `
      : '';

    return `
      <g class="dp-bridge-segment">
        <line class="dp-bridge-shadow" x1="${fromField.x}" y1="${fromField.y}" x2="${toField.x}" y2="${toField.y}"></line>
        <line class="dp-bridge-base" x1="${fromField.x}" y1="${fromField.y}" x2="${toField.x}" y2="${toField.y}"></line>
        <line class="dp-bridge-highlight" x1="${fromField.x}" y1="${fromField.y}" x2="${toField.x}" y2="${toField.y}"></line>
        ${planks}
        ${directionArrow}
      </g>
    `;
  }

  _buildPortalPath(source, target) {
    const midX = (source.x + target.x) / 2;
    const controlY = Math.min(source.y, target.y) - 8;
    return `M ${source.x} ${source.y} Q ${midX} ${controlY} ${target.x} ${target.y}`;
  }

  _renderField(field) {
    const info = this._getFieldPresentation(field);
    const isCurrentField = this.game.getCurrentPlayer().position === field.id;
    const isStart = field.id === 0;
    const isGoal = field.id === this.game.board.totalFields - 1;
    const rotation = ((field.id % 4) - 1.5) * 1.25;

    return `
      <div
        class="dp-field dp-field--${field.type} ${isCurrentField ? 'is-current' : ''} ${isStart ? 'is-start' : ''} ${isGoal ? 'is-goal' : ''} ${field.portalRole === 'return' ? 'has-portal-return' : ''} ${field.type === 'portal' ? 'has-portal-source' : ''}"
        style="left:${field.x}%; top:${field.y}%; --field-rotate:${rotation}deg;"
        title="${info.title}"
      >
        <div class="dp-field-surface">
          <span class="dp-field-number">${field.id}</span>
          ${isStart ? '<span class="dp-field-edge dp-field-edge--start">Start</span>' : ''}
          ${isGoal ? '<span class="dp-field-edge dp-field-edge--goal">Ziel</span>' : ''}
          ${field.portalRole === 'return' ? `<span class="dp-field-tag dp-field-tag--portal">${field.portalLinkLabel || `↙ ${field.portalPairId}`}</span>` : ''}
          <div class="dp-field-difficulty">${this._renderDifficultyDots(field.difficultyLevel || 1)}</div>
          <div class="dp-field-icon">${info.icon}</div>
          <div class="dp-field-main">${info.main}</div>
          <div class="dp-field-sub">${info.sub}</div>
        </div>
      </div>
    `;
  }

  _renderDifficultyDots(level) {
    return Array.from({ length: 3 }, (_, index) => `
      <span class="dp-difficulty-dot ${index < level ? 'is-active' : ''}"></span>
    `).join('');
  }

  _getFieldPresentation(field) {
    const isStart = field.id === 0;
    const isGoal = field.id === this.game.board.totalFields - 1;
    const meta = getFieldMeta(field.type);

    if (isStart) {
      return {
        title: 'Start',
        icon: getFieldIconSVG('start', 22),
        main: 'Start',
        sub: 'Los'
      };
    }

    if (isGoal) {
      return {
        title: 'Ziel',
        icon: getFieldIconSVG('finish', 22),
        main: 'Ziel',
        sub: 'Ankommen'
      };
    }

    if (field.type === 'movement') {
      return {
        title: `Bewegung ${field.displayValue || ''}`.trim(),
        icon: getFieldIconSVG(field.type, 22),
        main: field.displayValue || '±',
        sub: field.move > 0 ? 'Vor' : 'Zurück'
      };
    }

    if (field.type === 'trap') {
      return {
        title: `Falle ${field.displayValue || ''}`.trim(),
        icon: getFieldIconSVG(field.type, 22),
        main: field.displayValue || '-3',
        sub: 'Falle'
      };
    }

    if (field.type === 'reward') {
      return {
        title: meta.label,
        icon: getFieldIconSVG(field.type, 22),
        main: field.rewardMode === 'extra_turn' ? 'Bonuszug' : 'Bonus',
        sub: field.displayValue || '+3 M'
      };
    }

    if (field.type === 'portal') {
      return {
        title: 'Portal',
        icon: getFieldIconSVG(field.type, 22),
        main: 'Portal',
        sub: field.displayValue || `↗ ${field.portalPairId}`
      };
    }

    return {
      title: meta.label,
      icon: getFieldIconSVG(field.type, 22),
      main: meta.label,
      sub: field.type === 'helper'
        ? (field.shortLabel || 'Hilfe')
        : field.type === 'nomen'
          ? 'Artikel'
          : field.type === 'verben'
            ? 'Satz'
            : field.type === 'adjektiv'
              ? 'Steig.'
              : ''
    };
  }

  _renderToken(player) {
    const field = this.game.board.getField(player.position);
    const offset = this._getTokenOffset(player);
    const isActive = this.game.getCurrentPlayer().id === player.id;

    return `
      <div
        class="dp-player-token ${isActive ? 'is-active' : ''}"
        id="token-${player.id}"
        style="
          left:${field.x}%;
          top:${field.y}%;
          transform:translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px));
          --player-accent:${player.color};
        "
      >
        <div class="dp-player-token-avatar">${player.getTokenHTML(54)}</div>
        <span class="dp-player-token-number">${player.id + 1}</span>
      </div>
    `;
  }

  _getTokenOffset(player) {
    const playersOnSameField = this.game.getPlayers().filter((entry) => entry.position === player.position);
    const index = playersOnSameField.findIndex((entry) => entry.id === player.id);
    const pattern = [
      { x: -24, y: 16 },
      { x: 24, y: -16 },
      { x: -24, y: -18 },
      { x: 24, y: 18 }
    ];
    return pattern[index] || { x: 0, y: 0 };
  }

  _renderScoreEntry(player, currentPlayer, totalSteps) {
    const currentField = this.game.board.getField(player.position);
    const progressPercent = Math.round((player.position / totalSteps) * 100);

    return `
      <div class="dp-score-entry ${player.id === currentPlayer.id ? 'is-current' : ''}">
        <div class="dp-score-entry-top">
          <span class="dp-player-chip" style="--player-accent:${player.color};">${player.name}</span>
          <span class="dp-score-position">Feld ${player.position}</span>
        </div>
        <div class="dp-score-type">${this._getFieldHeadline(currentField)}</div>
        <div class="dp-score-progress">
          <span class="dp-score-progress-fill" style="width:${progressPercent}%; --player-accent:${player.color};"></span>
        </div>
        <div class="dp-score-meta">
          <span>${iconCoin(14)} ${player.coins}</span>
          <span>${iconStar(14)} ${player.stars}</span>
          ${player.extraTurns > 0 ? `<span class="dp-score-bonus">Bonuszug</span>` : ''}
        </div>
      </div>
    `;
  }

  _renderLegendItem(type) {
    const meta = getFieldMeta(type);
    return `
      <div class="dp-legend-item">
        <span class="dp-legend-icon dp-legend-icon--${type}">${getFieldIconSVG(type, 18)}</span>
        <div class="dp-legend-copy">
          <span class="dp-legend-name">${meta.label}</span>
          <span class="dp-legend-desc">${this._getLegendDescription(type)}</span>
        </div>
      </div>
    `;
  }

  _getLegendDescription(type) {
    switch (type) {
      case 'nomen':
        return 'Artikel + Bedeutung';
      case 'verben':
        return 'Form + Satz';
      case 'adjektiv':
        return 'Steigerung + Wahl';
      case 'helper':
        return 'Tipp oder Schutz';
      case 'movement':
        return '+X oder -X Felder';
      case 'trap':
        return 'Rueckschritt';
      case 'reward':
        return 'Muenzen oder Extra-Zug';
      case 'portal':
        return 'bidirektional';
      default:
        return '';
    }
  }

  _getFieldHeadline(field) {
    if (field.id === 0) {
      return 'Startfeld';
    }

    if (field.id === this.game.board.totalFields - 1) {
      return 'Zielfeld';
    }

    if (field.type === 'movement') {
      return `Bewegung ${field.displayValue || ''}`.trim();
    }

    if (field.type === 'trap') {
      return `Falle ${field.displayValue || ''}`.trim();
    }

    if (field.type === 'reward') {
      return field.rewardMode === 'extra_turn' ? 'Belohnung · Bonuszug' : `Belohnung ${field.displayValue || ''}`.trim();
    }

    if (field.type === 'portal') {
      return `Portal nach Feld ${field.portalPairId}`;
    }

    if (field.portalRole === 'return') {
      return `Portalpartner · zurück zu ${field.portalPairId}`;
    }

    return field.focusTitle || getFieldMeta(field.type).label;
  }

  _getFieldPrompt(field) {
    if (field.id === 0) {
      return 'Startfeld: Würfeln, loslaufen und auf den ersten Lernstein ziehen.';
    }

    if (field.id === this.game.board.totalFields - 1) {
      return 'Zielfeld: Wer hier landet, beendet den Pfad.';
    }

    if (field.type === 'movement') {
      return field.move > 0
        ? `Dieses Bewegungsfeld schickt dich ${field.move} Felder nach vorne.`
        : `Dieses Bewegungsfeld schickt dich ${Math.abs(field.move)} Felder zurück.`;
    }

    if (field.type === 'trap') {
      return `Fallenfeld: ${Math.abs(field.move || 0)} Felder zurück oder Schutz einsetzen.`;
    }

    if (field.type === 'reward') {
      return field.rewardMode === 'extra_turn'
        ? 'Belohnung: Sofort noch einmal würfeln.'
        : 'Belohnung: Münzen sammeln und den Vorsprung ausbauen.';
    }

    if (field.type === 'portal') {
      return `Portal: Von hier geht es direkt zu Feld ${field.portalPairId}.`;
    }

    if (field.portalRole === 'return') {
      return `Portalpartner: Wer von hinten kommt, springt zurück zu Feld ${field.portalPairId}.`;
    }

    return field.focusPrompt || BOARD_THEME.subtitle;
  }

  _getLearningFocusTitle(field) {
    if (field.id === 0) {
      return 'Start';
    }

    if (field.id === this.game.board.totalFields - 1) {
      return 'Ziel';
    }

    if (field.portalRole === 'return') {
      return 'Portalpartner';
    }

    if (field.type === 'reward' && field.rewardMode === 'extra_turn') {
      return 'Bonuszug';
    }

    if (field.type === 'reward') {
      return 'Belohnung';
    }

    if (field.type === 'movement') {
      return 'Bewegung';
    }

    if (field.type === 'trap') {
      return 'Falle';
    }

    if (field.type === 'portal') {
      return 'Portal';
    }

    return field.focusTitle || getFieldMeta(field.type).label;
  }

  _setupBoardActions() {
    document.getElementById('btn-board-menu')?.addEventListener('click', () => {
      this.onMenuRequested?.();
    });
  }

  _renderDiceDots(value) {
    const pattern = Dice.getDotPattern(value);
    return pattern.map((visible) => `<span class="dp-dice-dot ${visible ? 'is-visible' : ''}"></span>`).join('');
  }

  _setupDiceHandler() {
    const diceButton = document.getElementById('dice-roll-button');
    const diceEl = document.getElementById('dice');
    const dicePromptEl = document.getElementById('dice-prompt');
    if (!diceButton || !diceEl) return;

    diceButton.addEventListener('click', async () => {
      if (this.game.state !== 'playing') return;
      if (diceEl.classList.contains('is-rolling')) return;

      diceEl.classList.add('is-rolling');
      if (dicePromptEl) dicePromptEl.textContent = 'Würfelt...';

      const rollingHandler = (event) => {
        diceEl.innerHTML = this._renderDiceDots(event.detail.value);
      };

      window.addEventListener('dice:rolling', rollingHandler);
      const value = await this.game.rollDice();

      if (!value) {
        window.removeEventListener('dice:rolling', rollingHandler);
        diceEl.classList.remove('is-rolling');
        if (dicePromptEl) dicePromptEl.textContent = 'Würfeln';
        return;
      }

      window.removeEventListener('dice:rolling', rollingHandler);
      diceEl.classList.remove('is-rolling');
      diceEl.innerHTML = this._renderDiceDots(value);
      if (dicePromptEl) dicePromptEl.textContent = `Wurf: ${value}`;

      await this._animateMove(value);
    });
  }

  async _animateMove(diceValue) {
    const player = this.game.getCurrentPlayer();
    const oldPos = player.position;
    const newPos = this.game.movePlayer(diceValue);
    const token = document.getElementById(`token-${player.id}`);

    if (token) {
      for (let pos = oldPos + 1; pos <= newPos; pos += 1) {
        const field = this.game.board.getField(pos);
        const offset = this._getTokenOffset(player);
        token.style.left = `${field.x}%`;
        token.style.top = `${field.y}%`;
        token.style.transform = `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`;
        await new Promise((resolve) => setTimeout(resolve, 170));
      }
    }

    const landedField = this.game.board.getField(newPos);
    const result = this.game.resolveField(landedField);

    if (result.action === 'portal') {
      await this._animatePortalMove(player, result.targetId);
    }

    if (result.action === 'minigame') {
      this.onMinigameNeeded?.(result);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 260));
    this.render();
  }

  async _animatePortalMove(player, targetId) {
    const token = document.getElementById(`token-${player.id}`);
    if (!token) return;

    const targetField = this.game.board.getField(targetId);
    const offset = this._getTokenOffset(player);
    token.classList.add('is-teleporting');
    await new Promise((resolve) => setTimeout(resolve, 220));
    token.style.left = `${targetField.x}%`;
    token.style.top = `${targetField.y}%`;
    token.style.transform = `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`;
    await new Promise((resolve) => setTimeout(resolve, 220));
    token.classList.remove('is-teleporting');
  }

  update() {
    this.render();
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'dp-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-hidden');
      setTimeout(() => toast.remove(), 260);
    }, 1800);
  }
}
