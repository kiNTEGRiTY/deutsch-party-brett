/**
 * Mini-Game: Color Word (Stroop-Effekt)
 * A color name is written in a DIFFERENT color ink. Tap the INK color, not the word!
 */
export const ColorWords = {
  id: 'color-words',
  name_de: 'Farb-Verwirrung',
  topics: ['konzentration', 'lesen', 'wortschatz'],
  setup(container, task, onComplete) {
    const colors = [
      { de: 'Rot', hex: '#e74c3c' },
      { de: 'Blau', hex: '#3498db' },
      { de: 'Grün', hex: '#2ecc71' },
      { de: 'Gelb', hex: '#f1c40f' },
      { de: 'Lila', hex: '#9b59b6' }
    ];
    const ROUNDS = 5;
    let round = 0, score = 0;

    function renderRound() {
      if (round >= ROUNDS) { onComplete({ correct: score >= 3, score: Math.round((score/ROUNDS)*100) }); return; }

      const wordColor = colors[Math.floor(Math.random()*colors.length)];
      let inkColor = colors[Math.floor(Math.random()*colors.length)];
      while (inkColor.de === wordColor.de) inkColor = colors[Math.floor(Math.random()*colors.length)];

      const options = [...colors].sort(()=>Math.random()-.5).slice(0,3);
      if (!options.find(o=>o.de===inkColor.de)) options[0]=inkColor;
      options.sort(()=>Math.random()-.5);

      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:10px;">${round+1}/${ROUNDS} - ⚡ reagiere schnell!</div>
          <p style="color:var(--text-secondary);margin-bottom:15px;">Tippe auf die <b>TINTENFARBE</b> des Wortes!</p>
          
          <div style="font-size:5rem;font-weight:900;color:${inkColor.hex};margin:30px 0;font-family:'Fredoka One',cursive;text-shadow:0 3px 10px rgba(0,0,0,.1);">
            ${wordColor.de}
          </div>

          <div style="display:flex;gap:15px;justify-content:center;flex-wrap:wrap;">
            ${options.map(c=>`
              <button class="cw-btn" data-de="${c.de}" style="width:80px;height:80px;border-radius:50%;background:${c.hex};border:4px solid rgba(255,255,255,0.5);cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.2);transition:transform .1s;"></button>
            `).join('')}
          </div>
        </div>`;

      container.querySelectorAll('.cw-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.cw-btn').forEach(b=>b.style.pointerEvents='none');
          const correct = btn.dataset.de === inkColor.de;
          btn.style.transform = 'scale(1.3)';
          btn.style.boxShadow = `0 0 0 5px ${correct?'#2ecc71':'#e74c3c'}`;
          if (correct) score++;
          round++;
          setTimeout(renderRound, 800);
        });
      });
    }
    renderRound();
  }
};
