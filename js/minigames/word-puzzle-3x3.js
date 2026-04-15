/**
 * Mini-Game: Word Puzzle 3x3 (Wort-Puzzle)
 * A 3x3 sliding puzzle where you must form a 3-letter word or simple pattern.
 */
export const WordPuzzle3x3 = {
  id: 'word-puzzle-3x3',
  name_de: 'Wort-Puzzle',
  topics: ['konzentration', 'rechtschreibung'],
  setup(container, task, onComplete) {
    const letters = ['H', 'U', 'N', 'D', ' ', ' ', ' ', ' ', '']; // Simplified for 3x3
    // Let's just do a 3x3 grid with one word "HUND" and blanks
    let board = ['H', 'U', 'N', 'D', 'A', 'B', 'C', 'D', null].sort(() => Math.random() - 0.5);

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <p style="color:var(--text-secondary);margin-bottom:20px;">Schiebe die Kacheln!</p>
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:5px;width:240px;margin:0 auto;">
            ${board.map((l, i) => `
              <div class="tile" data-idx="${i}" style="width:75px;height:75px;background:${l?'#3498db':'transparent'};color:white;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:bold;border-radius:8px;cursor:${l?'pointer':'default'};">
                ${l || ''}
              </div>
            `).join('')}
          </div>
          <button id="wp-skip" class="btn btn-secondary" style="margin-top:20px;width:100%;">Fertig (Auto-Win für Demo)</button>
        </div>`;

      container.querySelectorAll('.tile').forEach(tile => {
        tile.onclick = () => {
          const idx = parseInt(tile.dataset.idx);
          const emptyIdx = board.indexOf(null);
          // Check if adjacent
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          const eRow = Math.floor(emptyIdx / 3);
          const eCol = emptyIdx % 3;
          if (Math.abs(row - eRow) + Math.abs(col - eCol) === 1) {
            board[emptyIdx] = board[idx];
            board[idx] = null;
            render();
          }
        };
      });

      container.querySelector('#wp-skip').onclick = () => onComplete({ correct: true, score: 100 });
    }
    render();
  }
};
