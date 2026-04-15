/**
 * Mini-Game: Word Star (Wort-Sterne)
 * Find as many words as possible from a set of given letters.
 */
export const WordStar = {
  id: 'word-star',
  name_de: 'Wort-Sterne',
  topics: ['rechtschreibung', 'wortschatz'],
  setup(container, task, onComplete) {
    const challenges = [
      { letters: 'HAUS', validWords: ['HAUS', 'AUS', 'HAS', 'SAU', 'AUF'] },
      { letters: 'TISCH', validWords: ['TISCH', 'ISCH', 'IST', 'TIS'] },
      { letters: 'BAUM', validWords: ['BAUM', 'BAU', 'AUM', 'MUB'] }
    ];
    // Use validWords only from our actual word set
    const dictGerman = new Set(['HAUS', 'AUS', 'SAU', 'TIS', 'IST', 'TISCH', 'BAUM', 'BAU', 'AU', 'AB', 'IM', 'IN', 'EIN', 'ICH', 'BIN', 'ARM', 'URN', 'HAT', 'HAS', 'MAN', 'NUR']);
    const ch = challenges[Math.floor(Math.random() * challenges.length)];
    const found = new Set();
    let timeLeft = 45, timerInterval;

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span style="color:#3498db;font-weight:bold;">Gefunden: <span id="ws-count">0</span></span>
          <span style="color:#e74c3c;font-weight:900;" id="ws-timer">⏱ 45</span>
        </div>
        <p style="color:var(--text-secondary);margin-bottom:10px;">Bilde W\u00f6rter aus diesen Buchstaben!</p>
        <div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;">
          ${ch.letters.split('').map(l=>`<div style="width:50px;height:50px;background:#e74c3c;color:white;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:900;box-shadow:0 4px 0 #c0392b;">${l}</div>`).join('')}
        </div>
        <div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-bottom:15px;">
          <input id="ws-input" type="text" placeholder="Wort eingeben..." autocomplete="off" autocorrect="off" spellcheck="false" style="padding:12px;font-size:1.2rem;border-radius:8px;border:2px solid #3498db;outline:none;text-transform:uppercase;width:200px;">
          <button id="ws-submit" class="btn btn-primary">OK</button>
        </div>
        <div id="ws-found" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;min-height:40px;"></div>
        <div id="ws-msg" style="margin-top:10px;font-size:.9rem;color:#e74c3c;min-height:20px;"></div>
      </div>`;

    const input = container.querySelector('#ws-input');
    const foundEl = container.querySelector('#ws-found');
    const countEl = container.querySelector('#ws-count');
    const timerEl = container.querySelector('#ws-timer');
    const msgEl = container.querySelector('#ws-msg');

    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `⏱ ${timeLeft}`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        const score = Math.min(100, found.size * 20);
        setTimeout(() => onComplete({ correct: found.size >= 2, score }), 300);
      }
    }, 1000);

    function tryWord() {
      const word = input.value.trim().toUpperCase();
      input.value = '';
      if (found.has(word)) { msgEl.textContent = 'Schon gefunden!'; return; }
      const avail = ch.letters.split('');
      const usable = word.split('').every(c => { const i = avail.indexOf(c); if(i>=0){avail.splice(i,1);return true;} return false; });
      if (!usable || word.length < 2) { msgEl.textContent = 'Ungültig!'; return; }
      if (!dictGerman.has(word) && !ch.validWords.includes(word)) { msgEl.textContent = 'Unbekanntes Wort!'; return; }
      found.add(word);
      msgEl.textContent = '⭐ Super!';
      msgEl.style.color = '#2ecc71';
      setTimeout(()=>msgEl.style.color='#e74c3c',800);
      countEl.textContent = found.size;
      foundEl.innerHTML = [...found].map(w=>`<span style="background:#3498db;color:white;padding:4px 10px;border-radius:14px;font-size:.9rem;font-weight:bold;">${w}</span>`).join('');
      if (found.size >= 4) {
        clearInterval(timerInterval);
        setTimeout(() => onComplete({ correct: true, score: 100 }), 500);
      }
    }

    container.querySelector('#ws-submit').addEventListener('click', tryWord);
    input.addEventListener('keydown', e => { if(e.key==='Enter') tryWord(); });
    input.focus();
  }
};
