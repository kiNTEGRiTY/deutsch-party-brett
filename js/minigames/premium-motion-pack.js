import { SoundManager } from '../ui/sound-manager.js?v=field-first-board-37';

const DIRECT_DEFAULTS = {
  solo_arcade: {
    timeLimitSec: 55,
    scoringMode: 'arcade'
  },
  turn_based: {
    timeLimitSec: 40,
    scoringMode: 'rounds'
  }
};

const SYLLABLE_ITEMS = [
  { word: 'Schmetterling', beats: 3 },
  { word: 'Wortwiese', beats: 3 },
  { word: 'Papier', beats: 2 },
  { word: 'Laterne', beats: 3 },
  { word: 'Tafel', beats: 2 },
  { word: 'Abenteuer', beats: 4 }
];

const MAGNET_WORDS = ['Feder', 'Wiese', 'Blume', 'Karte', 'Brücke', 'Wolke'];

const SORT_ITEMS = [
  { word: 'laufen', type: 'Verb' },
  { word: 'mutig', type: 'Adjektiv' },
  { word: 'der Bach', type: 'Nomen' },
  { word: 'leise', type: 'Adjektiv' },
  { word: 'malen', type: 'Verb' },
  { word: 'die Laterne', type: 'Nomen' },
  { word: 'funkeln', type: 'Verb' }
];

const RHYME_PAIRS = [
  ['Haus', 'Maus'],
  ['See', 'Klee'],
  ['Stein', 'klein'],
  ['Nacht', 'lacht'],
  ['Boot', 'rot'],
  ['Hand', 'Sand']
];

const PATCH_SENTENCES = [
  {
    before: 'Der kleine Fuchs',
    after: 'durch den Wald.',
    answer: 'springt',
    options: ['springt', 'springen', 'sprangst']
  },
  {
    before: 'Mila legt die Feder',
    after: 'auf den Tisch.',
    answer: 'vorsichtig',
    options: ['vorsichtig', 'runde', 'gestern']
  },
  {
    before: 'Wir bauen',
    after: 'Satz.',
    answer: 'einen klaren',
    options: ['einen klaren', 'ein klare', 'eine klares']
  },
  {
    before: 'Am Himmel ziehen',
    after: 'vorbei.',
    answer: 'helle Wolken',
    options: ['helle Wolken', 'heller Wolken', 'helles Wolken']
  }
];

function shuffle(entries) {
  return [...entries].sort(() => Math.random() - 0.5);
}

function pick(entries) {
  return entries[Math.floor(Math.random() * entries.length)];
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function complete(onComplete, result, delay = 720) {
  setTimeout(() => onComplete(result), delay);
}

function renderScene(container, { tone, kicker, title, text, body }) {
  container.innerHTML = `
    <div class="variety-game variety-game--${escapeHtml(tone)} motion-game">
      <div class="variety-scene motion-scene">
        <div class="variety-kicker">${escapeHtml(kicker)}</div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(text)}</p>
        ${body}
      </div>
    </div>
  `;
}

export const SilbenTrommel = {
  id: 'silben-trommel',
  name_de: 'Silben-Trommel',
  description: 'Silben als echte Trommelschläge zählen.',
  topics: ['silben', 'konzentration'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const item = pick(SYLLABLE_ITEMS);
    let count = 0;
    const maxBeats = 5;

    const renderBeats = () => Array.from({ length: maxBeats }, (_, index) => `
      <span class="motion-beat ${index < count ? 'is-lit' : ''}" data-beat="${index + 1}"></span>
    `).join('');

    const update = () => {
      const track = container.querySelector('.motion-beat-track');
      if (track) {
        track.innerHTML = renderBeats();
      }
      const counter = container.querySelector('[data-count]');
      if (counter) {
        counter.textContent = `${count}`;
      }
    };

    renderScene(container, {
      tone: 'blue',
      kicker: 'Trommelrunde',
      title: 'Klopfe jede Silbe',
      text: 'Sprich das Wort im Kopf und trommle die Silben mit.',
      body: `
        <div class="motion-prompt-card">
          <span>Wort</span>
          <strong>${escapeHtml(item.word)}</strong>
        </div>
        <div class="motion-beat-track">${renderBeats()}</div>
        <div class="motion-drum-row">
          <button class="motion-drum-pad" type="button">
            <span data-count>0</span>
            <strong>Trommeln</strong>
          </button>
          <div class="motion-actions">
            <button class="motion-light-btn" type="button" data-reset>Zurück</button>
            <button class="motion-primary-btn" type="button" data-check>Prüfen</button>
          </div>
        </div>
      `
    });

    container.querySelector('.motion-drum-pad')?.addEventListener('click', () => {
      count = count >= maxBeats ? 1 : count + 1;
      SoundManager.play('woodBlock', { intensity: 0.8 + count * 0.08 });
      update();
    });

    container.querySelector('[data-reset]')?.addEventListener('click', () => {
      count = 0;
      SoundManager.play('pageFlip');
      update();
    });

    container.querySelector('[data-check]')?.addEventListener('click', () => {
      const correct = count === item.beats;
      SoundManager.play(correct ? 'success' : 'error');
      container.querySelector('.motion-drum-pad')?.classList.add(correct ? 'is-hit' : 'is-miss');
      complete(onComplete, { correct, score: correct ? 100 : 0 }, correct ? 760 : 1050);
    });
  }
};

export const BuchstabenMagneten = {
  id: 'buchstaben-magneten',
  name_de: 'Buchstaben-Magneten',
  description: 'Buchstaben magnetisch in die richtige Reihenfolge ziehen.',
  topics: ['rechtschreibung', 'alphabet', 'wortbildung'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const word = pick(MAGNET_WORDS);
    const letters = word.split('');
    const shuffled = shuffle(letters.map((letter, index) => ({ letter, key: `${letter}-${index}` })));
    let index = 0;

    renderScene(container, {
      tone: 'violet',
      kicker: 'Magnettafel',
      title: 'Baue das Wort',
      text: 'Tippe die Buchstaben in der richtigen Reihenfolge an.',
      body: `
        <div class="motion-letter-slots">
          ${letters.map((_, slotIndex) => `<span data-slot="${slotIndex}"></span>`).join('')}
        </div>
        <div class="motion-letter-cloud">
          ${shuffled.map((entry) => `
            <button class="motion-letter" type="button" data-letter="${escapeHtml(entry.letter)}" data-key="${escapeHtml(entry.key)}">
              ${escapeHtml(entry.letter)}
            </button>
          `).join('')}
        </div>
      `
    });

    container.querySelectorAll('.motion-letter').forEach((button) => {
      button.addEventListener('click', () => {
        const expected = letters[index];
        const correct = button.dataset.letter === expected;
        if (!correct) {
          button.classList.add('is-miss');
          SoundManager.play('failSoft');
          setTimeout(() => button.classList.remove('is-miss'), 420);
          return;
        }

        const slot = container.querySelector(`[data-slot="${index}"]`);
        if (slot) {
          slot.textContent = expected;
          slot.classList.add('is-filled');
        }
        button.disabled = true;
        button.classList.add('is-hit');
        SoundManager.play('pop');
        index += 1;

        if (index >= letters.length) {
          SoundManager.play('success');
          complete(onComplete, { correct: true, score: 100 });
        }
      });
    });
  }
};

export const WortartenBand = {
  id: 'wortarten-band',
  name_de: 'Wortarten-Band',
  description: 'Ein laufendes Sortierband für Nomen, Verben und Adjektive.',
  topics: ['wortarten', 'nomen', 'verben', 'adjektive'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const items = shuffle(SORT_ITEMS).slice(0, 5);
    let current = 0;
    let score = 0;

    const renderCurrent = () => {
      const item = items[current];
      const card = container.querySelector('.motion-sort-card');
      if (card && item) {
        card.textContent = item.word;
        card.classList.remove('is-cleared', 'is-miss');
      }
      container.querySelectorAll('.motion-progress span').forEach((dot, index) => {
        dot.classList.toggle('is-done', index < current);
      });
    };

    renderScene(container, {
      tone: 'red',
      kicker: 'Sortierband',
      title: 'Wohin gehört das Wort?',
      text: 'Das Band läuft weiter, wenn die Wortart stimmt.',
      body: `
        <div class="motion-progress">${items.map(() => '<span></span>').join('')}</div>
        <div class="motion-conveyor">
          <div class="motion-sort-card">${escapeHtml(items[0].word)}</div>
        </div>
        <div class="motion-sort-options">
          ${['Nomen', 'Verb', 'Adjektiv'].map((type) => `
            <button class="motion-category" type="button" data-type="${type}">${type}</button>
          `).join('')}
        </div>
      `
    });

    container.querySelectorAll('.motion-category').forEach((button) => {
      button.addEventListener('click', () => {
        const item = items[current];
        if (!item) {
          return;
        }
        const correct = button.dataset.type === item.type;
        if (!correct) {
          button.classList.add('is-miss');
          container.querySelector('.motion-sort-card')?.classList.add('is-miss');
          SoundManager.play('error');
          setTimeout(() => {
            button.classList.remove('is-miss');
            container.querySelector('.motion-sort-card')?.classList.remove('is-miss');
          }, 420);
          return;
        }

        score += 20;
        SoundManager.play('stamp');
        container.querySelector('.motion-sort-card')?.classList.add('is-cleared');
        current += 1;
        if (current >= items.length) {
          SoundManager.play('success');
          complete(onComplete, { correct: true, score }, 820);
          return;
        }
        setTimeout(renderCurrent, 360);
      });
    });
  }
};

export const ReimMemoryAquarell = {
  id: 'reim-memory-aquarell',
  name_de: 'Reim-Memory',
  description: 'Reimpaare als kleine Tischkarten aufdecken.',
  topics: ['reime', 'wortschatz', 'konzentration'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 3,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const pairs = shuffle(RHYME_PAIRS).slice(0, 4);
    const cards = shuffle(pairs.flatMap((pair, pairIndex) => pair.map((word) => ({
      word,
      pair: pairIndex
    }))));
    let open = [];
    let locked = false;
    let matches = 0;

    renderScene(container, {
      tone: 'green',
      kicker: 'Tischkarten',
      title: 'Finde die Reimpaare',
      text: 'Decke zwei Karten auf. Gleicher Klang bleibt liegen.',
      body: `
        <div class="motion-memory-grid">
          ${cards.map((card, index) => `
            <button class="motion-memory-card" type="button" data-index="${index}" data-pair="${card.pair}" data-word="${escapeHtml(card.word)}">
              <span>?</span>
            </button>
          `).join('')}
        </div>
      `
    });

    container.querySelectorAll('.motion-memory-card').forEach((button) => {
      button.addEventListener('click', () => {
        if (locked || button.classList.contains('is-open') || button.classList.contains('is-matched')) {
          return;
        }
        button.classList.add('is-open');
        button.querySelector('span').textContent = button.dataset.word;
        SoundManager.play('pageFlip');
        open.push(button);

        if (open.length < 2) {
          return;
        }

        locked = true;
        const match = open[0].dataset.pair === open[1].dataset.pair;
        if (match) {
          open.forEach((card) => card.classList.add('is-matched'));
          matches += 1;
          SoundManager.play('reward');
          open = [];
          locked = false;
          if (matches >= pairs.length) {
            SoundManager.play('success');
            complete(onComplete, { correct: true, score: 100 }, 820);
          }
          return;
        }

        SoundManager.play('failSoft');
        setTimeout(() => {
          open.forEach((card) => {
            card.classList.remove('is-open');
            card.querySelector('span').textContent = '?';
          });
          open = [];
          locked = false;
        }, 720);
      });
    });
  }
};

export const SatzFlickwerk = {
  id: 'satz-flickwerk',
  name_de: 'Satz-Flickwerk',
  description: 'Den passenden Wortflicken in den Satz setzen.',
  topics: ['satzbau', 'grammatik', 'lesen'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const item = pick(PATCH_SENTENCES);
    const options = shuffle(item.options);

    renderScene(container, {
      tone: 'ochre',
      kicker: 'Flickwerk',
      title: 'Setze den Satz zusammen',
      text: 'Der richtige Flicken schließt die Lücke sauber.',
      body: `
        <div class="motion-sentence">
          <span>${escapeHtml(item.before)}</span>
          <strong>...</strong>
          <span>${escapeHtml(item.after)}</span>
        </div>
        <div class="motion-ribbon">
          ${options.map((option) => `
            <button class="motion-patch" type="button" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>
          `).join('')}
        </div>
      `
    });

    container.querySelectorAll('.motion-patch').forEach((button) => {
      button.addEventListener('click', () => {
        const correct = button.dataset.answer === item.answer;
        container.querySelectorAll('.motion-patch').forEach((entry) => {
          entry.disabled = true;
          if (entry.dataset.answer === item.answer) {
            entry.classList.add('is-correct');
          }
        });
        button.classList.add(correct ? 'is-hit' : 'is-miss');
        SoundManager.play(correct ? 'paintBloom' : 'error');
        complete(onComplete, { correct, score: correct ? 100 : 0 }, correct ? 760 : 1120);
      });
    });
  }
};
