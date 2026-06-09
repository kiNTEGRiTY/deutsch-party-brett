/**
 * Board Layouts - function-first board geometry.
 *
 * The board background is authored around these 36 slots. Keep this as a
 * single sequential route: no branch art, no dead-end scenery, no second path.
 */

const FUNCTIONAL_FIELD_POINTS = [
  { x: 150, y: 625 },
  { x: 285, y: 625 },
  { x: 420, y: 625 },
  { x: 555, y: 625 },
  { x: 690, y: 625 },
  { x: 825, y: 625 },
  { x: 960, y: 625 },
  { x: 1095, y: 625 },
  { x: 1230, y: 620 },
  { x: 1370, y: 570 },
  { x: 1490, y: 505 },
  { x: 1510, y: 435 },
  { x: 1420, y: 385 },
  { x: 1295, y: 385 },
  { x: 1160, y: 385 },
  { x: 1025, y: 385 },
  { x: 890, y: 385 },
  { x: 755, y: 385 },
  { x: 620, y: 385 },
  { x: 485, y: 385 },
  { x: 350, y: 385 },
  { x: 215, y: 385 },
  { x: 150, y: 315 },
  { x: 220, y: 245 },
  { x: 350, y: 220 },
  { x: 485, y: 220 },
  { x: 620, y: 220 },
  { x: 755, y: 220 },
  { x: 890, y: 220 },
  { x: 1025, y: 220 },
  { x: 1160, y: 220 },
  { x: 1295, y: 220 },
  { x: 1430, y: 220 },
  { x: 1475, y: 155 },
  { x: 1305, y: 145 },
  { x: 1135, y: 145 }
];

function angleAt(index, points) {
  const previous = points[Math.max(0, index - 1)];
  const next = points[Math.min(points.length - 1, index + 1)];
  const angle = Math.atan2(next.y - previous.y, next.x - previous.x) * 180 / Math.PI;
  return Math.round(angle * 10) / 10;
}

export const BOARD_THEME = {
  id: 'funktionaler-feldweg',
  name: 'Feldweg',
  worldLabel: '36-Felder-Weg zum Festpavillon',
  subtitle: 'Ein einzelner durchgehender Brettweg: jedes sichtbare Spielelement ist ein Feld.',
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
