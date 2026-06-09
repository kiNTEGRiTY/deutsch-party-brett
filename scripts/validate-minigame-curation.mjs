import {
  getCuratedDirectPlayGroups,
  getDirectPlayMinigames
} from '../js/minigames/minigame-registry.js';
import {
  BOARD_DEFERRED_MINIGAME_IDS,
  BOARD_READY_MINIGAME_EVIDENCE,
  BOARD_QUARANTINED_MINIGAME_IDS,
  BOARD_READY_MINIGAME_IDS,
  getBoardReadyMinigameEvidence
} from '../js/minigames/quality-gate.js';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ready = new Set(BOARD_READY_MINIGAME_IDS);
const deferred = new Set(BOARD_DEFERRED_MINIGAME_IDS);
const quarantined = new Set(BOARD_QUARANTINED_MINIGAME_IDS);
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const allowedAssetFamilies = new Set([
  'wife-cutouts',
  'wife-word-card-crops',
  'wife-word-card-sheets',
  'wife-animal-sheet'
]);
const forbiddenAssetTokens = [
  'assets/img/premium/generated-wife-style/',
  'assets/img/premium/characters/',
  'assets/img/premium/watercolor-premium-board',
  'assets/img/premium/board-enchanted-backdrop',
  'assets/img/premium/start-hero-forest'
];

function fail(message) {
  failures.push(message);
}

function collectJsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      return collectJsFiles(path);
    }
    return entry.isFile() && path.endsWith('.js') ? [path] : [];
  });
}

function assertPremiumDirectGame(game, source) {
  if (!game?.id) {
    fail(`${source} contains an invalid game entry.`);
    return;
  }

  if (!ready.has(game.id)) {
    fail(`${source} exposes non-board-ready game "${game.id}".`);
  }

  if (deferred.has(game.id)) {
    fail(`${source} exposes deferred game "${game.id}".`);
  }

  if (quarantined.has(game.id)) {
    fail(`${source} exposes quarantined game "${game.id}".`);
  }

  if (!game.supportsDirectPlay) {
    fail(`${source} exposes "${game.id}" without supportsDirectPlay.`);
  }
}

function sourceDefinesAssetFamily(source, family) {
  const sourceTokens = {
    'wife-cutouts': ['renderCharacterAvatar', 'renderTaskCharacterAvatar', 'user-reference/cutouts', 'clean-animal-figure-board'],
    'wife-word-card-crops': ['word-card-crops/'],
    'wife-word-card-sheets': ['original-word-cards'],
    'wife-animal-sheet': ['clean-animal-figure-board']
  };
  return (sourceTokens[family] || []).some((token) => source.includes(token));
}

function gameBlockUsesAssetFamily(gameSource, family) {
  const gameTokens = {
    'wife-cutouts': ['renderCharacterAvatar', 'renderTaskCharacterAvatar'],
    'wife-word-card-crops': ['ARTICLES', 'word-card-crops/'],
    'wife-word-card-sheets': ['CARDS', 'OBJECTS', 'STORY_SETS', 'HANDMADE_STAGE_MATERIAL', 'WORD_CARD', 'thumb(', 'cardButton(', 'makeHotspotGame'],
    'wife-animal-sheet': ['ANIMALS', 'ANIMAL_SPOTS', 'clean-animal-figure-board']
  };
  return (gameTokens[family] || []).some((token) => gameSource.includes(token));
}

function extractGameSource(source, gameId) {
  const idNeedles = [`id: '${gameId}'`, `id: "${gameId}"`];
  const idIndex = idNeedles
    .map((needle) => source.indexOf(needle))
    .find((index) => index >= 0);
  if (!Number.isFinite(idIndex)) return '';

  const exportIndex = source.lastIndexOf('\nexport const ', idIndex);
  const startIndex = exportIndex >= 0 ? exportIndex : Math.max(0, idIndex - 1200);
  const nextExportIndex = source.indexOf('\nexport const ', idIndex + 1);
  const endIndex = nextExportIndex >= 0 ? nextExportIndex : source.length;
  return source.slice(startIndex, endIndex);
}

function assertBoardReadyEvidence(gameId) {
  const evidence = getBoardReadyMinigameEvidence(gameId);
  if (!evidence) {
    fail(`Board-ready game "${gameId}" is missing BOARD_READY_MINIGAME_EVIDENCE.`);
    return;
  }

  if (!evidence.sourceModule || typeof evidence.sourceModule !== 'string') {
    fail(`Board-ready game "${gameId}" evidence is missing sourceModule.`);
    return;
  }

  const sourcePath = resolve(rootDir, evidence.sourceModule);
  let source = '';
  try {
    source = readFileSync(sourcePath, 'utf8');
  } catch {
    fail(`Board-ready game "${gameId}" evidence sourceModule does not exist: ${evidence.sourceModule}.`);
    return;
  }

  const gameSource = extractGameSource(source, gameId);
  if (!gameSource) {
    fail(`Board-ready game "${gameId}" evidence sourceModule does not define that game id.`);
  }

  const families = Array.isArray(evidence.assetFamilies) ? evidence.assetFamilies : [];
  if (!families.length) {
    fail(`Board-ready game "${gameId}" evidence must list at least one wife/user asset family.`);
  }

  families.forEach((family) => {
    if (!allowedAssetFamilies.has(family)) {
      fail(`Board-ready game "${gameId}" evidence uses unknown asset family "${family}".`);
      return;
    }

    if (!sourceDefinesAssetFamily(source, family)) {
      fail(`Board-ready game "${gameId}" evidence claims "${family}", but ${evidence.sourceModule} does not define that asset family.`);
    }

    if (gameSource && !gameBlockUsesAssetFamily(gameSource, family)) {
      fail(`Board-ready game "${gameId}" evidence claims "${family}", but that game block does not use the asset family.`);
    }
  });

  if (!families.some((family) => family.startsWith('wife-'))) {
    fail(`Board-ready game "${gameId}" evidence must include a wife/user asset family.`);
  }

  if (!evidence.proof || evidence.proof.length < 24) {
    fail(`Board-ready game "${gameId}" evidence needs a concrete proof sentence.`);
  }

  if (!evidence.qualityReason || evidence.qualityReason.length < 24) {
    fail(`Board-ready game "${gameId}" evidence needs a qualityReason.`);
  }

  forbiddenAssetTokens.forEach((token) => {
    if (source.includes(token)) {
      fail(`Board-ready game "${gameId}" source references forbidden production asset token "${token}".`);
    }
  });
}

const groups = getCuratedDirectPlayGroups();
const directGames = getDirectPlayMinigames();

if (!groups.length) {
  fail('Curated direct-play groups are empty.');
}

groups.forEach((group) => {
  if (!group.games.length) {
    fail(`Curated direct-play group "${group.id || group.label}" is empty.`);
  }

  group.games.forEach((game) => {
    assertPremiumDirectGame(game, `group "${group.id || group.label}"`);
  });
});

directGames.forEach((game) => {
  assertPremiumDirectGame(game, 'getDirectPlayMinigames');
});

BOARD_READY_MINIGAME_IDS.forEach(assertBoardReadyEvidence);

Object.keys(BOARD_READY_MINIGAME_EVIDENCE).forEach((gameId) => {
  if (!ready.has(gameId)) {
    fail(`BOARD_READY_MINIGAME_EVIDENCE contains non-board-ready id "${gameId}".`);
  }
});

const groupIds = groups.flatMap((group) => group.games.map((game) => game.id));
const directIds = directGames.map((game) => game.id);
const missingFromDirectList = groupIds.filter((id) => !directIds.includes(id));
const extraDirectGames = directIds.filter((id) => !groupIds.includes(id));

if (missingFromDirectList.length) {
  fail(`getDirectPlayMinigames misses curated IDs: ${missingFromDirectList.join(', ')}.`);
}

if (extraDirectGames.length) {
  fail(`getDirectPlayMinigames exposes non-curated IDs: ${extraDirectGames.join(', ')}.`);
}

const menuRenderer = readFileSync(resolve(rootDir, 'js/ui/render-minigame-menu.js'), 'utf8');
const menuCss = readFileSync(resolve(rootDir, 'css/screens/minigame.css'), 'utf8');
const premiumContentPack = readFileSync(resolve(rootDir, 'js/minigames/premium-content-pack.js'), 'utf8');

if (!menuRenderer.includes('getCuratedDirectPlayGroups')) {
  fail('Direct-play menu must render from getCuratedDirectPlayGroups().');
}

[
  'getAllMinigames',
  'getAllDirectPlayMinigames'
].forEach((token) => {
  if (menuRenderer.includes(token)) {
    fail(`Direct-play menu must not use broad registry accessor "${token}".`);
  }
});

[
  '@media (max-width: 980px)',
  '.minigame-settings',
  'order: -1',
  'max-height: min(34vh, 286px)',
  '.minigame-list',
  'overflow: auto'
].forEach((token) => {
  if (!menuCss.includes(token)) {
    fail(`Direct-play menu mobile layout is missing guard token "${token}".`);
  }
});

[
  'watercolor-premium-game-table.png',
  'board-enchanted-backdrop'
].forEach((token) => {
  if (menuCss.includes(token)) {
    fail(`Minigame CSS must not use generic board/backdrop image "${token}" for premium arcade stages.`);
  }

  if (premiumContentPack.includes(token)) {
    fail(`Premium content games must not fall back to generic board/backdrop image "${token}".`);
  }
});

collectJsFiles(resolve(rootDir, 'js')).forEach((filePath) => {
  const source = readFileSync(filePath, 'utf8');
  if (source.includes('game-feel-8')) {
    fail(`JavaScript module still references stale cache token game-feel-8: ${filePath.replace(`${rootDir}/`, '')}.`);
  }
});

if (failures.length) {
  console.error('Minigame curation validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Minigame curation validation passed: ${directGames.length} direct games in ${groups.length} groups, ${BOARD_READY_MINIGAME_IDS.length} board-ready asset evidence entries, and guarded mobile menu layout.`);
