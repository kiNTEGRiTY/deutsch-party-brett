import { WORTARTEN_CONTENT } from '../../learning/languages/de/content-wortarten.js';

function uniqueWords(words = []) {
  return [...new Set(words.filter(Boolean))];
}

function flattenWordType(type) {
  const bucket = WORTARTEN_CONTENT[type] || {};
  return uniqueWords([
    ...(bucket.easy || []),
    ...(bucket.medium || []),
    ...(bucket.hard || [])
  ]);
}

export const DIRECT_WORD_BANKS = {
  nouns: flattenWordType('nomen'),
  verbs: flattenWordType('verben'),
  adjectives: flattenWordType('adjektive')
};

export const SYNONYM_SETS = [
  { seed: 'schnell', accepted: ['flink', 'rasch', 'fix'], near: ['eilig'] },
  { seed: 'schon', accepted: ['huebsch', 'attraktiv'], near: ['nett'] },
  { seed: 'beginnen', accepted: ['anfangen', 'starten'], near: ['loslegen'] },
  { seed: 'traurig', accepted: ['betruebt', 'niedergeschlagen'], near: ['melancholisch'] },
  { seed: 'sprechen', accepted: ['reden', 'erzahlen'], near: ['plaudern'] },
  { seed: 'mutig', accepted: ['tapfer', 'couragiert'], near: ['stark'] }
];
export const ANTONYM_SETS = [
  { seed: 'laut', accepted: ['leise'] },
  { seed: 'kalt', accepted: ['warm', 'heiss'] },
  { seed: 'hell', accepted: ['dunkel'] },
  { seed: 'schnell', accepted: ['langsam'] },
  { seed: 'gross', accepted: ['klein'] },
  { seed: 'frueh', accepted: ['spaet'] }
];

export const FORBIDDEN_LETTER_SETS = [
  {
    category: 'Tiere',
    forbidden: 'e',
    accepted: ['Fuchs', 'Wolf', 'Luchs', 'Bison']
  },
  {
    category: 'Schulsachen',
    forbidden: 'a',
    accepted: ['Buch', 'Heft', 'Stift', 'Block']
  },
  {
    category: 'Berufe',
    forbidden: 'i',
    accepted: ['Arzt', 'Koch', 'Maler', 'Bauer']
  },
  {
    category: 'Essen',
    forbidden: 'o',
    accepted: ['Apfel', 'Kuchen', 'Kiwi', 'Salat']
  },
  {
    category: 'Orte',
    forbidden: 'u',
    accepted: ['Park', 'Wald', 'Gasse', 'Hafen']
  }
];

export const FIVE_SEC_TRIPLE_SETS = [
  {
    category: 'Tiere',
    accepted: ['Hund', 'Katze', 'Maus', 'Biber', 'Fuchs', 'Pferd']
  },
  {
    category: 'Dinge im Klassenzimmer',
    accepted: ['Tafel', 'Buch', 'Stift', 'Lineal', 'Heft', 'Mappe']
  },
  {
    category: 'Verben fuer Bewegung',
    accepted: ['laufen', 'springen', 'rennen', 'kriechen', 'tanzen', 'gehen']
  },
  {
    category: 'Gefuehle',
    accepted: ['froh', 'traurig', 'mutig', 'ruhig', 'nervoes', 'stolz']
  }
];

export const MORPH_SETS = [
  { seed: 'Haus', accepted: ['Maus', 'Laus', 'Haut'] },
  { seed: 'Sonne', accepted: ['Tonne', 'Wonne'] },
  { seed: 'Kalt', accepted: ['Bald', 'Kalb'] },
  { seed: 'Brot', accepted: ['Boot', 'Rot'] },
  { seed: 'Licht', accepted: ['Nicht', 'Dicht'] }
];

export const DOUBLE_CATEGORY_SETS = [
  {
    prompt: 'Tier mit B',
    leftLabel: 'Tiere',
    rightLabel: 'B',
    accepted: ['Biber', 'Baer', 'Bussard']
  },
  {
    prompt: 'Schulsache mit L',
    leftLabel: 'Schulsachen',
    rightLabel: 'L',
    accepted: ['Lineal', 'Loesungsheft']
  },
  {
    prompt: 'Gefuehl mit M',
    leftLabel: 'Gefuehle',
    rightLabel: 'M',
    accepted: ['Mut', 'Melancholie']
  },
  {
    prompt: 'Verb mit S',
    leftLabel: 'Verben',
    rightLabel: 'S',
    accepted: ['springen', 'singen', 'schreiben']
  }
];

export const VERB_ONLY_SETS = [
  {
    prompt: 'Nenne ein Bewegungsverb.',
    accepted: ['laufen', 'springen', 'rennen', 'kriechen', 'tanzen', 'gehen']
  },
  {
    prompt: 'Nenne ein Verb aus dem Klassenzimmer.',
    accepted: ['lesen', 'schreiben', 'rechnen', 'malen', 'erklaeren', 'zuhoeren']
  },
  {
    prompt: 'Nenne ein Verb fuer leise Aktionen.',
    accepted: ['fluestern', 'lauschen', 'schleichen', 'blinzeln', 'tippen']
  },
  {
    prompt: 'Nenne ein Verb fuer Teamwork.',
    accepted: ['helfen', 'teilen', 'planen', 'bauen', 'kooperieren']
  }
];

export const NOUN_ONLY_SETS = [
  {
    prompt: 'Nenne ein Ding im Klassenzimmer.',
    accepted: ['Tafel', 'Buch', 'Stift', 'Lineal', 'Heft', 'Radiergummi']
  },
  {
    prompt: 'Nenne ein Wort aus dem Wald.',
    accepted: ['Baum', 'Pilz', 'Fuchs', 'Moos', 'Bach', 'Luchs']
  },
  {
    prompt: 'Nenne etwas in der Kueche.',
    accepted: ['Topf', 'Pfanne', 'Teller', 'Loeffel', 'Mixer', 'Schale']
  },
  {
    prompt: 'Nenne etwas beim Camping.',
    accepted: ['Zelt', 'Lampe', 'Rucksack', 'Karte', 'Seil', 'Tasse']
  }
];

export const WORD_CHAIN_SETS = [
  {
    seed: 'Haus',
    accepted: ['Sonne', 'Sand', 'Salat', 'Suppe']
  },
  {
    seed: 'Tiger',
    accepted: ['Rose', 'Rucksack', 'Rakete']
  },
  {
    seed: 'Lampe',
    accepted: ['Esel', 'Eimer', 'Ente']
  },
  {
    seed: 'Brot',
    accepted: ['Tisch', 'Tanne', 'Tor']
  }
];
