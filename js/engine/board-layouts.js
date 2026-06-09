/**
 * Board Layouts - field-first 16:9 board geometry.
 *
 * The board background is authored from these 36 slots. Keep this as a
 * single sequential route: no branch art, no dead-end scenery, no second path,
 * and no decorative trail that is not made from real fields.
 */

const FUNCTIONAL_FIELD_POINTS = [
  { x: 185, y: 690 },
  { x: 320, y: 690 },
  { x: 455, y: 690 },
  { x: 590, y: 690 },
  { x: 725, y: 690 },
  { x: 860, y: 690 },
  { x: 995, y: 690 },
  { x: 1130, y: 690 },
  { x: 1265, y: 670 },
  { x: 1390, y: 610 },
  { x: 1490, y: 535 },
  { x: 1495, y: 455 },
  { x: 1410, y: 400 },
  { x: 1275, y: 400 },
  { x: 1140, y: 400 },
  { x: 1005, y: 400 },
  { x: 870, y: 400 },
  { x: 735, y: 400 },
  { x: 600, y: 400 },
  { x: 465, y: 400 },
  { x: 330, y: 400 },
  { x: 215, y: 360 },
  { x: 175, y: 285 },
  { x: 215, y: 210 },
  { x: 300, y: 185 },
  { x: 410, y: 185 },
  { x: 520, y: 185 },
  { x: 630, y: 185 },
  { x: 740, y: 185 },
  { x: 850, y: 185 },
  { x: 960, y: 185 },
  { x: 1070, y: 185 },
  { x: 1180, y: 185 },
  { x: 1290, y: 185 },
  { x: 1400, y: 185 },
  { x: 1560, y: 185 }
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
  worldLabel: '36 echte Felder bis zum Festpavillon',
  subtitle: 'Ein durchgehendes 16:9-Brett: Das Bild entsteht aus den Feldern, nicht aus einer Kulisse.',
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
