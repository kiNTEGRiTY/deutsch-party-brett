/**
 * Turn Manager - Manages turn phases and game flow
 * 
 * Turn phases: IDLE -> ROLLING -> MOVING -> LANDED -> RESOLVING -> COMPLETE
 */

export const TurnPhase = {
  IDLE: 'idle',           // Waiting for dice roll
  ROLLING: 'rolling',     // Dice is being rolled
  MOVING: 'moving',       // Token is animating along path
  LANDED: 'landed',       // Token has landed, showing field info
  RESOLVING: 'resolving', // Mini-game or event in progress
  COMPLETE: 'complete'    // Turn is done, ready for next player
};

export class TurnManager {
  constructor() {
    this.currentPlayerIndex = 0;
    this.totalPlayers = 0;
    this.round = 1;
    this.phase = TurnPhase.IDLE;
    this.turnLog = [];
  }

  /**
   * Initialize turn manager with player count
   */
  init(playerCount) {
    this.totalPlayers = playerCount;
    this.currentPlayerIndex = 0;
    this.round = 1;
    this.phase = TurnPhase.IDLE;
    this.turnLog = [];
  }

  /**
   * Set the current phase
   */
  setPhase(phase) {
    this.phase = phase;
    window.dispatchEvent(new CustomEvent('turn:phaseChange', {
      detail: { phase, playerIndex: this.currentPlayerIndex, round: this.round }
    }));
  }

  /**
   * Advance to next player (and potentially next round)
   */
  nextTurn() {
    this.currentPlayerIndex++;
    if (this.currentPlayerIndex >= this.totalPlayers) {
      this.currentPlayerIndex = 0;
      this.round++;
      window.dispatchEvent(new CustomEvent('turn:newRound', {
        detail: { round: this.round }
      }));
    }
    this.phase = TurnPhase.IDLE;
    window.dispatchEvent(new CustomEvent('turn:next', {
      detail: { playerIndex: this.currentPlayerIndex, round: this.round }
    }));
  }

  /**
   * Skip finished players and find the next active one
   */
  nextActiveTurn(players) {
    let attempts = 0;
    do {
      this.currentPlayerIndex++;
      if (this.currentPlayerIndex >= this.totalPlayers) {
        this.currentPlayerIndex = 0;
        this.round++;
      }
      attempts++;
      if (attempts > this.totalPlayers) {
        // All players finished
        return false;
      }
    } while (players[this.currentPlayerIndex].finished);

    this.phase = TurnPhase.IDLE;
    window.dispatchEvent(new CustomEvent('turn:next', {
      detail: { playerIndex: this.currentPlayerIndex, round: this.round }
    }));
    return true;
  }

  /**
   * Get current player index
   */
  getCurrentPlayerIndex() {
    return this.currentPlayerIndex;
  }

  /**
   * Get current round
   */
  getRound() {
    return this.round;
  }

  /**
   * Log a turn event
   */
  log(event) {
    this.turnLog.push({
      round: this.round,
      player: this.currentPlayerIndex,
      phase: this.phase,
      time: Date.now(),
      ...event
    });
  }

  /**
   * Check if game should end (max rounds)
   */
  shouldEndGame(maxRounds = 50) {
    return this.round > maxRounds;
  }
}
