/**
 * Render Mini-Game - Wrapper for mini-game display and result handling
 * No emojis - all illustrated SVG icons
 */

import { getMinigame } from '../minigames/minigame-registry.js?v=labyrinth-timer-38';
import { buildTaskPartyConfig, getModeLabel, getScoringLabel } from '../minigames/core/party-game-core.js';
import { createDirectTask, generateTask } from '../learning/task-generator.js?v=labyrinth-timer-38';
import { BOARD_THEME } from '../engine/board-layouts.js?v=labyrinth-timer-38';
import { SoundManager } from './sound-manager.js?v=labyrinth-timer-38';
import { CHARACTERS, renderCharacterAvatar } from './characters.js?v=labyrinth-timer-38';
import { iconTask, iconChallenge, iconTeam, iconCoin, iconCheck, iconTimer, iconParty, iconBack, iconHome } from '../ui/icons.js';

export class MinigameRenderer {
  constructor(containerEl, settings) {
    this.container = containerEl;
    this.settings = settings;
    this.onComplete = null;
    this.timerInterval = null;
    this.timerRunId = 0;
    this.activeCleanup = null;
    this.activeGameId = null;
  }

  launch(mode, explicitTopic = null, runtimeContext = {}, onComplete) {
    if (typeof runtimeContext === 'function') {
      onComplete = runtimeContext;
      runtimeContext = {};
    }

    this.onComplete = onComplete;
    
    const task = generateTask(
      this.settings.activeTopics,
      this.settings.difficulty,
      mode,
      explicitTopic
    );
    this._launchTask(task, mode, runtimeContext, onComplete);
  }

  launchDirect(options = {}, runtimeContext = {}, onComplete) {
    if (typeof runtimeContext === 'function') {
      onComplete = runtimeContext;
      runtimeContext = {};
    }

    const minigame = getMinigame(options.miniGameId);
    const directDefaults = minigame?.directPlayDefaults?.[options.playMode || 'solo_arcade'] || {};

    const task = createDirectTask({
      miniGameId: options.miniGameId,
      topic: options.topic,
      difficulty: options.difficulty || this.settings.difficulty,
      mode: options.playMode || 'solo_arcade',
      rounds: options.rounds,
      timeLimitSec: options.timeLimitSec,
      scoringMode: options.scoringMode || directDefaults.scoringMode || null,
      custom: {
        ...(directDefaults.custom || {}),
        ...(options.custom || {})
      }
    });

    this._launchTask(task, options.playMode === 'turn_based' ? 'team' : 'normal', runtimeContext, onComplete);
  }

  _launchTask(task, mode, runtimeContext, onComplete) {
    this.onComplete = onComplete;
    this._disposeActiveGame({ keepShell: true });

    const minigame = getMinigame(task.miniGameId);
    if (!minigame) {
      console.warn('Mini-game not found:', task.miniGameId);
      onComplete?.({ correct: false, score: 0, mode });
      return;
    }

    task.players = Array.isArray(runtimeContext.players) ? runtimeContext.players : [];
    task.playerCount = task.players.length;
    task.currentPlayerId = runtimeContext.currentPlayerId ?? null;
    task.partyConfig = buildTaskPartyConfig(task, {
      id: task.miniGameId,
      name: minigame.name_de,
      playerMode: task.partyConfig?.mode
    });

    const modeIcon = mode === 'challenge' ? iconChallenge(22)
      : mode === 'team' ? iconTeam(22)
      : iconTask(22);
    const theme = this._getTheme(mode, task.topic);
    const topicLabel = this._getTopicLabel(task.topic);
    const partyConfig = task.partyConfig;
    const useExternalTimer = task.timerSeconds > 0 && !minigame.usesInternalTimer;
    const exitOptions = runtimeContext.exitOptions || {};
    const shellContext = this._getShellContext(runtimeContext, exitOptions, mode);
    const boardPlayerCard = this._renderBoardPlayerCard(task, runtimeContext, 'sidebar');
    const boardStagePlayerCard = this._renderBoardPlayerCard(task, runtimeContext, 'stage');
    const titleClassName = minigame.name_de.length > 14
      ? 'minigame-title minigame-title--compact'
      : 'minigame-title';
    const arcadeGameIds = new Set([
      'wort-labyrinth-jagd',
      'artikel-invaders',
      'wort-tetris-stapel',
      'wortarten-sprunglauf',
      'schneeball-wortschlacht',
      'artikel-gate-runner',
      'silben-beat-surfer',
      'satz-jetpack',
      'grammatik-bossfight'
    ]);
    const overlayClassName = arcadeGameIds.has(task.miniGameId)
      ? 'minigame-overlay animate-screen minigame-overlay--arcade'
      : 'minigame-overlay animate-screen';

    this.container.innerHTML = `
      <div class="${overlayClassName}" id="minigame-overlay" style="
        --minigame-accent:${theme.primary};
        --minigame-secondary:${theme.secondary};
      " data-topic="${task.topic || 'wortschatz'}" data-mode="${mode}" data-game="${task.miniGameId || 'deutsch'}" data-world="${BOARD_THEME.id}">
        <div class="minigame-shell">
          <aside class="minigame-sidebar">
            <div class="minigame-kicker">${modeIcon}<span>${shellContext.kicker}</span></div>
            <div class="minigame-title-row">
              <div class="minigame-title-icon">${modeIcon}</div>
              <div>
                <h2 class="${titleClassName}">${this._escape(minigame.name_de)}</h2>
                <p class="minigame-subtitle">${theme.subtitle}</p>
              </div>
            </div>
            ${boardPlayerCard}
            ${this._renderMissionTrail(topicLabel)}
            <div class="minigame-meta">
              <span class="mission-chip">Thema: ${topicLabel}</span>
              <span class="mission-chip">Modus: ${getModeLabel(partyConfig.mode)}</span>
              <span class="mission-chip">Wertung: ${getScoringLabel(partyConfig.scoringMode)}</span>
              <span class="mission-chip">Level: ${this.settings.classLevel || 'frei'}</span>
              <span class="mission-chip">${task.timerSeconds > 0 ? `${task.timerSeconds}s Fokus` : 'Ohne Zeitdruck'}</span>
            </div>
            <p class="minigame-instructions">${task.instructions}</p>
          </aside>

          <section class="minigame-stage">
            <div class="minigame-stage-topbar">
              <div class="minigame-stage-title">${shellContext.stageTitle}</div>
              <div class="minigame-stage-actions">
                ${exitOptions.backLabel ? `
                  <button class="btn btn-secondary btn-sm minigame-nav-btn" id="btn-minigame-back-out" type="button">
                    ${iconBack(16)} ${exitOptions.backLabel}
                  </button>
                ` : ''}
                ${exitOptions.menuLabel ? `
                  <button class="btn btn-secondary btn-sm minigame-nav-btn" id="btn-minigame-menu-out" type="button">
                    ${iconHome(16)} ${exitOptions.menuLabel}
                  </button>
                ` : ''}
                ${useExternalTimer ? `
                  <div class="minigame-timer-area">
                    <div class="timer" id="minigame-timer">
                      ${iconTimer(16)} <span id="timer-value">${task.timerSeconds}</span>s
                    </div>
                  </div>
                ` : `<div class="mission-chip">${shellContext.untimedLabel}</div>`}
              </div>
            </div>
            ${boardStagePlayerCard}
            <div id="minigame-game-area" class="minigame-game-area"></div>
          </section>
        </div>
      </div>
    `;

    document.getElementById('btn-minigame-back-out')?.addEventListener('click', () => {
      this._disposeActiveGame();
      exitOptions.onBack?.();
    });

    document.getElementById('btn-minigame-menu-out')?.addEventListener('click', () => {
      this._disposeActiveGame();
      exitOptions.onMenu?.();
    });

    SoundManager.play('launch');

    if (useExternalTimer) {
      this._startTimer(task.timerSeconds, () => {
        this._disposeActiveGame({ keepShell: true });
        this._showResult({
          correct: false,
          partial: false,
          score: 0,
          timeout: true,
          mode
        });
      });
    }

    const gameArea = document.getElementById('minigame-game-area');
    gameArea.dataset.topic = task.topic || 'wortschatz';
    gameArea.dataset.game = task.miniGameId || 'deutsch';
    const cleanup = minigame.setup(gameArea, task, (result) => {
      this._clearTimer();
      this._disposeActiveGame({ keepShell: true, clearTimer: false });
      result.mode = mode;
      result.miniGameId = task.miniGameId;
      result.topic = task.topic;
      this._showResult(result);
    });
    this._registerCleanup(task.miniGameId, cleanup);
    this._decorateGameArea(gameArea, task, minigame);
  }

  _showResult(result) {
    const gameArea = document.getElementById('minigame-game-area');
    if (!gameArea) return;
    const stageTitle = document.querySelector('.minigame-stage-title');
    const timerNode = document.getElementById('minigame-timer');
    const timerArea = timerNode?.parentElement;

    gameArea.classList.add('is-result-state');

    if (stageTitle) {
      stageTitle.textContent = 'Runde vorbei';
    }

    let icon;
    let title;
    let titleClass;
    let message;

    if (result.timeout) {
      icon = iconTimer(48);
      title = 'Zeit vorbei!';
      titleClass = 'fail';
      message = 'Noch eine Runde und dann sitzt das sicher.';
      SoundManager.play('error');
    } else if (result.correct) {
      icon = iconParty(48);
      title = 'Mega gemacht!';
      titleClass = 'success';
      message = 'Treffer. Stark gespielt und sauber gelöst.';
      SoundManager.play('success');
    } else if (result.partial) {
      icon = iconCheck(48);
      title = 'Fast perfekt!';
      titleClass = 'partial';
      message = 'Guter Lauf. Die nächste Runde holt den Rest.';
      SoundManager.play('reward');
    } else {
      icon = `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 8 Q18 18 12 28 Q24 24 36 28 Q30 18 24 8Z" fill="#FFD54F" stroke="#F9A825" stroke-width="2"/><circle cx="24" cy="36" r="6" fill="#FFD54F" stroke="#F9A825" stroke-width="2"/></svg>`;
      title = 'Weiter geht’s!';
      titleClass = 'fail';
      message = 'Die Aufgabe war anspruchsvoll. Noch einmal und der Punkt sitzt.';
      SoundManager.play('error');
    }

    let coinsEarned = 0;
    if (result.correct) coinsEarned = 3;
    else if (result.partial) coinsEarned = 1;

    if (timerArea) {
      timerArea.innerHTML = `
        <div class="mission-chip minigame-status-chip ${result.timeout ? 'is-timeout' : result.correct ? 'is-success' : result.partial ? 'is-partial' : 'is-retry'}">
          ${result.timeout ? 'Zeit um' : result.correct ? 'Treffer' : result.partial ? 'Fast' : 'Weiter'}
        </div>
      `;
    }

    gameArea.innerHTML = `
      <div class="minigame-result minigame-result--${result.timeout ? 'timeout' : result.correct ? 'success' : result.partial ? 'partial' : 'retry'}">
        <div class="cardboard-result-card animate-bounce-in">
          <div class="result-icon">${icon}</div>
          <div class="result-title ${titleClass}">${title}</div>
          <p style="margin:14px 0 0; font-size:1.05rem; font-weight:800; color:var(--text-secondary);">${message}</p>
          ${result.score !== undefined ? `
            <div style="display:flex; justify-content:center; margin-top:20px;">
              <div class="result-scoreline">Ergebnis: ${result.score}%</div>
            </div>
          ` : ''}
          ${coinsEarned > 0 ? `
            <div class="result-rewards" style="justify-content:center; margin-top: 22px;">
              <span class="mission-chip" style="background:rgba(255,245,207,0.92); color:#8a6114;">
                ${iconCoin(24)} +${coinsEarned} Münzen
              </span>
            </div>
          ` : ''}
          <div style="margin-top: 30px; display:flex; justify-content:center;">
            <button class="btn btn-primary btn-lg" id="minigame-continue">Weiter</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('minigame-continue')?.addEventListener('click', () => {
      this._disposeActiveGame({ keepShell: true });
      this.container.innerHTML = '';
      if (this.onComplete) {
        this.onComplete(result);
      }
    });
  }

  _startTimer(seconds, onTimeout) {
    let remaining = seconds;
    const runId = ++this.timerRunId;
    const timerEl = document.getElementById('timer-value');
    const timerContainer = document.getElementById('minigame-timer');
    
    const intervalId = setInterval(() => {
      if (this.timerRunId !== runId || this.timerInterval !== intervalId) {
        clearInterval(intervalId);
        return;
      }

      remaining--;
      if (timerEl) timerEl.textContent = remaining;
      if (remaining > 0 && remaining <= 5) {
        SoundManager.play('tick');
      }
      
      if (remaining <= 5 && timerContainer) {
        timerContainer.classList.add('warning');
      }
      if (remaining <= 3 && timerContainer) {
        timerContainer.classList.remove('warning');
        timerContainer.classList.add('danger');
      }
      
      if (remaining <= 0) {
        clearInterval(intervalId);
        if (this.timerInterval === intervalId) {
          this.timerInterval = null;
        }
        if (this.timerRunId !== runId) {
          return;
        }
        this.timerRunId++;
        onTimeout();
      }
    }, 1000);

    this.timerInterval = intervalId;
  }

  _clearTimer() {
    this.timerRunId++;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  close() {
    this._disposeActiveGame({ keepShell: true });
    this.container.innerHTML = '';
  }

  _registerCleanup(gameId, cleanup) {
    this.activeGameId = gameId || null;
    if (typeof cleanup === 'function') {
      this.activeCleanup = cleanup;
      return;
    }

    if (cleanup && typeof cleanup.destroy === 'function') {
      this.activeCleanup = () => cleanup.destroy();
      return;
    }

    if (cleanup && typeof cleanup.cleanup === 'function') {
      this.activeCleanup = () => cleanup.cleanup();
      return;
    }

    this.activeCleanup = null;
  }

  _disposeActiveGame({ keepShell = false, clearTimer = true } = {}) {
    if (clearTimer) {
      this._clearTimer();
    }

    if (typeof this.activeCleanup === 'function') {
      try {
        this.activeCleanup();
      } catch (error) {
        console.warn('Mini-game cleanup failed:', this.activeGameId, error);
      }
    }

    this.activeCleanup = null;
    this.activeGameId = null;

    if (!keepShell) {
      this.container.innerHTML = '';
    }
  }

  _decorateGameArea(gameArea, task, minigame) {
    if (!gameArea) {
      return;
    }

    const root = gameArea.firstElementChild;
    if (!root) {
      return;
    }

    const modernSelectors = [
      '.arcade-stage',
      '.arcade-game',
      '.alchemy-stage',
      '.lie-detector-shell',
      '.showcase-shell',
      '.word-stau-shell',
      '.kompositum-shell',
      '.taeusch-shell',
      '.reim-battle-shell',
      '.rollen-shell',
      '.word-type-sort-game',
      '.article-choice-game',
      '.article-cannon-game',
      '.case-choice-game',
      '.noun-hunter-game',
      '.rhyme-match-game',
      '.syllable-counter-game',
      '.sentence-order-game',
      '.fill-blanks-game',
      '.spelling-detective-game',
      '.atelier-game',
      '.premium-content-game'
    ];

    const isModern = modernSelectors.some((selector) => root.matches(selector) || root.querySelector(selector));
    if (isModern) {
      gameArea.classList.remove('legacy-mode');
      return;
    }

    gameArea.classList.add('legacy-mode');
    root.classList.add('legacy-premium-game', `legacy-topic-${task.topic || 'wortschatz'}`);

    const surfaceSelectors = [
      '.minigame-body',
      '.train-container',
      '.puzzle-minigame',
      '.minigame-header',
      '.target-sentence'
    ];

    let surfaceFound = false;
    surfaceSelectors.forEach((selector) => {
      root.querySelectorAll(selector).forEach((node) => {
        node.classList.add('legacy-premium-surface');
        surfaceFound = true;
      });
    });

    if (!surfaceFound) {
      root.classList.add('legacy-premium-surface');
    }

    root.querySelectorAll('h1, h2, h3, h4, .target-sentence, p').forEach((element, index) => {
      const text = (element.textContent || '').trim();
      if (!text) {
        return;
      }

      if (index <= 1 || element.classList.contains('target-sentence') || text.length <= 48) {
        element.classList.add('rainbow-glow-copy');
      } else {
        element.classList.add('legacy-readable-copy');
      }
    });

    root.querySelectorAll('button').forEach((button) => {
      button.classList.add('legacy-premium-button');
    });

    root.querySelectorAll('input[type="text"], textarea').forEach((input) => {
      input.classList.add('legacy-premium-input');
    });
  }

  _getModeLabel(mode) {
    if (mode === 'challenge') return 'Challenge';
    if (mode === 'team') return 'Team-Mission';
    return 'Solo-Mission';
  }

  _getShellContext(runtimeContext = {}, exitOptions = {}, mode = 'normal') {
    if (runtimeContext.source === 'board' || exitOptions.backLabel === 'Zum Brett') {
      return {
        kicker: 'Brett-Mission',
        stageTitle: 'Brettaufgabe',
        untimedLabel: 'Brettmoment'
      };
    }

    if (runtimeContext.source === 'direct' || exitOptions.backLabel === 'Zu Minigames') {
      return {
        kicker: 'Direktspiel',
        stageTitle: 'Direktspiel',
        untimedLabel: 'Freies Spiel'
      };
    }

    return {
      kicker: this._getModeLabel(mode),
      stageTitle: 'Aufgabenblatt',
      untimedLabel: 'Freies Spiel'
    };
  }

  _renderBoardPlayerCard(task, runtimeContext = {}, placement = 'sidebar') {
    if (runtimeContext.source !== 'board') {
      return '';
    }

    const player = this._getCurrentPlayer(task);
    if (!player) {
      return '';
    }

    const characterIndex = this._getCharacterIndexForPlayer(player);
    const field = runtimeContext.field || {};
    const fieldTitle = field.title ? this._escape(field.title) : 'Brettfeld';
    const fieldSubtitle = field.subtitle ? ` · ${this._escape(field.subtitle)}` : '';
    const fieldNumber = Number.isFinite(field.id) ? `Feld ${field.id}` : 'Brettaufgabe';
    const playerName = this._escape(player.name || `Spieler ${Number(player.id) + 1 || 1}`);
    const avatarName = player.avatarName || CHARACTERS[characterIndex]?.name_de || 'Spielfigur';
    const cardLabel = placement === 'stage' ? 'Brettzug' : 'Am Zug';
    const cardTitle = placement === 'stage' ? `${fieldNumber} · ${playerName}` : playerName;
    const cardDetail = placement === 'stage'
      ? `${this._escape(avatarName)} spielt jetzt: ${fieldTitle}${fieldSubtitle}`
      : `${this._escape(avatarName)} · ${this._escape(fieldNumber)} · ${fieldTitle}${fieldSubtitle}`;
    const placementClass = placement === 'stage'
      ? ' minigame-player-card--stage'
      : ' minigame-player-card--sidebar';

    return `
      <div class="minigame-player-card${placementClass}" aria-label="Aktiver Spieler der Brettaufgabe">
        <div class="minigame-player-avatar">${renderCharacterAvatar(characterIndex, 58)}</div>
        <div class="minigame-player-copy">
          <span>${cardLabel}</span>
          <strong>${cardTitle}</strong>
          <small>${cardDetail}</small>
        </div>
      </div>
    `;
  }

  _getCurrentPlayer(task) {
    const players = Array.isArray(task.players) ? task.players : [];
    if (!players.length) {
      return null;
    }

    const currentPlayerId = task.currentPlayerId;
    return players.find((player) => player.id === currentPlayerId) || players[0] || null;
  }

  _getCharacterIndexForPlayer(player = {}) {
    if (Number.isFinite(player.colorIndex)) {
      return player.colorIndex;
    }

    if (player.avatarId) {
      const avatarIndex = CHARACTERS.findIndex((character) => character.id === player.avatarId);
      if (avatarIndex >= 0) {
        return avatarIndex;
      }
    }

    return Number.isFinite(player.id) ? player.id : 0;
  }

  _getTopicLabel(topic) {
    const labels = {
      nomen: 'Nomen',
      verben: 'Verben',
      adjektiv: 'Adjektive',
      adjektive: 'Adjektive',
      artikel: 'Artikel',
      satzbau: 'Satzbau',
      rechtschreibung: 'Rechtschreibung',
      wortschatz: 'Wortschatz',
      wortarten: 'Wortarten',
      wortbildung: 'Wortbildung',
      lesen: 'Lesen',
      silben: 'Silben',
      grammatik: 'Grammatik',
      alphabet: 'Alphabet',
      konzentration: 'Konzentration',
      reime: 'Reime',
      zusammengesetzte_nomen: 'Komposita'
    };

    return labels[topic] || 'Deutsch';
  }

  _getTheme(mode, topic) {
    const byTopic = {
      nomen: { primary: '#ff5b7c', secondary: '#ffcc66', subtitle: 'Wortschatz mit Tempo und Glanz.' },
      verben: { primary: '#2fba74', secondary: '#57c1ff', subtitle: 'Bewegung, Timing und Sprachgefühl.' },
      adjektiv: { primary: '#8a6bff', secondary: '#ff9b61', subtitle: 'Farbig, lebendig und voller Nuancen.' },
      adjektive: { primary: '#8a6bff', secondary: '#ff9b61', subtitle: 'Farbig, lebendig und voller Nuancen.' },
      artikel: { primary: '#ff9f42', secondary: '#ff5b7c', subtitle: 'Treffsicher wählen, sauber punkten.' },
      satzbau: { primary: '#52b7ff', secondary: '#ffd45a', subtitle: 'Ordnung, Rhythmus und Satzgefühl.' },
      rechtschreibung: { primary: '#ff5b7c', secondary: '#52b7ff', subtitle: 'Scharf sehen, clever reagieren.' },
      wortschatz: { primary: '#2fba74', secondary: '#ffd45a', subtitle: 'Mehr Wörter, mehr Spielraum, mehr Tempo.' },
      wortbildung: { primary: '#8a6bff', secondary: '#ffd45a', subtitle: 'Teile mischen, neue Wörter erschaffen.' },
      lesen: { primary: '#4f89ff', secondary: '#7de1c3', subtitle: 'Lesen, kombinieren, souverän reagieren.' },
      silben: { primary: '#ff8b55', secondary: '#5ed4ff', subtitle: 'Bausteine hören, sehen und blitzschnell setzen.' },
      grammatik: { primary: '#4cbd7d', secondary: '#ffd45a', subtitle: 'Regeln fühlen statt trocken auswendig lernen.' },
      alphabet: { primary: '#ff6584', secondary: '#ffd45a', subtitle: 'Ordnung mit Tempo und klarem Blick.' },
      konzentration: { primary: '#6c7cff', secondary: '#7de1c3', subtitle: 'Fokus halten, Muster greifen, sauber liefern.' },
      reime: { primary: '#ff78b8', secondary: '#ffd45a', subtitle: 'Rhythmus, Klang und Sprachgefühl im Flow.' },
      zusammengesetzte_nomen: { primary: '#ff8b55', secondary: '#8a6bff', subtitle: 'Deutsche Wortmaschinen auf Premium-Niveau.' }
    };

    if (byTopic[topic]) {
      return byTopic[topic];
    }

    if (mode === 'challenge') {
      return { primary: '#ff5b7c', secondary: '#ffd45a', subtitle: 'Alle gegen alle. Schnell, laut, präzise.' };
    }

    if (mode === 'team') {
      return { primary: '#2fba74', secondary: '#52b7ff', subtitle: 'Zusammen denken, zusammen gewinnen.' };
    }

    return { primary: '#8a6bff', secondary: '#52b7ff', subtitle: 'Kurze Mission, starke Belohnung.' };
  }

  _renderMissionTrail(topicLabel) {
    return `
      <div class="minigame-paper-trail" aria-hidden="true">
        <svg viewBox="0 0 260 132" role="presentation">
          <path class="minigame-paper-trail-wash" d="M 20 86 C 56 54, 96 38, 134 48 C 178 60, 190 92, 234 56"></path>
          <path class="minigame-paper-trail-line" d="M 20 86 C 56 54, 96 38, 134 48 C 178 60, 190 92, 234 56"></path>
          <circle class="trail-dot trail-dot--red" cx="22" cy="86" r="12"></circle>
          <circle class="trail-dot trail-dot--green" cx="82" cy="50" r="12"></circle>
          <circle class="trail-dot trail-dot--blue" cx="142" cy="50" r="12"></circle>
          <circle class="trail-dot trail-dot--gold" cx="194" cy="86" r="12"></circle>
          <circle class="trail-dot trail-dot--goal" cx="234" cy="56" r="15"></circle>
        </svg>
        <span>${this._escape(topicLabel)}</span>
      </div>
    `;
  }

  _escape(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
