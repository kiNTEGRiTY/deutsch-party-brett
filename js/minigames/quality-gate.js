/**
 * Premium quality gates for game selection.
 *
 * The registry can keep legacy ideas around for recovery work, but the board
 * flow should only launch games that are ready enough for the premium product.
 */

export const BOARD_READY_MINIGAME_IDS = Object.freeze([
  // Premium arcade loops: game-first interactions with screenshot coverage in
  // the current foundation pass.
  'wort-labyrinth-jagd',
  'artikel-invaders',
  'wort-tetris-stapel',
  'wortarten-sprunglauf',
  'schneeball-wortschlacht',
  'artikel-gate-runner',
  'silben-beat-surfer',
  'satz-jetpack',
  'grammatik-bossfight',

  // Wife/user asset games: real card photos, figure cutouts, and polished
  // visual content stages.
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
  'dialog-spotlight'
]);

export const BOARD_READY_MINIGAME_EVIDENCE = Object.freeze({
  'wort-labyrinth-jagd': {
    sourceModule: 'js/minigames/premium-arcade-pack.js',
    assetFamilies: ['wife-cutouts'],
    proof: 'Maze player renders the active board cutout through renderTaskCharacterAvatar().',
    qualityReason: 'Strong game-first loop with board-character continuity.'
  },
  'artikel-invaders': {
    sourceModule: 'js/minigames/premium-arcade-pack.js',
    assetFamilies: ['wife-cutouts', 'wife-word-card-crops'],
    proof: 'Article invader cannon uses the active cutout and ARTICLE entries backed by word-card crops.',
    qualityReason: 'Arcade pressure loop while preserving handmade card material.'
  },
  'wort-tetris-stapel': {
    sourceModule: 'js/minigames/premium-arcade-pack.js',
    assetFamilies: ['wife-cutouts'],
    proof: 'Word-tetris stage includes an active cutout helper via renderTaskCharacterAvatar().',
    qualityReason: 'Fast sorting loop anchored by the board character.'
  },
  'wortarten-sprunglauf': {
    sourceModule: 'js/minigames/premium-arcade-pack.js',
    assetFamilies: ['wife-cutouts'],
    proof: 'Runner hero renders the active cutout through renderTaskCharacterAvatar().',
    qualityReason: 'Clear action loop for word types with player-character continuity.'
  },
  'schneeball-wortschlacht': {
    sourceModule: 'js/minigames/premium-arcade-pack.js',
    assetFamilies: ['wife-cutouts'],
    proof: 'Snow blaster renders the active cutout through renderTaskCharacterAvatar().',
    qualityReason: 'Responsive target loop with non-violent party-game feel.'
  },
  'artikel-gate-runner': {
    sourceModule: 'js/minigames/premium-arcade-pack.js',
    assetFamilies: ['wife-cutouts', 'wife-word-card-crops'],
    proof: 'Runner uses the active cutout and the gate word card uses real word-card crop imagery.',
    qualityReason: 'Article choice is embedded in a physical-feeling runner.'
  },
  'silben-beat-surfer': {
    sourceModule: 'js/minigames/premium-arcade-pack.js',
    assetFamilies: ['wife-cutouts'],
    proof: 'Beat surfer stage includes the active cutout rider via renderTaskCharacterAvatar().',
    qualityReason: 'Rhythm loop now keeps the board figure present in the playfield.'
  },
  'satz-jetpack': {
    sourceModule: 'js/minigames/premium-arcade-pack.js',
    assetFamilies: ['wife-cutouts'],
    proof: 'Jetpack hero renders the active cutout through renderTaskCharacterAvatar().',
    qualityReason: 'Sentence-order action loop with clear player identity.'
  },
  'grammatik-bossfight': {
    sourceModule: 'js/minigames/premium-arcade-pack.js',
    assetFamilies: ['wife-cutouts'],
    proof: 'Boss face renders the active cutout through renderTaskCharacterAvatar().',
    qualityReason: 'Grammar quiz becomes a staged boss encounter without generic monster art.'
  },
  'karten-klick-labor': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Hotspots are placed on the original labeled word-card sheets.',
    qualityReason: 'Directly turns handmade cards into the play surface.'
  },
  'kartenlupe-wortfang': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Uses original card-sheet crops and word-card thumbnails.',
    qualityReason: 'Card inspection game built from handmade source material.'
  },
  'wortkarten-blitzwahl': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Choice cards are rendered from original labeled word-card sheets.',
    qualityReason: 'Fast vocabulary choice with authentic cards.'
  },
  'artikel-stempelstudio': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Article stamps are applied to card thumbnails from the original sheets.',
    qualityReason: 'Physical article practice with handmade cards.'
  },
  'artikel-sortierband': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Sorting belt feeds card thumbnails from the original sheets.',
    qualityReason: 'Article classification uses card material instead of plain labels.'
  },
  'silben-klatschkarten': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Syllable prompt centers a real card thumbnail.',
    qualityReason: 'Syllable counting is anchored in the handmade word cards.'
  },
  'anfangsbuchstaben-lupe': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Initial-letter prompt uses a magnified handmade card thumbnail.',
    qualityReason: 'Alphabet practice uses real card detail instead of generic text.'
  },
  'anfangspaar-jagd': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Pair matching is generated from card entries on the original sheets.',
    qualityReason: 'Letter matching remains tied to handmade vocabulary cards.'
  },
  'karten-memory-duo': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Memory pairs are card thumbnails from the original sheets.',
    qualityReason: 'Classic memory loop with authentic card art.'
  },
  'alphabet-kartenreihe': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Alphabet ordering is based on the handmade card set.',
    qualityReason: 'Sequencing task preserves real card identity.'
  },
  'tierblatt-spurensuche': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-animal-sheet'],
    proof: 'Hotspots are placed on the cleaned original animal figure board.',
    qualityReason: 'Search game uses the wife-created animal sheet directly.'
  },
  'tiernamen-bingo': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-animal-sheet'],
    proof: 'Bingo prompts and targets are derived from original animal positions.',
    qualityReason: 'Animal vocabulary remains tied to the handmade sheet.'
  },
  'figuren-satztheater': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-cutouts', 'wife-animal-sheet'],
    proof: 'Sentence theater uses character avatars and animal-sheet vocabulary.',
    qualityReason: 'Sentence work is staged with the product figures.'
  },
  'wortkarten-domino': {
    sourceModule: 'js/minigames/premium-atelier-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Domino pieces are generated from handmade card entries.',
    qualityReason: 'Matching loop stays card-first.'
  },
  'bildwort-galerie': {
    sourceModule: 'js/minigames/premium-content-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Image gallery spotlights objects on original labeled word-card sheets.',
    qualityReason: 'Object recognition uses the user-provided card photos.'
  },
  'wimmelbild-detektiv': {
    sourceModule: 'js/minigames/premium-content-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Search hotspots are placed over original labeled word-card sheets.',
    qualityReason: 'Hidden-object play is derived from handmade source cards.'
  },
  'artikel-bildjagd': {
    sourceModule: 'js/minigames/premium-content-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Article prompt marks real objects on original labeled word-card sheets.',
    qualityReason: 'Article choice stays visually grounded in card photos.'
  },
  'satz-storyboard': {
    sourceModule: 'js/minigames/premium-content-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Story panels crop from original word-card sheets.',
    qualityReason: 'Sentence sequencing uses handmade visual panels.'
  },
  'kompositum-atelier': {
    sourceModule: 'js/minigames/premium-content-pack.js',
    assetFamilies: ['wife-word-card-sheets'],
    proof: 'Compound workshop uses card-sheet material as its stage texture.',
    qualityReason: 'Word-building happens in the handmade card language.'
  },
  'dialog-spotlight': {
    sourceModule: 'js/minigames/premium-content-pack.js',
    assetFamilies: ['wife-cutouts', 'wife-word-card-sheets'],
    proof: 'Dialogue stage combines cutout avatars with the handmade card material.',
    qualityReason: 'Speaking choice is staged by product characters, not generic avatars.'
  }
});

export const BOARD_DEFERRED_MINIGAME_IDS = Object.freeze([
  // These are kept in the repo and may remain direct-play ideas, but they are
  // not allowed into board flow until each one has first-viewport screenshots,
  // cleanup, and a verified success/failure path.
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
  'wortfunkeln'
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

export function getBoardReadyMinigameEvidence(gameId) {
  return BOARD_READY_MINIGAME_EVIDENCE[gameId] || null;
}
