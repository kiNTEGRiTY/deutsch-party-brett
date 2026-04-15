/**
 * Render Board - Board game screen with illustrated character tokens
 */

import { getFieldMeta, getFieldIconSVG } from '../engine/field-types.js';
import { Dice } from '../engine/dice.js';
import { renderCharacterToken, renderCharacterAvatar } from '../ui/characters.js';
import { iconCoin, iconStar } from '../ui/icons.js';

export class BoardRenderer {
  constructor(containerEl, gameController) {
    this.container = containerEl;
    this.game = gameController;
    this.onMinigameNeeded = null;
  }

  render() {
    const players = this.game.getPlayers();
    const board = this.game.board;
    const currentPlayer = this.game.getCurrentPlayer();

    this.container.innerHTML = `
      <div class="board-area">
        <!-- SVG Path completely removed to showcase the pure hand-drawn artwork -->

        <div class="turn-bar cardboard-chip cardboard-purple" id="turn-bar">
          <div class="washi-tape pink rotated-left" style="top: -10px; left: -20px;"></div>
          <div class="turn-player-info">
            ${renderCharacterToken(players.indexOf(currentPlayer), 44)}
            <span style="font-size: 1.4rem;">${currentPlayer.name} ist dran!</span>
          </div>
          <div class="turn-round">Runde ${this.game.turnManager.getRound()}</div>
        </div>

        <div class="board-path-container" id="game-board">
          ${board.getAllFields().map(field => this._renderField(field)).join('')}
          ${players.map(p => this._renderToken(p)).join('')}
        </div>

        <div class="dice-area" id="dice-area">
          <div class="dice-prompt" id="dice-prompt">Wurf! 🎲</div>
          <div class="dice-container" id="dice-container">
            <div class="dice cardboard-chip cardboard-yellow" id="dice">
              ${this._renderDiceDots(1)}
            </div>
            <div class="washi-tape yellow rotated-right" style="bottom: -10px; right: -20px;"></div>
          </div>
        </div>
      </div>

      <div class="board-sidebar">
        <div class="sidebar-section cardboard-deep">
          <div class="pin" style="top: 10px; left: 50%; transform: translateX(-50%);"></div>
          <div class="sidebar-title">Punktestand</div>
          <div class="scoreboard" id="scoreboard">
            ${players.map(p => this._renderScoreEntry(p, currentPlayer)).join('')}
          </div>
        </div>

        <div class="sidebar-section cardboard-deep">
          <div class="washi-tape pink" style="top: -12px; left: 50%; transform: translateX(-50%);"></div>
          <div class="sidebar-title">Legende</div>
          <div class="field-legend">
            ${this._renderLegend()}
          </div>
        </div>
      </div>
    `;

    this._setupDiceHandler();
    this._setupEditMode();
  }

  _setupEditMode() {
    // Add hotkey (Shift + E) to toggle Map Editor
    if (!window.__boardEditModeInit) {
      window.__boardEditModeInit = true;
      window.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key.toLowerCase() === 'e') {
          const boardArea = document.querySelector('.board-area');
          if (boardArea) {
            boardArea.classList.toggle('edit-mode');
            this.showToast(boardArea.classList.contains('edit-mode') ? 'Map Editor EIN (Klicke zum Pfad setzen)' : 'Map Editor AUS', 'warning');
          }
        }
      });
      
      // Capture clicks on the board explicitly when in edit mode
      window.addEventListener('click', (e) => {
        const boardArea = document.querySelector('.board-area.edit-mode');
        if (!boardArea) return;
        
        // Ignore clicks on UI elements like dice or sidebar
        if (e.target.closest('.turn-bar') || e.target.closest('.dice-area') || e.target.closest('.board-sidebar') || e.target.closest('.field-tile')) {
           return;
        }

        const rect = boardArea.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        
        console.log(`{ id: NEXT_ID, type: FieldType.NORMAL, x: ${x.toFixed(2)}, y: ${y.toFixed(2)} },`);
        
        // Visual feedback marker
        const marker = document.createElement('div');
        marker.style.cssText = `position: absolute; left: ${x}%; top: ${y}%; width: 20px; height: 20px; background: red; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 100; border: 2px solid white;`;
        boardArea.appendChild(marker);
        
        this.showToast(`Koordinate ${Math.round(x)}%, ${Math.round(y)}% geloggt in Console.`, 'info');
      });
    }
  }

  _generatePathData(board) {
    const fields = board.getAllFields();
    if (fields.length < 2) return '';
    
    let d = `M ${fields[0].x} ${fields[0].y}`;
    
    for (let i = 0; i < fields.length - 1; i++) {
      const p1 = fields[i];
      const p2 = fields[i+1];
      
      // Calculate a control point for a smooth S-curve or gentle arc
      // We'll use the midpoint with a slight perpendicular offset or just a simple corner-rounder
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      
      // For a 'Wanderpfad' look, we can use the previous node coordinates to influence the curve
      // but a standard midpoint bezier is already much better than straight lines.
      // Derviving Q control point: we use p1.x, p2.y or p2.x, p1.y for a playful 'staircase' curve
      const cpX = (i % 2 === 0) ? p2.x : p1.x;
      const cpY = (i % 2 === 0) ? p1.y : p2.y;
      
      d += ` Q ${cpX} ${cpY} ${p2.x} ${p2.y}`;
    }
    
    return d;
  }

  _renderLegend() {
    const types = ['normal', 'challenge', 'team', 'reward', 'surprise', 'helper', 'movement', 'treasure', 'trap', 'portal'];
    const labels = ['Aufgabe', 'Alle spielen', 'Teamarbeit', 'Belohnung', 'Überraschung', 'Hilfe', 'Bewegung', 'Schatz', 'Falle', 'Portal'];
    return types.map((type, i) => `
      <div class="legend-item">${getFieldIconSVG(type, 18)}<span>${labels[i]}</span></div>
    `).join('');
  }

  _renderField(field) {
    const meta = getFieldMeta(field.type);
    const rotation = (field.id % 2 === 0 ? 3 : -3) + (Math.sin(field.id) * 8);
    
    // Organic "Hand-Cut" Paper Shapes (Border-Radius Blobs)
    const organicBlobs = [
      '30% 70% 70% 30% / 30% 30% 70% 70%',
      '60% 40% 30% 70% / 60% 30% 70% 40%',
      '40% 60% 70% 30% / 40% 50% 60% 50%',
      '50% 50% 40% 60% / 50% 60% 40% 50%',
      '70% 30% 50% 50% / 40% 70% 30% 60%'
    ];
    
    const blobRadius = organicBlobs[field.id % organicBlobs.length];
    
    // Get color from field type
    const fieldColor = `var(--field-${field.type}, var(--field-normal))`;
    const fieldColorLight = `var(--field-${field.type}-light, var(--field-normal-light))`;

    return `
      <div class="field-tile cardboard-field" 
           data-field-id="${field.id}"
           style="left: ${field.x}%; top: ${field.y}%; 
                  transform: translate(-50%, -50%) rotate(${rotation}deg);
                  background-color: ${fieldColor};
                  border-radius: ${blobRadius};
                  box-shadow: 
                    2px 2px 0 rgba(0,0,0,0.1),
                    inset 1px 1px 2px rgba(255,255,255,0.3),
                    inset -1px -1px 2px rgba(0,0,0,0.2),
                    0 6px 15px rgba(0,0,0,0.25);">
        
        <!-- Subtle Cardboard Noise Overlay -->
        <div style="position: absolute; inset: 0; opacity: 0.15; pointer-events: none; border-radius: inherit;
                    background-image: url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\"/%3E%3C/svg%3E');"></div>
        
        <!-- Hand-drawn border effect -->
        <div style="position: absolute; inset: 4px; border: 2px dashed rgba(0,0,0,0.15); border-radius: inherit; pointer-events: none;"></div>

        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2; position: relative;">
          <span class="field-icon" style="transform: scale(1.1); margin-bottom: 2px;">${getFieldIconSVG(field.type, 32)}</span>
          <span class="field-number" style="font-size: 1rem; font-family: var(--font-family-display); color: rgba(0,0,0,0.6);">${field.id}</span>
        </div>
        ${field.type === 'portal' ? '<div class="portal-vortex"></div>' : ''}
      </div>
    `;
  }

  _renderToken(player) {
    const field = this.game.board.getField(player.position);
    const players = this.game.getPlayers();
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    // Fix: Remove massive 120px offsets so tokens stand directly ON the field target!
    // Offset slightly just to stagger players on the same field
    const offset = (playerIndex - (players.length - 1) / 2) * 15;
    
    const isActive = this.game.getCurrentPlayer().id === player.id;
    
    return `
      <div class="player-standee-container ${isActive ? 'active' : ''}" 
           id="token-${player.id}"
           style="left:${field.x}%; top:${field.y}%; transform: translate(calc(-50% + ${offset}px), -85%);">
        <div class="standee-card">
           ${renderCharacterAvatar(playerIndex, 450)}
        </div>
        <div class="standee-base"></div>
        <div class="standee-shadow"></div>
      </div>
    `;
  }

  _renderScoreEntry(player, currentPlayer) {
    const colors = ['cardboard-pink', 'cardboard-yellow', 'cardboard-blue', 'cardboard-green', 'cardboard-orange', 'cardboard-purple'];
    const randomColor = colors[player.id % colors.length];
    
    return `
      <div class="scoreboard-entry cardboard-chip ${randomColor} ${player.id === currentPlayer.id ? 'active-player' : ''}" style="margin-bottom: 8px;">
        ${player.getTokenHTML(32)}
        <span class="scoreboard-name" style="font-weight: bold;">${player.name}</span>
        <div class="scoreboard-stats">
          <span class="stat-icon">${iconCoin(16)} ${player.coins}</span>
          <span class="stat-icon">${iconStar(16)} ${player.stars}</span>
        </div>
      </div>
    `;
  }

  _renderDiceDots(value) {
    const pattern = Dice.getDotPattern(value);
    return pattern.map(visible => 
      `<div class="dice-dot ${visible ? 'visible' : ''}"></div>`
    ).join('');
  }

  _setupDiceHandler() {
    const diceContainer = document.getElementById('dice-container');
    const diceEl = document.getElementById('dice');
    if (!diceContainer || !diceEl) return;

    diceContainer.addEventListener('click', async () => {
      if (this.game.state !== 'playing') return;
      if (diceEl.classList.contains('rolling')) return;

      diceEl.classList.add('rolling');
      document.getElementById('dice-prompt').textContent = 'Würfelt...';

      const rollingHandler = (e) => {
        diceEl.innerHTML = this._renderDiceDots(e.detail.value);
      };
      window.addEventListener('dice:rolling', rollingHandler);

      const value = await this.game.rollDice();
      
      window.removeEventListener('dice:rolling', rollingHandler);
      diceEl.classList.remove('rolling');
      diceEl.innerHTML = this._renderDiceDots(value);
      document.getElementById('dice-prompt').textContent = `${value} gewürfelt!`;

      await this._animateMove(value);
    });
  }

  async _animateMove(diceValue) {
    const player = this.game.getCurrentPlayer();
    const oldPos = player.position;
    const newPos = this.game.movePlayer(diceValue);
    
    const token = document.getElementById(`token-${player.id}`);
    if (token) {
      for (let pos = oldPos + 1; pos <= newPos; pos++) {
        const field = this.game.board.getField(pos);
        const players = this.game.getPlayers();
        const playerIndexLocal = players.findIndex(p => p.id === player.id);
        const offset = (playerIndexLocal - (players.length - 1) / 2) * 15;
        token.style.transition = 'left 0.3s var(--ease-bounce), top 0.3s var(--ease-bounce)';
        token.style.left = `${field.x}%`;
        token.style.top = `${field.y}%`;
        token.style.transform = `translate(calc(-50% + ${offset}px), -85%)`;
        token.style.animation = 'token-hop 0.3s var(--ease-bounce)';
        await new Promise(r => setTimeout(r, 350));
        token.style.animation = '';
      }
    }

    const landedField = this.game.board.getField(newPos);
    const fieldEl = this.container.querySelector(`[data-field-id="${landedField.id}"]`);
    if (fieldEl) fieldEl.classList.add('current-field');

    await new Promise(r => setTimeout(r, 500));
    
    // Resolve field effects
    const result = this.game.resolveField(landedField);
    
    // Handle special visual triggers
    if (result.action === 'portal') {
      const boardContainer = document.getElementById('game-board');
      boardContainer.classList.add('teleport-flash');
      token.style.opacity = '0';
      await new Promise(r => setTimeout(r, 300));
      
      const targetField = this.game.board.getField(result.targetId);
      token.style.left = `${targetField.x}%`;
      token.style.top = `${targetField.y}%`;
      await new Promise(r => setTimeout(r, 300));
      token.style.opacity = '1';
      boardContainer.classList.remove('teleport-flash');
      
      this.showToast(`Teleportation! 🌀`, 'info');
    } else if (result.action === 'trap') {
      const boardContainer = document.getElementById('game-board');
      boardContainer.classList.add('trap-shake');
      this.showToast(`AUA! Falle! 🪤`, 'warning');
      await new Promise(r => setTimeout(r, 500));
      boardContainer.classList.remove('trap-shake');
      
      // Animate move back if penalty move exists
      if (result.move) {
        await this._animateMoveDirectly(player, landedField.id, player.position);
      }
    }

    if (result.action === 'minigame') {
      if (this.onMinigameNeeded) this.onMinigameNeeded(result);
    } else {
      await new Promise(r => setTimeout(r, 1000));
      this.render();
    }
  }

  async _animateMoveDirectly(player, fromIdx, toIdx) {
    const token = document.getElementById(`token-${player.id}`);
    if (!token) return;
    
    const startField = this.game.board.getField(fromIdx);
    const endField = this.game.board.getField(toIdx);
    
    token.style.transition = 'left 0.8s ease-in-out, top 0.8s ease-in-out';
    token.style.left = `${endField.x}%`;
    token.style.top = `${endField.y}%`;
    await new Promise(r => setTimeout(r, 850));
  }

  update() { this.render(); }

  showToast(message, type = 'info') {
    const colors = ['cardboard-pink', 'cardboard-yellow', 'cardboard-blue', 'cardboard-green', 'cardboard-orange', 'cardboard-purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const toast = document.createElement('div');
    toast.className = `toast cardboard-chip ${randomColor} visible`;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '1000';
    toast.style.padding = '15px 30px';
    toast.style.fontSize = '1.2rem';
    toast.style.fontWeight = 'bold';
    toast.style.boxShadow = 'var(--shadow-xl)';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      toast.style.transition = 'all 0.5s ease-in';
      setTimeout(() => toast.remove(), 500);
    }, 2500);
  }
}
