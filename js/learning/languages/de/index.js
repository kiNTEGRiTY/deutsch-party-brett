/**
 * German Language Module - Main entry point
 * 
 * Implements the LanguageInterface for German.
 * This is the active language module. Future languages (English, etc.)
 * would follow the same structure in their own directory.
 */

import { WORTARTEN_CONTENT } from './content-wortarten.js';
import { ARTIKEL_CONTENT } from './content-artikel.js';
import { SATZBAU_CONTENT } from './content-satzbau.js';
import { RECHTSCHREIBUNG_CONTENT } from './content-rechtschreibung.js';
import { LESEN_CONTENT } from './content-lesen.js';
import { SILBEN_CONTENT } from './content-silben.js';
import { ZEITFORMEN_CONTENT } from './content-zeitformen.js';
import { SATZZEICHEN_CONTENT } from './content-satzzeichen.js';
import { COMPOUND_CONTENT } from './content-zusammengesetzt.js';

/**
 * Get difficulty key from numeric level
 */
function getDifficultyKey(level) {
  if (level <= 2) return 'easy';
  if (level <= 4) return 'medium';
  return 'hard';
}

/**
 * Pick random items from array
 */
function pickRandom(arr, count = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

const GermanModule = {
  getLanguageId() { return 'de'; },
  getLanguageName() { return 'Deutsch'; },

  /**
   * Get content for a topic at a given difficulty
   */
  getContent(topic, difficulty = {}) {
    const level = difficulty.languageComplexity || 2;
    const diffKey = getDifficultyKey(level);

    switch (topic) {
      case 'nomen':
      case 'verben':
      case 'adjektive':
        return {
          type: 'wortarten',
          words: WORTARTEN_CONTENT[topic]?.[diffKey] || WORTARTEN_CONTENT[topic]?.easy || [],
          mixedSets: WORTARTEN_CONTENT.mixedSets?.[diffKey] || WORTARTEN_CONTENT.mixedSets?.easy || []
        };

      case 'artikel':
        return {
          type: 'artikel',
          quizSets: ARTIKEL_CONTENT.quizSets?.[diffKey] || ARTIKEL_CONTENT.quizSets?.easy || [],
          rules: ARTIKEL_CONTENT.rules
        };

      case 'satzbau':
        return {
          type: 'satzbau',
          sentenceOrder: SATZBAU_CONTENT.sentenceOrder?.[diffKey] || SATZBAU_CONTENT.sentenceOrder?.easy || [],
        };

      case 'satzarten':
        return {
          type: 'satzarten',
          sentences: SATZBAU_CONTENT.satzarten?.[diffKey] || SATZBAU_CONTENT.satzarten?.easy || []
        };

      case 'lueckentexte':
        return {
          type: 'fillBlanks',
          items: SATZBAU_CONTENT.fillBlanks?.[diffKey] || SATZBAU_CONTENT.fillBlanks?.easy || []
        };

      case 'rechtschreibung':
      case 'fehlerkorrektur':
        return {
          type: 'spelling',
          pairs: RECHTSCHREIBUNG_CONTENT.spellingPairs?.[diffKey] || RECHTSCHREIBUNG_CONTENT.spellingPairs?.easy || []
        };

      case 'gross_klein':
        return {
          type: 'grossKlein',
          items: RECHTSCHREIBUNG_CONTENT.grossKlein?.[diffKey] || RECHTSCHREIBUNG_CONTENT.grossKlein?.easy || []
        };

      case 'reime':
        return {
          type: 'reime',
          pairs: RECHTSCHREIBUNG_CONTENT.reime.pairs,
          decoys: RECHTSCHREIBUNG_CONTENT.reime.decoys
        };

      case 'lesen':
        return {
          type: 'lesen',
          texts: LESEN_CONTENT.readingTexts?.[diffKey] || LESEN_CONTENT.readingTexts?.easy || []
        };

      case 'silben':
        return {
          type: 'silben',
          words: SILBEN_CONTENT.words?.[diffKey] || SILBEN_CONTENT.words?.easy || []
        };
        
      case 'zeitformen':
        return {
          type: 'zeitformen',
          content: ZEITFORMEN_CONTENT
        };
        
      case 'satzzeichen':
        return {
          type: 'satzzeichen',
          content: SATZZEICHEN_CONTENT
        };
        
      case 'zusammengesetzte_nomen':
        return {
          type: 'compound',
          items: COMPOUND_CONTENT
        };

      default:
        // For topics without specific content yet, return generic word content
        return {
          type: 'wortarten',
          words: WORTARTEN_CONTENT.nomen?.[diffKey] || WORTARTEN_CONTENT.nomen?.easy || [],
          mixedSets: WORTARTEN_CONTENT.mixedSets?.[diffKey] || WORTARTEN_CONTENT.mixedSets?.easy || []
        };
    }
  },

  /**
   * Get instructions for a mini-game type
   */
  getInstructions(miniGameType) {
    const instructions = {
      'word-type-sort': 'Sortiere die Wörter in die richtige Kategorie: Nomen, Verben oder Adjektive!',
      'article-choice': 'Wähle den richtigen Artikel: der, die oder das?',
      'sentence-order': 'Bringe die Wörter in die richtige Reihenfolge!',
      'fill-blanks': 'Setze das richtige Wort in die Lücke ein!',
      'spelling-detective': 'Finde das falsch geschriebene Wort!',
      'case-choice': 'Wird das Wort groß oder klein geschrieben?',
      'noun-hunter': 'Finde alle Nomen im Text!',
      'rhyme-match': 'Finde die Wörter, die sich reimen!',
      'syllable-counter': 'Wie viele Silben hat das Wort?',
      'time-machine': 'In welche Zeitform gehört das Verb?',
      'punctuation-catcher': 'Welches Satzzeichen fehlt hier?',
      'compound-builder': 'Bilde ein zusammengesetztes Nomen!',
      'word-ninja': 'Zerschneide die Nomen, aber pass auf die Verben auf!',
      'word-meteorites': 'Tippe die fallenden Wörter schnell ab!',
      'article-cannon': 'Feuere den richtigen Artikel auf das Wort!',
      'sentence-train': 'Bringe die Waggons in die richtige Reihenfolge!',
      'lie-detector': 'Ist dieses Wort richtig geschrieben? Wahr oder Lüge?',
      'teakettle-detective': 'Finde das gesuchte Teekesselchen!',
      'cryptogram': 'Entschlüssle den geheimen Code!',
      'word-balance': 'Finde das genaue Gegenteil!',
      'memory-chain': 'Merke dir die Reihenfolge der Bilder!',
      'abc-bubbles': 'Zerplatze die Blasen nach dem Alphabet!',
      'syllable-dj': 'Drehe die Platten, bis ein Wort entsteht!',
      'hidden-object': 'Suche das beschriebene Objekt!',
      'adjective-painter': 'Male das Bild genau nach Anweisung an!',
      'difference-detective': 'Finde den passenden Fehler im unteren Bild!',
      'word-search-swipe': 'Streiche die versteckten Wörter ab!',
      'rhyme-memory': 'Finde die reimenden Kartenpaare!',
      'anagram-blast': 'Ordne die Buchstaben zum richtigen Wort!',
      'gender-sort': 'Welcher Artikel gehört zum Wort?',
      'plural-match': 'Wie lautet der Plural?',
      'missing-letter': 'Welcher Vokal wurde gestohlen?',
      'speed-flash': 'Merke dir das aufblitzende Wort!',
      'word-chain': 'Bilde eine Wortkette!',
      'synonym-snap': 'Welches Wort bedeutet dasselbe?',
      'verb-pulse': 'Konjugiere das Verb richtig!',
      'preposition-world': 'Welche Präposition passt?',
      'comma-king': 'Setze die Kommas richtig!',
      'category-blitz': 'Tippe alle Wörter aus der Kategorie!',
      'story-builder': 'Fülle die Lücken in der Geschichte!',
      'emoji-translator': 'Was bedeutet diese Emoji-Botschaft?',
      'category-sort': 'Sortiere die Wörter in die Kategorien!',
      'word-clock': 'Wie heißt diese Uhrzeit auf Deutsch?',
      'hot-cold': 'Welches Wort ist näher in der Bedeutung?',
      'word-labyrinth': 'Navigiere durch das Labyrinth und sammle die Buchstaben!',
      'opposite-racer': 'Finde das Gegenteil - so schnell wie möglich!',
      'number-words': 'Verbinde Zahlen mit ihren deutschen Wörtern!',
      'sentence-sense': 'Macht dieser Satz Sinn?',
      'whack-a-noun': 'Klopfe die Nomen, ignoriere Verben!',
      'definition-match': 'Welches Wort passt zur Definition?',
      'compound-chain': 'Bilde zusammengesetzte Nomen!',
      'image-word-match': 'Verbinde Bilder mit ihren deutschen Wörtern!',
      'bubble-burst': 'Platze nur die Adjektiv-Blasen!',
      'word-family-tree': 'Welche Wörter gehören zur selben Wortfamilie?',
      'syllable-stomp': 'Wie viele Silben hat das Wort?',
      'tense-switcher': 'Wandle das Verb in die richtige Zeit um!',
      'word-avalanche': 'Markiere alle Nomen in der Reihe!',
      'question-word-match': 'Welches Fragewort passt?',
      'color-words': 'Tippe auf die Tintenfarbe, nicht auf das Wort!',
      'password-crack': 'Rate das geheime Wort anhand von Hinweisen!',
      'letter-drop': 'Fange die richtigen Buchstaben in der richtigen Reihenfolge!',
      'capital-detective': 'Tippe auf alle Wörter, die groß geschrieben werden!',
      'adjective-endings': 'Welche Adjektivendung passt?',
      'german-idiom': 'Was bedeutet diese Redewendung wirklich?',
      'blitz-quiz': 'Wahr oder Falsch - so schnell wie möglich!',
      'alphabet-sort': 'Tippe die Wörter in alphabetischer Reihenfolge!',
      'modal-verb': 'Welches Modalverb passt in den Satz?',
      'fill-the-poem': 'Ergänze das Gedicht mit dem richtigen Reimwort!',
      'word-star': 'Bilde so viele Wörter wie möglich aus den Buchstaben!',
      'verb-forms': 'Welche Form hat das unregelmäßige Verb?',
      'split-the-word': 'Wo teilt sich das zusammengesetzte Wort auf?',
      'prefix-postfix': 'Welche Vor- oder Nachsilbe passt?',
      'reading-race': 'Lies den Text schnell und beantworte die Fragen!',
      'double-letter': 'Welche Schreibweise ist richtig?',
      'compound-meaning': 'Was bedeutet dieses zusammengesetzte Wort?',
      'comic-strip': 'Bringe die Comic-Panels in die richtige Reihenfolge!',
      'mirror-word': 'Lies das spiegelverkehrte Wort!',
      'word-chess': 'Welches Wort gewinnt das Duell nach der Regel?',
      'slingshot-spelling': 'Schieße den richtigen Buchstaben auf die Lücke!',
      'gravity-sort': 'Sortiere die fallenden Wörter in die richtigen Eimer!',
      'word-stacker': 'Staple die Wörter in der richtigen Reihenfolge!',
      'case-solver': 'Bestimme den grammatikalischen Fall des Wortes!',
      'secret-agent-code': 'Entziffere das Wort mit dem Geheimcode!',
      'logic-ladder': 'Vervollständige die logische Wortreihe!',
      'mad-libs-de': 'Fülle die Lücken mit lustigen Wörtern!',
      'sentence-scramble': 'Bringe den Satz wieder in Ordnung!',
      'rhyme-rider': 'Fange alle Wörter, die sich reimen!',
      'tap-the-type': 'Tippe schnell auf die gesuchte Wortart!',
      'word-match-fast': 'Verbinde das Bild so schnell wie möglich mit dem Wort!',
      'vowel-vacuum': 'Sammle die verschwundenen Vokale ein!',
      'synonym-bridge': 'Find das Wort mit der gleichen Bedeutung!',
      'antonym-arch': 'Finde das Gegenteil des Wortes!',
      'gender-gym': 'Ordne den Wörtern schnell den richtigen Artikel zu!',
      'word-detective': 'Errate das Wort anhand der Hinweise!',
      'sentence-sniper': 'Finde das Wort, das nicht in den Satz passt!',
      'article-ace': 'Welcher Artikel gehört zu diesem Wort?',
      'grammar-ghost': 'Korrigiere den Fehler im Geistersatz!',
      'idiom-island': 'Was sagt man in dieser Situation am besten?',
      'proverb-path': 'Vervollständige das bekannte Sprichwort!',
      'prefix-power': 'Wähle das passende Präfix für das Verb!',
      'suffix-sun': 'Welches Suffix bildet ein korrektes Wort?',
      'tense-tornado': 'Bestimme schnell die Zeitform des Verbs!',
      'word-puzzle-3x3': 'Schiebe die Kacheln, bis das Wort stimmt!',
      'letter-bounce': 'Lasse den Buchstaben in das richtige Ziel springen!',
      'word-fishing': 'Angle dir die Wörter der richtigen Sorte!',
      'sentence-bridge': 'Verbinde die Satzteile zu einem Ganzen!',
      'category-cannon': 'Schieße das Wort in die richtige Kategorie!',
      'spelling-bee-de': 'Buchstabiere das Wort fehlerfrei!',
      'word-pyramid': 'Baue die Wort-Pyramide von oben nach unten auf!',
      'crossword-mini': 'Löse das kleine Kreuzworträtsel!',
      'word-balloon': 'Platze die Ballons in der richtigen Reihenfolge!',
      'grammar-maze': 'Finde den Weg durch das Grammatik-Labyrinth!',
      'detective-adventure': 'Löse den Fall! Sammle Hinweise und entlarve den Dieb.',
      'grammar-rpg': 'Steuere den Fuchs zu den Schreinen und öffne das Tor!',
      'kitchen-chaos': 'Meisterkoch gesucht! Folge den Anweisungen präzise.',
      'sentence-architect': 'Baue den Satz stabil auf - ein Fehler lässt alles einstürzen!',
      'word-alchemy': 'Mische die richtigen Silben im Kessel, um Wort-Gold zu erschaffen!',
      'sentence-symphony': 'Dirigiere das Wort-Orchester in der richtigen Satz-Melodie!',
      'time-traveler': 'Drehe an der Zeitform-Uhr, um die Pflanze wachsen zu lassen!',
      'dialogue-duel': 'Wähle deine Worte weise im Gespräch mit deinen Freunden!',
      'mystery-box': 'Löse die mechanischen Rätsel der Box, um das Geheimnis zu lüften!',
      'sentence-stacker': 'Staple die Wort-Kartons in der richtigen Reihenfolge übereinander!',
      'syllable-fishing': 'Angle dir die Silben-Boote in der richtigen Reihenfolge!',
      'scrap-hunt': 'Schiebe die Pappen beiseite und finde die versteckten Wörter!',
    };
    return instructions[miniGameType] || 'Löse die Aufgabe!';
  },

  /**
   * Get all UI strings
   */
  getUIStrings() {
    return {
      // App
      appTitle: 'Deutsch Party Brett',
      appSubtitle: 'Das lustige Lernspiel für die Grundschule!',
      
      // Start screen
      newGame: 'Neues Spiel',
      continueGame: 'Fortsetzen',
      loadProfile: 'Profil laden',
      
      // Setup
      setupPlayers: 'Spieler einrichten',
      addPlayer: '+ Spieler hinzufügen',
      playerName: 'Name eingeben...',
      choosePreset: 'Spielvariante wählen',
      chooseLevel: 'Klassenstufe wählen',
      chooseTopics: 'Themen auswählen',
      adjustDifficulty: 'Schwierigkeit anpassen',
      chooseMode: 'Spielmodus',
      summary: 'Zusammenfassung',
      startGame: 'Spiel starten! 🎲',
      back: 'Zurück',
      next: 'Weiter',
      
      // Board
      roundLabel: 'Runde',
      rollDice: 'Würfeln! 🎲',
      yourTurn: 'Du bist dran!',
      
      // Results
      gameOver: 'Spiel beendet!',
      congratulations: 'Herzlichen Glückwunsch!',
      playAgain: 'Nochmal spielen',
      backToStart: 'Zum Start',
      
      // Stats
      coins: 'Münzen',
      stars: 'Sterne',
      tasks: 'Aufgaben',
      accuracy: 'Genauigkeit',
      
      // Feedback
      correct: 'Richtig! 🎉',
      wrong: 'Leider falsch 😊',
      tryAgain: 'Versuch es nochmal!',
      wellDone: 'Gut gemacht!',
      almostThere: 'Fast!',
      
      // Levels
      levels: {
        vorschule: 'Vorschule',
        klasse1: 'Klasse 1',
        klasse2: 'Klasse 2',
        klasse3: 'Klasse 3',
        klasse4: 'Klasse 4',
        frei: 'Freier Modus'
      },
      
      // Game modes
      modes: {
        single: 'Einzelspieler',
        local: 'Multiplayer',
        classroom: 'Klassenzimmer',
        party: 'Party-Modus',
        team: 'Team-Modus'
      }
    };
  }
};

export default GermanModule;
