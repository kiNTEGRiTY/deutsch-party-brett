/**
 * Mini-Game: Spelling Bee DE (Buchstabier-Wettbewerb)
 * Spell the word correctly letter by letter.
 */
export const SpellingBeeDE = {
  id: 'spelling-bee-de',
  name_de: 'Buchstabier-Profi',
  topics: ['rechtschreibung'],
  setup(container, task, onComplete) {
    const word = 'BAUM';
    let input = '';

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:10px;">🐝</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Buchstabiere das Wort!</p>
        <div style="font-size:2.5rem;font-weight:bold;letter-spacing:10px;margin-bottom:30px;color:#34495e;">${word}</div>
        <input id="sb-input" type="text" placeholder="W-O-R-T" style="width:100%;padding:15px;font-size:1.5rem;text-align:center;border-radius:10px;border:2px solid #34495e;text-transform:uppercase;outline:none;">
        <button id="sb-submit" class="btn btn-primary" style="margin-top:20px;width:100%;">Fertig!</button>
      </div>`;

    container.querySelector('#sb-submit').onclick = () => {
      const val = container.querySelector('#sb-input').value.trim().toUpperCase();
      const correct = val === word;
      onComplete({ correct, score: correct ? 100 : 0 });
    };
  }
};
