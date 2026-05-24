const STORAGE_KEY = 'dpb_active_game';

export class GameSessionStorage {
  static save(gameSnapshot) {
    if (!gameSnapshot) {
      return false;
    }

    try {
      const payload = {
        version: 1,
        savedAt: new Date().toISOString(),
        game: gameSnapshot
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.warn('Active game could not be saved:', error);
      return false;
    }
  }

  static load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      return parsed?.game || null;
    } catch (error) {
      console.warn('Active game could not be loaded:', error);
      return null;
    }
  }

  static hasSavedGame() {
    return Boolean(GameSessionStorage.load());
  }

  static clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.warn('Active game could not be cleared:', error);
      return false;
    }
  }
}
