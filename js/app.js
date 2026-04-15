/**
 * App.js - Main application entry point
 * Uses hand-drawn illustrated animal characters
 */

import { ScreenManager } from './ui/screen-manager.js';
import { GameController } from './engine/game-controller.js';
import { SettingsManager } from './settings/settings-manager.js';
import { ProfileManager } from './settings/profiles.js';
import { SetupRenderer } from './ui/render-setup.js';
import { BoardRenderer } from './ui/render-board.js';
import { MinigameRenderer } from './ui/render-minigame.js';
import { renderCharacterAvatar } from './ui/characters.js';
import { 
  iconDice, iconHome, iconCoin, iconStar,
  iconGold, iconSilver, iconBronze, iconCheck
} from './ui/icons.js';

class App {
  constructor() {
    this.screenManager = new ScreenManager();
    this.gameController = new GameController();
    this.settings = new SettingsManager();
    this.setupRenderer = null;
    this.boardRenderer = null;
    this.minigameRenderer = null;
  }

  init() {
    this.screenManager.register('start', document.getElementById('screen-start'));
    this.screenManager.register('setup', document.getElementById('screen-setup'));
    this.screenManager.register('board', document.getElementById('screen-board'));
    this.screenManager.register('minigame', document.getElementById('screen-minigame'));
    this.screenManager.register('results', document.getElementById('screen-results'));

    this.screenManager.show('start');
    this._setupStartScreen();
    this._setupGameEvents();
    
    // Expose for debugging and manual minigame triggers
    window.app = this;
    
    console.log('Deutsch Party Brett - initialized!');
  }

  _setupStartScreen() {
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      this.settings.reset();
      this._showSetup();
    });
    document.getElementById('btn-continue')?.addEventListener('click', () => {
      this.settings.reset();
      this._showSetup();
    });
    document.getElementById('btn-profiles')?.addEventListener('click', () => {
      this._showProfilePicker();
    });
  }

  _showSetup() {
    this.screenManager.show('setup');
    const setupContainer = document.getElementById('setup-content');
    this.setupRenderer = new SetupRenderer(setupContainer, this.settings, (players, settings) => {
      this._startGame(players, settings);
    });
    this.setupRenderer.render();
  }

  _startGame(players, settings) {
    this.gameController.initGame(players, settings.getSnapshot());
    this.screenManager.show('board');
    
    const boardContainer = document.getElementById('board-content');
    this.boardRenderer = new BoardRenderer(boardContainer, this.gameController);
    
    const minigameContainer = document.getElementById('minigame-content');
    this.minigameRenderer = new MinigameRenderer(minigameContainer, settings);
    
    this.boardRenderer.onMinigameNeeded = (result) => this._launchMinigame(result.mode);
    this.boardRenderer.render();
  }

  _launchMinigame(mode) {
    this.screenManager.show('minigame');
    this.minigameRenderer.launch(mode, (result) => {
      this.gameController.onMinigameComplete(result);
      if (this.gameController.state === 'finished') {
        this._showResults();
      } else {
        this.screenManager.show('board');
        this.boardRenderer.update();
      }
    });
  }

  _showResults() {
    this.screenManager.show('results');
    const resultsContainer = document.getElementById('results-content');
    
    const players = this.gameController.getPlayers();
    const rankings = [...players].sort((a, b) => b.getTotalPoints() - a.getTotalPoints());
    const medalIcons = [iconGold(40), iconSilver(40), iconBronze(40)];
    
    const podiumHTML = rankings.slice(0, 3).map((player, i) => `
      <div class="podium-place animate-slide-up stagger-${i + 1}">
        <div class="podium-token">
          ${player.getAvatarHTML(80)}
        </div>
        <div class="podium-name">${player.name}</div>
        <div style="display:flex; gap: var(--space-xs); align-items:center;">
          <span class="stat-icon">${iconCoin(14)} ${player.coins}</span>
          <span class="stat-icon">${iconStar(14)} ${player.stars}</span>
        </div>
        <div class="podium-stand">${medalIcons[i]}</div>
      </div>
    `).join('');
    
    const statsHTML = rankings.map(player => `
      <div class="stats-row">
        ${player.getTokenHTML(28)}
        <span class="scoreboard-name">${player.name}</span>
        <span class="stat-cell">${iconCoin(14)} ${player.coins}</span>
        <span class="stat-cell">${iconStar(14)} ${player.stars}</span>
        <span class="stat-cell">${player.stats.tasksAttempted}</span>
        <span class="stat-cell">${player.getAccuracy()}%</span>
      </div>
    `).join('');

    resultsContainer.innerHTML = `
      <div class="results-container">
        <div class="results-header animate-bounce-in">
          <h2>Spiel beendet!</h2>
          <p class="results-subtitle">Herzlichen Glückwunsch an alle!</p>
        </div>
        <div class="podium">${podiumHTML}</div>
        <div class="stats-table">
          <div class="stats-row stats-header">
            <span></span><span>Spieler</span>
            <span class="stat-cell">Münzen</span><span class="stat-cell">Sterne</span>
            <span class="stat-cell">Aufgaben</span><span class="stat-cell">Genauigkeit</span>
          </div>
          ${statsHTML}
        </div>
        <div class="results-actions">
          <button class="btn btn-primary btn-lg" id="btn-play-again">${iconDice(20)} Nochmal spielen</button>
          <button class="btn btn-secondary" id="btn-to-start">${iconHome(18)} Zum Start</button>
        </div>
      </div>
    `;

    this._spawnConfetti();
    document.getElementById('btn-play-again')?.addEventListener('click', () => this._showSetup());
    document.getElementById('btn-to-start')?.addEventListener('click', () => this.screenManager.show('start'));
  }

  _showProfilePicker() {
    const profiles = ProfileManager.getAll();
    if (profiles.length === 0) {
      alert('Noch keine Profile gespeichert!');
      return;
    }
    const choice = profiles.map(p => p.name).join('\n');
    const selected = prompt(`Profil wählen:\n${choice}`);
    if (selected) {
      const profile = ProfileManager.load(selected);
      if (profile) { this.settings.loadSnapshot(profile.settings); this._showSetup(); }
    }
  }

  _setupGameEvents() {
    window.addEventListener('game:reward', (e) => {
      const { reward } = e.detail;
      if (reward?.description) this.boardRenderer?.showToast(reward.description, 'success');
    });
    window.addEventListener('game:gameEnd', () => {
      setTimeout(() => this._showResults(), 1000);
    });
  }

  _spawnConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#FF8A5C', '#A3DE83', '#FF69B4', '#00CED1'];
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
      piece.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(piece);
    }
    setTimeout(() => container.remove(), 5000);
  }
}

const initApp = () => {
  const app = new App();
  app.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
