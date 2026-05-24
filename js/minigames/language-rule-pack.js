import { normalizePartyText, pickRounds } from './core/party-game-core.js';
import { createRuleGame, levenshteinDistance } from './core/direct-rule-game.js';
import {
  ANTONYM_SETS,
  DIRECT_WORD_BANKS,
  DOUBLE_CATEGORY_SETS,
  FIVE_SEC_TRIPLE_SETS,
  FORBIDDEN_LETTER_SETS,
  MORPH_SETS,
  NOUN_ONLY_SETS,
  SYNONYM_SETS,
  VERB_ONLY_SETS,
  WORD_CHAIN_SETS
} from './core/direct-play-content.js';

function prepareRound(round) {
  return {
    ...round,
    acceptedNormalized: (round.accepted || []).map((entry) => normalizePartyText(entry)),
    nearNormalized: (round.near || []).map((entry) => normalizePartyText(entry))
  };
}

function pickPreparedRounds(pool, count) {
  return pickRounds(pool, count).map(prepareRound);
}

function findAcceptedWord(round, candidate, allowNear = false) {
  const acceptedIndex = round.acceptedNormalized.indexOf(candidate);
  if (acceptedIndex >= 0) {
    return round.accepted[acceptedIndex];
  }

  if (!allowNear) {
    return null;
  }

  const nearIndex = round.nearNormalized.indexOf(candidate);
  if (nearIndex >= 0) {
    return round.near[nearIndex];
  }

  return null;
}

function invalid(message, displayValue = '') {
  return {
    valid: false,
    message,
    tone: 'fail',
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

function normalizeList(values) {
  return (Array.isArray(values) ? values : [])
    .map((entry) => normalizePartyText(entry))
    .filter(Boolean);
}

const SHARED_TURN_DEFAULTS = {
  solo_arcade: { scoringMode: 'arcade' },
  turn_based: { scoringMode: 'survival' }
};

export const SynonymFlucht = createRuleGame({
  id: 'synonym-flucht',
  name_de: 'Synonym-Flucht',
  description: 'Liefere Synonyme unter Druck, bevor dir die Worte ausgehen.',
  topics: ['wortschatz', 'lesen'],
  kicker: 'Lexikon',
  defaultRounds: 4,
  defaultCustom: { lives: 3, allowNearSynonyms: true },
  settingsFields: [
    { type: 'toggle', key: 'allowNearSynonyms', label: 'Nahe Synonyme erlauben', defaultValue: true }
  ],
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 2,
  buildRounds: ({ config }) => pickPreparedRounds(SYNONYM_SETS, config.rounds),
  getPrompt({ round }) {
    return {
      prompt: `Nenne ein Synonym fuer "${round.seed}".`,
      secondary: 'Kein Gegenteil, kein beliebiger Nachbarbegriff.',
      placeholder: 'Synonym eingeben...',
      badges: ['Wortschatz', `Basiswort ${round.seed}`]
    };
  },
  validateInput({ round, input, config }) {
    const candidate = normalizePartyText(input.value);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    const accepted = findAcceptedWord(round, candidate, Boolean(config.custom.allowNearSynonyms));
    if (!accepted) {
      return invalid('Das trifft die Bedeutung nicht sauber.');
    }

    return valid(accepted, 2, 'Synonym sitzt. Weiter.');
  }
});

export const GegensatzZwang = createRuleGame({
  id: 'gegensatz-zwang',
  name_de: 'Gegensatz-Zwang',
  description: 'Finde das Gegenteil, bevor der Turn-Timer kippt.',
  topics: ['wortschatz', 'adjektive'],
  kicker: 'Kontrast',
  defaultRounds: 4,
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 1,
  buildRounds: ({ config }) => pickPreparedRounds(ANTONYM_SETS, config.rounds),
  getPrompt({ round }) {
    return {
      prompt: `Was ist das Gegenteil von "${round.seed}"?`,
      secondary: 'Treffe den klarsten Gegenpol.',
      placeholder: 'Gegenteil eingeben...',
      badges: ['Kontrast', `Startwort ${round.seed}`]
    };
  },
  validateInput({ round, input }) {
    const candidate = normalizePartyText(input.value);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    const accepted = findAcceptedWord(round, candidate);
    if (!accepted) {
      return invalid('Das ist kein sauberer Gegenbegriff.');
    }

    return valid(accepted, 1, 'Gegenteil getroffen.');
  }
});

export const VerbotenerBuchstabe = createRuleGame({
  id: 'verbotener-buchstabe',
  name_de: 'Verbotener Buchstabe',
  description: 'Liefere passende Woerter, ohne den verbotenen Buchstaben zu benutzen.',
  topics: ['wortschatz', 'rechtschreibung'],
  kicker: 'Constraint',
  defaultRounds: 4,
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 1,
  buildRounds: ({ config }) => pickPreparedRounds(FORBIDDEN_LETTER_SETS, config.rounds),
  getPrompt({ round }) {
    return {
      prompt: `Nenne ein Wort aus ${round.category} ohne "${String(round.forbidden).toUpperCase()}".`,
      secondary: 'Der Buchstabe darf nirgendwo im Wort auftauchen.',
      placeholder: 'Sauberes Wort...',
      badges: [round.category, `Verbot ${String(round.forbidden).toUpperCase()}`]
    };
  },
  validateInput({ round, input }) {
    const rawValue = String(input.value || '').trim();
    const candidate = normalizePartyText(rawValue);
    const forbidden = normalizePartyText(round.forbidden);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    if (candidate.includes(forbidden)) {
      return invalid(`Der Buchstabe ${String(round.forbidden).toUpperCase()} ist verboten.`, rawValue);
    }

    const accepted = findAcceptedWord(round, candidate);
    if (!accepted) {
      return invalid('Passt nicht sauber zur Kategorie.', rawValue);
    }

    return valid(accepted, 1, 'Regel gehalten. Treffer.');
  }
});

export const FuenfSecTriple = createRuleGame({
  id: 'fuenf-sec-triple',
  name_de: '5-Sec-Triple',
  description: 'Drei gueltige Begriffe in einem Atemzug liefern.',
  topics: ['wortschatz', 'lesen', 'verben'],
  kicker: 'Burst',
  inputType: 'list',
  defaultRounds: 3,
  defaultCustom: { lives: 3, requiredCount: 3 },
  settingsFields: [
    { type: 'number', key: 'requiredCount', label: 'Anzahl Treffer', min: 2, max: 4, defaultValue: 3 }
  ],
  directPlayDefaults: {
    solo_arcade: { scoringMode: 'arcade', timeLimitSec: 8 },
    turn_based: { scoringMode: 'survival', timeLimitSec: 8 }
  },
  maxPointsPerTurn: 3,
  buildRounds: ({ config }) => pickPreparedRounds(FIVE_SEC_TRIPLE_SETS, config.rounds),
  getPrompt({ round, config }) {
    return {
      prompt: `Nenne ${config.custom.requiredCount || 3} Begriffe aus "${round.category}".`,
      secondary: 'Mehrere Antworten mit Komma trennen.',
      placeholder: 'Hund, Katze, Maus',
      badges: ['Tempo', round.category]
    };
  },
  validateInput({ round, input, config }) {
    const requiredCount = Number(config.custom.requiredCount || 3);
    const values = normalizeList(input.value);
    if (values.length !== requiredCount) {
      return invalid(`Genau ${requiredCount} Antworten noetig.`, Array.isArray(input.value) ? input.value.join(', ') : '');
    }

    const uniqueValues = [...new Set(values)];
    if (uniqueValues.length !== values.length) {
      return invalid('Keine Dopplungen im Triple.');
    }

    const resolved = uniqueValues.map((entry) => findAcceptedWord(round, entry));
    if (resolved.some((entry) => !entry)) {
      return invalid('Mindestens ein Begriff passt nicht zur Kategorie.');
    }

    return valid(resolved.join(', '), 3, 'Triple komplett. Stark.');
  }
});

export const WortMorph = createRuleGame({
  id: 'wort-morph',
  name_de: 'Wort-Morph',
  description: 'Aendere ein Wort minimal und lande auf einem echten Treffer.',
  topics: ['wortbildung', 'rechtschreibung', 'wortschatz'],
  kicker: 'Morph',
  defaultRounds: 4,
  defaultCustom: { lives: 3, maxDistance: 1 },
  settingsFields: [
    { type: 'number', key: 'maxDistance', label: 'Max. Aenderung', min: 1, max: 2, defaultValue: 1 }
  ],
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 2,
  buildRounds: ({ config }) => pickPreparedRounds(MORPH_SETS, config.rounds),
  getPrompt({ round, config }) {
    return {
      prompt: `Forme aus "${round.seed}" ein neues Wort mit hoechstens ${config.custom.maxDistance || 1} Aenderung.`,
      secondary: 'Nur echte Treffer aus dem Morph-Pool zaehlen.',
      placeholder: 'Neues Wort...',
      badges: ['Levenshtein', `Startwort ${round.seed}`]
    };
  },
  validateInput({ round, input, config }) {
    const rawValue = String(input.value || '').trim();
    const candidate = normalizePartyText(rawValue);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    const accepted = findAcceptedWord(round, candidate);
    if (!accepted) {
      return invalid('Das Zielwort liegt nicht im Morph-Pool.', rawValue);
    }

    const distance = levenshteinDistance(round.seed, accepted);
    if (distance > Number(config.custom.maxDistance || 1)) {
      return invalid('Zu viele Aenderungen fuer diese Runde.', rawValue);
    }

    return valid(accepted, 2, `Morph sitzt. Distanz ${distance}.`);
  }
});

export const VerbOnly = createRuleGame({
  id: 'verb-only',
  name_de: 'Verb-Only',
  description: 'Nur Verben liefern. Alles andere fliegt raus.',
  topics: ['verben', 'wortschatz'],
  kicker: 'Word Type',
  defaultRounds: 4,
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 1,
  buildRounds: ({ config }) => pickPreparedRounds(VERB_ONLY_SETS, config.rounds),
  getPrompt({ round }) {
    return {
      prompt: round.prompt,
      secondary: 'Nur Verben zaehlen in dieser Runde.',
      placeholder: 'Verb eingeben...',
      badges: ['Verben', 'Keine Nomen']
    };
  },
  validateInput({ round, input }) {
    const candidate = normalizePartyText(input.value);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    const accepted = findAcceptedWord(round, candidate);
    if (!accepted || !DIRECT_WORD_BANKS.verbs.map((entry) => normalizePartyText(entry)).includes(candidate)) {
      return invalid('Das ist kein sauberer Verb-Treffer.', String(input.value || ''));
    }

    return valid(accepted, 1, 'Verb sauber getroffen.');
  }
});

export const SubstantivOnly = createRuleGame({
  id: 'substantiv-only',
  name_de: 'Substantiv-Only',
  description: 'Nur Nomen zaehlen. Alles andere kostet den Zug.',
  topics: ['nomen', 'wortschatz'],
  kicker: 'Word Type',
  defaultRounds: 4,
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 1,
  buildRounds: ({ config }) => pickPreparedRounds(NOUN_ONLY_SETS, config.rounds),
  getPrompt({ round }) {
    return {
      prompt: round.prompt,
      secondary: 'Nur Nomen zaehlen in dieser Runde.',
      placeholder: 'Nomen eingeben...',
      badges: ['Nomen', 'Sauber gross denken']
    };
  },
  validateInput({ round, input }) {
    const candidate = normalizePartyText(input.value);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    const accepted = findAcceptedWord(round, candidate);
    if (!accepted || !DIRECT_WORD_BANKS.nouns.map((entry) => normalizePartyText(entry)).includes(candidate)) {
      return invalid('Das ist kein sauberer Nomen-Treffer.', String(input.value || ''));
    }

    return valid(accepted, 1, 'Nomen passt.');
  }
});

export const DoppelKategorie = createRuleGame({
  id: 'doppel-kategorie',
  name_de: 'Doppel-Kategorie',
  description: 'Ein Wort muss gleichzeitig zwei Bedingungen treffen.',
  topics: ['wortschatz', 'alphabet', 'lesen'],
  kicker: 'Double Filter',
  defaultRounds: 4,
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 2,
  buildRounds: ({ config }) => pickPreparedRounds(DOUBLE_CATEGORY_SETS, config.rounds),
  getPrompt({ round }) {
    return {
      prompt: round.prompt,
      secondary: 'Nur Woerter, die beide Filter treffen, zaehlen.',
      placeholder: 'Passendes Wort...',
      badges: [round.leftLabel, round.rightLabel]
    };
  },
  validateInput({ round, input }) {
    const candidate = normalizePartyText(input.value);
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    const accepted = findAcceptedWord(round, candidate);
    if (!accepted) {
      return invalid('Das trifft nicht beide Kategorien.');
    }

    return valid(accepted, 2, 'Doppel-Treffer gesetzt.');
  }
});

export const WortKette = createRuleGame({
  id: 'wort-kette',
  name_de: 'Wort-Kette',
  description: 'Andockwort finden, das mit dem letzten Buchstaben sauber startet.',
  topics: ['wortschatz', 'alphabet'],
  kicker: 'Chain',
  defaultRounds: 4,
  directPlayDefaults: SHARED_TURN_DEFAULTS,
  maxPointsPerTurn: 1,
  buildRounds: ({ config }) => pickPreparedRounds(WORD_CHAIN_SETS, config.rounds),
  getPrompt({ round }) {
    const lastLetter = String(round.seed || '').slice(-1).toUpperCase();
    return {
      prompt: `Letztes Wort: "${round.seed}". Finde ein neues Wort mit "${lastLetter}" am Anfang.`,
      secondary: 'Das neue Wort muss den Anschluss sauber halten.',
      placeholder: 'Naechstes Wort...',
      badges: ['Kette', `Start ${lastLetter}`]
    };
  },
  validateInput({ round, input }) {
    const rawValue = String(input.value || '').trim();
    const candidate = normalizePartyText(rawValue);
    const lastLetter = normalizePartyText(String(round.seed || '').slice(-1));
    if (!candidate) {
      return invalid('Antwort fehlt.');
    }

    if (!candidate.startsWith(lastLetter)) {
      return invalid(`Das Wort muss mit ${String(round.seed || '').slice(-1).toUpperCase()} beginnen.`, rawValue);
    }

    const accepted = findAcceptedWord(round, candidate);
    if (!accepted) {
      return invalid('Kein passender Kettenzug fuer diese Runde.', rawValue);
    }

    return valid(accepted, 1, 'Kette steht.');
  }
});
