/**
 * Icons - SVG-based icon system replacing all emojis
 * 
 * Hand-drawn style inline SVGs matching the illustrated character aesthetic.
 * Each icon is a function returning an SVG string.
 */

// ─── Player Avatars ───
// Using CSS background-image with object-position to clip from sprite sheet
// Since we can't easily copy files, we use inline SVG animal faces

export const PLAYER_AVATARS = [
  { id: 'fox', name: 'Fuchs', name_en: 'Fox', color: '#E8734A', svg: foxSVG },
  { id: 'frog', name: 'Frosch', name_en: 'Frog', color: '#7BC67E', svg: frogSVG },
  { id: 'lion', name: 'Löwe', name_en: 'Lion', color: '#E8A832', svg: lionSVG },
  { id: 'cat', name: 'Katze', name_en: 'Cat', color: '#9E9E9E', svg: catSVG },
  { id: 'bunny', name: 'Hase', name_en: 'Bunny', color: '#F0B4C8', svg: bunnySVG },
  { id: 'bear', name: 'Bär', name_en: 'Bear', color: '#A0755A', svg: bearSVG },
];

function foxSVG(size = 40) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avatar-svg">
    <circle cx="50" cy="50" r="48" fill="#FFF5EE" stroke="#E8734A" stroke-width="3"/>
    <path d="M30 30 L22 12 L38 25Z" fill="#E8734A" stroke="#C4582E" stroke-width="1.5"/>
    <path d="M70 30 L78 12 L62 25Z" fill="#E8734A" stroke="#C4582E" stroke-width="1.5"/>
    <path d="M32 28 L26 16 L36 26Z" fill="#FFF" stroke="none"/>
    <path d="M68 28 L74 16 L64 26Z" fill="#FFF" stroke="none"/>
    <ellipse cx="50" cy="52" rx="28" ry="25" fill="#E8734A"/>
    <ellipse cx="50" cy="58" rx="18" ry="14" fill="#FFF5EE"/>
    <circle cx="38" cy="46" r="6" fill="#2D1B0E"/>
    <circle cx="62" cy="46" r="6" fill="#2D1B0E"/>
    <circle cx="40" cy="44" r="2" fill="#FFF"/>
    <circle cx="64" cy="44" r="2" fill="#FFF"/>
    <ellipse cx="50" cy="56" rx="4" ry="3" fill="#2D1B0E"/>
    <path d="M46 62 Q50 67 54 62" stroke="#2D1B0E" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="54" r="6" fill="#F5A0A0" opacity="0.5"/>
    <circle cx="68" cy="54" r="6" fill="#F5A0A0" opacity="0.5"/>
  </svg>`;
}

function frogSVG(size = 40) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avatar-svg">
    <circle cx="50" cy="50" r="48" fill="#F0FFF0" stroke="#7BC67E" stroke-width="3"/>
    <ellipse cx="50" cy="55" rx="30" ry="26" fill="#7BC67E"/>
    <circle cx="35" cy="35" r="12" fill="#7BC67E"/>
    <circle cx="65" cy="35" r="12" fill="#7BC67E"/>
    <circle cx="35" cy="33" r="8" fill="#FFF"/>
    <circle cx="65" cy="33" r="8" fill="#FFF"/>
    <circle cx="36" cy="32" r="4" fill="#2D1B0E"/>
    <circle cx="66" cy="32" r="4" fill="#2D1B0E"/>
    <circle cx="37" cy="31" r="1.5" fill="#FFF"/>
    <circle cx="67" cy="31" r="1.5" fill="#FFF"/>
    <ellipse cx="50" cy="58" rx="20" ry="12" fill="#A0E8A0"/>
    <path d="M35 60 Q50 72 65 60" stroke="#3D7A3D" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <circle cx="30" cy="55" r="5" fill="#F5A0A0" opacity="0.4"/>
    <circle cx="70" cy="55" r="5" fill="#F5A0A0" opacity="0.4"/>
    <circle cx="42" cy="50" r="2" fill="#5DAE5D" opacity="0.5"/>
    <circle cx="58" cy="48" r="1.5" fill="#5DAE5D" opacity="0.5"/>
  </svg>`;
}

function lionSVG(size = 40) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avatar-svg">
    <circle cx="50" cy="50" r="48" fill="#FFFAF0" stroke="#E8A832" stroke-width="3"/>
    <circle cx="50" cy="52" r="35" fill="#E8A832"/>
    <circle cx="50" cy="55" r="25" fill="#F5D48A"/>
    <path d="M25 40 Q20 25 35 30" fill="#D4912A" stroke="none"/>
    <path d="M75 40 Q80 25 65 30" fill="#D4912A" stroke="none"/>
    <path d="M22 55 Q15 45 28 42" fill="#D4912A" stroke="none"/>
    <path d="M78 55 Q85 45 72 42" fill="#D4912A" stroke="none"/>
    <path d="M30 68 Q22 62 30 55" fill="#D4912A" stroke="none"/>
    <path d="M70 68 Q78 62 70 55" fill="#D4912A" stroke="none"/>
    <circle cx="40" cy="48" r="5" fill="#2D1B0E"/>
    <circle cx="60" cy="48" r="5" fill="#2D1B0E"/>
    <circle cx="42" cy="46" r="2" fill="#FFF"/>
    <circle cx="62" cy="46" r="2" fill="#FFF"/>
    <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#2D1B0E"/>
    <path d="M45 63 Q50 68 55 63" stroke="#2D1B0E" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="35" cy="56" r="5" fill="#F5A0A0" opacity="0.4"/>
    <circle cx="65" cy="56" r="5" fill="#F5A0A0" opacity="0.4"/>
  </svg>`;
}

function catSVG(size = 40) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avatar-svg">
    <circle cx="50" cy="50" r="48" fill="#F8F8F8" stroke="#9E9E9E" stroke-width="3"/>
    <path d="M28 35 L18 10 L38 28Z" fill="#9E9E9E" stroke="#7A7A7A" stroke-width="1.5"/>
    <path d="M72 35 L82 10 L62 28Z" fill="#9E9E9E" stroke="#7A7A7A" stroke-width="1.5"/>
    <path d="M30 33 L24 15 L36 29Z" fill="#F0C8C8"/>
    <path d="M70 33 L76 15 L64 29Z" fill="#F0C8C8"/>
    <ellipse cx="50" cy="55" rx="28" ry="24" fill="#9E9E9E"/>
    <ellipse cx="50" cy="60" rx="16" ry="10" fill="#E8E8E8"/>
    <circle cx="38" cy="48" r="6" fill="#FFF"/>
    <circle cx="62" cy="48" r="6" fill="#FFF"/>
    <circle cx="39" cy="47" r="3.5" fill="#6B4226"/>
    <circle cx="63" cy="47" r="3.5" fill="#6B4226"/>
    <circle cx="40" cy="46" r="1.5" fill="#FFF"/>
    <circle cx="64" cy="46" r="1.5" fill="#FFF"/>
    <path d="M47 57 L50 60 L53 57" fill="#F0A0A0" stroke="#D88" stroke-width="1"/>
    <path d="M45 62 Q50 66 55 62" stroke="#666" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <line x1="22" y1="52" x2="36" y2="55" stroke="#BBB" stroke-width="1.2"/>
    <line x1="22" y1="58" x2="36" y2="58" stroke="#BBB" stroke-width="1.2"/>
    <line x1="64" y1="55" x2="78" y2="52" stroke="#BBB" stroke-width="1.2"/>
    <line x1="64" y1="58" x2="78" y2="58" stroke="#BBB" stroke-width="1.2"/>
    <circle cx="33" cy="55" r="5" fill="#F5A0A0" opacity="0.4"/>
    <circle cx="67" cy="55" r="5" fill="#F5A0A0" opacity="0.4"/>
  </svg>`;
}

function bunnySVG(size = 40) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avatar-svg">
    <circle cx="50" cy="55" r="45" fill="#FFF8F8" stroke="#F0B4C8" stroke-width="3"/>
    <ellipse cx="35" cy="18" rx="8" ry="22" fill="#FFF" stroke="#E8A0B8" stroke-width="2" transform="rotate(-10 35 18)"/>
    <ellipse cx="65" cy="18" rx="8" ry="22" fill="#FFF" stroke="#E8A0B8" stroke-width="2" transform="rotate(10 65 18)"/>
    <ellipse cx="35" cy="18" rx="4" ry="15" fill="#F5C8D8" transform="rotate(-10 35 18)"/>
    <ellipse cx="65" cy="18" rx="4" ry="15" fill="#F5C8D8" transform="rotate(10 65 18)"/>
    <ellipse cx="50" cy="58" rx="25" ry="22" fill="#FFF"/>
    <circle cx="40" cy="52" r="5" fill="#2D1B0E"/>
    <circle cx="60" cy="52" r="5" fill="#2D1B0E"/>
    <circle cx="41" cy="50" r="2" fill="#FFF"/>
    <circle cx="61" cy="50" r="2" fill="#FFF"/>
    <ellipse cx="50" cy="62" rx="3" ry="2.5" fill="#F0A0B0"/>
    <path d="M46 66 Q50 70 54 66" stroke="#C88" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="34" cy="60" r="6" fill="#F5B0B0" opacity="0.4"/>
    <circle cx="66" cy="60" r="6" fill="#F5B0B0" opacity="0.4"/>
  </svg>`;
}

function bearSVG(size = 40) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="avatar-svg">
    <circle cx="50" cy="50" r="48" fill="#FFF8F0" stroke="#A0755A" stroke-width="3"/>
    <circle cx="28" cy="28" r="12" fill="#A0755A"/>
    <circle cx="72" cy="28" r="12" fill="#A0755A"/>
    <circle cx="28" cy="27" r="7" fill="#C8A080"/>
    <circle cx="72" cy="27" r="7" fill="#C8A080"/>
    <ellipse cx="50" cy="55" rx="30" ry="28" fill="#A0755A"/>
    <ellipse cx="50" cy="62" rx="18" ry="12" fill="#C8A080"/>
    <circle cx="38" cy="48" r="5.5" fill="#2D1B0E"/>
    <circle cx="62" cy="48" r="5.5" fill="#2D1B0E"/>
    <circle cx="40" cy="46" r="2" fill="#FFF"/>
    <circle cx="64" cy="46" r="2" fill="#FFF"/>
    <ellipse cx="50" cy="58" rx="5" ry="4" fill="#2D1B0E"/>
    <path d="M45 64 Q50 69 55 64" stroke="#2D1B0E" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="55" r="5" fill="#F5A0A0" opacity="0.4"/>
    <circle cx="68" cy="55" r="5" fill="#F5A0A0" opacity="0.4"/>
  </svg>`;
}


// ─── Field Type Icons ───

export function iconTask(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><rect x="8" y="4" width="22" height="28" rx="2" fill="#E8EAF6" stroke="#5C6BC0" stroke-width="2"/><line x1="13" y1="12" x2="25" y2="12" stroke="#7986CB" stroke-width="2" stroke-linecap="round"/><line x1="13" y1="18" x2="22" y2="18" stroke="#7986CB" stroke-width="2" stroke-linecap="round"/><line x1="13" y1="24" x2="19" y2="24" stroke="#7986CB" stroke-width="2" stroke-linecap="round"/><path d="M5 32 L9 28 L12 35Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1"/></svg>`;
}

export function iconChallenge(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M20 4 L24 16 L15 16Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1.5"/><path d="M20 16 L24 28 L16 28Z" fill="#FFB300" stroke="#F57F17" stroke-width="1.5"/><circle cx="14" cy="8" r="2" fill="#FF6F00" opacity="0.6"/><circle cx="28" cy="12" r="1.5" fill="#FF6F00" opacity="0.6"/></svg>`;
}

export function iconTeam(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M12 22 Q8 18 12 14 Q16 10 20 14" fill="#81C784" stroke="#388E3C" stroke-width="1.5"/><path d="M28 22 Q32 18 28 14 Q24 10 20 14" fill="#A5D6A7" stroke="#388E3C" stroke-width="1.5"/><path d="M16 28 Q12 24 16 20 Q20 16 24 20 Q28 24 24 28Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.5"/></svg>`;
}

export function iconReward(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><rect x="8" y="14" width="24" height="18" rx="3" fill="#FFE082" stroke="#F9A825" stroke-width="2"/><path d="M8 14 Q8 10 20 10 Q32 10 32 14" fill="#FFD54F" stroke="#F9A825" stroke-width="2"/><rect x="17" y="10" width="6" height="22" fill="#FF8F00" opacity="0.3"/><path d="M14 14 Q20 6 26 14" fill="none" stroke="#E65100" stroke-width="2" stroke-linecap="round"/></svg>`;
}

export function iconSurprise(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><text x="20" y="30" text-anchor="middle" font-family="Fredoka One, sans-serif" font-size="28" fill="#AB47BC" stroke="#7B1FA2" stroke-width="1">?</text><circle cx="10" cy="10" r="2" fill="#CE93D8"/><circle cx="32" cy="8" r="1.5" fill="#CE93D8"/><circle cx="8" cy="28" r="1" fill="#CE93D8"/></svg>`;
}

export function iconHelper(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><ellipse cx="20" cy="24" rx="8" ry="10" fill="#B2EBF2" stroke="#00ACC1" stroke-width="2"/><path d="M14 24 L20 8 L26 24" fill="#E0F7FA" stroke="#00ACC1" stroke-width="2"/><circle cx="20" cy="6" r="3" fill="#FFEB3B" stroke="#F9A825" stroke-width="1.5"/><line x1="20" y1="3" x2="20" y2="0" stroke="#F9A825" stroke-width="1.5"/><line x1="16" y1="4" x2="14" y2="1" stroke="#F9A825" stroke-width="1"/><line x1="24" y1="4" x2="26" y2="1" stroke="#F9A825" stroke-width="1"/></svg>`;
}

export function iconMovement(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M10 26 Q10 14 20 14 Q30 14 30 26" fill="none" stroke="#FF7043" stroke-width="3" stroke-linecap="round"/><path d="M26 22 L30 26 L34 22" fill="none" stroke="#FF7043" stroke-width="3" stroke-linecap="round"/><path d="M6 30 L10 26 L14 30" fill="none" stroke="#FF7043" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/></svg>`;
}

export function iconTreasure(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M20 4 L24 14 L34 16 L26 24 L28 34 L20 28 L12 34 L14 24 L6 16 L16 14Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1.5"/><circle cx="20" cy="18" r="3" fill="#FFF9C4"/></svg>`;
}

export function iconStart(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><rect x="6" y="8" width="4" height="26" rx="1" fill="#8D6E63" stroke="#5D4037" stroke-width="1"/><path d="M10 8 L32 14 L10 22Z" fill="#FFF" stroke="#424242"/><rect x="10" y="8" width="11" height="7" fill="#424242"/><rect x="21" y="15" width="11" height="7" fill="#424242"/></svg>`;
}

export function iconFinish(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M14 36 L14 6 L26 6 L26 36" fill="none" stroke="#A0755A" stroke-width="2"/><path d="M12 8 Q20 4 28 8 L28 20 Q20 16 12 20Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1.5"/><circle cx="20" cy="14" r="4" fill="#FFF9C4" stroke="#F9A825" stroke-width="1"/></svg>`;
}

export function iconTrap(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M6 34 L34 34 L20 6Z" fill="#EF5350" stroke="#B71C1C" stroke-width="2"/><path d="M18 16 L22 16 L21 24 L19 24Z" fill="#FFF"/><circle cx="20" cy="28" r="2" fill="#FFF"/><path d="M10 30 L14 26 M26 26 L30 30" stroke="#B71C1C" stroke-width="2" stroke-linecap="round"/></svg>`;
}

export function iconPortal(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><circle cx="20" cy="20" r="14" fill="#5C6BC0" stroke="#283593" stroke-width="2"/><path d="M20 10 A10 10 0 1 0 30 20" fill="none" stroke="#9FA8DA" stroke-width="2" stroke-dasharray="4 2"><animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="3s" repeatCount="indefinite"/></path><circle cx="20" cy="20" r="6" fill="#1A237E" opacity="0.6"/></svg>`;
}


// ─── UI Icons ───

export function iconCoin(size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><circle cx="12" cy="12" r="10" fill="#FFD54F" stroke="#F9A825" stroke-width="1.5"/><circle cx="12" cy="12" r="7" fill="#FFECB3" stroke="#F9A825" stroke-width="0.8"/><text x="12" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="#E65100">M</text></svg>`;
}

export function iconStar(size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><path d="M12 2 L14.5 9 L22 9.5 L16.5 14.5 L18 22 L12 18 L6 22 L7.5 14.5 L2 9.5 L9.5 9Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1"/></svg>`;
}

export function iconDice(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><rect x="4" y="4" width="32" height="32" rx="6" fill="#FFF8E1" stroke="#A0755A" stroke-width="2.5"/><circle cx="13" cy="13" r="3" fill="#5D4037"/><circle cx="27" cy="13" r="3" fill="#5D4037"/><circle cx="13" cy="27" r="3" fill="#5D4037"/><circle cx="27" cy="27" r="3" fill="#5D4037"/><circle cx="20" cy="20" r="3" fill="#5D4037"/></svg>`;
}

export function iconGamepad(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><rect x="4" y="12" width="32" height="18" rx="8" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/><circle cx="13" cy="21" r="3" fill="#1976D2"/><rect x="10" y="18" width="6" height="6" rx="1" fill="none" stroke="#1976D2" stroke-width="1.5"/><circle cx="29" cy="18" r="2" fill="#F44336"/><circle cx="25" cy="22" r="2" fill="#4CAF50"/><circle cx="33" cy="22" r="2" fill="#FF9800"/></svg>`;
}

export function iconPlay(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><circle cx="20" cy="20" r="16" fill="#66BB6A" stroke="#2E7D32" stroke-width="2"/><path d="M16 12 L30 20 L16 28Z" fill="#FFF"/></svg>`;
}

export function iconProfile(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><circle cx="20" cy="15" r="8" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/><path d="M8 36 Q8 24 20 24 Q32 24 32 36" fill="#90CAF9" stroke="#1976D2" stroke-width="2"/></svg>`;
}

export function iconCheck(size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><circle cx="12" cy="12" r="10" fill="#C8E6C9" stroke="#4CAF50" stroke-width="2"/><path d="M7 12 L10.5 16 L17 8" stroke="#2E7D32" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function iconWrong(size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><circle cx="12" cy="12" r="10" fill="#FFCDD2" stroke="#F44336" stroke-width="2"/><path d="M8 8 L16 16 M16 8 L8 16" stroke="#C62828" stroke-width="2.5" stroke-linecap="round"/></svg>`;
}

export function iconTimer(size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><rect x="7" y="2" width="10" height="3" rx="1" fill="#8D6E63"/><rect x="5" y="5" width="14" height="17" rx="3" fill="#BBDEFB" stroke="#1976D2" stroke-width="1.5"/><rect x="5" y="5" width="14" height="10" rx="3" fill="#90CAF9" stroke="none"/><rect x="7" y="20" width="10" height="3" rx="1" fill="#8D6E63"/></svg>`;
}

export function iconParty(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M10 36 L8 14 L24 14 L22 36Z" fill="#CE93D8" stroke="#8E24AA" stroke-width="1.5" transform="rotate(-15 16 25)"/><circle cx="12" cy="10" r="2" fill="#FF6F00"/><circle cx="22" cy="8" r="1.5" fill="#4CAF50"/><circle cx="18" cy="6" r="2" fill="#2196F3"/><circle cx="28" cy="12" r="1.5" fill="#FF4081"/><circle cx="8" cy="14" r="1" fill="#FFEB3B"/><path d="M16 14 Q18 4 24 8" stroke="#FFD54F" stroke-width="1.5" fill="none"/></svg>`;
}

export function iconSave(size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><rect x="3" y="3" width="18" height="18" rx="2" fill="#90CAF9" stroke="#1976D2" stroke-width="1.5"/><rect x="6" y="3" width="12" height="8" rx="1" fill="#BBDEFB" stroke="#1976D2" stroke-width="1"/><rect x="9" y="14" width="6" height="7" rx="1" fill="#1976D2"/></svg>`;
}

export function iconBack(size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><path d="M15 4 L7 12 L15 20" stroke="#5C6BC0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function iconNext(size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><path d="M9 4 L17 12 L9 20" stroke="#5C6BC0" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function iconHome(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M6 20 L20 8 L34 20" fill="none" stroke="#8D6E63" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="12" y="20" width="16" height="14" rx="2" fill="#FFCC80" stroke="#8D6E63" stroke-width="2"/><rect x="17" y="24" width="6" height="10" rx="1" fill="#8D6E63"/></svg>`;
}

export function iconReset(size = 18) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><path d="M4 12 A8 8 0 1 1 8 18" stroke="#FF7043" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M4 8 L4 13 L9 13" stroke="#FF7043" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}


// ─── Topic Category Icons ───

export function iconWortarten(size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><rect x="2" y="6" width="20" height="14" rx="2" fill="#E3F2FD" stroke="#1976D2" stroke-width="1.5"/><text x="12" y="17" text-anchor="middle" font-size="10" font-weight="bold" fill="#1565C0">Aa</text></svg>`;
}

export function iconSatzbau(size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><rect x="2" y="3" width="6" height="6" rx="1" fill="#FFCC80" stroke="#E65100" stroke-width="1"/><rect x="9" y="3" width="6" height="6" rx="1" fill="#A5D6A7" stroke="#2E7D32" stroke-width="1"/><rect x="16" y="3" width="6" height="6" rx="1" fill="#90CAF9" stroke="#1565C0" stroke-width="1"/><rect x="2" y="14" width="20" height="6" rx="2" fill="#FFF9C4" stroke="#F9A825" stroke-width="1.5"/></svg>`;
}

export function iconRechtschreibung(size = 20) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}"><path d="M6 20 L4 4 L8 4" fill="none" stroke="#FFB300" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 4 L12 16 L16 4" fill="none" stroke="#FFB300" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="4" x2="20" y2="4" stroke="#FFB300" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="18" r="4" fill="#FF5252" stroke="#C62828" stroke-width="1.5"/></svg>`;
}


// ─── Class Level Icons ───

export function iconSeedling(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M20 36 L20 20" stroke="#4CAF50" stroke-width="3" stroke-linecap="round"/><path d="M20 20 Q12 14 20 8 Q28 14 20 20" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.5"/><path d="M20 26 Q14 22 20 18" fill="none" stroke="#81C784" stroke-width="2"/></svg>`;
}

export function iconStar2(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M20 4 L23 15 L34 15 L25 22 L28 33 L20 26 L12 33 L15 22 L6 15 L17 15Z" fill="#FFD54F" stroke="#F9A825" stroke-width="1.5"/></svg>`;
}

export function iconBooks(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><rect x="6" y="8" width="10" height="28" rx="2" fill="#90CAF9" stroke="#1976D2" stroke-width="1.5" transform="rotate(-5 11 22)"/><rect x="14" y="6" width="10" height="28" rx="2" fill="#A5D6A7" stroke="#388E3C" stroke-width="1.5"/><rect x="22" y="8" width="10" height="28" rx="2" fill="#FFCC80" stroke="#E65100" stroke-width="1.5" transform="rotate(5 27 22)"/></svg>`;
}

export function iconRocket(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M20 4 Q14 16 14 28 L20 32 L26 28 Q26 16 20 4Z" fill="#E0E0E0" stroke="#757575" stroke-width="1.5"/><circle cx="20" cy="18" r="3" fill="#90CAF9" stroke="#1976D2" stroke-width="1"/><path d="M14 24 L8 30 L14 28" fill="#FF7043"/><path d="M26 24 L32 30 L26 28" fill="#FF7043"/><path d="M17 32 L20 38 L23 32" fill="#FFD54F"/></svg>`;
}

export function iconTrophy(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M12 8 L12 20 Q12 28 20 28 Q28 28 28 20 L28 8Z" fill="#FFD54F" stroke="#F9A825" stroke-width="2"/><path d="M12 12 Q4 12 4 18 Q4 22 12 20" fill="#FFECB3" stroke="#F9A825" stroke-width="1.5"/><path d="M28 12 Q36 12 36 18 Q36 22 28 20" fill="#FFECB3" stroke="#F9A825" stroke-width="1.5"/><rect x="16" y="28" width="8" height="4" fill="#8D6E63"/><rect x="12" y="32" width="16" height="4" rx="2" fill="#8D6E63"/></svg>`;
}

export function iconMask(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M4 16 Q4 8 20 8 Q36 8 36 16 L36 22 Q36 32 20 32 Q4 32 4 22Z" fill="#CE93D8" stroke="#8E24AA" stroke-width="2"/><ellipse cx="14" cy="18" rx="6" ry="5" fill="#FFF"/><ellipse cx="26" cy="18" rx="6" ry="5" fill="#FFF"/><circle cx="14" cy="18" r="3" fill="#2D1B0E"/><circle cx="26" cy="18" r="3" fill="#2D1B0E"/></svg>`;
}


// ─── Medal Icons for Results ───

export function iconGold(size = 32) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><circle cx="20" cy="24" r="14" fill="#FFD54F" stroke="#F9A825" stroke-width="2"/><circle cx="20" cy="24" r="9" fill="#FFECB3" stroke="#F9A825" stroke-width="1"/><text x="20" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#E65100">1</text><path d="M14 10 L20 4 L26 10" fill="none" stroke="#F9A825" stroke-width="2"/></svg>`;
}

export function iconSilver(size = 32) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><circle cx="20" cy="24" r="14" fill="#E0E0E0" stroke="#9E9E9E" stroke-width="2"/><circle cx="20" cy="24" r="9" fill="#F5F5F5" stroke="#BDBDBD" stroke-width="1"/><text x="20" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#616161">2</text><path d="M14 10 L20 4 L26 10" fill="none" stroke="#9E9E9E" stroke-width="2"/></svg>`;
}

export function iconBronze(size = 32) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><circle cx="20" cy="24" r="14" fill="#FFCC80" stroke="#E65100" stroke-width="2"/><circle cx="20" cy="24" r="9" fill="#FFE0B2" stroke="#F57C00" stroke-width="1"/><text x="20" y="28" text-anchor="middle" font-size="12" font-weight="bold" fill="#BF360C">3</text><path d="M14 10 L20 4 L26 10" fill="none" stroke="#E65100" stroke-width="2"/></svg>`;
}


// ─── Preset Icons ───

export function iconPresetEasy(size = 24) {
  return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><rect x="4" y="8" width="32" height="24" rx="4" fill="#E8F5E9" stroke="#4CAF50" stroke-width="2"/><path d="M12 20 L18 26 L30 14" stroke="#2E7D32" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}


// ─── Utility: get field icon by type ───

export function getFieldIcon(type, size = 24) {
  const map = {
    normal: iconTask,
    challenge: iconChallenge,
    team: iconTeam,
    reward: iconReward,
    surprise: iconSurprise,
    helper: iconHelper,
    movement: iconMovement,
    treasure: iconTreasure,
    trap: iconTrap,
    portal: iconPortal,
    start: iconStart,
    finish: iconFinish,
  };
  const fn = map[type] || iconTask;
  return fn(size);
}

// ─── Utility: get avatar SVG by index ───

export function getAvatarSVG(index, size = 40) {
  const avatars = [foxSVG, frogSVG, lionSVG, catSVG, bunnySVG, bearSVG];
  const fn = avatars[index % avatars.length];
  return fn(size);
}

// ─── Utility: get avatar name ───

export function getAvatarName(index) {
  return PLAYER_AVATARS[index % PLAYER_AVATARS.length].name;
}

export function getAvatarColor(index) {
  return PLAYER_AVATARS[index % PLAYER_AVATARS.length].color;
}
