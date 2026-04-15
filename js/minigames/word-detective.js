/**
 * Mini-Game: Word Detective (Wort-Detektiv)
 * Find the hidden word based on clues.
 */
export const WordDetective = {
  id: 'word-detective',
  name_de: 'Wort-Detektiv',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const data = [
      { clues: ['Man nutzt es zum Schreiben.', 'Es hat Tinte.', 'Es ist kein Bleistift.'], answer: 'Kugelschreiber' },
      { clues: ['Man trägt es an den Füßen.', 'Es ist aus Leder oder Stoff.', 'Man läuft damit.'], answer: 'Schuhe' }
    ];
    const item = data[Math.floor(Math.random() * data.length)];
    let clueIdx = 0;

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2.5rem;margin-bottom:15px;">🕵️‍♂️</div>
          <p style="color:var(--text-secondary);margin-bottom:20px;">Errate das Wort anhand der Hinweise!</p>
          <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin-bottom:20px;min-height:100px;display:flex;flex-direction:column;gap:10px;text-align:left;">
            ${item.clues.slice(0, clueIdx + 1).map((c, i) => `<div style="font-size:1.1rem;color:#2c3e50;">💡 ${c}</div>`).join('')}
          </div>
          ${clueIdx < item.clues.length - 1 ? `<button id="wd-hint" class="btn btn-secondary" style="margin-bottom:15px;width:100%;">Nächster Hinweis</button>` : ''}
          <input id="wd-input" type="text" placeholder="Lösung..." style="width:100%;padding:15px;font-size:1.3rem;text-align:center;border-radius:10px;border:2px solid #34495e;outline:none;">
          <button id="wd-submit" class="btn btn-primary" style="margin-top:15px;width:100%;">Lösen!</button>
        </div>`;

      container.querySelector('#wd-hint')?.addEventListener('click', () => { clueIdx++; render(); });
      container.querySelector('#wd-submit').onclick = () => {
        const val = container.querySelector('#wd-input').value.trim().toLowerCase();
        const correct = val === item.answer.toLowerCase();
        onComplete({ correct, score: correct ? 100 : 0 });
      };
    }
    render();
  }
};
