/**
 * Mini-Game: Speed Flash (Blitz-Leser)
 * A word flashes briefly. Player must recall what they saw.
 */

export const SpeedFlash = {
  id: 'speed-flash',
  name_de: 'Blitz-Leser',
  topics: ['lesen', 'konzentration'],

  setup(container, task, onComplete) {
    const words = ['Fahrrad', 'Schmetterling', 'Eisenbahn', 'Kinderzimmer', 'Regenschirm', 'Sonnenschein'];
    const target = words[Math.floor(Math.random() * words.length)];
    const distractors = words.filter(w => w !== target).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);

    let phase = 'countdown';

    container.innerHTML = `
      <div style="padding:var(--space-md); text-align:center; user-select:none; max-width:500px; margin:0 auto;">
        <p style="color:var(--text-secondary); margin-bottom:20px; font-size:1rem;">Lies das Wort! Es erscheint nur kurz...</p>

        <div id="flash-display" style="
          min-height:120px; display:flex; align-items:center; justify-content:center;
          font-size:3rem; font-weight:900; font-family:'Fredoka One',cursive; color:#2c3e50;
          background:rgba(255,255,255,0.7); border-radius:16px; margin-bottom:30px;
          border:3px solid rgba(0,0,0,0.1);">
          Bereit?
        </div>

        <div id="options-area" style="display:none; flex-direction:column; gap:10px;"></div>
      </div>`;

    const flashEl = container.querySelector('#flash-display');
    const optionsArea = container.querySelector('#options-area');

    // countdown 3-2-1 then show word briefly
    let count = 3;
    flashEl.textContent = count;
    const cdInterval = setInterval(() => {
      count--;
      if (count > 0) {
        flashEl.textContent = count;
      } else {
        clearInterval(cdInterval);
        // Flash the word
        flashEl.textContent = target;
        flashEl.style.color = '#e74c3c';
        
        setTimeout(() => {
          flashEl.textContent = '???';
          flashEl.style.color = '#7f8c8d';
          flashEl.style.fontSize = '2rem';

          // Show options
          optionsArea.style.display = 'flex';
          options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.className = 'flash-btn';
            Object.assign(btn.style, {
              padding: '14px', fontSize: '1.2rem', borderRadius: '10px', border: 'none',
              cursor: 'pointer', background: '#ecf0f1', color: '#2c3e50', fontWeight: 'bold',
              boxShadow: '0 3px 0 #bdc3c7', transition: 'all 0.15s'
            });
            btn.addEventListener('click', () => {
              container.querySelectorAll('.flash-btn').forEach(b => b.style.pointerEvents = 'none');
              const isCorrect = opt === target;
              btn.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
              btn.style.color = 'white';
              if (!isCorrect) {
                const correctBtn = [...container.querySelectorAll('.flash-btn')].find(b => b.textContent === target);
                if (correctBtn) { correctBtn.style.background = '#2ecc71'; correctBtn.style.color = 'white'; }
              }
              setTimeout(() => onComplete({ correct: isCorrect, score: isCorrect ? 100 : 0 }), 1200);
            });
            optionsArea.appendChild(btn);
          });
        }, 1200); // word shows for 1.2 seconds
      }
    }, 800);
  }
};
