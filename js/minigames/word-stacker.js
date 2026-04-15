/**
 * Mini-Game: Word Stacker (Wörter-Stapler)
 * Stack words in the correct order to build a sentence.
 */
export const WordStacker = {
  id: 'word-stacker',
  name_de: 'Wörter-Stapler',
  topics: ['satzbau'],
  setup(container, task, onComplete) {
    const sentences = [
      { words: ['Ich', 'gehe', 'heute', 'in', 'die', 'Schule.'], order: [0, 1, 2, 3, 4, 5] },
      { words: ['Der', 'Hund', 'spielt', 'mit', 'dem', 'Ball.'], order: [0, 1, 2, 3, 4, 5] }
    ];
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    const shuffled = [...s.words].map((w, i) => ({ w, i })).sort(() => Math.random() - 0.5);
    const stacked = [];

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <p style="color:var(--text-secondary);margin-bottom:20px;">Staple die Wörter in der richtigen Reihenfolge!</p>
          <div id="ws-stack" style="min-height:100px;display:flex;flex-direction:column-reverse;gap:5px;margin-bottom:30px;background:rgba(0,0,0,0.05);padding:10px;border-radius:10px;border:2px dashed #bdc3c7;">
            ${stacked.map(w => `<div style="background:#3498db;color:white;padding:10px;border-radius:5px;font-weight:bold;">${w.w}</div>`).join('')}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
            ${shuffled.map(w => `<button class="ws-btn" data-idx="${w.i}" style="padding:10px 20px;background:white;border:2px solid #3498db;border-radius:5px;color:#3498db;font-weight:bold;cursor:pointer;">${w.w}</button>`).join('')}
          </div>
          ${stacked.length === s.words.length ? `<button id="ws-check" class="btn btn-primary" style="margin-top:20px;width:100%;">Überprüfen</button>` : ''}
        </div>`;

      container.querySelectorAll('.ws-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx);
          const word = shuffled.find(w => w.i === idx);
          stacked.push(word);
          shuffled.splice(shuffled.indexOf(word), 1);
          render();
        };
      });

      container.querySelector('#ws-check')?.addEventListener('click', () => {
        const isCorrect = stacked.every((w, i) => w.i === s.order[i]);
        container.querySelector('#ws-check').style.background = isCorrect ? '#2ecc71' : '#e74c3c';
        setTimeout(() => onComplete({ correct: isCorrect, score: isCorrect ? 100 : 0 }), 1000);
      });
    }
    render();
  }
};
