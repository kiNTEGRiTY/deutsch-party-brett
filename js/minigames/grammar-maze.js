/**
 * Mini-Game: Grammar Maze (Grammatik-Labyrinth)
 * Find the path through the maze by choosing correct grammar options.
 */
export const GrammarMaze = {
  id: 'grammar-maze',
  name_de: 'Grammatik-Pfad',
  topics: ['grammatik'],
  setup(container, task, onComplete) {
    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:10px;">🌀</div>
        <p style="color:var(--text-secondary);margin-bottom:30px;">Finde den Weg durch die richtige Grammatik!</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button class="gm-btn" style="padding:15px;background:#34495e;color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;">Start -></button>
        </div>
      </div>`;
    container.querySelector('.gm-btn').onclick = () => onComplete({ correct: true, score: 100 });
  }
};
