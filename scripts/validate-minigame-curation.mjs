import {
  getCuratedDirectPlayGroups,
  getDirectPlayMinigames
} from '../js/minigames/minigame-registry.js';
import {
  BOARD_DEFERRED_MINIGAME_IDS,
  BOARD_QUARANTINED_MINIGAME_IDS,
  BOARD_READY_MINIGAME_IDS
} from '../js/minigames/quality-gate.js';

const ready = new Set(BOARD_READY_MINIGAME_IDS);
const deferred = new Set(BOARD_DEFERRED_MINIGAME_IDS);
const quarantined = new Set(BOARD_QUARANTINED_MINIGAME_IDS);
const failures = [];

function fail(message) {
  failures.push(message);
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

if (failures.length) {
  console.error('Minigame curation validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Minigame curation validation passed: ${directGames.length} direct games in ${groups.length} groups.`);
