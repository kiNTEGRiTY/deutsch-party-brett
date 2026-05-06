/**
 * App.js - Main application entry point
 * Uses hand-drawn illustrated animal characters
 */

import { ScreenManager } from './ui/screen-manager.js';
import { GameController } from './engine/game-controller.js';
import { SettingsManager } from './settings/settings-manager.js';
import { GameSessionStorage } from './settings/game-session.js';
import { ProfileManager } from './settings/profiles.js';
import { SetupRenderer } from './ui/render-setup.js';
import { BoardRenderer } from './ui/render-board.js';
import { MinigameRenderer } from './ui/render-minigame.js';
import { MinigameMenuRenderer } from './ui/render-minigame-menu.js';
import { SoundManager } from './ui/sound-manager.js';
import { 
  iconDice, iconHome, iconCoin, iconStar,
  iconGold, iconSilver, iconBronze
} from './ui/icons.js';

class App {
  constructor() {
    this.screenManager = new ScreenManager();
    this.gameController = new GameController();
    this.settings = new SettingsManager();
    this.setupRenderer = null;
    this.boardRenderer = null;
    this.minigameRenderer = null;
    this.minigameMenuRenderer = null;
    this.resultsTimeoutId = null;
  }

  init() {
    SoundManager.installGestureUnlock();
    this.screenManager.register('start', document.getElementById('screen-start'));
    this.screenManager.register('setup', document.getElementById('screen-setup'));
    this.screenManager.register('board', document.getElementById('screen-board'));
    this.screenManager.register('minigame-menu', document.getElementById('screen-minigame-menu'));
    this.screenManager.register('minigame', document.getElementById('screen-minigame'));
    this.screenManager.register('results', document.getElementById('screen-results'));

    this._mountAmbientDecor();
    this.screenManager.show('start');
    this._setupStartScreen();
    this._setupGameEvents();
    
    // Expose for debugging and manual minigame triggers
    window.app = this;
    
    console.log('Deutsch Party Brett - initialized!');
  }

  _setupStartScreen() {
    this._refreshStartScreenCta();

    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      GameSessionStorage.clear();
      this._refreshStartScreenCta();
      this.settings.reset();
      this._showSetup();
    });
    document.getElementById('btn-continue')?.addEventListener('click', () => {
      if (GameSessionStorage.hasSavedGame()) {
        const restored = this._restoreSavedGame();
        if (restored) {
          return;
        }
      }

      if (ProfileManager.hasProfiles()) {
        this._showProfilePicker();
        return;
      }

      this.settings.reset();
      this._showSetup();
    });
    document.getElementById('btn-profiles')?.addEventListener('click', () => {
      this._showProfilePicker();
    });
    document.getElementById('btn-minigames')?.addEventListener('click', () => {
      this._showMinigameMenu();
    });
  }

  _showSetup() {
    this._clearResultsTimeout();
    this.screenManager.show('setup');
    const setupContainer = document.getElementById('setup-content');
    this.setupRenderer = new SetupRenderer(setupContainer, this.settings, (players, settings) => {
      this._startGame(players, settings);
    });
    this.setupRenderer.render();
  }

  _showMinigameMenu() {
    this._clearResultsTimeout();
    this.screenManager.show('minigame-menu');
    const menuContainer = document.getElementById('minigame-menu-content');
    this.minigameMenuRenderer = new MinigameMenuRenderer(menuContainer, this.settings.getSnapshot(), {
      onBack: () => this.screenManager.show('start'),
      onLaunch: (payload) => this._launchStandaloneMinigame(payload)
    });
    this.minigameMenuRenderer.render();
  }

  _startGame(players, settings) {
    this._clearResultsTimeout();
    this.gameController.initGame(players, settings.getSnapshot());
    this.screenManager.show('board');
    SoundManager.play('launch');

    this._mountGameUi(settings.getSnapshot());
    this.boardRenderer.render();
    this._persistActiveGame();
  }

  _launchMinigame(request, explicitTopic = null) {
    this._clearResultsTimeout();
    this.screenManager.show('minigame');
    SoundManager.play('launch');
    const resolvedRequest = typeof request === 'object' && request !== null
      ? request
      : { mode: request, topic: explicitTopic };
    const settingsSnapshot = this.settings.getSnapshot();
    const minigameSettings = resolvedRequest.difficulty
      ? { ...settingsSnapshot, difficulty: { ...resolvedRequest.difficulty } }
      : settingsSnapshot;

    this._ensureMinigameRenderer(minigameSettings);
    const runtimeContext = {
      players: this.gameController.getPlayers().map((player) => ({
        id: player.id,
        name: player.name,
        colorIndex: player.colorIndex,
        avatarId: player.avatarId
      })),
      currentPlayerId: this.gameController.getCurrentPlayer()?.id ?? null,
      exitOptions: {
        backLabel: 'Zum Brett',
        onBack: () => this._abortMinigame(resolvedRequest.mode, 'board'),
        menuLabel: 'Zum Menü',
        onMenu: () => this._abortMinigame(resolvedRequest.mode, 'start')
      }
    };

    this.minigameRenderer.launch(resolvedRequest.mode, resolvedRequest.topic, runtimeContext, (result) => {
      this.gameController.onMinigameComplete(result);
      if (this.gameController.state === 'finished') {
        this._showResults();
      } else {
        this.screenManager.show('board');
        this.boardRenderer.update();
        this._persistActiveGame();
      }
    });
  }

  _launchStandaloneMinigame(payload) {
    this._clearResultsTimeout();
    this.screenManager.show('minigame');
    SoundManager.play('launch');
    this._ensureMinigameRenderer(this.settings.getSnapshot());
    const runtimeContext = {
      players: Array.isArray(payload.players) ? payload.players : [],
      currentPlayerId: payload.players?.[0]?.id ?? null,
      exitOptions: {
        backLabel: 'Zu Minigames',
        onBack: () => this._showMinigameMenu(),
        menuLabel: 'Zum Start',
        onMenu: () => this.screenManager.show('start')
      }
    };

    this.minigameRenderer.launchDirect(payload, runtimeContext, () => {
      this._showMinigameMenu();
    });
  }

  _showResults() {
    if (this.screenManager.getCurrent() === 'results') {
      return;
    }

    this._clearResultsTimeout();
    GameSessionStorage.clear();
    this._refreshStartScreenCta();
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
      <div class="results-container premium-menu-shell">
        <div class="results-header animate-bounce-in">
          <div class="premium-kicker">${iconStar(16)} Finale</div>
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

    SoundManager.play('finish');
    this._spawnConfetti();
    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.settings.reset();
      this._showSetup();
    });
    document.getElementById('btn-to-start')?.addEventListener('click', () => {
      this._refreshStartScreenCta();
      this.screenManager.show('start');
    });
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

  _refreshStartScreenCta() {
    const continueBtn = document.getElementById('btn-continue');
    if (!continueBtn) {
      return;
    }

    continueBtn.textContent = 'Fortsetzen';

    if (GameSessionStorage.hasSavedGame()) {
      continueBtn.title = 'Aktive Partie vom letzten Speicherpunkt weiter spielen';
    } else if (ProfileManager.hasProfiles()) {
      continueBtn.title = 'Gespeicherte Spielprofile laden';
    } else {
      continueBtn.title = 'Gespeichertes Spiel öffnen oder direkt mit dem Setup weitergehen';
    }
  }

  _setupGameEvents() {
    window.addEventListener('game:reward', (e) => {
      const { reward } = e.detail;
      if (reward?.description) this.boardRenderer?.showToast(reward.description, 'success');
      SoundManager.play('reward');
    });
    window.addEventListener('game:gameEnd', () => {
      GameSessionStorage.clear();
      this._refreshStartScreenCta();
      this._clearResultsTimeout();
      this.resultsTimeoutId = window.setTimeout(() => this._showResults(), 1000);
    });
    window.addEventListener('game:turnChange', () => {
      this._persistActiveGame();
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

  _mountGameUi(settingsSnapshot) {
    const boardContainer = document.getElementById('board-content');
    this.boardRenderer = new BoardRenderer(boardContainer, this.gameController);
    this._ensureMinigameRenderer(settingsSnapshot);

    this.boardRenderer.onMinigameNeeded = (result) => this._launchMinigame(result);
    this.boardRenderer.onMenuRequested = () => {
      this._persistActiveGame();
      this._refreshStartScreenCta();
      this.screenManager.show('start');
    };
  }

  _abortMinigame(mode, destination = 'board') {
    this.gameController.onMinigameComplete({
      correct: false,
      partial: false,
      score: 0,
      aborted: true,
      mode
    });

    if (this.gameController.state === 'finished') {
      this._showResults();
      return;
    }

    this._persistActiveGame();
    this._refreshStartScreenCta();

    if (destination === 'start') {
      this.screenManager.show('start');
      return;
    }

    this.screenManager.show('board');
    this.boardRenderer?.update();
  }

  _ensureMinigameRenderer(settingsSnapshot) {
    const minigameContainer = document.getElementById('minigame-content');
    this.minigameRenderer = new MinigameRenderer(minigameContainer, settingsSnapshot);
  }

  _restoreSavedGame() {
    const snapshot = GameSessionStorage.load();
    if (!snapshot) {
      this._refreshStartScreenCta();
      return false;
    }

    try {
      this.settings.reset();
      this.settings.loadSnapshot(snapshot.settings);
      const normalizedSettings = this.settings.getSnapshot();
      const restored = this.gameController.restoreGame({
        ...snapshot,
        settings: normalizedSettings
      });
      if (!restored) {
        GameSessionStorage.clear();
        this._refreshStartScreenCta();
        return false;
      }

      this._clearResultsTimeout();
      this.screenManager.show('board');
      this._mountGameUi(normalizedSettings);
      this.boardRenderer.render();
      this.boardRenderer.showToast('Spielstand geladen', 'success');
      SoundManager.play('success');
      this._persistActiveGame();
      return true;
    } catch (error) {
      console.error('Saved game restore failed:', error);
      GameSessionStorage.clear();
      this._refreshStartScreenCta();
      return false;
    }
  }

  _persistActiveGame() {
    if (!this.gameController.canResume()) {
      return false;
    }

    const snapshot = this.gameController.getSnapshot();
    const saved = GameSessionStorage.save(snapshot);
    if (saved) {
      this._refreshStartScreenCta();
    }
    return saved;
  }

  _clearResultsTimeout() {
    if (!this.resultsTimeoutId) {
      return;
    }

    window.clearTimeout(this.resultsTimeoutId);
    this.resultsTimeoutId = null;
  }

  _mountAmbientDecor() {
    if (document.querySelector('.floating-shapes')) {
      return;
    }

    const layer = document.createElement('div');
    layer.className = 'floating-shapes';
    const colors = [
      'linear-gradient(135deg, rgba(255,79,124,0.22), rgba(255,138,91,0.12))',
      'linear-gradient(135deg, rgba(82,183,255,0.2), rgba(82,183,255,0.06))',
      'linear-gradient(135deg, rgba(255,212,90,0.24), rgba(255,212,90,0.08))',
      'linear-gradient(135deg, rgba(138,107,255,0.18), rgba(138,107,255,0.08))',
      'linear-gradient(135deg, rgba(68,212,167,0.18), rgba(68,212,167,0.08))'
    ];

    for (let i = 0; i < 14; i += 1) {
      const orb = document.createElement('div');
      orb.className = 'floating-shape';
      orb.style.width = `${80 + Math.random() * 180}px`;
      orb.style.height = orb.style.width;
      orb.style.left = `${Math.random() * 100}%`;
      orb.style.top = `${Math.random() * 100}%`;
      orb.style.background = colors[i % colors.length];
      orb.style.animationDelay = `${Math.random() * 6}s`;
      orb.style.animationDuration = `${10 + Math.random() * 8}s`;
      layer.appendChild(orb);
    }

    document.body.prepend(layer);
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
