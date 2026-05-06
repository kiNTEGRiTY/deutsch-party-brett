/**
 * Game Controller - Central game orchestrator
 * 
 * Manages the full game loop:
 * Setup -> Board Play -> Mini-Games -> Rewards -> End
 */

import { Board } from './board.js';
import { Dice } from './dice.js';
import { Player } from './player.js';
import { TurnManager, TurnPhase } from './turn.js';
import { FieldType, getFieldMeta } from './field-types.js';
import { grantReward, distributeChallengeRewards, getRandomSurprise, getMovementEffect } from './rewards.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class GameController {
  constructor() {
    this.board = null;
    this.dice = null;
    this.turnManager = null;
    this.players = [];
    this.settings = null;
    this.gameMode = 'local';  // single, local, classroom, party, team
    this.state = 'idle'; // idle, playing, paused, finished
    this.finishCount = 0;
    
    // Callbacks for UI updates
    this.onStateChange = null;
    this.onPlayerMove = null;
    this.onFieldLanded = null;
    this.onMinigameStart = null;
    this.onMinigameEnd = null;
    this.onReward = null;
    this.onGameEnd = null;
    this.onTurnChange = null;
  }

  /**
   * Initialize a new game
   */
  initGame(playerConfigs, settings) {
    this.board = new Board(true, settings.selectedBoardId || 'default');
    this.dice = new Dice();
    this.turnManager = new TurnManager();
    this.settings = settings;
    this.gameMode = settings.gameMode || (playerConfigs.length === 1 ? 'single' : 'local');
    this.state = 'playing';
    this.finishCount = 0;
    
    // Create players
    this.players = playerConfigs.map((config, i) => {
      return new Player(i, config.name, config.colorIndex);
    });
    
    this.turnManager.init(this.players.length);
    
    this._emit('stateChange', { state: 'playing' });
    this._emit('turnChange', { 
      playerIndex: 0, 
      player: this.players[0], 
      round: 1,
      phase: TurnPhase.IDLE
    });
  }

  /**
   * Get current player
   */
  getCurrentPlayer() {
    return this.players[this.turnManager.getCurrentPlayerIndex()];
  }

  /**
   * Get all players
   */
  getPlayers() {
    return this.players;
  }

  /**
   * Roll dice for current player
   */
  async rollDice() {
    if (this.state !== 'playing') return;
    if (this.turnManager.phase !== TurnPhase.IDLE) return;
    
    this.turnManager.setPhase(TurnPhase.ROLLING);
    const value = await this.dice.roll();
    
    this.turnManager.log({ event: 'roll', value });
    
    return value;
  }

  /**
   * Move current player by dice value
   */
  movePlayer(diceValue) {
    const player = this.getCurrentPlayer();
    const oldPos = player.position;
    const newPos = this.board.getDestination(oldPos, diceValue);
    
    this.turnManager.setPhase(TurnPhase.MOVING);
    player.moveTo(newPos);
    
    this._emit('playerMove', { player, oldPos, newPos, diceValue });
    this.turnManager.log({ event: 'move', from: oldPos, to: newPos });
    
    return newPos;
  }

  /**
   * Handle landing on a field
   */
  handleFieldLanding() {
    const player = this.getCurrentPlayer();
    const field = this.board.getField(player.position);
    const meta = getFieldMeta(field.type);
    
    this.turnManager.setPhase(TurnPhase.LANDED);
    this._emit('fieldLanded', { player, field, meta });
    
    return { field, meta };
  }

  /**
   * Resolve the field event
   */
  resolveField(field) {
    const player = this.getCurrentPlayer();
    if (player.position === 0) {
      this.completeTurn();
      return { action: 'safe_start' };
    }

    if (this.board.isFinish(player.position)) {
      return this._handleFinish(player);
    }

    if (Number.isFinite(field.portalPairId)) {
      return this._handlePortalField(player, field);
    }

    const meta = getFieldMeta(field.type);
    const fieldDifficulty = this._difficultyForField(field);
    
    this.turnManager.setPhase(TurnPhase.RESOLVING);

    switch (meta.handler) {
      case 'minigame_single':
        this._emit('minigameStart', { 
          mode: 'single', 
          player, 
          field,
          difficulty: fieldDifficulty
        });
        return { action: 'minigame', mode: 'single', difficulty: fieldDifficulty, field };

      case 'minigame_nomen':
        this._emit('minigameStart', { mode: 'single', player, field, topic: 'nomen', difficulty: fieldDifficulty });
        return { action: 'minigame', mode: 'single', topic: 'nomen', difficulty: fieldDifficulty, field };

      case 'minigame_verben':
        this._emit('minigameStart', { mode: 'single', player, field, topic: 'verben', difficulty: fieldDifficulty });
        return { action: 'minigame', mode: 'single', topic: 'verben', difficulty: fieldDifficulty, field };

      case 'minigame_adjektiv':
        this._emit('minigameStart', { mode: 'single', player, field, topic: 'adjektiv', difficulty: fieldDifficulty });
        return { action: 'minigame', mode: 'single', topic: 'adjektiv', difficulty: fieldDifficulty, field };

      case 'minigame_all':
        this._emit('minigameStart', { 
          mode: 'challenge', 
          players: this.players.filter(p => !p.finished),
          field 
        });
        return { action: 'minigame', mode: 'challenge' };

      case 'minigame_team':
        this._emit('minigameStart', { 
          mode: 'team', 
          players: this._getTeamPartners(player),
          field 
        });
        return { action: 'minigame', mode: 'team' };

      case 'reward':
        return this._handleRewardField(player, field);

      case 'surprise':
        return this._handleSurpriseField(player);

      case 'helper':
        return this._handleHelperField(player, field);

      case 'movement':
        return this._handleMovementField(player, field);

      case 'treasure':
        return this._handleTreasureField(player);

      case 'trap':
        return this._handleTrapField(player, field);

      case 'portal':
        return this._handlePortalField(player, field);

      case 'finish':
        return this._handleFinish(player);

      default:
        this.completeTurn();
        return { action: 'none' };
    }
  }

  /**
   * Handle mini-game completion
   */
  onMinigameComplete(results) {
    const player = this.getCurrentPlayer();
    
    if (results.mode === 'single') {
      if (results.correct) {
        const reward = grantReward(player, 'taskCorrect');
        player.recordTask(true, 3);
        this._emit('reward', { player, reward });
      } else if (results.partial) {
        const reward = grantReward(player, 'taskPartial');
        player.recordTask(false, 1);
        this._emit('reward', { player, reward });
      } else {
        grantReward(player, 'taskWrong');
        player.recordTask(false, 0);
      }
    } else if (results.mode === 'challenge') {
      // Distribute challenge rewards
      const rankings = results.rankings || [];
      const rewardResults = distributeChallengeRewards(rankings);
      for (const r of rankings) {
        r.player.recordTask(r.score > 0, r.score);
        r.player.stats.challengeWins += (rankings.indexOf(r) === 0 ? 1 : 0);
      }
      this._emit('reward', { challengeResults: rewardResults });
    } else if (results.mode === 'team') {
      // Team tasks: everyone in team gets reward
      const presetKey = results.correct ? 'teamSuccess' : 'teamPartial';
      const teamPlayers = results.players || [player];
      for (const p of teamPlayers) {
        grantReward(p, presetKey);
        p.recordTask(results.correct, results.correct ? 4 : 2);
        p.stats.teamTasks++;
      }
      this._emit('reward', { teamReward: presetKey, players: teamPlayers });
    }
    
    this.completeTurn();
  }

  /**
   * Complete the current turn and move to next player
   */
  completeTurn() {
    this.turnManager.setPhase(TurnPhase.COMPLETE);
    const currentPlayer = this.getCurrentPlayer();
    
    // Check if game should end
    if (this._checkGameEnd()) {
      this.endGame();
      return;
    }

    if (currentPlayer && currentPlayer.extraTurns > 0 && !currentPlayer.finished) {
      currentPlayer.extraTurns -= 1;
      this.turnManager.setPhase(TurnPhase.IDLE);
      this._emit('turnChange', {
        playerIndex: this.turnManager.getCurrentPlayerIndex(),
        player: currentPlayer,
        round: this.turnManager.getRound(),
        phase: TurnPhase.IDLE
      });
      return;
    }
    
    // Find next active player
    const hasNext = this.turnManager.nextActiveTurn(this.players);
    if (!hasNext) {
      this.endGame();
      return;
    }
    
    const nextPlayer = this.players[this.turnManager.getCurrentPlayerIndex()];
    this._emit('turnChange', {
      playerIndex: this.turnManager.getCurrentPlayerIndex(),
      player: nextPlayer,
      round: this.turnManager.getRound(),
      phase: TurnPhase.IDLE
    });
  }

  /**
   * End the game
   */
  endGame() {
    this.state = 'finished';
    
    // Sort players by total points
    const rankings = [...this.players].sort((a, b) => {
      // First by finish order (if finished), then by total points
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;
      if (a.finished && b.finished) return a.finishOrder - b.finishOrder;
      return b.getTotalPoints() - a.getTotalPoints();
    });
    
    this._emit('gameEnd', { rankings });
  }

  canResume() {
    return (
      this.state === 'playing' &&
      this.board &&
      this.turnManager &&
      this.players.length > 0 &&
      this.turnManager.phase === TurnPhase.IDLE
    );
  }

  getSnapshot() {
    if (!this.board || !this.turnManager || this.players.length === 0) {
      return null;
    }

    return {
      state: this.state,
      gameMode: this.gameMode,
      finishCount: this.finishCount,
      settings: { ...(this.settings || {}) },
      board: this.board.getSnapshot(),
      dice: {
        value: this.dice?.value ?? 1,
        rolling: false
      },
      turn: this.turnManager.getSnapshot(),
      players: this.players.map((player) => player.toJSON())
    };
  }

  restoreGame(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.players) || snapshot.players.length === 0) {
      return false;
    }

    const settings = snapshot.settings || {};
    this.board = new Board(false, snapshot.board?.imageId || settings.selectedBoardId || 'default');
    this.board.loadSnapshot(snapshot.board);

    this.dice = new Dice();
    this.dice.value = Number.isFinite(snapshot.dice?.value) ? snapshot.dice.value : 1;
    this.dice.rolling = false;

    this.players = snapshot.players.map((playerData) => Player.fromJSON(playerData));
    this.turnManager = new TurnManager();
    this.turnManager.loadSnapshot({
      ...(snapshot.turn || {}),
      totalPlayers: this.players.length,
      phase: TurnPhase.IDLE
    });

    if (this.players.length > 0) {
      this.turnManager.currentPlayerIndex = Math.max(
        0,
        Math.min(this.turnManager.currentPlayerIndex, this.players.length - 1)
      );
    }

    this.settings = settings;
    this.gameMode = snapshot.gameMode || settings.gameMode || (this.players.length === 1 ? 'single' : 'local');
    this.state = snapshot.state === 'finished' ? 'finished' : 'playing';
    this.finishCount = Number.isFinite(snapshot.finishCount)
      ? snapshot.finishCount
      : this.players.filter((player) => player.finished).length;

    this._emit('stateChange', { state: this.state });

    const playerIndex = this.turnManager.getCurrentPlayerIndex();
    const player = this.players[playerIndex] || this.players[0];
    if (player) {
      this._emit('turnChange', {
        playerIndex,
        player,
        round: this.turnManager.getRound(),
        phase: this.turnManager.phase
      });
    }

    return true;
  }

  // ── Private helpers ──

  _handleRewardField(player, field) {
    let reward;

    if (field?.rewardMode === 'extra_turn') {
      player.extraTurns += 1;
      reward = {
        description: 'Bonuszug! Du bist sofort noch einmal dran.',
        items: [{ type: 'extraTurn', amount: 1 }]
      };
    } else {
      reward = grantReward(player, 'rewardField');
    }

    this._emit('reward', { player, reward });
    this.completeTurn();
    return { action: 'reward', reward };
  }

  _handleSurpriseField(player) {
    const surpriseKey = getRandomSurprise();
    const reward = grantReward(player, surpriseKey);
    this._emit('reward', { player, reward, surprise: true });
    this.completeTurn();
    return { action: 'surprise', reward };
  }

  _handleHelperField(player, field) {
    let reward;

    if (field?.helperMode === 'protection') {
      player.addJoker('protection');
      reward = {
        description: 'Schutz aktiviert! Die naechste Falle kann geblockt werden.',
        items: [{ type: 'joker', subtype: 'protection', amount: 1 }]
      };
    } else if (field?.helperMode === 'example') {
      player.addJoker('hint');
      reward = {
        description: 'Beispielhilfe freigeschaltet. Du bekommst einen Tipp-Joker.',
        items: [{ type: 'joker', subtype: 'hint', amount: 1 }]
      };
    } else {
      reward = grantReward(player, 'helperField');
    }

    this._emit('reward', { player, reward });
    this.completeTurn();
    return { action: 'helper', reward };
  }

  _handleMovementField(player, field) {
    const effect = Number.isFinite(field?.move)
      ? {
          move: field.move,
          description: field.move > 0
            ? `${field.move} Felder vor!`
            : `${Math.abs(field.move)} Felder zurück.`
        }
      : getMovementEffect();
    const oldPos = player.position;
    const newPos = Math.max(0, Math.min(player.position + effect.move, this.board.totalFields - 1));
    
    // Check for protection joker
    if (effect.move < 0 && player.jokers.protection > 0) {
      player.useJoker('protection');
      this._emit('reward', { 
        player, 
        reward: { description: 'Schutz-Joker eingesetzt! Du bleibst stehen. 🛡️', items: [] }
      });
      this.completeTurn();
      return { action: 'movement', blocked: true };
    }
    
    player.moveTo(newPos);
    this._emit('playerMove', { player, oldPos, newPos, reason: effect.description });

    if (this.board.isFinish(newPos)) {
      return this._handleFinish(player);
    }

    this._emit('reward', { player, reward: { description: effect.description, items: [] }});
    this.completeTurn();
    return { action: 'movement', effect };
  }

  _handleTreasureField(player) {
    const reward = grantReward(player, 'treasureField');
    this._emit('reward', { player, reward });
    this.completeTurn();
    return { action: 'treasure', reward };
  }

  _handleFinish(player) {
    this.finishCount++;
    player.finished = true;
    player.finishOrder = this.finishCount;
    player.addStars(3); // Bonus for finishing
    player.addBadge('🏆 Ziel erreicht');
    
    this._emit('reward', { 
      player, 
      reward: { description: `${player.name} hat das Ziel erreicht! 🎉`, items: [
        { type: 'stars', amount: 3 }
      ]}
    });
    
    this.completeTurn();
    return { action: 'finish' };
  }

  _handleTrapField(player, field) {
    // Check for protection joker
    if (player.jokers.protection > 0) {
      player.useJoker('protection');
      this._emit('reward', { 
        player, 
        reward: { description: 'Schutz-Joker eingesetzt! Die Falle hat keine Wirkung. 🛡️', items: [] }
      });
      this.completeTurn();
      return { action: 'trap', blocked: true };
    }

    const reward = grantReward(player, 'trapField');
    const oldPos = player.position;
    const trapMove = Number.isFinite(field?.move) ? field.move : -3;
    const newPos = Math.max(0, player.position + trapMove);
    
    player.moveTo(newPos);
    this._emit('playerMove', {
      player,
      oldPos,
      newPos,
      reason: `In eine Falle getappt! ${Math.abs(trapMove)} Felder zurück.`
    });

    if (this.board.isFinish(newPos)) {
      return this._handleFinish(player);
    }

    this._emit('reward', { player, reward });
    
    this.completeTurn();
    return { action: 'trap', reward, move: trapMove };
  }

  _handlePortalField(player, field) {
    const targetId = Number.isFinite(field.portalPairId) ? field.portalPairId : field.targetId;
    if (!Number.isFinite(targetId)) {
      this.completeTurn();
      return { action: 'none' };
    }

    const reward = grantReward(player, 'portalField');
    const oldPos = player.position;
    const newPos = targetId;
    
    // Teleportation is instant, but we emit it so UI can animate
    player.moveTo(newPos);
    this._emit('playerMove', { player, oldPos, newPos, teleport: true, reason: 'Durch ein Portal gereist! 🌀' });

    if (this.board.isFinish(newPos)) {
      return this._handleFinish(player);
    }

    this._emit('reward', { player, reward });
    
    this.completeTurn();
    return { action: 'portal', targetId: newPos };
  }

  _getTeamPartners(player) {
    const activePlayers = this.players.filter(p => !p.finished && p.id !== player.id);
    if (activePlayers.length === 0) return [player];
    const partner = activePlayers[Math.floor(Math.random() * activePlayers.length)];
    return [player, partner];
  }

  _checkGameEnd() {
    const activePlayers = this.players.filter(p => !p.finished);
    if (activePlayers.length <= 1) return true;
    if (this.turnManager.shouldEndGame()) return true;
    return false;
  }

  _difficultyForField(field) {
    const base = this.settings?.difficulty || {};
    const level = clamp(Number(field?.difficultyLevel || 1), 1, 3);
    const boost = level - 1;

    return {
      ...base,
      languageComplexity: clamp(Number(base.languageComplexity ?? 2) + boost, 1, 5),
      sentenceLength: clamp(Number(base.sentenceLength ?? 2) + boost, 1, 5),
      timePressure: clamp(Number(base.timePressure ?? 1) + Math.max(0, boost - 1), 0, 5),
      hintAmount: clamp(Number(base.hintAmount ?? 3) - boost, 0, 5),
      answerOptions: clamp(Number(base.answerOptions ?? 3) + Math.min(boost, 1), 2, 5),
      errorDensity: clamp(Number(base.errorDensity ?? 2) + boost, 1, 5)
    };
  }

  _emit(event, data) {
    const callbackName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
    if (this[callbackName]) {
      this[callbackName](data);
    }
    window.dispatchEvent(new CustomEvent(`game:${event}`, { detail: data }));
  }
}
