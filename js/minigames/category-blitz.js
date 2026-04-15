/**
 * Mini-Game: Category Blitz (Kategorie-Blitz)
 * Tap all words that belong to a given category before time runs out.
 */
export const CategoryBlitz = {
  id: 'category-blitz',
  name_de: 'Kategorie-Blitz',
  topics: ['wortschatz', 'nomen'],
  setup(container, task, onComplete) {
    const categories = [
      { name: 'Tiere', correct: ['Hund', 'Katze', 'Vogel', 'Fisch', 'Pferd'], wrong: ['Apfel', 'Tisch', 'Sonne', 'Buch', 'Auto'] },
      { name: 'Obst', correct: ['Apfel', 'Banane', 'Orange', 'Kirsche', 'Pflaume'], wrong: ['Hund', 'Tisch', 'Schule', 'Buch', 'Lampe'] },
      { name: 'Möbel', correct: ['Tisch', 'Stuhl', 'Bett', 'Schrank', 'Sofa'], wrong: ['Apfel', 'Hund', 'Sonne', 'Auto', 'Blume'] }
    ];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const allWords = [...cat.correct.slice(0, 4), ...cat.wrong.slice(0, 4)].sort(() => Math.random() - 0.5);
    const tapped = new Set();
    let timeLeft = 15;
    let finished = false;

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-size:1.2rem;font-weight:bold;color:#3498db;">Kategorie: <b style="color:#e74c3c;">${cat.name}</b></span>
          <span id="cb-timer" style="font-size:1.4rem;font-weight:900;color:#e74c3c;">15</span>
        </div>
        <p style="color:var(--text-secondary);margin-bottom:15px;font-size:.9rem;">Tippe alle ${cat.name}!</p>
        <div id="cb-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px;"></div>
        <button id="cb-done" class="btn btn-primary">Fertig! ✓</button>
      </div>`;

    const grid = container.querySelector('#cb-grid');
    const timerEl = container.querySelector('#cb-timer');

    allWords.forEach(word => {
      const btn = document.createElement('button');
      btn.textContent = word;
      btn.dataset.word = word;
      Object.assign(btn.style, {
        padding:'14px',fontSize:'1.1rem',borderRadius:'10px',border:'none',cursor:'pointer',
        background:'#ecf0f1',color:'#2c3e50',fontWeight:'bold',boxShadow:'0 3px 0 #bdc3c7',transition:'all .15s'
      });
      btn.addEventListener('click', () => {
        if (finished) return;
        if (tapped.has(word)) { tapped.delete(word); btn.style.background='#ecf0f1'; btn.style.color='#2c3e50'; btn.style.boxShadow='0 3px 0 #bdc3c7'; }
        else { tapped.add(word); btn.style.background='#3498db'; btn.style.color='white'; btn.style.boxShadow='none'; }
      });
      grid.appendChild(btn);
    });

    const countdown = setInterval(() => {
      timeLeft--;
      timerEl.textContent = timeLeft;
      if (timeLeft <= 0) { clearInterval(countdown); evaluate(); }
    }, 1000);

    function evaluate() {
      if (finished) return;
      finished = true;
      clearInterval(countdown);
      const correctSet = new Set(cat.correct.slice(0, 4));
      let hits = 0;
      tapped.forEach(w => { if (correctSet.has(w)) hits++; });
      tapped.forEach(w => {
        const btn = grid.querySelector(`[data-word="${w}"]`);
        if (btn) btn.style.background = correctSet.has(w) ? '#2ecc71' : '#e74c3c';
      });
      correctSet.forEach(w => {
        if (!tapped.has(w)) { const btn = grid.querySelector(`[data-word="${w}"]`); if(btn) btn.style.background='#f39c12',btn.style.color='white'; }
      });
      const score = Math.round((hits / correctSet.size) * 100);
      setTimeout(() => onComplete({ correct: score >= 75, score }), 1500);
    }

    container.querySelector('#cb-done').addEventListener('click', evaluate);
  }
};
