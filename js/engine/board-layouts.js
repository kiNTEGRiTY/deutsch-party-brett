/**
 * Board Layouts - integrated board path geometry without background images.
 */

const WORD_GARDEN_PATH = [
  [14, 90],
  [24, 89],
  [35, 88],
  [46, 87],
  [57, 86],
  [68, 84],
  [78, 81],
  [84, 74],
  [80, 66],
  [69, 63],
  [58, 62],
  [47, 63],
  [36, 64],
  [25, 67],
  [17, 72],
  [13, 64],
  [21, 56],
  [31, 53],
  [42, 52],
  [53, 52],
  [64, 54],
  [74, 58],
  [81, 53],
  [75, 45],
  [65, 41],
  [54, 40],
  [43, 40],
  [32, 41],
  [22, 45],
  [17, 38],
  [23, 30],
  [33, 26],
  [45, 24],
  [57, 24],
  [69, 25],
  [80, 29]
];

export const BOARD_THEME = {
  id: 'wortgarten',
  name: 'Zauberwald',
  subtitle: 'Ein freundlicher Waldpfad aus großen Lernsteinen, auf dem Figuren sichtbar von Feld zu Feld ziehen.',
  interactions: ['Drag & Drop', 'Auswahl', 'Zuordnen', 'Reihenfolge', 'Lückensatz'],
  values: ['Respekt', 'Achtsamkeit', 'Zusammenarbeit']
};

export const STANDARD_BOARD_LAYOUT = WORD_GARDEN_PATH.map(([x, y], id) => ({
  id,
  x,
  y,
  difficultyLevel: id < 12 ? 1 : id < 24 ? 2 : 3
}));

export function getBoardLayoutForImage() {
  return STANDARD_BOARD_LAYOUT.map((field) => ({ ...field }));
}
