function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderRainbowText(text, { className = '' } = {}) {
  const safeText = String(text ?? '');
  const letters = Array.from(safeText);
  const classes = ['rainbow-text', className].filter(Boolean).join(' ');

  return `
    <span class="${classes}" aria-label="${escapeHtml(safeText)}">
      ${letters.map((letter, index) => {
        if (letter === ' ') {
          return '<span class="rainbow-space">&nbsp;</span>';
        }

        return `<span class="rainbow-letter rainbow-letter--${index % 8}">${escapeHtml(letter)}</span>`;
      }).join('')}
    </span>
  `;
}
