import { SoundManager } from '../ui/sound-manager.js?v=game-feel-8';

const CATEGORY_BANK = {
  nomen: [
    { label: 'Tiere', accepted: ['Hund', 'Katze', 'Pferd', 'Biber', 'Loewe', 'Hase', 'Fuchs', 'Ziege'] },
    { label: 'Dinge im Schulranzen', accepted: ['Heft', 'Stift', 'Radiergummi', 'Lineal', 'Buch', 'Mappe', 'Schere'] }
  ],
  verben: [
    { label: 'Bewegungsverben', accepted: ['laufen', 'springen', 'rennen', 'kriechen', 'huepfen', 'tanzen', 'klettern'] },
    { label: 'Leise Aktionen', accepted: ['fluestern', 'schleichen', 'lauschen', 'tippen', 'blinzeln', 'winken'] }
  ],
  adjektive: [
    { label: 'Gefuehle', accepted: ['froh', 'traurig', 'mutig', 'nervoes', 'stolz', 'ruhig', 'aufgeregt'] },
    { label: 'Wetter', accepted: ['windig', 'sonnig', 'neblig', 'regnerisch', 'warm', 'kalt'] }
  ],
  lesen: [
    { label: 'Woerter aus Abenteuerbuechern', accepted: ['Schatz', 'Karte', 'Burg', 'Drache', 'Fluss', 'Portal', 'Bruecke'] },
    { label: 'Woerter aus Maerchen', accepted: ['Krone', 'Hexe', 'Spiegel', 'Schloss', 'Kutsche', 'Wald', 'Zauber'] }
  ],
  wortschatz: [
    { label: 'Alles zum Camping', accepted: ['Zelt', 'Lampe', 'Rucksack', 'Feuer', 'Karte', 'Seil', 'Tasse', 'Schlafsack'] },
    { label: 'Dinge in der Kueche', accepted: ['Topf', 'Pfanne', 'Loeffel', 'Teller', 'Tasse', 'Mixer', 'Schale'] }
  ],
  _default: [
    { label: 'Nomen im Alltag', accepted: ['Haus', 'Auto', 'Baum', 'Lampe', 'Tasche', 'Ball', 'Fenster', 'Stuhl'] },
    { label: 'Verben fuer Bewegung', accepted: ['laufen', 'springen', 'drehen', 'schieben', 'tanzen', 'gehen'] }
  ]
};

function normalize(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

function chooseCategory(topic) {
  const pool = CATEGORY_BANK[topic] || CATEGORY_BANK._default;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const WortStau = {
  id: 'wort-stau',
  name_de: 'Wort-Stau',
  description: 'Unter Zeitdruck moeglichst viele saubere Treffer in einer Kategorie liefern.',
  topics: ['wortschatz', 'lesen', 'nomen', 'verben', 'adjektive'],
  supportsDirectPlay: true,
  usesInternalTimer: true,

  setup(container, task, onComplete) {
    const category = chooseCategory(task.topic);
    const accepted = new Map(
      category.accepted.map((word) => [normalize(word), word])
    );

    const roundDuration = Math.max(task.timerSeconds || 45, 20);
    const pauseThreshold = 3500;
    let timeLeft = roundDuration;
    let score = 0;
    let duplicatePenalties = 0;
    let pausePenalties = 0;
    let invalidWords = 0;
    let playing = false;
    let timerId = null;
    let heartbeatId = null;
    let lastActionAt = 0;
    let lastPausePenaltyAt = 0;
    const seen = new Set();

    function cleanup() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      if (heartbeatId) {
        clearInterval(heartbeatId);
        heartbeatId = null;
      }
    }

    function updateSummary(message, tone = 'neutral') {
      const summary = container.querySelector('#wort-stau-summary');
      if (!summary) {
        return;
      }
      summary.className = `word-stau-summary tone-${tone}`;
      summary.textContent = message;
    }

    function updateHud() {
      const timerEl = container.querySelector('#wort-stau-timer');
      const scoreEl = container.querySelector('#wort-stau-score');
      const duplicateEl = container.querySelector('#wort-stau-duplicates');
      const pauseEl = container.querySelector('#wort-stau-pauses');
      const stressEl = container.querySelector('#wort-stau-stress');
      const idleMs = Date.now() - lastActionAt;
      const stress = Math.min(100, Math.round((idleMs / pauseThreshold) * 100));

      if (timerEl) timerEl.textContent = `${timeLeft}s`;
      if (scoreEl) scoreEl.textContent = String(score);
      if (duplicateEl) duplicateEl.textContent = String(duplicatePenalties);
      if (pauseEl) pauseEl.textContent = String(pausePenalties);
      if (stressEl) stressEl.style.width = `${stress}%`;
    }

    function addWordChip(word, tone = 'good') {
      const lane = container.querySelector('#wort-stau-lane');
      const chip = document.createElement('div');
      chip.className = `word-stau-chip tone-${tone}`;
      chip.textContent = word;
      lane.prepend(chip);
    }

    function finishGame() {
      cleanup();
      playing = false;
      const rawNet = score - (pausePenalties * 2) - duplicatePenalties;
      const netScore = Math.max(rawNet, 0);
      const percentage = Math.max(0, Math.min(100, Math.round((netScore / 8) * 100)));
      onComplete({
        correct: percentage >= 75,
        partial: percentage >= 45 && percentage < 75,
        score: percentage,
        details: {
          score,
          duplicatePenalties,
          pausePenalties,
          invalidWords
        }
      });
    }

    function startGame() {
      playing = true;
      timeLeft = roundDuration;
      lastActionAt = Date.now();
      lastPausePenaltyAt = Date.now();
      updateHud();
      updateSummary('Los. Kein Stillstand, keine Wiederholung.', 'neutral');
      SoundManager.play('launch');

      timerId = setInterval(() => {
        timeLeft -= 1;
        updateHud();
        if (timeLeft <= 5) {
          SoundManager.play('tick');
        }
        if (timeLeft <= 0) {
          finishGame();
        }
      }, 1000);

      heartbeatId = setInterval(() => {
        if (!playing) {
          return;
        }
        const now = Date.now();
        if (now - lastActionAt >= pauseThreshold && now - lastPausePenaltyAt >= pauseThreshold) {
          pausePenalties += 1;
          score = Math.max(score - 2, 0);
          lastPausePenaltyAt = now;
          updateHud();
          updateSummary('Zu lange Pause. Stress-Level steigt.', 'warn');
          container.querySelector('.word-stau-shell')?.classList.add('is-warning');
          SoundManager.play('error');
          setTimeout(() => {
            container.querySelector('.word-stau-shell')?.classList.remove('is-warning');
          }, 420);
        } else {
          updateHud();
        }
      }, 250);

      container.querySelector('#wort-stau-input')?.focus();
    }

    function submitWord() {
      if (!playing) {
        return;
      }

      const input = container.querySelector('#wort-stau-input');
      const rawValue = input.value.trim();
      if (!rawValue) {
        updateSummary('Tippe ein Wort, sonst zaehlt die Pause.', 'warn');
        return;
      }

      const word = normalize(rawValue);
      lastActionAt = Date.now();
      updateHud();
      input.value = '';

      if (seen.has(word)) {
        duplicatePenalties += 1;
        score = Math.max(score - 1, 0);
        addWordChip(rawValue, 'duplicate');
        updateSummary('Doppelt. Minuspunkt.', 'warn');
        SoundManager.play('error');
        return;
      }

      if (accepted.has(word)) {
        seen.add(word);
        score += 1;
        addWordChip(accepted.get(word), 'good');
        updateSummary('Treffer. Weiter, weiter.', 'good');
        SoundManager.play('success');
        return;
      }

      invalidWords += 1;
      addWordChip(rawValue, 'miss');
      updateSummary('Das passt nicht sauber zur Kategorie.', 'fail');
      SoundManager.play('tick');
    }

    container.innerHTML = `
      <div class="word-stau-shell">
        <div class="word-stau-top">
          <div>
            <div class="premium-kicker">Final Design</div>
            <h3 class="glow-title showcase-title">Wort-Stau</h3>
            <p class="showcase-secondary">Kategorie: <strong>${category.label}</strong></p>
          </div>
          <button class="btn btn-primary" id="wort-stau-start" type="button">Stau starten</button>
        </div>

        <div class="word-stau-hud">
          <div class="word-stau-stat"><span>Timer</span><strong id="wort-stau-timer">${roundDuration}s</strong></div>
          <div class="word-stau-stat"><span>Punkte</span><strong id="wort-stau-score">0</strong></div>
          <div class="word-stau-stat"><span>Duplikate</span><strong id="wort-stau-duplicates">0</strong></div>
          <div class="word-stau-stat"><span>Pausen</span><strong id="wort-stau-pauses">0</strong></div>
        </div>

        <div class="word-stau-track">
          <div class="word-stau-track-label">Stress-Level</div>
          <div class="word-stau-track-bar">
            <div class="word-stau-track-fill" id="wort-stau-stress"></div>
          </div>
        </div>

        <div class="word-stau-entry">
          <input id="wort-stau-input" class="solve-input" type="text" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="Naechstes Wort...">
          <button class="btn btn-secondary" id="wort-stau-submit" type="button">Wort rein</button>
        </div>

        <div id="wort-stau-summary" class="word-stau-summary tone-neutral">
          Nicht verstummen. Keine Wiederholungen.
        </div>

        <div id="wort-stau-lane" class="word-stau-lane"></div>
      </div>
    `;

    container.querySelector('#wort-stau-start').addEventListener('click', () => {
      container.querySelector('#wort-stau-start').disabled = true;
      startGame();
    });
    container.querySelector('#wort-stau-submit').addEventListener('click', submitWord);
    container.querySelector('#wort-stau-input').addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submitWord();
      }
    });
  }
};
