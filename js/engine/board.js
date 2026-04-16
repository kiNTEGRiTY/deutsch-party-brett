/**
 * Board - Defines the game board layout with 30 fields
 * 
 * The board is a winding snake-like path.
 * Each field has a type, position (for rendering), and connections.
 */

import { FieldType } from './field-types.js';
import { getBoardLayoutForImage } from './board-layouts.js';

export class Board {
  constructor(randomize = true, imageId = 'default') {
    const layout = getBoardLayoutForImage(imageId);
    this.fields = layout.map(f => ({ ...f, type: FieldType.NORMAL }));
    this.totalFields = this.fields.length;
    
    // Explicitly set Start and Finish fields
    this.fields[0].type = FieldType.START;
    this.fields[this.totalFields - 1].type = FieldType.FINISH;
    
    if (randomize) {
      this.randomizeLayout();
    }
  }

  /**
   * Randomize field types for all fields except Start and Finish
   */
  randomizeLayout() {
    // Definable pool of field types to distribute
    const pool = [
      FieldType.NOMEN, FieldType.NOMEN, FieldType.NOMEN, FieldType.NOMEN,
      FieldType.VERBEN, FieldType.VERBEN, FieldType.VERBEN, FieldType.VERBEN,
      FieldType.ADJEKTIV, FieldType.ADJEKTIV, FieldType.ADJEKTIV, FieldType.ADJEKTIV,
      FieldType.CHALLENGE, FieldType.CHALLENGE,
      FieldType.TEAM, FieldType.TEAM,
      FieldType.REWARD, FieldType.REWARD,
      FieldType.SURPRISE, FieldType.SURPRISE,
      FieldType.HELPER, FieldType.HELPER,
      FieldType.MOVEMENT,
      FieldType.TREASURE,
      FieldType.TRAP, FieldType.TRAP,
      FieldType.PORTAL, FieldType.PORTAL
    ];

    // Shuffle the pool
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

    // Apply to fields 1 through totalFields - 2 (keeping Start 0 and Finish index)
    for (let i = 1; i < this.totalFields - 1; i++) {
      if (shuffledPool.length > 0) {
        this.fields[i].type = shuffledPool.pop();
      }
    }

    this.linkPortals();
  }

  /**
   * Link Portal fields into pairs
   */
  linkPortals() {
    const portalIndices = [];
    this.fields.forEach((f, i) => {
      if (f.type === FieldType.PORTAL) portalIndices.push(i);
    });

    // Pair them up randomly
    const indices = [...portalIndices].sort(() => Math.random() - 0.5);
    while (indices.length >= 2) {
      const a = indices.pop();
      const b = indices.pop();
      this.fields[a].targetId = b;
      this.fields[b].targetId = a;
    }

    // If odd number of portals, the last one becomes a Surprise field
    if (indices.length === 1) {
      this.fields[indices[0]].type = FieldType.SURPRISE;
    }
  }

  /**
   * Get field at a given index
   */
  getField(index) {
    if (index < 0) return this.fields[0];
    if (index >= this.totalFields) return this.fields[this.totalFields - 1];
    return this.fields[index];
  }

  /**
   * Get all fields
   */
  getAllFields() {
    return this.fields;
  }

  /**
   * Calculate destination after dice roll, capping at finish
   */
  getDestination(currentPos, diceValue) {
    const dest = currentPos + diceValue;
    return Math.min(dest, this.totalFields - 1);
  }

  /**
   * Check if position is the finish
   */
  isFinish(position) {
    return position >= this.totalFields - 1;
  }

  /**
   * Get field type distribution stats (for debugging)
   */
  getStats() {
    const stats = {};
    for (const field of this.fields) {
      stats[field.type] = (stats[field.type] || 0) + 1;
    }
    return stats;
  }
}
