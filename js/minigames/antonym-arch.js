/**
 * Mini-Game: Antonym Arch (Gegenteil-Bogen)
 * Find the opposite word to complete the arch.
 */
export const AntonymArch = {
  id: 'antonym-arch',
  name_de: 'Gegenteil-Bogen',
  topics: ['wortschatz'],
  setup(container, task, onComplete) {
    const pairs = [
      { word: 'laut', antonym: 'leise', options: ['leise', 'schnell', 'stark', 'hell'] },
      { word: 'kalt', antonym: 'heiß', options: ['heiß', 'trocken', 'dunkel', 'klein'] },
      { word: 'hell', antonym: 'dunkel', options: ['dunkel', 'kalt', 'langsam', 'schwach'] }
    ];
    const p = pairs[Math.floor(Math.random() * pairs.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:2.5rem;margin-bottom:15px;">🏹</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Was ist das Gegenteil von <b>${p.word}</b>?</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${p.options.sort(() => Math.random() - 0.5).map(o => `<button class="aa-btn" data-o="${o}" style="padding:15px;font-size:1.1rem;border-radius:10px;border:none;background:#e67e22;color:white;font-weight:bold;cursor:pointer;box-shadow:0 4px 0 #d35400;">${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.aa-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.aa-btn').forEach(b => b.style.pointerEvents = 'none');
        const correct = btn.dataset.o === p.antonym;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c';
        btn.style.boxShadow = 'none';
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 1000);
      };
    });
  }
};
