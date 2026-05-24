/**
 * Character assets
 *
 * The visible player figures use transparent cutouts from the user's
 * original photographed animal sheet. The drawings are not redrawn.
 */
const CUTOUT_BASE = 'assets/img/premium/user-reference/cutouts';
const CUTOUT_VERSION = 'cutouts-16';

const ORIGINAL_CHARACTER_LIBRARY = [
  { id: 'elephant', name_de: 'Elefant', cutoutImg: `${CUTOUT_BASE}/elephant.png?v=${CUTOUT_VERSION}` },
  { id: 'penguin', name_de: 'Pinguin', cutoutImg: `${CUTOUT_BASE}/penguin.png?v=${CUTOUT_VERSION}` },
  { id: 'cat', name_de: 'Katze', cutoutImg: `${CUTOUT_BASE}/cat.png?v=${CUTOUT_VERSION}` },
  { id: 'dog', name_de: 'Hund', cutoutImg: `${CUTOUT_BASE}/dog.png?v=${CUTOUT_VERSION}` },
  { id: 'kangaroo', name_de: 'Känguru', cutoutImg: `${CUTOUT_BASE}/kangaroo.png?v=${CUTOUT_VERSION}` },
  { id: 'bear', name_de: 'Bär', cutoutImg: `${CUTOUT_BASE}/bear.png?v=${CUTOUT_VERSION}` },
  { id: 'rabbit', name_de: 'Hase', cutoutImg: `${CUTOUT_BASE}/rabbit.png?v=${CUTOUT_VERSION}` },
  { id: 'fox', name_de: 'Fuchs', cutoutImg: `${CUTOUT_BASE}/fox.png?v=${CUTOUT_VERSION}` },
  { id: 'raccoon', name_de: 'Waschbär', cutoutImg: `${CUTOUT_BASE}/raccoon.png?v=${CUTOUT_VERSION}` },
  { id: 'deer', name_de: 'Reh', cutoutImg: `${CUTOUT_BASE}/deer.png?v=${CUTOUT_VERSION}` },
  { id: 'bat', name_de: 'Fledermaus', cutoutImg: `${CUTOUT_BASE}/bat.png?v=${CUTOUT_VERSION}` }
];

export const CHARACTERS = ORIGINAL_CHARACTER_LIBRARY;

export function getCharacter(index) {
  return CHARACTERS[index % CHARACTERS.length];
}

function buildCutoutSprite(char) {
  return `<img class="char-cutout" src="${char.cutoutImg}" alt="" draggable="false" aria-hidden="true">`;
}

/**
 * HELPER: Build character sprite HTML from the clean original cutouts only.
 */
function buildCharacterSprite(char) {
  return buildCutoutSprite(char);
}

/**
 * Render character avatar from the transparent original cutout assets.
 */
export function renderCharacterAvatar(index, size = 64) {
  const char = getCharacter(index);
  const spriteHTML = buildCharacterSprite(char, size);
  
  return `<div class="char-avatar" style="width:${size}px; height:${size}px;" data-char-id="${char.id}">
    ${spriteHTML}
  </div>`;
}

/**
 * Render mini token for scoreboard & board
 */
export function renderCharacterToken(index, size = 32) {
  const char = getCharacter(index);
  const spriteHTML = buildCharacterSprite(char, size);

  return `<div class="char-token" style="width:${size}px; height:${size}px; flex-shrink:0;">
    ${spriteHTML}
  </div>`;
}
