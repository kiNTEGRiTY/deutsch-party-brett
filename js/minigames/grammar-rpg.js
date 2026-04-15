/**
 * Masterpiece: Grammar RPG (Das Labyrinth der Regeln)
 * A tile-based dungeon crawler where you move a character and solve riddles to advance.
 */
export const GrammarRPG = {
  id: 'grammar-rpg',
  name_de: 'Grammatik-Abenteuer',
  topics: ['grammatik', 'wortschatz', 'konzentration'],
  setup(container, task, onComplete) {
    const SIZE = 5;
    let playerPos = { x: 0, y: 0 };
    let exitPos = { x: 4, y: 4 };
    let shrinesFound = 0;
    const shrines = [
      { x: 2, y: 0, solved: false, q: 'Was ist der Artikel von "Baum"?', a: 'der', opts: ['der', 'die', 'das'] },
      { x: 0, y: 2, solved: false, q: 'Welches Wort ist ein Verb?', a: 'laufen', opts: ['blau', 'laufen', 'Hund'] },
      { x: 3, y: 3, solved: false, q: 'Was ist das Gegenteil von "laut"?', a: 'leise', opts: ['leise', 'schnell', 'kalt'] }
    ];

    function render() {
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:var(--space-md);max-width:500px;margin:0 auto;text-align:center;user-select:none;touch-action:none;';

      wrapper.innerHTML = `
        <div style="font-size:1.5rem;margin-bottom:10px;">🦊 Grammatik-Entdecker</div>
        <p style="color:var(--text-secondary);font-size:0.9rem;margin-bottom:20px;">Finde alle 3 Schreine (💎), um das goldene Tor (🚪) zu öffnen!</p>
        
        <div id="rpg-grid" style="display:grid;grid-template-columns:repeat(${SIZE}, 1fr);gap:4px;background:#34495e;padding:4px;border-radius:12px;margin-bottom:25px;aspect-ratio:1/1;">
          ${Array.from({ length: SIZE * SIZE }).map((_, i) => {
            const x = i % SIZE;
            const y = Math.floor(i / SIZE);
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const shrine = shrines.find(s => s.x === x && s.y === y);
            const isExit = exitPos.x === x && exitPos.y === y;
            let content = '';
            if (isPlayer) content = '🦊';
            else if (shrine) content = shrine.solved ? '✅' : '💎';
            else if (isExit) content = shrinesFound === 3 ? '🚪' : '🔒';
            
            return `<div class="rpg-tile" data-x="${x}" data-y="${y}" style="background:#2c3e50;display:flex;align-items:center;justify-content:center;font-size:2rem;border-radius:6px;cursor:pointer;">${content}</div>`;
          }).join('')}
        </div>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;width:180px;margin:0 auto;">
          <div></div>
          <button class="nav-btn" data-dir="up" style="padding:15px;background:#3498db;color:white;border:none;border-radius:10px;">⬆️</button>
          <div></div>
          <button class="nav-btn" data-dir="left" style="padding:15px;background:#3498db;color:white;border:none;border-radius:10px;">⬅️</button>
          <button class="nav-btn" data-dir="down" style="padding:15px;background:#3498db;color:white;border:none;border-radius:10px;">⬇️</button>
          <button class="nav-btn" data-dir="right" style="padding:15px;background:#3498db;color:white;border:none;border-radius:10px;">➡️</button>
        </div>
      `;

      wrapper.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => {
          const dir = btn.dataset.dir;
          let nx = playerPos.x;
          let ny = playerPos.y;
          if (dir === 'up') ny--;
          if (dir === 'down') ny++;
          if (dir === 'left') nx--;
          if (dir === 'right') nx++;
          
          if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
            playerPos = { x: nx, y: ny };
            checkInteraction();
            render();
          }
        };
      });

      container.appendChild(wrapper);
    }

    function checkInteraction() {
      const shrine = shrines.find(s => s.x === playerPos.x && s.y === playerPos.y);
      if (shrine && !shrine.solved) {
        showShrinePuzzle(shrine);
      } else if (playerPos.x === exitPos.x && playerPos.y === exitPos.y && shrinesFound === 3) {
        onComplete({ correct: true, score: 100 });
      }
    }

    function showShrinePuzzle(shrine) {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000;padding:20px;text-align:center;border-radius:16px;';
      overlay.innerHTML = `
        <div style="font-size:3rem;margin-bottom:20px;">💎 Schrein gefunden!</div>
        <p style="font-size:1.3rem;margin-bottom:30px;">${shrine.q}</p>
        <div style="display:grid;grid-template-columns:1fr;gap:15px;width:100%;max-width:300px;">
          ${shrine.opts.map(o => `<button class="shrine-opt" style="padding:15px;background:#3498db;color:white;border:none;border-radius:10px;font-weight:bold;font-size:1.1rem;cursor:pointer;">${o}</button>`).join('')}
        </div>
      `;
      overlay.querySelectorAll('.shrine-opt').forEach(btn => {
        btn.onclick = () => {
          if (btn.textContent === shrine.a) {
            shrine.solved = true;
            shrinesFound++;
            container.removeChild(overlay);
            render();
          } else {
            btn.style.background = '#e74c3c';
            setTimeout(() => { btn.style.background = '#3498db'; }, 600);
          }
        };
      });
      container.appendChild(overlay);
    }

    render();
  }
};
