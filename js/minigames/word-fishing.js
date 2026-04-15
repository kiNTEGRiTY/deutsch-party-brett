/**
 * Mini-Game: Word Fishing (Wort-Angeln)
 * Catch the floating words of a certain type.
 */
export const WordFishing = {
  id: 'word-fishing',
  name_de: 'Wort-Angeln',
  topics: ['wortarten'],
  setup(container, task, onComplete) {
    const targetType = 'Nomen';
    const words = [
      { w: 'Baum', type: 'Nomen' },
      { w: 'schnell', type: 'Adjektiv' },
      { w: 'laufen', type: 'Verb' },
      { w: 'Haus', type: 'Nomen' }
    ];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:3rem;margin-bottom:10px;">🎣</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Angle dir ein <span style="color:#3498db;font-weight:bold;">${targetType}</span>!</p>
        <div style="display:flex;flex-wrap:wrap;gap:15px;justify-content:center;">
          ${words.map(obj => `<button class="wf-btn" data-type="${obj.type}" style="padding:15px;background:#1abc9c;color:white;border:none;border-radius:50%;width:80px;height:80px;font-weight:bold;cursor:pointer;box-shadow:0 4px 0 #16a085;">${obj.w}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.wf-btn').forEach(btn => {
      btn.onclick = () => {
        const correct = btn.dataset.type === targetType;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c';
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 800);
      };
    });
  }
};
