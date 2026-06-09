/**
 * Board Layouts - field-first 16:9 board geometry.
 *
 * The board background is authored from these 36 slots. Keep this as a
 * single sequential route: no branch art, no dead-end scenery, no second path,
 * and no decorative trail that is not made from real fields.
 */

const FUNCTIONAL_FIELD_POINTS = [
  { x: 191, y: 625 },
  { x: 318, y: 625 },
  { x: 445, y: 625 },
  { x: 572, y: 625 },
  { x: 699, y: 625 },
  { x: 826, y: 625 },
  { x: 953, y: 625 },
  { x: 1079, y: 625 },
  { x: 1206, y: 610 },
  { x: 1338, y: 560 },
  { x: 1451, y: 500 },
  { x: 1470, y: 420 },
  { x: 1385, y: 355 },
  { x: 1267, y: 355 },
  { x: 1141, y: 355 },
  { x: 1014, y: 355 },
  { x: 887, y: 355 },
  { x: 760, y: 355 },
  { x: 633, y: 355 },
  { x: 506, y: 355 },
  { x: 379, y: 355 },
  { x: 252, y: 355 },
  { x: 191, y: 285 },
  { x: 191, y: 205 },
  { x: 257, y: 170 },
  { x: 370, y: 170 },
  { x: 483, y: 170 },
  { x: 595, y: 170 },
  { x: 708, y: 170 },
  { x: 821, y: 170 },
  { x: 934, y: 170 },
  { x: 1047, y: 170 },
  { x: 1159, y: 170 },
  { x: 1272, y: 170 },
  { x: 1385, y: 170 },
  { x: 1498, y: 170 }
];

function angleAt(index, points) {
  const previous = points[Math.max(0, index - 1)];
  const next = points[Math.min(points.length - 1, index + 1)];
  const angle = Math.atan2(next.y - previous.y, next.x - previous.x) * 180 / Math.PI;
  return Math.round(angle * 10) / 10;
}

export const BOARD_THEME = {
  id: 'feld-first-festweg',
  name: 'Feldroute',
  worldLabel: '36 Felder bis zum Festpavillon',
  subtitle: 'Ein durchgehendes 16:9-Brett: Hintergrund, Route und Felder teilen dieselbe Geometrie.',
  art: {
    boardBackdrop: null,
    startHero: 'assets/img/premium/watercolor-premium-start.png'
  },
  interactions: ['Würfeln', 'Ziehen', 'Deutschaufgabe', 'Belohnung'],
  values: ['Klarheit', 'Miteinander', 'Sorgfalt']
};

export const STANDARD_BOARD_LAYOUT = FUNCTIONAL_FIELD_POINTS.map(({ x, y }, id) => ({
  id,
  x,
  y,
  angle: angleAt(id, FUNCTIONAL_FIELD_POINTS),
  difficultyLevel: id < 12 ? 1 : id < 24 ? 2 : 3
}));

export function getBoardLayoutForImage() {
  return STANDARD_BOARD_LAYOUT.map((field) => ({ ...field }));
}
