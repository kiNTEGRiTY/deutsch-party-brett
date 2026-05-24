import { SoundManager } from '../ui/sound-manager.js?v=game-feel-8';
import { RECHTSCHREIBUNG_CONTENT } from '../learning/languages/de/content-rechtschreibung.js';
import {
  addScore,
  buildTaskPartyConfig,
  computeArcadeResult,
  createScoreMap,
  normalizePartyText,
  pickRounds,
  renderPartyMeta,
  renderPlayerRibbon,
  renderScoreboard,
  setRoundState
} from './core/party-game-core.js';

const RHYME_BANK = [
  { seed: 'Haus', rhymes: ['Maus', 'Laus', 'raus', 'Applaus'], near: ['Klaus', 'aus'] },
  { seed: 'Baum', rhymes: ['Traum', 'Schaum', 'Raum'], near: ['kaum'] },
  { seed: 'Licht', rhymes: ['Gedicht', 'Schicht', 'Sicht'], near: ['Bericht'] },
  { seed: 'Wind', rhymes: ['Kind', 'find', 'geschwind'], near: ['sind'] },
  { seed: 'Fisch', rhymes: ['Tisch', 'frisch', 'Wisch'], near: ['Mischung'] },
  { seed: 'Rose', rhymes: ['Hose', 'Dose', 'lose'], near: ['groesse'] },
  { seed: 'Schnee', rhymes: ['See', 'Klee', 'Juchee'], near: ['okay'] },
  { seed: 'Tor', rhymes: ['vor', 'Chor', 'Ohr'], near: ['Motor'] },
  { seed: 'Tag', rhymes: ['mag', 'lag', 'frag'], near: ['stark'] },
  { seed: 'Hand', rhymes: ['Sand', 'Wand', 'Land'], near: ['Rand'] }
];

for (const [left, right] of RECHTSCHREIBUNG_CONTENT.reime.pairs) {
  RHYME_BANK.push({
    seed: left,
    rhymes: [right],
    near: []
  });
}

function uniqueEntries(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizePartyText(item.seed);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function prepareRounds(config) {
  return pickRounds(uniqueEntries(RHYME_BANK), config.rounds).map((round) => ({
    ...round,
    accepted: new Set(round.rhymes.map((item) => normalizePartyText(item))),
    nearAccepted: new Set((round.near || []).map((item) => normalizePartyText(item)))
  }));
}

function findKnownWord(round, normalized) {
  return round.rhymes.find((item) => normalizePartyText(item) === normalized)
    || (round.near || []).find((item) => normalizePartyText(item) === normalized)
    || normalized;
}

export const ReimBattle = {
  id: 'reim-battle',
  name_de: 'Reim-Battle',
  description: 'Neue Reime finden, Wiederholungen vermeiden und die Kette unter Druck halten.',
  topics: ['reime', 'wortschatz'],
  supportsDirectPlay: true,
  directPlayDefaults: {
    solo_arcade: { scoringMode: 'arcade' },
    turn_based: { scoringMode: 'survival' }
  },
  usesInternalTimer: true,
  getSettingsSchema() {
    return {
      fields: [
        { type: 'number', key: 'timeLimitSec', label: 'Zeitlimit', min: 10, max: 90, defaultValue: 30 },
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
        { type: 'toggle', key: 'allowNearRhymes', label: 'Nahe Reime erlauben', defaultValue: true },
        { type: 'number', key: 'minWordLength', label: 'Min. Wortlaenge', min: 2, max: 10, defaultValue: 3 },
        { type: 'toggle', key: 'survivalMode', label: 'Survival-Regel', defaultValue: false },
        { type: 'number', key: 'lives', label: 'Leben im Turn-Based', min: 1, max: 5, defaultValue: 3 }
      ]
    };
  },

  setup(container, task, onComplete) {
    const config = buildTaskPartyConfig(task, {
      id: 'reim-battle',
      name: 'Reim-Battle',
      rounds: task.fieldType === 'challenge' ? 3 : 3,
      scoringMode: task.partyConfig?.scoringMode || (task.fieldType === 'challenge' ? 'survival' : 'arcade'),
      custom: {
        rhymeStrictness: task.fieldType === 'challenge' ? 'strict' : 'loose',
        allowNearRhymes: task.partyConfig?.custom?.allowNearRhymes ?? task.fieldType !== 'challenge',
        suddenDeath: task.partyConfig?.custom?.survivalMode ?? task.fieldType === 'challenge',
        minSyllables: 1,
        minWordLength: task.partyConfig?.custom?.minWordLength ?? 3,
        lives: task.partyConfig?.custom?.lives ?? 3,
        turnLimitSec: task.fieldType === 'challenge' ? 5 : 6
      }
    });

    const rounds = prepareRounds(config);

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
  let combo = 0;
  let timerId = null;
  let timeLeft = config.timeLimitSec;
  let currentSeen = new Set();

  function cleanup() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function finishGame() {
    cleanup();
    onComplete(computeArcadeResult(totalScore, rounds.length * 8, {
      details: {
        rounds: rounds.length,
        totalScore
      }
    }));
  }

  function appendChip(label, tone = 'good') {
    const lane = container.querySelector('#reim-lane');
    if (!lane) {
      return;
    }
    const chip = document.createElement('span');
    chip.className = `word-stau-chip tone-${tone}`;
    chip.textContent = label;
    lane.prepend(chip);
  }

  function updateStatus(text, tone = 'neutral') {
    const status = container.querySelector('#reim-status');
    if (!status) {
      return;
    }
    status.className = `word-stau-summary tone-${tone}`;
    status.textContent = text;
  }

  function updateHud() {
    const timerEl = container.querySelector('#reim-timer');
    const scoreEl = container.querySelector('#reim-score');
    const comboEl = container.querySelector('#reim-combo');
    if (timerEl) timerEl.textContent = `${timeLeft}s`;
    if (scoreEl) scoreEl.textContent = String(totalScore);
    if (comboEl) comboEl.textContent = String(combo);
  }

  function goToNextRound() {
    cleanup();
    roundIndex += 1;
    if (roundIndex >= rounds.length) {
      finishGame();
      return;
    }
    renderRound();
  }

  function submitAnswer() {
    const input = container.querySelector('#reim-input');
    if (!input) {
      return;
    }

    const rawValue = input.value.trim();
    if (!rawValue) {
      updateStatus('Tippe einen Reim, sonst läuft der Takt leer.', 'warn');
      return;
    }

    const round = rounds[roundIndex];
    const normalized = normalizePartyText(rawValue);
    input.value = '';

    if (currentSeen.has(normalized)) {
      combo = 0;
      totalScore = Math.max(totalScore - 1, 0);
      appendChip(rawValue, 'duplicate');
      updateStatus('Schon genannt. Kein Punkt.', 'warn');
      SoundManager.play('error');
      updateHud();
      return;
    }

    if (rawValue.length >= config.custom.minWordLength && (round.accepted.has(normalized) || (config.custom.allowNearRhymes && round.nearAccepted.has(normalized)))) {
      currentSeen.add(normalized);
      combo += 1;
      totalScore += 1;
      if (combo > 0 && combo % 3 === 0) {
        totalScore += 1;
      }
      if ((findKnownWord(round, normalized) || '').length >= 6) {
        totalScore += 1;
      }
      appendChip(findKnownWord(round, normalized), 'good');
      updateStatus('Sauberer Reim. Weiter.', 'good');
      SoundManager.play('success');
      updateHud();
      return;
    }

    combo = 0;
    appendChip(rawValue, 'miss');
    updateStatus('Der Reim sitzt nicht sauber genug.', 'fail');
    SoundManager.play('tick');
    updateHud();
  }

  function startRound() {
    cleanup();
    timeLeft = config.timeLimitSec;
    currentSeen = new Set();
    updateHud();
    updateStatus('Los. Treff die Reime ohne Dopplung.', 'neutral');
    SoundManager.play('launch');

    timerId = setInterval(() => {
      timeLeft -= 1;
      updateHud();
      if (timeLeft <= 5) {
        SoundManager.play('tick');
      }
      if (timeLeft <= 0) {
        goToNextRound();
      }
    }, 1000);

    container.querySelector('#reim-input')?.focus();
  }

  function renderRound() {
    const round = rounds[roundIndex];
    setRoundState(container, 'prompt_reveal');
    container.innerHTML = `
      <div class="showcase-shell reim-battle-shell">
        <div class="showcase-stage">
          <div class="premium-kicker">Phase 1</div>
          <h3 class="glow-title showcase-title">Reim-Battle</h3>
          <div class="showcase-badge-row">
            ${renderPartyMeta(config, [`Runde ${roundIndex + 1} / ${rounds.length}`])}
          </div>
          <div class="reim-seed-card">
            <span>Startwort</span>
            <strong>${round.seed}</strong>
            <p>Finde so viele passende Reime wie moeglich.</p>
          </div>
          <div class="word-stau-hud">
            <div class="word-stau-stat"><span>Timer</span><strong id="reim-timer">${config.timeLimitSec}s</strong></div>
            <div class="word-stau-stat"><span>Punkte</span><strong id="reim-score">${totalScore}</strong></div>
            <div class="word-stau-stat"><span>Combo</span><strong id="reim-combo">${combo}</strong></div>
          </div>
          <div class="word-stau-entry">
            <input id="reim-input" class="solve-input" type="text" autocomplete="off" spellcheck="false" placeholder="Reim eingeben...">
            <button class="btn btn-secondary" id="reim-submit" type="button">Reim sichern</button>
            <button class="btn btn-primary" id="reim-start" type="button">Runde starten</button>
          </div>
          <div id="reim-status" class="word-stau-summary tone-neutral">Drei saubere Treffer am Stueck geben Bonus.</div>
          <div id="reim-lane" class="word-stau-lane"></div>
        </div>
      </div>
    `;

    container.querySelector('#reim-start').addEventListener('click', () => {
      container.querySelector('#reim-start').disabled = true;
      setRoundState(container, 'active');
      startRound();
    });
    container.querySelector('#reim-submit').addEventListener('click', submitAnswer);
    container.querySelector('#reim-input').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submitAnswer();
      }
    });
  }

  renderRound();
}

function runParty(container, config, rounds, onComplete) {
  const players = config.players;
  const scoreMap = createScoreMap(players, 0);
  const activePlayers = new Set(players.map((player) => player.id));
  const livesMap = createScoreMap(players, config.custom.lives || 3);
  let roundIndex = 0;
  let playerIndex = 0;
  let turnTimerId = null;
  let timeLeft = config.custom.turnLimitSec;
  let currentSeen = new Set();
  let awaitingHostDecision = null;

  function cleanup() {
    if (turnTimerId) {
      clearInterval(turnTimerId);
      turnTimerId = null;
    }
  }

  function currentRound() {
    return rounds[Math.min(roundIndex, rounds.length - 1)];
  }

  function currentActivePlayers() {
    return players.filter((player) => activePlayers.has(player.id));
  }

  function currentPlayer() {
    return currentActivePlayers()[playerIndex] || currentActivePlayers()[0] || players[0];
  }

  function maxScore() {
    return Math.max(1, rounds.length * players.length * 2 + 3);
  }

  function finishGame() {
    cleanup();
    const totalScore = Object.values(scoreMap).reduce((sum, value) => sum + value, 0);
    onComplete(computeArcadeResult(totalScore, maxScore(), {
      details: {
        scores: scoreMap,
        lives: livesMap,
        rounds: rounds.length
      }
    }));
  }

  function updateTurnUi(message, tone = 'neutral') {
    const status = container.querySelector('#reim-party-status');
    const timerEl = container.querySelector('#reim-party-timer');
    if (status) {
      status.className = `word-stau-summary tone-${tone}`;
      status.textContent = message;
    }
    if (timerEl) {
      timerEl.textContent = `${timeLeft}s`;
    }
  }

  function appendTurnChip(text, tone = 'good') {
    const lane = container.querySelector('#reim-party-log');
    if (!lane) {
      return;
    }
    const chip = document.createElement('span');
    chip.className = `word-stau-chip tone-${tone}`;
    chip.textContent = text;
    lane.prepend(chip);
  }

  function moveToNextTurn() {
    cleanup();
    awaitingHostDecision = null;
    const available = currentActivePlayers();
    if (available.length === 0) {
      finishGame();
      return;
    }

    if (config.custom.suddenDeath && available.length === 1) {
      addScore(scoreMap, available[0].id, 3);
      renderBoard('Letzte Person uebrig. Bonus +3.', 'good');
      setTimeout(finishGame, 900);
      return;
    }

    playerIndex += 1;
    if (playerIndex >= available.length) {
      roundIndex += 1;
      playerIndex = 0;
      currentSeen = new Set();
    }

    if (roundIndex >= rounds.length) {
      finishGame();
      return;
    }

    renderBoard();
  }

  function failTurn(reason) {
    const player = currentPlayer();
    appendTurnChip(`${player.name}: ${reason}`, 'miss');
    updateTurnUi(reason, 'fail');
    SoundManager.play('error');
    if (config.custom.suddenDeath) {
      activePlayers.delete(player.id);
    } else {
      livesMap[player.id] = Math.max((livesMap[player.id] || 1) - 1, 0);
      if (livesMap[player.id] === 0) {
        activePlayers.delete(player.id);
      }
    }
    setTimeout(moveToNextTurn, 700);
  }

  function registerSuccess(answer, bonus = 1, tone = 'good') {
    const player = currentPlayer();
    currentSeen.add(normalizePartyText(answer));
    addScore(scoreMap, player.id, bonus);
    appendTurnChip(`${player.name}: ${answer}`, tone);
    updateTurnUi(`${player.name} punktet mit ${answer}.`, 'good');
    SoundManager.play('success');
    setTimeout(moveToNextTurn, 650);
  }

  function showHostDecision(rawValue) {
    awaitingHostDecision = rawValue;
    const host = container.querySelector('#reim-host-panel');
    if (!host) {
      failTurn('Host-Check fehlt.');
      return;
    }

    host.innerHTML = `
      <div class="party-host-panel">
        <span>Unbekannter Reim: <strong>${rawValue}</strong></span>
        <div class="showcase-controls">
          <button class="btn btn-secondary" id="reim-host-accept" type="button">Als Nahe-Reim werten</button>
          <button class="btn btn-secondary" id="reim-host-reject" type="button">Ablehnen</button>
        </div>
      </div>
    `;

    host.querySelector('#reim-host-accept').addEventListener('click', () => {
      registerSuccess(rawValue, 1, 'duplicate');
    });
    host.querySelector('#reim-host-reject').addEventListener('click', () => {
      failTurn('Der Reim wurde abgelehnt.');
    });
  }

  function submitTurn() {
    if (awaitingHostDecision) {
      return;
    }

    const input = container.querySelector('#reim-party-input');
    if (!input) {
      return;
    }

    const rawValue = input.value.trim();
    if (!rawValue) {
      failTurn('Keine Antwort rechtzeitig.');
      return;
    }

    input.value = '';
    const round = currentRound();
    const normalized = normalizePartyText(rawValue);

    if (currentSeen.has(normalized)) {
      failTurn('Schon genannt.');
      return;
    }

    if (round.accepted.has(normalized)) {
      registerSuccess(findKnownWord(round, normalized), normalized.length >= 6 ? 2 : 1);
      return;
    }

    if (config.custom.allowNearRhymes && round.nearAccepted.has(normalized)) {
      registerSuccess(findKnownWord(round, normalized), 1, 'duplicate');
      return;
    }

    showHostDecision(rawValue);
  }

  function startTurnTimer() {
    cleanup();
    timeLeft = config.custom.turnLimitSec;
    updateTurnUi(`Reim liefern fuer ${currentRound().seed}.`, 'neutral');
    turnTimerId = setInterval(() => {
      timeLeft -= 1;
      updateTurnUi(`Reim liefern fuer ${currentRound().seed}.`, 'neutral');
      if (timeLeft <= 3) {
        SoundManager.play('tick');
      }
      if (timeLeft <= 0) {
        failTurn('Zeit abgelaufen.');
      }
    }, 1000);
    container.querySelector('#reim-party-input')?.focus();
  }

  function renderBoard(message = '', tone = 'neutral') {
    const round = currentRound();
    const player = currentPlayer();
    setRoundState(container, 'active');
    container.innerHTML = `
      <div class="showcase-shell reim-battle-shell">
        <div class="showcase-stage">
          <div class="showcase-progress">Runde ${roundIndex + 1} / ${rounds.length}</div>
          ${renderPlayerRibbon(players, player.id, scoreMap)}
          <div class="showcase-badge-row">
            ${renderPartyMeta(config, [`Startwort ${round.seed}`])}
          </div>
          <div class="reim-seed-card">
            <span>Aktive Person</span>
            <strong>${player.name}</strong>
            <p>Liefer jetzt einen neuen Reim auf <strong>${round.seed}</strong>.</p>
          </div>
          <div class="word-stau-entry">
            <input id="reim-party-input" class="solve-input" type="text" autocomplete="off" spellcheck="false" placeholder="Reim fuer ${round.seed}...">
            <button class="btn btn-primary" id="reim-party-submit" type="button">Antwort sichern</button>
          </div>
          <div class="word-stau-hud">
            <div class="word-stau-stat"><span>Turn-Timer</span><strong id="reim-party-timer">${config.custom.turnLimitSec}s</strong></div>
            <div class="word-stau-stat"><span>Regel</span><strong>${config.custom.suddenDeath ? 'Sudden Death' : 'Punkte'}</strong></div>
            <div class="word-stau-stat"><span>${player.name}</span><strong>${livesMap[player.id] || 0} Leben</strong></div>
          </div>
          <div id="reim-party-status" class="word-stau-summary tone-${tone}">${message || 'Neue Reime, keine Dopplung, kein Zucken.'}</div>
          <div id="reim-host-panel"></div>
          <div id="reim-party-log" class="word-stau-lane"></div>
          ${renderScoreboard(players, scoreMap)}
        </div>
      </div>
    `;

    container.querySelector('#reim-party-submit').addEventListener('click', submitTurn);
    container.querySelector('#reim-party-input').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submitTurn();
      }
    });

    startTurnTimer();
  }

  renderBoard();
}
