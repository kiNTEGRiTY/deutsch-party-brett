/**
 * Mini-Game: Idiom Island (Insel der Redewendungen)
 * Choose the correct idiom that fits the situation.
 */
export const IdiomIsland = {
  id: 'idiom-island',
  name_de: 'Insel der Redewendungen',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const data = [
      { situation: 'Jemand hat dir sehr geholfen.', answer: 'Vielen Dank!', options: ['Vielen Dank!', 'Guten Tag.', 'Bis bald.', 'Entschuldigung.'] },
      { situation: 'Du hast einen Fehler gemacht.', answer: 'Entschuldigung.', options: ['Entschuldigung.', 'Hallo!', 'Prost!', 'Gesundheit!'] }
    ];
    const item = data[Math.floor(Math.random() * data.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:15px;">🏝️</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Was sagt man in dieser Situation?</p>
        <div style="font-size:1.2rem;background:#f8f9fa;padding:20px;border-radius:10px;margin-bottom:25px;font-weight:bold;">"${item.situation}"</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${item.options.sort(() => Math.random() - 0.5).map(o => `<button class="ii-btn" data-o="${o}" style="padding:15px;background:#3498db;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.ii-btn').forEach(btn => {
      btn.onclick = () => {
        const correct = btn.dataset.o === item.answer;
        onComplete({ correct, score: correct ? 100 : 0 });
      };
    });
  }
};
