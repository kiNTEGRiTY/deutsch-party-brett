/**
 * Mini-Game: Opposite Racer (Gegenteil-Rennen)
 * Rapid-fire opposites - race against the clock!
 */
export const OppositeRacer = {
  id: 'opposite-racer',
  name_de: 'Gegenteil-Rennen',
  topics: ['wortschatz', 'adjektive'],
  setup(container, task, onComplete) {
    const pairs = [
      { word: 'groß', answer: 'klein', options: ['winzig', 'klein', 'riesig', 'breit'] },
      { word: 'heiß', answer: 'kalt', options: ['warm', 'kalt', 'eisig', 'kühl'] },
      { word: 'hell', answer: 'dunkel', options: ['grau', 'schwarz', 'dunkel', 'trüb'] },
      { word: 'schnell', answer: 'langsam', options: ['lahm', 'langsam', 'träge', 'müde'] },
      { word: 'reich', answer: 'arm', options: ['arm', 'karg', 'leer', 'schwach'] },
      { word: 'jung', answer: 'alt', options: ['alt', 'reif', 'müde', 'grau'] }
    ];
    const selected = [...pairs].sort(() => Math.random() - 0.5).slice(0, 5);
    let idx = 0, score = 0, timeLeft = 20;

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span id="or-score" style="font-weight:bold;color:#3498db;">0/${selected.length}</span>
          <span id="or-timer" style="font-weight:900;color:#e74c3c;font-size:1.2rem;">⏱ 20</span>
        </div>
        <div id="or-area"></div>
      </div>`;

    const scoreEl = container.querySelector('#or-score');
    const timerEl = container.querySelector('#or-timer');
    let finished = false;
    let timerInterval;

    function renderRound() {
      if (idx >= selected.length || finished) {
        finished = true;
        clearInterval(timerInterval);
        setTimeout(() => onComplete({ correct: score >= 3, score: Math.round((score/selected.length)*100) }), 500);
        return;
      }
      const r = selected[idx];
      const opts = [...r.options].sort(() => Math.random() - 0.5);
      container.querySelector('#or-area').innerHTML = `
        <p style="color:var(--text-secondary);margin-bottom:10px;">Das Gegenteil von...</p>
        <div style="font-size:3rem;font-weight:900;font-family:'Fredoka One',cursive;color:#2c3e50;margin-bottom:20px;">${r.word}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${opts.map(o=>`<button class="or-btn" data-o="${o}" style="padding:14px;font-size:1.1rem;border-radius:10px;border:none;cursor:pointer;background:#9b59b6;color:white;font-weight:bold;box-shadow:0 4px 0 #8e44ad;">${o}</button>`).join('')}
        </div>`;
      container.querySelectorAll('.or-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.or-btn').forEach(b=>b.style.pointerEvents='none');
          const correct = btn.dataset.o === r.answer;
          btn.style.background = correct ? '#2ecc71' : '#e74c3c';
          btn.style.boxShadow='none';
          if (!correct){const c=container.querySelector(`.or-btn[data-o="${r.answer}"]`);if(c)c.style.background='#2ecc71',c.style.boxShadow='none';}
          if (correct) score++;
          scoreEl.textContent = `${score}/${selected.length}`;
          idx++;
          setTimeout(renderRound, 800);
        });
      });
    }

    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `⏱ ${timeLeft}`;
      if (timeLeft <= 0 && !finished) { finished = true; clearInterval(timerInterval); setTimeout(() => onComplete({ correct: score >= 3, score: Math.round((score/selected.length)*100) }), 300); }
    }, 1000);

    renderRound();
  }
};
