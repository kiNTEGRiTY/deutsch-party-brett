/**
 * Mini-Game: Logic Ladder (Logik-Leiter)
 * Solve logical word series.
 */
export const LogicLadder = {
  id: 'logic-ladder',
  name_de: 'Logik-Leiter',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const series = [
      { items: ['Eins', 'Zwei', 'Drei', '___'], answer: 'Vier', options: ['Vier', 'Fünf', 'Sechs', 'Zehn'] },
      { items: ['Frühling', 'Sommer', 'Herbst', '___'], answer: 'Winter', options: ['Winter', 'Regen', 'Sonne', 'Schnee'] },
      { items: ['Montag', 'Dienstag', 'Mittwoch', '___'], answer: 'Donnerstag', options: ['Donnerstag', 'Freitag', 'Samstag', 'Sonntag'] }
    ];
    const s = series[Math.floor(Math.random() * series.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:2.5rem;margin-bottom:10px;">🪜</div>
        <p style="color:var(--text-secondary);margin-bottom:25px;">Vervollständige die Reihe!</p>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:30px;">
          ${s.items.map(item => `
            <div style="background:rgba(255,255,255,0.8);padding:15px;border-radius:10px;font-size:1.3rem;font-weight:bold;color:#2c3e50;border:2px solid #ecf0f1;">
              ${item}
            </div>
          `).join('')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${s.options.map(o => `<button class="ll-btn" data-o="${o}" style="padding:15px;font-size:1.2rem;border-radius:10px;border:none;background:#3498db;color:white;font-weight:bold;cursor:pointer;box-shadow:0 4px 0 #2980b9;">${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.ll-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.ll-btn').forEach(b => b.style.pointerEvents = 'none');
        const correct = btn.dataset.o === s.answer;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c';
        btn.style.boxShadow = 'none';
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 1000);
      };
    });
  }
};
