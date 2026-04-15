/**
 * Mini-Game: Hot Cold (Heiß-Kalt Bedeutungsnähe)
 * Which of two words is semantically closer to the target?
 */
export const HotCold = {
  id: 'hot-cold',
  name_de: 'Heiß-Kalt',
  topics: ['wortschatz'],
  setup(container, task, onComplete) {
    const rounds = [
      { target: 'Freude', close: 'Glück', far: 'Trauer', answer: 'Glück' },
      { target: 'rennen', close: 'laufen', far: 'schlafen', answer: 'laufen' },
      { target: 'groß', close: 'riesig', far: 'winzig', answer: 'riesig' },
      { target: 'Haus', close: 'Gebäude', far: 'Wolke', answer: 'Gebäude' },
      { target: 'kalt', close: 'eisig', far: 'heiß', answer: 'eisig' }
    ];
    const selected = [...rounds].sort(() => Math.random() - 0.5).slice(0, 3);
    let idx = 0, score = 0;

    function renderRound() {
      const r = selected[idx];
      const opts = [r.close, r.far].sort(() => Math.random() - 0.5);
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:5px;">
            <span style="font-size:1.5rem;">🧊</span>
            <div style="flex:1;height:12px;border-radius:6px;background:linear-gradient(to right,#3498db,#e74c3c);"></div>
            <span style="font-size:1.5rem;">🔥</span>
          </div>
          <p style="color:var(--text-secondary);margin-bottom:20px;font-size:.9rem;">Welches Wort ist NÄHER an der Bedeutung?</p>
          <div style="font-size:2.8rem;font-weight:900;font-family:'Fredoka One',cursive;color:#2c3e50;margin-bottom:30px;">${r.target}</div>
          <div style="display:flex;gap:15px;justify-content:center;">
            ${opts.map(o=>`<button class="hc-btn" data-o="${o}" style="flex:1;max-width:180px;padding:20px;font-size:1.3rem;border-radius:12px;border:none;cursor:pointer;background:#ecf0f1;color:#2c3e50;font-weight:bold;box-shadow:0 4px 0 #bdc3c7;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.hc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.hc-btn').forEach(b => b.style.pointerEvents='none');
          const correct = btn.dataset.o === r.answer;
          btn.style.background = correct ? '#2ecc71' : '#e74c3c'; btn.style.color='white'; btn.style.boxShadow='none';
          if (!correct) { const c=container.querySelector(`.hc-btn[data-o="${r.answer}"]`); if(c)c.style.background='#2ecc71',c.style.color='white',c.style.boxShadow='none'; }
          if (correct) score++;
          setTimeout(() => { idx++; idx>=selected.length ? onComplete({ correct: score>0, score: Math.round((score/selected.length)*100) }) : renderRound(); }, 1000);
        });
      });
    }
    renderRound();
  }
};
