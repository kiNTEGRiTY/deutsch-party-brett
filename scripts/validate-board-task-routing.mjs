import { TOPICS } from '../js/learning/topic-registry.js';
import { generateTask } from '../js/learning/task-generator.js';
import {
  BOARD_DEFERRED_MINIGAME_IDS,
  BOARD_QUARANTINED_MINIGAME_IDS,
  BOARD_READY_MINIGAME_IDS
} from '../js/minigames/quality-gate.js';

const ready = new Set(BOARD_READY_MINIGAME_IDS);
const deferred = new Set(BOARD_DEFERRED_MINIGAME_IDS);
const quarantined = new Set(BOARD_QUARANTINED_MINIGAME_IDS);
const fieldTypes = ['normal', 'challenge', 'team'];
const samplesPerRoute = 10;
const failures = [];

const difficulty = Object.freeze({
  classLevel: 'klasse2',
  timePressure: 0,
  answerOptions: 3,
  inputMode: 0
});

function fail(message) {
  failures.push(message);
}

function assertTask(task, { topic, fieldType, sampleIndex }) {
  const routeLabel = `${topic.id}/${fieldType} sample ${sampleIndex + 1}`;

  if (!task || typeof task !== 'object') {
    fail(`${routeLabel}: generator returned no task.`);
    return;
  }

  if (!ready.has(task.miniGameId)) {
    fail(`${routeLabel}: selected non-board-ready minigame "${task.miniGameId}".`);
  }

  if (deferred.has(task.miniGameId)) {
    fail(`${routeLabel}: selected deferred minigame "${task.miniGameId}".`);
  }

  if (quarantined.has(task.miniGameId)) {
    fail(`${routeLabel}: selected quarantined minigame "${task.miniGameId}".`);
  }

  if (!task.topic) {
    fail(`${routeLabel}: task is missing resolved topic.`);
  }

  if (task.topic !== topic.id && task.requestedTopic !== topic.id) {
    fail(`${routeLabel}: fallback from "${topic.id}" to "${task.topic}" did not preserve requestedTopic.`);
  }

  if (!task.content) {
    fail(`${routeLabel}: task is missing generated learning content.`);
  }

  if (!task.instructions) {
    fail(`${routeLabel}: task is missing player instructions.`);
  }

  if (!task.partyConfig?.mode || !task.partyConfig?.scoringMode) {
    fail(`${routeLabel}: task is missing partyConfig mode/scoring.`);
  }
}

for (const topic of TOPICS) {
  for (const fieldType of fieldTypes) {
    for (let sampleIndex = 0; sampleIndex < samplesPerRoute; sampleIndex += 1) {
      const task = generateTask([topic.id], difficulty, fieldType, topic.id);
      assertTask(task, { topic, fieldType, sampleIndex });
    }
  }
}

const defaultTask = generateTask([], difficulty, 'normal');
assertTask(defaultTask, {
  topic: { id: 'artikel' },
  fieldType: 'normal',
  sampleIndex: 0
});

if (failures.length) {
  console.error('Board task routing validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Board task routing validation passed: ${TOPICS.length} topics x ${fieldTypes.length} field modes x ${samplesPerRoute} samples only select board-ready games.`);
