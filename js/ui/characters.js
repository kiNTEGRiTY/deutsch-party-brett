/**
 * Character Assets - Illustrated hand-drawn animal characters
 * 
 * Style: Hand-drawn pencil/watercolor baby animals with big eyes,
 * hearts, clovers, sparkles - kawaii craft-art aesthetic.
 * 
 * Falls back to inline SVG avatars.
 */
const SVG_CHARACTER_LIBRARY = [
  { id: 'fox', name_de: 'Fuchs', svgKey: 'fox' },
  { id: 'penguin', name_de: 'Pinguin', svgKey: 'penguin' },
  { id: 'bunny', name_de: 'Hase', svgKey: 'bunny' },
  { id: 'bear', name_de: 'Bär', svgKey: 'bear' },
  { id: 'elephant', name_de: 'Elefant', svgKey: 'elephant' },
  { id: 'deer', name_de: 'Reh', svgKey: 'deer' },
  { id: 'cat', name_de: 'Katze', svgKey: 'cat' }
];

export const CHARACTERS = SVG_CHARACTER_LIBRARY;

/**
 * EYE BUILDER - Common 'Steph' style eyes (Large, big iris, sparkling highlight)
 */
function buildEyes(x1, y1, x2, y2, irisColor) {
  return `<!-- Left Eye -->
    <ellipse cx="${x1}" cy="${y1}" rx="11" ry="12" fill="#FFF" stroke="#222" stroke-width="2.5"/>
    <ellipse cx="${x1}" cy="${y1}" rx="7.5" ry="8.5" fill="${irisColor}"/>
    <circle cx="${x1 - 3}" cy="${y1 - 4}" r="3" fill="#FFF"/>
    <circle cx="${x1 + 1}" cy="${y1 + 1}" r="1.5" fill="#FFF"/>
    <!-- Right Eye -->
    <ellipse cx="${x2}" cy="${y2}" rx="11" ry="12" fill="#FFF" stroke="#222" stroke-width="2.5"/>
    <ellipse cx="${x2}" cy="${y2}" rx="7.5" ry="8.5" fill="${irisColor}"/>
    <circle cx="${x2 - 3}" cy="${y2 - 4}" r="3" fill="#FFF"/>
    <circle cx="${x2 + 1}" cy="${y2 + 1}" r="1.5" fill="#FFF"/>`;
}

// ─── SVG Avatar Builders ───
function svgFox(s) {
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" class="char-svg">
    <circle cx="50" cy="50" r="47" fill="#FFF5EE" stroke="#222" stroke-width="4"/>
    <path d="M25 30 L10 5 L40 25Z" fill="#E8734A" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
    <path d="M75 30 L90 5 L60 25Z" fill="#E8734A" stroke="#222" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="50" cy="55" rx="32" ry="28" fill="#E8734A" stroke="#222" stroke-width="3"/>
    <ellipse cx="50" cy="62" rx="20" ry="14" fill="#FFF5EE" stroke="#222" stroke-width="2" opacity="0.6"/>
    ${buildEyes(38, 48, 62, 48, '#6B8C26')}
    <circle cx="28" cy="58" r="6" fill="#F5B0B0" opacity="0.6"/><circle cx="72" cy="58" r="6" fill="#F5B0B0" opacity="0.6"/>
    <path d="M50 56 Q50 63 50 63" stroke="#222" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

function svgPenguin(s) {
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" class="char-svg">
    <circle cx="50" cy="50" r="47" fill="#F0F5FA" stroke="#222" stroke-width="4"/>
    <ellipse cx="50" cy="55" rx="32" ry="32" fill="#6B7B8D" stroke="#222" stroke-width="3.5"/>
    <ellipse cx="50" cy="62" rx="22" ry="24" fill="#FFF" stroke="#222" stroke-width="2"/>
    ${buildEyes(38, 45, 62, 45, '#4A90E2')}
    <path d="M46 54 L50 59 L54 54" fill="#F5A623" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="32" cy="52" r="6" fill="#F5B0B0" opacity="0.5"/><circle cx="68" cy="52" r="6" fill="#F5B0B0" opacity="0.5"/>
  </svg>`;
}

function svgBunny(s) {
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" class="char-svg">
    <circle cx="50" cy="55" r="44" fill="#FFF8F8" stroke="#222" stroke-width="4"/>
    <ellipse cx="34" cy="18" rx="9" ry="22" fill="#FFF" stroke="#222" stroke-width="3" transform="rotate(-10 34 18)"/>
    <ellipse cx="66" cy="18" rx="9" ry="22" fill="#FFF" stroke="#222" stroke-width="3" transform="rotate(10 66 18)"/>
    <ellipse cx="34" cy="18" rx="4" ry="14" fill="#E8B8C8" transform="rotate(-10 34 18)"/>
    <ellipse cx="66" cy="18" rx="4" ry="14" fill="#E8B8C8" transform="rotate(10 66 18)"/>
    ${buildEyes(38, 54, 62, 54, '#9B51E0')}
    <ellipse cx="50" cy="64" rx="4" ry="3" fill="#222"/>
    <path d="M46 68 Q50 73 54 68" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="34" cy="64" r="6" fill="#F5B0B0" opacity="0.5"/><circle cx="66" cy="64" r="6" fill="#F5B0B0" opacity="0.5"/>
  </svg>`;
}

function svgBear(s) {
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" class="char-svg">
    <circle cx="50" cy="50" r="47" fill="#FFF8F0" stroke="#222" stroke-width="4"/>
    <circle cx="26" cy="26" r="14" fill="#C8B098" stroke="#222" stroke-width="3"/>
    <circle cx="74" cy="26" r="14" fill="#C8B098" stroke="#222" stroke-width="3"/>
    <ellipse cx="50" cy="56" rx="34" ry="32" fill="#C8B098" stroke="#222" stroke-width="3.5"/>
    <ellipse cx="50" cy="64" rx="18" ry="12" fill="#FFF" stroke="#222" stroke-width="2" opacity="0.5"/>
    ${buildEyes(38, 48, 62, 48, '#8B4513')}
    <ellipse cx="50" cy="60" rx="6" ry="4.5" fill="#222"/>
    <circle cx="30" cy="55" r="7" fill="#F5B0B0" opacity="0.5"/><circle cx="70" cy="55" r="7" fill="#F5B0B0" opacity="0.5"/>
  </svg>`;
}

function svgElephant(s) {
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" class="char-svg">
    <circle cx="50" cy="50" r="47" fill="#F0F5FF" stroke="#222" stroke-width="4"/>
    <ellipse cx="20" cy="45" rx="16" ry="24" fill="#A0B0C4" stroke="#222" stroke-width="3.5"/>
    <ellipse cx="80" cy="45" rx="16" ry="24" fill="#A0B0C4" stroke="#222" stroke-width="3.5"/>
    <ellipse cx="50" cy="55" rx="34" ry="32" fill="#A0B0C4" stroke="#222" stroke-width="3.5"/>
    ${buildEyes(38, 48, 62, 48, '#5F7D8E')}
    <path d="M50 58 Q50 82 40 85" stroke="#222" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="58" r="7" fill="#F5B0B0" opacity="0.4"/><circle cx="68" cy="58" r="7" fill="#F5B0B0" opacity="0.4"/>
  </svg>`;
}

function svgDeer(s) {
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" class="char-svg">
    <circle cx="50" cy="50" r="47" fill="#FFFAF0" stroke="#222" stroke-width="4"/>
    <path d="M35 25 L30 5" stroke="#222" stroke-width="4" stroke-linecap="round"/><path d="M65 25 L70 5" stroke="#222" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="50" cy="56" rx="32" ry="30" fill="#C8B898" stroke="#222" stroke-width="3.5"/>
    ${buildEyes(38, 48, 62, 48, '#704214')}
    <ellipse cx="50" cy="62" rx="4.5" ry="3.5" fill="#222"/>
    <circle cx="50" cy="38" r="2" fill="#FFF" opacity="0.8"/><circle cx="58" cy="36" r="1.5" fill="#FFF" opacity="0.8"/><circle cx="42" cy="36" r="1.5" fill="#FFF" opacity="0.8"/>
    <circle cx="34" cy="58" r="6" fill="#F5B0B0" opacity="0.5"/><circle cx="66" cy="58" r="6" fill="#F5B0B0" opacity="0.5"/>
  </svg>`;
}

function svgCat(s) {
  return `<svg viewBox="0 0 100 100" width="${s}" height="${s}" class="char-svg">
    <circle cx="50" cy="50" r="47" fill="#F8F8F8" stroke="#222" stroke-width="4"/>
    <path d="M28 35 L12 8 L40 28Z" fill="#9E9E9E" stroke="#222" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M72 35 L88 8 L60 28Z" fill="#9E9E9E" stroke="#222" stroke-width="3.5" stroke-linejoin="round"/>
    <ellipse cx="50" cy="56" rx="34" ry="32" fill="#9E9E9E" stroke="#222" stroke-width="3.5"/>
    <ellipse cx="50" cy="65" rx="18" ry="12" fill="#FFF" opacity="0.5"/>
    ${buildEyes(38, 48, 62, 48, '#6B8C26')}
    <path d="M47 57 L50 61 L53 57" fill="#F0A0A0" stroke="#222" stroke-width="1.5"/>
    <path d="M44 65 Q50 71 56 65" stroke="#222" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="30" cy="58" r="7" fill="#F5B0B0" opacity="0.45"/><circle cx="70" cy="58" r="7" fill="#F5B0B0" opacity="0.45"/>
    <!-- Whiskers -->
    <line x1="22" y1="52" x2="32" y2="55" stroke="#222" stroke-width="1.5"/><line x1="22" y1="60" x2="32" y2="59" stroke="#222" stroke-width="1.5"/>
    <line x1="68" y1="55" x2="78" y2="52" stroke="#222" stroke-width="1.5"/><line x1="68" y1="59" x2="78" y2="60" stroke="#222" stroke-width="1.5"/>
  </svg>`;
}

export const SVG_BUILDERS = {
  fox: svgFox,
  penguin: svgPenguin,
  bunny: svgBunny,
  bear: svgBear,
  elephant: svgElephant,
  deer: svgDeer,
  cat: svgCat
};

export function getCharacter(index) {
  return CHARACTERS[index % CHARACTERS.length];
}

/**
 * HELPER: Build character sprite HTML
 */
function buildCharacterSprite(char, size) {
  if (char.spriteImg) {
    return `<div class="char-sprite" style="
      background-image: url('${char.spriteImg}'); 
      background-size: contain; 
      background-position: center;
      background-repeat: no-repeat;
      width: 100%;
      height: 100%;
    "></div>`;
  }

  if (char.svgKey && SVG_BUILDERS[char.svgKey]) {
    return SVG_BUILDERS[char.svgKey](size);
  }

  return svgFox(size);
}

/**
 * Render character avatar as SVG (always works, no external files needed)
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
