/**
 * Field Types - Defines all board field categories and their behaviors
 * 
 * Each field type has:
 * - id: unique identifier
 * - label: German display name
 * - iconId: SVG icon identifier (rendered via icons.js)
 * - color: CSS class name (maps to design tokens)
 * - description: what happens on this field
 * - handler: what game action occurs
 */

import { getFieldIcon } from '../ui/icons.js';

export const FieldType = {
  NORMAL:    'normal',
  NOMEN:     'nomen',
  VERBEN:    'verben',
  ADJEKTIV:  'adjektiv',
  CHALLENGE: 'challenge',
  TEAM:      'team',
  REWARD:    'reward',
  SURPRISE:  'surprise',
  HELPER:    'helper',
  MOVEMENT:  'movement',
  TREASURE:  'treasure',
  TRAP:      'trap',
  PORTAL:    'portal',
  START:     'start',
  FINISH:    'finish'
};

// Field type metadata
export const FIELD_META = {
  [FieldType.START]: {
    label: 'Start',
    iconId: 'start',
    color: 'normal',
    description: 'Hier geht es los!',
    handler: 'none'
  },
  [FieldType.NORMAL]: {
    label: 'Aufgabe',
    iconId: 'normal',
    color: 'normal',
    description: 'Löse eine Deutsch-Aufgabe!',
    handler: 'minigame_single'
  },
  [FieldType.NOMEN]: {
    label: 'Nomen',
    iconId: 'nomen',
    color: 'challenge',
    description: 'Spiele ein Nomen-Spiel!',
    handler: 'minigame_nomen'
  },
  [FieldType.VERBEN]: {
    label: 'Verben',
    iconId: 'verben',
    color: 'team',
    description: 'Löse eine Verben-Aufgabe!',
    handler: 'minigame_verben'
  },
  [FieldType.ADJEKTIV]: {
    label: 'Adjektive',
    iconId: 'adjektiv',
    color: 'helper',
    description: 'Spiele mit Adjektiven!',
    handler: 'minigame_adjektiv'
  },
  [FieldType.CHALLENGE]: {
    label: 'Herausforderung',
    iconId: 'challenge',
    color: 'challenge',
    description: 'Alle spielen gleichzeitig!',
    handler: 'minigame_all'
  },
  [FieldType.TEAM]: {
    label: 'Teamarbeit',
    iconId: 'team',
    color: 'team',
    description: 'Arbeitet zusammen!',
    handler: 'minigame_team'
  },
  [FieldType.REWARD]: {
    label: 'Belohnung',
    iconId: 'reward',
    color: 'reward',
    description: 'Du bekommst eine Belohnung!',
    handler: 'reward'
  },
  [FieldType.SURPRISE]: {
    label: 'Überraschung',
    iconId: 'surprise',
    color: 'surprise',
    description: 'Was wird passieren?',
    handler: 'surprise'
  },
  [FieldType.HELPER]: {
    label: 'Helfer',
    iconId: 'helper',
    color: 'helper',
    description: 'Du bekommst einen Tipp!',
    handler: 'helper'
  },
  [FieldType.MOVEMENT]: {
    label: 'Bewegung',
    iconId: 'movement',
    color: 'movement',
    description: 'Bewege dich vor oder zurück!',
    handler: 'movement'
  },
  [FieldType.TREASURE]: {
    label: 'Schatz',
    iconId: 'treasure',
    color: 'treasure',
    description: 'Du hast einen Stern gefunden!',
    handler: 'treasure'
  },
  [FieldType.TRAP]: {
    label: 'Falle',
    iconId: 'trap',
    color: 'challenge',
    description: 'Pass auf! Eine Falle!',
    handler: 'trap'
  },
  [FieldType.PORTAL]: {
    label: 'Portal',
    iconId: 'portal',
    color: 'surprise',
    description: 'Wooosh! Wohin führt das wohl?',
    handler: 'portal'
  },
  [FieldType.FINISH]: {
    label: 'Ziel',
    iconId: 'finish',
    color: 'treasure',
    description: 'Du hast das Ziel erreicht!',
    handler: 'finish'
  }
};

/**
 * Get field metadata by type
 */
export function getFieldMeta(type) {
  return FIELD_META[type] || FIELD_META[FieldType.NORMAL];
}

/**
 * Get field icon SVG by type
 */
export function getFieldIconSVG(type, size = 24) {
  return getFieldIcon(type, size);
}
