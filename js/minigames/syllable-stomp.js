/**
 * Mini-Game: Syllable Stomp (Silben-Stampfer)
 * Stomp/tap the correct number of times for the syllable count.
 */
export const SyllableStomp = {
  id: 'syllable-stomp',
  name_de: 'Silben-Stampfer',
  topics: ['silben'],
  setup(container, task, onComplete) {
    const words = [
      { word: 'Hund', syllables: 1 }, { word: 'Katze', syllables: 2 },
      { word: 'Schmetterling', syllables: 3 }, { word: 'Unterhaltung', syllables: 4 },
      { word: 'Blume', syllables: 2 }, { word: 'Apfelbaum', syllables: 3 },
      { word: 'Auto', syllables: 2 }, { word: 'Haus', syllables: 1 }
    ];
    const selected = [...words].sort(() => Math.random() - 0.5).slice(0, 4);
    let idx = 0, score = 0;

    function renderRound() {
      const w = selected[idx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <p style="color:var(--text-secondary);margin-bottom:5px;">${idx+1}/${selected.length}</p>
          <p style="color:var(--text-secondary);margin-bottom:20px;">Wie viele Silben hat das Wort?</p>
          <div style="font-size:3rem;font-weight:900;font-family:'Fredoka One',cursive;color:#2c3e50;margin-bottom:10px;">${w.word}</div>
          <div style="font-size:.9rem;color:#7f8c8d;margin-bottom:30px;">Tippe so oft wie Silben!</div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            ${[1,2,3,4,5].map(n=>`
              <button class="stomp-btn" data-n="${n}" style="width:62px;height:62px;border-radius:50%;font-size:1.8rem;font-weight:900;background:#e74c3c;color:white;border:none;box-shadow:0 6px 0 #c0392b;cursor:pointer;transition:all .1s;">${n}</button>
            `).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.stomp-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.stomp-btn').forEach(b => b.style.pointerEvents='none');
          const n = parseInt(btn.dataset.n);
          const correct = n === w.syllables;
          btn.style.background = correct ? '#2ecc71' : '#e74c3c';
          btn.style.boxShadow = 'none';
          btn.style.transform = 'translateY(6px)';
          if (!correct) {
            const c = container.querySelector(`.stomp-btn[data-n="${w.syllables}"]`);
            if(c) c.style.background='#2ecc71', c.style.boxShadow='none';
          }
          if (correct) score++;
          setTimeout(() => { idx++; idx>=selected.length ? onComplete({correct:score>=2,score:Math.round((score/selected.length)*100)}) : renderRound(); }, 1000);
        });
      });
    }
    renderRound();
  }
};
