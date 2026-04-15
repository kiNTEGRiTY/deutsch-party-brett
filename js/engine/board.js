/**
 * Board - Defines the game board layout with 30 fields
 * 
 * The board is a winding snake-like path.
 * Each field has a type, position (for rendering), and connections.
 */

import { FieldType } from './field-types.js';

// Board layout: 30 fields in a winding path
// Positions are percentages of the board container (0-100)
const BOARD_LAYOUT = [
  // Row 1: left to right (fields 0-6)
  { id: 0,  type: FieldType.START,     x: 8,  y: 88 },
  { id: 1,  type: FieldType.NORMAL,    x: 20, y: 88 },
  { id: 2,  type: FieldType.NORMAL,    x: 32, y: 88 },
  { id: 3,  type: FieldType.REWARD,    x: 44, y: 88 },
  { id: 4,  type: FieldType.NORMAL,    x: 56, y: 88 },
  { id: 5,  type: FieldType.CHALLENGE, x: 68, y: 88 },
  { id: 6,  type: FieldType.NORMAL,    x: 80, y: 88 },
  // Turn up
  { id: 7,  type: FieldType.SURPRISE,  x: 90, y: 78 },
  // Row 2: right to left (fields 8-13)
  { id: 8,  type: FieldType.NORMAL,    x: 80, y: 68 },
  { id: 9,  type: FieldType.TEAM,      x: 68, y: 68 },
  { id: 10, type: FieldType.NORMAL,    x: 56, y: 68 },
  { id: 11, type: FieldType.HELPER,    x: 44, y: 68 },
  { id: 12, type: FieldType.NORMAL,    x: 32, y: 68 },
  { id: 13, type: FieldType.MOVEMENT,  x: 20, y: 68 },
  // Turn up
  { id: 14, type: FieldType.NORMAL,    x: 8,  y: 58 },
  // Row 3: left to right (fields 15-20)
  { id: 15, type: FieldType.TREASURE,  x: 20, y: 48 },
  { id: 16, type: FieldType.NORMAL,    x: 32, y: 48 },
  { id: 17, type: FieldType.CHALLENGE, x: 44, y: 48 },
  { id: 18, type: FieldType.NORMAL,    x: 56, y: 48 },
  { id: 19, type: FieldType.REWARD,    x: 68, y: 48 },
  { id: 20, type: FieldType.NORMAL,    x: 80, y: 48 },
  // Turn up
  { id: 21, type: FieldType.SURPRISE,  x: 90, y: 38 },
  // Row 4: right to left (fields 22-27)
  { id: 22, type: FieldType.NORMAL,    x: 80, y: 28 },
  { id: 23, type: FieldType.TEAM,      x: 68, y: 28 },
  { id: 24, type: FieldType.NORMAL,    x: 56, y: 28 },
  { id: 25, type: FieldType.CHALLENGE, x: 44, y: 28 },
  { id: 26, type: FieldType.HELPER,    x: 32, y: 28 },
  { id: 27, type: FieldType.NORMAL,    x: 20, y: 28 },
  // Turn up to finish
  { id: 28, type: FieldType.TREASURE,  x: 8,  y: 15 },
  { id: 29, type: FieldType.FINISH,    x: 25, y: 8  },
];

export class Board {
  constructor(randomize = true) {
    this.fields = BOARD_LAYOUT.map(f => ({ ...f }));
    this.totalFields = this.fields.length;
    
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
      FieldType.NORMAL, FieldType.NORMAL, FieldType.NORMAL, FieldType.NORMAL, FieldType.NORMAL,
      FieldType.NORMAL, FieldType.NORMAL, FieldType.NORMAL, FieldType.NORMAL, FieldType.NORMAL,
      FieldType.CHALLENGE, FieldType.CHALLENGE, FieldType.CHALLENGE,
      FieldType.TEAM, FieldType.TEAM,
      FieldType.REWARD, FieldType.REWARD,
      FieldType.SURPRISE, FieldType.SURPRISE,
      FieldType.HELPER, FieldType.HELPER,
      FieldType.MOVEMENT,
      FieldType.TREASURE, FieldType.TREASURE,
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
