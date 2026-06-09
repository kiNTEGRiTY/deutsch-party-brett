import { SoundManager } from '../ui/sound-manager.js?v=field-route-fullscreen-31';
import { renderCharacterAvatar } from '../ui/characters.js?v=field-route-fullscreen-31';

const DEFAULTS = {
  solo_arcade: { timeLimitSec: 54, scoringMode: 'arcade' },
  turn_based: { timeLimitSec: 40, scoringMode: 'rounds' }
};

const CARD_A = '/assets/img/premium/user-reference/original-word-cards-labeled-a.jpeg';
const CARD_B = '/assets/img/premium/user-reference/original-word-cards-labeled-b.jpeg';
const ANIMALS = '/assets/img/premium/user-reference/clean-animal-figure-board.png?v=cutouts-16';

const CARDS = [
  ['hund', 'Hund', 'der', 1, 'H', CARD_A, 18, 18, '2% 12%', 'bellt und wedelt'],
  ['sonne', 'Sonne', 'die', 2, 'S', CARD_A, 39, 18, '34% 12%', 'scheint hell'],
  ['stift', 'Stift', 'der', 1, 'S', CARD_A, 61, 18, '66% 12%', 'schreibt oder malt'],
  ['mann', 'Mann', 'der', 1, 'M', CARD_A, 82, 18, '98% 12%', 'trägt eine Brille'],
  ['schmetterling', 'Schmetterling', 'der', 3, 'S', CARD_A, 18, 69, '2% 88%', 'hat bunte Flügel'],
  ['schere', 'Schere', 'die', 2, 'S', CARD_A, 39, 69, '34% 88%', 'schneidet Papier'],
  ['maedchen', 'Mädchen', 'das', 2, 'M', CARD_A, 61, 69, '66% 88%', 'trägt einen gelben Rock'],
  ['katze', 'Katze', 'die', 2, 'K', CARD_A, 82, 69, '98% 88%', 'hat Schnurrhaare'],
  ['stuhl', 'Stuhl', 'der', 1, 'S', CARD_B, 18, 18, '2% 12%', 'darauf sitzt man'],
  ['baum', 'Baum', 'der', 1, 'B', CARD_B, 39, 18, '34% 12%', 'hat Stamm und Krone'],
  ['junge', 'Junge', 'der', 2, 'J', CARD_B, 61, 18, '66% 12%', 'steht in blauer Kleidung'],
  ['apfel', 'Apfel', 'der', 2, 'A', CARD_B, 82, 18, '98% 12%', 'ist rot und rund'],
  ['frau', 'Frau', 'die', 1, 'F', CARD_B, 18, 69, '2% 88%', 'trägt einen roten Rock'],
  ['fisch', 'Fisch', 'der', 1, 'F', CARD_B, 39, 69, '34% 88%', 'schwimmt im Wasser'],
  ['blume', 'Blume', 'die', 2, 'B', CARD_B, 61, 69, '66% 88%', 'hat Blüte und Blätter'],
  ['haus', 'Haus', 'das', 1, 'H', CARD_B, 82, 69, '98% 88%', 'hat Dach und Tür']
].map(([id, word, article, syllables, letter, image, x, y, crop, clue]) => ({ id, word, article, syllables, letter, image, x, y, crop, clue }));

const ANIMAL_SPOTS = [
  ['elefant', 'Elefant', 16, 13, 'großes Tier mit Rüssel'],
  ['pinguin', 'Pinguin', 48, 11, 'schwarz-weißes Tier oben in der Mitte'],
  ['katze', 'Katze', 80, 12, 'Tier mit Schnurrhaaren oben rechts'],
  ['hund', 'Hund', 18, 34, 'Tier mit langem Ohr links'],
  ['kaenguru', 'Känguru', 51, 35, 'Tier mit langem Schwanz in der Mitte'],
  ['baer', 'Bär', 80, 35, 'sitzendes Tier auf dem Zettel rechts'],
  ['hase', 'Hase', 18, 56, 'Tier mit langen Ohren links'],
  ['fuchs', 'Fuchs', 51, 61, 'orangefarbenes Tier in der Mitte'],
  ['waschbaer', 'Waschbär', 81, 61, 'Tier mit Maske und Ringelschwanz'],
  ['reh', 'Reh', 18, 84, 'geflecktes Tier unten links'],
  ['fledermaus', 'Fledermaus', 51, 88, 'hängt unten kopfüber']
].map(([id, word, x, y, clue]) => ({ id, word, x, y, clue }));

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function esc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function finish(done, correct, delay = 740, cleanup = null) {
  const timerId = setTimeout(() => done({ correct, partial: false, score: correct ? 100 : 0 }), delay);
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

function scene(container, { tone = 'clover', kicker, title, text, image = CARD_A, body }) {
  container.innerHTML = `
    <div class="atelier-game atelier-game--${esc(tone)}">
      <div class="atelier-scene" style="--atelier-image:url('${esc(image)}')">
        <header class="atelier-copy">
          <span>${esc(kicker)}</span>
          <h3>${esc(title)}</h3>
          <p>${esc(text)}</p>
        </header>
        ${body}
      </div>
    </div>
  `;
}

function thumb(card, cls = '') {
  return `<div class="atelier-card-thumb ${cls}" style="--card-image:url('${esc(card.image)}');--crop:${esc(card.crop)}"><span>${esc(card.word)}</span></div>`;
}

function cardButton(card, extraClass = '') {
  return `<button class="atelier-card-choice ${extraClass}" type="button" data-id="${esc(card.id)}" data-answer="${esc(card.id)}" data-article="${esc(card.article)}" aria-label="${esc(card.word)}, Artikel ${esc(card.article)}">${thumb(card)}</button>`;
}

function bindButtons(container, selector, answer, done, cleanup = null) {
  container.querySelectorAll(selector).forEach((button) => {
    const handleClick = () => {
      const correct = button.dataset.answer === answer;
      container.querySelectorAll(selector).forEach((entry) => {
        entry.disabled = true;
        if (entry.dataset.answer === answer) entry.classList.add('is-correct');
      });
      button.classList.add(correct ? 'is-hit' : 'is-miss');
      SoundManager.play(correct ? 'paintBloom' : 'error');
      finish(done, correct, correct ? 680 : 1040, cleanup);
    };
    if (cleanup?.on) {
      cleanup.on(button, 'click', handleClick);
    } else {
      button.addEventListener('click', handleClick);
    }
  });
}

function options(answer, pool, count = 3) {
  return shuffle([answer, ...shuffle(pool.filter((entry) => entry !== answer)).slice(0, count)]);
}

function letterCards(letter) {
  return CARDS.filter((card) => card.letter === letter);
}

function makeHotspotGame({ container, done, target, image, entries, boardClass, hotspotClass }) {
  scene(container, {
    tone: 'blue',
    kicker: 'Direktbild',
    title: `Finde: ${target.word}`,
    text: target.clue,
    image,
    body: `
      <div class="${boardClass}">
        <img src="${image}" alt="" aria-hidden="true">
        ${entries.map((entry) => `<button class="${hotspotClass}" type="button" data-answer="${entry.id}" aria-label="${esc(entry.word)}" style="--x:${entry.x}%;--y:${entry.y}%"></button>`).join('')}
      </div>
    `
  });
  container.querySelectorAll(`.${hotspotClass}`).forEach((button) => {
    button.addEventListener('click', () => {
      const correct = button.dataset.answer === target.id;
      button.classList.add(correct ? 'is-hit' : 'is-miss');
      SoundManager.play(correct ? 'reward' : 'failSoft');
      if (correct) finish(done, true, 700);
      else setTimeout(() => button.classList.remove('is-miss'), 420);
    });
  });
}

export const KartenKlickLabor = {
  id: 'karten-klick-labor',
  name_de: 'Karten-Klicklabor',
  description: 'Auf dem echten Kartenfoto blitzschnell das gesuchte Wort treffen.',
  topics: ['lesen', 'wortschatz', 'konzentration'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 5,
  setup(container, task, done) {
    SoundManager.play('gameStart');
    const target = pick(CARDS);
    makeHotspotGame({ container, done, target, image: target.image, entries: CARDS.filter((card) => card.image === target.image), boardClass: 'atelier-photo-board', hotspotClass: 'atelier-hotspot' });
  }
};

export const TierblattSpurensuche = {
  id: 'tierblatt-spurensuche',
  name_de: 'Tierblatt-Spurensuche',
  description: 'Die sauber freigestellten Originalfiguren auf der Figurenkarte finden.',
  topics: ['lesen', 'wortschatz', 'konzentration'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 5,
  setup(container, task, done) {
    SoundManager.play('gameStart');
    makeHotspotGame({ container, done, target: pick(ANIMAL_SPOTS), image: ANIMALS, entries: ANIMAL_SPOTS, boardClass: 'atelier-animal-board', hotspotClass: 'atelier-animal-hotspot' });
  }
};

export const ArtikelStempelstudio = {
  id: 'artikel-stempelstudio',
  name_de: 'Artikel-Stempelstudio',
  description: 'Artikel wie echte Stempel auf Bildkarten setzen.',
  topics: ['artikel', 'nomen', 'wortschatz'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 5,
  setup(container, task, done) {
    const cleanup = makeInteractionCleanup();
    SoundManager.play('woodBlock');
    const target = pick(CARDS);
    scene(container, {
      tone: 'red',
      kicker: 'Stempel',
      title: `Artikel für ${target.word}`,
      text: 'Setze den passenden Stempel auf die Karte.',
      image: target.image,
      body: `
        <div class="atelier-stamp-layout atelier-stamp-layout--hero">
          <div class="atelier-stamp-card">
            ${thumb(target, 'atelier-card-thumb--large')}
            <span class="atelier-stamp-card-slot" aria-hidden="true">?</span>
          </div>
          <div class="atelier-stamp-pad" aria-label="Artikel-Stempel">
            ${['der', 'die', 'das'].map((a) => `<button class="atelier-stamp" data-answer="${a}" type="button">${a}</button>`).join('')}
          </div>
        </div>
      `
    });
    bindButtons(container, '.atelier-stamp', target.article, done, cleanup);
    return cleanup.clear;
  }
};

export const SilbenKlatschkarten = {
  id: 'silben-klatschkarten',
  name_de: 'Silben-Klatschkarten',
  description: 'Wortkarte ansehen, Silben innerlich klatschen, Zahl treffen.',
  topics: ['silben', 'lesen', 'wortschatz'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 5,
  setup(container, task, done) {
    SoundManager.play('tick');
    const target = pick(CARDS);
    scene(container, {
      tone: 'gold',
      kicker: 'Silben',
      title: `Wie viele Silben hat ${target.word}?`,
      text: 'Sprich das Wort und wähle die Klatschzahl.',
      image: target.image,
      body: `<div class="atelier-center-card">${thumb(target, 'atelier-card-thumb--large')}</div><div class="atelier-number-row">${[1, 2, 3, 4].map((n) => `<button data-answer="${n}" type="button">${'Klatsch '.repeat(n).trim()}<strong>${n}</strong></button>`).join('')}</div>`
    });
    bindButtons(container, '.atelier-number-row button', String(target.syllables), done);
  }
};

export const AnfangsbuchstabenLupe = {
  id: 'anfangsbuchstaben-lupe',
  name_de: 'Anfangsbuchstaben-Lupe',
  description: 'Detailkarte ansehen und den ersten Buchstaben schnappen.',
  topics: ['alphabet', 'rechtschreibung', 'lesen'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 5,
  setup(container, task, done) {
    SoundManager.play('menuOpen');
    const target = pick(CARDS);
    scene(container, {
      tone: 'violet',
      kicker: 'Lupe',
      title: 'Welcher Anfangsbuchstabe passt?',
      text: `Die Lupe zeigt: ${target.clue}.`,
      image: target.image,
      body: `<div class="atelier-magnifier" style="--card-image:url('${esc(target.image)}');--crop:${esc(target.crop)}"></div><div class="atelier-letter-rack">${options(target.letter, ['A', 'B', 'F', 'H', 'J', 'K', 'M', 'S'], 4).map((l) => `<button data-answer="${l}" type="button">${l}</button>`).join('')}</div>`
    });
    bindButtons(container, '.atelier-letter-rack button', target.letter, done);
  }
};

export const KartenlupeWortfang = {
  id: 'kartenlupe-wortfang',
  name_de: 'Kartenlupe-Wortfang',
  description: 'Ein echter Kartenausschnitt wird groß betrachtet, dann muss das Wort sitzen.',
  topics: ['lesen', 'wortschatz', 'konzentration'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 5,
  setup(container, task, done) {
    SoundManager.play('menuOpen');
    const target = pick(CARDS);
    scene(container, {
      tone: 'blue',
      kicker: 'Kartenlupe',
      title: 'Welches Wort steckt im Ausschnitt?',
      text: target.clue,
      image: target.image,
      body: `
        <div class="atelier-zoom-layout">
          <div class="atelier-card-thumb atelier-card-thumb--hero" style="--card-image:url('${esc(target.image)}');--crop:${esc(target.crop)}"><span>${esc(target.word)}</span></div>
          <div class="atelier-word-options">
            ${options(target.word, CARDS.map((card) => card.word), 4).map((word) => `<button type="button" data-answer="${esc(word)}">${esc(word)}</button>`).join('')}
          </div>
        </div>
      `
    });
    bindButtons(container, '.atelier-word-options button', target.word, done);
  }
};

export const WortkartenBlitzwahl = {
  id: 'wortkarten-blitzwahl',
  name_de: 'Wortkarten-Blitzwahl',
  description: 'Vier echte Karten liegen auf dem Tisch, eine passt zur Beschreibung.',
  topics: ['lesen', 'wortschatz', 'nomen'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 5,
  setup(container, task, done) {
    SoundManager.play('pageFlip');
    const target = pick(CARDS);
    const choices = shuffle([target, ...shuffle(CARDS.filter((card) => card.id !== target.id)).slice(0, 3)]);
    scene(container, {
      tone: 'gold',
      kicker: 'Blitzwahl',
      title: 'Welche Karte passt?',
      text: target.clue,
      image: target.image,
      body: `<div class="atelier-choice-grid">${choices.map((card) => cardButton(card)).join('')}</div>`
    });
    bindButtons(container, '.atelier-card-choice', target.id, done);
  }
};

export const ArtikelSortierband = {
  id: 'artikel-sortierband',
  name_de: 'Artikel-Sortierband',
  description: 'Sammle alle echten Wortkarten mit dem gesuchten Artikel.',
  topics: ['artikel', 'nomen', 'wortschatz'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 4,
  setup(container, task, done) {
    const cleanup = makeInteractionCleanup();
    const difficulty = task?.difficulty || {};
    const requestedTargets = Math.max(2, Math.min(4, Number(difficulty.answerOptions || 3)));
    const availableArticles = ['der', 'die', 'das'].filter((entry) => CARDS.some((card) => card.article === entry));
    const article = pick(availableArticles);
    const articleCards = CARDS.filter((card) => card.article === article);
    const targetCount = Math.min(requestedTargets, articleCards.length);
    const failLimit = Math.max(2, 4 - Math.min(2, Number(difficulty.timePressure || 0)));
    const targets = shuffle(articleCards).slice(0, targetCount);
    const distractors = shuffle(CARDS.filter((card) => card.article !== article)).slice(0, Math.max(4, 7 - targetCount));
    const choices = shuffle([...targets, ...distractors]);
    let hits = 0;
    let misses = 0;
    let finished = false;

    const complete = (result) => {
      if (finished) return;
      finished = true;
      container.querySelectorAll('.atelier-card-choice').forEach((entry) => { entry.disabled = true; });
      cleanup.timer(setTimeout(() => done(result), 720));
    };

    scene(container, {
      tone: 'red',
      kicker: 'Sortierband',
      title: `Sammle: ${article.toUpperCase()}`,
      text: `Tippe nur die Karten mit dem Artikel ${article}. Jede falsche Karte wird aussortiert.`,
      image: pick(choices).image,
      body: `
        <div class="atelier-sort-challenge atelier-sort-challenge--articles">
          <div class="atelier-sort-goal">
            <div class="atelier-article-target">${esc(article)}</div>
            <div class="atelier-hunt-counter">
              <strong><span data-counter>0</span> / ${targets.length}</strong>
              <small><span data-misses>0</span> / ${failLimit} Fehler</small>
            </div>
          </div>
          <div class="atelier-article-trays" aria-hidden="true">
            <span>passt zu ${esc(article)}</span>
            <span>aussortiert</span>
          </div>
          <div class="atelier-choice-grid atelier-choice-grid--compact">${choices.map((card) => cardButton(card, 'atelier-card-choice--small')).join('')}</div>
          <p class="atelier-sort-feedback" data-feedback>Vergleiche Wort und Artikel. Sammle zuerst sichere Treffer.</p>
        </div>
      `
    });

    const counter = container.querySelector('[data-counter]');
    const missCounter = container.querySelector('[data-misses]');
    const feedback = container.querySelector('[data-feedback]');

    container.querySelectorAll('.atelier-card-choice').forEach((button) => {
      cleanup.on(button, 'click', () => {
        const card = CARDS.find((entry) => entry.id === button.dataset.id);
        if (!card || button.disabled || finished) return;

        if (card.article === article) {
          button.disabled = true;
          button.classList.add('is-hit');
          hits += 1;
          if (counter) counter.textContent = String(hits);
          if (feedback) feedback.textContent = `Treffer: ${article} ${card.word}.`;
          SoundManager.play('woodBlock');
          if (hits === targets.length) {
            complete({
              correct: true,
              partial: misses > 0,
              score: Math.max(72, 100 - misses * 9),
              details: { article, hits, misses, targetCount: targets.length }
            });
          }
          return;
        }

        misses += 1;
        button.disabled = true;
        button.classList.add('is-miss', 'is-rejected');
        if (missCounter) missCounter.textContent = String(misses);
        if (feedback) feedback.textContent = `Aussortiert: ${card.word} braucht ${card.article}, nicht ${article}.`;
        SoundManager.play('failSoft');
        if (misses >= failLimit) {
          complete({
            correct: false,
            partial: hits > 0,
            score: Math.round((hits / targets.length) * 68),
            details: { article, hits, misses, targetCount: targets.length }
          });
        }
      });
    });

    return cleanup.clear;
  }
};

export const TiernamenBingo = {
  id: 'tiernamen-bingo',
  name_de: 'Tiernamen-Bingo',
  description: 'Die saubere Figurenkarte zeigt eine markierte Figur, der Name muss passen.',
  topics: ['lesen', 'wortschatz', 'konzentration'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 5,
  setup(container, task, done) {
    const target = pick(ANIMAL_SPOTS);
    scene(container, {
      tone: 'blue',
      kicker: 'Tierbingo',
      title: 'Wie heisst die markierte Figur?',
      text: target.clue,
      image: ANIMALS,
      body: `
        <div class="atelier-animal-quiz">
          <div class="atelier-marked-board">
            <img src="${ANIMALS}" alt="" aria-hidden="true">
            <span class="atelier-focus-ring" style="--x:${target.x}%;--y:${target.y}%"></span>
          </div>
          <div class="atelier-word-options">
            ${options(target.word, ANIMAL_SPOTS.map((entry) => entry.word), 4).map((word) => `<button type="button" data-answer="${esc(word)}">${esc(word)}</button>`).join('')}
          </div>
        </div>
      `
    });
    bindButtons(container, '.atelier-word-options button', target.word, done);
  }
};

export const AnfangspaarJagd = {
  id: 'anfangspaar-jagd',
  name_de: 'Anfangspaar-Jagd',
  description: 'Finde zwei Wortkarten mit demselben Anfangsbuchstaben.',
  topics: ['alphabet', 'rechtschreibung', 'lesen'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 4,
  setup(container, task, done) {
    const letter = pick(['S', 'H', 'B', 'M']);
    const targets = shuffle(letterCards(letter)).slice(0, 2);
    const distractors = shuffle(CARDS.filter((card) => card.letter !== letter)).slice(0, 4);
    const choices = shuffle([...targets, ...distractors]);
    let hits = 0;
    let misses = 0;

    scene(container, {
      tone: 'violet',
      kicker: 'Paarjagd',
      title: `Finde zwei Karten mit ${letter}`,
      text: 'Tippe genau die zwei Karten, die mit diesem Buchstaben beginnen.',
      image: pick(choices).image,
      body: `
        <div class="atelier-sort-challenge">
          <div class="atelier-letter-target">${esc(letter)}</div>
          <div class="atelier-hunt-counter"><span data-counter>0</span> / ${targets.length}</div>
          <div class="atelier-choice-grid atelier-choice-grid--compact">${choices.map((card) => cardButton(card)).join('')}</div>
        </div>
      `
    });

    const counter = container.querySelector('[data-counter]');
    container.querySelectorAll('.atelier-card-choice').forEach((button) => {
      button.addEventListener('click', () => {
        const card = CARDS.find((entry) => entry.id === button.dataset.id);
        if (!card || button.disabled) return;
        if (card.letter === letter) {
          button.disabled = true;
          button.classList.add('is-hit');
          hits += 1;
          if (counter) counter.textContent = String(hits);
          SoundManager.play('paintBloom');
          if (hits === targets.length) {
            setTimeout(() => done({ correct: true, partial: misses > 0, score: Math.max(76, 100 - misses * 12) }), 720);
          }
          return;
        }
        misses += 1;
        button.classList.add('is-miss');
        SoundManager.play('failSoft');
        setTimeout(() => button.classList.remove('is-miss'), 420);
        if (misses >= 2) {
          container.querySelectorAll('.atelier-card-choice').forEach((entry) => { entry.disabled = true; });
          setTimeout(() => done({ correct: false, partial: hits > 0, score: hits * 35 }), 740);
        }
      });
    });
  }
};

export const KartenMemoryDuo = {
  id: 'karten-memory-duo',
  name_de: 'Karten-Memory Duo',
  description: 'Bildkarte und Wortkarte als Paar finden.',
  topics: ['lesen', 'wortschatz', 'konzentration'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 4,
  setup(container, task, done) {
    SoundManager.play('pageFlip');
    const targets = shuffle(CARDS).slice(0, 4);
    const cards = shuffle([...targets.map((item) => ({ kind: 'image', item })), ...targets.map((item) => ({ kind: 'word', item }))]);
    let first = null;
    let found = 0;
    scene(container, {
      kicker: 'Memory',
      title: 'Finde Bild und Wort',
      text: 'Drehe zwei Karten um. Paar gefunden? Dann bleiben sie offen.',
      body: `<div class="atelier-memory-grid">${cards.map((card, i) => `<button class="atelier-memory-card" type="button" data-index="${i}" data-pair="${card.item.id}"><span class="atelier-memory-back">?</span><span class="atelier-memory-face">${card.kind === 'image' ? thumb(card.item) : `<strong>${esc(card.item.word)}</strong>`}</span></button>`).join('')}</div>`
    });
    container.querySelectorAll('.atelier-memory-card').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.disabled || button === first) return;
        button.classList.add('is-open');
        SoundManager.play('pageFlip');
        if (!first) {
          first = button;
          return;
        }
        if (first.dataset.pair === button.dataset.pair) {
          first.disabled = true;
          button.disabled = true;
          first.classList.add('is-found');
          button.classList.add('is-found');
          first = null;
          found += 1;
          SoundManager.play('reward');
          if (found === targets.length) finish(done, true, 700);
          return;
        }
        SoundManager.play('failSoft');
        const old = first;
        first = null;
        setTimeout(() => {
          old.classList.remove('is-open');
          button.classList.remove('is-open');
        }, 650);
      });
    });
  }
};

export const AlphabetKartenreihe = {
  id: 'alphabet-kartenreihe',
  name_de: 'Alphabet-Kartenreihe',
  description: 'Bildkarten durch Antippen alphabetisch ordnen.',
  topics: ['alphabet', 'lesen', 'wortschatz'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 4,
  setup(container, task, done) {
    const selected = shuffle(CARDS).slice(0, 5);
    const order = [...selected].sort((a, b) => a.word.localeCompare(b.word, 'de'));
    let cursor = 0;
    scene(container, {
      tone: 'blue',
      kicker: 'Alphabet',
      title: 'Tippe in Alphabet-Reihenfolge',
      text: `Starte mit: ${order[0].word}.`,
      body: `<div class="atelier-order-track">${order.map((_, i) => `<span data-slot="${i}"></span>`).join('')}</div><div class="atelier-sort-grid">${shuffle(selected).map((item) => `<button type="button" data-id="${item.id}">${thumb(item)}</button>`).join('')}</div>`
    });
    bindSequence(container, '.atelier-sort-grid button', order, 'id', done);
  }
};

export const FigurenSatztheater = {
  id: 'figuren-satztheater',
  name_de: 'Figuren-Satztheater',
  description: 'Originalfigur ansehen und den grammatisch sauberen Satz wählen.',
  topics: ['satzbau', 'lesen', 'grammatik'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 4,
  setup(container, task, done) {
    const set = pick([
      { c: 0, a: 'Der Elefant hält ein Kleeblatt.', w: ['Die Elefant hält ein Kleeblatt.', 'Das Elefant hält ein Kleeblatt.'] },
      { c: 1, a: 'Der Pinguin steht oben auf dem Blatt.', w: ['Die Pinguin steht oben.', 'Der Pinguin stehen oben.'] },
      { c: 7, a: 'Der Fuchs sitzt in der Mitte.', w: ['Die Fuchs sitzt in der Mitte.', 'Der Fuchs sitzen in der Mitte.'] }
    ]);
    scene(container, {
      tone: 'red',
      kicker: 'Satztheater',
      title: 'Welche Zeile ist sauber?',
      text: 'Die Figur gibt den Satz vor. Wähle die korrekte Fassung.',
      image: ANIMALS,
      body: `<div class="atelier-theater"><div class="atelier-theater-figure">${renderCharacterAvatar(set.c, 128)}</div><div class="atelier-theater-options">${shuffle([set.a, ...set.w]).map((line) => `<button type="button" data-answer="${esc(line)}">${esc(line)}</button>`).join('')}</div></div>`
    });
    bindButtons(container, '.atelier-theater-options button', set.a, done);
  }
};

export const WortkartenDomino = {
  id: 'wortkarten-domino',
  name_de: 'Wortkarten-Domino',
  description: 'Wortkarten nach Anfangslaut und Länge als Domino legen.',
  topics: ['alphabet', 'rechtschreibung', 'wortschatz'],
  supportsDirectPlay: true,
  directPlayDefaults: DEFAULTS,
  defaultRounds: 4,
  setup(container, task, done) {
    const chain = ['stuhl', 'stift', 'sonne', 'schere', 'schmetterling'].map((id) => CARDS.find((card) => card.id === id)).filter(Boolean);
    scene(container, {
      tone: 'violet',
      kicker: 'Domino',
      title: 'Lege die S-Karten',
      text: 'Alle Wörter beginnen mit S. Tippe sie von kurz und knapp bis lang.',
      body: `<div class="atelier-domino-track">${chain.map((_, i) => `<span data-slot="${i}"></span>`).join('')}</div><div class="atelier-sort-grid">${shuffle(chain).map((item) => `<button type="button" data-id="${item.id}">${thumb(item)}</button>`).join('')}</div>`
    });
    bindSequence(container, '.atelier-sort-grid button', chain, 'id', done);
  }
};

function bindSequence(container, selector, order, key, done) {
  let cursor = 0;
  container.querySelectorAll(selector).forEach((button) => {
    button.addEventListener('click', () => {
      const expected = order[cursor];
      if (button.dataset.id !== expected[key]) {
        button.classList.add('is-miss');
        SoundManager.play('error');
        setTimeout(() => button.classList.remove('is-miss'), 420);
        return;
      }
      button.disabled = true;
      button.classList.add('is-hit');
      const slot = container.querySelector(`[data-slot="${cursor}"]`);
      if (slot) {
        slot.textContent = expected.word;
        slot.classList.add('is-filled');
      }
      cursor += 1;
      SoundManager.play('woodBlock');
      if (cursor === order.length) finish(done, true, 720);
    });
  });
}
