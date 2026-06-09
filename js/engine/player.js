/**
 * Player - Player state management
 * 
 * Uses hand-drawn illustrated animal characters instead of emojis.
 */

import { CHARACTERS, getCharacter, renderCharacterAvatar, renderCharacterToken } from '../ui/characters.js?v=field-route-fullscreen-31';

const PLAYER_COLORS = [
  'var(--player-1)', 'var(--player-2)', 'var(--player-3)',
  'var(--player-4)', 'var(--player-5)', 'var(--player-6)'
];

export class Player {
  constructor(id, name, colorIndex) {
    this.id = id;
    this.name = name || `Spieler ${id + 1}`;
    this.colorIndex = colorIndex ?? id;
    
    const char = getCharacter(this.colorIndex);
    this.avatarId = char.id;
    this.avatarName = char.name_de;
    this.avatarColor = char.color;
    this.color = PLAYER_COLORS[this.colorIndex % PLAYER_COLORS.length];
    
    // Position
    this.position = 0;
    this.finished = false;
    this.finishOrder = -1;
    this.extraTurns = 0;
    
    // Inventory
    this.coins = 0;
    this.stars = 0;
    this.badges = [];
    this.jokers = {
      hint: 0,
      protection: 0,
      extraRoll: 0
    };
    
    // Stats
    this.stats = {
      tasksAttempted: 0,
      tasksCorrect: 0,
      totalScore: 0,
      challengeWins: 0,
      teamTasks: 0
    };
  }

  /**
   * Get avatar HTML - uses illustrated PNG when available
   */
  getAvatarHTML(size = 48) {
    return renderCharacterAvatar(this.colorIndex, size);
  }

  /**
   * Get small token HTML for scoreboard
   */
  getTokenHTML(size = 32) {
    return renderCharacterToken(this.colorIndex, size);
  }

  moveTo(position) { this.position = position; }
  addCoins(amount) { this.coins += amount; }
  addStars(amount) { this.stars += amount; }

  addBadge(badge) {
    if (!this.badges.includes(badge)) this.badges.push(badge);
  }

  addJoker(type) {
    if (this.jokers[type] !== undefined) this.jokers[type]++;
  }

  useJoker(type) {
    if (this.jokers[type] > 0) { this.jokers[type]--; return true; }
    return false;
  }

  recordTask(correct, score = 0) {
    this.stats.tasksAttempted++;
    if (correct) this.stats.tasksCorrect++;
    this.stats.totalScore += score;
  }

  getAccuracy() {
    if (this.stats.tasksAttempted === 0) return 0;
    return Math.round((this.stats.tasksCorrect / this.stats.tasksAttempted) * 100);
  }

  getTotalPoints() {
    return this.coins + (this.stars * 10) + this.stats.totalScore;
  }

  static fromJSON(data = {}) {
    const player = new Player(
      Number.isFinite(data.id) ? data.id : 0,
      data.name,
      Number.isFinite(data.colorIndex) ? data.colorIndex : data.id
    );

    player.avatarId = data.avatarId || player.avatarId;
    player.avatarName = data.avatarName || player.avatarName;
    player.avatarColor = data.avatarColor || player.avatarColor;
    player.position = Number.isFinite(data.position) ? data.position : 0;
    player.finished = Boolean(data.finished);
    player.finishOrder = Number.isFinite(data.finishOrder) ? data.finishOrder : -1;
    player.extraTurns = Number.isFinite(data.extraTurns) ? data.extraTurns : 0;
    player.coins = Number.isFinite(data.coins) ? data.coins : 0;
    player.stars = Number.isFinite(data.stars) ? data.stars : 0;
    player.badges = Array.isArray(data.badges) ? [...data.badges] : [];
    player.jokers = {
      hint: 0,
      protection: 0,
      extraRoll: 0,
      ...(data.jokers || {})
    };
    player.stats = {
      tasksAttempted: 0,
      tasksCorrect: 0,
      totalScore: 0,
      challengeWins: 0,
      teamTasks: 0,
      ...(data.stats || {})
    };

    return player;
  }

  toJSON() {
    return {
      id: this.id, name: this.name, colorIndex: this.colorIndex,
      avatarId: this.avatarId, avatarName: this.avatarName, avatarColor: this.avatarColor,
      position: this.position,
      finished: this.finished, finishOrder: this.finishOrder,
      extraTurns: this.extraTurns,
      coins: this.coins, stars: this.stars,
      badges: [...this.badges], jokers: { ...this.jokers },
      stats: { ...this.stats }
    };
  }
}

export { CHARACTERS, PLAYER_COLORS };
