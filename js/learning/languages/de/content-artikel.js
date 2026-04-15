/**
 * German Content Module - Artikel (Articles)
 * 
 * Content for: der/die/das article assignment tasks
 */

export const ARTIKEL_CONTENT = {
  // Nouns with their correct articles
  der: [
    'Hund', 'Baum', 'Ball', 'Tisch', 'Stuhl', 'Apfel', 'Mond', 'Stern',
    'Fisch', 'Berg', 'Fluss', 'Weg', 'Garten', 'Kuchen', 'Vogel',
    'Schuh', 'Hut', 'Ring', 'Stein', 'Wind', 'Regen', 'Schnee',
    'Morgen', 'Abend', 'Sommer', 'Winter', 'Frühling', 'Herbst',
    'Bleistift', 'Geburtstag', 'Spielplatz', 'Schulhof', 'Schmetterling',
    'Regenbogen', 'Buchstabe', 'Computer', 'Fernseher', 'Kühlschrank'
  ],
  die: [
    'Katze', 'Blume', 'Sonne', 'Tür', 'Maus', 'Schule', 'Birne',
    'Milch', 'Nase', 'Hand', 'Uhr', 'Lampe', 'Brücke', 'Wolke',
    'Straße', 'Wiese', 'Küche', 'Tasche', 'Flasche', 'Decke',
    'Freundschaft', 'Bücherei', 'Feuerwehr', 'Lehrerin', 'Turnhalle',
    'Entscheidung', 'Überraschung', 'Zeitung', 'Schokolade', 'Kartoffel',
    'Tomate', 'Banane', 'Erdbeere', 'Familie', 'Geschichte', 'Aufgabe'
  ],
  das: [
    'Haus', 'Auto', 'Buch', 'Bett', 'Kind', 'Brot', 'Tier', 'Pferd',
    'Schwein', 'Huhn', 'Ei', 'Glas', 'Bild', 'Lied', 'Spiel', 'Kleid',
    'Feld', 'Boot', 'Rad', 'Ohr', 'Auge', 'Haar', 'Herz', 'Wasser',
    'Feuer', 'Abenteuer', 'Frühstück', 'Geschenk', 'Geheimnis',
    'Ergebnis', 'Flugzeug', 'Fahrrad', 'Fenster', 'Wetter', 'Mädchen'
  ],

  // Pre-made quiz sets (word + 3 article options + correct answer)
  quizSets: {
    easy: [
      { word: 'Hund', correct: 'der' },
      { word: 'Katze', correct: 'die' },
      { word: 'Haus', correct: 'das' },
      { word: 'Sonne', correct: 'die' },
      { word: 'Ball', correct: 'der' },
      { word: 'Buch', correct: 'das' },
      { word: 'Blume', correct: 'die' },
      { word: 'Baum', correct: 'der' },
      { word: 'Auto', correct: 'das' },
      { word: 'Tisch', correct: 'der' },
      { word: 'Maus', correct: 'die' },
      { word: 'Brot', correct: 'das' },
      { word: 'Stuhl', correct: 'der' },
      { word: 'Tür', correct: 'die' },
      { word: 'Bett', correct: 'das' },
    ],
    medium: [
      { word: 'Schmetterling', correct: 'der' },
      { word: 'Bücherei', correct: 'die' },
      { word: 'Abenteuer', correct: 'das' },
      { word: 'Geburtstag', correct: 'der' },
      { word: 'Feuerwehr', correct: 'die' },
      { word: 'Frühstück', correct: 'das' },
      { word: 'Regenbogen', correct: 'der' },
      { word: 'Schokolade', correct: 'die' },
      { word: 'Fahrrad', correct: 'das' },
      { word: 'Spielplatz', correct: 'der' },
      { word: 'Erdbeere', correct: 'die' },
      { word: 'Geschenk', correct: 'das' },
    ],
    hard: [
      { word: 'Mädchen', correct: 'das' },    // Tricky: -chen is always das
      { word: 'Geheimnis', correct: 'das' },   // -nis is das
      { word: 'Freundschaft', correct: 'die' }, // -schaft is die
      { word: 'Entscheidung', correct: 'die' }, // -ung is die
      { word: 'Ergebnis', correct: 'das' },     // -nis is das
      { word: 'Buchstabe', correct: 'der' },
      { word: 'Fernseher', correct: 'der' },    // -er is often der
      { word: 'Kartoffel', correct: 'die' },
    ]
  },

  // Article rules (for helper/hint fields)
  rules: [
    { rule: 'Wörter mit -ung sind immer DIE', examples: ['Überraschung', 'Entscheidung', 'Übung'] },
    { rule: 'Wörter mit -schaft sind immer DIE', examples: ['Freundschaft', 'Gemeinschaft'] },
    { rule: 'Wörter mit -chen sind immer DAS', examples: ['Mädchen', 'Häuschen', 'Kätzchen'] },
    { rule: 'Wörter mit -nis sind immer DAS', examples: ['Geheimnis', 'Ergebnis'] },
    { rule: 'Wörter mit -er sind oft DER', examples: ['Computer', 'Fernseher', 'Lehrer'] },
    { rule: 'Tage und Monate sind immer DER', examples: ['Montag', 'Januar', 'Sommer'] }
  ]
};
