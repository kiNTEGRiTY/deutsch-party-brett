import { SoundManager } from '../ui/sound-manager.js?v=arcade-mobile-shell-41';
import { renderCharacterAvatar } from '../ui/characters.js?v=arcade-mobile-shell-41';

const DIRECT_DEFAULTS = {
  solo_arcade: {
    timeLimitSec: 58,
    scoringMode: 'arcade'
  },
  turn_based: {
    timeLimitSec: 42,
    scoringMode: 'rounds'
  }
};

const WORD_CARD_A = '/assets/img/premium/user-reference/original-word-cards-labeled-a.jpeg';
const WORD_CARD_B = '/assets/img/premium/user-reference/original-word-cards-labeled-b.jpeg';
const OBJECT_TABLE = WORD_CARD_A;
const BOARD_TABLE = '/assets/img/premium/watercolor-premium-game-table.png';

const OBJECTS = [
  { id: 'hund', word: 'Hund', article: 'der', clue: 'Das Tier mit Halsband und wedelndem Schwanz.', image: WORD_CARD_A, x: 12, y: 16, topics: ['nomen', 'artikel', 'wortschatz'] },
  { id: 'sonne', word: 'Sonne', article: 'die', clue: 'Der gelbe Kreis mit Strahlen.', image: WORD_CARD_A, x: 37, y: 14, topics: ['nomen', 'artikel', 'wortschatz'] },
  { id: 'stift', word: 'Stift', article: 'der', clue: 'Damit kann man schreiben oder malen.', image: WORD_CARD_A, x: 62, y: 13, topics: ['nomen', 'rechtschreibung', 'wortschatz'] },
  { id: 'mann', word: 'Mann', article: 'der', clue: 'Die Figur mit Brille und blauer Kleidung.', image: WORD_CARD_A, x: 86, y: 15, topics: ['nomen', 'artikel'] },
  { id: 'schmetterling', word: 'Schmetterling', article: 'der', clue: 'Das Tier mit bunten Flügeln.', image: WORD_CARD_A, x: 12, y: 64, topics: ['nomen', 'wortschatz'] },
  { id: 'schere', word: 'Schere', article: 'die', clue: 'Damit schneidet man Papier.', image: WORD_CARD_A, x: 37, y: 64, topics: ['nomen', 'artikel'] },
  { id: 'maedchen', word: 'Mädchen', article: 'das', clue: 'Die kleine Figur mit gelbem Rock.', image: WORD_CARD_A, x: 62, y: 64, topics: ['nomen', 'artikel'] },
  { id: 'katze', word: 'Katze', article: 'die', clue: 'Das Tier mit Schnurrhaaren und langem Schwanz.', image: WORD_CARD_A, x: 86, y: 64, topics: ['nomen', 'artikel'] },
  { id: 'stuhl', word: 'Stuhl', article: 'der', clue: 'Darauf kann man sitzen.', image: WORD_CARD_B, x: 10, y: 13, topics: ['nomen', 'wortschatz'] },
  { id: 'baum', word: 'Baum', article: 'der', clue: 'Er hat Stamm, Äste und grüne Blätter.', image: WORD_CARD_B, x: 36, y: 12, topics: ['nomen', 'artikel'] },
  { id: 'junge', word: 'Junge', article: 'der', clue: 'Die kleine Figur in blauer Kleidung.', image: WORD_CARD_B, x: 62, y: 13, topics: ['nomen', 'artikel'] },
  { id: 'apfel', word: 'Apfel', article: 'der', clue: 'Das rote Obst mit grünem Blatt.', image: WORD_CARD_B, x: 87, y: 13, topics: ['nomen', 'artikel'] },
  { id: 'frau', word: 'Frau', article: 'die', clue: 'Die Figur mit rotem Rock.', image: WORD_CARD_B, x: 10, y: 63, topics: ['nomen', 'artikel'] },
  { id: 'fisch', word: 'Fisch', article: 'der', clue: 'Das Tier schwimmt im Wasser.', image: WORD_CARD_B, x: 36, y: 63, topics: ['nomen', 'wortschatz'] },
  { id: 'blume', word: 'Blume', article: 'die', clue: 'Sie hat eine rote Blüte und grüne Blätter.', image: WORD_CARD_B, x: 62, y: 63, topics: ['nomen', 'artikel'] },
  { id: 'haus', word: 'Haus', article: 'das', clue: 'Darin kann eine Familie wohnen.', image: WORD_CARD_B, x: 87, y: 63, topics: ['nomen', 'artikel'] }
];

const STORY_SETS = [
  {
    title: 'Die Kartenreihe am Tisch',
    image: WORD_CARD_A,
    panels: [
      { text: 'Der Hund sitzt bereit.', crop: '12% 16%' },
      { text: 'Die Sonne scheint hell.', crop: '37% 14%' },
      { text: 'Der Stift schreibt ein Wort.', crop: '62% 13%' },
      { text: 'Die Katze schaut zu.', crop: '86% 64%' }
    ]
  },
  {
    title: 'Im kleinen Garten',
    image: WORD_CARD_B,
    panels: [
      { text: 'Der Baum steht in der Mitte.', crop: '36% 12%' },
      { text: 'Der Apfel ist rot.', crop: '87% 13%' },
      { text: 'Die Blume wächst.', crop: '62% 63%' },
      { text: 'Das Haus ist am Ziel.', crop: '87% 63%' }
    ]
  },
  {
    title: 'Wer macht was?',
    image: WORD_CARD_B,
    panels: [
      { text: 'Die Frau kommt an.', crop: '10% 63%' },
      { text: 'Der Junge zeigt nach vorn.', crop: '62% 13%' },
      { text: 'Der Fisch schwimmt.', crop: '36% 63%' },
      { text: 'Der Stuhl bleibt frei.', crop: '10% 13%' }
    ]
  }
];

const COMPOUNDS = [
  { left: 'Papier', right: 'Boot', answer: 'Papierboot', meaning: 'ein kleines gefaltetes Boot' },
  { left: 'Haus', right: 'Tür', answer: 'Haustür', meaning: 'die Tür eines Hauses' },
  { left: 'Blumen', right: 'Vase', answer: 'Blumenvase', meaning: 'ein Gefäß für Blumen' },
  { left: 'Schreib', right: 'Tisch', answer: 'Schreibtisch', meaning: 'ein Tisch zum Arbeiten' },
  { left: 'Schlüssel', right: 'Bund', answer: 'Schlüsselbund', meaning: 'mehrere Schlüssel zusammen' },
  { left: 'Wasser', right: 'Farbe', answer: 'Wasserfarbe', meaning: 'Farbe zum Malen mit Wasser' },
  { left: 'Buch', right: 'Seite', answer: 'Buchseite', meaning: 'ein Blatt in einem Buch' },
  { left: 'Spiel', right: 'Figur', answer: 'Spielfigur', meaning: 'eine Figur auf dem Brett' }
];

const DIALOGUES = [
  {
    characterIndex: 7,
    role: 'Erzählerin',
    line: 'Der Weg führt über den Fluss. Was sagt die Figur passend?',
    answer: 'Ich gehe vorsichtig über die Brücke.',
    options: ['Ich gehe vorsichtig über die Brücke.', 'Gestern sind der Brücke laut.', 'Die Brücke gehen schnell.']
  },
  {
    characterIndex: 1,
    role: 'Forscher',
    line: 'Die Figur findet eine blaue Feder. Welche Beschreibung passt?',
    answer: 'Die Feder ist leicht und blau.',
    options: ['Die Feder ist leicht und blau.', 'Der Feder sind laut.', 'Die Feder springt gestern.']
  },
  {
    characterIndex: 4,
    role: 'Werkstattkind',
    line: 'Im Atelier trocknet die Farbe. Welche Bitte ist freundlich?',
    answer: 'Kannst du mir bitte den Pinsel geben?',
    options: ['Kannst du mir bitte den Pinsel geben?', 'Gib Pinsel jetzt sofort da!', 'Der Pinsel bitte gehen.']
  },
  {
    characterIndex: 8,
    role: 'Zeitwächter',
    line: 'Die Uhr zeigt den Start. Welche Verbform passt?',
    answer: 'Wir beginnen jetzt.',
    options: ['Wir beginnen jetzt.', 'Wir begann jetzt.', 'Wir beginnst jetzt.']
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

function complete(onComplete, correct, delay = 780, cleanup = null) {
  const timerId = setTimeout(() => onComplete({
    correct,
    partial: false,
    score: correct ? 100 : 0
  }), delay);
  if (cleanup?.timer) {
    cleanup.timer(timerId);
  }
}

function makeInteractionCleanup() {
  const listeners = [];
  const timers = [];
  return {
    on(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      listeners.push([target, type, handler, options]);
    },
    timer(id) {
      timers.push(id);
      return id;
    },
    clear() {
      listeners.forEach(([target, type, handler, options]) => target.removeEventListener(type, handler, options));
      timers.forEach((id) => clearTimeout(id));
      listeners.length = 0;
      timers.length = 0;
    }
  };
}

function scene(container, { tone = 'green', kicker, title, text, image = OBJECT_TABLE, body }) {
  container.innerHTML = `
    <div class="premium-content-game premium-content-game--${escapeHtml(tone)}">
      <div class="premium-content-scene" style="--content-image: url('${escapeHtml(image)}')">
        <div class="premium-content-copy">
          <span>${escapeHtml(kicker)}</span>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(text)}</p>
        </div>
        ${body}
      </div>
    </div>
  `;
}

function bindChoice(container, selector, answer, onComplete, cleanup = null) {
  container.querySelectorAll(selector).forEach((button) => {
    const handleClick = () => {
      const correct = button.dataset.answer === answer;
      container.querySelectorAll(selector).forEach((entry) => {
        entry.disabled = true;
        if (entry.dataset.answer === answer) {
          entry.classList.add('is-correct');
        }
      });
      button.classList.add(correct ? 'is-hit' : 'is-miss');
      SoundManager.play(correct ? 'paintBloom' : 'error');
      complete(onComplete, correct, correct ? 760 : 1080, cleanup);
    };
    if (cleanup?.on) {
      cleanup.on(button, 'click', handleClick);
    } else {
      button.addEventListener('click', handleClick);
    }
  });
}

function objectOptions(target, key = 'word') {
  const distractors = shuffle(OBJECTS.filter((entry) => entry.id !== target.id)).slice(0, 3).map((entry) => entry[key]);
  return shuffle([target[key], ...distractors]);
}

export const BildwortGalerie = {
  id: 'bildwort-galerie',
  name_de: 'Bildwort-Galerie',
  description: 'Hochwertige Bildobjekte erkennen und das passende Wort wählen.',
  topics: ['wortschatz', 'lesen', 'nomen'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 5,

  setup(container, task, onComplete) {
    const cleanup = makeInteractionCleanup();
    SoundManager.play('gameStart');
    const target = pick(OBJECTS);
    const options = objectOptions(target);
    const image = target.image || OBJECT_TABLE;

    scene(container, {
      tone: 'gold',
      kicker: 'Bildgalerie',
      title: 'Welches Wort gehört zum Bild?',
      text: target.clue,
      image,
      body: `
        <div class="premium-image-stage">
          <img src="${image}" alt="" aria-hidden="true">
          <span class="premium-hotspot-marker" style="--x:${target.x}%; --y:${target.y}%"></span>
        </div>
        <div class="premium-content-options">
          ${options.map((option) => `<button type="button" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('')}
        </div>
      `
    });

    bindChoice(container, '.premium-content-options button', target.word, onComplete, cleanup);
    return cleanup.clear;
  }
};

export const WimmelbildDetektiv = {
  id: 'wimmelbild-detektiv',
  name_de: 'Wimmelbild-Detektiv',
  description: 'Objekte direkt im Aquarellbild finden.',
  topics: ['lesen', 'wortschatz', 'konzentration'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,

  setup(container, task, onComplete) {
    const cleanup = makeInteractionCleanup();
    SoundManager.play('gameStart');
    const target = pick(OBJECTS);
    const image = target.image || OBJECT_TABLE;
    const visibleObjects = OBJECTS.filter((entry) => (entry.image || OBJECT_TABLE) === image);

    scene(container, {
      tone: 'blue',
      kicker: 'Suchbild',
      title: 'Finde den Gegenstand',
      text: target.clue,
      image,
      body: `
        <div class="premium-image-stage premium-image-stage--search">
          <img src="${image}" alt="" aria-hidden="true">
          ${visibleObjects.map((entry) => `
            <button class="premium-hotspot" type="button" data-answer="${entry.id}" style="--x:${entry.x}%; --y:${entry.y}%" aria-label="${escapeHtml(entry.word)}"></button>
          `).join('')}
        </div>
      `
    });

    container.querySelectorAll('.premium-hotspot').forEach((button) => {
      cleanup.on(button, 'click', () => {
        const correct = button.dataset.answer === target.id;
        button.classList.add(correct ? 'is-hit' : 'is-miss');
        if (correct) {
          SoundManager.play('reward');
          complete(onComplete, true, 760, cleanup);
          return;
        }
        SoundManager.play('failSoft');
        cleanup.timer(setTimeout(() => button.classList.remove('is-miss'), 420));
      });
    });
    return cleanup.clear;
  }
};

export const ArtikelBildjagd = {
  id: 'artikel-bildjagd',
  name_de: 'Artikel-Bildjagd',
  description: 'Artikelentscheidung mit echtem Bildobjekt statt Textliste.',
  topics: ['artikel', 'nomen'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 5,

  setup(container, task, onComplete) {
    const cleanup = makeInteractionCleanup();
    SoundManager.play('gameStart');
    const target = pick(OBJECTS.filter((entry) => entry.article));
    const image = target.image || OBJECT_TABLE;

    scene(container, {
      tone: 'ochre',
      kicker: 'Artikelbild',
      title: `Welcher Artikel passt zu ${target.word}?`,
      text: 'Sieh genau auf das markierte Objekt und wähle der, die oder das.',
      image,
      body: `
        <div class="premium-image-stage">
          <img src="${image}" alt="" aria-hidden="true">
          <span class="premium-hotspot-marker" style="--x:${target.x}%; --y:${target.y}%"></span>
        </div>
        <div class="premium-content-options premium-content-options--short">
          ${['der', 'die', 'das'].map((option) => `<button type="button" data-answer="${option}">${option}</button>`).join('')}
        </div>
      `
    });

    bindChoice(container, '.premium-content-options button', target.article, onComplete, cleanup);
    return cleanup.clear;
  }
};

export const SatzStoryboard = {
  id: 'satz-storyboard',
  name_de: 'Satz-Storyboard',
  description: 'Bildpanels und Satzteile in eine klare Reihenfolge bringen.',
  topics: ['satzbau', 'lesen', 'grammatik'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,

  setup(container, task, onComplete) {
    const cleanup = makeInteractionCleanup();
    SoundManager.play('gameStart');
    const story = pick(STORY_SETS);
    const shuffled = shuffle(story.panels.map((panel, index) => ({ ...panel, index })));
    let cursor = 0;

    scene(container, {
      tone: 'green',
      kicker: 'Storyboard',
      title: story.title,
      text: 'Tippe die Bildkarten in der richtigen Reihenfolge an.',
      image: story.image || BOARD_TABLE,
      body: `
        <div class="premium-story-track">
          ${story.panels.map((_, index) => `<span data-slot="${index}"></span>`).join('')}
        </div>
        <div class="premium-story-grid">
          ${shuffled.map((panel) => `
            <button class="premium-story-card" type="button" data-index="${panel.index}" style="--crop:${escapeHtml(panel.crop)}">
              <span>${escapeHtml(panel.text)}</span>
            </button>
          `).join('')}
        </div>
      `
    });

    container.querySelectorAll('.premium-story-card').forEach((button) => {
      cleanup.on(button, 'click', () => {
        const correct = Number(button.dataset.index) === cursor;
        if (!correct) {
          button.classList.add('is-miss');
          SoundManager.play('error');
          cleanup.timer(setTimeout(() => button.classList.remove('is-miss'), 420));
          return;
        }
        const slot = container.querySelector(`[data-slot="${cursor}"]`);
        if (slot) {
          slot.textContent = `${cursor + 1}`;
          slot.classList.add('is-filled');
        }
        button.disabled = true;
        button.classList.add('is-hit');
        SoundManager.play('pageFlip');
        cursor += 1;
        if (cursor >= story.panels.length) {
          SoundManager.play('success');
          complete(onComplete, true, 760, cleanup);
        }
      });
    });
    return cleanup.clear;
  }
};

export const KompositumAtelier = {
  id: 'kompositum-atelier',
  name_de: 'Kompositum-Atelier',
  description: 'Wortbausteine zu einem zusammengesetzten Nomen bauen.',
  topics: ['zusammengesetzte_nomen', 'wortbildung', 'wortschatz'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,

  setup(container, task, onComplete) {
    const cleanup = makeInteractionCleanup();
    SoundManager.play('gameStart');
    const item = pick(COMPOUNDS);
    const options = shuffle([item.answer, ...shuffle(COMPOUNDS.filter((entry) => entry.answer !== item.answer)).slice(0, 3).map((entry) => entry.answer)]);

    scene(container, {
      tone: 'violet',
      kicker: 'Wortatelier',
      title: 'Baue das Kompositum',
      text: item.meaning,
      image: BOARD_TABLE,
      body: `
        <div class="premium-compound-board">
          <span>${escapeHtml(item.left)}</span>
          <strong>+</strong>
          <span>${escapeHtml(item.right)}</span>
        </div>
        <div class="premium-content-options">
          ${options.map((option) => `<button type="button" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('')}
        </div>
      `
    });

    bindChoice(container, '.premium-content-options button', item.answer, onComplete, cleanup);
    return cleanup.clear;
  }
};

export const DialogSpotlight = {
  id: 'dialog-spotlight',
  name_de: 'Dialog-Spotlight',
  description: 'Szenische Sprachentscheidung mit Rolle, Situation und Antwort.',
  topics: ['lesen', 'satzbau', 'grammatik'],
  supportsDirectPlay: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,

  setup(container, task, onComplete) {
    const cleanup = makeInteractionCleanup();
    SoundManager.play('gameStart');
    const item = pick(DIALOGUES);
    const options = shuffle(item.options);

    scene(container, {
      tone: 'red',
      kicker: 'Dialog',
      title: item.role,
      text: item.line,
      image: BOARD_TABLE,
      body: `
        <div class="premium-dialog-stage">
          <div class="premium-dialog-portrait" aria-hidden="true">${renderCharacterAvatar(item.characterIndex ?? 0, 112)}</div>
          <div class="premium-dialog-bubble">${escapeHtml(item.line)}</div>
        </div>
        <div class="premium-content-options premium-content-options--sentences">
          ${options.map((option) => `<button type="button" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('')}
        </div>
      `
    });

    bindChoice(container, '.premium-content-options button', item.answer, onComplete, cleanup);
    return cleanup.clear;
  }
};
