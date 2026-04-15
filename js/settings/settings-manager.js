/**
 * Settings Manager - Central configuration controller
 * 
 * Manages: language, class level, topics, difficulty axes, game mode, profiles
 */

import { TOPICS, getTopicsForLevel } from '../learning/topic-registry.js';
import { getDefaultDifficulty, AXIS_META } from '../learning/difficulty.js';
import { PRESETS } from './presets.js';

export class SettingsManager {
  constructor() {
    this.reset();
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.language = 'de';
    this.classLevel = 'klasse2';
    this.activeTopics = TOPICS.map(t => t.id); // All on by default
    this.difficulty = getDefaultDifficulty();
    this.gameMode = 'local';
    this.presetId = null;
    this.profileName = null;
  }

  /**
   * Set class level and filter topics accordingly
   */
  setClassLevel(level) {
    this.classLevel = level;
    // Auto-enable topics for this level
    const available = getTopicsForLevel(level);
    this.activeTopics = available.map(t => t.id);
  }

  /**
   * Toggle a topic on/off
   */
  toggleTopic(topicId) {
    const idx = this.activeTopics.indexOf(topicId);
    if (idx === -1) {
      this.activeTopics.push(topicId);
    } else {
      this.activeTopics.splice(idx, 1);
    }
  }

  /**
   * Check if topic is active
   */
  isTopicActive(topicId) {
    return this.activeTopics.includes(topicId);
  }

  /**
   * Enable all topics
   */
  enableAllTopics() {
    this.activeTopics = TOPICS.map(t => t.id);
  }

  /**
   * Disable all topics
   */
  disableAllTopics() {
    this.activeTopics = [];
  }

  /**
   * Set a difficulty axis
   */
  setDifficultyAxis(axis, value) {
    if (AXIS_META[axis]) {
      this.difficulty[axis] = Math.max(AXIS_META[axis].min, Math.min(AXIS_META[axis].max, value));
    }
  }

  /**
   * Apply a preset
   */
  applyPreset(presetId) {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    this.presetId = presetId;
    
    if (preset.classLevel) this.classLevel = preset.classLevel;
    if (preset.topics) this.activeTopics = [...preset.topics];
    if (preset.difficulty) {
      this.difficulty = { ...getDefaultDifficulty(), ...preset.difficulty };
    }
    if (preset.gameMode) this.gameMode = preset.gameMode;
  }

  /**
   * Set game mode
   */
  setGameMode(mode) {
    this.gameMode = mode;
  }

  /**
   * Get current settings snapshot
   */
  getSnapshot() {
    return {
      language: this.language,
      classLevel: this.classLevel,
      activeTopics: [...this.activeTopics],
      difficulty: { ...this.difficulty },
      gameMode: this.gameMode,
      presetId: this.presetId,
      profileName: this.profileName
    };
  }

  /**
   * Load from snapshot
   */
  loadSnapshot(snapshot) {
    this.language = snapshot.language || 'de';
    this.classLevel = snapshot.classLevel || 'klasse2';
    this.activeTopics = snapshot.activeTopics || TOPICS.map(t => t.id);
    this.difficulty = snapshot.difficulty || getDefaultDifficulty();
    this.gameMode = snapshot.gameMode || 'local';
    this.presetId = snapshot.presetId || null;
    this.profileName = snapshot.profileName || null;
  }
}
