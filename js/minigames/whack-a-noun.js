/**
 * Mini-Game: Whack-a-Noun (Nomen-Klopfen)
 * Whac-A-Mole style! Tap the Nouns, ignore the Verbs.
 */
export const WhackANoun = {
  id: 'whack-a-noun',
  name_de: 'Nomen-Klopfen',
  topics: ['nomen', 'verben', 'wortarten'],
  setup(container, task, onComplete) {
    const nouns = ['Hund', 'Baum', 'Haus', 'Auto', 'Tisch', 'Buch', 'Kind', 'Sonne', 'Ball', 'Katze'];
    const verbs = ['laufen', 'essen', 'spielen', 'singen', 'schlafen', 'rennen', 'trinken', 'lesen'];
    const HOLES = 9;
    let score = 0, misses = 0, lives = 3, timeLeft = 30, finished = false;
    let activeWords = {};
    let gameInterval;

    container.innerHTML = `
      <div style="padding:var(--space-sm);text-align:center;user-select:none;max-width:500px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-weight:bold;color:#3498db;">Punkte: <span id="wan-score">0</span></span>
          <span style="font-weight:bold;color:#e74c3c;font-size:1.2rem;" id="wan-timer">⏱ 30</span>
          <span id="wan-lives">❤️❤️❤️</span>
        </div>
        <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:10px;">Klopfe die <b style="color:#3498db;">NOMEN</b>! Ignoriere Verben!</p>
        <div id="wan-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;"></div>
      </div>`;

    const grid = container.querySelector('#wan-grid');
    const scoreEl = container.querySelector('#wan-score');
    const timerEl = container.querySelector('#wan-timer');
    const livesEl = container.querySelector('#wan-lives');

    // Create holes
    const holes = [];
    for (let i = 0; i < HOLES; i++) {
      const hole = document.createElement('div');
      hole.dataset.idx = i;
      Object.assign(hole.style, {
        height: '80px', borderRadius: '50%', background: '#795548',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', overflow: 'hidden', position: 'relative',
        border: '4px solid #5d4037', boxShadow: 'inset 0 5px 10px rgba(0,0,0,0.4)'
      });
      holes.push(hole);
      grid.appendChild(hole);
    }

    function popWord(holeIdx) {
      if (activeWords[holeIdx] || finished) return;
      const isNoun = Math.random() > 0.45;
      const word = isNoun ? nouns[Math.floor(Math.random() * nouns.length)] : verbs[Math.floor(Math.random() * verbs.length)];
      const hole = holes[holeIdx];
      activeWords[holeIdx] = { word, isNoun };

      hole.innerHTML = `<div style="background:${isNoun?'#f39c12':'#8e44ad'};color:white;padding:8px 5px;border-radius:30px;font-weight:bold;font-size:.9rem;width:90%;text-align:center;box-shadow:0 -3px 10px rgba(0,0,0,.3);animation:popUp .15s ease;">${word}</div>`;

      hole.onclick = () => {
        if (!activeWords[holeIdx]) return;
        const data = activeWords[holeIdx];
        delete activeWords[holeIdx];
        hole.innerHTML = '';
        if (data.isNoun) {
          score++;
          scoreEl.textContent = score;
          hole.style.background = '#2ecc71';
          setTimeout(() => { hole.style.background = '#795548'; }, 300);
        } else {
          lives--;
          livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
          hole.style.background = '#e74c3c';
          setTimeout(() => { hole.style.background = '#795548'; }, 400);
          if (lives <= 0) endGame();
        }
      };

      // Auto-hide after 1.5s
      setTimeout(() => {
        if (activeWords[holeIdx]) {
          delete activeWords[holeIdx];
          hole.innerHTML = '';
        }
      }, 1500);
    }

    function endGame() {
      if (finished) return;
      finished = true;
      clearInterval(gameInterval);
      setTimeout(() => onComplete({ correct: score >= 5, score: Math.min(100, score * 10) }), 500);
    }

    // Main game loop
    gameInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `⏱ ${timeLeft}`;
      if (timeLeft <= 5) timerEl.style.color = '#c0392b';
      if (timeLeft <= 0) { endGame(); return; }
      // Randomly pop a word
      if (Math.random() < 0.7) {
        const available = holes.map((_,i)=>i).filter(i => !activeWords[i]);
        if (available.length > 0) popWord(available[Math.floor(Math.random() * available.length)]);
      }
    }, 700);

    // Add popUp keyframe
    const style = document.createElement('style');
    style.textContent = '@keyframes popUp{from{transform:translateY(100%)}to{transform:translateY(0)}}';
    document.head.appendChild(style);
  }
};
