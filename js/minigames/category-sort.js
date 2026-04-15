/**
 * Mini-Game: Category Sort (Sortier-Meister)
 * Drag words left/right into two categories.
 */
export const CategorySort = {
  id: 'category-sort',
  name_de: 'Sortier-Meister',
  topics: ['wortschatz', 'nomen', 'verben'],
  setup(container, task, onComplete) {
    const games = [
      { left: 'Tiere', right: 'Pflanzen', words: ['Hund', 'Rose', 'Katze', 'Eiche', 'Vogel', 'Tulpe'], leftWords: ['Hund','Katze','Vogel'], rightWords: ['Rose','Eiche','Tulpe'] },
      { left: 'Nomen', right: 'Verben', words: ['Haus', 'laufen', 'Baum', 'essen', 'Kind', 'schlafen'], leftWords: ['Haus','Baum','Kind'], rightWords: ['laufen','essen','schlafen'] }
    ];
    const g = games[Math.floor(Math.random() * games.length)];
    const queue = [...g.words].sort(() => Math.random() - 0.5);
    let idx = 0, score = 0;

    function renderRound() {
      if (idx >= queue.length) {
        onComplete({ correct: score >= Math.ceil(queue.length * 0.7), score: Math.round((score/queue.length)*100) });
        return;
      }
      const word = queue[idx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:5px;">${idx+1}/${queue.length} - Score: ${score}</div>
          <div style="font-size:3rem;font-weight:900;font-family:'Fredoka One',cursive;color:#2c3e50;margin:30px 0;">${word}</div>
          <div style="display:flex;gap:15px;justify-content:center;">
            <button id="left-btn" class="btn" style="flex:1;max-width:160px;padding:20px 10px;border-radius:12px;font-size:1.2rem;font-weight:bold;background:#3498db;color:white;border:none;box-shadow:0 6px 0 #2980b9;cursor:pointer;">
              ← ${g.left}
            </button>
            <button id="right-btn" class="btn" style="flex:1;max-width:160px;padding:20px 10px;border-radius:12px;font-size:1.2rem;font-weight:bold;background:#e74c3c;color:white;border:none;box-shadow:0 6px 0 #c0392b;cursor:pointer;">
              ${g.right} ->
            </button>
          </div>
        </div>`;

      function handle(isLeft) {
        container.querySelectorAll('button').forEach(b => b.style.pointerEvents='none');
        const isCorrect = isLeft ? g.leftWords.includes(word) : g.rightWords.includes(word);
        if (isCorrect) score++;
        const target = document.getElementById(isLeft ? 'left-btn' : 'right-btn');
        target.style.boxShadow = 'none';
        target.style.transform = 'translateY(6px)';
        target.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
        setTimeout(() => { idx++; renderRound(); }, 900);
      }
      document.getElementById('left-btn').addEventListener('click', () => handle(true));
      document.getElementById('right-btn').addEventListener('click', () => handle(false));
    }
    renderRound();
  }
};
