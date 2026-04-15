/**
 * Presets - Pre-configured game setups
 * No emojis - icons rendered via SVG in UI layer
 */

export const PRESETS = [
  {
    id: 'wortarten-leicht',
    name_de: 'Wortarten leicht',
    name_en: 'Word Types Easy',
    description_de: 'Nomen, Verben und Adjektive erkennen - perfekt zum Einstieg!',
    classLevel: 'klasse1',
    topics: ['nomen', 'verben', 'adjektive'],
    difficulty: {
      languageComplexity: 1,
      sentenceLength: 1,
      timePressure: 0,
      hintAmount: 4,
      answerOptions: 3,
      errorDensity: 1,
      inputMode: 0
    },
    gameMode: 'local'
  },
  {
    id: 'artikel-training',
    name_de: 'Artikel Training',
    name_en: 'Article Training',
    description_de: 'Der, die oder das? Übung macht den Meister!',
    classLevel: 'klasse1',
    topics: ['artikel'],
    difficulty: {
      languageComplexity: 2,
      sentenceLength: 1,
      timePressure: 1,
      hintAmount: 3,
      answerOptions: 3,
      errorDensity: 1,
      inputMode: 0
    },
    gameMode: 'local'
  },
  {
    id: 'satzbau-basis',
    name_de: 'Satzbau Basis',
    name_en: 'Sentence Building',
    description_de: 'Wörter in die richtige Reihenfolge bringen.',
    classLevel: 'klasse2',
    topics: ['satzbau', 'lueckentexte'],
    difficulty: {
      languageComplexity: 2,
      sentenceLength: 2,
      timePressure: 1,
      hintAmount: 3,
      answerOptions: 4,
      errorDensity: 1,
      inputMode: 0
    },
    gameMode: 'local'
  },
  {
    id: 'rechtschreibung-entspannt',
    name_de: 'Rechtschreibung ohne Zeitdruck',
    name_en: 'Spelling Relaxed',
    description_de: 'In Ruhe die richtige Schreibweise finden.',
    classLevel: 'klasse2',
    topics: ['rechtschreibung', 'gross_klein', 'fehlerkorrektur'],
    difficulty: {
      languageComplexity: 2,
      sentenceLength: 2,
      timePressure: 0,
      hintAmount: 4,
      answerOptions: 4,
      errorDensity: 2,
      inputMode: 0
    },
    gameMode: 'local'
  },
  {
    id: 'klasse2-basis',
    name_de: 'Klasse 2 Basis',
    name_en: 'Grade 2 Standard',
    description_de: 'Alle Themen für Klasse 2 - der perfekte Mix!',
    classLevel: 'klasse2',
    topics: ['nomen', 'verben', 'adjektive', 'artikel', 'satzbau', 'rechtschreibung', 'gross_klein', 'reime', 'lesen'],
    difficulty: {
      languageComplexity: 2,
      sentenceLength: 2,
      timePressure: 1,
      hintAmount: 3,
      answerOptions: 3,
      errorDensity: 2,
      inputMode: 0
    },
    gameMode: 'local'
  },
  {
    id: 'freies-sprachspiel',
    name_de: 'Freies Sprachspiel',
    name_en: 'Free Play',
    description_de: 'Alles ist möglich! Alle Themen, alle Level.',
    classLevel: 'frei',
    topics: null, // null = enable all
    difficulty: {
      languageComplexity: 3,
      sentenceLength: 3,
      timePressure: 2,
      hintAmount: 2,
      answerOptions: 4,
      errorDensity: 3,
      inputMode: 0
    },
    gameMode: 'local'
  }
];
