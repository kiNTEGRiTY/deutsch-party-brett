/**
 * Mini-Game: Gender Sort (Genus-Sortierer)
 * Drag nouns into the correct der/die/das bins.
 */

export const GenderSort = {
  id: 'gender-sort',
  name_de: 'Genus-Sortierer',
  topics: ['artikel', 'nomen'],

  setup(container, task, onComplete) {
    const wordBank = [
      { word: 'Hund', gender: 'der' }, { word: 'Katze', gender: 'die' }, { word: 'Haus', gender: 'das' },
      { word: 'Baum', gender: 'der' }, { word: 'Blume', gender: 'die' }, { word: 'Buch', gender: 'das' },
      { word: 'Vogel', gender: 'der' }, { word: 'Sonne', gender: 'die' }, { word: 'Auto', gender: 'das' }
    ];
    const queue = [...wordBank].sort(() => Math.random() - 0.5).slice(0, 5);
    let currentIdx = 0;
    let score = 0;

    container.innerHTML = `
      <div style="padding:var(--space-md); text-align:center; user-select:none;">
        <p style="color:var(--text-secondary); margin-bottom:5px;">
          Welcher Artikel gehört dazu?
        </p>
        <div id="score-bar" style="font-size:1rem; font-weight:bold; margin-bottom:20px; color:#3498db;">0/${queue.length}</div>

        <!-- Word Display -->
        <div id="current-word" style="font-size:3rem; font-weight:900; font-family:'Fredoka One',cursive; margin-bottom:30px; color:#2c3e50; letter-spacing:2px; transition:all 0.2s;">
          ${queue[0].word}
        </div>

        <!-- 3 Bins -->
        <div style="display:flex; gap:15px; justify-content:center;">
          ${['der', 'die', 'das'].map(g => `
            <button class="gender-btn" data-gender="${g}" style="
              flex:1; max-width:100px; padding:20px 10px; border-radius:12px; font-size:1.4rem; font-weight:bold;
              background:${g==='der'?'#3498db':g==='die'?'#e74c3c':'#2ecc71'}; color:white; border:none;
              box-shadow:0 6px 0 ${g==='der'?'#2980b9':g==='die'?'#c0392b':'#27ae60'}; cursor:pointer; transition:transform 0.1s;">
              ${g}
            </button>
          `).join('')}
        </div>
      </div>`;

    const wordEl = container.querySelector('#current-word');
    const scoreEl = container.querySelector('#score-bar');

    container.querySelectorAll('.gender-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = queue[currentIdx];
        const isCorrect = btn.dataset.gender === current.gender;

        if (isCorrect) {
          score++;
          wordEl.style.color = '#2ecc71';
          btn.style.transform = 'translateY(6px)';
          btn.style.boxShadow = 'none';
        } else {
          wordEl.style.color = '#e74c3c';
          wordEl.textContent = `${current.gender} ${current.word}`;
        }

        scoreEl.textContent = `${score}/${queue.length}`;
        
        setTimeout(() => {
          currentIdx++;
          if (currentIdx >= queue.length) {
            onComplete({ correct: score >= Math.ceil(queue.length * 0.7), score: Math.round((score/queue.length)*100) });
          } else {
            wordEl.style.color = '#2c3e50';
            wordEl.textContent = queue[currentIdx].word;
            container.querySelectorAll('.gender-btn').forEach(b => {
              const g = b.dataset.gender;
              b.style.transform = '';
              b.style.boxShadow = `0 6px 0 ${g==='der'?'#2980b9':g==='die'?'#c0392b':'#27ae60'}`;
            });
          }
        }, 900);
      });
    });
  }
};
