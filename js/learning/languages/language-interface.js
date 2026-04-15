/**
 * Language Interface - Abstract contract for language modules
 * 
 * FUTURE LANGUAGE SUPPORT:
 * To add a new language (e.g., English), create a new module at:
 *   js/learning/languages/en/index.js
 * 
 * That module must implement this interface:
 * - getContent(topic, difficulty) -> content items for tasks
 * - getInstructions(miniGameType) -> localized game instructions
 * - getUIStrings() -> all UI text labels
 * - getLanguageId() -> 'en'
 * - getLanguageName() -> 'English'
 */

export const LanguageInterface = {
  /**
   * Get content items for a specific topic and difficulty
   * @param {string} topic - Topic ID from topic-registry
   * @param {object} difficulty - Difficulty axes values
   * @returns {Array} Content items appropriate for the topic
   */
  getContent: (topic, difficulty) => { throw new Error('Not implemented'); },

  /**
   * Get localized instructions for a mini-game
   * @param {string} miniGameType - Mini-game ID
   * @returns {string} Instruction text in the target language
   */
  getInstructions: (miniGameType) => { throw new Error('Not implemented'); },

  /**
   * Get all UI strings for the application
   * @returns {object} Key-value pairs of UI text
   */
  getUIStrings: () => { throw new Error('Not implemented'); },

  /**
   * Get language identifier
   * @returns {string} ISO language code
   */
  getLanguageId: () => { throw new Error('Not implemented'); },

  /**
   * Get human-readable language name
   * @returns {string}
   */
  getLanguageName: () => { throw new Error('Not implemented'); }
};

/**
 * Validate that a language module implements the interface
 */
export function validateLanguageModule(module) {
  const required = ['getContent', 'getInstructions', 'getUIStrings', 'getLanguageId', 'getLanguageName'];
  const missing = required.filter(fn => typeof module[fn] !== 'function');
  
  if (missing.length > 0) {
    throw new Error(`Language module missing methods: ${missing.join(', ')}`);
  }
  return true;
}
