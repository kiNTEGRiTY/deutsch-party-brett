/**
 * Render Mini-Game - Wrapper for mini-game display and result handling
 * No emojis - all illustrated SVG icons
 */

import { getMinigame } from '../minigames/minigame-registry.js';
import { buildTaskPartyConfig, getModeLabel, getScoringLabel } from '../minigames/core/party-game-core.js';
import { createDirectTask, generateTask } from '../learning/task-generator.js';
import { SoundManager } from './sound-manager.js';
import { iconTask, iconChallenge, iconTeam, iconCoin, iconCheck, iconTimer, iconParty, iconBack, iconHome } from '../ui/icons.js';
import { renderRainbowText } from './rainbow-text.js';

export class MinigameRenderer {
  constructor(containerEl, settings) {
    this.container = containerEl;
    this.settings = settings;
    this.onComplete = null;
    this.timerInterval = null;
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

    this.container.innerHTML = `
      <div class="minigame-overlay animate-screen" id="minigame-overlay" style="
        --minigame-accent:${theme.primary};
        --minigame-secondary:${theme.secondary};
      ">
        <div class="minigame-shell">
          <aside class="minigame-sidebar">
            <div class="minigame-kicker">${modeIcon}<span>${this._getModeLabel(mode)}</span></div>
            <div class="minigame-title-row">
              <div class="minigame-title-icon">${modeIcon}</div>
              <div>
                <h2 class="minigame-title">${renderRainbowText(minigame.name_de, { className: 'rainbow-title-markup' })}</h2>
                <p class="minigame-subtitle">${theme.subtitle}</p>
              </div>
            </div>
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
              <div class="minigame-stage-title">${renderRainbowText('Mission läuft', { className: 'rainbow-title-markup rainbow-title-markup--tiny' })}</div>
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
                ` : '<div class="mission-chip">Live-Show</div>'}
              </div>
            </div>
            <div id="minigame-game-area" class="minigame-game-area"></div>
          </section>
        </div>
      </div>
    `;

    document.getElementById('btn-minigame-back-out')?.addEventListener('click', () => {
      this._clearTimer();
      this.container.innerHTML = '';
      exitOptions.onBack?.();
    });

    document.getElementById('btn-minigame-menu-out')?.addEventListener('click', () => {
      this._clearTimer();
      this.container.innerHTML = '';
      exitOptions.onMenu?.();
    });

    SoundManager.play('launch');

    if (useExternalTimer) {
      this._startTimer(task.timerSeconds, () => {
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
    minigame.setup(gameArea, task, (result) => {
      this._clearTimer();
      result.mode = mode;
      result.miniGameId = task.miniGameId;
      result.topic = task.topic;
      this._showResult(result);
    });
    this._decorateGameArea(gameArea, task, minigame);
  }

  _showResult(result) {
    const gameArea = document.getElementById('minigame-game-area');
    if (!gameArea) return;

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

    gameArea.innerHTML = `
      <div class="minigame-result">
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
      this.container.innerHTML = '';
      if (this.onComplete) {
        this.onComplete(result);
      }
    });
  }

  _startTimer(seconds, onTimeout) {
    let remaining = seconds;
    const timerEl = document.getElementById('timer-value');
    const timerContainer = document.getElementById('minigame-timer');
    
    this.timerInterval = setInterval(() => {
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
        this._clearTimer();
        onTimeout();
      }
    }, 1000);
  }

  _clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  close() {
    this._clearTimer();
    this.container.innerHTML = '';
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
      '.alchemy-stage',
      '.lie-detector-shell',
      '.showcase-shell',
      '.word-stau-shell',
      '.kompositum-shell',
      '.taeusch-shell',
      '.reim-battle-shell',
      '.rollen-shell'
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
}
