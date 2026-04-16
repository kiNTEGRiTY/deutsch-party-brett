/**
 * Board Layouts - Maps specific background images to custom coordinate paths.
 * Fields 0..N, x/y are percentages of the board width/height (0-100%).
 */

// Default Snake Path
export const DEFAULT_LAYOUT = [
  { id: 0,  x: 8,  y: 88 }, { id: 1,  x: 20, y: 88 }, { id: 2,  x: 32, y: 88 }, { id: 3,  x: 44, y: 88 },
  { id: 4,  x: 56, y: 88 }, { id: 5,  x: 68, y: 88 }, { id: 6,  x: 80, y: 88 }, { id: 7,  x: 90, y: 80 },
  { id: 8,  x: 85, y: 68 }, { id: 9,  x: 70, y: 68 }, { id: 10, x: 55, y: 68 }, { id: 11, x: 40, y: 68 },
  { id: 12, x: 25, y: 68 }, { id: 13, x: 10, y: 60 }, { id: 14, x: 15, y: 48 }, { id: 15, x: 30, y: 48 },
  { id: 16, x: 45, y: 48 }, { id: 17, x: 60, y: 48 }, { id: 18, x: 75, y: 48 }, { id: 19, x: 88, y: 40 },
  { id: 20, x: 80, y: 28 }, { id: 21, x: 65, y: 28 }, { id: 22, x: 50, y: 28 }, { id: 23, x: 35, y: 28 },
  { id: 24, x: 20, y: 28 }, { id: 25, x: 8,  y: 20 }, { id: 26, x: 20, y: 10 }, { id: 27, x: 35, y: 12 },
  { id: 28, x: 50, y: 12 }
];

// Frame around the elephant (leaves center untouched)
export const ELEPHANT_LAYOUT = [
  { id: 0, x: 5, y: 95 }, { id: 1, x: 5, y: 80 }, { id: 2, x: 5, y: 65 }, { id: 3, x: 5, y: 50 },
  { id: 4, x: 5, y: 35 }, { id: 5, x: 5, y: 20 }, { id: 6, x: 5, y: 5 }, { id: 7, x: 20, y: 5 },
  { id: 8, x: 35, y: 5 }, { id: 9, x: 50, y: 5 }, { id: 10, x: 65, y: 5 }, { id: 11, x: 80, y: 5 },
  { id: 12, x: 95, y: 5 }, { id: 13, x: 95, y: 20 }, { id: 14, x: 95, y: 35 }, { id: 15, x: 95, y: 50 },
  { id: 16, x: 95, y: 65 }, { id: 17, x: 95, y: 80 }, { id: 18, x: 95, y: 95 }, { id: 19, x: 80, y: 95 },
  { id: 20, x: 65, y: 95 }, { id: 21, x: 50, y: 95 }, { id: 22, x: 35, y: 95 }, { id: 23, x: 20, y: 95 }
];

// Wandering path for the Montessori Nature board
export const MONTESSORI_LAYOUT = [
  { id: 0, x: 10, y: 90 }, { id: 1, x: 22, y: 88 }, { id: 2, x: 32, y: 85 }, { id: 3, x: 42, y: 80 },
  { id: 4, x: 50, y: 70 }, { id: 5, x: 55, y: 60 }, { id: 6, x: 62, y: 52 }, { id: 7, x: 72, y: 50 },
  { id: 8, x: 82, y: 52 }, { id: 9, x: 88, y: 44 }, { id: 10, x: 85, y: 34 }, { id: 11, x: 75, y: 28 },
  { id: 12, x: 62, y: 24 }, { id: 13, x: 50, y: 24 }, { id: 14, x: 40, y: 30 }, { id: 15, x: 30, y: 38 },
  { id: 16, x: 20, y: 40 }, { id: 17, x: 10, y: 35 }, { id: 18, x: 10, y: 22 }, { id: 19, x: 20, y: 15 },
  { id: 20, x: 32, y: 12 }, { id: 21, x: 45, y: 12 }, { id: 22, x: 60, y: 12 }, { id: 23, x: 75, y: 12 },
  { id: 24, x: 88, y: 15 }
];

export function getBoardLayoutForImage(imageId) {
  if (imageId.includes('1966197D')) return ELEPHANT_LAYOUT;
  if (imageId.includes('montessori_nature')) return MONTESSORI_LAYOUT;
  if (imageId.includes('storybook_mystery')) return MONTESSORI_LAYOUT; // Re-use wandering path
  
  return DEFAULT_LAYOUT;
}
