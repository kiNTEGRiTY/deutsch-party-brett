export const ROUND_STATES = [
  'intro',
  'prompt_reveal',
  'countdown',
  'active',
  'judge_or_vote',
  'result',
  'scoreboard',
  'next_round'
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

export function pickRounds(items, count = 3) {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

export function randomItem(items = []) {
  if (!items.length) {
    return null;
  }

  return items[Math.floor(Math.random() * items.length)];
}

export function normalizePartyText(value, { keepSpaces = false } = {}) {
  const normalized = (value || '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const stripped = keepSpaces
    ? normalized.replace(/[^a-z0-9 ]+/g, ' ')
    : normalized.replace(/[^a-z0-9]+/g, '');

  return keepSpaces ? stripped.replace(/\s+/g, ' ').trim() : stripped.trim();
}

export function buildPlayers(task, minimumPlayers = 1) {
  if (Array.isArray(task.players) && task.players.length > 0) {
    return task.players.map((player, index) => ({
      id: String(player.id ?? `player-${index + 1}`),
      name: player.name || `Spieler ${index + 1}`
    }));
  }

  const count = Math.max(task.playerCount || 0, minimumPlayers);
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    name: count === 1 ? 'Solo' : `Spieler ${index + 1}`
  }));
}

export function difficultyBand(difficulty = {}) {
  const complexity = Number(difficulty.languageComplexity ?? 2);
  if (complexity <= 2) return 'easy';
  if (complexity <= 4) return 'medium';
  return 'hard';
}

export function speedBand(difficulty = {}) {
  const pressure = Number(difficulty.timePressure ?? 1);
  if (pressure >= 5) return 'chaos';
  if (pressure >= 3) return 'fast';
  return 'normal';
}

export function buildModifierSet(task, defaults = []) {
  const modifiers = [...defaults];
  const topic = task.topic;

  if (topic === 'reime') {
    modifiers.push({ mustRhyme: true });
  }

  if (topic === 'nomen') {
    modifiers.push({ wordTypeOnly: 'noun' });
  }

  if (topic === 'verben') {
    modifiers.push({ wordTypeOnly: 'verb' });
  }

  if (topic === 'adjektive') {
    modifiers.push({ wordTypeOnly: 'adjective' });
  }

  if ((task.difficulty?.sentenceLength ?? 3) <= 1) {
    modifiers.push({ syllableLimit: 2 });
  }

  if ((task.difficulty?.timePressure ?? 0) >= 4) {
    modifiers.push({ performanceMode: 'dramatic' });
  }

  const seen = new Set();
  return modifiers.filter((modifier) => {
    const key = JSON.stringify(modifier);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function buildTaskPartyConfig(task, defaults = {}) {
  const taskConfig = task.partyConfig || {};
  const players = buildPlayers(
    task,
    defaults.playerMode === 'solo_arcade' ? 1 : defaults.minPlayers || (task.fieldType === 'team' ? 2 : 1)
  );

  let playerMode = taskConfig.mode || defaults.playerMode;
  if (!playerMode) {
    if (task.fieldType === 'team') {
      playerMode = 'turn_based';
    } else if (task.fieldType === 'challenge' && players.length > 1) {
      playerMode = 'turn_based';
    } else {
      playerMode = 'solo_arcade';
    }
  }

  const modifiers = taskConfig.modifiers
    || taskConfig.modifierSet
    || buildModifierSet(task, defaults.modifiers || []);

  const config = {
    id: defaults.id || task.miniGameId || 'party-game',
    name: defaults.name || task.miniGameId || 'Party-Spiel',
    mode: playerMode,
    difficulty: defaults.difficulty || difficultyBand(task.difficulty),
    rounds: Number(taskConfig.rounds || defaults.rounds || (playerMode === 'solo_arcade' ? 3 : 3)),
    timeLimitSec: Number(taskConfig.timeLimitSec || defaults.timeLimitSec || task.timerSeconds || 45),
    speedMode: defaults.speedMode || taskConfig.speedMode || speedBand(task.difficulty),
    scoringMode: defaults.scoringMode
      || taskConfig.scoringMode
      || (playerMode === 'solo_arcade' ? 'arcade' : task.fieldType === 'challenge' ? 'survival' : 'vote'),
    modifiers,
    modifierSet: modifiers,
    custom: {
      ...(defaults.custom || {}),
      ...(taskConfig.custom || {})
    },
    states: [...ROUND_STATES],
    players
  };

  config.rounds = clamp(config.rounds, 1, 8);
  config.timeLimitSec = clamp(config.timeLimitSec, 6, 120);

  return config;
}

export function computeArcadeResult(score, maxScore, overrides = {}) {
  const safeMax = Math.max(maxScore, 1);
  const percentage = clamp(Math.round((score / safeMax) * 100), 0, 100);
  return {
    correct: percentage >= 75,
    partial: percentage >= 45 && percentage < 75,
    score: percentage,
    ...overrides
  };
}

export function createScoreMap(players, initial = 0) {
  return players.reduce((acc, player) => {
    acc[player.id] = initial;
    return acc;
  }, {});
}

export function addScore(scoreMap, playerId, delta) {
  scoreMap[playerId] = (scoreMap[playerId] || 0) + delta;
  return scoreMap[playerId];
}

export function getPlayerScoreRows(players, scoreMap) {
  return [...players]
    .sort((left, right) => (scoreMap[right.id] || 0) - (scoreMap[left.id] || 0))
    .map((player) => ({
      ...player,
      score: scoreMap[player.id] || 0
    }));
}

export function getModeLabel(mode) {
  if (mode === 'turn_based') return 'Turn Based';
  return 'Solo Arcade';
}

export function getScoringLabel(mode) {
  if (mode === 'survival') return 'Survival';
  if (mode === 'vote') return 'Voting';
  return 'Arcade';
}

export function renderPartyMeta(config, extras = []) {
  const chips = [
    `${getModeLabel(config.mode)}`,
    `${getScoringLabel(config.scoringMode)}`,
    `${config.rounds} Runden`,
    `${config.timeLimitSec}s`
  ];

  return [...chips, ...extras]
    .filter(Boolean)
    .map((chip) => `<span class="showcase-chip">${chip}</span>`)
    .join('');
}

export function renderPlayerRibbon(players, activePlayerId = null, scoreMap = null) {
  return `
    <div class="party-player-strip">
      ${players.map((player) => `
        <div class="party-player-pill ${player.id === activePlayerId ? 'is-active' : ''}">
          <strong>${player.name}</strong>
          ${scoreMap ? `<span>${scoreMap[player.id] || 0} P</span>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

export function renderScoreboard(players, scoreMap) {
  return `
    <div class="party-scoreboard">
      ${getPlayerScoreRows(players, scoreMap).map((entry, index) => `
        <div class="party-score-row ${index === 0 ? 'is-leading' : ''}">
          <strong>${entry.name}</strong>
          <span>${entry.score} Punkte</span>
        </div>
      `).join('')}
    </div>
  `;
}

export function setRoundState(container, state) {
  if (container) {
    container.dataset.roundState = state;
  }
}
