/**
 * Mini-Game: Word Search Swipe (Buchstaben-Suppe)
 * Mobile-style swipeable word search grid.
 */

export const WordSearchSwipe = {
  id: 'word-search-swipe',
  name_de: 'Buchstaben-Suppe',
  topics: ['rechtschreibung', 'wortschatz'],

  setup(container, task, onComplete) {
    const HIDDEN_WORDS = ['HUND', 'KATZE', 'MAUS', 'BAUM', 'AUTO'];
    const GRID_SIZE = 9;
    const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
    const placed = [];
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Place words horizontally
    const wordsToPick = [...HIDDEN_WORDS].sort(() => Math.random() - 0.5).slice(0, 3);
    for (const word of wordsToPick) {
      let placed_ok = false;
      for (let attempt = 0; attempt < 50 && !placed_ok; attempt++) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * (GRID_SIZE - word.length));
        let conflict = false;
        for (let i = 0; i < word.length; i++) {
          if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) { conflict = true; break; }
        }
        if (!conflict) {
          for (let i = 0; i < word.length; i++) grid[row][col + i] = word[i];
          placed.push({ word, row, col, dir: 'h', cells: word.split('').map((_, i) => `${row}-${col + i}`) });
          placed_ok = true;
        }
      }
    }

    // Fill blanks
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++)
        if (!grid[r][c]) grid[r][c] = LETTERS[Math.floor(Math.random() * LETTERS.length)];

    let foundWords = new Set();
    let swipeStart = null;
    let currentSwipe = [];
    let isDragging = false;

    container.innerHTML = `
      <div style="padding:var(--space-sm); text-align:center; user-select:none; touch-action:none;">
        <p style="font-size:1rem; color:var(--text-secondary); margin-bottom:10px;">
          Suche: ${wordsToPick.map(w => `<b id="word-${w}" style="margin:0 5px;">${w}</b>`).join('')}
        </p>
        <div id="ws-grid" style="display:inline-grid; grid-template-columns:repeat(${GRID_SIZE},1fr); gap:3px; background:#ecf0f1; padding:10px; border-radius:12px; cursor:crosshair;"></div>
        <div id="ws-progress" style="margin-top:10px; font-weight:bold; color:#2ecc71;"></div>
      </div>`;

    const gridEl = container.querySelector('#ws-grid');
    const cells = [];

    // Build cells
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = document.createElement('div');
        cell.textContent = grid[r][c];
        cell.dataset.key = `${r}-${c}`;
        cell.dataset.r = r; cell.dataset.c = c;
        Object.assign(cell.style, {
          width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: '0.9rem', background: 'white', borderRadius: '4px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)', transition: 'background 0.1s'
        });
        gridEl.appendChild(cell);
        cells.push(cell);
      }
    }

    function cellAtPoint(x, y) {
      return cells.find(c => {
        const r = c.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
      });
    }

    function highlight(cell, active) {
      cell.style.background = active ? '#f1c40f' : 'white';
    }

    function checkMatch() {
      const swipedKeys = currentSwipe.map(c => c.dataset.key);
      const swipedWord = currentSwipe.map(c => c.textContent).join('');
      currentSwipe.forEach(c => highlight(c, false));

      const match = placed.find(p => p.word === swipedWord && JSON.stringify(p.cells) === JSON.stringify(swipedKeys));
      if (match && !foundWords.has(match.word)) {
        foundWords.add(match.word);
        match.cells.forEach(key => {
          const cell = cells.find(c => c.dataset.key === key);
          if (cell) { cell.style.background = '#2ecc71'; cell.style.color = 'white'; }
        });
        const wordLabel = container.querySelector(`#word-${match.word}`);
        if (wordLabel) { wordLabel.style.textDecoration = 'line-through'; wordLabel.style.color = '#95a5a6'; }
        container.querySelector('#ws-progress').textContent = `${foundWords.size}/${wordsToPick.length} gefunden!`;

        if (foundWords.size === wordsToPick.length) {
          setTimeout(() => onComplete({ correct: true, score: 100 }), 1000);
        }
      }
    }

    gridEl.addEventListener('pointerdown', e => {
      e.preventDefault();
      isDragging = true;
      currentSwipe = [];
      const cell = cellAtPoint(e.clientX, e.clientY);
      if (cell) { currentSwipe.push(cell); highlight(cell, true); }
    });

    gridEl.addEventListener('pointermove', e => {
      if (!isDragging) return;
      const cell = cellAtPoint(e.clientX, e.clientY);
      if (cell && !currentSwipe.includes(cell)) {
        currentSwipe.push(cell);
        highlight(cell, true);
      }
    });

    gridEl.addEventListener('pointerup', e => {
      isDragging = false;
      checkMatch();
      currentSwipe = [];
    });
  }
};
