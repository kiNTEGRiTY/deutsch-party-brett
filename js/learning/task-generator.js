/**
 * Task Generator - Central dispatcher for learning tasks
 * 
 * Selects appropriate mini-games based on active topics and difficulty,
 * then generates the task content from the language module.
 */

import GermanModule from './languages/de/index.js?v=arcade-mobile-shell-41';
import { getTimerDuration } from './difficulty.js';
import { buildTaskPartyConfig } from '../minigames/core/party-game-core.js';
import { filterBoardReadyMinigames } from '../minigames/quality-gate.js?v=arcade-mobile-shell-41';

// Language module registry - future: add English here
const LANGUAGE_MODULES = {
  de: GermanModule,
  // en: EnglishModule  // Future: import and register English module
};

let activeLanguage = 'de';

/**
 * Set the active language
 */
export function setLanguage(langId) {
  if (LANGUAGE_MODULES[langId]) {
    activeLanguage = langId;
  }
}

/**
 * Get the active language module
 */
export function getLanguageModule() {
  return LANGUAGE_MODULES[activeLanguage];
}

/**
 * Get UI strings from active language
 */
export function getUIStrings() {
  return getLanguageModule().getUIStrings();
}

/**
 * Topic to mini-game mapping
 * Each topic can be served by multiple mini-game types
 */
const TOPIC_MINIGAME_MAP = {
  nomen:          ['karten-klick-labor', 'kartenlupe-wortfang', 'wortkarten-blitzwahl', 'artikel-stempelstudio', 'artikel-sortierband', 'tierblatt-spurensuche', 'bildwort-galerie', 'artikel-bildjagd', 'wortarten-sprunglauf', 'schneeball-wortschlacht', 'wortarten-band', 'artikel-atelier', 'wortarten-orchester', 'sentence-stacker', 'scrap-hunt', 'word-type-sort', 'noun-hunter', 'word-ninja', 'gender-sort', 'plural-match', 'whack-a-noun', 'word-avalanche', 'substantiv-only'],
  verben:         ['wortarten-sprunglauf', 'schneeball-wortschlacht', 'wortarten-band', 'verb-takt', 'satz-flickwerk', 'wortarten-orchester', 'sentence-stacker', 'word-type-sort', 'word-ninja', 'verb-pulse', 'tense-switcher', 'word-family-tree', 'verb-only'],
  adjektive:      ['wortarten-sprunglauf', 'schneeball-wortschlacht', 'wortarten-band', 'wortarten-orchester', 'wortfunkeln', 'satz-flickwerk', 'sentence-stacker', 'word-type-sort', 'adjective-painter', 'word-balance', 'bubble-burst'],
  artikel:        ['artikel-stempelstudio', 'artikel-sortierband', 'artikel-bildjagd', 'artikel-atelier', 'artikel-atelier', 'article-choice', 'article-cannon', 'gender-sort'],
  satzbau:        ['figuren-satztheater', 'satz-storyboard', 'dialog-spotlight', 'satz-flickwerk', 'satz-kompass', 'satz-kompass', 'sentence-stacker', 'sentence-stacker', 'sentence-order', 'sentence-train', 'word-stacker', 'sentence-scramble', 'sentence-bridge', 'sentence-architect', 'sentence-symphony'],
  satzarten:      ['satz-kompass', 'figuren-satztheater', 'satz-storyboard'],
  lueckentexte:   ['satz-flickwerk', 'satz-kompass', 'fehlerlupe'],
  rechtschreibung:['anfangsbuchstaben-lupe', 'anfangspaar-jagd', 'wortkarten-domino', 'buchstaben-magneten', 'fehlerlupe', 'spelling-detective', 'word-meteorites', 'lie-detector', 'anagram-blast', 'missing-letter', 'word-search-swipe', 'double-letter', 'capital-detective', 'mirror-word', 'letter-drop', 'word-star', 'slingshot-spelling', 'secret-agent-code', 'vowel-vacuum', 'word-puzzle-3x3', 'word-pyramid', 'spelling-bee-de', 'word-balloon', 'verbotener-buchstabe', 'wort-morph', 'forbidden_letter_trap', 'word_ending', 'word_length_hunt'],
  fehlerkorrektur:['fehlerlupe', 'spelling-detective', 'lie-detector', 'double-letter', 'capital-detective', 'grammar-ghost'],
  gross_klein:    ['anfangsbuchstaben-lupe', 'fehlerlupe'],
  reime:          ['reim-memory-aquarell', 'reimwerk', 'reim-battle', 'rhyme-match', 'rhyme-memory', 'fill-the-poem', 'rhyme-rider'],
  lesen:          ['karten-klick-labor', 'kartenlupe-wortfang', 'wortkarten-blitzwahl', 'tierblatt-spurensuche', 'tiernamen-bingo', 'karten-memory-duo', 'alphabet-kartenreihe', 'anfangspaar-jagd', 'figuren-satztheater', 'wimmelbild-detektiv', 'satz-storyboard', 'dialog-spotlight', 'bildwort-galerie', 'satz-flickwerk', 'satz-kompass', 'wortfunkeln', 'scrap-hunt', 'scrap-hunt', 'fill-blanks', 'word-meteorites', 'cryptogram', 'hidden-object', 'adjective-painter', 'difference-detective', 'speed-flash', 'emoji-translator', 'word-clock', 'sentence-sense', 'story-builder', 'reading-race', 'comic-strip', 'german-idiom', 'password-crack', 'secret-agent-code', 'logic-ladder', 'sentence-sniper', 'idiom-island', 'proverb-path', 'detective-adventure', 'kitchen-chaos', 'sentence-symphony', 'dialogue-duel', 'mystery-box', 'definition-reverse'],
  wortschatz:     ['karten-klick-labor', 'kartenlupe-wortfang', 'wortkarten-blitzwahl', 'tierblatt-spurensuche', 'tiernamen-bingo', 'karten-memory-duo', 'artikel-sortierband', 'bildwort-galerie', 'wimmelbild-detektiv', 'kompositum-atelier', 'reim-memory-aquarell', 'wortfunkeln', 'reimwerk', 'scrap-hunt', 'scrap-hunt', 'word-type-sort', 'word-ninja', 'teakettle-detective', 'cryptogram', 'word-balance', 'memory-chain', 'hidden-object', 'synonym-snap', 'word-chain', 'hot-cold', 'opposite-racer', 'number-words', 'category-blitz', 'emoji-translator', 'definition-match', 'compound-meaning', 'german-idiom', 'word-chess', 'logic-ladder', 'mad-libs-de', 'word-match-fast', 'synonym-bridge', 'antonym-arch', 'word-detective', 'category-cannon', 'crossword-mini', 'detective-adventure', 'grammar-rpg', 'kitchen-chaos', 'word-alchemy', 'mystery-box', 'wort-stau', 'definition-reverse', 'synonym-flucht', 'gegensatz-zwang', 'doppel-kategorie', 'wort-kette', 'fuenf-sec-triple', 'verbotener-buchstabe', 'word_ending', 'word_length_hunt', 'forbidden_letter_trap', 'prefix_duel', 'suffix_duel'],
  silben:         ['silben-klatschkarten', 'silben-trommel', 'silbenstrom', 'syllable-fishing', 'syllable-fishing', 'syllable-counter', 'syllable-dj', 'syllable-stomp', 'silben-reflex', 'silben-tetris'],
  zeitformen:     ['verb-takt', 'time-machine', 'verb-pulse', 'tense-switcher', 'verb-forms', 'tense-tornado', 'time-traveler'],
  satzzeichen:    ['fehlerlupe', 'satz-kompass'],
  zusammengesetzte_nomen: ['kompositum-atelier', 'compound-builder', 'compound-chain', 'split-the-word', 'compound-meaning', 'kompositum-maschine'],
  grammatik:      ['figuren-satztheater', 'dialog-spotlight', 'satz-storyboard', 'satz-flickwerk', 'wortarten-band', 'satz-kompass', 'verb-takt', 'fehlerlupe', 'sentence-stacker', 'preposition-world', 'verb-pulse', 'comma-king', 'question-word-match', 'modal-verb', 'adjective-endings', 'prefix-postfix', 'case-solver', 'grammar-ghost', 'prefix-power', 'suffix-sun', 'grammar-maze', 'detective-adventure', 'grammar-rpg', 'sentence-architect', 'sentence-symphony', 'time-traveler', 'dialogue-duel'],
  konzentration:  ['karten-klick-labor', 'kartenlupe-wortfang', 'wortkarten-blitzwahl', 'tierblatt-spurensuche', 'tiernamen-bingo', 'karten-memory-duo', 'wimmelbild-detektiv', 'reim-memory-aquarell', 'silben-trommel', 'scrap-hunt', 'memory-chain', 'abc-bubbles', 'word-labyrinth', 'speed-flash', 'color-words', 'mirror-word', 'letter-drop', 'word-puzzle-3x3', 'letter-bounce', 'grammar-rpg', 'mystery-box'],
  alphabet:       ['alphabet-kartenreihe', 'anfangsbuchstaben-lupe', 'anfangspaar-jagd', 'wortkarten-domino', 'buchstaben-magneten', 'abc-bubbles', 'word-chain', 'alphabet-sort', 'buchstaben-duell', 'wort-kette', 'doppel-kategorie', 'word_length_hunt'],
  wortarten:      ['wortarten-sprunglauf', 'schneeball-wortschlacht', 'wortarten-band', 'wortarten-orchester', 'sentence-stacker', 'word-type-sort', 'word-ninja', 'whack-a-noun', 'bubble-burst', 'word-avalanche', 'word-chess', 'blitz-quiz', 'gravity-sort', 'mad-libs-de', 'tap-the-type', 'gender-gym', 'article-ace', 'word-fishing', 'suffix-sun', 'kitchen-chaos', 'mystery-box', 'verb-only', 'substantiv-only'],
  wortbildung:    ['buchstaben-magneten', 'word-alchemy', 'wort-evolution', 'silben-tetris', 'wort-schrumpfung', 'kompositum-maschine', 'wort-morph', 'word_ending', 'prefix_duel', 'suffix_duel'],
  // Default fallback
  _default:       ['artikel-stempelstudio', 'karten-klick-labor', 'wortarten-sprunglauf']
};

const TOPIC_ALIASES = {
  adjektiv: 'adjektive'
};

const BOARD_TOPIC_FALLBACK_MAP = Object.freeze({
  pronomen: 'satzbau',
  satzglieder: 'satzbau',
  singular_plural: 'nomen',
  hoerverstehen: 'lesen',
  zeitformen: 'verben',
  satzzeichen: 'satzbau',
  lueckentexte: 'satzbau',
  fehlerkorrektur: 'rechtschreibung',
  reime: 'wortschatz',
  wortbildung: 'zusammengesetzte_nomen'
});

function normalizeTopicId(topic) {
  return TOPIC_ALIASES[topic] || topic;
}

function isGeneratableBoardTopic(topic) {
  return Boolean(TOPIC_MINIGAME_MAP[topic] || BOARD_TOPIC_FALLBACK_MAP[topic]);
}

const FEATURED_MODE_MINIGAME_MAP = {
  challenge: [
    'wimmelbild-detektiv',
    'bildwort-galerie',
    'satz-storyboard',
    'dialog-spotlight',
    'buchstaben-magneten',
    'artikel-invaders',
    'wortarten-sprunglauf',
    'silben-beat-surfer',
    'grammatik-bossfight'
  ],
  team: [
    'wimmelbild-detektiv',
    'satz-storyboard',
    'dialog-spotlight',
    'figuren-satztheater',
    'kompositum-atelier',
    'wortarten-orchester',
    'reimwerk'
  ]
};

const recentMiniGameIds = [];

function getGamePool(topic, fieldType) {
  const featuredPool = FEATURED_MODE_MINIGAME_MAP[fieldType];
  if (featuredPool?.length) {
    const qualityFeaturedPool = filterBoardReadyMinigames(featuredPool);
    if (qualityFeaturedPool.length) {
      return { games: qualityFeaturedPool, topic };
    }
  }

  const qualityPool = filterBoardReadyMinigames(TOPIC_MINIGAME_MAP[topic] || []);
  if (qualityPool.length) {
    return { games: qualityPool, topic };
  }

  const fallbackTopic = BOARD_TOPIC_FALLBACK_MAP[topic];
  const fallbackPool = fallbackTopic
    ? filterBoardReadyMinigames(TOPIC_MINIGAME_MAP[fallbackTopic] || [])
    : [];

  if (fallbackPool.length) {
    return { games: fallbackPool, topic: fallbackTopic, requestedTopic: topic };
  }

  return { games: filterBoardReadyMinigames(TOPIC_MINIGAME_MAP._default), topic: 'artikel', requestedTopic: topic };
}

function pickMiniGameId(games) {
  const pool = games.length > 4
    ? games.filter((gameId) => !recentMiniGameIds.includes(gameId))
    : games;
  const source = pool.length ? pool : games;
  const miniGameId = source[Math.floor(Math.random() * source.length)];
  recentMiniGameIds.push(miniGameId);
  while (recentMiniGameIds.length > 8) {
    recentMiniGameIds.shift();
  }
  return miniGameId;
}

/**
 * Generate a task for a mini-game
 * 
 * @param {string[]} activeTopics - Array of active topic IDs
 * @param {object} difficulty - Difficulty axes
 * @param {string} fieldType - Board field type (normal, challenge, team)
 * @returns {object} Task object with miniGame type, content, and settings
 */
export function generateTask(activeTopics, difficulty, fieldType = 'normal', explicitTopic = null) {
  const lang = getLanguageModule();
  
  let topic;
  const normalizedExplicitTopic = normalizeTopicId(explicitTopic);
  if (normalizedExplicitTopic && isGeneratableBoardTopic(normalizedExplicitTopic)) {
    topic = normalizedExplicitTopic;
  } else {
    // Pick a random active topic
    const candidateTopics = Array.isArray(activeTopics) ? activeTopics : [];
    const validTopics = candidateTopics
      .map((candidate) => normalizeTopicId(candidate))
      .filter((candidate) => isGeneratableBoardTopic(candidate));
    if (validTopics.length === 0) {
      // Fallback to a premium article task.
      validTopics.push('artikel');
    }
    topic = validTopics[Math.floor(Math.random() * validTopics.length)];
  }
  
  // Pick a mini-game for the topic
  const pool = getGamePool(topic, fieldType);
  const games = pool.games;
  const miniGameId = pickMiniGameId(games);
  const resolvedTopic = pool.topic || topic;
  
  // Get content from language module
  const content = lang.getContent(resolvedTopic, difficulty);
  const instructions = lang.getInstructions(miniGameId);
  
  // Calculate timer
  const timerSeconds = getTimerDuration(difficulty.timePressure || 0);
  
  const task = {
    miniGameId,
    topic: resolvedTopic,
    content,
    instructions,
    difficulty,
    timerSeconds,
    fieldType,
    answerOptions: difficulty.answerOptions || 3,
    inputMode: difficulty.inputMode || 0 // 0 = choice, 1 = free
  };

  if (pool.requestedTopic && pool.requestedTopic !== resolvedTopic) {
    task.requestedTopic = pool.requestedTopic;
  }

  task.partyConfig = buildTaskPartyConfig(task, {
    id: miniGameId,
    name: miniGameId,
    rounds: fieldType === 'team' ? 3 : 3
  });

  return task;
}

export function createDirectTask({
  miniGameId,
  topic,
  difficulty = {},
  mode = 'solo_arcade',
  rounds = 3,
  timeLimitSec = null,
  scoringMode = null,
  custom = {}
}) {
  const lang = getLanguageModule();
  const resolvedTopic = normalizeTopicId(topic) || 'wortschatz';
  const timerSeconds = Number(timeLimitSec || getTimerDuration(difficulty.timePressure || 0));
  const task = {
    miniGameId,
    topic: resolvedTopic,
    content: lang.getContent(resolvedTopic, difficulty),
    instructions: lang.getInstructions(miniGameId),
    difficulty,
    timerSeconds,
    fieldType: mode === 'turn_based' ? 'team' : 'normal',
    answerOptions: difficulty.answerOptions || 3,
    inputMode: difficulty.inputMode || 0
  };

  task.partyConfig = buildTaskPartyConfig(task, {
    id: miniGameId,
    name: miniGameId,
    playerMode: mode,
    rounds,
    timeLimitSec: timerSeconds,
    scoringMode,
    custom
  });

  return task;
}

/**
 * Pick random items from an array
 */
export function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

/**
 * Shuffle an array  
 */
export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
