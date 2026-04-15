/**
 * German Content Module - Rechtschreibung (Spelling)
 * 
 * Content for: spelling detection, uppercase/lowercase, rhymes
 */

export const RECHTSCHREIBUNG_CONTENT = {
  // Words with correct/incorrect spelling pairs
  spellingPairs: {
    easy: [
      { correct: 'Schule', wrong: 'Schuhle', rule: 'Schule hat kein h' },
      { correct: 'Freund', wrong: 'Froind', rule: 'Freund wird mit eu geschrieben' },
      { correct: 'spielen', wrong: 'schpielen', rule: 'spielen beginnt mit sp, nicht schp' },
      { correct: 'Straße', wrong: 'Strase', rule: 'Straße wird mit ß geschrieben' },
      { correct: 'Fahrrad', wrong: 'Fahrad', rule: 'Fahrrad hat zwei r' },
      { correct: 'Vater', wrong: 'Fater', rule: 'Vater beginnt mit V' },
      { correct: 'Vogel', wrong: 'Fogel', rule: 'Vogel beginnt mit V' },
      { correct: 'wieder', wrong: 'wider', rule: 'wieder (nochmal) wird mit ie geschrieben' },
    ],
    medium: [
      { correct: 'Geburtstag', wrong: 'Gebursttag', rule: 'Geburts-tag' },
      { correct: 'Schmetterling', wrong: 'Schmeterling', rule: 'Schmetterling hat tt' },
      { correct: 'empfehlen', wrong: 'enfehlen', rule: 'empfehlen hat ein pf' },
      { correct: 'Entschuldigung', wrong: 'Entchuldigung', rule: 'Ent-schul-di-gung' },
      { correct: 'Bibliothek', wrong: 'Bibleothek', rule: 'Bib-li-o-thek' },
      { correct: 'Rhythmus', wrong: 'Rythmus', rule: 'Rhythmus hat ein h nach R' },
    ]
  },

  // Uppercase/lowercase tasks
  grossKlein: {
    easy: [
      { word: 'hund', correct: 'Hund', isNoun: true, explanation: 'Nomen werden großgeschrieben' },
      { word: 'Spielen', correct: 'spielen', isNoun: false, explanation: 'Verben werden kleingeschrieben' },
      { word: 'schule', correct: 'Schule', isNoun: true, explanation: 'Nomen werden großgeschrieben' },
      { word: 'Schnell', correct: 'schnell', isNoun: false, explanation: 'Adjektive werden kleingeschrieben' },
      { word: 'baum', correct: 'Baum', isNoun: true, explanation: 'Nomen werden großgeschrieben' },
      { word: 'Lesen', correct: 'lesen', isNoun: false, explanation: 'Verben werden kleingeschrieben' },
      { word: 'blume', correct: 'Blume', isNoun: true, explanation: 'Nomen werden großgeschrieben' },
      { word: 'Groß', correct: 'groß', isNoun: false, explanation: 'Adjektive werden kleingeschrieben' },
      { word: 'auto', correct: 'Auto', isNoun: true, explanation: 'Nomen werden großgeschrieben' },
      { word: 'Tanzen', correct: 'tanzen', isNoun: false, explanation: 'Verben werden kleingeschrieben' },
    ],
    medium: [
      { word: 'das lesen', correct: 'das Lesen', isNoun: true, explanation: 'Wenn ein Artikel davor steht, wird es zum Nomen' },
      { word: 'Heute', correct: 'heute', isNoun: false, explanation: 'Zeitwörter werden kleingeschrieben' },
      { word: 'freundschaft', correct: 'Freundschaft', isNoun: true, explanation: 'Wörter mit -schaft sind Nomen' },
    ]
  },

  // Rhyme pairs
  reime: {
    pairs: [
      ['Haus', 'Maus'], ['Hund', 'bunt'], ['Katze', 'Tatze'],
      ['Baum', 'Traum'], ['Nacht', 'lacht'], ['Licht', 'Gedicht'],
      ['Schein', 'Stein'], ['Tor', 'vor'], ['Sonne', 'Wonne'],
      ['Regen', 'Segen'], ['Schnee', 'See'], ['Stern', 'gern'],
      ['Wind', 'Kind'], ['Meer', 'schwer'], ['Tag', 'mag'],
      ['Buch', 'Tuch'], ['Rose', 'Hose'], ['Fisch', 'Tisch'],
      ['Hand', 'Sand'], ['Zahl', 'Mal']
    ],
    // Decoys (words that don't rhyme with the target)
    decoys: [
      'Apfel', 'Garten', 'Wolke', 'Fenster', 'Brücke', 'Lampe',
      'Schrank', 'Teller', 'Stuhl', 'Kerze', 'Blatt', 'Fluss',
      'Turm', 'Wiese', 'Berg', 'Wald', 'Stadt', 'Dorf'
    ]
  },

  // Texts with nouns to find (for noun-hunter)
  nounTexts: {
    easy: [
      {
        text: 'Der Hund spielt mit dem Ball im Garten. Die Sonne scheint und die Vögel singen.',
        nouns: ['Hund', 'Ball', 'Garten', 'Sonne', 'Vögel']
      },
      {
        text: 'Das Kind geht in die Schule. Es hat einen Apfel und ein Buch in der Tasche.',
        nouns: ['Kind', 'Schule', 'Apfel', 'Buch', 'Tasche']
      },
      {
        text: 'Die Katze sitzt auf dem Stuhl. Sie trinkt Milch aus einer Schüssel.',
        nouns: ['Katze', 'Stuhl', 'Milch', 'Schüssel']
      }
    ],
    medium: [
      {
        text: 'Am Morgen frühstückt die Familie in der Küche. Der Vater liest die Zeitung und die Mutter trinkt Kaffee. Die Kinder essen Brot mit Marmelade.',
        nouns: ['Morgen', 'Familie', 'Küche', 'Vater', 'Zeitung', 'Mutter', 'Kaffee', 'Kinder', 'Brot', 'Marmelade']
      }
    ]
  }
};
