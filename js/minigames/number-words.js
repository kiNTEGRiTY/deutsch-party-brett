/**
 * Mini-Game: Number Words (Zahlen-Rätsel)
 * Match numbers to their German word forms.
 */
export const NumberWords = {
  id: 'number-words',
  name_de: 'Zahlen-Rätsel',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const allPairs = [
      { num: 1, word: 'eins' }, { num: 2, word: 'zwei' }, { num: 3, word: 'drei' },
      { num: 7, word: 'sieben' }, { num: 10, word: 'zehn' }, { num: 12, word: 'zwölf' },
      { num: 20, word: 'zwanzig' }, { num: 100, word: 'hundert' }
    ];
    const selected = [...allPairs].sort(() => Math.random() - 0.5).slice(0, 4);
    
    // Left = numbers, Right = words - scramble right side
    const scrambledWords = [...selected.map(p => p.word)].sort(() => Math.random() - 0.5);
    const matched = new Map();
    let selectedLeft = null;

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <p style="color:var(--text-secondary);margin-bottom:20px;">Verbinde die Zahlen mit den Wörtern!</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${selected.map(p=>`
                <div class="left-item" data-num="${p.num}" style="padding:14px;font-size:1.5rem;font-weight:900;border-radius:10px;cursor:pointer;
                  background:${matched.has(p.num)?'#2ecc71':selectedLeft===p.num?'#f1c40f':'#3498db'};
                  color:white;box-shadow:${matched.has(p.num)||selectedLeft===p.num?'none':'0 4px 0 #2980b9'};
                  opacity:${matched.has(p.num)?'0.7':'1'};">
                  ${p.num}
                </div>`).join('')}
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${scrambledWords.map(w=>{
                const matchedFor = [...matched.entries()].find(([,mw])=>mw===w);
                return `<div class="right-item" data-word="${w}" style="padding:14px;font-size:1rem;font-weight:bold;border-radius:10px;cursor:pointer;
                  background:${matchedFor?'#2ecc71':'#ecf0f1'};color:${matchedFor?'white':'#2c3e50'};
                  box-shadow:${matchedFor?'none':'0 3px 0 #bdc3c7'};
                  opacity:${matchedFor?'0.7':'1'};">${w}</div>`;
              }).join('')}
            </div>
          </div>
          <div id="nw-feedback" style="margin-top:15px;font-weight:bold;min-height:24px;"></div>
        </div>`;

      container.querySelectorAll('.left-item').forEach(el => {
        el.addEventListener('click', () => {
          if (matched.has(parseInt(el.dataset.num))) return;
          selectedLeft = parseInt(el.dataset.num);
          render();
        });
      });

      container.querySelectorAll('.right-item').forEach(el => {
        el.addEventListener('click', () => {
          if (selectedLeft === null) return;
          const word = el.dataset.word;
          if ([...matched.values()].includes(word)) return;
          const correct = selected.find(p => p.num === selectedLeft)?.word === word;
          if (correct) {
            matched.set(selectedLeft, word);
            container.querySelector('#nw-feedback').textContent = '✅ Richtig!';
            container.querySelector('#nw-feedback').style.color = '#2ecc71';
          } else {
            container.querySelector('#nw-feedback').textContent = '❌ Nicht ganz!';
            container.querySelector('#nw-feedback').style.color = '#e74c3c';
          }
          selectedLeft = null;
          render();
          if (matched.size === selected.length) {
            setTimeout(() => onComplete({ correct: true, score: 100 }), 800);
          }
        });
      });
    }
    render();
  }
};
