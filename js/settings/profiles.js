/**
 * Profiles - Save/Load profiles via localStorage
 */

const STORAGE_KEY = 'dpb_profiles';

export class ProfileManager {
  /**
   * Get all saved profiles
   */
  static getAll() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save a profile
   */
  static save(name, settingsSnapshot) {
    const profiles = ProfileManager.getAll();
    const existing = profiles.findIndex(p => p.name === name);
    
    const profile = {
      name,
      settings: settingsSnapshot,
      savedAt: new Date().toISOString()
    };
    
    if (existing >= 0) {
      profiles[existing] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return profile;
  }

  /**
   * Load a profile by name
   */
  static load(name) {
    const profiles = ProfileManager.getAll();
    return profiles.find(p => p.name === name) || null;
  }

  /**
   * Delete a profile
   */
  static remove(name) {
    const profiles = ProfileManager.getAll();
    const filtered = profiles.filter(p => p.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Check if any profiles exist
   */
  static hasProfiles() {
    return ProfileManager.getAll().length > 0;
  }
}
