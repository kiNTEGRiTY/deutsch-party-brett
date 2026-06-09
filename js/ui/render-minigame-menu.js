import {
  getCuratedDirectPlayGroups,
  getMinigame
} from '../minigames/minigame-registry.js?v=field-first-board-37';
import { renderCharacterAvatar } from './characters.js?v=field-first-board-37';
import { SoundManager } from './sound-manager.js?v=field-first-board-37';

function difficultyLabelFromSettings(settings) {
  const complexity = Number(settings?.difficulty?.languageComplexity ?? 2);
  if (complexity <= 2) return 'easy';
  if (complexity <= 4) return 'medium';
  return 'hard';
}

function defaultTimeLimitFromSettings(settings) {
  return Math.max(15, Math.min(60, 24 + Number(settings?.difficulty?.timePressure || 0) * 6));
}

function titleizeTopic(topic) {
  const labels = {
    nomen: 'Nomen',
    verben: 'Verben',
    adjektive: 'Adjektive',
    artikel: 'Artikel',
    satzbau: 'Satzbau',
    rechtschreibung: 'Rechtschreibung',
    reime: 'Reime',
    wortschatz: 'Wortschatz',
    wortbildung: 'Wortbildung',
    wortarten: 'Wortarten',
    alphabet: 'Alphabet',
    lesen: 'Lesen',
    silben: 'Silben',
    konzentration: 'Konzentration',
    zeitformen: 'Zeitformen',
    fehlerkorrektur: 'Fehlerkorrektur',
    zusammengesetzte_nomen: 'Komposita',
    grammatik: 'Grammatik'
  };

  return labels[topic] || topic;
}

function ensurePlayerNames(config) {
  const count = Math.max(1, Number(config.playerCount || 1));
  const names = Array.isArray(config.playerNames) ? [...config.playerNames] : [];
  while (names.length < count) {
    names.push(`Spieler ${names.length + 1}`);
  }
  return names.slice(0, count);
}

function buildBaseConfig(game, settings) {
  return {
    mode: 'solo_arcade',
    difficulty: difficultyLabelFromSettings(settings),
    rounds: Math.max(1, Number(game.defaultRounds || 3)),
    timeLimitSec: Number(game.directPlayDefaults?.solo_arcade?.timeLimitSec || defaultTimeLimitFromSettings(settings)),
    topic: game.topics?.[0] || 'wortschatz',
    playerCount: 2,
    playerNames: ['Spieler 1', 'Spieler 2'],
    custom: {}
  };
}

function directModeLabel(mode) {
  return mode === 'turn_based' ? 'Reihum' : 'Solo';
}

function isStandardField(key) {
  return ['difficulty', 'rounds', 'timeLimitSec', 'mode'].includes(key);
}

export class MinigameMenuRenderer {
  constructor(containerEl, settingsSnapshot, { onBack, onLaunch } = {}) {
    this.container = containerEl;
    this.settings = settingsSnapshot;
    this.onBack = onBack;
    this.onLaunch = onLaunch;
    this.selectedGameId = null;
    this.configByGameId = new Map();
  }

  render() {
    const groups = getCuratedDirectPlayGroups();
    const games = groups.flatMap((group) => group.games);
    const groupByGameId = new Map(
      groups.flatMap((group) => group.games.map((game) => [game.id, group]))
    );
    const gameOrderIndex = new Map(games.map((game, index) => [game.id, index]));

    if (!games.length) {
      this.container.innerHTML = `
        <div class="minigame-menu-shell premium-menu-shell">
          <div class="minigame-menu-header">
            <div>
              <div class="premium-kicker">Kuratierte Auswahl</div>
              <h2 class="glow-title minigame-menu-title">Direkt spielen</h2>
              <p class="minigame-menu-subtitle">Aktuell ist keine kuratierte Premium-Auswahl verfügbar.</p>
            </div>
            <div class="showcase-controls">
              <button class="btn btn-secondary" id="btn-minigame-back" type="button">Zurück</button>
            </div>
          </div>
        </div>
      `;
      this._bindEvents();
      return;
    }

    const selectedStillExists = games.some((game) => game.id === this.selectedGameId);
    if ((!this.selectedGameId || !selectedStillExists) && games.length > 0) {
      this.selectedGameId = games[0].id;
    }

    games.forEach((game) => {
      if (!this.configByGameId.has(game.id)) {
        this.configByGameId.set(game.id, buildBaseConfig(game, this.settings));
      }
    });

    const selectedGame = getMinigame(this.selectedGameId) || games[0];
    const config = this.configByGameId.get(selectedGame.id);
    const schema = selectedGame.getSettingsSchema?.() || { fields: [] };
    const customFields = schema.fields.filter((field) => !isStandardField(field.key));

    this.container.innerHTML = `
      <div class="minigame-menu-shell premium-menu-shell variety-menu-shell">
        <div class="minigame-menu-header">
          <div>
            <div class="premium-kicker">Kuratierte Auswahl</div>
            <h2 class="glow-title minigame-menu-title">Premium-Minispiele</h2>
            <p class="minigame-menu-subtitle">${games.length} geprüfte Direktstarts: Arcade-Loops, echte Figuren und Kartenatelier statt alter Fragekarten.</p>
            <div class="atelier-menu-showcase" aria-hidden="true">
              <span class="atelier-menu-photo atelier-menu-photo--animals"></span>
              <span class="atelier-menu-photo atelier-menu-photo--cards-a"></span>
              <span class="atelier-menu-photo atelier-menu-photo--cards-b"></span>
              <strong>${games.length}</strong>
            </div>
          </div>
          <div class="showcase-controls">
            <button class="btn btn-secondary" id="btn-minigame-back" type="button">Zurück</button>
            <button class="btn btn-primary" id="btn-minigame-launch" type="button">Jetzt starten</button>
          </div>
        </div>

        <div class="minigame-menu-layout">
          <section class="minigame-list premium-panel">
            ${groups.map((group) => `
              <div class="minigame-list-group">
                <div class="premium-kicker">${group.label}</div>
                <p class="minigame-menu-subtitle">${group.description}</p>
                ${group.games.map((game) => {
                  const gameConfig = this.configByGameId.get(game.id);
                  return `
                    <button class="minigame-card minigame-card--figure ${game.id === selectedGame.id ? 'is-selected' : ''}" data-game-id="${game.id}" type="button">
                      <div class="minigame-card-thumb" aria-hidden="true">
                        ${renderCharacterAvatar(game.mascotIndex ?? gameOrderIndex.get(game.id), 56)}
                      </div>
                      <div class="minigame-card-body">
                        <span class="minigame-card-kicker">${group.label} · ${game.topics?.slice(0, 2).map(titleizeTopic).join(' · ') || 'Deutsch'}</span>
                        <strong>${game.name_de}</strong>
                        <span class="minigame-card-desc">${game.description || 'Direkt startbares Sprachspiel für Solo- und Reihum-Runden.'}</span>
                        <div class="minigame-card-footer">
                          <span>${directModeLabel(gameConfig.mode)}</span>
                          <span>${gameConfig.rounds} Runden</span>
                        </div>
                      </div>
                    </button>
                  `;
                }).join('')}
              </div>
            `).join('')}
          </section>

          <section class="minigame-settings premium-panel">
            <div class="minigame-settings-top">
              <div>
                <div class="premium-kicker">Einstellungen</div>
                <h3 class="glow-title">${selectedGame.name_de}</h3>
                <p class="minigame-menu-subtitle">${groupByGameId.get(selectedGame.id)?.description || 'Der Direktstart nutzt dieselbe Runtime wie spätere Party- und Cup-Modi.'}</p>
              </div>
              <div class="premium-badges">
                ${groupByGameId.get(selectedGame.id) ? `<span class="premium-badge">${groupByGameId.get(selectedGame.id).label}</span>` : ''}
                ${(selectedGame.topics || []).slice(0, 4).map((topic) => `<span class="premium-badge">${titleizeTopic(topic)}</span>`).join('')}
              </div>
            </div>

            <div class="atelier-selected-preview" aria-hidden="true">
              <div class="atelier-selected-figure">
                ${renderCharacterAvatar(selectedGame.mascotIndex ?? gameOrderIndex.get(selectedGame.id), 104)}
              </div>
              <div>
                <span>${groupByGameId.get(selectedGame.id)?.label || 'Direktspiel'}</span>
                <strong>${selectedGame.name_de}</strong>
                <small>${selectedGame.description || 'Schneller Premium-Start mit echten Spielmaterialien.'}</small>
              </div>
            </div>

            <div class="minigame-settings-grid">
              <label class="setting-field">
                <span>Spielmodus</span>
                <select data-setting="mode">
                  <option value="solo_arcade" ${config.mode === 'solo_arcade' ? 'selected' : ''}>Solo</option>
                  <option value="turn_based" ${config.mode === 'turn_based' ? 'selected' : ''}>Reihum</option>
                </select>
              </label>

              <label class="setting-field">
                <span>Thema</span>
                <select data-setting="topic">
                  ${(selectedGame.topics || ['wortschatz']).map((topic) => `
                    <option value="${topic}" ${config.topic === topic ? 'selected' : ''}>${titleizeTopic(topic)}</option>
                  `).join('')}
                </select>
              </label>

              <label class="setting-field">
                <span>Schwierigkeit</span>
                <select data-setting="difficulty">
                  <option value="easy" ${config.difficulty === 'easy' ? 'selected' : ''}>Leicht</option>
                  <option value="medium" ${config.difficulty === 'medium' ? 'selected' : ''}>Mittel</option>
                  <option value="hard" ${config.difficulty === 'hard' ? 'selected' : ''}>Schwer</option>
                </select>
              </label>

              <label class="setting-field">
                <span>Zeitlimit</span>
                <input data-setting="timeLimitSec" type="number" min="6" max="120" value="${config.timeLimitSec}">
              </label>

              <label class="setting-field">
                <span>Runden</span>
                <input data-setting="rounds" type="number" min="1" max="8" value="${config.rounds}">
              </label>

              ${config.mode === 'turn_based' ? `
                <label class="setting-field">
                  <span>Spieler</span>
                  <input data-setting="playerCount" type="number" min="2" max="6" value="${config.playerCount}">
                </label>
              ` : ''}

              ${customFields.map((field) => this._renderCustomField(field, config.custom)).join('')}
            </div>

            ${config.mode === 'turn_based' ? `
              <div class="player-names-panel">
                <div class="premium-kicker">Spieler Setup</div>
                <div class="player-name-grid">
                  ${ensurePlayerNames(config).map((name, index) => `
                    <label class="setting-field">
                      <span>Spieler ${index + 1}</span>
                      <input data-player-name="${index}" type="text" value="${name}">
                    </label>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="minigame-settings-actions">
              <button class="btn btn-secondary" data-launch-mode="solo_arcade" type="button">Solo starten</button>
              <button class="btn btn-primary" data-launch-mode="turn_based" type="button">Reihum starten</button>
            </div>
          </section>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _renderCustomField(field, customConfig) {
    const currentValue = customConfig[field.key] ?? field.defaultValue;

    if (field.type === 'toggle') {
      return `
        <label class="setting-field setting-field--toggle">
          <span>${field.label}</span>
          <input data-custom-setting="${field.key}" type="checkbox" ${currentValue ? 'checked' : ''}>
        </label>
      `;
    }

    if (field.type === 'select') {
      return `
        <label class="setting-field">
          <span>${field.label}</span>
          <select data-custom-setting="${field.key}">
            ${field.options.map((option) => `
              <option value="${option.value}" ${String(currentValue) === option.value ? 'selected' : ''}>${option.label}</option>
            `).join('')}
          </select>
        </label>
      `;
    }

    return `
      <label class="setting-field">
        <span>${field.label}</span>
        <input data-custom-setting="${field.key}" type="number" min="${field.min}" max="${field.max}" value="${currentValue}">
      </label>
    `;
  }

  _bindEvents() {
    this.container.querySelector('#btn-minigame-back')?.addEventListener('click', () => {
      this.onBack?.();
    });

    this.container.querySelector('#btn-minigame-launch')?.addEventListener('click', () => {
      this._launchCurrentGame();
    });

    this.container.querySelectorAll('.minigame-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.selectedGameId = card.dataset.gameId;
        SoundManager.play('menuOpen');
        this.render();
      });
    });

    this.container.querySelectorAll('[data-setting]').forEach((input) => {
      input.addEventListener('change', () => {
        this._updateConfig(input.dataset.setting, input.type === 'number' ? Number(input.value) : input.value);
      });
    });

    this.container.querySelectorAll('[data-custom-setting]').forEach((input) => {
      input.addEventListener('change', () => {
        const key = input.dataset.customSetting;
        const value = input.type === 'checkbox'
          ? input.checked
          : input.type === 'number'
            ? Number(input.value)
            : input.value;
        this._updateCustomConfig(key, value);
      });
    });

    this.container.querySelectorAll('[data-player-name]').forEach((input) => {
      input.addEventListener('input', () => {
        const config = this.configByGameId.get(this.selectedGameId);
        const index = Number(input.dataset.playerName);
        config.playerNames = ensurePlayerNames(config);
        config.playerNames[index] = input.value || `Spieler ${index + 1}`;
      });
    });

    this.container.querySelectorAll('[data-launch-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        const mode = button.dataset.launchMode;
        SoundManager.play('gameStart');
        this._updateConfig('mode', mode);
        this._launchCurrentGame(mode);
      });
    });
  }

  _updateConfig(key, value) {
    const config = this.configByGameId.get(this.selectedGameId);
    config[key] = value;
    if (key === 'playerCount') {
      config.playerNames = ensurePlayerNames(config);
      this.render();
      return;
    }
    this.render();
  }

  _updateCustomConfig(key, value) {
    const config = this.configByGameId.get(this.selectedGameId);
    config.custom = {
      ...config.custom,
      [key]: value
    };
    this.render();
  }

  _launchCurrentGame(forcedMode = null) {
    const game = getMinigame(this.selectedGameId);
    const config = this.configByGameId.get(this.selectedGameId);
    const mode = forcedMode || config.mode;
    const playerNames = ensurePlayerNames(config);
    const players = mode === 'turn_based'
      ? playerNames.map((name, index) => ({ id: `local-${index + 1}`, name }))
      : [{ id: 'solo-1', name: 'Solo' }];

    this.onLaunch?.({
      miniGameId: game.id,
      topic: config.topic,
      playMode: mode,
      difficulty: this._difficultyPreset(config.difficulty),
      rounds: Number(config.rounds),
      timeLimitSec: Number(config.timeLimitSec),
      custom: {
        ...config.custom
      },
      players
    });
  }

  _difficultyPreset(level) {
    if (level === 'easy') {
      return {
        languageComplexity: 2,
        sentenceLength: 1,
        timePressure: 1,
        hintAmount: 4,
        answerOptions: 3,
        errorDensity: 1,
        inputMode: 1
      };
    }

    if (level === 'hard') {
      return {
        languageComplexity: 5,
        sentenceLength: 4,
        timePressure: 4,
        hintAmount: 1,
        answerOptions: 4,
        errorDensity: 4,
        inputMode: 1
      };
    }

    return {
      languageComplexity: 3,
      sentenceLength: 2,
      timePressure: 2,
      hintAmount: 2,
      answerOptions: 4,
      errorDensity: 2,
      inputMode: 1
    };
  }
}
