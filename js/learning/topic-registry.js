/**
 * Topic Registry - All 20 German learning topics with metadata
 * 
 * This is language-agnostic structure. Each topic has:
 * - id: unique key
 * - label_de: German label (active)
 * - label_en: English label (future)
 * - category: grouping
 * - levels: which class levels support this topic
 * No emojis - icons rendered via SVG system
 */

export const TopicCategory = {
  WORTARTEN: 'Wortarten',
  SATZBAU: 'Satzbau',
  RECHTSCHREIBUNG: 'Rechtschreibung',
  LESEN: 'Lesen',
  WORTSCHATZ: 'Wortschatz'
};

export const TOPICS = [
  {
    id: 'nomen',
    label_de: 'Nomen',
    label_en: 'Nouns',
    category: TopicCategory.WORTARTEN,
    levels: ['vorschule', 'klasse1', 'klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'verben',
    label_de: 'Verben',
    label_en: 'Verbs',
    category: TopicCategory.WORTARTEN,
    levels: ['klasse1', 'klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'adjektive',
    label_de: 'Adjektive',
    label_en: 'Adjectives',
    category: TopicCategory.WORTARTEN,
    levels: ['klasse1', 'klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'artikel',
    label_de: 'Artikel',
    label_en: 'Articles',
    category: TopicCategory.WORTARTEN,
    levels: ['vorschule', 'klasse1', 'klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'pronomen',
    label_de: 'Pronomen',
    label_en: 'Pronouns',
    category: TopicCategory.WORTARTEN,
    levels: ['klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'satzarten',
    label_de: 'Satzarten',
    label_en: 'Sentence Types',
    category: TopicCategory.SATZBAU,
    levels: ['klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'satzbau',
    label_de: 'Satzbau',
    label_en: 'Sentence Structure',
    category: TopicCategory.SATZBAU,
    levels: ['klasse1', 'klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'satzglieder',
    label_de: 'Satzglieder',
    label_en: 'Sentence Parts',
    category: TopicCategory.SATZBAU,
    levels: ['klasse3', 'klasse4']
  },
  {
    id: 'singular_plural',
    label_de: 'Singular / Plural',
    label_en: 'Singular / Plural',
    category: TopicCategory.WORTARTEN,
    levels: ['vorschule', 'klasse1', 'klasse2', 'klasse3']
  },
  {
    id: 'zeitformen',
    label_de: 'Zeitformen',
    label_en: 'Tenses',
    category: TopicCategory.SATZBAU,
    levels: ['klasse3', 'klasse4']
  },
  {
    id: 'rechtschreibung',
    label_de: 'Rechtschreibung',
    label_en: 'Spelling',
    category: TopicCategory.RECHTSCHREIBUNG,
    levels: ['klasse1', 'klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'gross_klein',
    label_de: 'Groß- und Kleinschreibung',
    label_en: 'Capitalization',
    category: TopicCategory.RECHTSCHREIBUNG,
    levels: ['klasse1', 'klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'satzzeichen',
    label_de: 'Satzzeichen',
    label_en: 'Punctuation',
    category: TopicCategory.RECHTSCHREIBUNG,
    levels: ['klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'reime',
    label_de: 'Reime',
    label_en: 'Rhymes',
    category: TopicCategory.WORTSCHATZ,
    levels: ['vorschule', 'klasse1', 'klasse2']
  },
  {
    id: 'silben',
    label_de: 'Silben',
    label_en: 'Syllables',
    category: TopicCategory.WORTSCHATZ,
    levels: ['vorschule', 'klasse1', 'klasse2']
  },
  {
    id: 'lesen',
    label_de: 'Lesen',
    label_en: 'Reading',
    category: TopicCategory.LESEN,
    levels: ['klasse1', 'klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'hoerverstehen',
    label_de: 'Hörverstehen',
    label_en: 'Listening',
    category: TopicCategory.LESEN,
    levels: ['klasse1', 'klasse2', 'klasse3', 'klasse4']
    // Note: Placeholder - audio content not yet implemented
  },
  {
    id: 'wortschatz',
    label_de: 'Wortschatz',
    label_en: 'Vocabulary',
    category: TopicCategory.WORTSCHATZ,
    levels: ['vorschule', 'klasse1', 'klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'lueckentexte',
    label_de: 'Lückentexte',
    label_en: 'Fill in the Blanks',
    category: TopicCategory.LESEN,
    levels: ['klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'fehlerkorrektur',
    label_de: 'Fehlerkorrektur',
    label_en: 'Error Correction',
    category: TopicCategory.RECHTSCHREIBUNG,
    levels: ['klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'zusammengesetzte_nomen',
    label_de: 'Zusammengesetzte Nomen',
    label_en: 'Compound Nouns',
    category: TopicCategory.WORTARTEN,
    levels: ['klasse2', 'klasse3', 'klasse4']
  },
  {
    id: 'wortbildung',
    label_de: 'Wortbildung',
    label_en: 'Word Formation',
    category: TopicCategory.WORTSCHATZ,
    levels: ['klasse3', 'klasse4']
  }
];

/**
 * Get topics filtered by class level
 */
export function getTopicsForLevel(level) {
  if (level === 'frei') return TOPICS;
  return TOPICS.filter(t => t.levels.includes(level));
}

/**
 * Get topics by category
 */
export function getTopicsByCategory() {
  const grouped = {};
  for (const topic of TOPICS) {
    if (!grouped[topic.category]) grouped[topic.category] = [];
    grouped[topic.category].push(topic);
  }
  return grouped;
}

/**
 * Get topic by ID
 */
export function getTopicById(id) {
  return TOPICS.find(t => t.id === id);
}
