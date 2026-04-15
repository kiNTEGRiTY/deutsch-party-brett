/**
 * Mini-Game: Letter Drop (Buchstaben-Fang)
 * Letters fall. Tap them in the right order to spell a target word.
 */
export const LetterDrop = {
  id: 'letter-drop',
  name_de: 'Buchstaben-Fang',
  topics: ['rechtschreibung', 'konzentration'],
  setup(container, task, onComplete) {
    const words = ['HUND', 'BAUM', 'AUTO', 'BUCH', 'SONNE', 'HAUS'];
    const target = words[Math.floor(Math.random() * words.length)];
    const ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let collected = '';
    let isPlaying = false;
    let gameFrame, spawnTimeout;
    const letters = [];

    container.innerHTML = `
      <div style="position:relative;width:100%;height:65vh;max-height:520px;background:linear-gradient(to bottom,#1a1a2e,#16213e);border-radius:16px;overflow:hidden;touch-action:none;">
        <div style="position:absolute;top:10px;left:0;right:0;text-align:center;z-index:10;font-family:'Fredoka One',cursive;">
          <div style="display:inline-block;background:rgba(255,255,255,.1);backdrop-filter:blur(5px);padding:8px 20px;border-radius:20px;">
            <span style="color:#7f8c8d;font-size:.85rem;">Fange: </span>
            <span style="color:white;font-size:1.4rem;letter-spacing:6px;">${target.split('').map((ch,i)=>`<span id="lt-ch-${i}" style="border-bottom:2px solid #7f8c8d;padding:0 2px;">${ch}</span>`).join('')}</span>
          </div>
        </div>
        <div style="position:absolute;top:55px;left:0;right:0;text-align:center;z-index:10;">
          <span style="color:#f1c40f;font-size:1.1rem;letter-spacing:4px;" id="lt-collected">${'_'.repeat(target.length)}</span>
        </div>
        <div id="lt-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:15px;">
          <p style="color:white;font-size:1.5rem;font-family:'Fredoka One',cursive;text-align:center;">Fange die richtigen Buchstaben in der richtigen Reihenfolge!</p>
          <button id="lt-start" class="btn btn-primary btn-lg">Los!</button>
        </div>
        <div id="lt-area" style="position:absolute;inset:0;overflow:hidden;"></div>
      </div>`;

    const area = container.querySelector('#lt-area');
    const collectedEl = container.querySelector('#lt-collected');

    function updateCollected() {
      const display = target.split('').map((ch, i) => i < collected.length ? `<span style="color:#2ecc71;">${ch}</span>` : `<span style="color:#7f8c8d;">_</span>`).join('');
      collectedEl.innerHTML = display;
      target.split('').forEach((ch, i) => {
        const el = container.querySelector(`#lt-ch-${i}`);
        if (el && i < collected.length) { el.style.color='#2ecc71'; el.style.borderColor='#2ecc71'; }
      });
    }

    function spawnLetter() {
      if (!isPlaying) return;
      const needed = target[collected.length];
      const isNeeded = Math.random() > 0.5;
      const letter = isNeeded ? needed : ALL.split('').filter(c => c !== needed)[Math.floor(Math.random() * 25)];

      const el = document.createElement('div');
      el.textContent = letter;
      const x = 5 + Math.random() * 80;
      Object.assign(el.style, {
        position: 'absolute', top: '-60px', left: `${x}%`,
        width: '50px', height: '50px', borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${isNeeded?'#f39c12':'#8e44ad'}, ${isNeeded?'#e67e22':'#6c3483'})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem', fontWeight: 'bold', color: 'white', cursor: 'pointer',
        userSelect: 'none', boxShadow: '0 4px 15px rgba(0,0,0,.4)',
        transition: 'transform .1s, opacity .2s'
      });
      area.appendChild(el);

      let y = -60;
      const speed = 1.2 + Math.random() * 1;
      const obj = { el, letter, y, speed };
      letters.push(obj);

      el.addEventListener('pointerdown', () => {
        if (!isPlaying) return;
        if (letter === target[collected.length]) {
          collected += letter;
          updateCollected();
          el.style.transform = 'scale(1.5)'; el.style.opacity = '0';
          const idx = letters.indexOf(obj);
          if (idx >= 0) letters.splice(idx, 1);
          setTimeout(() => el.remove(), 200);
          if (collected === target) {
            isPlaying = false;
            cancelAnimationFrame(gameFrame);
            setTimeout(() => onComplete({ correct: true, score: 100 }), 500);
          }
        } else {
          el.style.background = 'radial-gradient(circle at 35% 35%, #e74c3c, #c0392b)';
          setTimeout(() => { if (el.style) el.style.background = `radial-gradient(circle at 35% 35%, ${isNeeded?'#f39c12':'#8e44ad'}, ${isNeeded?'#e67e22':'#6c3483'})`; }, 300);
        }
      });

      // Auto-drop removal
      spawnTimeout = setTimeout(() => {
        if (!area.contains(el)) return;
        if (letter === target[collected.length] && isPlaying) {
          // Let it pass without penalty for now
        }
        const idx = letters.indexOf(obj);
        if (idx >= 0) letters.splice(idx, 1);
        el.remove();
      }, 6000);
    }

    function gameLoop() {
      if (!isPlaying) return;
      for (const obj of letters) {
        obj.y += obj.speed;
        obj.el.style.top = `${obj.y}px`;
        if (obj.y > area.clientHeight + 60) {
          obj.el.remove();
        }
      }
      if (Math.random() < 0.018 && letters.length < 6) spawnLetter();
      gameFrame = requestAnimationFrame(gameLoop);
    }

    container.querySelector('#lt-start').addEventListener('click', () => {
      container.querySelector('#lt-overlay').style.display = 'none';
      isPlaying = true;
      gameLoop();
      // Timeout fallback
      setTimeout(() => { if (isPlaying) { isPlaying=false; onComplete({ correct: false, score: Math.round((collected.length/target.length)*100) }); } }, 30000);
    });
  }
};
