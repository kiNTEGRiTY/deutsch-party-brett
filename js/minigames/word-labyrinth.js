/**
 * Mini-Game: Word Labyrinth (Wort-Labyrinth)
 * Navigate a grid to collect the letters of a word in order.
 */
export const WordLabyrinth = {
  id: 'word-labyrinth',
  name_de: 'Wort-Labyrinth',
  topics: ['rechtschreibung', 'konzentration'],
  setup(container, task, onComplete) {
    const words = ['HUND', 'HAUS', 'AUTO', 'BAUM'];
    const target = words[Math.floor(Math.random() * words.length)];
    const SIZE = 5;
    
    // Build grid with target letters placed, rest random
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Place target letters along a random path
    let path = [];
    let r = Math.floor(Math.random() * SIZE), c = Math.floor(Math.random() * SIZE);
    path.push([r, c]);
    
    for (let i = 1; i < target.length; i++) {
      const dirs = [[-1,0],[1,0],[0,-1],[0,1]].sort(() => Math.random() - 0.5);
      let moved = false;
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !path.some(([pr,pc]) => pr===nr && pc===nc)) {
          r = nr; c = nc; path.push([r, c]); moved = true; break;
        }
      }
      if (!moved) break; // Just place it nearby anyway
    }
    
    path.forEach(([pr, pc], i) => { if (i < target.length) grid[pr][pc] = target[i]; });
    for (let rr = 0; rr < SIZE; rr++) for (let cc = 0; cc < SIZE; cc++) {
      if (!grid[rr][cc]) grid[rr][cc] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }

    let collected = '';
    let playerPos = [...path[0]];

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-sm);text-align:center;user-select:none;max-width:400px;margin:0 auto;">
          <p style="color:var(--text-secondary);margin-bottom:5px;font-size:.9rem;">Sammle: <b style="font-size:1.4rem;letter-spacing:4px;">${target}</b></p>
          <p style="color:#3498db;font-weight:bold;margin-bottom:10px;">Gesammelt: <b>${collected || '...'}</b></p>
          <div style="display:grid;grid-template-columns:repeat(${SIZE},1fr);gap:4px;margin-bottom:15px;">
            ${Array.from({length:SIZE},(_,rr)=>Array.from({length:SIZE},(_,cc)=>{
              const isPlayer = playerPos[0]===rr && playerPos[1]===cc;
              const isPath = path.some(([pr,pc],i) => pr===rr && pc===cc && i < collected.length);
              return `<div class="lab-cell" data-r="${rr}" data-c="${cc}" style="
                width:52px;height:52px;display:flex;align-items:center;justify-content:center;
                font-size:1.1rem;font-weight:bold;border-radius:8px;cursor:pointer;
                background:${isPlayer?'#e74c3c':isPath?'#2ecc71':'#ecf0f1'};
                color:${isPlayer||isPath?'white':'#2c3e50'};
                box-shadow:${isPlayer?'0 0 0 3px #c0392b':isPath?'none':'0 2px 0 #bdc3c7'};
              ">${grid[rr][cc]}</div>`;
            }).join('')).join('')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);max-width:160px;margin:0 auto;gap:4px;">
            <div></div>
            <button class="nav-btn" data-dr="-1" data-dc="0" style="padding:10px;border-radius:8px;border:none;background:#3498db;color:white;cursor:pointer;font-size:1.2rem;">▲</button>
            <div></div>
            <button class="nav-btn" data-dr="0" data-dc="-1" style="padding:10px;border-radius:8px;border:none;background:#3498db;color:white;cursor:pointer;font-size:1.2rem;">◄</button>
            <div style="background:#ecf0f1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:#7f8c8d;">👾</div>
            <button class="nav-btn" data-dr="0" data-dc="1" style="padding:10px;border-radius:8px;border:none;background:#3498db;color:white;cursor:pointer;font-size:1.2rem;">►</button>
            <div></div>
            <button class="nav-btn" data-dr="1" data-dc="0" style="padding:10px;border-radius:8px;border:none;background:#3498db;color:white;cursor:pointer;font-size:1.2rem;">▼</button>
            <div></div>
          </div>
        </div>`;

      container.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const dr = parseInt(btn.dataset.dr), dc = parseInt(btn.dataset.dc);
          const nr = playerPos[0] + dr, nc = playerPos[1] + dc;
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) return;
          playerPos = [nr, nc];
          const letter = grid[nr][nc];
          const expected = target[collected.length];
          if (letter === expected) {
            collected += letter;
            if (collected === target) {
              render();
              setTimeout(() => onComplete({ correct: true, score: 100 }), 800);
              return;
            }
          }
          render();
        });
      });
    }
    render();
  }
};
