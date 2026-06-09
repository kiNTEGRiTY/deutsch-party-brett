import { SoundManager } from '../ui/sound-manager.js?v=field-route-fullscreen-31';

const DIRECT_DEFAULTS = {
  solo_arcade: {
    timeLimitSec: 42,
    scoringMode: 'arcade'
  },
  turn_based: {
    timeLimitSec: 32,
    scoringMode: 'rounds'
  }
};

const GAMES = {
  artikel: [
    { prompt: 'Baum', answer: 'der', options: ['der', 'die', 'das'] },
    { prompt: 'Blume', answer: 'die', options: ['der', 'die', 'das'] },
    { prompt: 'Fenster', answer: 'das', options: ['der', 'die', 'das'] },
    { prompt: 'Wolke', answer: 'die', options: ['der', 'die', 'das'] },
    { prompt: 'Bleistift', answer: 'der', options: ['der', 'die', 'das'] }
  ],
  silben: [
    { prompt: 'Schmetterling', answer: '3', options: ['2', '3', '4'] },
    { prompt: 'Papier', answer: '2', options: ['1', '2', '3'] },
    { prompt: 'Wortwiese', answer: '3', options: ['2', '3', '4'] },
    { prompt: 'Tafel', answer: '2', options: ['1', '2', '3'] }
  ],
  reime: [
    { prompt: 'Haus', answer: 'Maus', options: ['Maus', 'Baum', 'Licht', 'Buch'] },
    { prompt: 'See', answer: 'Klee', options: ['Klee', 'Stuhl', 'Hand', 'Wort'] },
    { prompt: 'Nacht', answer: 'lacht', options: ['lacht', 'geht', 'rot', 'Berg'] },
    { prompt: 'Stein', answer: 'klein', options: ['klein', 'schnell', 'Wasser', 'laut'] }
  ],
  wortarten: [
    { prompt: 'springen', answer: 'Verb', options: ['Nomen', 'Verb', 'Adjektiv'] },
    { prompt: 'freundlich', answer: 'Adjektiv', options: ['Nomen', 'Verb', 'Adjektiv'] },
    { prompt: 'die Laterne', answer: 'Nomen', options: ['Nomen', 'Verb', 'Adjektiv'] },
    { prompt: 'leuchten', answer: 'Verb', options: ['Nomen', 'Verb', 'Adjektiv'] }
  ],
  fehler: [
    { prompt: 'Der hund bellt laut.', answer: 'Der Hund bellt laut.', options: ['Der Hund bellt laut.', 'Der hund bellt Laut.', 'der Hund bellt laut.'] },
    { prompt: 'Wir gehen in den garten.', answer: 'Wir gehen in den Garten.', options: ['Wir gehen in den Garten.', 'wir gehen in den Garten.', 'Wir gehen in den garten.'] },
    { prompt: 'Mila schreibt ein brief.', answer: 'Mila schreibt einen Brief.', options: ['Mila schreibt einen Brief.', 'Mila schreiben einen Brief.', 'Mila schreibt ein Brief.'] }
  ],
  wortfunkeln: [
    { prompt: 'schnell', answer: 'flink', options: ['flink', 'leise', 'rund', 'hell'] },
    { prompt: 'fröhlich', answer: 'heiter', options: ['heiter', 'hart', 'kurz', 'kalt'] },
    { prompt: 'groß', answer: 'riesig', options: ['riesig', 'trocken', 'weich', 'still'] },
    { prompt: 'reden', answer: 'sprechen', options: ['sprechen', 'liegen', 'malen', 'fallen'] }
  ],
  verben: [
    { prompt: 'Heute ___ wir ein Spiel.', answer: 'spielen', options: ['spielen', 'spielte', 'spielst'] },
    { prompt: 'Gestern ___ ich ein Buch.', answer: 'las', options: ['lese', 'las', 'liest'] },
    { prompt: 'Morgen ___ du früh auf.', answer: 'stehst', options: ['stand', 'stehst', 'stehen'] },
    { prompt: 'Die Kinder ___ im Hof.', answer: 'rennen', options: ['rennt', 'rennen', 'rannte'] }
  ]
};

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

function renderChoiceScene(container, definition, item, onComplete) {
  const options = shuffle(item.options);
  container.innerHTML = `
    <div class="variety-game variety-game--${definition.tone}">
      <div class="variety-scene">
        <div class="variety-kicker">${escapeHtml(definition.kicker)}</div>
        <h3>${escapeHtml(definition.headline)}</h3>
        <p>${escapeHtml(definition.instruction)}</p>
        <div class="variety-prompt">${escapeHtml(item.prompt)}</div>
        <div class="variety-choice-grid">
          ${options.map((option) => `
            <button class="variety-choice" type="button" data-answer="${escapeHtml(option)}">
              <span>${escapeHtml(option)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('.variety-choice').forEach((button) => {
    button.addEventListener('click', () => {
      const isCorrect = button.dataset.answer === item.answer;
      container.querySelectorAll('.variety-choice').forEach((entry) => {
        entry.disabled = true;
        if (entry.dataset.answer === item.answer) {
          entry.classList.add('is-correct');
        }
      });
      button.classList.add(isCorrect ? 'is-hit' : 'is-miss');
      SoundManager.play(isCorrect ? 'success' : 'error');
      setTimeout(() => onComplete({
        correct: isCorrect,
        partial: false,
        score: isCorrect ? 100 : 0
      }), isCorrect ? 820 : 1150);
    });
  });
}

function createChoiceGame(definition) {
  return {
    id: definition.id,
    name_de: definition.name,
    description: definition.description,
    topics: definition.topics,
    supportsDirectPlay: true,
    directPlayDefaults: DIRECT_DEFAULTS,
    defaultRounds: 4,

    setup(container, task, onComplete) {
      SoundManager.play('gameStart');
      const item = pick(definition.items);
      renderChoiceScene(container, definition, item, onComplete);
    }
  };
}

export const ArtikelAtelier = createChoiceGame({
  id: 'artikel-atelier',
  name: 'Artikel-Atelier',
  description: 'Der, die oder das als schnelle Atelier-Entscheidung.',
  topics: ['artikel', 'nomen'],
  tone: 'ochre',
  kicker: 'Atelier',
  headline: 'Welcher Artikel gehört dazu?',
  instruction: 'Wähle den passenden Artikel, bevor die Farbe trocknet.',
  items: GAMES.artikel
});

export const Silbenstrom = createChoiceGame({
  id: 'silbenstrom',
  name: 'Silbenstrom',
  description: 'Silben hören, zählen und über den Fluss setzen.',
  topics: ['silben', 'konzentration'],
  tone: 'blue',
  kicker: 'Flussrunde',
  headline: 'Wie viele Silben hörst du?',
  instruction: 'Sprich das Wort leise mit und tippe die Anzahl.',
  items: GAMES.silben
});

export const Reimwerk = createChoiceGame({
  id: 'reimwerk',
  name: 'Reimwerk',
  description: 'Klangpaare finden mit Werkstatt-Gefühl.',
  topics: ['reime', 'wortschatz'],
  tone: 'green',
  kicker: 'Klangwerk',
  headline: 'Welches Wort reimt sich?',
  instruction: 'Finde das passende Klangstück.',
  items: GAMES.reime
});

export const WortartenOrchester = createChoiceGame({
  id: 'wortarten-orchester',
  name: 'Wortarten-Orchester',
  description: 'Nomen, Verben und Adjektive als Instrumentengruppen erkennen.',
  topics: ['wortarten', 'nomen', 'verben', 'adjektive'],
  tone: 'red',
  kicker: 'Orchester',
  headline: 'Welche Wortart spielt hier?',
  instruction: 'Ordne das Wort der richtigen Gruppe zu.',
  items: GAMES.wortarten
});

export const Fehlerlupe = createChoiceGame({
  id: 'fehlerlupe',
  name: 'Fehlerlupe',
  description: 'Den sauber geschriebenen Satz unter der Lupe finden.',
  topics: ['rechtschreibung', 'fehlerkorrektur', 'lesen'],
  tone: 'violet',
  kicker: 'Detektivblatt',
  headline: 'Welche Fassung ist richtig?',
  instruction: 'Vergleiche genau und wähle den sauberen Satz.',
  items: GAMES.fehler
});

export const Wortfunkeln = createChoiceGame({
  id: 'wortfunkeln',
  name: 'Wortfunkeln',
  description: 'Treffsichere Synonyme als funkelnde Wortwahl.',
  topics: ['wortschatz', 'lesen'],
  tone: 'gold',
  kicker: 'Wortschatz',
  headline: 'Welches Wort passt am besten?',
  instruction: 'Suche ein Wort mit ähnlicher Bedeutung.',
  items: GAMES.wortfunkeln
});

export const VerbTakt = createChoiceGame({
  id: 'verb-takt',
  name: 'Verb-Takt',
  description: 'Verbformen rhythmisch in Satzlücken setzen.',
  topics: ['verben', 'zeitformen', 'grammatik'],
  tone: 'blue',
  kicker: 'Taktprobe',
  headline: 'Welche Verbform sitzt im Takt?',
  instruction: 'Lies den Satz und wähle die passende Form.',
  items: GAMES.verben
});

export const SatzKompass = {
  id: 'satz-kompass',
  name_de: 'Satz-Kompass',
  description: 'Wörter Schritt für Schritt zum Satzpfad ordnen.',
  topics: ['satzbau', 'lesen', 'grammatik'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const sentence = pick([
      ['Der', 'kleine', 'Vogel', 'singt', 'laut'],
      ['Mila', 'findet', 'eine', 'rote', 'Feder'],
      ['Wir', 'bauen', 'einen', 'schönen', 'Satz'],
      ['Am', 'Fluss', 'liegt', 'ein', 'heller', 'Stein']
    ]);
    let index = 0;
    const shuffled = shuffle(sentence);

    container.innerHTML = `
      <div class="variety-game variety-game--compass">
        <div class="variety-scene">
          <div class="variety-kicker">Kompass</div>
          <h3>Baue den Satz in der richtigen Reihenfolge</h3>
          <p>Tippe immer das nächste Wort des Satzes.</p>
          <div class="variety-sentence-track">
            ${sentence.map((_, slotIndex) => `<span data-slot="${slotIndex}"></span>`).join('')}
          </div>
          <div class="variety-word-cloud">
            ${shuffled.map((word) => `
              <button class="variety-word" type="button" data-word="${escapeHtml(word)}">${escapeHtml(word)}</button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.variety-word').forEach((button) => {
      button.addEventListener('click', () => {
        const expected = sentence[index];
        const isCorrect = button.dataset.word === expected;
        if (!isCorrect) {
          button.classList.add('is-miss');
          SoundManager.play('error');
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
        SoundManager.play('moveStep');
        index += 1;

        if (index >= sentence.length) {
          SoundManager.play('success');
          setTimeout(() => onComplete({ correct: true, score: 100 }), 850);
        }
      });
    });
  }
};
