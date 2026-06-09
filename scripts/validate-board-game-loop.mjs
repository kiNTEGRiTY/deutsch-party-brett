const failures = [];
const events = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function installBrowserEventShim() {
  class NodeCustomEvent extends Event {
    constructor(type, options = {}) {
      super(type);
      this.detail = options.detail;
    }
  }

  globalThis.CustomEvent = NodeCustomEvent;
  globalThis.window = {
    dispatchEvent(event) {
      events.push({ type: event.type, detail: event.detail });
      return true;
    },
    addEventListener() {},
    removeEventListener() {}
  };
}

function installSeededRandom() {
  let seed = 20260609;
  Math.random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

installBrowserEventShim();
installSeededRandom();

const { GameController } = await import('../js/engine/game-controller.js?v=content-card-material-50');
const { FieldType } = await import('../js/engine/field-types.js');
const { TurnPhase } = await import('../js/engine/turn.js');
const { generateTask } = await import('../js/learning/task-generator.js?v=content-card-material-50');
const { BOARD_READY_MINIGAME_IDS } = await import('../js/minigames/quality-gate.js?v=content-card-material-50');

const readyGameIds = new Set(BOARD_READY_MINIGAME_IDS);
const expectedTypeCounts = {
  [FieldType.NOMEN]: 8,
  [FieldType.VERBEN]: 8,
  [FieldType.ADJEKTIV]: 6,
  [FieldType.HELPER]: 4,
  [FieldType.MOVEMENT]: 4,
  [FieldType.TRAP]: 3,
  [FieldType.REWARD]: 2,
  [FieldType.PORTAL]: 1
};
const learningTopics = {
  [FieldType.NOMEN]: 'nomen',
  [FieldType.VERBEN]: 'verben',
  [FieldType.ADJEKTIV]: 'adjektive'
};

const settings = Object.freeze({
  selectedBoardId: 'default',
  gameMode: 'local',
  difficulty: {
    classLevel: 'klasse2',
    languageComplexity: 2,
    sentenceLength: 2,
    timePressure: 0,
    hintAmount: 3,
    answerOptions: 3,
    errorDensity: 2,
    inputMode: 0
  },
  selectedTopics: ['nomen', 'verben', 'adjektive', 'artikel', 'satzbau']
});

function createGame() {
  const game = new GameController();
  game.initGame([
    { name: 'Spieler 1', colorIndex: 0 },
    { name: 'Spieler 2', colorIndex: 1 }
  ], settings);
  return game;
}

function countTypes(fields) {
  return fields.reduce((counts, field) => {
    counts[field.type] = (counts[field.type] || 0) + 1;
    return counts;
  }, {});
}

function preparePlayerOnField(game, field) {
  const player = game.getCurrentPlayer();
  player.moveTo(field.id);
  game.turnManager.currentPlayerIndex = 0;
  game.turnManager.setPhase(TurnPhase.IDLE);
  return player;
}

function findField(game, type, { requirePlayableEvent = true } = {}) {
  const field = game.board.getAllFields().find((candidate) => {
    if (candidate.type !== type) {
      return false;
    }
    if (!requirePlayableEvent) {
      return true;
    }
    return candidate.id > 0 && candidate.id < game.board.totalFields - 1;
  });
  assert(field, `Board is missing required field type "${type}".`);
  return field;
}

function assertBoardState(game) {
  const fields = game.board.getAllFields();
  assert(game.state === 'playing', 'New game must start in playing state.');
  assert(game.turnManager.phase === TurnPhase.IDLE, 'New game must wait for dice in idle phase.');
  assert(game.getCurrentPlayer()?.id === 0, 'New game must start with player 1.');
  assert(fields.length === 36, `Board must expose 36 fields, found ${fields.length}.`);
  assert(game.board.getDestination(34, 6) === 35, 'Dice movement must clamp at the finish field.');
  assert(game.board.isFinish(35), 'Field 35 must be recognized as finish.');

  fields.forEach((field, index) => {
    assert(field.id === index, `Field ${index} must have sequential id ${index}.`);
    assert(Number.isFinite(field.x) && Number.isFinite(field.y), `Field ${index} must have finite board coordinates.`);
    assert(field.focusTitle, `Field ${index} must have a learning/game title.`);
    assert(field.focusPrompt, `Field ${index} must have a player-facing prompt.`);
  });

  const counts = countTypes(fields);
  Object.entries(expectedTypeCounts).forEach(([type, expected]) => {
    assert(counts[type] === expected, `Expected ${expected} "${type}" fields, found ${counts[type] || 0}.`);
  });
}

function assertLearningFieldsLaunchBoardReadyTasks() {
  Object.entries(learningTopics).forEach(([type, expectedTopic]) => {
    const game = createGame();
    const field = findField(game, type);
    const player = preparePlayerOnField(game, field);
    const result = game.resolveField(field);

    assert(result.action === 'minigame', `${type} field must launch a minigame.`);
    assert(result.mode === 'single', `${type} field must launch a single-player board task.`);
    assert(result.topic === expectedTopic, `${type} field must request topic "${expectedTopic}", got "${result.topic}".`);
    assert(result.field?.id === field.id, `${type} minigame result must preserve the landing field.`);
    assert(player.position === field.id, `${type} minigame launch must not move the landing player.`);
    assert(game.turnManager.phase === TurnPhase.RESOLVING, `${type} minigame launch must hold the turn in resolving phase.`);
    assert(result.difficulty, `${type} minigame launch must include field-scaled difficulty.`);

    const task = generateTask([expectedTopic], result.difficulty, 'normal', result.topic);
    assert(readyGameIds.has(task.miniGameId), `${type} field generated non-board-ready minigame "${task.miniGameId}".`);
    assert(task.content, `${type} generated task must include learning content.`);
    assert(task.partyConfig?.mode, `${type} generated task must include party config.`);
  });
}

function assertMinigameCompletionReturnsToDiceFlow() {
  const game = createGame();
  const field = findField(game, FieldType.NOMEN);
  const player = preparePlayerOnField(game, field);
  const result = game.resolveField(field);

  assert(result.action === 'minigame', 'Nomen test field must launch a minigame before completion.');
  assert(!game.canResume(), 'A resolving minigame turn must not be resumable as idle board state.');

  game.onMinigameComplete({ mode: 'single', correct: true, score: 3 });

  assert(player.coins === 3, `Correct board minigame should grant 3 coins, got ${player.coins}.`);
  assert(player.stats.tasksAttempted === 1, 'Correct board minigame should record one attempted task.');
  assert(player.stats.tasksCorrect === 1, 'Correct board minigame should record one correct task.');
  assert(player.stats.totalScore === 3, `Correct board minigame should add score 3, got ${player.stats.totalScore}.`);
  assert(game.turnManager.getCurrentPlayerIndex() === 1, 'Completed board minigame must advance to player 2.');
  assert(game.turnManager.phase === TurnPhase.IDLE, 'Completed board minigame must return to idle dice phase.');
  assert(game.canResume(), 'Completed board minigame must be resumable from saved board state.');
}

function assertSpecialFieldsResolveSafely() {
  [
    FieldType.HELPER,
    FieldType.REWARD,
    FieldType.MOVEMENT,
    FieldType.TRAP,
    FieldType.PORTAL
  ].forEach((type) => {
    const game = createGame();
    const field = findField(game, type);
    const player = preparePlayerOnField(game, field);
    const startPosition = player.position;
    const result = game.resolveField(field);

    assert(result.action === type || (type === FieldType.REWARD && result.action === 'reward'), `${type} field resolved as "${result.action}".`);
    assert(player.position >= 0 && player.position <= game.board.totalFields - 1, `${type} field moved player out of board bounds.`);
    assert(game.state === 'playing', `${type} field should not finish a two-player game unexpectedly.`);
    assert(game.turnManager.phase === TurnPhase.IDLE, `${type} field must return to idle dice phase.`);

    const grantsExtraTurn = result.reward?.items?.some((item) => item.type === 'extraTurn');
    const expectedPlayerIndex = grantsExtraTurn ? 0 : 1;
    assert(
      game.turnManager.getCurrentPlayerIndex() === expectedPlayerIndex,
      grantsExtraTurn
        ? `${type} field extra-turn reward must keep player 1 active.`
        : `${type} field must advance to player 2.`
    );

    if ([FieldType.MOVEMENT, FieldType.TRAP, FieldType.PORTAL].includes(type)) {
      assert(
        result.oldPos === startPosition,
        `${type} field must report the original position ${startPosition}, got ${result.oldPos}.`
      );
    }
  });
}

function assertFinishEndsGameCleanly() {
  const game = createGame();
  const player = game.getCurrentPlayer();
  player.moveTo(34);
  game.movePlayer(6);

  assert(player.position === 35, 'Moving past the end must land exactly on field 35.');

  const result = game.resolveField(game.board.getField(player.position));

  assert(result.action === 'finish', `Finish field must resolve as finish, got "${result.action}".`);
  assert(player.finished, 'Player who lands on the finish must be marked finished.');
  assert(player.stars >= 3, `Finish must grant at least 3 stars, got ${player.stars}.`);
  assert(game.state === 'finished', 'Two-player game must finish when only one active player remains.');
}

const game = createGame();
assertBoardState(game);
assertLearningFieldsLaunchBoardReadyTasks();
assertMinigameCompletionReturnsToDiceFlow();
assertSpecialFieldsResolveSafely();
assertFinishEndsGameCleanly();

const emittedTypes = new Set(events.map((event) => event.type));
[
  'game:stateChange',
  'game:turnChange',
  'turn:phaseChange',
  'game:minigameStart',
  'game:reward'
].forEach((eventType) => {
  assert(emittedTypes.has(eventType), `Expected game loop to emit "${eventType}".`);
});

if (failures.length) {
  console.error('Board game loop validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Board game loop validation passed: dice flow, field resolution, board-ready tasks, rewards, turn advance, and finish state are coherent.');
