/**
 * Mini-Game: Case Solver (Fall-Detektiv)
 * Identify the grammatical case (Nominativ, Genitiv, Dativ, Akkusativ).
 */
export const CaseSolver = {
  id: 'case-solver',
  name_de: 'Fall-Detektiv',
  topics: ['grammatik'],
  setup(container, task, onComplete) {
    const rounds = [
      { sentence: 'Der <b style="color:#e74c3c;">Hund</b> bellt.', answer: 'Nominativ', options: ['Nominativ', 'Genitiv', 'Dativ', 'Akkusativ'] },
      { sentence: 'Ich sehe den <b style="color:#e74c3c;">Hund</b>.', answer: 'Akkusativ', options: ['Nominativ', 'Genitiv', 'Dativ', 'Akkusativ'] },
      { sentence: 'Ich gebe dem <b style="color:#e74c3c;">Hund</b> einen Knochen.', answer: 'Dativ', options: ['Nominativ', 'Genitiv', 'Dativ', 'Akkusativ'] },
      { sentence: 'Das ist der Knochen des <b style="color:#e74c3c;">Hundes</b>.', answer: 'Genitiv', options: ['Nominativ', 'Genitiv', 'Dativ', 'Akkusativ'] }
    ];
    const r = rounds[Math.floor(Math.random() * rounds.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:2.5rem;margin-bottom:15px;">🕵️‍♂️</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">In welchem Fall steht das markierte Wort?</p>
        <div style="font-size:1.4rem;background:rgba(255,255,255,0.8);padding:20px;border-radius:12px;margin-bottom:30px;line-height:1.6;">
          ${r.sentence}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${r.options.map(o => `<button class="cs-btn" data-o="${o}" style="padding:15px;font-size:1.1rem;border-radius:10px;border:none;background:#34495e;color:white;font-weight:bold;cursor:pointer;box-shadow:0 4px 0 #2c3e50;">${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.cs-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.cs-btn').forEach(b => b.style.pointerEvents = 'none');
        const correct = btn.dataset.o === r.answer;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c';
        btn.style.boxShadow = 'none';
        if (!correct) {
          const cb = [...container.querySelectorAll('.cs-btn')].find(b => b.dataset.o === r.answer);
          if (cb) cb.style.background = '#2ecc71';
        }
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 1200);
      };
    });
  }
};
