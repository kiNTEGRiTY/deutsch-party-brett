export const BACKGROUNDS = [];

export function getDefaultBackground() {
  return BACKGROUNDS[0] || null;
}

export function getBackgroundById(id) {
  return BACKGROUNDS.find((background) => background.id === id) || null;
}

export const EXTRACTED_CHARS = [];
