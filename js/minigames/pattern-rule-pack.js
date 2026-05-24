import { normalizePartyText, pickRounds } from './core/party-game-core.js';
import { createRuleGame } from './core/direct-rule-game.js';
import { loadContentJson } from './core/content-json-loader.js';

const CONTENT_ROOT = '/content/patterns';

const SHARED_TURN_DEFAULTS = {
  solo_arcade: { scoringMode: 'arcade', timeLimitSec: 14 },
  turn_based: { scoringMode: 'survival', timeLimitSec: 14 }
};

const ENDING_OPTIONS = [
  { label: 'Gemischt', value: 'mixed' },
  { label: '-en', value: 'en' },
  { label: '-ung', value: 'ung' },
  { label: '-chen', value: 'chen' },
  { label: '-heit', value: 'heit' },
  { label: '-ig', value: 'ig' },
  { label: '-los', value: 'los' },
  { label: '-bar', value: 'bar' },
  { label: '-er', value: 'er' }
];

const FORBIDDEN_LETTER_OPTIONS = [
  { label: 'Gemischt', value: 'mixed' },
  { label: 'A', value: 'a' },
  { label: 'E', value: 'e' },
  { label: 'I', value: 'i' },
  { label: 'O', value: 'o' },
  { label: 'U', value: 'u' },
  { label: 'T', value: 't' }
];

const PREFIX_OPTIONS = [
  { label: 'Gemischt', value: 'mixed' },
  { label: 'be-', value: 'be' },
  { label: 'ver-', value: 'ver' },
  { label: 'un-', value: 'un' },
  { label: 'vor-', value: 'vor' },
  { label: 'mit-', value: 'mit' },
  { label: 'ab-', value: 'ab' }
];

const SUFFIX_OPTIONS = [
  { label: 'Gemischt', value: 'mixed' },
  { label: '-ung', value: 'ung' },
  { label: '-heit', value: 'heit' },
  { label: '-keit', value: 'keit' },
  { label: '-bar', value: 'bar' },
  { label: '-los', value: 'los' },
  { label: '-chen', value: 'chen' },
  { label: '-erei', value: 'erei' }
];

function invalid(message, displayValue = '', tone = 'fail') {
  return {
    valid: false,
    message,
    tone,
    points: 0,
    displayValue
  };
}

function valid(displayValue, points, message, tone = 'good') {
  return {
    valid: true,
    message,
    tone,
    points,
    displayValue
  };
}

function prepareSet(set) {
  const accepted = Array.isArray(set.accepted) ? set.accepted : [];
  const generalAccepted = Array.isArray(set.generalAccepted) && set.generalAccepted.length
    ? set.generalAccepted
    : accepted;

  return {
    ...set,
    accepted,
    acceptedNormalized: accepted.map((entry) => normalizePartyText(entry)),
    generalAccepted,
    generalAcceptedNormalized: generalAccepted.map((entry) => normalizePartyText(entry))
  };
}

async function loadPatternContent(fileName) {
  const data = await loadContentJson(`${CONTENT_ROOT}/${fileName}`);
  return {
    ...data,
    sets: (data.sets || []).map(prepareSet)
  };
}

function pickFilteredRounds(sets, count) {
  return pickRounds(sets, count).map((entry) => ({ ...entry }));
}

function filterByValue(sets, key, value) {
  if (!value || value === 'mixed') {
    return sets;
  }

  const normalized = normalizePartyText(value);
  return sets.filter((set) => normalizePartyText(set[key]) === normalized);
}

function filterByLengthBounds(sets, minLength, maxLength) {
  const safeMin = Number.isFinite(minLength) ? minLength : 0;
  const safeMax = Number.isFinite(maxLength) ? maxLength : Number.POSITIVE_INFINITY;
  return sets.filter((set) => {
    const targetLength = Number(set.targetLength || 0);
    return targetLength >= safeMin && targetLength <= safeMax;
  });
}

function filterByMinWordLength(sets, minWordLength, key = 'accepted') {
  const safeMin = Number(minWordLength || 0);
  if (!safeMin) {
    return sets;
  }

  return sets.filter((set) =>
    (set[key] || []).some((entry) => normalizePartyText(entry).length >= safeMin)
  );
}

function findAccepted(round, candidate, useGeneralPool = false) {
  const pool = useGeneralPool ? round.generalAcceptedNormalized : round.acceptedNormalized;
  const source = useGeneralPool ? round.generalAccepted : round.accepted;
  const index = pool.indexOf(candidate);
  return index >= 0 ? source[index] : null;
}

function wasAlreadyUsed(state, candidate) {
  return (state?.data?.usedWords || []).includes(candidate);
}

function rememberWord({ state, input }) {
  const candidate = normalizePartyText(input.value);
  if (!candidate) {
    return;
  }

  state.data.usedWords.push(candidate);
  state.data.currentStreak = Number(state.data.currentStreak || 0) + 1;
}

function resetStreak({ state }) {
  state.data.currentStreak = 0;
}

function getLengthRange(custom = {}) {
  const left = Number(custom.targetLengthMin || 4);
  const right = Number(custom.targetLengthMax || left);
  return {
    min: Math.min(left, right),
    max: Math.max(left, right)
  };
}

export const WordEnding = createRuleGame({
  id: 'word_ending',
  name_de: 'Endungs-Jagd',
  description: 'Finde passende Woerter mit der geforderten Endung.',
  topics: ['wortbildung', 'rechtschreibung', 'wortschatz'],
  kicker: 'Pattern',
  defaultRounds: 4,
  defaultCustom: { lives: 3, targetEnding: 'mixed', minWordLength: 4 },
  settingsFields: [
    { type: 'select', key: 'targetEnding', label: 'Ziel-Endung', options: ENDING_OPTIONS, defaultValue: 'mixed' },
    { type: 'number', key: 'minWordLength', label: 'Min. Wortlaenge', min: 3, max: 12, defaultValue: 4 }
  ],
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 2,
  loadContent() {
    return loadPatternContent('wordEndings.json');
  },
  buildRounds({ config, content }) {
    const minWordLength = Number(config.custom.minWordLength || 4);
    const filtered = filterByMinWordLength(
      filterByValue(content?.sets || [], 'ending', config.custom.targetEnding),
      minWordLength
    );
    return pickFilteredRounds(filtered.length ? filtered : (content?.sets || []), config.rounds);
  },
  getPrompt({ round, config }) {
    const minWordLength = Number(config.custom.minWordLength || round.minWordLength || 4);
    return {
      prompt: `Finde ein Wort mit der Endung "-${round.ending}".`,
      secondary: `${round.category ? `${round.category} im Fokus. ` : ''}Mindestens ${minWordLength} Buchstaben.`,
      placeholder: 'Wort mit Endung ...',
      badges: ['Endung', `-${round.ending}`]
    };
  },
  validateInput({ state, round, input, config }) {
    const rawValue = String(input.value || '').trim();
    const candidate = normalizePartyText(rawValue);
    const minWordLength = Number(config.custom.minWordLength || round.minWordLength || 4);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    if (wasAlreadyUsed(state, candidate)) {
      return invalid('Dieses Wort wurde in dieser Session schon gespielt.', rawValue, 'warn');
    }

    if (!candidate.endsWith(normalizePartyText(round.ending))) {
      return invalid(`Das Wort muss auf -${round.ending} enden.`, rawValue);
    }

    if (candidate.length < minWordLength) {
      return invalid(`Mindestens ${minWordLength} Buchstaben noetig.`, rawValue);
    }

    const accepted = findAccepted(round, candidate);
    if (!accepted) {
      return invalid('Nicht im aktuellen Endungs-Pool.', rawValue);
    }

    const streakBonus = Number(state.data.currentStreak || 0) >= 4 ? 1 : 0;
    return valid(
      accepted,
      1 + streakBonus,
      streakBonus ? 'Endung sitzt. Streak-Bonus aktiv.' : 'Endung sitzt.'
    );
  },
  onValidTurn: rememberWord,
  onInvalidTurn: resetStreak
});

export const WordLengthHunt = createRuleGame({
  id: 'word_length_hunt',
  name_de: 'Buchstaben-Jagd',
  description: 'Triff die exakte Wortlaenge unter Druck.',
  topics: ['wortschatz', 'alphabet', 'rechtschreibung'],
  kicker: 'Length',
  defaultRounds: 4,
  defaultCustom: { lives: 3, targetLengthMin: 4, targetLengthMax: 7, withCategory: true },
  settingsFields: [
    { type: 'number', key: 'targetLengthMin', label: 'Min. Laenge', min: 3, max: 10, defaultValue: 4 },
    { type: 'number', key: 'targetLengthMax', label: 'Max. Laenge', min: 3, max: 10, defaultValue: 7 },
    { type: 'toggle', key: 'withCategory', label: 'Mit Kategorie', defaultValue: true }
  ],
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 2,
  loadContent() {
    return loadPatternContent('wordLengthSets.json');
  },
  buildRounds({ config, content }) {
    const range = getLengthRange(config.custom);
    const filtered = filterByLengthBounds(content?.sets || [], range.min, range.max);
    return pickFilteredRounds(filtered.length ? filtered : (content?.sets || []), config.rounds);
  },
  getPrompt({ round, config }) {
    const withCategory = Boolean(config.custom.withCategory);
    return {
      prompt: withCategory
        ? `Finde ein Wort mit genau ${round.targetLength} Buchstaben aus ${round.category}.`
        : `Finde ein Wort mit genau ${round.targetLength} Buchstaben.`,
      secondary: withCategory ? 'Kategorie und Wortlaenge muessen beide stimmen.' : 'Nur die exakte Laenge zaehlt.',
      placeholder: 'Passendes Wort ...',
      badges: ['Laenge', `${round.targetLength} Buchstaben`, withCategory ? round.category : null].filter(Boolean)
    };
  },
  validateInput({ state, round, input, config }) {
    const rawValue = String(input.value || '').trim();
    const candidate = normalizePartyText(rawValue);
    const withCategory = Boolean(config.custom.withCategory);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    if (wasAlreadyUsed(state, candidate)) {
      return invalid('Dieses Wort wurde in dieser Session schon gespielt.', rawValue, 'warn');
    }

    if (candidate.length !== Number(round.targetLength || 0)) {
      return invalid(`Genau ${round.targetLength} Buchstaben noetig.`, rawValue);
    }

    const accepted = findAccepted(round, candidate, !withCategory);
    if (!accepted) {
      return invalid(
        withCategory ? 'Passt nicht sauber zur Zielkategorie.' : 'Nicht im aktuellen Wortlaengen-Pool.',
        rawValue
      );
    }

    return valid(accepted, withCategory ? 2 : 1, withCategory ? 'Laenge und Kategorie sitzen.' : 'Laenge getroffen.');
  },
  onValidTurn: rememberWord,
  onInvalidTurn: resetStreak
});

export const ForbiddenLetterTrap = createRuleGame({
  id: 'forbidden_letter_trap',
  name_de: 'Buchstaben-Falle',
  description: 'Liefere ein passendes Wort, ohne den verbotenen Buchstaben zu beruehren.',
  topics: ['rechtschreibung', 'wortschatz'],
  kicker: 'Trap',
  defaultRounds: 4,
  defaultCustom: { lives: 3, forbiddenLetter: 'mixed', withCategory: true },
  settingsFields: [
    { type: 'select', key: 'forbiddenLetter', label: 'Verbotener Buchstabe', options: FORBIDDEN_LETTER_OPTIONS, defaultValue: 'mixed' },
    { type: 'toggle', key: 'withCategory', label: 'Mit Kategorie', defaultValue: true }
  ],
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 1,
  loadContent() {
    return loadPatternContent('forbiddenLetterTrap.json');
  },
  buildRounds({ config, content }) {
    const filtered = filterByValue(content?.sets || [], 'forbidden', config.custom.forbiddenLetter);
    return pickFilteredRounds(filtered.length ? filtered : (content?.sets || []), config.rounds);
  },
  getPrompt({ round, config }) {
    const withCategory = Boolean(config.custom.withCategory);
    return {
      prompt: withCategory
        ? `Nenne ein Wort aus ${round.category} ohne "${String(round.forbidden).toUpperCase()}".`
        : `Nenne ein Wort ohne "${String(round.forbidden).toUpperCase()}".`,
      secondary: 'Der verbotene Buchstabe darf nirgendwo auftauchen.',
      placeholder: 'Wort ohne Falle ...',
      badges: ['Verbot', String(round.forbidden).toUpperCase(), withCategory ? round.category : null].filter(Boolean)
    };
  },
  validateInput({ state, round, input, config }) {
    const rawValue = String(input.value || '').trim();
    const candidate = normalizePartyText(rawValue);
    const forbidden = normalizePartyText(round.forbidden);
    const withCategory = Boolean(config.custom.withCategory);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    if (wasAlreadyUsed(state, candidate)) {
      return invalid('Dieses Wort wurde in dieser Session schon gespielt.', rawValue, 'warn');
    }

    if (candidate.includes(forbidden)) {
      return invalid(`Der Buchstabe ${String(round.forbidden).toUpperCase()} ist tabu.`, rawValue);
    }

    const accepted = findAccepted(round, candidate, !withCategory);
    if (!accepted) {
      return invalid(withCategory ? 'Passt nicht zur Zielkategorie.' : 'Nicht im aktuellen Wort-Pool.', rawValue);
    }

    return valid(accepted, 1, 'Falle sauber umgangen.');
  },
  onValidTurn: rememberWord,
  onInvalidTurn: resetStreak
});

export const PrefixDuel = createRuleGame({
  id: 'prefix_duel',
  name_de: 'Praefix-Duell',
  description: 'Finde ein Wort mit dem geforderten Praefix, bevor der Timer faellt.',
  topics: ['wortbildung', 'wortschatz'],
  kicker: 'Prefix',
  defaultRounds: 4,
  defaultCustom: { lives: 3, prefix: 'mixed', minWordLength: 5 },
  settingsFields: [
    { type: 'select', key: 'prefix', label: 'Praefix', options: PREFIX_OPTIONS, defaultValue: 'mixed' },
    { type: 'number', key: 'minWordLength', label: 'Min. Wortlaenge', min: 3, max: 14, defaultValue: 5 }
  ],
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 1,
  loadContent() {
    return loadPatternContent('prefixes.json');
  },
  buildRounds({ config, content }) {
    const filtered = filterByMinWordLength(
      filterByValue(content?.sets || [], 'prefix', config.custom.prefix),
      Number(config.custom.minWordLength || 5)
    );
    return pickFilteredRounds(filtered.length ? filtered : (content?.sets || []), config.rounds);
  },
  getPrompt({ round, config }) {
    const minWordLength = Number(config.custom.minWordLength || round.minWordLength || 5);
    return {
      prompt: `Finde ein Wort mit dem Praefix "${round.prefix}-".`,
      secondary: `Mindestens ${minWordLength} Buchstaben. Nur Treffer aus dem aktuellen Duel-Pool zaehlen.`,
      placeholder: 'Praefix-Wort ...',
      badges: ['Praefix', `${round.prefix}-`]
    };
  },
  validateInput({ state, round, input, config }) {
    const rawValue = String(input.value || '').trim();
    const candidate = normalizePartyText(rawValue);
    const minWordLength = Number(config.custom.minWordLength || round.minWordLength || 5);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    if (wasAlreadyUsed(state, candidate)) {
      return invalid('Dieses Wort wurde in dieser Session schon gespielt.', rawValue, 'warn');
    }

    if (!candidate.startsWith(normalizePartyText(round.prefix))) {
      return invalid(`Das Wort muss mit ${round.prefix}- beginnen.`, rawValue);
    }

    if (candidate.length < minWordLength) {
      return invalid(`Mindestens ${minWordLength} Buchstaben noetig.`, rawValue);
    }

    const accepted = findAccepted(round, candidate);
    if (!accepted) {
      return invalid('Nicht im aktuellen Praefix-Pool.', rawValue);
    }

    return valid(accepted, 1, 'Praefix sitzt.');
  },
  onValidTurn: rememberWord,
  onInvalidTurn: resetStreak
});

export const SuffixDuel = createRuleGame({
  id: 'suffix_duel',
  name_de: 'Suffix-Duell',
  description: 'Finde ein Wort mit dem geforderten Suffix unter Zeitdruck.',
  topics: ['wortbildung', 'wortschatz'],
  kicker: 'Suffix',
  defaultRounds: 4,
  defaultCustom: { lives: 3, suffix: 'mixed', minWordLength: 6 },
  settingsFields: [
    { type: 'select', key: 'suffix', label: 'Suffix', options: SUFFIX_OPTIONS, defaultValue: 'mixed' },
    { type: 'number', key: 'minWordLength', label: 'Min. Wortlaenge', min: 3, max: 16, defaultValue: 6 }
  ],
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 1,
  loadContent() {
    return loadPatternContent('suffixes.json');
  },
  buildRounds({ config, content }) {
    const filtered = filterByMinWordLength(
      filterByValue(content?.sets || [], 'suffix', config.custom.suffix),
      Number(config.custom.minWordLength || 6)
    );
    return pickFilteredRounds(filtered.length ? filtered : (content?.sets || []), config.rounds);
  },
  getPrompt({ round, config }) {
    const minWordLength = Number(config.custom.minWordLength || round.minWordLength || 6);
    return {
      prompt: `Finde ein Wort mit dem Suffix "-${round.suffix}".`,
      secondary: `Mindestens ${minWordLength} Buchstaben. Das Suffix muss wirklich am Ende sitzen.`,
      placeholder: 'Suffix-Wort ...',
      badges: ['Suffix', `-${round.suffix}`]
    };
  },
  validateInput({ state, round, input, config }) {
    const rawValue = String(input.value || '').trim();
    const candidate = normalizePartyText(rawValue);
    const minWordLength = Number(config.custom.minWordLength || round.minWordLength || 6);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    if (wasAlreadyUsed(state, candidate)) {
      return invalid('Dieses Wort wurde in dieser Session schon gespielt.', rawValue, 'warn');
    }

    if (!candidate.endsWith(normalizePartyText(round.suffix))) {
      return invalid(`Das Wort muss auf -${round.suffix} enden.`, rawValue);
    }

    if (candidate.length < minWordLength) {
      return invalid(`Mindestens ${minWordLength} Buchstaben noetig.`, rawValue);
    }

    const accepted = findAccepted(round, candidate);
    if (!accepted) {
      return invalid('Nicht im aktuellen Suffix-Pool.', rawValue);
    }

    return valid(accepted, 1, 'Suffix sitzt.');
  },
  onValidTurn: rememberWord,
  onInvalidTurn: resetStreak
});
