/**
 * SettingsManager - Handles game settings, persistence, and difficulty configuration.
 */

import { getDefaultDifficulty } from '../learning/difficulty.js';
import { getTopicsForLevel } from '../learning/topic-registry.js';

const DEFAULT_CLASS_LEVEL = 'klasse2';
const DEFAULT_TOPICS = ['nomen', 'verben', 'adjektive', 'satzbau'];

const CLASS_LEVEL_BY_NUMBER = {
  0: 'vorschule',
  1: 'klasse1',
  2: 'klasse2',
  3: 'klasse3',
  4: 'klasse4'
};

const CLASS_LEVEL_ORDER = {
  vorschule: 0,
  klasse1: 1,
  klasse2: 2,
  klasse3: 3,
  klasse4: 4,
  frei: 99
};

const LEVEL_DIFFICULTY_PRESETS = {
  vorschule: {
    languageComplexity: 1,
    sentenceLength: 1,
    timePressure: 0,
    hintAmount: 5,
    answerOptions: 2,
    errorDensity: 1,
    inputMode: 0
  },
  klasse1: {
    languageComplexity: 2,
    sentenceLength: 1,
    timePressure: 1,
    hintAmount: 4,
    answerOptions: 3,
    errorDensity: 1,
    inputMode: 0
  },
  klasse2: {
    languageComplexity: 2,
    sentenceLength: 2,
    timePressure: 1,
    hintAmount: 3,
    answerOptions: 3,
    errorDensity: 2,
    inputMode: 0
  },
  klasse3: {
    languageComplexity: 3,
    sentenceLength: 3,
    timePressure: 2,
    hintAmount: 2,
    answerOptions: 4,
    errorDensity: 3,
    inputMode: 0
  },
  klasse4: {
    languageComplexity: 4,
    sentenceLength: 4,
    timePressure: 3,
    hintAmount: 1,
    answerOptions: 4,
    errorDensity: 4,
    inputMode: 1
  },
  frei: {}
};

function normalizeClassLevel(level) {
  if (typeof level === 'number') {
    return CLASS_LEVEL_BY_NUMBER[level] || DEFAULT_CLASS_LEVEL;
  }

  if (typeof level === 'string') {
    const trimmed = level.trim();
    if (trimmed in CLASS_LEVEL_ORDER) {
      return trimmed;
    }

    const numeric = Number.parseInt(trimmed, 10);
    if (Number.isFinite(numeric)) {
      return CLASS_LEVEL_BY_NUMBER[numeric] || DEFAULT_CLASS_LEVEL;
    }
  }

  return DEFAULT_CLASS_LEVEL;
}

function getDefaultTopicsForLevel(level) {
  const availableTopics = getTopicsForLevel(level).map((topic) => topic.id);
  const preferredTopics = DEFAULT_TOPICS.filter((topicId) => availableTopics.includes(topicId));
  return preferredTopics.length > 0 ? preferredTopics : availableTopics.slice(0, Math.min(6, availableTopics.length));
}

export class SettingsManager {
  constructor() {
    this.reset();
  }

  /**
   * Reset settings to default values.
   */
  reset() {
    this.language = 'de';
    this.classLevel = DEFAULT_CLASS_LEVEL;
    this.activeTopics = getDefaultTopicsForLevel(this.classLevel);
    this.difficulty = {
      ...getDefaultDifficulty(),
      ...LEVEL_DIFFICULTY_PRESETS[this.classLevel]
    };
    this.gameMode = 'local';
    this.presetId = null;
    this.profileName = null;
    this.selectedBoardId = 'wortgarten';
    this.selectedBoardUrl = null;
    this.version = '3.2.0';
  }

  /**
   * Set class level and keep topics/difficulty in sync with it.
   */
  setClassLevel(level) {
    this.classLevel = normalizeClassLevel(level);
    this.difficulty = {
      ...this.difficulty,
      ...LEVEL_DIFFICULTY_PRESETS[this.classLevel]
    };
    this._syncTopicsToClassLevel();
  }

  /**
   * Set one difficulty axis directly from the setup UI.
   */
  setDifficultyAxis(axis, value) {
    const parsedValue = Number.parseInt(value, 10);
    if (!Number.isFinite(parsedValue)) {
      return;
    }

    this.difficulty[axis] = parsedValue;
  }

  /**
   * Set the active game mode.
   */
  setGameMode(mode) {
    this.gameMode = mode || 'local';
  }

  /**
   * Toggle topic active state.
   */
  toggleTopic(topicId) {
    const idx = this.activeTopics.indexOf(topicId);
    if (idx === -1) {
      this.activeTopics.push(topicId);
    } else {
      this.activeTopics.splice(idx, 1);
    }

    this._syncTopicsToClassLevel(false);
  }

  /**
   * Disable every topic. Validation in the setup prevents starting like this.
   */
  disableAllTopics() {
    this.activeTopics = [];
  }

  /**
   * Check if topic is active.
   */
  isTopicActive(topicId) {
    return this.activeTopics.includes(topicId);
  }

  /**
   * Get filtered word list based on active topics and level.
   */
  getWordList(words) {
    const activeLevelRank = CLASS_LEVEL_ORDER[this.classLevel] ?? CLASS_LEVEL_ORDER[DEFAULT_CLASS_LEVEL];

    return words.filter((word) => {
      if (!this.isTopicActive(word.topic)) {
        return false;
      }

      if (!word.level || this.classLevel === 'frei') {
        return true;
      }

      const wordLevel = normalizeClassLevel(word.level);
      return (CLASS_LEVEL_ORDER[wordLevel] ?? activeLevelRank) <= activeLevelRank;
    });
  }

  /**
   * Get snapshot for persistence or passing to other components.
   */
  getSnapshot() {
    return {
      language: this.language,
      classLevel: this.classLevel,
      activeTopics: [...this.activeTopics],
      difficulty: { ...this.difficulty },
      gameMode: this.gameMode,
      presetId: this.presetId,
      profileName: this.profileName,
      selectedBoardId: this.selectedBoardId,
      selectedBoardUrl: this.selectedBoardUrl,
      version: this.version
    };
  }

  /**
   * Load from snapshot.
   */
  loadSnapshot(snapshot) {
    if (!snapshot) {
      return;
    }

    this.language = snapshot.language || 'de';
    this.classLevel = normalizeClassLevel(snapshot.classLevel);
    this.activeTopics = Array.isArray(snapshot.activeTopics) ? [...snapshot.activeTopics] : [];
    this.difficulty = {
      ...getDefaultDifficulty(),
      ...LEVEL_DIFFICULTY_PRESETS[this.classLevel],
      ...(snapshot.difficulty || {})
    };
    this.gameMode = snapshot.gameMode || 'local';
    this.presetId = snapshot.presetId || null;
    this.profileName = snapshot.profileName || null;
    this.selectedBoardId = snapshot.selectedBoardId || 'wortgarten';
    this.selectedBoardUrl = snapshot.selectedBoardUrl || null;
    this._syncTopicsToClassLevel();
  }

  _syncTopicsToClassLevel(useDefaultsIfEmpty = true) {
    const availableTopics = new Set(getTopicsForLevel(this.classLevel).map((topic) => topic.id));

    if (this.classLevel !== 'frei') {
      this.activeTopics = this.activeTopics.filter((topicId) => availableTopics.has(topicId));
    }

    if (this.activeTopics.length === 0 && useDefaultsIfEmpty) {
      this.activeTopics = getDefaultTopicsForLevel(this.classLevel);
    }
  }
}

// Global instance
export const settings = new SettingsManager();
