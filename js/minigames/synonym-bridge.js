/**
 * Mini-Game: Synonym Bridge (Synonym-Brücke)
 * Find the synonym to build a bridge across the gap.
 */
export const SynonymBridge = {
  id: 'synonym-bridge',
  name_de: 'Synonym-Brücke',
  topics: ['wortschatz'],
  setup(container, task, onComplete) {
    const pairs = [
      { word: 'groß', synonym: 'riesig', options: ['riesig', 'klein', 'alt', 'neu'] },
      { word: 'schnell', synonym: 'fix', options: ['fix', 'langsam', 'ruhig', 'laut'] },
      { word: 'schön', synonym: 'hübsch', options: ['hübsch', 'hässlich', 'stark', 'schwach'] }
    ];
    const p = pairs[Math.floor(Math.random() * pairs.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:2.5rem;margin-bottom:15px;">🌉</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Welches Wort bedeutet das Gleiche wie <b>${p.word}</b>?</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${p.options.sort(() => Math.random() - 0.5).map(o => `<button class="sb-btn" data-o="${o}" style="padding:15px;font-size:1.1rem;border-radius:10px;border:none;background:#3498db;color:white;font-weight:bold;cursor:pointer;box-shadow:0 4px 0 #2980b9;">${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.sb-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.sb-btn').forEach(b => b.style.pointerEvents = 'none');
        const correct = btn.dataset.o === p.synonym;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c';
        btn.style.boxShadow = 'none';
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 1000);
      };
    });
  }
};
