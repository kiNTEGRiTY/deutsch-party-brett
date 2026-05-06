/**
 * Board - dynamic 36-field learning board with deterministic path geometry.
 */

import { FieldType } from './field-types.js';
import { getBoardLayoutForImage } from './board-layouts.js';

const TYPE_COUNTS = {
  [FieldType.NOMEN]: 8,
  [FieldType.VERBEN]: 8,
  [FieldType.ADJEKTIV]: 6,
  [FieldType.HELPER]: 4,
  [FieldType.MOVEMENT]: 4,
  [FieldType.TRAP]: 3,
  [FieldType.REWARD]: 2,
  [FieldType.PORTAL]: 1
};

const TYPE_ORDER = [
  FieldType.NOMEN,
  FieldType.VERBEN,
  FieldType.ADJEKTIV,
  FieldType.HELPER,
  FieldType.MOVEMENT,
  FieldType.TRAP,
  FieldType.REWARD,
  FieldType.PORTAL
];

const START_TYPES = [FieldType.NOMEN, FieldType.VERBEN, FieldType.ADJEKTIV, FieldType.HELPER];
const GOAL_TYPES = [FieldType.NOMEN, FieldType.VERBEN, FieldType.ADJEKTIV, FieldType.REWARD];

const LEARNING_FOCUS = {
  [FieldType.NOMEN]: {
    title: 'Nomen',
    subtitle: 'Artikel + Kontext',
    prompt: 'Finde den passenden Artikel und nutze das Wort in einer freundlichen Alltagsszene.'
  },
  [FieldType.VERBEN]: {
    title: 'Verben',
    subtitle: 'Konjugation + Satz',
    prompt: 'Bilde die passende Verbform und setze sie in einen sinnvollen Satz ein.'
  },
  [FieldType.ADJEKTIV]: {
    title: 'Adjektive',
    subtitle: 'Steigerung + passend',
    prompt: 'Waehle das treffende Adjektiv und steigere es richtig.'
  },
  [FieldType.HELPER]: {
    title: 'Helfer',
    subtitle: 'Tipp oder Schutz',
    prompt: 'Hier hilft dir das Spiel mit Beispiel, Hinweis oder Schutz.'
  },
  [FieldType.MOVEMENT]: {
    title: 'Bewegung',
    subtitle: 'Vor oder zurueck',
    prompt: 'Das Feld veraendert sofort deine Position auf dem Pfad.'
  },
  [FieldType.TRAP]: {
    title: 'Falle',
    subtitle: 'Risiko im Lernpfad',
    prompt: 'Hier verlierst du Strecke oder musst ein riskantes Feld aushalten.'
  },
  [FieldType.REWARD]: {
    title: 'Belohnung',
    subtitle: 'Bonus oder Extra-Zug',
    prompt: 'Eine gute Etappe bringt Muenzen oder einen Bonuszug.'
  },
  [FieldType.PORTAL]: {
    title: 'Portal',
    subtitle: 'Vor und zurueck',
    prompt: 'Das Portal verbindet zwei markierte Felder in beide Richtungen.'
  }
};

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createFields(imageId) {
  return getBoardLayoutForImage(imageId).map((field) => ({
    ...field,
    type: FieldType.NORMAL,
    shortLabel: '',
    displayValue: '',
    focusTitle: '',
    focusSubtitle: '',
    focusPrompt: '',
    move: 0,
    rewardMode: null,
    helperMode: null,
    portalPairId: undefined,
    portalRole: null
  }));
}

function isTypeAllowedAtPosition(type, position, totalFields) {
  if (position === 0) {
    return START_TYPES.includes(type);
  }

  if (position === totalFields - 1) {
    return GOAL_TYPES.includes(type);
  }

  if (type === FieldType.PORTAL) {
    return position >= 8 && position <= totalFields - 9;
  }

  if (type === FieldType.TRAP) {
    return position >= 6;
  }

  if (type === FieldType.REWARD) {
    return position >= 3 && position <= totalFields - 2;
  }

  return true;
}

function getTypeWeight(type, position, totalFields) {
  const progress = position / (totalFields - 1);

  switch (type) {
    case FieldType.HELPER:
      return progress < 0.34 ? 7 : progress < 0.7 ? 4 : 1;
    case FieldType.MOVEMENT:
      return progress < 0.34 ? 4 : progress < 0.7 ? 5 : 4;
    case FieldType.TRAP:
      return progress < 0.34 ? 0.3 : progress < 0.7 ? 2.8 : 6.5;
    case FieldType.REWARD:
      return progress < 0.34 ? 1.2 : progress < 0.7 ? 2 : 3.1;
    case FieldType.PORTAL:
      return progress < 0.34 ? 0.2 : progress < 0.7 ? 3.2 : 2.2;
    case FieldType.NOMEN:
      return progress < 0.34 ? 4.5 : progress < 0.7 ? 4 : 3.2;
    case FieldType.VERBEN:
      return progress < 0.34 ? 4.5 : progress < 0.7 ? 4.1 : 3.3;
    case FieldType.ADJEKTIV:
      return progress < 0.34 ? 3.4 : progress < 0.7 ? 3.5 : 3.9;
    default:
      return 1;
  }
}

function weightedCandidates(remaining, position, totalFields, previousType) {
  return TYPE_ORDER
    .filter((type) => remaining[type] > 0)
    .filter((type) => type !== previousType)
    .filter((type) => isTypeAllowedAtPosition(type, position, totalFields))
    .map((type) => ({
      type,
      weight: getTypeWeight(type, position, totalFields) * (1 + remaining[type] * 0.15) * (0.9 + Math.random() * 0.25)
    }))
    .sort((left, right) => right.weight - left.weight)
    .map((entry) => entry.type);
}

function buildTypeSequence(totalFields) {
  const remaining = { ...TYPE_COUNTS };
  const sequence = new Array(totalFields).fill(null);

  function fill(position, previousType = null) {
    if (position >= totalFields) {
      return true;
    }

    const candidates = weightedCandidates(remaining, position, totalFields, previousType);
    for (const type of candidates) {
      sequence[position] = type;
      remaining[type] -= 1;

      const nextPreviousType = type;
      if (fill(position + 1, nextPreviousType)) {
        return true;
      }

      remaining[type] += 1;
      sequence[position] = null;
    }

    return false;
  }

  const success = fill(0);
  if (!success) {
    throw new Error('Failed to generate a valid board sequence.');
  }

  return sequence;
}

function getMovementProfile(position, totalFields) {
  const progress = position / (totalFields - 1);
  if (progress < 0.34) {
    return shuffle([2, 2, 3])[0];
  }
  if (progress < 0.7) {
    return shuffle([2, 3, -2])[0];
  }
  return shuffle([3, -2, -3, 4])[0];
}

function getTrapProfile(position, totalFields) {
  const progress = position / (totalFields - 1);
  if (progress < 0.7) {
    return shuffle([-2, -3])[0];
  }
  return shuffle([-3, -4, -2])[0];
}

function getFocus(type) {
  return LEARNING_FOCUS[type] || {
    title: 'Aufgabe',
    subtitle: 'Lernen',
    prompt: 'Loese eine neue Deutsch-Aufgabe.'
  };
}

function formatSignedValue(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

export class Board {
  constructor(randomize = true, imageId = 'default') {
    this.imageId = imageId;
    this.fields = createFields(this.imageId);
    this.totalFields = this.fields.length;

    if (randomize) {
      this.randomizeLayout();
    }
  }

  randomizeLayout() {
    const types = buildTypeSequence(this.totalFields);

    this.fields = createFields(this.imageId).map((field, index) => {
      const type = types[index];
      const focus = getFocus(type);

      return {
        ...field,
        type,
        shortLabel: focus.title,
        focusTitle: focus.title,
        focusSubtitle: focus.subtitle,
        focusPrompt: focus.prompt
      };
    });

    this._decorateMovementFields();
    this._decorateTrapFields();
    this._decorateRewardFields();
    this._decorateHelperFields();
    this._linkPortalPair();
  }

  _decorateMovementFields() {
    this.fields
      .filter((field) => field.type === FieldType.MOVEMENT)
      .forEach((field) => {
        const move = getMovementProfile(field.id, this.totalFields);
        field.move = move;
        field.displayValue = formatSignedValue(move);
        field.shortLabel = move > 0 ? 'Sprint' : 'Umweg';
        field.focusSubtitle = move > 0 ? `${field.displayValue} Felder vor` : `${Math.abs(move)} Felder zurueck`;
      });
  }

  _decorateTrapFields() {
    this.fields
      .filter((field) => field.type === FieldType.TRAP)
      .forEach((field) => {
        const move = getTrapProfile(field.id, this.totalFields);
        field.move = move;
        field.displayValue = formatSignedValue(move);
        field.shortLabel = 'Falle';
        field.focusSubtitle = `${Math.abs(move)} Felder Risiko`;
      });
  }

  _decorateRewardFields() {
    const rewardFields = shuffle(this.fields.filter((field) => field.type === FieldType.REWARD));
    rewardFields.forEach((field, index) => {
      field.rewardMode = index === 0 ? 'coins' : 'extra_turn';
      field.displayValue = field.rewardMode === 'coins' ? '+3 M' : 'Bonuszug';
      field.shortLabel = field.rewardMode === 'coins' ? 'Bonus' : 'Extra-Zug';
      field.focusSubtitle = field.rewardMode === 'coins' ? 'Muenzen' : 'Sofort noch mal';
    });
  }

  _decorateHelperFields() {
    const modes = shuffle(['hint', 'protection', 'hint', 'example']);

    this.fields
      .filter((field) => field.type === FieldType.HELPER)
      .forEach((field, index) => {
        field.helperMode = modes[index % modes.length];
        field.shortLabel = field.helperMode === 'protection'
          ? 'Schutz'
          : field.helperMode === 'example'
            ? 'Beispiel'
            : 'Tipp';
        field.focusSubtitle = field.shortLabel;
      });
  }

  _linkPortalPair() {
    const portalField = this.fields.find((field) => field.type === FieldType.PORTAL);
    if (!portalField) {
      return;
    }

    const candidates = this.fields.filter((field) => {
      if (field.id <= portalField.id + 6) {
        return false;
      }

      if (field.id >= this.totalFields - 1) {
        return false;
      }

      return field.type !== FieldType.PORTAL;
    });

    const forwardTarget = candidates[randomInt(candidates.length)] || this.fields[Math.min(this.totalFields - 2, portalField.id + 10)];
    portalField.portalPairId = forwardTarget.id;
    portalField.portalRole = 'forward';
    portalField.displayValue = `↗ ${forwardTarget.id}`;
    portalField.shortLabel = 'Portal vor';
    portalField.focusSubtitle = `Sprung zu ${forwardTarget.id}`;

    forwardTarget.portalPairId = portalField.id;
    forwardTarget.portalRole = 'return';
    forwardTarget.portalLinkLabel = `↙ ${portalField.id}`;
  }

  getField(index) {
    if (index < 0) return this.fields[0];
    if (index >= this.totalFields) return this.fields[this.totalFields - 1];
    return this.fields[index];
  }

  getAllFields() {
    return this.fields;
  }

  getDestination(currentPos, diceValue) {
    const dest = currentPos + diceValue;
    return Math.min(dest, this.totalFields - 1);
  }

  isFinish(position) {
    return position >= this.totalFields - 1;
  }

  getStats() {
    const stats = {};
    for (const field of this.fields) {
      stats[field.type] = (stats[field.type] || 0) + 1;
    }
    return stats;
  }

  getSnapshot() {
    return {
      imageId: this.imageId,
      totalFields: this.totalFields,
      fields: this.fields.map((field) => ({ ...field }))
    };
  }

  loadSnapshot(snapshot) {
    if (!snapshot) {
      return;
    }

    this.imageId = snapshot.imageId || this.imageId;
    const baseFields = createFields(this.imageId);

    if (Array.isArray(snapshot.fields) && snapshot.fields.length === baseFields.length) {
      this.fields = baseFields.map((field, index) => ({
        ...(snapshot.fields[index] || {}),
        id: field.id,
        x: field.x,
        y: field.y,
        difficultyLevel: field.difficultyLevel
      }));
      this.totalFields = this.fields.length;
      return;
    }

    this.fields = baseFields;
    this.totalFields = this.fields.length;
    this.randomizeLayout();
  }
}
