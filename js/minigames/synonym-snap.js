/**
 * Mini-Game: Synonym Snap (Synonym-Schnapper)
 * Find the word with the same meaning by swiping right or left.
 */

export const SynonymSnap = {
  id: 'synonym-snap',
  name_de: 'Synonym-Schnapper',
  topics: ['wortschatz'],

  setup(container, task, onComplete) {
    const synonymPairs = [
      { word: 'beginnen', synonym: 'anfangen', distractors: ['aufhören', 'schlafen', 'laufen'] },
      { word: 'schön', synonym: 'hübsch', distractors: ['hässlich', 'klein', 'laut'] },
      { word: 'schnell', synonym: 'flink', distractors: ['langsam', 'leise', 'müde'] },
      { word: 'traurig', synonym: 'betrübt', distractors: ['fröhlich', 'mutig', 'groß'] },
      { word: 'sprechen', synonym: 'reden', distractors: ['rennen', 'essen', 'schlafen'] }
    ];

    const selected = [...synonymPairs].sort(() => Math.random() - 0.5).slice(0, 4);
    let currentIdx = 0;
    let score = 0;

    function renderRound() {
      const current = selected[currentIdx];
      const options = [current.synonym, ...current.distractors].sort(() => Math.random() - 0.5);

      container.innerHTML = `
        <div style="padding:var(--space-md); text-align:center; user-select:none; max-width:500px; margin:0 auto;">
          <div style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:5px;">${currentIdx+1}/${selected.length} - Punkte: ${score}</div>
          <p style="color:var(--text-secondary); margin-bottom:15px;">Welches Wort bedeutet dasselbe?</p>
          
          <div style="font-size:2.8rem; font-weight:900; font-family:'Fredoka One',cursive; background:linear-gradient(135deg,#9b59b6,#3498db); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:30px;">
            ${current.word}
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            ${options.map(opt => `
              <button class="syn-btn" data-opt="${opt}" style="
                padding:16px; font-size:1.1rem; border-radius:12px; border:none; cursor:pointer;
                background:white; color:#2c3e50; font-weight:bold;
                box-shadow:0 4px 0 #bdc3c7; transition:all 0.15s;">${opt}</button>
            `).join('')}
          </div>
        </div>`;

      container.querySelectorAll('.syn-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.syn-btn').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = btn.dataset.opt === current.synonym;
          btn.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
          btn.style.color = 'white';
          btn.style.boxShadow = 'none';
          if (!isCorrect) {
            const correct = [...container.querySelectorAll('.syn-btn')].find(b => b.dataset.opt === current.synonym);
            if (correct) { correct.style.background = '#2ecc71'; correct.style.color = 'white'; }
          }
          if (isCorrect) score++;
          setTimeout(() => {
            currentIdx++;
            if (currentIdx >= selected.length) {
              onComplete({ correct: score >= Math.ceil(selected.length * 0.6), score: Math.round((score/selected.length)*100) });
            } else renderRound();
          }, 1000);
        });
      });
    }
    renderRound();
  }
};
