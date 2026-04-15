/**
 * Mini-Game: Double Letter (Doppelkonsonant-Checker)
 * Which spelling is correct? Single or double consonant?
 */
export const DoubleLetter = {
  id: 'double-letter',
  name_de: 'Doppelkonsonant',
  topics: ['rechtschreibung'],
  setup(container, task, onComplete) {
    const rounds = [
      { correct: 'Sonne', wrong: 'Sone', note: 'nn' },
      { correct: 'Mutter', wrong: 'Muter', note: 'tt' },
      { correct: 'Himmel', wrong: 'Himel', note: 'mm' },
      { correct: 'Wasser', wrong: 'Waser', note: 'ss' },
      { correct: 'Teller', wrong: 'Teler', note: 'll' },
      { correct: 'Messer', wrong: 'Meser', note: 'ss' }
    ];
    const selected = [...rounds].sort(() => Math.random() - 0.5).slice(0, 4);
    let idx = 0, score = 0;

    function renderRound() {
      const r = selected[idx];
      const opts = Math.random() > 0.5 ? [r.correct, r.wrong] : [r.wrong, r.correct];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:5px;">✍️</div>
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:20px;">${idx+1}/${selected.length}</div>
          <p style="color:var(--text-secondary);margin-bottom:25px;">Welche Schreibweise ist <b>richtig</b>?</p>
          <div style="display:flex;gap:15px;justify-content:center;flex-wrap:wrap;">
            ${opts.map(o=>`
              <button class="dl-btn" data-o="${o}" style="min-width:140px;padding:20px;font-size:1.6rem;font-weight:900;font-family:'Fredoka One',cursive;border-radius:12px;border:none;cursor:pointer;background:#34495e;color:white;box-shadow:0 6px 0 #2c3e50;">${o}</button>
            `).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.dl-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.dl-btn').forEach(b=>b.style.pointerEvents='none');
          const correct = btn.dataset.o===r.correct;
          btn.style.background=correct?'#2ecc71':'#e74c3c'; btn.style.boxShadow='none';
          if(!correct){const c=container.querySelector(`.dl-btn[data-o="${r.correct}"]`);if(c)c.style.background='#2ecc71',c.style.boxShadow='none';}
          if(correct)score++;
          setTimeout(()=>{idx++;idx>=selected.length?onComplete({correct:score>=2,score:Math.round((score/selected.length)*100)}):renderRound();},1100);
        });
      });
    }
    renderRound();
  }
};
