/**
 * Premium quality gates for game selection.
 *
 * The registry can keep legacy ideas around for recovery work, but the board
 * flow should only launch games that are ready enough for the premium product.
 */

export const BOARD_READY_MINIGAME_IDS = Object.freeze([
  'wort-labyrinth-jagd',
  'artikel-invaders',
  'wort-tetris-stapel',
  'wortarten-sprunglauf',
  'artikel-gate-runner',
  'silben-beat-surfer',
  'satz-jetpack',
  'grammatik-bossfight',
  'karten-klick-labor',
  'kartenlupe-wortfang',
  'wortkarten-blitzwahl',
  'artikel-stempelstudio',
  'artikel-sortierband',
  'silben-klatschkarten',
  'anfangsbuchstaben-lupe',
  'anfangspaar-jagd',
  'karten-memory-duo',
  'alphabet-kartenreihe',
  'tierblatt-spurensuche',
  'tiernamen-bingo',
  'figuren-satztheater',
  'wortkarten-domino',
  'bildwort-galerie',
  'wimmelbild-detektiv',
  'artikel-bildjagd',
  'satz-storyboard',
  'kompositum-atelier',
  'dialog-spotlight',
  'silben-trommel',
  'buchstaben-magneten',
  'wortarten-band',
  'reim-memory-aquarell',
  'satz-flickwerk',
  'artikel-atelier',
  'fehlerlupe',
  'reimwerk',
  'satz-kompass',
  'silbenstrom',
  'verb-takt',
  'wortarten-orchester',
  'wortfunkeln',
  'word-meteorites',
  'word-type-sort',
  'article-choice',
  'sentence-order',
  'fill-blanks',
  'spelling-detective',
  'case-choice',
  'noun-hunter',
  'rhyme-match',
  'syllable-counter',
  'article-cannon',
  'word-ninja',
  'kompositum-maschine',
  'reim-battle',
  'synonym-flucht',
  'gegensatz-zwang',
  'verbotener-buchstabe',
  'wort-morph',
  'verb-only',
  'substantiv-only',
  'doppel-kategorie',
  'wort-kette',
  'fuenf-sec-triple',
  'word_ending',
  'word_length_hunt',
  'forbidden_letter_trap',
  'prefix_duel',
  'suffix_duel'
]);

export const BOARD_QUARANTINED_MINIGAME_IDS = Object.freeze([
  'grammar-maze',
  'letter-bounce',
  'word-pyramid',
  'crossword-mini',
  'word-puzzle-3x3',
  'sentence-bridge',
  'category-cannon',
  'spelling-bee-de',
  'hidden-object',
  'image-word-match',
  'image-puzzle',
  'mystery-box',
  'word-chaos',
  'syllable-fishing',
  'sentence-stacker',
  'wort-stau',
  'rollen-sprechen',
  'taeusch-mich'
]);

export const QUARANTINED_MINIGAME_IDS = BOARD_QUARANTINED_MINIGAME_IDS;

const BOARD_READY_MINIGAMES = new Set(BOARD_READY_MINIGAME_IDS);

export function isBoardReadyMinigame(gameId) {
  return BOARD_READY_MINIGAMES.has(gameId);
}

export function filterBoardReadyMinigames(gameIds) {
  return gameIds.filter((gameId) => isBoardReadyMinigame(gameId));
}
