import { SoundManager } from '../ui/sound-manager.js?v=game-feel-8';
import {
  addScore,
  buildTaskPartyConfig,
  computeArcadeResult,
  createScoreMap,
  pickRounds,
  randomItem,
  renderPartyMeta,
  renderPlayerRibbon,
  renderScoreboard,
  setRoundState
} from './core/party-game-core.js';

const PROMPT_LIBRARY = {
  word: ['Pfannkuchen', 'Geheimtuer', 'Superheld', 'Marmelade', 'Abenteuer', 'Laterne'],
  phrase: ['Ich habe den Schatz gefunden.', 'Das war knapp.', 'Wir muessen leise sein.', 'Heute gewinnt mein Team.'],
  sentence: [
    'Der kleine Drache will nicht schlafen.',
    'Im Zug ist ploetzlich alles voller Konfetti.',
    'Auf dem Schulhof landet ein Ufo aus Pappe.'
  ],
  emotions: ['Freude', 'Hass', 'Panik', 'Staunen', 'Langeweile', 'Mut'],
  styles: ['wie ein Superstar', 'wie eine Geheimagentin', 'wie ein Sportkommentator', 'wie ein alter Zauberer'],
  contexts: ['in einer Bibliothek', 'beim Finale', 'kurz vor Mitternacht', 'mitten im Gewitter']
};

const RATING_BUTTONS = [
  { label: 'Okay', hint: '+1 Punkt', value: 1, tone: 'mid' },
  { label: 'Stark', hint: '+2 Punkte', value: 2, tone: 'success' },
  { label: 'Buehnenmoment', hint: '+3 Punkte', value: 3, tone: 'success' }
];

function buildPromptRound(config) {
  const promptType = config.custom.promptType === 'mixed'
    ? randomItem(['word', 'phrase', 'sentence'])
    : config.custom.promptType;
  const sourcePool = PROMPT_LIBRARY[promptType] || PROMPT_LIBRARY.word;
  const content = randomItem(sourcePool);
  const emotion = randomItem(PROMPT_LIBRARY.emotions);
  const style = randomItem(PROMPT_LIBRARY.styles);
  const context = randomItem(PROMPT_LIBRARY.contexts);

  return {
    promptType,
    content,
    emotion,
    style,
    context,
    prompt: `Sag "${content}" wie ${style} voller ${emotion} ${context}.`
  };
}

function buildPromptRounds(config) {
  return pickRounds(
    Array.from({ length: Math.max(config.rounds * 2, config.rounds) }, () => buildPromptRound(config)),
    config.rounds
  );
}

function renderRatingGrid(idPrefix = 'rollen-rate') {
  return `
    <div class="showcase-score-grid">
      ${RATING_BUTTONS.map((rating) => `
        <button class="showcase-score-button tone-${rating.tone} ${idPrefix}" data-points="${rating.value}" type="button">
          <strong>${rating.label}</strong>
          <span>${rating.hint}</span>
        </button>
      `).join('')}
    </div>
  `;
}

export const RollenSprechen = {
  id: 'rollen-sprechen',
  name_de: 'Rollen-Sprechen',
  description: 'Wort, Phrase oder Satz in Rolle, Emotion und Szene performen und bewerten lassen.',
  topics: ['wortschatz', 'lesen', 'satzbau'],
  supportsDirectPlay: true,
  directPlayDefaults: {
    solo_arcade: { scoringMode: 'arcade' },
    turn_based: { scoringMode: 'vote' }
  },
  usesInternalTimer: true,
  getSettingsSchema() {
    return {
      fields: [
        { type: 'number', key: 'timeLimitSec', label: 'Redezeit', min: 8, max: 45, defaultValue: 12 },
        { type: 'number', key: 'rounds', label: 'Runden', min: 1, max: 6, defaultValue: 3 },
        {
          type: 'select',
          key: 'difficulty',
          label: 'Schwierigkeit',
          options: [
            { label: 'Leicht', value: 'easy' },
            { label: 'Mittel', value: 'medium' },
            { label: 'Schwer', value: 'hard' }
          ],
          defaultValue: 'medium'
        },
        {
          type: 'select',
          key: 'promptType',
          label: 'Prompt-Typ',
          options: [
            { label: 'Gemischt', value: 'mixed' },
            { label: 'Wort', value: 'word' },
            { label: 'Phrase', value: 'phrase' },
            { label: 'Satz', value: 'sentence' }
          ],
          defaultValue: 'mixed'
        }
      ]
    };
  },

  setup(container, task, onComplete) {
    const config = buildTaskPartyConfig(task, {
      id: 'rollen-sprechen',
      name: 'Rollen-Sprechen',
      rounds: 3,
      scoringMode: task.fieldType === 'normal' ? 'arcade' : 'vote',
      custom: {
        promptType: task.partyConfig?.custom?.promptType || 'mixed',
        speechTimeSec: task.partyConfig?.custom?.timeLimitSec || (task.fieldType === 'challenge' ? 10 : 12),
        voteMode: 'crowd'
      }
    });

    const rounds = buildPromptRounds(config);

    if (config.mode === 'solo_arcade') {
      runSolo(container, config, rounds, onComplete);
      return;
    }

    runParty(container, config, rounds, onComplete);
  }
};

function runSolo(container, config, rounds, onComplete) {
  let roundIndex = 0;
  let totalScore = 0;
  let countdownId = null;
  let activeTimerId = null;
  let timeLeft = config.custom.speechTimeSec;

  function cleanup() {
    if (countdownId) {
      clearInterval(countdownId);
      countdownId = null;
    }
    if (activeTimerId) {
      clearInterval(activeTimerId);
      activeTimerId = null;
    }
  }

  function finishGame() {
    cleanup();
    onComplete(computeArcadeResult(totalScore, rounds.length * 3, {
      details: {
        rounds: rounds.length,
        totalScore
      }
    }));
  }

  function showRating(round) {
    setRoundState(container, 'judge_or_vote');
    container.innerHTML = `
      <div class="showcase-shell rollen-shell">
        <div class="showcase-stage">
          <div class="premium-kicker">Selbstwertung</div>
          <h3 class="glow-title showcase-title">Wie stark war die Runde?</h3>
          <div class="rollen-prompt-cloud">
            <p>${round.prompt}</p>
          </div>
          ${renderRatingGrid()}
        </div>
      </div>
    `;

    container.querySelectorAll('.rollen-rate').forEach((button) => {
      button.addEventListener('click', () => {
        totalScore += Number(button.dataset.points || 0);
        SoundManager.play('success');
        roundIndex += 1;
        renderRound();
      });
    });
  }

  function startPerformance(round) {
    setRoundState(container, 'active');
    timeLeft = config.custom.speechTimeSec;
    const timerEl = container.querySelector('#rollen-timer');
    activeTimerId = setInterval(() => {
      timeLeft -= 1;
      if (timerEl) {
        timerEl.textContent = `${Math.max(timeLeft, 0)}s`;
      }
      if (timeLeft <= 3) {
        SoundManager.play('tick');
      }
      if (timeLeft <= 0) {
        cleanup();
        showRating(round);
      }
    }, 1000);
  }

  function startCountdown(round) {
    setRoundState(container, 'countdown');
    let countdown = 3;
    const countdownEl = container.querySelector('#rollen-countdown');
    SoundManager.play('launch');
    countdownId = setInterval(() => {
      if (countdownEl) {
        countdownEl.textContent = countdown > 0 ? String(countdown) : 'Los';
      }
      countdown -= 1;
      if (countdown < 0) {
        cleanup();
        startPerformance(round);
      }
    }, 650);
  }

  function renderRound() {
    cleanup();
    if (roundIndex >= rounds.length) {
      finishGame();
      return;
    }

    const round = rounds[roundIndex];
    setRoundState(container, 'prompt_reveal');
    container.innerHTML = `
      <div class="showcase-shell rollen-shell">
        <div class="showcase-stage">
          <div class="showcase-progress">Runde ${roundIndex + 1} / ${rounds.length}</div>
          <div class="showcase-badge-row">
            ${renderPartyMeta(config, [round.promptType, round.emotion])}
          </div>
          <div class="rollen-prompt-cloud">
            <span>Solo Performance</span>
            <strong>${round.content}</strong>
            <p>${round.style} ${round.context}</p>
          </div>
          <div class="rollen-cue-grid">
            <div class="mission-chip">Emotion: ${round.emotion}</div>
            <div class="mission-chip">Style: ${round.style}</div>
            <div class="mission-chip">Szene: ${round.context}</div>
          </div>
          <div class="party-countdown-card">
            <strong id="rollen-countdown">Bereit</strong>
            <span id="rollen-timer">${config.custom.speechTimeSec}s</span>
          </div>
          <div class="showcase-controls">
            <button class="btn btn-primary btn-lg" id="rollen-start" type="button">Performance starten</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#rollen-start').addEventListener('click', () => {
      container.querySelector('#rollen-start').disabled = true;
      startCountdown(round);
    });
  }

  renderRound();
}

function runParty(container, config, rounds, onComplete) {
  const players = config.players;
  const scoreMap = createScoreMap(players, 0);
  let roundIndex = 0;
  let countdownId = null;
  let activeTimerId = null;
  let timeLeft = config.custom.speechTimeSec;

  function cleanup() {
    if (countdownId) {
      clearInterval(countdownId);
      countdownId = null;
    }
    if (activeTimerId) {
      clearInterval(activeTimerId);
      activeTimerId = null;
    }
  }

  function activePlayer() {
    return players[roundIndex % players.length];
  }

  function finishGame() {
    cleanup();
    const totalScore = Object.values(scoreMap).reduce((sum, value) => sum + value, 0);
    onComplete(computeArcadeResult(totalScore, rounds.length * 3, {
      details: {
        scores: scoreMap,
        rounds: rounds.length
      }
    }));
  }

  function showVote(round, player) {
    setRoundState(container, 'judge_or_vote');
    container.innerHTML = `
      <div class="showcase-shell rollen-shell">
        <div class="showcase-stage">
          ${renderPlayerRibbon(players, player.id, scoreMap)}
          <div class="premium-kicker">Voting</div>
          <h3 class="glow-title showcase-title">${player.name} war dran</h3>
          <div class="rollen-prompt-cloud">
            <p>${round.prompt}</p>
          </div>
          ${renderRatingGrid('rollen-vote')}
        </div>
      </div>
    `;

    container.querySelectorAll('.rollen-vote').forEach((button) => {
      button.addEventListener('click', () => {
        addScore(scoreMap, player.id, Number(button.dataset.points || 0));
        SoundManager.play('success');
        roundIndex += 1;
        renderRound();
      });
    });
  }

  function startPerformance(round, player) {
    setRoundState(container, 'active');
    timeLeft = config.custom.speechTimeSec;
    const timerEl = container.querySelector('#rollen-timer');
    activeTimerId = setInterval(() => {
      timeLeft -= 1;
      if (timerEl) {
        timerEl.textContent = `${Math.max(timeLeft, 0)}s`;
      }
      if (timeLeft <= 3) {
        SoundManager.play('tick');
      }
      if (timeLeft <= 0) {
        cleanup();
        showVote(round, player);
      }
    }, 1000);
  }

  function startCountdown(round, player) {
    setRoundState(container, 'countdown');
    let countdown = 3;
    const countdownEl = container.querySelector('#rollen-countdown');
    SoundManager.play('launch');
    countdownId = setInterval(() => {
      if (countdownEl) {
        countdownEl.textContent = countdown > 0 ? String(countdown) : 'Los';
      }
      countdown -= 1;
      if (countdown < 0) {
        cleanup();
        startPerformance(round, player);
      }
    }, 650);
  }

  function renderRound() {
    cleanup();
    if (roundIndex >= rounds.length) {
      finishGame();
      return;
    }

    const round = rounds[roundIndex];
    const player = activePlayer();
    setRoundState(container, 'prompt_reveal');
    container.innerHTML = `
      <div class="showcase-shell rollen-shell">
        <div class="showcase-stage">
          <div class="showcase-progress">Runde ${roundIndex + 1} / ${rounds.length}</div>
          ${renderPlayerRibbon(players, player.id, scoreMap)}
          <div class="showcase-badge-row">
            ${renderPartyMeta(config, [round.promptType, round.emotion])}
          </div>
          <div class="rollen-prompt-cloud">
            <span>Jetzt performt</span>
            <strong>${player.name}</strong>
            <p>${round.prompt}</p>
          </div>
          <div class="rollen-cue-grid">
            <div class="mission-chip">Inhalt: ${round.content}</div>
            <div class="mission-chip">Style: ${round.style}</div>
            <div class="mission-chip">Szene: ${round.context}</div>
          </div>
          <div class="party-countdown-card">
            <strong id="rollen-countdown">Bereit</strong>
            <span id="rollen-timer">${config.custom.speechTimeSec}s</span>
          </div>
          <div class="showcase-controls">
            <button class="btn btn-primary btn-lg" id="rollen-start" type="button">Buehne frei</button>
          </div>
          ${renderScoreboard(players, scoreMap)}
        </div>
      </div>
    `;

    container.querySelector('#rollen-start').addEventListener('click', () => {
      container.querySelector('#rollen-start').disabled = true;
      startCountdown(round, player);
    });
  }

  renderRound();
}
