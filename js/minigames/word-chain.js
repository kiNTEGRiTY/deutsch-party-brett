/**
 * Mini-Game: Word Chain (Wortkette)
 * Each word must start with the last letter of the previous word.
 */

export const WordChain = {
  id: 'word-chain',
  name_de: 'Wortkette',
  topics: ['wortschatz', 'alphabet'],

  setup(container, task, onComplete) {
    // A curated subset so we can validate
    const validWords = new Set([
      'apfel', 'lampe', 'elefant', 'tisch', 'hamster', 'rose', 'esel', 'licht',
      'tiger', 'raupe', 'eimer', 'robot', 'turm', 'maus', 'stern', 'nase',
      'eiche', 'ente', 'eule', 'lupe', 'pinsel', 'luna', 'affe', 'eiche'
    ]);

    const startWord = 'Elefant';
    let chain = [startWord];
    let lives = 3;
    let score = 0;
    const maxRounds = 5;

    container.innerHTML = `
      <div style="padding:var(--space-md); text-align:center; user-select:none; max-width:500px; margin:0 auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
          <span id="wc-lives" style="font-size:1.4rem;">❤️❤️❤️</span>
          <span id="wc-score" style="font-weight:bold; color:#3498db;">0/${maxRounds}</span>
        </div>
        <p style="color:var(--text-secondary); margin-bottom:10px;">Das nächste Wort muss mit <b id="wc-nextletter" style="color:#e74c3c;"></b> beginnen!</p>
        
        <div id="wc-chain" style="display:flex; flex-wrap:wrap; gap:5px; justify-content:center; min-height:50px; margin-bottom:20px; padding:10px; background:rgba(255,255,255,0.5); border-radius:12px;"></div>
        
        <div style="display:flex; gap:10px; align-items:center; justify-content:center;">
          <input id="wc-input" type="text" placeholder="Nächstes Wort..." autocomplete="off" autocorrect="off" spellcheck="false"
            style="flex:1; max-width:250px; padding:12px; font-size:1.2rem; border-radius:8px; border:2px solid #3498db; outline:none;">
          <button id="wc-submit" class="btn btn-primary" style="padding:12px 20px;">OK ✓</button>
        </div>
        <p id="wc-msg" style="margin-top:10px; font-size:0.9rem; color:#e74c3c; min-height:20px;"></p>
      </div>`;

    const chainEl = container.querySelector('#wc-chain');
    const livesEl = container.querySelector('#wc-lives');
    const scoreEl = container.querySelector('#wc-score');
    const nextLetterEl = container.querySelector('#wc-nextletter');
    const input = container.querySelector('#wc-input');
    const msgEl = container.querySelector('#wc-msg');
    const submitBtn = container.querySelector('#wc-submit');

    function lastChar(word) { return word[word.length - 1].toUpperCase(); }
    function updateChain() {
      chainEl.innerHTML = chain.map((w, i) => `
        <span style="background:${i===0?'#95a5a6':'#3498db'}; color:white; padding:4px 10px; border-radius:20px; font-weight:bold; font-size:1rem;">${w}</span>
        ${i < chain.length-1 ? '<span style="color:#7f8c8d;">-></span>' : ''}
      `).join('');
      nextLetterEl.textContent = lastChar(chain[chain.length - 1]);
    }
    updateChain();
    input.focus();

    function handleSubmit() {
      const raw = input.value.trim();
      if (!raw) return;
      const word = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      const needed = lastChar(chain[chain.length - 1]);

      if (word[0].toUpperCase() !== needed) {
        msgEl.textContent = `Das Wort muss mit "${needed}" beginnen!`;
        input.value = '';
        lives--;
        livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
        if (lives <= 0) { setTimeout(() => onComplete({ correct: false, score: Math.round((score/maxRounds)*100) }), 500); }
        return;
      }
      if (chain.some(w => w.toLowerCase() === word.toLowerCase())) {
        msgEl.textContent = 'Dieses Wort war schon dran!';
        input.value = ''; return;
      }
      if (!validWords.has(word.toLowerCase())) {
        msgEl.textContent = 'Kein gültiges Wort!';
        input.value = ''; return;
      }

      msgEl.textContent = '';
      chain.push(word);
      score++;
      scoreEl.textContent = `${score}/${maxRounds}`;
      input.value = '';
      updateChain();

      if (score >= maxRounds) {
        setTimeout(() => onComplete({ correct: true, score: 100 }), 500);
      }
    }

    submitBtn.addEventListener('click', handleSubmit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
  }
};
