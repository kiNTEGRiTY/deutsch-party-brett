/**
 * Mini-Game: Rhyme Memory (Reim-Memory)
 * Classic memory card game but pairs are rhyming words.
 */

export const RhymeMemory = {
  id: 'rhyme-memory',
  name_de: 'Reim-Memory',
  topics: ['reime', 'wortschatz'],

  setup(container, task, onComplete) {
    const rhymePairs = [
      ['Haus', 'Maus'], ['Baum', 'Traum'], ['Brot', 'Not'],
      ['Hund', 'Mund'], ['Geld', 'Welt'], ['Stern', 'Kern']
    ];
    const selectedPairs = [...rhymePairs].sort(() => Math.random() - 0.5).slice(0, 4);
    const cards = selectedPairs.flatMap(([a, b]) => [
      { word: a, group: selectedPairs.indexOf(selectedPairs.find(p => p[0] === a)) },
      { word: b, group: selectedPairs.indexOf(selectedPairs.find(p => p[0] === a)) }
    ]).sort(() => Math.random() - 0.5);

    let flipped = [];
    let matched = new Set();
    let canFlip = true;

    container.innerHTML = `
      <div style="padding:var(--space-md); text-align:center; user-select:none;">
        <p style="color:var(--text-secondary); margin-bottom:20px; font-size:1rem;">Finde die Reimpaare! 🎵</p>
        <div id="mem-grid" style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; max-width:400px; margin:0 auto 20px;"></div>
        <div id="mem-score" style="font-size:1.2rem; font-weight:bold; color:#3498db;">0 / ${selectedPairs.length} Paare</div>
      </div>`;

    const grid = container.querySelector('#mem-grid');
    const scoreEl = container.querySelector('#mem-score');

    cards.forEach((card, idx) => {
      const el = document.createElement('div');
      el.dataset.idx = idx;
      el.dataset.group = card.group;
      el.dataset.word = card.word;
      Object.assign(el.style, {
        height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '8px',
        background: '#34495e', color: 'white', cursor: 'pointer',
        boxShadow: '0 4px 0 #2c3e50', transition: 'transform 0.1s',
        userSelect: 'none'
      });
      el.textContent = '?';

      el.addEventListener('click', () => {
        if (!canFlip || flipped.includes(el) || matched.has(String(card.group))) return;
        el.textContent = card.word;
        el.style.background = '#3498db';
        flipped.push(el);

        if (flipped.length === 2) {
          canFlip = false;
          const [a, b] = flipped;
          if (a.dataset.group === b.dataset.group) {
            // Match!
            a.style.background = '#2ecc71'; b.style.background = '#2ecc71';
            matched.add(String(card.group));
            scoreEl.textContent = `${matched.size} / ${selectedPairs.length} Paare`;
            flipped = [];
            canFlip = true;
            if (matched.size === selectedPairs.length) {
              setTimeout(() => onComplete({ correct: true, score: 100 }), 800);
            }
          } else {
            // No match
            a.style.background = '#e74c3c'; b.style.background = '#e74c3c';
            setTimeout(() => {
              a.textContent = '?'; a.style.background = '#34495e';
              b.textContent = '?'; b.style.background = '#34495e';
              flipped = []; canFlip = true;
            }, 900);
          }
        }
      });
      grid.appendChild(el);
    });
  }
};
