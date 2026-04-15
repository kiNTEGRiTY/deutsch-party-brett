/**
 * Mini-Game: Word Match Fast (Schnell-Verbindung)
 * Rapidly match images/icons to words.
 */
export const WordMatchFast = {
  id: 'word-match-fast',
  name_de: 'Schnell-Verbindung',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const pairs = [
      { icon: '🍎', word: 'Apfel' },
      { icon: '🚗', word: 'Auto' },
      { icon: '🏠', word: 'Haus' },
      { icon: '🐶', word: 'Hund' }
    ];
    const p = pairs[Math.floor(Math.random() * pairs.length)];
    const options = pairs.map(p => p.word).sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:5rem;margin-bottom:20px;">${p.icon}</div>
        <p style="color:var(--text-secondary);margin-bottom:25px;">Was ist das?</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${options.map(o => `<button class="wm-btn" data-o="${o}" style="padding:15px;font-size:1.2rem;border-radius:10px;border:none;background:#9b59b6;color:white;font-weight:bold;cursor:pointer;box-shadow:0 4px 0 #8e44ad;">${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.wm-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.wm-btn').forEach(b => b.style.pointerEvents = 'none');
        const correct = btn.dataset.o === p.word;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c';
        btn.style.boxShadow = 'none';
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 1000);
      };
    });
  }
};
