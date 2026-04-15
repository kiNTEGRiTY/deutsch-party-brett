/**
 * German Content Module - Satzbau (Sentence Structure)
 * 
 * Content for: sentence ordering, sentence types, fill-in-the-blank
 */

export const SATZBAU_CONTENT = {
  // Sentences split into words for reordering tasks
  sentenceOrder: {
    easy: [
      { words: ['Der', 'Hund', 'spielt', 'im', 'Garten'], correct: 'Der Hund spielt im Garten.' },
      { words: ['Die', 'Katze', 'trinkt', 'Milch'], correct: 'Die Katze trinkt Milch.' },
      { words: ['Das', 'Kind', 'liest', 'ein', 'Buch'], correct: 'Das Kind liest ein Buch.' },
      { words: ['Mama', 'kocht', 'das', 'Essen'], correct: 'Mama kocht das Essen.' },
      { words: ['Ich', 'gehe', 'in', 'die', 'Schule'], correct: 'Ich gehe in die Schule.' },
      { words: ['Die', 'Sonne', 'scheint', 'heute'], correct: 'Die Sonne scheint heute.' },
      { words: ['Wir', 'spielen', 'gerne', 'Fußball'], correct: 'Wir spielen gerne Fußball.' },
      { words: ['Der', 'Vogel', 'singt', 'ein', 'Lied'], correct: 'Der Vogel singt ein Lied.' },
    ],
    medium: [
      { words: ['Am', 'Morgen', 'frühstückt', 'die', 'Familie', 'zusammen'], correct: 'Am Morgen frühstückt die Familie zusammen.' },
      { words: ['Die', 'Kinder', 'spielen', 'nach', 'der', 'Schule', 'draußen'], correct: 'Die Kinder spielen nach der Schule draußen.' },
      { words: ['Der', 'Lehrer', 'erklärt', 'die', 'Aufgabe', 'an', 'der', 'Tafel'], correct: 'Der Lehrer erklärt die Aufgabe an der Tafel.' },
      { words: ['Im', 'Winter', 'bauen', 'wir', 'einen', 'Schneemann'], correct: 'Im Winter bauen wir einen Schneemann.' },
      { words: ['Mein', 'Bruder', 'hat', 'heute', 'Geburtstag'], correct: 'Mein Bruder hat heute Geburtstag.' },
    ],
    hard: [
      { words: ['Gestern', 'hat', 'die', 'Lehrerin', 'uns', 'eine', 'spannende', 'Geschichte', 'erzählt'], correct: 'Gestern hat die Lehrerin uns eine spannende Geschichte erzählt.' },
      { words: ['Obwohl', 'es', 'regnet', 'gehen', 'die', 'Kinder', 'gerne', 'nach', 'draußen'], correct: 'Obwohl es regnet, gehen die Kinder gerne nach draußen.' },
    ]
  },

  // Fill in the blank sentences
  fillBlanks: {
    easy: [
      { sentence: 'Der Hund ___ im Park.', blank: 'spielt', options: ['spielt', 'fliegt', 'schwimmt', 'kocht'] },
      { sentence: 'Die Katze ___ auf dem Sofa.', blank: 'schläft', options: ['schläft', 'fährt', 'baut', 'schreibt'] },
      { sentence: 'Das Kind ___ ein Eis.', blank: 'isst', options: ['isst', 'liest', 'pflanzt', 'näht'] },
      { sentence: 'Die Sonne ___ am Himmel.', blank: 'scheint', options: ['scheint', 'regnet', 'weht', 'fällt'] },
      { sentence: 'Mama ___ einen Kuchen.', blank: 'backt', options: ['backt', 'pflückt', 'malt', 'singt'] },
      { sentence: 'Wir ___ gerne Fußball.', blank: 'spielen', options: ['spielen', 'kochen', 'lesen', 'schlafen'] },
    ],
    medium: [
      { sentence: 'Am Wochenende ___ wir oft in den Park.', blank: 'gehen', options: ['gehen', 'kochen', 'schreiben', 'malen'] },
      { sentence: 'Die Lehrerin ___ die Aufgabe an die Tafel.', blank: 'schreibt', options: ['schreibt', 'kocht', 'pflanzt', 'singt'] },
      { sentence: 'Der Regenbogen hat viele ___.', blank: 'Farben', options: ['Farben', 'Autos', 'Bücher', 'Schuhe'] },
      { sentence: 'Im Herbst fallen die ___ von den Bäumen.', blank: 'Blätter', options: ['Blätter', 'Steine', 'Wolken', 'Sterne'] },
      { sentence: 'Nach dem Essen ___ ich mir die Hände.', blank: 'wasche', options: ['wasche', 'male', 'lese', 'koche'] },
    ]
  },

  // Sentence types for identification
  satzarten: {
    easy: [
      { sentence: 'Der Hund spielt im Garten.', type: 'Aussagesatz', punctuation: '.' },
      { sentence: 'Spielst du gerne Fußball?', type: 'Fragesatz', punctuation: '?' },
      { sentence: 'Komm schnell her!', type: 'Ausrufesatz', punctuation: '!' },
      { sentence: 'Die Sonne scheint heute.', type: 'Aussagesatz', punctuation: '.' },
      { sentence: 'Wie heißt du?', type: 'Fragesatz', punctuation: '?' },
      { sentence: 'Pass auf!', type: 'Ausrufesatz', punctuation: '!' },
      { sentence: 'Ich lese gerne Bücher.', type: 'Aussagesatz', punctuation: '.' },
      { sentence: 'Wo wohnst du?', type: 'Fragesatz', punctuation: '?' },
    ]
  }
};
