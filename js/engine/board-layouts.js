/**
 * Board Layouts - watercolor board path geometry.
 */

const WATER_COLOR_PATH = [
  [290, 820],
  [370, 785],
  [450, 745],
  [520, 690],
  [595, 640],
  [675, 625],
  [755, 650],
  [835, 695],
  [925, 725],
  [1020, 710],
  [1105, 665],
  [1165, 600],
  [1185, 520],
  [1150, 455],
  [1070, 420],
  [975, 420],
  [880, 448],
  [785, 480],
  [690, 495],
  [600, 470],
  [535, 410],
  [520, 335],
  [575, 275],
  [670, 245],
  [780, 255],
  [890, 290],
  [1000, 300],
  [1100, 270],
  [1175, 215],
  [1240, 155],
  [1330, 125],
  [1420, 140],
  [1495, 185],
  [1540, 255],
  [1520, 330],
  [1450, 375]
];

export const BOARD_THEME = {
  id: 'aquarell-tisch',
  name: 'Aquarellpfad',
  worldLabel: 'Wortwiesen-Weg zum Schloss',
  subtitle: 'Ein durchgehendes Spielbrett mit klarem Start, Ziel und gemalten Feldern ohne Sackgassen.',
  art: {
    boardBackdrop: 'assets/img/watercolor/tabletop-board-shell.png',
    startHero: 'assets/img/watercolor/tabletop-board-shell.png'
  },
  interactions: ['Wuerfeln', 'Ziehen', 'Deutschaufgabe', 'Belohnung'],
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
