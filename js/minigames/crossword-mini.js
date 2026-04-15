/**
 * Mini-Game: Crossword Mini (Mini-Kreuzwort)
 * A tiny crossword puzzle.
 */
export const CrosswordMini = {
  id: 'crossword-mini',
  name_de: 'Mini-Kreuzwort',
  topics: ['wortschatz', 'rechtschreibung'],
  setup(container, task, onComplete) {
    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:10px;">📝</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Löse das Mini-Rätsel!</p>
        <div style="display:grid;grid-template-columns:repeat(3, 40px);gap:2px;justify-content:center;margin-bottom:20px;">
          <input type="text" maxlength="1" style="width:40px;height:40px;text-align:center;text-transform:uppercase;">
          <input type="text" maxlength="1" style="width:40px;height:40px;text-align:center;text-transform:uppercase;">
          <input type="text" maxlength="1" style="width:40px;height:40px;text-align:center;text-transform:uppercase;">
        </div>
        <button id="cm-win" class="btn btn-primary" style="width:100%;">Gelöst! -></button>
      </div>`;
    container.querySelector('#cm-win').onclick = () => onComplete({ correct: true, score: 100 });
  }
};
