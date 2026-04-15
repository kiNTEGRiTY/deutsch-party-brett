/**
 * Mini-Game: Anagram Blast (Anagramm-Bombe)
 * Rearrange scrambled letters to form a word, before the countdown explodes.
 */

export const AnagramBlast = {
  id: 'anagram-blast',
  name_de: 'Anagramm-Bombe',
  topics: ['rechtschreibung', 'wortschatz'],

  setup(container, task, onComplete) {
    const words = ['KATZE', 'SCHULE', 'GARTEN', 'BLUME', 'FENSTER', 'WINTER', 'SOMMER'];
    const target = words[Math.floor(Math.random() * words.length)];
    let scrambled = target.split('').sort(() => Math.random() - 0.5);
    while (scrambled.join('') === target) scrambled.sort(() => Math.random() - 0.5);

    let timeLeft = 30;
    let currentWord = [];
    let remaining = [...scrambled];

    container.innerHTML = `
      <div style="padding:var(--space-md); text-align:center; user-select:none; max-width:500px; margin:0 auto;">
        <div style="display:flex; justify-content:center; align-items:center; gap:15px; margin-bottom:20px;">
          <div style="font-size:3rem;">💣</div>
          <div id="bomb-timer" style="font-size:2.5rem; font-weight:900; color:#e74c3c; font-family:'Fredoka One',cursive;">30</div>
        </div>
        <p style="color:var(--text-secondary); margin-bottom:15px;">Entscramble das Wort!</p>
        
        <!-- Build area -->
        <div id="build-area" style="min-height:60px; display:flex; justify-content:center; gap:8px; flex-wrap:wrap; background:rgba(255,255,255,0.6); border-radius:12px; padding:10px; margin-bottom:15px; border:2px dashed #bdc3c7;"></div>

        <!-- Letter tiles -->
        <div id="tile-area" style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-bottom:20px;"></div>

        <div style="display:flex; gap:10px; justify-content:center;">
          <button id="btn-undo" class="btn btn-secondary">↩ Rückgängig</button>
          <button id="btn-submit" class="btn btn-primary">✓ Prüfen</button>
        </div>
      </div>`;

    const buildArea = container.querySelector('#build-area');
    const tileArea = container.querySelector('#tile-area');
    const timerEl = container.querySelector('#bomb-timer');

    function renderTiles() {
      tileArea.innerHTML = '';
      remaining.forEach((letter, idx) => {
        const t = document.createElement('div');
        t.textContent = letter;
        Object.assign(t.style, {
          width: '44px', height: '44px', background: '#34495e', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', fontWeight: 'bold', fontSize: '1.4rem',
          cursor: 'pointer', boxShadow: '0 4px 0 #2c3e50', transition: 'transform 0.1s'
        });
        t.addEventListener('click', () => {
          currentWord.push(letter);
          remaining.splice(idx, 1);
          renderBuild(); renderTiles();
        });
        tileArea.appendChild(t);
      });
    }

    function renderBuild() {
      buildArea.innerHTML = '';
      currentWord.forEach((letter, idx) => {
        const t = document.createElement('div');
        t.textContent = letter;
        Object.assign(t.style, {
          width: '44px', height: '44px', background: '#3498db', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '8px', fontWeight: 'bold', fontSize: '1.4rem',
          cursor: 'pointer', boxShadow: '0 4px 0 #2980b9'
        });
        t.addEventListener('click', () => {
          remaining.push(currentWord.splice(idx, 1)[0]);
          renderBuild(); renderTiles();
        });
        buildArea.appendChild(t);
      });
    }

    const countdown = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 10) timerEl.style.color = '#c0392b';
      if (timeLeft <= 0) {
        clearInterval(countdown);
        timerEl.textContent = '💥';
        setTimeout(() => onComplete({ correct: false, score: 0 }), 1000);
      }
    }, 1000);

    container.querySelector('#btn-undo').addEventListener('click', () => {
      if (currentWord.length > 0) {
        remaining.splice(Math.random() * remaining.length | 0, 0, currentWord.pop());
        renderBuild(); renderTiles();
      }
    });

    container.querySelector('#btn-submit').addEventListener('click', () => {
      clearInterval(countdown);
      const attempt = currentWord.join('');
      if (attempt === target) {
        buildArea.style.background = 'rgba(46,204,113,0.3)';
        buildArea.style.border = '2px solid #2ecc71';
        setTimeout(() => onComplete({ correct: true, score: Math.ceil((timeLeft / 30) * 100) }), 1000);
      } else {
        buildArea.style.background = 'rgba(231,76,60,0.2)';
        setTimeout(() => {
          buildArea.style.background = '';
          countdown; // won't restart-just give one shot
        }, 500);
      }
    });

    renderTiles();
  }
};
