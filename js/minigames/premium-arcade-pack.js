import { SoundManager } from '../ui/sound-manager.js?v=start-fullscreen-47';
import { renderCharacterAvatar } from '../ui/characters.js?v=start-fullscreen-47';
import { WORTARTEN_CONTENT } from '../learning/languages/de/content-wortarten.js?v=start-fullscreen-47';

const DIRECT_DEFAULTS = {
  solo_arcade: {
    timeLimitSec: 48,
    scoringMode: 'arcade'
  },
  turn_based: {
    timeLimitSec: 36,
    scoringMode: 'rounds'
  }
};

const WORD_TYPES = [
  { word: 'der Tunnel', type: 'Nomen', hint: 'Ding oder Lebewesen' },
  { word: 'springen', type: 'Verb', hint: 'Tunwort' },
  { word: 'mutig', type: 'Adjektiv', hint: 'Wie ist etwas?' },
  { word: 'die Laterne', type: 'Nomen', hint: 'Ding oder Lebewesen' },
  { word: 'funkeln', type: 'Verb', hint: 'Tunwort' },
  { word: 'hell', type: 'Adjektiv', hint: 'Wie ist etwas?' },
  { word: 'der Kompass', type: 'Nomen', hint: 'Ding oder Lebewesen' },
  { word: 'rollen', type: 'Verb', hint: 'Tunwort' },
  { word: 'vorsichtig', type: 'Adjektiv', hint: 'Wie ist etwas?' },
  { word: 'das Abenteuer', type: 'Nomen', hint: 'Ding oder Lebewesen' },
  { word: 'zeichnen', type: 'Verb', hint: 'Tunwort' },
  { word: 'leise', type: 'Adjektiv', hint: 'Wie ist etwas?' }
];

const SNOW_TARGET_POSITIONS = [
  { x: 18, y: 35, mobileX: 25, mobileY: 25 },
  { x: 37, y: 31, mobileX: 73, mobileY: 25 },
  { x: 61, y: 30, mobileX: 25, mobileY: 34 },
  { x: 82, y: 34, mobileX: 73, mobileY: 34 },
  { x: 25, y: 51, mobileX: 25, mobileY: 43 },
  { x: 48, y: 48, mobileX: 73, mobileY: 43 },
  { x: 70, y: 50, mobileX: 25, mobileY: 52 },
  { x: 88, y: 57, mobileX: 73, mobileY: 52 },
  { x: 34, y: 68, mobileX: 25, mobileY: 61 },
  { x: 58, y: 66, mobileX: 73, mobileY: 61 },
  { x: 76, y: 72, mobileX: 54, mobileY: 70 },
  { x: 45, y: 80, mobileX: 73, mobileY: 70 }
];

const ARTICLES = [
  { word: 'Hund', answer: 'der', image: 'assets/img/premium/user-reference/word-card-crops/hund.jpg' },
  { word: 'Sonne', answer: 'die', image: 'assets/img/premium/user-reference/word-card-crops/sonne.jpg' },
  { word: 'Stift', answer: 'der', image: 'assets/img/premium/user-reference/word-card-crops/stift.jpg' },
  { word: 'Mann', answer: 'der', image: 'assets/img/premium/user-reference/word-card-crops/mann.jpg' },
  { word: 'Schmetterling', answer: 'der', image: 'assets/img/premium/user-reference/word-card-crops/schmetterling.jpg' },
  { word: 'Schere', answer: 'die', image: 'assets/img/premium/user-reference/word-card-crops/schere.jpg' },
  { word: 'Mädchen', answer: 'das', image: 'assets/img/premium/user-reference/word-card-crops/maedchen.jpg' },
  { word: 'Katze', answer: 'die', image: 'assets/img/premium/user-reference/word-card-crops/katze.jpg' },
  { word: 'Stuhl', answer: 'der', image: 'assets/img/premium/user-reference/word-card-crops/stuhl.jpg' },
  { word: 'Baum', answer: 'der', image: 'assets/img/premium/user-reference/word-card-crops/baum.jpg' },
  { word: 'Junge', answer: 'der', image: 'assets/img/premium/user-reference/word-card-crops/junge.jpg' },
  { word: 'Apfel', answer: 'der', image: 'assets/img/premium/user-reference/word-card-crops/apfel.jpg' },
  { word: 'Frau', answer: 'die', image: 'assets/img/premium/user-reference/word-card-crops/frau.jpg' },
  { word: 'Fisch', answer: 'der', image: 'assets/img/premium/user-reference/word-card-crops/fisch.jpg' },
  { word: 'Blume', answer: 'die', image: 'assets/img/premium/user-reference/word-card-crops/blume.jpg' },
  { word: 'Haus', answer: 'das', image: 'assets/img/premium/user-reference/word-card-crops/haus.jpg' }
];

const SYLLABLES = [
  { word: 'Schmetterling', beats: 3 },
  { word: 'Papier', beats: 2 },
  { word: 'Abenteuer', beats: 4 },
  { word: 'Wortwiese', beats: 3 },
  { word: 'Stuhl', beats: 1 },
  { word: 'Laterne', beats: 3 },
  { word: 'Bleistift', beats: 2 }
];

const SENTENCES = [
  ['Der', 'kleine', 'Hund', 'rennt', 'schnell'],
  ['Mila', 'findet', 'eine', 'rote', 'Blume'],
  ['Am', 'Fluss', 'steht', 'ein', 'alter', 'Baum'],
  ['Wir', 'bauen', 'einen', 'klaren', 'Satz'],
  ['Die', 'Katze', 'schläft', 'auf', 'dem', 'Stuhl']
];

const BOSS_QUESTIONS = [
  { prompt: 'Welche Wortart ist "leuchten"?', answer: 'Verb', options: ['Nomen', 'Verb', 'Adjektiv'] },
  { prompt: 'Welcher Artikel passt zu "Baum"?', answer: 'der', options: ['der', 'die', 'das'] },
  { prompt: 'Wie viele Silben hat "Papier"?', answer: '2', options: ['1', '2', '3'] },
  { prompt: 'Welche Wortart ist "freundlich"?', answer: 'Adjektiv', options: ['Nomen', 'Verb', 'Adjektiv'] },
  { prompt: 'Welches Wort reimt sich auf "Haus"?', answer: 'Maus', options: ['Maus', 'Baum', 'Licht'] },
  { prompt: 'Welche Schreibweise ist richtig?', answer: 'der Hund', options: ['der Hund', 'der hund', 'Der hund'] },
  { prompt: 'Welche Wortart ist "die Feder"?', answer: 'Nomen', options: ['Nomen', 'Verb', 'Adjektiv'] }
];

const MAZE_MAP = [
  '#############',
  '#S..#...#..T#',
  '#.#.#.#.#.#.#',
  '#...#.#...#.#',
  '###.#.###.#.#',
  '#...#.....#.#',
  '#.#.###.#.#.#',
  '#T#.....#...#',
  '#############'
];

const MAZE_WORD_SPOTS = [
  [2, 1], [6, 1], [10, 1],
  [1, 3], [8, 3], [11, 3],
  [3, 5], [5, 5], [9, 5],
  [3, 7], [7, 7], [11, 7]
];

const MAZE_TRAPS = [
  [11, 1],
  [1, 7]
];

const WORD_TYPE_LABELS = ['Nomen', 'Verb', 'Adjektiv'];

const WORD_TYPE_CONFIG = [
  {
    key: 'nomen',
    label: 'Nomen',
    topic: 'nomen',
    rule: 'Nomen benennen Menschen, Tiere, Dinge oder Gedanken. Sie können einen Artikel haben.',
    cue: 'Namenwort'
  },
  {
    key: 'verben',
    label: 'Verb',
    topic: 'verben',
    rule: 'Verben sagen, was jemand tut oder was geschieht. Man kann sie beugen.',
    cue: 'Tunwort'
  },
  {
    key: 'adjektive',
    label: 'Adjektiv',
    topic: 'adjektive',
    rule: 'Adjektive beschreiben, wie etwas ist. Sie passen zu Fragen wie: Wie ist es?',
    cue: 'Wie-Wort'
  }
];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function shuffle(entries) {
  const copy = [...entries];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function pick(entries) {
  return entries[Math.floor(Math.random() * entries.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function roundCount(task, fallback = 7) {
  return clamp(Number(task.partyConfig?.rounds || task.rounds || fallback), 4, 10);
}

function activeCharacterIndex(task, fallbackIndex = 0) {
  const players = Array.isArray(task.players) ? task.players : [];
  const activePlayer = players.find((player) => player.id === task.currentPlayerId) || players[0];
  if (Number.isFinite(activePlayer?.colorIndex)) {
    return activePlayer.colorIndex;
  }
  return fallbackIndex;
}

function renderTaskCharacterAvatar(task, fallbackIndex, size) {
  return renderCharacterAvatar(activeCharacterIndex(task, fallbackIndex), size);
}

function resultFrom(score, maxScore, misses = 0) {
  const percentage = clamp(Math.round((score / Math.max(maxScore, 1)) * 100) - misses * 4, 0, 100);
  return {
    correct: percentage >= 74,
    partial: percentage >= 45 && percentage < 74,
    score: percentage
  };
}

function buildHud({ kicker, title, status }) {
  return `
    <div class="arcade-hud">
      <div>
        <span>${escapeHtml(kicker)}</span>
        <strong>${escapeHtml(title)}</strong>
      </div>
      <em>${escapeHtml(status)}</em>
    </div>
  `;
}

function difficultyKeyFromTask(task) {
  const level = Number(task.difficulty?.languageComplexity ?? 2);
  if (level <= 2) return 'easy';
  if (level <= 4) return 'medium';
  return 'hard';
}

function uniqueWords(words) {
  return [...new Set(words.map((word) => String(word || '').trim()).filter(Boolean))];
}

function wordTypeConfigForTopic(topic) {
  return WORD_TYPE_CONFIG.find((entry) => entry.topic === topic || entry.key === topic || entry.label.toLowerCase() === topic);
}

function wordTypeLabelForTask(task) {
  return wordTypeConfigForTopic(task?.topic)?.label || null;
}

function makeWordTypeItem(word, config) {
  return {
    word,
    type: config.label,
    hint: 'Wortkarte',
    cue: config.cue,
    explanation: config.rule
  };
}

function buildWordTypeDeck(task) {
  const difficultyKey = difficultyKeyFromTask(task);
  const contentWords = Array.isArray(task.content?.words) ? task.content.words : [];
  const focusConfig = wordTypeConfigForTopic(task.topic);

  return WORD_TYPE_CONFIG.reduce((deck, config) => {
    const configuredWords = [
      ...(WORTARTEN_CONTENT[config.key]?.[difficultyKey] || []),
      ...(difficultyKey !== 'easy' ? WORTARTEN_CONTENT[config.key]?.easy || [] : [])
    ];
    const topicWords = focusConfig?.label === config.label ? contentWords : [];
    const words = uniqueWords([...topicWords, ...configuredWords, ...WORD_TYPES.filter((item) => item.type === config.label).map((item) => item.word)]);
    deck[config.label] = words.map((word) => makeWordTypeItem(word, config));
    return deck;
  }, {});
}

function buildTargetTypeSequence(task, total) {
  const focusConfig = wordTypeConfigForTopic(task.topic);
  const rotation = shuffle(WORD_TYPE_CONFIG.map((entry) => entry.label));
  return Array.from({ length: total }, (_, index) => {
    if (focusConfig && index % 2 === 0) {
      return focusConfig.label;
    }
    return rotation[index % rotation.length];
  });
}

function takeWordTypeItem(deck, type, usedWords) {
  const entries = deck[type] || [];
  const available = shuffle(entries.filter((item) => !usedWords.has(`${item.type}:${item.word}`)));
  const item = available[0] || pick(entries);
  if (item) {
    usedWords.add(`${item.type}:${item.word}`);
  }
  return item;
}

function makeCleanupBag() {
  const listeners = [];
  const timers = [];
  const frames = [];

  return {
    on(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      listeners.push([target, type, handler, options]);
    },
    timer(id) {
      timers.push(id);
      return id;
    },
    frame(id) {
      frames.push(id);
      return id;
    },
    clear() {
      listeners.forEach(([target, type, handler, options]) => target.removeEventListener(type, handler, options));
      timers.forEach((id) => clearTimeout(id));
      timers.forEach((id) => clearInterval(id));
      frames.forEach((id) => cancelAnimationFrame(id));
      listeners.length = 0;
      timers.length = 0;
      frames.length = 0;
    }
  };
}

export const WortartenSprunglauf = {
  id: 'wortarten-sprunglauf',
  name_de: 'Wortarten-Sprunglauf',
  description: 'Jump-n-run: springe auf die richtige Wortart, sammle Streaks und vermeide Fehlplattformen.',
  topics: ['wortarten', 'nomen', 'verben', 'adjektive'],
  supportsDirectPlay: true,
  usesInternalTimer: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 7,
  mascotIndex: 4,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const cleanup = makeCleanupBag();
    const total = roundCount(task, 7);
    let round = 0;
    let score = 0;
    let misses = 0;
    let heroLane = 1;
    let done = false;

    const deck = buildWordTypeDeck(task);
    const targetTypes = buildTargetTypeSequence(task, total);
    const usedWords = new Set();

    const finish = () => {
      if (done) return;
      done = true;
      SoundManager.play(score >= Math.ceil(total * 0.75) ? 'finish' : 'failSoft');
      cleanup.timer(setTimeout(() => onComplete({
        ...resultFrom(score, total, misses),
        details: { score, misses, total, topic: 'wortarten' }
      }), 760));
    };

    const renderRound = () => {
      if (round >= total) {
        finish();
        return;
      }

      const targetType = targetTypes[round] || pick(WORD_TYPE_LABELS);
      const targetConfig = WORD_TYPE_CONFIG.find((entry) => entry.label === targetType) || WORD_TYPE_CONFIG[0];
      const correct = takeWordTypeItem(deck, targetType, usedWords);
      const wrongPool = shuffle(WORD_TYPE_LABELS.filter((type) => type !== targetType))
        .map((type) => takeWordTypeItem(deck, type, usedWords))
        .filter(Boolean)
        .slice(0, 2);
      const platforms = shuffle([correct, ...wrongPool]).map((item, index) => ({
        ...item,
        lane: index
      }));
      let locked = false;

      container.innerHTML = `
        <div class="arcade-game arcade-game--runner">
          ${buildHud({
            kicker: 'Jump-n-run',
            title: `Spring auf: ${targetType}`,
            status: `${round + 1}/${total} · Treffer ${score}`
          })}
          <div class="arcade-runner-stage">
            <div class="arcade-parallax arcade-parallax--back"></div>
            <div class="arcade-runner-hitline"></div>
            <div class="arcade-runner-target">
              <span>Gesucht</span>
              <strong>${escapeHtml(targetType)}</strong>
              <p>${escapeHtml(targetConfig.rule)}</p>
            </div>
            <div class="arcade-runner-hero" data-hero-lane="${heroLane}">
              ${renderTaskCharacterAvatar(task, 4, 78)}
              <span></span>
            </div>
            ${platforms.map((item, index) => `
              <button class="arcade-platform arcade-platform--lane-${index}" type="button" data-type="${escapeHtml(item.type)}" data-cue="${escapeHtml(item.cue)}" data-explanation="${escapeHtml(item.explanation)}" aria-label="${escapeHtml(item.word)}">
                <span>${escapeHtml(item.word)}</span>
                <small>${escapeHtml(item.hint || 'Wortkarte')}</small>
              </button>
            `).join('')}
            <div class="arcade-runner-help">Tippe die richtige Plattform, der Charakter springt dorthin.</div>
          </div>
          <div class="arcade-progress">${Array.from({ length: total }, (_, index) => `<i class="${index < round ? 'is-done' : index === round ? 'is-now' : ''}"></i>`).join('')}</div>
        </div>
      `;

      const hero = container.querySelector('.arcade-runner-hero');
      const hudStatus = container.querySelector('.arcade-hud em');
      const stage = container.querySelector('.arcade-runner-stage');

      const choose = (button) => {
        if (!button || done || locked) return;
        locked = true;
        const buttons = [...container.querySelectorAll('.arcade-platform')];
        buttons.forEach((platform) => {
          platform.disabled = true;
          if (platform !== button) {
            platform.classList.add('is-muted');
          }
        });
        const lane = Number([...button.classList].find((name) => name.startsWith('arcade-platform--lane-'))?.split('-').pop() || 1);
        heroLane = Number.isFinite(lane) ? lane : heroLane;
        hero?.setAttribute('data-hero-lane', String(heroLane));
        hero?.classList.add('is-jumping');
        cleanup.timer(setTimeout(() => hero?.classList.remove('is-jumping'), 380));

        const hit = button.dataset.type === targetType;
        const word = button.querySelector('span')?.textContent || 'Wort';
        button.classList.add(hit ? 'is-hit' : 'is-miss');
        if (hudStatus) {
          hudStatus.textContent = hit
            ? `Treffer! ${score + 1}/${total}`
            : `Falsch: ${button.dataset.type || 'Auswahl'} statt ${targetType}`;
        }

        const smallLabel = button.querySelector('small');
        if (smallLabel) {
          smallLabel.textContent = button.dataset.type || targetType;
        }

        if (stage) {
          const feedback = document.createElement('div');
          feedback.className = `arcade-feedback ${hit ? 'is-hit' : 'is-miss'}`;
          feedback.innerHTML = hit
            ? `<strong>Treffer!</strong><span>${escapeHtml(word)} ist ${escapeHtml(targetType)}. ${escapeHtml(button.dataset.explanation || '')}</span>`
            : `<strong>Noch nicht.</strong><span>${escapeHtml(word)} ist ${escapeHtml(button.dataset.type || 'eine andere Wortart')}. Gesucht war ${escapeHtml(targetType)}.</span>`;
          stage.appendChild(feedback);
        }
        SoundManager.play(hit ? 'pop' : 'error');
        score += hit ? 1 : 0;
        misses += hit ? 0 : 1;
        round += 1;
        cleanup.timer(setTimeout(renderRound, hit ? 900 : 1150));
      };

      container.querySelectorAll('.arcade-platform').forEach((button) => {
        cleanup.on(button, 'click', () => choose(button));
      });

    };

    renderRound();
    return () => cleanup.clear();
  }
};

export const SchneeballWortschlacht = {
  id: 'schneeball-wortschlacht',
  name_de: 'Schneeball-Wortschlacht',
  description: 'Ego-Shooter-Gefühl ohne Gewalt: nur die passenden Wortarten mit Schneebällen treffen.',
  topics: ['wortarten', 'nomen', 'verben', 'adjektive'],
  supportsDirectPlay: true,
  usesInternalTimer: false,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 8,
  mascotIndex: 1,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const cleanup = makeCleanupBag();
    const focusConfig = wordTypeConfigForTopic(task.topic);
    const targetType = focusConfig?.label || pick(WORD_TYPE_LABELS);
    const wordDeck = buildWordTypeDeck(task);
    const requestedCorrect = roundCount(task, 8);
    const correctPool = wordDeck[targetType]?.length
      ? wordDeck[targetType]
      : WORD_TYPES.filter((item) => item.type === targetType);
    const correctTargets = shuffle(correctPool).slice(0, requestedCorrect);
    const targetGoal = correctTargets.length;
    const decoyTargets = WORD_TYPE_LABELS
      .filter((type) => type !== targetType)
      .flatMap((type) => wordDeck[type]?.length ? wordDeck[type] : WORD_TYPES.filter((item) => item.type === type));
    const targets = shuffle([
      ...correctTargets,
      ...shuffle(decoyTargets).slice(0, 7)
    ]).slice(0, 12);
    let hits = 0;
    let misses = 0;
    let remainingCorrect = targetGoal;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      cleanup.timer(setTimeout(() => onComplete(resultFrom(hits, targetGoal, misses)), 680));
    };

    container.innerHTML = `
      <div class="arcade-game arcade-game--snow">
        ${buildHud({
          kicker: 'Schneeball-Arena',
          title: `Triff nur: ${targetType}`,
          status: `Treffer ${hits}/${targetGoal}`
        })}
        <div class="snow-arena">
          <div class="snow-crosshair"></div>
          <div class="snow-horizon"></div>
          ${targets.map((target, index) => `
            <button class="snow-target snow-target--${index % 5}" type="button" data-type="${escapeHtml(target.type)}" style="--x:${SNOW_TARGET_POSITIONS[index].x}%; --y:${SNOW_TARGET_POSITIONS[index].y}%; --mobile-x:${SNOW_TARGET_POSITIONS[index].mobileX}%; --mobile-y:${SNOW_TARGET_POSITIONS[index].mobileY}%;">
              <span>${escapeHtml(target.word)}</span>
              <small>${escapeHtml(target.type)}</small>
            </button>
          `).join('')}
          <div class="snow-blaster">
            ${renderTaskCharacterAvatar(task, 1, 74)}
            <span>Schneeball</span>
          </div>
        </div>
      </div>
    `;

    const hudStatus = container.querySelector('.arcade-hud em');
    container.querySelectorAll('.snow-target').forEach((button) => {
      cleanup.on(button, 'click', () => {
        if (done || button.disabled) return;
        const correct = button.dataset.type === targetType;
        const splat = document.createElement('i');
        splat.className = `snow-splat ${correct ? 'is-hit' : 'is-miss'}`;
        button.appendChild(splat);
        button.classList.add(correct ? 'is-hit' : 'is-miss');
        SoundManager.play(correct ? 'pop' : 'error');
        if (correct) {
          hits += 1;
          remainingCorrect -= 1;
          button.disabled = true;
          cleanup.timer(setTimeout(() => button.remove(), 340));
        } else {
          misses += 1;
          cleanup.timer(setTimeout(() => button.classList.remove('is-miss'), 460));
        }
        if (hudStatus) hudStatus.textContent = `Treffer ${hits}/${targetGoal}`;
        if (hits >= targetGoal || remainingCorrect <= 0) finish();
      });
    });

    return () => cleanup.clear();
  }
};

export const ArtikelGateRunner = {
  id: 'artikel-gate-runner',
  name_de: 'Artikel-Gate-Runner',
  description: 'Runner mit drei Toren: der, die oder das im richtigen Moment wählen.',
  topics: ['artikel', 'nomen'],
  supportsDirectPlay: true,
  usesInternalTimer: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 8,
  mascotIndex: 3,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const cleanup = makeCleanupBag();
    const questions = shuffle(ARTICLES).slice(0, roundCount(task, 8));
    let index = 0;
    let score = 0;
    let misses = 0;
    let lane = 1;
    let locked = false;

    const render = () => {
      if (index >= questions.length) {
        SoundManager.play(score >= Math.ceil(questions.length * 0.75) ? 'finish' : 'failSoft');
        cleanup.timer(setTimeout(() => onComplete(resultFrom(score, questions.length, misses)), 700));
        return;
      }

      const item = questions[index];
      container.innerHTML = `
        <div class="arcade-game arcade-game--gates">
          ${buildHud({
            kicker: 'Gate Runner',
            title: `Artikel für: ${item.word}`,
            status: `${index + 1}/${questions.length} · ${score} Treffer`
          })}
          <div class="gate-road" data-lane="${lane}">
            <div class="gate-sky" aria-hidden="true">
              <span class="gate-cloud gate-cloud--one"></span>
              <span class="gate-cloud gate-cloud--two"></span>
              <span class="gate-sun"></span>
            </div>
            <div class="gate-hills gate-hills--back" aria-hidden="true"></div>
            <div class="gate-hills gate-hills--front" aria-hidden="true"></div>
            <div class="gate-track" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <div class="gate-start-flag" aria-hidden="true">Start</div>
            <div class="gate-finish-banner" aria-hidden="true">Artikel-Tore</div>
            <div class="gate-runner">${renderTaskCharacterAvatar(task, 3, 116)}<span></span><i></i></div>
            ${['der', 'die', 'das'].map((article, gateIndex) => `
              <button class="gate-option gate-option--${gateIndex}" type="button" data-answer="${article}">
                <strong>${article}</strong>
                <span>Tor ${gateIndex + 1}</span>
              </button>
            `).join('')}
            <div class="gate-word-card ${item.image ? 'gate-word-card--photo' : ''}">
              <span>Welches Tor passt?</span>
              ${item.image
                ? `<img class="gate-word-image" src="${escapeHtml(item.image)}?v=cards-12" alt="${escapeHtml(item.word)}" draggable="false">`
                : `<strong>${escapeHtml(item.word)}</strong>`}
            </div>
          </div>
        </div>
      `;

      locked = false;
      const road = container.querySelector('.gate-road');
      const choose = (answer) => {
        if (locked) return;
        locked = true;
        const hit = answer === item.answer;
        const button = container.querySelector(`[data-answer="${answer}"]`);
        container.querySelectorAll('.gate-option').forEach((option) => {
          option.disabled = true;
          if (option !== button) {
            option.classList.add('is-muted');
          }
        });
        button?.classList.add(hit ? 'is-hit' : 'is-miss');
        road?.classList.add(hit ? 'is-hit' : 'is-miss', 'is-sprinting');
        if (road) {
          const feedback = document.createElement('div');
          feedback.className = `gate-feedback ${hit ? 'is-hit' : 'is-miss'}`;
          feedback.innerHTML = hit
            ? `<strong>Tor offen!</strong><span>${escapeHtml(item.answer)} ${escapeHtml(item.word)}</span>`
            : `<strong>Tor klemmt.</strong><span>Richtig wäre: ${escapeHtml(item.answer)} ${escapeHtml(item.word)}</span>`;
          road.appendChild(feedback);
        }
        score += hit ? 1 : 0;
        misses += hit ? 0 : 1;
        SoundManager.play(hit ? 'fieldLand' : 'error');
        index += 1;
        cleanup.timer(setTimeout(render, hit ? 560 : 800));
      };

      container.querySelectorAll('.gate-option').forEach((button, gateIndex) => {
        cleanup.on(button, 'click', () => {
          lane = gateIndex;
          road?.setAttribute('data-lane', String(lane));
          choose(button.dataset.answer);
        });
      });

    };

    render();
    return () => cleanup.clear();
  }
};

export const SilbenBeatSurfer = {
  id: 'silben-beat-surfer',
  name_de: 'Silben-Beat-Surfer',
  description: 'Rhythmusspiel: auf dem richtigen Silben-Beat landen, bevor die Welle durch ist.',
  topics: ['silben', 'konzentration'],
  supportsDirectPlay: true,
  usesInternalTimer: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 7,
  mascotIndex: 7,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const cleanup = makeCleanupBag();
    const rounds = shuffle(SYLLABLES).slice(0, roundCount(task, 7));
    let index = 0;
    let score = 0;
    let misses = 0;

    const render = () => {
      if (index >= rounds.length) {
        cleanup.timer(setTimeout(() => onComplete(resultFrom(score, rounds.length, misses)), 700));
        return;
      }

      const item = rounds[index];
      container.innerHTML = `
        <div class="arcade-game arcade-game--beat">
          ${buildHud({
            kicker: 'Beat Surfer',
            title: `Silben surfen: ${item.word}`,
            status: `${index + 1}/${rounds.length} · ${score} sauber`
          })}
          <div class="beat-stage">
            <div class="beat-wave"><span></span></div>
            <div class="beat-word">${escapeHtml(item.word)}</div>
            <div class="beat-pads">
              ${[1, 2, 3, 4].map((beat) => `
                <button class="beat-pad" type="button" data-beat="${beat}">
                  <strong>${beat}</strong>
                  <span>${beat === 1 ? 'Silbe' : 'Silben'}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      container.querySelectorAll('.beat-pad').forEach((button) => {
        cleanup.on(button, 'click', () => {
          if (button.closest('.arcade-game')?.classList.contains('is-locked')) return;
          button.closest('.arcade-game')?.classList.add('is-locked');
          const hit = Number(button.dataset.beat) === item.beats;
          button.classList.add(hit ? 'is-hit' : 'is-miss');
          SoundManager.play(hit ? 'woodBlock' : 'error');
          score += hit ? 1 : 0;
          misses += hit ? 0 : 1;
          index += 1;
          cleanup.timer(setTimeout(render, hit ? 520 : 820));
        });
      });
    };

    render();
    return () => cleanup.clear();
  }
};

export const SatzJetpack = {
  id: 'satz-jetpack',
  name_de: 'Satz-Jetpack',
  description: 'Baue Sätze im Flug: sammle die Wörter in richtiger Reihenfolge, bevor der Treibstoff sinkt.',
  topics: ['satzbau', 'lesen', 'grammatik'],
  supportsDirectPlay: true,
  usesInternalTimer: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 4,
  mascotIndex: 8,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const cleanup = makeCleanupBag();
    const sentence = pick(SENTENCES);
    const words = shuffle(sentence.map((word, index) => ({ word, index })));
    let current = 0;
    let misses = 0;
    let fuel = 100;
    let done = false;

    const finish = (force = false) => {
      if (done) return;
      if (!force && current < sentence.length) return;
      done = true;
      SoundManager.play(current === sentence.length ? 'finish' : 'failSoft');
      cleanup.timer(setTimeout(() => onComplete(resultFrom(current, sentence.length, misses)), 720));
    };

    container.innerHTML = `
      <div class="arcade-game arcade-game--jetpack">
        ${buildHud({
          kicker: 'Jetpack',
          title: 'Sammle den Satz in Reihenfolge',
          status: `${current}/${sentence.length} Wörter`
        })}
        <div class="jet-stage">
          <div class="jet-fuel"><span style="width:${fuel}%"></span></div>
          <div class="jet-hero">${renderTaskCharacterAvatar(task, 8, 84)}<i></i></div>
          <div class="jet-slots">${sentence.map((_, index) => `<span data-slot="${index}"></span>`).join('')}</div>
          ${words.map((entry, index) => `
            <button class="jet-word jet-word--${index % 6}" type="button" data-index="${entry.index}">
              ${escapeHtml(entry.word)}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const updateHud = () => {
      const status = container.querySelector('.arcade-hud em');
      const fuelBar = container.querySelector('.jet-fuel span');
      if (status) status.textContent = `${current}/${sentence.length} Wörter`;
      if (fuelBar) fuelBar.style.width = `${fuel}%`;
    };

    const intervalId = cleanup.timer(setInterval(() => {
      if (done) return;
      fuel = Math.max(0, fuel - 3);
      updateHud();
      if (fuel <= 0) finish(true);
    }, 700));

    container.querySelectorAll('.jet-word').forEach((button) => {
      cleanup.on(button, 'click', () => {
        if (done || button.disabled) return;
        const expectedIndex = Number(button.dataset.index);
        const hit = expectedIndex === current;
        if (!hit) {
          misses += 1;
          fuel = Math.max(0, fuel - 14);
          button.classList.add('is-miss');
          SoundManager.play('error');
          cleanup.timer(setTimeout(() => button.classList.remove('is-miss'), 360));
          updateHud();
          return;
        }

        const slot = container.querySelector(`[data-slot="${current}"]`);
        if (slot) {
          slot.textContent = button.textContent.trim();
          slot.classList.add('is-filled');
        }
        button.disabled = true;
        button.classList.add('is-hit');
        SoundManager.play('whoosh');
        current += 1;
        fuel = Math.min(100, fuel + 6);
        updateHud();
        if (current >= sentence.length) {
          clearInterval(intervalId);
          finish(true);
        }
      });
    });

    return () => cleanup.clear();
  }
};

export const WortLabyrinthJagd = {
  id: 'wort-labyrinth-jagd',
  name_de: 'Wort-Labyrinth',
  description: 'Pac-Man-inspiriert: bewege die Figur durchs Labyrinth und sammle nur die richtige Wortart.',
  topics: ['wortarten', 'nomen', 'verben', 'adjektive'],
  supportsDirectPlay: true,
  usesInternalTimer: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 9,
  mascotIndex: 2,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const cleanup = makeCleanupBag();
    const deck = buildWordTypeDeck(task);
    const usedWords = new Set();
    const targetType = wordTypeLabelForTask(task) || pick(WORD_TYPE_LABELS);
    const targetGoal = clamp(Number(task.partyConfig?.rounds || task.rounds || 5), 4, 6);
    const decoyCount = MAZE_WORD_SPOTS.length - targetGoal;
    const targetWords = Array.from({ length: targetGoal }, () => takeWordTypeItem(deck, targetType, usedWords)).filter(Boolean);
    const decoyTypes = shuffle(WORD_TYPE_LABELS.filter((type) => type !== targetType));
    const decoyWords = Array.from({ length: decoyCount }, (_, index) => {
      const decoyType = decoyTypes[index % decoyTypes.length] || pick(WORD_TYPE_LABELS.filter((type) => type !== targetType));
      return takeWordTypeItem(deck, decoyType, usedWords);
    }).filter(Boolean);
    const tokens = shuffle([...targetWords, ...decoyWords]).slice(0, MAZE_WORD_SPOTS.length).map((entry, index) => ({
      ...entry,
      id: `maze-token-${index}`,
      x: MAZE_WORD_SPOTS[index][0],
      y: MAZE_WORD_SPOTS[index][1],
      collected: false
    }));
    let player = { x: 1, y: 1 };
    let score = 0;
    let misses = 0;
    let done = false;
    let timerStarted = false;
    let remainingSeconds = clamp(Number(task.timerSeconds || task.partyConfig?.timeLimitSec || DIRECT_DEFAULTS.solo_arcade.timeLimitSec), 18, 60);

    const targetCount = tokens.filter((token) => token.type === targetType).length;
    const cellHtml = MAZE_MAP.map((row, y) => [...row].map((cell, x) => `
      <span class="maze-cell ${cell === '#' ? 'is-wall' : 'is-path'}" style="--c:${x + 1}; --r:${y + 1};"></span>
    `).join('')).join('');

    container.innerHTML = `
      <div class="arcade-game arcade-game--maze">
        ${buildHud({
          kicker: 'Labyrinth',
          title: `Sammle: ${targetType}`,
          status: `0/${targetCount} · Timer startet beim ersten Zug`
        })}
        <div class="maze-stage">
          <div class="maze-grid">
            ${cellHtml}
            <span class="maze-sign maze-sign--start" style="--c:1; --r:9;">Start</span>
            <span class="maze-sign maze-sign--goal" style="--c:12; --r:1;">Ziel</span>
            ${tokens.map((token) => `
              <button class="maze-word-token ${token.type === targetType ? 'is-target' : 'is-decoy'}" style="--c:${token.x + 1}; --r:${token.y + 1};" data-token="${token.id}" type="button">
                ${escapeHtml(token.word)}
              </button>
            `).join('')}
            ${MAZE_TRAPS.map(([x, y], index) => `<span class="maze-chaser maze-chaser--${index}" style="--c:${x + 1}; --r:${y + 1};"></span>`).join('')}
            <div class="maze-player" style="--c:${player.x + 1}; --r:${player.y + 1};">${renderTaskCharacterAvatar(task, 2, 60)}</div>
          </div>
          <div class="maze-controls" aria-label="Labyrinth-Steuerung">
            <button type="button" data-move="up">↑</button>
            <button type="button" data-move="left">←</button>
            <button type="button" data-move="down">↓</button>
            <button type="button" data-move="right">→</button>
          </div>
        </div>
      </div>
    `;

    const finish = ({ timeout = false } = {}) => {
      if (done) return;
      done = true;
      SoundManager.play(score >= targetCount ? 'finish' : 'failSoft');
      cleanup.timer(setTimeout(() => onComplete({
        ...resultFrom(score, targetCount, misses),
        timeout,
        details: { score, misses, targetCount, targetType }
      }), 560));
    };

    const update = () => {
      const playerEl = container.querySelector('.maze-player');
      if (playerEl) {
        playerEl.style.setProperty('--c', String(player.x + 1));
        playerEl.style.setProperty('--r', String(player.y + 1));
      }
      const hudStatus = container.querySelector('.arcade-hud em');
      if (hudStatus) {
        const timerText = timerStarted ? `Zeit ${remainingSeconds}s` : 'Timer startet beim ersten Zug';
        hudStatus.textContent = `${score}/${targetCount} · ${timerText} · Fehler ${misses}`;
      }
    };

    const startTimer = () => {
      if (timerStarted || done) return;
      timerStarted = true;
      update();
      cleanup.timer(setInterval(() => {
        if (done) return;
        remainingSeconds -= 1;
        update();
        if (remainingSeconds > 0 && remainingSeconds <= 5) {
          SoundManager.play('tick');
        }
        if (remainingSeconds <= 0) {
          finish({ timeout: true });
        }
      }, 1000));
    };

    const move = (dx, dy) => {
      if (done) return;
      startTimer();
      const next = { x: player.x + dx, y: player.y + dy };
      if (MAZE_MAP[next.y]?.[next.x] === '#') {
        SoundManager.play('uiClick');
        return;
      }
      player = next;
      const token = tokens.find((entry) => !entry.collected && entry.x === player.x && entry.y === player.y);
      if (token) {
        token.collected = true;
        const tokenEl = container.querySelector(`[data-token="${token.id}"]`);
        tokenEl?.classList.add(token.type === targetType ? 'is-hit' : 'is-miss', 'is-collected');
        if (token.type === targetType) {
          score += 1;
          SoundManager.play('pop');
        } else {
          misses += 1;
          SoundManager.play('error');
        }
      }
      if (MAZE_TRAPS.some(([x, y]) => x === player.x && y === player.y)) {
        misses += 1;
        SoundManager.play('error');
        container.querySelector('.maze-player')?.classList.add('is-hit');
        cleanup.timer(setTimeout(() => container.querySelector('.maze-player')?.classList.remove('is-hit'), 280));
      }
      update();
      if (score >= targetCount) finish();
    };

    const moves = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0]
    };

    container.querySelectorAll('[data-move]').forEach((button) => {
      cleanup.on(button, 'click', () => {
        const [dx, dy] = moves[button.dataset.move] || [0, 0];
        move(dx, dy);
      });
    });

    cleanup.on(window, 'keydown', (event) => {
      const keyMoves = {
        ArrowUp: moves.up,
        w: moves.up,
        W: moves.up,
        ArrowDown: moves.down,
        s: moves.down,
        S: moves.down,
        ArrowLeft: moves.left,
        a: moves.left,
        A: moves.left,
        ArrowRight: moves.right,
        d: moves.right,
        D: moves.right
      };
      const vector = keyMoves[event.key];
      if (!vector) return;
      event.preventDefault();
      move(vector[0], vector[1]);
    });

    return () => cleanup.clear();
  }
};

export const ArtikelInvaders = {
  id: 'artikel-invaders',
  name_de: 'Artikel-Invaders',
  description: 'Space-Invaders-inspiriert: wähle den Kanonen-Artikel und schieße passende Wort-Ufos ab.',
  topics: ['artikel', 'nomen'],
  supportsDirectPlay: true,
  usesInternalTimer: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 12,
  mascotIndex: 1,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const cleanup = makeCleanupBag();
    const invaders = shuffle(ARTICLES).slice(0, Math.max(10, roundCount(task, 10))).map((entry, index) => ({
      ...entry,
      id: `invader-${index}`,
      destroyed: false
    }));
    let selected = 'der';
    let score = 0;
    let misses = 0;
    let pressure = 0;
    let done = false;
    let pressureStarted = false;
    const pressureLimitSec = clamp(Number(task.timerSeconds || task.partyConfig?.timeLimitSec || DIRECT_DEFAULTS.solo_arcade.timeLimitSec), 18, 60);
    const pressureTickMs = 1300;
    const pressureStep = Math.max(1, Math.ceil(100 / Math.max(1, Math.round((pressureLimitSec * 1000) / pressureTickMs))));

    container.innerHTML = `
      <div class="arcade-game arcade-game--invaders">
        ${buildHud({
          kicker: 'Invaders',
          title: 'Artikel-Kanone',
          status: `0/${invaders.length} · Druck startet beim ersten Schuss`
        })}
        <div class="invaders-stage">
          <div class="invader-sky" aria-hidden="true"></div>
          <div class="invader-fleet">
            ${invaders.map((entry, index) => `
              <button class="invader-target invader-target--${index % 5} invader-target--${entry.answer}" type="button" style="--bob:${(2.2 + (index % 4) * 0.18).toFixed(2)}s;" data-target="${entry.id}" data-answer="${entry.answer}">
                <i aria-hidden="true"></i>
                <span>${escapeHtml(entry.word)}</span>
                <small>Wort-Ufo</small>
              </button>
            `).join('')}
          </div>
          <div class="invader-cannon">
            <div class="invader-hero">${renderTaskCharacterAvatar(task, 1, 72)}</div>
            <div class="invader-cannon-body" aria-hidden="true"><span></span></div>
            <div class="invader-articles">
              ${['der', 'die', 'das'].map((article) => `<button class="${article === selected ? 'is-active' : ''}" type="button" data-article="${article}">${article}</button>`).join('')}
            </div>
          </div>
          <div class="invader-pressure"><span style="width:${pressure}%"></span></div>
        </div>
      </div>
    `;

    const finish = () => {
      if (done) return;
      done = true;
      SoundManager.play(score >= Math.ceil(invaders.length * 0.72) ? 'finish' : 'failSoft');
      cleanup.timer(setTimeout(() => onComplete(resultFrom(score, invaders.length, misses)), 650));
    };

    const update = () => {
      const hudStatus = container.querySelector('.arcade-hud em');
      const pressureBar = container.querySelector('.invader-pressure span');
      if (hudStatus) {
        const pressureText = pressureStarted ? `Druck ${pressure}%` : 'Druck startet beim ersten Schuss';
        hudStatus.textContent = `${score}/${invaders.length} · ${pressureText} · Fehler ${misses}`;
      }
      if (pressureBar) pressureBar.style.width = `${pressure}%`;
      container.querySelectorAll('[data-article]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.article === selected);
      });
    };

    const startPressure = () => {
      if (pressureStarted || done) return;
      pressureStarted = true;
      update();
      cleanup.timer(setInterval(() => {
        if (done) return;
        pressure = Math.min(100, pressure + pressureStep);
        update();
        if (pressure >= 100) finish();
      }, pressureTickMs));
    };

    container.querySelectorAll('[data-article]').forEach((button) => {
      cleanup.on(button, 'click', () => {
        selected = button.dataset.article;
        SoundManager.play('uiClick');
        update();
      });
    });

    container.querySelectorAll('.invader-target').forEach((button) => {
      cleanup.on(button, 'click', () => {
        if (done || button.disabled) return;
        startPressure();
        const hit = button.dataset.answer === selected;
        button.classList.add(hit ? 'is-hit' : 'is-miss');
        SoundManager.play(hit ? 'whoosh' : 'error');
        if (hit) {
          button.disabled = true;
          score += 1;
          cleanup.timer(setTimeout(() => button.classList.add('is-destroyed'), 180));
        } else {
          misses += 1;
          pressure = Math.min(100, pressure + 9);
          cleanup.timer(setTimeout(() => button.classList.remove('is-miss'), 360));
        }
        update();
        if (score >= invaders.length || pressure >= 100) finish();
      });
    });

    return () => cleanup.clear();
  }
};

export const WortTetrisStapel = {
  id: 'wort-tetris-stapel',
  name_de: 'Wort-Tetris',
  description: 'Tetris-inspiriert: fallende Wortblöcke in die richtige Wortarten-Spalte sortieren und Reihen räumen.',
  topics: ['wortarten', 'nomen', 'verben', 'adjektive'],
  supportsDirectPlay: true,
  usesInternalTimer: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 12,
  mascotIndex: 6,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const cleanup = makeCleanupBag();
    const pieces = shuffle([...WORD_TYPES, ...WORD_TYPES]).slice(0, Math.max(10, roundCount(task, 10)));
    const stacks = {
      Nomen: [],
      Verb: [],
      Adjektiv: []
    };
    let index = 0;
    let score = 0;
    let misses = 0;
    let cleared = 0;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      SoundManager.play(score >= Math.ceil(pieces.length * 0.72) ? 'finish' : 'failSoft');
      cleanup.timer(setTimeout(() => onComplete(resultFrom(score + cleared, pieces.length + 2, misses)), 650));
    };

    const render = () => {
      const piece = pieces[index];
      if (!piece) {
        finish();
        return;
      }

      container.innerHTML = `
        <div class="arcade-game arcade-game--wordtris">
          ${buildHud({
            kicker: 'Wort-Tetris',
            title: `Block: ${piece.word}`,
            status: `${index + 1}/${pieces.length} · Reihen ${cleared}`
          })}
          <div class="wordtris-stage">
            <div class="wordtris-score-ribbon" aria-hidden="true">
              <span>1</span><span>2</span><span>3</span>
            </div>
            <div class="wordtris-piece">
              <strong>${escapeHtml(piece.word)}</strong>
              <span>${escapeHtml(piece.hint)}</span>
            </div>
            <div class="wordtris-wells">
              ${WORD_TYPE_LABELS.map((type) => `
                <button class="wordtris-well" type="button" data-type="${type}">
                  <strong>${type}</strong>
                  <span class="wordtris-stack">
                    ${stacks[type].slice(-5).map((entry) => `<i>${escapeHtml(entry.word)}</i>`).join('')}
                  </span>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      container.querySelectorAll('.wordtris-well').forEach((button) => {
        cleanup.on(button, 'click', () => {
          if (done || button.closest('.arcade-game')?.classList.contains('is-locked')) return;
          button.closest('.arcade-game')?.classList.add('is-locked');
          const type = button.dataset.type;
          const hit = type === piece.type;
          stacks[type].push(piece);
          button.classList.add(hit ? 'is-hit' : 'is-miss');
          SoundManager.play(hit ? 'woodBlock' : 'error');
          score += hit ? 1 : 0;
          misses += hit ? 0 : 1;

          if (WORD_TYPE_LABELS.every((label) => stacks[label].length > 0)) {
            WORD_TYPE_LABELS.forEach((label) => stacks[label].shift());
            cleared += 1;
            SoundManager.play('finish');
          }

          index += 1;
          cleanup.timer(setTimeout(render, hit ? 520 : 780));
        });
      });
    };

    cleanup.on(window, 'keydown', (event) => {
      const keyMap = { 1: 'Nomen', 2: 'Verb', 3: 'Adjektiv' };
      const type = keyMap[event.key];
      if (!type) return;
      event.preventDefault();
      container.querySelector(`[data-type="${type}"]`)?.click();
    });

    render();
    return () => cleanup.clear();
  }
};

export const GrammatikBossfight = {
  id: 'grammatik-bossfight',
  name_de: 'Grammatik-Bossfight',
  description: 'Bosskampf: richtige Antworten brechen Schilde, falsche Antworten kosten Combo.',
  topics: ['grammatik', 'wortarten', 'artikel', 'silben', 'rechtschreibung'],
  supportsDirectPlay: true,
  usesInternalTimer: true,
  directPlayDefaults: DIRECT_DEFAULTS,
  defaultRounds: 6,
  mascotIndex: 10,

  setup(container, task, onComplete) {
    SoundManager.play('gameStart');
    const cleanup = makeCleanupBag();
    const questions = shuffle(BOSS_QUESTIONS).slice(0, roundCount(task, 6));
    let index = 0;
    let hp = questions.length;
    let score = 0;
    let misses = 0;
    let locked = false;

    const render = () => {
      if (hp <= 0 || index >= questions.length) {
        cleanup.timer(setTimeout(() => onComplete(resultFrom(score, questions.length, misses)), 820));
        return;
      }

      const q = questions[index];
      container.innerHTML = `
        <div class="arcade-game arcade-game--boss">
          ${buildHud({
            kicker: 'Bossfight',
            title: q.prompt,
            status: `Boss-HP ${hp}/${questions.length}`
          })}
          <div class="boss-stage" style="--boss-hp:${(hp / questions.length) * 100}%">
            <div class="boss-health"><span></span></div>
            <div class="boss-creature">
              <div class="boss-face">${renderTaskCharacterAvatar(task, 10, 128)}</div>
              <strong>Wortmonster</strong>
            </div>
            <div class="boss-shields">
              ${shuffle(q.options).map((option) => `
                <button class="boss-shield" type="button" data-answer="${escapeHtml(option)}">
                  ${escapeHtml(option)}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      locked = false;
      container.querySelectorAll('.boss-shield').forEach((button) => {
        cleanup.on(button, 'click', () => {
          if (locked) return;
          locked = true;
          const hit = button.dataset.answer === q.answer;
          button.classList.add(hit ? 'is-hit' : 'is-miss');
          container.querySelector('.boss-creature')?.classList.add(hit ? 'is-hit' : 'is-miss');
          SoundManager.play(hit ? 'stamp' : 'error');
          score += hit ? 1 : 0;
          misses += hit ? 0 : 1;
          hp -= hit ? 1 : 0;
          index += 1;
          cleanup.timer(setTimeout(render, hit ? 650 : 920));
        });
      });
    };

    render();
    return () => cleanup.clear();
  }
};
