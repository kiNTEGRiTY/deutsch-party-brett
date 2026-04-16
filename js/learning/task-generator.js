/**
 * Task Generator - Central dispatcher for learning tasks
 * 
 * Selects appropriate mini-games based on active topics and difficulty,
 * then generates the task content from the language module.
 */

import GermanModule from './languages/de/index.js';
import { getTimerDuration } from './difficulty.js';

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
  nomen:          ['sentence-stacker', 'scrap-hunt', 'word-type-sort', 'noun-hunter', 'word-ninja', 'gender-sort', 'plural-match', 'whack-a-noun', 'word-avalanche'],
  verben:         ['sentence-stacker', 'word-type-sort', 'word-ninja', 'verb-pulse', 'tense-switcher', 'word-family-tree'],
  adjektive:      ['sentence-stacker', 'word-type-sort', 'adjective-painter', 'word-balance', 'bubble-burst'],
  artikel:        ['article-choice', 'article-cannon', 'gender-sort'],
  satzbau:        ['sentence-stacker', 'sentence-stacker', 'sentence-order', 'sentence-train', 'word-stacker', 'sentence-scramble', 'sentence-bridge', 'sentence-architect', 'sentence-symphony'],
  satzarten:      ['article-choice'],
  lueckentexte:   ['fill-blanks', 'missing-letter'],
  rechtschreibung:['spelling-detective', 'word-meteorites', 'lie-detector', 'anagram-blast', 'missing-letter', 'word-search-swipe', 'double-letter', 'capital-detective', 'mirror-word', 'letter-drop', 'word-star', 'slingshot-spelling', 'secret-agent-code', 'vowel-vacuum', 'word-puzzle-3x3', 'word-pyramid', 'spelling-bee-de', 'word-balloon'],
  fehlerkorrektur:['spelling-detective', 'lie-detector', 'double-letter', 'capital-detective', 'grammar-ghost'],
  gross_klein:    ['case-choice', 'capital-detective'],
  reime:          ['rhyme-match', 'rhyme-memory', 'fill-the-poem', 'rhyme-rider'],
  lesen:          ['scrap-hunt', 'scrap-hunt', 'fill-blanks', 'word-meteorites', 'cryptogram', 'hidden-object', 'adjective-painter', 'difference-detective', 'speed-flash', 'emoji-translator', 'word-clock', 'sentence-sense', 'story-builder', 'reading-race', 'comic-strip', 'german-idiom', 'password-crack', 'secret-agent-code', 'logic-ladder', 'sentence-sniper', 'idiom-island', 'proverb-path', 'detective-adventure', 'kitchen-chaos', 'sentence-symphony', 'dialogue-duel', 'mystery-box'],
  wortschatz:     ['scrap-hunt', 'scrap-hunt', 'word-type-sort', 'word-ninja', 'teakettle-detective', 'cryptogram', 'word-balance', 'memory-chain', 'hidden-object', 'synonym-snap', 'word-chain', 'hot-cold', 'opposite-racer', 'number-words', 'category-blitz', 'emoji-translator', 'definition-match', 'compound-meaning', 'german-idiom', 'word-chess', 'logic-ladder', 'mad-libs-de', 'word-match-fast', 'synonym-bridge', 'antonym-arch', 'word-detective', 'category-cannon', 'crossword-mini', 'detective-adventure', 'grammar-rpg', 'kitchen-chaos', 'word-alchemy', 'mystery-box'],
  silben:         ['syllable-fishing', 'syllable-fishing', 'syllable-counter', 'syllable-dj', 'syllable-stomp'],
  zeitformen:     ['time-machine', 'verb-pulse', 'tense-switcher', 'verb-forms', 'tense-tornado', 'time-traveler'],
  satzzeichen:    ['punctuation-catcher', 'comma-king'],
  zusammengesetzte_nomen: ['compound-builder', 'compound-chain', 'split-the-word', 'compound-meaning'],
  grammatik:      ['sentence-stacker', 'preposition-world', 'verb-pulse', 'comma-king', 'question-word-match', 'modal-verb', 'adjective-endings', 'prefix-postfix', 'case-solver', 'grammar-ghost', 'prefix-power', 'suffix-sun', 'grammar-maze', 'detective-adventure', 'grammar-rpg', 'sentence-architect', 'sentence-symphony', 'time-traveler', 'dialogue-duel'],
  konzentration:  ['scrap-hunt', 'memory-chain', 'abc-bubbles', 'word-labyrinth', 'speed-flash', 'color-words', 'mirror-word', 'letter-drop', 'word-puzzle-3x3', 'letter-bounce', 'grammar-rpg', 'mystery-box'],
  alphabet:       ['abc-bubbles', 'word-chain', 'alphabet-sort'],
  wortarten:      ['sentence-stacker', 'word-type-sort', 'word-ninja', 'whack-a-noun', 'bubble-burst', 'word-avalanche', 'word-chess', 'blitz-quiz', 'gravity-sort', 'mad-libs-de', 'tap-the-type', 'gender-gym', 'article-ace', 'word-fishing', 'suffix-sun', 'kitchen-chaos', 'mystery-box'],
  wortbildung:    ['word-alchemy'],
  // Default fallback
  _default:       ['article-choice']
};

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
  if (explicitTopic && TOPIC_MINIGAME_MAP[explicitTopic]) {
    topic = explicitTopic;
  } else {
    // Pick a random active topic
    const validTopics = activeTopics.filter(t => TOPIC_MINIGAME_MAP[t]);
    if (validTopics.length === 0) {
      // Fallback to article choice
      validTopics.push('artikel');
    }
    topic = validTopics[Math.floor(Math.random() * validTopics.length)];
  }
  
  // Pick a mini-game for the topic
  const games = TOPIC_MINIGAME_MAP[topic] || TOPIC_MINIGAME_MAP._default;
  const miniGameId = games[Math.floor(Math.random() * games.length)];
  
  // Get content from language module
  const content = lang.getContent(topic, difficulty);
  const instructions = lang.getInstructions(miniGameId);
  
  // Calculate timer
  const timerSeconds = getTimerDuration(difficulty.timePressure || 0);
  
  return {
    miniGameId,
    topic,
    content,
    instructions,
    difficulty,
    timerSeconds,
    fieldType,
    answerOptions: difficulty.answerOptions || 3,
    inputMode: difficulty.inputMode || 0 // 0 = choice, 1 = free
  };
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
