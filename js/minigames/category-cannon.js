/**
 * Mini-Game: Category Cannon (Kategorie-Kanone)
 * Shoot the word into the correct category bin.
 */
export const CategoryCannon = {
  id: 'category-cannon',
  name_de: 'Kategorie-Kanone',
  topics: ['wortschatz'],
  setup(container, task, onComplete) {
    const word = 'Apfel';
    const categories = ['Obst', 'Gemüse'];
    
    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:10px;">🚀</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Schieße den <b>${word}</b> in die richtige Tonne!</p>
        <div style="display:flex;justify-content:center;gap:20px;">
          <button class="cc-btn" data-c="Obst" style="padding:20px;background:#2ecc71;color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;">Obst</button>
          <button class="cc-btn" data-c="Gemüse" style="padding:20px;background:#e67e22;color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;">Gemüse</button>
        </div>
      </div>`;
    
    container.querySelectorAll('.cc-btn').forEach(btn => {
      btn.onclick = () => {
        const correct = btn.dataset.c === 'Obst';
        onComplete({ correct, score: correct ? 100 : 0 });
      };
    });
  }
};
