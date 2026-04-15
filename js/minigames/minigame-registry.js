/**
 * Mini-Game Registry - Central registry of all mini-games
 * 
 * Each mini-game module exports a standard interface:
 * - id: unique identifier
 * - name_de: German name
 * - topics: which topics this game serves
 * - setup(container, task, onComplete): initialize the game
 */

import { WordTypeSort } from './word-type-sort.js';
import { ArticleChoice } from './article-choice.js';
import { SentenceOrder } from './sentence-order.js';
import { FillBlanks } from './fill-blanks.js';
import { SpellingDetective } from './spelling-detective.js';
import { CaseChoice } from './case-choice.js';
import { NounHunter } from './noun-hunter.js';
import { RhymeMatch } from './rhyme-match.js';
import { ImagePuzzle } from './image-puzzle.js';
import { SyllableCounter } from './syllable-counter.js';
import { TimeMachine } from './time-machine.js';
import { PunctuationCatcher } from './punctuation-catcher.js';
import { CompoundBuilder } from './compound-builder.js';
import { WordNinja } from './word-ninja.js';
import { WordMeteorites } from './word-meteorites.js';
import { ArticleCannon } from './article-cannon.js';
import { SentenceTrain } from './sentence-train.js';
import { LieDetector } from './lie-detector.js';
import { TeakettleDetective } from './teakettle-detective.js';
import { Cryptogram } from './cryptogram.js';
import { WordBalance } from './word-balance.js';
import { MemoryChain } from './memory-chain.js';
import { AbcBubbles } from './abc-bubbles.js';
import { SyllableDj } from './syllable-dj.js';
import { HiddenObject } from './hidden-object.js';
import { AdjectivePainter } from './adjective-painter.js';
import { DifferenceDetective } from './difference-detective.js';
import { WordSearchSwipe } from './word-search-swipe.js';
import { RhymeMemory } from './rhyme-memory.js';
import { AnagramBlast } from './anagram-blast.js';
import { GenderSort } from './gender-sort.js';
import { PluralMatch } from './plural-match.js';
import { MissingLetter } from './missing-letter.js';
import { SpeedFlash } from './speed-flash.js';
import { WordChain } from './word-chain.js';
import { SynonymSnap } from './synonym-snap.js';
import { VerbPulse } from './verb-pulse.js';
import { PrepositionWorld } from './preposition-world.js';
import { CommaKing } from './comma-king.js';
import { CategoryBlitz } from './category-blitz.js';
import { StoryBuilder } from './story-builder.js';
import { EmojiTranslator } from './emoji-translator.js';
import { CategorySort } from './category-sort.js';
import { WordClock } from './word-clock.js';
import { HotCold } from './hot-cold.js';
import { WordLabyrinth } from './word-labyrinth.js';
import { OppositeRacer } from './opposite-racer.js';
import { NumberWords } from './number-words.js';
import { SentenceSense } from './sentence-sense.js';
import { WhackANoun } from './whack-a-noun.js';
import { DefinitionMatch } from './definition-match.js';
import { CompoundChain } from './compound-chain.js';
import { ImageWordMatch } from './image-word-match.js';
import { BubbleBurst } from './bubble-burst.js';
import { WordFamilyTree } from './word-family-tree.js';
import { SyllableStomp } from './syllable-stomp.js';
import { TenseSwitcher } from './tense-switcher.js';
import { WordAvalanche } from './word-avalanche.js';
import { QuestionWordMatch } from './question-word-match.js';
import { ColorWords } from './color-words.js';
import { PasswordCrack } from './password-crack.js';
import { LetterDrop } from './letter-drop.js';
import { CapitalDetective } from './capital-detective.js';
import { AdjectiveEndings } from './adjective-endings.js';
import { GermanIdiom } from './german-idiom.js';
import { BlitzQuiz } from './blitz-quiz.js';
import { AlphabetSort } from './alphabet-sort.js';
import { ModalVerb } from './modal-verb.js';
import { FillThePoem } from './fill-the-poem.js';
import { WordStar } from './word-star.js';
import { VerbForms } from './verb-forms.js';
import { SplitTheWord } from './split-the-word.js';
import { PrefixPostfix } from './prefix-postfix.js';
import { ReadingRace } from './reading-race.js';
import { DoubleLetter } from './double-letter.js';
import { CompoundMeaning } from './compound-meaning.js';
import { ComicStrip } from './comic-strip.js';
import { MirrorWord } from './mirror-word.js';
import { WordChess } from './word-chess.js';
import { SlingshotSpelling } from './slingshot-spelling.js';
import { GravitySort } from './gravity-sort.js';
import { WordStacker } from './word-stacker.js';
import { CaseSolver } from './case-solver.js';
import { SecretAgentCode } from './secret-agent-code.js';
import { LogicLadder } from './logic-ladder.js';
import { MadLibsDE } from './mad-libs-de.js';
import { SentenceScramble } from './sentence-scramble.js';
import { RhymeRider } from './rhyme-rider.js';
import { TapTheType } from './tap-the-type.js';
import { WordMatchFast } from './word-match-fast.js';
import { VowelVacuum } from './vowel-vacuum.js';
import { SynonymBridge } from './synonym-bridge.js';
import { AntonymArch } from './antonym-arch.js';
import { GenderGym } from './gender-gym.js';
import { WordDetective } from './word-detective.js';
import { SentenceSniper } from './sentence-sniper.js';
import { ArticleAce } from './article-ace.js';
import { GrammarGhost } from './grammar-ghost.js';
import { IdiomIsland } from './idiom-island.js';
import { ProverbPath } from './proverb-path.js';
import { PrefixPower } from './prefix-power.js';
import { SuffixSun } from './suffix-sun.js';
import { TenseTornado } from './tense-tornado.js';
import { WordPuzzle3x3 } from './word-puzzle-3x3.js';
import { LetterBounce } from './letter-bounce.js';
import { WordFishing } from './word-fishing.js';
import { SentenceBridge } from './sentence-bridge.js';
import { CategoryCannon } from './category-cannon.js';
import { SpellingBeeDE } from './spelling-bee-de.js';
import { WordPyramid } from './word-pyramid.js';
import { CrosswordMini } from './crossword-mini.js';
import { WordBalloon } from './word-balloon.js';
import { GrammarMaze } from './grammar-maze.js';
import { DetectiveAdventure } from './detective-adventure.js';
import { GrammarRPG } from './grammar-rpg.js';
import { KitchenChaos } from './kitchen-chaos.js';
import { SentenceArchitect } from './sentence-architect.js';
import { WordAlchemy } from './word-alchemy.js';
import { SentenceSymphony } from './sentence-symphony.js';
import { TimeTraveler } from './time-traveler.js';
import { DialogueDuel } from './dialogue-duel.js';
import { MysteryBox } from './mystery-box.js';
import { SentenceStacker } from './sentence-stacker.js';
import { SyllableFishing } from './syllable-fishing.js';
import { ScrapHunt } from './scrap-hunt.js';

const MINIGAMES = {
  'word-type-sort': WordTypeSort,
  'article-choice': ArticleChoice,
  'sentence-order': SentenceOrder,
  'fill-blanks': FillBlanks,
  'spelling-detective': SpellingDetective,
  'case-choice': CaseChoice,
  'noun-hunter': NounHunter,
  'rhyme-match': RhymeMatch,
  'image-puzzle': ImagePuzzle,
  'syllable-counter': SyllableCounter,
  'time-machine': TimeMachine,
  'punctuation-catcher': PunctuationCatcher,
  'compound-builder': CompoundBuilder,
  'word-ninja': WordNinja,
  'word-meteorites': WordMeteorites,
  'article-cannon': ArticleCannon,
  'sentence-train': SentenceTrain,
  'lie-detector': LieDetector,
  'teakettle-detective': TeakettleDetective,
  'cryptogram': Cryptogram,
  'word-balance': WordBalance,
  'memory-chain': MemoryChain,
  'abc-bubbles': AbcBubbles,
  'syllable-dj': SyllableDj,
  'hidden-object': HiddenObject,
  'adjective-painter': AdjectivePainter,
  'difference-detective': DifferenceDetective,
  'word-search-swipe': WordSearchSwipe,
  'rhyme-memory': RhymeMemory,
  'anagram-blast': AnagramBlast,
  'gender-sort': GenderSort,
  'plural-match': PluralMatch,
  'missing-letter': MissingLetter,
  'speed-flash': SpeedFlash,
  'word-chain': WordChain,
  'synonym-snap': SynonymSnap,
  'verb-pulse': VerbPulse,
  'preposition-world': PrepositionWorld,
  'comma-king': CommaKing,
  'category-blitz': CategoryBlitz,
  'story-builder': StoryBuilder,
  'emoji-translator': EmojiTranslator,
  'category-sort': CategorySort,
  'word-clock': WordClock,
  'hot-cold': HotCold,
  'word-labyrinth': WordLabyrinth,
  'opposite-racer': OppositeRacer,
  'number-words': NumberWords,
  'sentence-sense': SentenceSense,
  'whack-a-noun': WhackANoun,
  'definition-match': DefinitionMatch,
  'compound-chain': CompoundChain,
  'image-word-match': ImageWordMatch,
  'bubble-burst': BubbleBurst,
  'word-family-tree': WordFamilyTree,
  'syllable-stomp': SyllableStomp,
  'tense-switcher': TenseSwitcher,
  'word-avalanche': WordAvalanche,
  'question-word-match': QuestionWordMatch,
  'color-words': ColorWords,
  'password-crack': PasswordCrack,
  'letter-drop': LetterDrop,
  'capital-detective': CapitalDetective,
  'adjective-endings': AdjectiveEndings,
  'german-idiom': GermanIdiom,
  'blitz-quiz': BlitzQuiz,
  'alphabet-sort': AlphabetSort,
  'modal-verb': ModalVerb,
  'fill-the-poem': FillThePoem,
  'word-star': WordStar,
  'verb-forms': VerbForms,
  'split-the-word': SplitTheWord,
  'prefix-postfix': PrefixPostfix,
  'reading-race': ReadingRace,
  'double-letter': DoubleLetter,
  'compound-meaning': CompoundMeaning,
  'comic-strip': ComicStrip,
  'mirror-word': MirrorWord,
  'word-chess': WordChess,
  'slingshot-spelling': SlingshotSpelling,
  'gravity-sort': GravitySort,
  'word-stacker': WordStacker,
  'case-solver': CaseSolver,
  'secret-agent-code': SecretAgentCode,
  'logic-ladder': LogicLadder,
  'mad-libs-de': MadLibsDE,
  'sentence-scramble': SentenceScramble,
  'rhyme-rider': RhymeRider,
  'tap-the-type': TapTheType,
  'word-match-fast': WordMatchFast,
  'vowel-vacuum': VowelVacuum,
  'synonym-bridge': SynonymBridge,
  'antonym-arch': AntonymArch,
  'gender-gym': GenderGym,
  'word-detective': WordDetective,
  'sentence-sniper': SentenceSniper,
  'article-ace': ArticleAce,
  'grammar-ghost': GrammarGhost,
  'idiom-island': IdiomIsland,
  'proverb-path': ProverbPath,
  'prefix-power': PrefixPower,
  'suffix-sun': SuffixSun,
  'tense-tornado': TenseTornado,
  'word-puzzle-3x3': WordPuzzle3x3,
  'letter-bounce': LetterBounce,
  'word-fishing': WordFishing,
  'sentence-bridge': SentenceBridge,
  'category-cannon': CategoryCannon,
  'spelling-bee-de': SpellingBeeDE,
  'word-pyramid': WordPyramid,
  'crossword-mini': CrosswordMini,
  'word-balloon': WordBalloon,
  'grammar-maze': GrammarMaze,
  'detective-adventure': DetectiveAdventure,
  'grammar-rpg': GrammarRPG,
  'kitchen-chaos': KitchenChaos,
  'sentence-architect': SentenceArchitect,
  'word-alchemy': WordAlchemy,
  'sentence-symphony': SentenceSymphony,
  'time-traveler': TimeTraveler,
  'dialogue-duel': DialogueDuel,
  'mystery-box': MysteryBox,
  'sentence-stacker': SentenceStacker,
  'syllable-fishing': SyllableFishing,
  'scrap-hunt': ScrapHunt,
};

/**
 * Get a mini-game by ID
 */
export function getMinigame(id) {
  return MINIGAMES[id] || null;
}

/**
 * Get all mini-game entries
 */
export function getAllMinigames() {
  return Object.values(MINIGAMES);
}
