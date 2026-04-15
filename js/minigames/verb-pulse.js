/**
 * Mini-Game: Verb Pulse (Verb-Konjugation)
 * Quick-fire verb conjugation - tap the right form for the given pronoun.
 */

export const VerbPulse = {
  id: 'verb-pulse',
  name_de: 'Verb-Puls',
  topics: ['verben', 'grammatik', 'zeitformen'],

  setup(container, task, onComplete) {
    const conjugations = [
      { verb: 'sein', pronoun: 'ich', correct: 'bin', options: ['bist', 'bin', 'ist', 'sind'] },
      { verb: 'haben', pronoun: 'du', correct: 'hast', options: ['haben', 'hat', 'hast', 'habe'] },
      { verb: 'gehen', pronoun: 'er', correct: 'geht', options: ['gehen', 'gehst', 'geht', 'gegangen'] },
      { verb: 'machen', pronoun: 'wir', correct: 'machen', options: ['macht', 'machst', 'machen', 'machte'] },
      { verb: 'laufen', pronoun: 'ich', correct: 'laufe', options: ['läuft', 'laufen', 'laufe', 'lief'] }
    ];

    const selected = [...conjugations].sort(() => Math.random() - 0.5).slice(0, 4);
    let currentIdx = 0;
    let score = 0;

    function renderRound() {
      const current = selected[currentIdx];
      const options = [...current.options].sort(() => Math.random() - 0.5);

      container.innerHTML = `
        <div style="padding:var(--space-md); text-align:center; user-select:none; max-width:500px; margin:0 auto;">
          <div style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:15px;">${currentIdx+1}/${selected.length}</div>
          
          <div style="display:flex; align-items:center; justify-content:center; gap:15px; margin-bottom:30px; flex-wrap:wrap;">
            <div style="background:#e74c3c; color:white; padding:12px 24px; border-radius:20px; font-size:1.8rem; font-weight:bold; font-family:'Fredoka One',cursive;">
              ${current.pronoun}
            </div>
            <div style="font-size:1.8rem; color:#7f8c8d;">+</div>
            <div style="background:#3498db; color:white; padding:12px 24px; border-radius:20px; font-size:1.8rem; font-weight:bold; font-family:'Fredoka One',cursive;">
              ${current.verb}
            </div>
            <div style="font-size:1.8rem; color:#7f8c8d;">=</div>
            <div style="background:#ecf0f1; color:#7f8c8d; padding:12px 24px; border-radius:20px; font-size:1.8rem; font-weight:bold; border:2px dashed #bdc3c7;">
              ???
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            ${options.map(opt => `
              <button class="verb-btn" data-opt="${opt}" style="
                padding:16px; font-size:1.3rem; border-radius:12px; border:none; cursor:pointer;
                background:#34495e; color:white; font-weight:bold;
                box-shadow:0 4px 0 #2c3e50; transition:all 0.15s;">${opt}</button>
            `).join('')}
          </div>
        </div>`;

      container.querySelectorAll('.verb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.verb-btn').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = btn.dataset.opt === current.correct;
          btn.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
          btn.style.boxShadow = 'none';
          if (!isCorrect) {
            const correct = [...container.querySelectorAll('.verb-btn')].find(b => b.dataset.opt === current.correct);
            if (correct) { correct.style.background = '#2ecc71'; correct.style.boxShadow = 'none'; }
          }
          if (isCorrect) score++;
          setTimeout(() => {
            currentIdx++;
            if (currentIdx >= selected.length) {
              onComplete({ correct: score >= Math.ceil(selected.length * 0.6), score: Math.round((score/selected.length)*100) });
            } else renderRound();
          }, 1100);
        });
      });
    }
    renderRound();
  }
};
