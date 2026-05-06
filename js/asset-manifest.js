export const BACKGROUNDS = [
  {
    id: 'wortgarten',
    url: 'assets/img/backgrounds/standard_board_preview.svg',
    name: 'Zauberwald'
  }
];

export function getDefaultBackground() {
  return BACKGROUNDS[0] || {
    id: 'wortgarten',
    url: 'assets/img/backgrounds/standard_board_preview.svg',
    name: 'Zauberwald'
  };
}

export function getBackgroundById(id) {
  return BACKGROUNDS.find((background) => background.id === id) || null;
}

export const EXTRACTED_CHARS = [];
