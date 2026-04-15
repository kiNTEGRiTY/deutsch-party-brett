/**
 * Mini-Game: Sentence Scramble (Satz-Salat)
 * Unscramble the words to form a correct sentence.
 */
export const SentenceScramble = {
  id: 'sentence-scramble',
  name_de: 'Satz-Salat',
  topics: ['satzbau', 'lesen'],
  setup(container, task, onComplete) {
    const sentences = [
      'Der Apfel fällt nicht weit vom Stamm.',
      'Aller Anfang ist schwer.',
      'Übung macht den Meister.'
    ];
    const original = sentences[Math.floor(Math.random() * sentences.length)];
    const words = original.split(' ');
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const result = [];

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <p style="color:var(--text-secondary);margin-bottom:20px;">Bilde den richtigen Satz!</p>
          <div style="min-height:60px;background:white;padding:15px;border-radius:10px;margin-bottom:25px;border:2px solid #3498db;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
            ${result.map((w, i) => `<span class="res-word" data-idx="${i}" style="background:#3498db;color:white;padding:5px 12px;border-radius:5px;cursor:pointer;">${w}</span>`).join('')}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
            ${shuffled.map((w, i) => `<button class="scr-btn" data-idx="${i}" style="padding:10px 18px;background:#ecf0f1;border:none;border-radius:5px;color:#2c3e50;font-weight:bold;cursor:pointer;">${w}</button>`).join('')}
          </div>
          <button id="scr-check" class="btn btn-primary" style="margin-top:25px;width:100%;" ${shuffled.length > 0 ? 'disabled' : ''}>Überprüfen</button>
        </div>`;

      container.querySelectorAll('.scr-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx);
          result.push(shuffled[idx]);
          shuffled.splice(idx, 1);
          render();
        };
      });

      container.querySelectorAll('.res-word').forEach(word => {
        word.onclick = () => {
          const idx = parseInt(word.dataset.idx);
          shuffled.push(result[idx]);
          result.splice(idx, 1);
          render();
        };
      });

      container.querySelector('#scr-check')?.addEventListener('click', () => {
        const formed = result.join(' ');
        const isCorrect = formed === original;
        container.querySelector('#scr-check').style.background = isCorrect ? '#2ecc71' : '#e74c3c';
        setTimeout(() => onComplete({ correct: isCorrect, score: isCorrect ? 100 : 0 }), 1200);
      });
    }
    render();
  }
};
