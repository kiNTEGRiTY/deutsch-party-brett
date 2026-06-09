/**
 * Board Layouts - watercolor board path geometry.
 */

const WATER_COLOR_PATH = [
  [274, 812],
  [282, 744],
  [292, 678],
  [320, 612],
  [352, 548],
  [390, 487],
  [440, 428],
  [503, 378],
  [578, 338],
  [660, 313],
  [748, 299],
  [842, 302],
  [938, 304],
  [1028, 285],
  [1116, 246],
  [1198, 204],
  [1278, 174],
  [1354, 160],
  [1426, 171],
  [1470, 206],
  [1462, 246],
  [1398, 220]
];

export const BOARD_THEME = {
  id: 'aquarell-tisch',
  name: 'Aquarellpfad',
  worldLabel: 'Wortwiesen-Weg zum Festpavillon',
  subtitle: 'Ein durchgehender Aquarellpfad mit klarem Start, Ziel und echten Illustrationsassets.',
  art: {
    boardBackdrop: 'assets/img/premium/watercolor-premium-board.png',
    startHero: 'assets/img/premium/watercolor-premium-start.png'
  },
  interactions: ['Würfeln', 'Ziehen', 'Deutschaufgabe', 'Belohnung'],
  values: ['Klarheit', 'Miteinander', 'Sorgfalt']
};

export const STANDARD_BOARD_LAYOUT = WATER_COLOR_PATH.map(([x, y], id) => ({
  id,
  x,
  y,
  difficultyLevel: id < 12 ? 1 : id < 24 ? 2 : 3
}));

export function getBoardLayoutForImage() {
  return STANDARD_BOARD_LAYOUT.map((field) => ({ ...field }));
}
