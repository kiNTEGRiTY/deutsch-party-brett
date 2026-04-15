/**
 * Mini-Game: Word Pyramid (Wort-Pyramide)
 * Build a word from top to bottom.
 */
export const WordPyramid = {
  id: 'word-pyramid',
  name_de: 'Wort-Pyramide',
  topics: ['rechtschreibung'],
  setup(container, task, onComplete) {
    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:10px;">🧱</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <div style="background:#3498db;color:white;padding:10px 20px;border-radius:5px;font-weight:bold;">A</div>
          <div style="background:#3498db;color:white;padding:10px 40px;border-radius:5px;font-weight:bold;">AN</div>
          <div style="background:#3498db;color:white;padding:10px 60px;border-radius:5px;font-weight:bold;">AMT</div>
        </div>
        <button id="wp-win" class="btn btn-primary" style="margin-top:40px;width:100%;">Pyramide steht! -></button>
      </div>`;
    container.querySelector('#wp-win').onclick = () => onComplete({ correct: true, score: 100 });
  }
};
