import { SoundManager } from '../../ui/sound-manager.js?v=game-feel-8';
import {
  buildTaskPartyConfig,
  computeArcadeResult,
  normalizePartyText,
  renderPartyMeta,
  renderPlayerRibbon,
  renderScoreboard,
  setRoundState
} from './party-game-core.js';

export function createStandardInput(type = 'word', value = '') {
  return { type, value };
}

export function coerceStandardInput(rawInput, inputType = 'word') {
  if (rawInput && typeof rawInput === 'object' && 'type' in rawInput) {
    return rawInput;
  }

  if (Array.isArray(rawInput)) {
    return createStandardInput('list', rawInput);
  }

  return createStandardInput(inputType, rawInput ?? '');
}

export function parseStandardInput(rawValue, inputType = 'word') {
  if (inputType === 'list') {
    return String(rawValue || '')
      .split(/[,;\n]+/g)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return String(rawValue || '').trim();
}

export function levenshteinDistance(left = '', right = '') {
  const a = normalizePartyText(left);
  const b = normalizePartyText(right);
  const rows = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let row = 0; row <= a.length; row += 1) rows[row][0] = row;
  for (let column = 0; column <= b.length; column += 1) rows[0][column] = column;

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + cost
      );
    }
  }

  return rows[a.length][b.length];
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function getActivePlayers(state) {
  return state.players.filter((player) => player.alive !== false);
}

function getScoreMap(players) {
  return players.reduce((acc, player) => {
    acc[player.id] = player.score || 0;
    return acc;
  }, {});
}

function getCurrentRound(state) {
  return state.data.rounds[state.roundIndex] || null;
}

function ensureActivePlayerIndex(state) {
  if (!state.players.length) {
    return state;
  }

  if (state.players[state.currentPlayerIndex]?.alive !== false) {
    return state;
  }

  for (let step = 1; step <= state.players.length; step += 1) {
    const candidate = (state.currentPlayerIndex + step) % state.players.length;
    if (state.players[candidate]?.alive !== false) {
      state.currentPlayerIndex = candidate;
      return state;
    }
  }

  state.isFinished = true;
  state.currentPlayerIndex = 0;
  return state;
}

function getCurrentPlayer(state) {
  ensureActivePlayerIndex(state);
  return state.players[state.currentPlayerIndex] || state.players[0] || null;
}

function advanceTurn(state) {
  if (state.mode === 'solo_arcade') {
    state.roundIndex += 1;
    state.currentPlayerIndex = 0;
    return state;
  }

  if (!state.players.length) {
    state.isFinished = true;
    return state;
  }

  let looped = false;
  for (let step = 1; step <= state.players.length; step += 1) {
    const candidate = (state.currentPlayerIndex + step) % state.players.length;
    if (candidate <= state.currentPlayerIndex) {
      looped = true;
    }
    if (state.players[candidate]?.alive !== false) {
      state.currentPlayerIndex = candidate;
      if (looped) {
        state.roundIndex += 1;
      }
      return state;
    }
  }

  state.isFinished = true;
  state.roundIndex = state.data.rounds.length;
  return state;
}

function buildHistoryLabel(player, validation, inputValue) {
  const base = validation.displayValue || validation.valueLabel || inputValue || validation.message || 'Antwort';
  return `${player.name}: ${base}`;
}

function getMaxScore(definition, state) {
  if (typeof definition.getMaxScore === 'function') {
    return Math.max(1, Number(definition.getMaxScore({ state })) || 1);
  }

  const perTurn = Math.max(1, Number(definition.maxPointsPerTurn || 1));
  const playerFactor = state.mode === 'solo_arcade' ? 1 : Math.max(1, state.players.length);
  return Math.max(1, state.data.rounds.length * playerFactor * perTurn);
}

function finishState(definition, state) {
  const activePlayers = getActivePlayers(state);
  if (state.roundIndex >= state.data.rounds.length) {
    state.isFinished = true;
  }
  if (!activePlayers.length) {
    state.isFinished = true;
  }
  if (state.mode === 'turn_based' && state.config.scoringMode === 'survival' && activePlayers.length <= 1) {
    state.isFinished = true;
  }
  return state;
}

function buildSetupConfig(definition, task) {
  const mode = task.partyConfig?.mode || (task.fieldType === 'team' ? 'turn_based' : 'solo_arcade');
  const directDefaults = definition.directPlayDefaults?.[mode] || {};

  return buildTaskPartyConfig(task, {
    id: definition.id,
    name: definition.name_de,
    playerMode: mode,
    rounds: definition.defaultRounds || 3,
    timeLimitSec: directDefaults.timeLimitSec || task.timerSeconds || 24,
    scoringMode: directDefaults.scoringMode,
    custom: {
      lives: 3,
      ...(definition.defaultCustom || {}),
      ...(directDefaults.custom || {})
    }
  });
}

export function createRuleGame(definition) {
  const game = {
    id: definition.id,
    name_de: definition.name_de,
    description: definition.description,
    topics: definition.topics,
    defaultRounds: definition.defaultRounds || 3,
    supportsDirectPlay: true,
    directPlayDefaults: definition.directPlayDefaults || {},
    usesInternalTimer: true,
    interfaceVersion: 'direct-rule-v1',
    inputFormat: definition.inputType === 'list'
      ? { type: 'list', value: ['Haus', 'Maus', 'Laus'] }
      : { type: 'word', value: 'Haus' },

    getSettingsSchema() {
      const fields = [];
      if (!definition.hideLivesSetting) {
        fields.push({
          type: 'number',
          key: 'lives',
          label: 'Leben im Turn-Based',
          min: 1,
          max: 5,
          defaultValue: Number(definition.defaultCustom?.lives || 3)
        });
      }

      return {
        fields: [...fields, ...(definition.settingsFields || [])]
      };
    },

    init(players, runtimeConfig = {}, task = {}, loadedContent = null) {
      const rounds = definition.buildRounds({ config: runtimeConfig, task, content: loadedContent });
      return {
        players: (players || []).map((player, index) => ({
          id: String(player.id ?? `player-${index + 1}`),
          name: player.name || `Spieler ${index + 1}`,
          score: 0,
          lives: runtimeConfig.mode === 'turn_based' ? Number(runtimeConfig.custom?.lives || 3) : undefined,
          alive: true
        })),
        currentPlayerIndex: 0,
        phase: 'prompt',
        timeLeft: runtimeConfig.timeLimitSec,
        mode: runtimeConfig.mode || 'solo_arcade',
        roundIndex: 0,
        config: {
          id: runtimeConfig.id,
          name: runtimeConfig.name,
          mode: runtimeConfig.mode,
          rounds: runtimeConfig.rounds,
          timeLimitSec: runtimeConfig.timeLimitSec,
          scoringMode: runtimeConfig.scoringMode,
          custom: { ...(runtimeConfig.custom || {}) }
        },
        data: {
          content: loadedContent,
          rounds,
          usedWords: [],
          currentStreak: 0,
          history: [],
          lastMessage: definition.introCopy || 'Neue Runde.',
          lastTone: 'neutral'
        },
        isFinished: rounds.length === 0
      };
    },

    validate(state, rawInput) {
      const round = getCurrentRound(state);
      const input = coerceStandardInput(rawInput, definition.inputType || 'word');
      const validator = definition.validateInput;

      if (!round || typeof validator !== 'function') {
        return {
          valid: false,
          message: 'Keine aktive Runde.',
          tone: 'fail',
          points: 0,
          input
        };
      }

      const result = validator({
        state,
        round,
        input,
        config: state.config
      }) || {};

      return {
        valid: Boolean(result.valid),
        message: result.message || (result.valid ? 'Treffer.' : 'Keine gültige Antwort.'),
        tone: result.tone || (result.valid ? 'good' : 'fail'),
        points: Number(result.points || 0),
        displayValue: result.displayValue || '',
        details: result.details || {},
        input
      };
    },

    onTurn(state, rawInput, precomputedValidation = null) {
      const nextState = cloneState(state);
      ensureActivePlayerIndex(nextState);
      const player = getCurrentPlayer(nextState);
      const round = getCurrentRound(nextState);
      const validation = precomputedValidation || game.validate(nextState, rawInput);
      const input = validation.input || coerceStandardInput(rawInput, definition.inputType || 'word');

      if (!player || !round) {
        nextState.isFinished = true;
        return nextState;
      }

      nextState.phase = 'result';

      if (validation.valid) {
        player.score += validation.points || 0;
        nextState.data.lastMessage = validation.message;
        nextState.data.lastTone = validation.tone || 'good';
        nextState.data.history.unshift({
          label: buildHistoryLabel(player, validation, input.value),
          tone: validation.tone || 'good'
        });

        if (typeof definition.onValidTurn === 'function') {
          definition.onValidTurn({
            state: nextState,
            round,
            input,
            validation,
            config: nextState.config
          });
        }
      } else {
        nextState.data.lastMessage = validation.message;
        nextState.data.lastTone = validation.tone || 'fail';
        nextState.data.history.unshift({
          label: buildHistoryLabel(player, validation, input.value),
          tone: validation.tone === 'warn' ? 'duplicate' : 'miss'
        });

        if (nextState.mode === 'turn_based') {
          player.lives = Math.max(Number(player.lives || nextState.config.custom.lives || 1) - 1, 0);
          if (player.lives <= 0) {
            player.alive = false;
          }
        }

        if (typeof definition.onInvalidTurn === 'function') {
          definition.onInvalidTurn({
            state: nextState,
            round,
            input,
            validation,
            config: nextState.config
          });
        }
      }

      advanceTurn(nextState);
      nextState.phase = 'next_round';
      return finishState(definition, nextState);
    },

    update(state) {
      const nextState = cloneState(state);
      ensureActivePlayerIndex(nextState);
      return finishState(definition, nextState);
    },

    isFinished(state) {
      return Boolean(state?.isFinished);
    },

    getResult(state) {
      const scoreMap = getScoreMap(state.players);
      const maxScore = getMaxScore(definition, state);
      const totalScore = Object.values(scoreMap).reduce((sum, value) => sum + value, 0);
      const winningScore = Math.max(...state.players.map((player) => player.score || 0), 0);
      const winnerIds = state.players
        .filter((player) => (player.score || 0) === winningScore)
        .map((player) => player.id);

      return {
        ...computeArcadeResult(totalScore, maxScore, {
          finished: true,
          winnerIds,
          details: {
            scores: scoreMap,
            players: state.players,
            rounds: state.data.rounds.length
          }
        })
      };
    },

    setup(container, task, onComplete) {
      const config = buildSetupConfig(definition, task);
      let state = null;
      let timerId = null;
      let loadedContent = null;

      const clearTimer = () => {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      };

      const renderBootState = (title, message, tone = 'neutral') => {
        container.innerHTML = `
          <div class="showcase-shell direct-rule-shell">
            <div class="showcase-stage">
              <div class="showcase-round-card">
                <div class="premium-kicker">${definition.kicker || 'Direct Play'}</div>
                <h3 class="glow-title showcase-title">${title}</h3>
                <p class="showcase-secondary">${message}</p>
              </div>
              <div class="word-stau-summary tone-${tone}">${message}</div>
            </div>
          </div>
        `;
      };

      const finish = () => {
        clearTimer();
        onComplete(game.getResult(state));
      };

      const scheduleNextRender = (delayMs = 700) => {
        window.setTimeout(() => {
          state = game.update(state);
          if (game.isFinished(state)) {
            finish();
            return;
          }
          render();
        }, delayMs);
      };

      const handleTimeout = () => {
        clearTimer();
        state = game.onTurn(
          state,
          createStandardInput('action', 'timeout'),
          {
            valid: false,
            message: 'Zeit abgelaufen.',
            tone: 'fail',
            points: 0,
            displayValue: 'Timeout',
            input: createStandardInput('action', 'timeout')
          }
        );
        SoundManager.play('error');
        if (game.isFinished(state)) {
          finish();
          return;
        }
        scheduleNextRender(definition.failureDelayMs || 820);
      };

      const startTimer = () => {
        clearTimer();
        state.timeLeft = Number(state.config.timeLimitSec || 20);
        const timerNode = container.querySelector('#direct-rule-timer');
        timerId = window.setInterval(() => {
          state.timeLeft -= 1;
          if (timerNode) {
            timerNode.textContent = `${Math.max(state.timeLeft, 0)}s`;
          }
          if (state.timeLeft <= 3) {
            SoundManager.play('tick');
          }
          if (state.timeLeft <= 0) {
            handleTimeout();
          }
        }, 1000);
      };

      const submitTurn = () => {
        const field = container.querySelector('#direct-rule-input');
        const parsedValue = parseStandardInput(field?.value, definition.inputType || 'word');
        const input = createStandardInput(definition.inputType || 'word', parsedValue);
        const validation = game.validate(state, input);

        if (field) {
          field.value = '';
        }

        clearTimer();
        state = game.onTurn(state, input, validation);
        SoundManager.play(validation.valid ? 'success' : validation.tone === 'warn' ? 'tick' : 'error');

        if (game.isFinished(state)) {
          finish();
          return;
        }

        scheduleNextRender(validation.valid ? (definition.successDelayMs || 620) : (definition.failureDelayMs || 820));
      };

      function render() {
        state = game.update(state);
        if (game.isFinished(state)) {
          finish();
          return;
        }

        const round = getCurrentRound(state);
        const player = getCurrentPlayer(state);
        const prompt = definition.getPrompt({ round, state, config: state.config }) || {};
        const scoreMap = getScoreMap(state.players);
        const listHint = definition.inputType === 'list'
          && !String(prompt.secondary || '').toLowerCase().includes('komma')
          ? '<p class="showcase-secondary">Mehrere Antworten mit Komma trennen.</p>'
          : '';

        setRoundState(container, 'active');
        container.innerHTML = `
          <div class="showcase-shell direct-rule-shell">
            <div class="showcase-stage">
              <div class="showcase-progress">Runde ${Math.min(state.roundIndex + 1, state.data.rounds.length)} / ${state.data.rounds.length}</div>
              ${state.mode === 'turn_based' ? renderPlayerRibbon(state.players, player?.id || null, scoreMap) : ''}
              <div class="showcase-badge-row">
                ${renderPartyMeta(state.config, prompt.badges || [])}
              </div>
              <div class="showcase-round-card">
                <div class="premium-kicker">${definition.kicker || 'Direct Play'}</div>
                <h3 class="glow-title showcase-title">${definition.name_de}</h3>
                <p class="showcase-prompt">${prompt.prompt || definition.description}</p>
                ${prompt.secondary ? `<p class="showcase-secondary">${prompt.secondary}</p>` : ''}
                ${listHint}
              </div>
              <div class="word-stau-hud">
                <div class="word-stau-stat">
                  <span>Timer</span>
                  <strong id="direct-rule-timer">${state.config.timeLimitSec}s</strong>
                </div>
                <div class="word-stau-stat">
                  <span>${state.mode === 'solo_arcade' ? 'Score' : (player?.name || 'Spieler')}</span>
                  <strong>${state.mode === 'solo_arcade'
                    ? Object.values(scoreMap).reduce((sum, value) => sum + value, 0)
                    : `${player?.score || 0} P`}</strong>
                </div>
                <div class="word-stau-stat">
                  <span>${state.mode === 'turn_based' ? 'Leben' : 'Modus'}</span>
                  <strong>${state.mode === 'turn_based' ? `${player?.lives || 0}` : 'Arcade'}</strong>
                </div>
              </div>
              <div class="solve-form">
                <input
                  id="direct-rule-input"
                  class="solve-input"
                  type="text"
                  autocomplete="off"
                  autocorrect="off"
                  spellcheck="false"
                  placeholder="${prompt.placeholder || 'Antwort eingeben...'}">
                <button class="btn btn-primary" id="direct-rule-submit" type="button">Check</button>
              </div>
              <div id="direct-rule-status" class="word-stau-summary tone-${state.data.lastTone || 'neutral'}">
                ${state.data.lastMessage || definition.introCopy || 'Los geht es.'}
              </div>
              <div id="direct-rule-history" class="word-stau-lane">
                ${state.data.history.slice(0, 10).map((entry) => `
                  <span class="word-stau-chip tone-${entry.tone || 'good'}">${entry.label}</span>
                `).join('')}
              </div>
              ${state.mode === 'turn_based' ? renderScoreboard(state.players, scoreMap) : ''}
            </div>
          </div>
        `;

        container.querySelector('#direct-rule-submit')?.addEventListener('click', submitTurn);
        container.querySelector('#direct-rule-input')?.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            submitTurn();
          }
        });
        container.querySelector('#direct-rule-input')?.focus();
        SoundManager.play('launch');
        startTimer();
      }

      const boot = async () => {
        try {
          renderBootState(definition.name_de, 'Inhalte werden geladen ...');
          if (typeof definition.loadContent === 'function') {
            loadedContent = await definition.loadContent({ task, config });
          }
          state = game.init(config.players, config, task, loadedContent);
          render();
        } catch (error) {
          console.error(`Failed to boot ${definition.id}`, error);
          renderBootState(definition.name_de, 'Die Spieldaten konnten nicht geladen werden.', 'fail');
        }
      };

      boot();
    }
  };

  return game;
}
