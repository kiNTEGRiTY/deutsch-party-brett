/**
 * Board Layouts - function-first board geometry.
 *
 * The board background is authored around these 36 slots. Keep this as a
 * single sequential route: no branch art, no dead-end scenery, no second path.
 */

const FUNCTIONAL_FIELD_PATH = [
  { x: 150, y: 785, angle: 0 },
  { x: 285, y: 785, angle: 0 },
  { x: 420, y: 785, angle: 0 },
  { x: 555, y: 785, angle: 0 },
  { x: 690, y: 785, angle: 0 },
  { x: 825, y: 785, angle: 0 },
  { x: 960, y: 785, angle: 0 },
  { x: 1095, y: 785, angle: 0 },
  { x: 1230, y: 785, angle: -8.3 },
  { x: 1370, y: 745, angle: -22.2 },
  { x: 1500, y: 675, angle: -48.6 },
  { x: 1520, y: 575, angle: -111.8 },
  { x: 1430, y: 500, angle: -155 },
  { x: 1295, y: 470, angle: -173.7 },
  { x: 1160, y: 470, angle: 180 },
  { x: 1025, y: 470, angle: 180 },
  { x: 890, y: 470, angle: 180 },
  { x: 755, y: 470, angle: 180 },
  { x: 620, y: 470, angle: 180 },
  { x: 485, y: 470, angle: 180 },
  { x: 350, y: 470, angle: 180 },
  { x: 215, y: 470, angle: -157.7 },
  { x: 155, y: 390, angle: -88.2 },
  { x: 220, y: 310, angle: -30.5 },
  { x: 350, y: 275, angle: -7.5 },
  { x: 485, y: 275, angle: 0 },
  { x: 620, y: 275, angle: 0 },
  { x: 755, y: 275, angle: 0 },
  { x: 890, y: 275, angle: 0 },
  { x: 1025, y: 275, angle: 0 },
  { x: 1160, y: 275, angle: 0 },
  { x: 1295, y: 275, angle: 0 },
  { x: 1430, y: 275, angle: -13.7 },
  { x: 1490, y: 220, angle: -124.7 },
  { x: 1340, y: 145, angle: -166.4 },
  { x: 1180, y: 145, angle: 180 }
];

export const BOARD_THEME = {
  id: 'funktionaler-feldweg',
  name: 'Feldweg',
  worldLabel: '36-Felder-Weg zum Festpavillon',
  subtitle: 'Ein einzelner durchgehender Brettweg: jedes sichtbare Spielelement ist ein Feld.',
  art: {
    boardBackdrop: 'assets/img/premium/functional-field-board.svg?v=functional-fields-7',
    startHero: 'assets/img/premium/watercolor-premium-start.png'
  },
  interactions: ['Würfeln', 'Ziehen', 'Deutschaufgabe', 'Belohnung'],
  values: ['Klarheit', 'Miteinander', 'Sorgfalt']
};

export const STANDARD_BOARD_LAYOUT = FUNCTIONAL_FIELD_PATH.map(({ x, y, angle }, id) => ({
  id,
  x,
  y,
  angle,
  difficultyLevel: id < 12 ? 1 : id < 24 ? 2 : 3
}));

export function getBoardLayoutForImage() {
  return STANDARD_BOARD_LAYOUT.map((field) => ({ ...field }));
}
