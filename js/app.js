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

const Screens = {
  START: 'start',
  SETUP: 'setup',
  BOARD: 'board',
  MINIGAME_MENU: 'minigame-menu',
  MINIGAME: 'minigame',
  RESULTS: 'results'
};

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
    this.screenManager.register(Screens.START, document.getElementById('screen-start'));
    this.screenManager.register(Screens.SETUP, document.getElementById('screen-setup'));
    this.screenManager.register(Screens.BOARD, document.getElementById('screen-board'));
    this.screenManager.register(Screens.MINIGAME_MENU, document.getElementById('screen-minigame-menu'));
    this.screenManager.register(Screens.MINIGAME, document.getElementById('screen-minigame'));
    this.screenManager.register(Screens.RESULTS, document.getElementById('screen-results'));

    this._setupStartScreen();
    this._setupGameEvents();
    this._showStart();
    
    // Expose for debugging and manual minigame triggers
    window.app = this;
    
    this._applyDebugRoute();

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
    document.getElementById('btn-minigames')?.addEventListener('click', () => {
      this._showMinigameMenu();
    });
  }

  _showStart() {
    this._clearResultsTimeout();
    this._refreshStartScreenCta();
    this.screenManager.show(Screens.START);
  }

  _showSetup() {
    this._clearResultsTimeout();
    this.screenManager.show(Screens.SETUP);
    const setupContainer = document.getElementById('setup-content');
    this.setupRenderer = new SetupRenderer(setupContainer, this.settings, (players, settings) => {
      this._startGame(players, settings);
    });
    this.setupRenderer.render();
  }

  _showMinigameMenu() {
    this._clearResultsTimeout();
    this.screenManager.show(Screens.MINIGAME_MENU);
    const menuContainer = document.getElementById('minigame-menu-content');
    this.minigameMenuRenderer = new MinigameMenuRenderer(menuContainer, this.settings.getSnapshot(), {
      onBack: () => this._showStart(),
      onLaunch: (payload) => this._launchStandaloneMinigame(payload)
    });
    this.minigameMenuRenderer.render();
  }

  _startGame(players, settings) {
    this._clearResultsTimeout();
    this.gameController.initGame(players, settings.getSnapshot());
    this.screenManager.show(Screens.BOARD);
    SoundManager.play('launch');

    this._mountGameUi(settings.getSnapshot());
    this.boardRenderer.render();
    this._persistActiveGame();
  }

  _launchMinigame(request, explicitTopic = null) {
    this._clearResultsTimeout();
    this.screenManager.show(Screens.MINIGAME);
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
        onBack: () => this._abortMinigame(resolvedRequest.mode, Screens.BOARD),
        menuLabel: 'Zum Menü',
        onMenu: () => this._abortMinigame(resolvedRequest.mode, Screens.START)
      }
    };

    this.minigameRenderer.launch(resolvedRequest.mode, resolvedRequest.topic, runtimeContext, (result) => {
      this.gameController.onMinigameComplete(result);
      if (this.gameController.state === 'finished') {
        this._showResults();
      } else {
        this.screenManager.show(Screens.BOARD);
        this.boardRenderer.update();
        this._persistActiveGame();
      }
    });
  }

  _launchStandaloneMinigame(payload) {
    this._clearResultsTimeout();
    this.screenManager.show(Screens.MINIGAME);
    SoundManager.play('launch');
    this._ensureMinigameRenderer(this.settings.getSnapshot());
    const runtimeContext = {
      players: Array.isArray(payload.players) ? payload.players : [],
      currentPlayerId: payload.players?.[0]?.id ?? null,
      exitOptions: {
        backLabel: 'Zu Minigames',
        onBack: () => this._showMinigameMenu(),
        menuLabel: 'Zum Start',
        onMenu: () => this._showStart()
      }
    };

    this.minigameRenderer.launchDirect(payload, runtimeContext, () => {
      this._showMinigameMenu();
    });
  }

  _showResults() {
    if (this.screenManager.getCurrent() === Screens.RESULTS) {
      return;
    }

    this._clearResultsTimeout();
    GameSessionStorage.clear();
    this._refreshStartScreenCta();
    this.screenManager.show(Screens.RESULTS);
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
      this._showStart();
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

    const labelEl = continueBtn.querySelector('span');
    const detailEl = continueBtn.querySelector('small');

    if (GameSessionStorage.hasSavedGame()) {
      if (labelEl) labelEl.textContent = 'Partie fortsetzen';
      if (detailEl) detailEl.textContent = 'Gespeicherter Stand';
      continueBtn.title = 'Aktive Partie vom letzten Speicherpunkt weiter spielen';
    } else if (ProfileManager.hasProfiles()) {
      if (labelEl) labelEl.textContent = 'Profil laden';
      if (detailEl) detailEl.textContent = 'Gespeicherte Einstellungen';
      continueBtn.title = 'Gespeicherte Spielprofile laden';
    } else {
      if (labelEl) labelEl.textContent = 'Setup oeffnen';
      if (detailEl) detailEl.textContent = 'Keine gespeicherte Partie';
      continueBtn.title = 'Direkt mit dem Setup weitergehen';
    }
  }

  _applyDebugRoute() {
    const params = new URLSearchParams(window.location.search);
    const requestedScreen = params.get('screen') || params.get('debugScreen');
    const debugBoard = params.get('debugBoard') || (requestedScreen === Screens.BOARD ? '1' : '');
    const miniGameId = params.get('debugMinigame');

    if (requestedScreen === Screens.SETUP || params.has('debugSetup')) {
      window.setTimeout(() => {
        this.settings.reset();
        this._showSetup();
      }, 0);
      return;
    }

    if (debugBoard) {
      const playerCount = Math.max(2, Math.min(4, Number(params.get('debugPlayers') || 2)));
      const activePlayerIndex = Math.max(0, Math.min(playerCount - 1, Number(params.get('debugCurrent') || 0)));
      const round = Math.max(1, Number(params.get('debugRound') || 1));
      const positions = String(params.get('debugPositions') || '0,5')
        .split(',')
        .map((value) => Math.max(0, Math.min(35, Number(value.trim()) || 0)));

      window.setTimeout(() => {
        this.settings.reset();
        this._startGame(
          Array.from({ length: playerCount }, (_, index) => ({
            name: `Spieler ${index + 1}`,
            colorIndex: index
          })),
          this.settings
        );

        this.gameController.getPlayers().forEach((player, index) => {
          player.moveTo(positions[index] ?? 0);
        });
        this.gameController.turnManager.currentPlayerIndex = activePlayerIndex;
        this.gameController.turnManager.round = round;
        this.boardRenderer?.render();
        this._persistActiveGame();
      }, 0);

      return;
    }

    if (!miniGameId) {
      return;
    }

    const playMode = params.get('debugMode') || 'solo_arcade';
    const topic = params.get('debugTopic') || 'satzbau';
    const timeLimitSec = Number(params.get('debugTimeLimit') || 8);
    const rounds = Number(params.get('debugRounds') || 1);

    window.setTimeout(() => {
      this._launchStandaloneMinigame({
        miniGameId,
        playMode,
        topic,
        timeLimitSec,
        rounds
      });
    }, 0);
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
      this._showStart();
    };
  }

  _abortMinigame(mode, destination = Screens.BOARD) {
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

    if (destination === Screens.START) {
      this._showStart();
      return;
    }

    this.screenManager.show(Screens.BOARD);
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
      this.screenManager.show(Screens.BOARD);
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
