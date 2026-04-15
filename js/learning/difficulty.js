/**
 * Difficulty System - Multi-axis difficulty scaling
 * 
 * Instead of a single "easy/medium/hard", the difficulty is broken into
 * independent axes that can be tuned individually.
 * No emojis - icons are rendered via SVG in the UI layer.
 */

export const DifficultyAxis = {
  LANGUAGE_COMPLEXITY: 'languageComplexity',
  SENTENCE_LENGTH: 'sentenceLength',
  TIME_PRESSURE: 'timePressure',
  HINT_AMOUNT: 'hintAmount',
  ANSWER_OPTIONS: 'answerOptions',
  ERROR_DENSITY: 'errorDensity',
  INPUT_MODE: 'inputMode'
};

// Axis metadata for UI rendering
export const AXIS_META = {
  [DifficultyAxis.LANGUAGE_COMPLEXITY]: {
    label_de: 'Sprachkomplexität',
    label_en: 'Language Complexity',
    min: 1, max: 5, default: 2,
    labels_de: ['Einfach', 'Leicht', 'Mittel', 'Schwer', 'Sehr schwer'],
    description_de: 'Wie komplex sind die Wörter und Sätze?'
  },
  [DifficultyAxis.SENTENCE_LENGTH]: {
    label_de: 'Satzlänge',
    label_en: 'Sentence Length',
    min: 1, max: 5, default: 2,
    labels_de: ['3 Wörter', '5 Wörter', '7 Wörter', '10 Wörter', '12+ Wörter'],
    description_de: 'Wie lang sind die Sätze in den Aufgaben?'
  },
  [DifficultyAxis.TIME_PRESSURE]: {
    label_de: 'Zeitdruck',
    label_en: 'Time Pressure',
    min: 0, max: 5, default: 1,
    labels_de: ['Kein Timer', 'Sehr entspannt', 'Entspannt', 'Normal', 'Schnell', 'Sehr schnell'],
    description_de: 'Wie viel Zeit hat man für eine Aufgabe?'
  },
  [DifficultyAxis.HINT_AMOUNT]: {
    label_de: 'Hilfen',
    label_en: 'Hints Available',
    min: 0, max: 5, default: 3,
    labels_de: ['Keine', 'Sehr wenig', 'Wenig', 'Normal', 'Viele', 'Sehr viele'],
    description_de: 'Wie viele Hilfen und Tipps gibt es?'
  },
  [DifficultyAxis.ANSWER_OPTIONS]: {
    label_de: 'Antwortmöglichkeiten',
    label_en: 'Answer Options',
    min: 2, max: 6, default: 3,
    labels_de: ['2', '3', '4', '5', '6'],
    description_de: 'Wie viele Antwortmöglichkeiten gibt es?'
  },
  [DifficultyAxis.ERROR_DENSITY]: {
    label_de: 'Fehlerdichte',
    label_en: 'Error Density',
    min: 1, max: 5, default: 2,
    labels_de: ['Sehr wenig', 'Wenig', 'Normal', 'Viele', 'Sehr viele'],
    description_de: 'Wie viele Fehler verstecken sich in Texten?'
  },
  [DifficultyAxis.INPUT_MODE]: {
    label_de: 'Eingabeart',
    label_en: 'Input Mode',
    min: 0, max: 1, default: 0,
    labels_de: ['Auswahl (Multiple Choice)', 'Freie Eingabe'],
    description_de: 'Wählen oder selbst tippen?'
  }
};

/**
 * Default difficulty settings
 */
export function getDefaultDifficulty() {
  const diff = {};
  for (const [key, meta] of Object.entries(AXIS_META)) {
    diff[key] = meta.default;
  }
  return diff;
}

/**
 * Get timer duration in seconds based on time pressure level
 */
export function getTimerDuration(timePressure) {
  const durations = {
    0: 0,     // No timer
    1: 60,    // Very relaxed
    2: 45,    // Relaxed
    3: 30,    // Normal
    4: 20,    // Fast
    5: 10     // Very fast
  };
  return durations[timePressure] || 0;
}

/**
 * Scale content based on difficulty
 */
export function scaleDifficulty(baseDifficulty, adjustments = {}) {
  return { ...baseDifficulty, ...adjustments };
}
