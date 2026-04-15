/**
 * German Content Module - Wortarten (Word Types)
 * 
 * Content for: Nomen, Verben, Adjektive identification tasks
 * All content is real German, educationally valid, and level-appropriate.
 */

export const WORTARTEN_CONTENT = {
  // Nouns with articles (der/die/das)
  nomen: {
    easy: [
      'Hund', 'Katze', 'Baum', 'Haus', 'Ball', 'Blume', 'Sonne', 'Mond',
      'Maus', 'Fisch', 'Auto', 'Buch', 'Tisch', 'Stuhl', 'Tür', 'Bett',
      'Kind', 'Mama', 'Papa', 'Schule', 'Apfel', 'Birne', 'Milch', 'Brot'
    ],
    medium: [
      'Freundschaft', 'Geburtstag', 'Spielplatz', 'Bücherei', 'Schmetterling',
      'Feuerwehr', 'Krankenhaus', 'Polizist', 'Lehrerin', 'Turnhalle',
      'Bleistift', 'Radiergummi', 'Frühstück', 'Nachmittag', 'Abenteuer'
    ],
    hard: [
      'Entscheidung', 'Verantwortung', 'Gemeinschaft', 'Erfahrung',
      'Überraschung', 'Vorstellung', 'Gerechtigkeit', 'Umgebung'
    ]
  },

  // Verbs
  verben: {
    easy: [
      'laufen', 'spielen', 'essen', 'trinken', 'schlafen', 'lesen',
      'malen', 'singen', 'tanzen', 'springen', 'schwimmen', 'fliegen',
      'lachen', 'weinen', 'rufen', 'geben', 'nehmen', 'sehen'
    ],
    medium: [
      'verstehen', 'erzählen', 'beobachten', 'sammeln', 'entdecken',
      'beschreiben', 'vergleichen', 'erklären', 'untersuchen', 'vorlesen',
      'aufräumen', 'vorbereiten', 'aufpassen', 'mitbringen', 'anfangen'
    ],
    hard: [
      'berücksichtigen', 'veranschaulichen', 'zusammenfassen',
      'unterscheiden', 'verwirklichen', 'hinterfragen'
    ]
  },

  // Adjectives
  adjektive: {
    easy: [
      'groß', 'klein', 'schnell', 'langsam', 'schön', 'hässlich',
      'laut', 'leise', 'warm', 'kalt', 'neu', 'alt', 'gut', 'böse',
      'hell', 'dunkel', 'süß', 'sauer', 'weich', 'hart'
    ],
    medium: [
      'freundlich', 'lustig', 'traurig', 'mutig', 'ängstlich',
      'neugierig', 'fleißig', 'gemütlich', 'spannend', 'langweilig',
      'wunderbar', 'gefährlich', 'wichtig', 'möglich', 'fröhlich'
    ],
    hard: [
      'außergewöhnlich', 'verantwortungsvoll', 'unglaublich',
      'selbstständig', 'abenteuerlich', 'geheimnisvoll'
    ]
  },

  // Mixed word lists for sorting tasks
  mixedSets: {
    easy: [
      { words: ['Hund', 'laufen', 'groß', 'Katze', 'spielen', 'klein'], 
        nomen: ['Hund', 'Katze'], verben: ['laufen', 'spielen'], adjektive: ['groß', 'klein'] },
      { words: ['Baum', 'singen', 'schön', 'Blume', 'tanzen', 'laut'],
        nomen: ['Baum', 'Blume'], verben: ['singen', 'tanzen'], adjektive: ['schön', 'laut'] },
      { words: ['Ball', 'springen', 'schnell', 'Sonne', 'lachen', 'warm'],
        nomen: ['Ball', 'Sonne'], verben: ['springen', 'lachen'], adjektive: ['schnell', 'warm'] },
      { words: ['Haus', 'essen', 'neu', 'Fisch', 'schwimmen', 'kalt'],
        nomen: ['Haus', 'Fisch'], verben: ['essen', 'schwimmen'], adjektive: ['neu', 'kalt'] },
      { words: ['Schule', 'malen', 'hell', 'Apfel', 'lesen', 'süß'],
        nomen: ['Schule', 'Apfel'], verben: ['malen', 'lesen'], adjektive: ['hell', 'süß'] },
    ],
    medium: [
      { words: ['Geburtstag', 'entdecken', 'neugierig', 'Spielplatz', 'erzählen', 'spannend'],
        nomen: ['Geburtstag', 'Spielplatz'], verben: ['entdecken', 'erzählen'], adjektive: ['neugierig', 'spannend'] },
      { words: ['Bleistift', 'beschreiben', 'wichtig', 'Abenteuer', 'sammeln', 'mutig'],
        nomen: ['Bleistift', 'Abenteuer'], verben: ['beschreiben', 'sammeln'], adjektive: ['wichtig', 'mutig'] },
    ]
  }
};
