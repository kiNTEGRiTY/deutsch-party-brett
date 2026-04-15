/**
 * Mini-Game: Tap the Type (Tipp den Typ)
 * Fast reaction game: tap the word of the requested type.
 */
export const TapTheType = {
  id: 'tap-the-type',
  name_de: 'Tipp den Typ',
  topics: ['wortarten'],
  setup(container, task, onComplete) {
    const types = ['Nomen', 'Verb', 'Adjektiv'];
    const targetType = types[Math.floor(Math.random() * types.length)];
    const words = [
      { w: 'Hund', type: 'Nomen' },
      { w: 'laufen', type: 'Verb' },
      { w: 'schön', type: 'Adjektiv' },
      { w: 'Auto', type: 'Nomen' },
      { w: 'essen', type: 'Verb' },
      { w: 'schnell', type: 'Adjektiv' }
    ].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <p style="font-size:1.5rem;font-weight:bold;color:#2c3e50;margin-bottom:30px;">Tippe auf ein <span style="color:#e74c3c;">${targetType}</span>!</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
          ${words.map(obj => `<button class="tt-btn" data-type="${obj.type}" style="padding:20px;font-size:1.3rem;border-radius:12px;border:none;background:#3498db;color:white;font-weight:bold;cursor:pointer;box-shadow:0 6px 0 #2980b9;">${obj.w}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.tt-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.tt-btn').forEach(b => b.style.pointerEvents = 'none');
        const correct = btn.dataset.type === targetType;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c';
        btn.style.boxShadow = 'none';
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 1000);
      };
    });
  }
};
