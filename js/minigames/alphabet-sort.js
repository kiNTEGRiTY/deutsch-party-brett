/**
 * Mini-Game: Alphabet Sort (Alphabet-Reihe)
 * Tap words in correct alphabetical order.
 */
export const AlphabetSort = {
  id: 'alphabet-sort',
  name_de: 'Alphabet-Reihe',
  topics: ['alphabet', 'wortschatz'],
  setup(container, task, onComplete) {
    const wordSets = [
      ['Hund', 'Apfel', 'Zebra', 'Baum', 'Eimer'],
      ['Maus', 'Katze', 'Frosch', 'Adler', 'Wolf'],
      ['Tisch', 'Regal', 'Lampe', 'Küche', 'Gabel']
    ];
    const words = wordSets[Math.floor(Math.random() * wordSets.length)];
    const correctOrder = [...words].sort((a, b) => a.localeCompare(b, 'de'));
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    let nextIdx = 0;
    const tapped = [];

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <p style="color:var(--text-secondary);margin-bottom:15px;">Tippe die Wörter in alphabetischer Reihenfolge!</p>
          
          <!-- Progress display -->
          <div style="display:flex;gap:8px;justify-content:center;margin-bottom:20px;flex-wrap:wrap;">
            ${correctOrder.map((w,i)=>`
              <div style="padding:6px 14px;border-radius:20px;font-weight:bold;font-size:.95rem;background:${i<tapped.length?'#2ecc71':'rgba(255,255,255,.4)'};color:${i<tapped.length?'white':'#7f8c8d'};border:2px solid ${i<tapped.length?'#27ae60':'#bdc3c7'};">
                ${i<tapped.length?tapped[i]:i===tapped.length?'__?__':'___'}
              </div>
            `).join('')}
          </div>

          <!-- Word buttons -->
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
            ${shuffled.map(w=>{
              const alreadyTapped = tapped.includes(w);
              return `<button class="as-btn" data-w="${w}" style="padding:12px 18px;font-size:1.2rem;border-radius:10px;border:none;cursor:${alreadyTapped?'default':'pointer'};background:${alreadyTapped?'#95a5a6':'#3498db'};color:white;font-weight:bold;box-shadow:${alreadyTapped?'none':'0 4px 0 #2980b9'};opacity:${alreadyTapped?.5:1};">${w}</button>`;
            }).join('')}
          </div>
          <div id="as-streak" style="margin-top:15px;font-size:1rem;font-weight:bold;min-height:20px;"></div>
        </div>`;

      container.querySelectorAll('.as-btn').forEach(btn => {
        if (tapped.includes(btn.dataset.w)) return;
        btn.addEventListener('click', () => {
          const w = btn.dataset.w;
          if (w === correctOrder[nextIdx]) {
            tapped.push(w);
            nextIdx++;
            btn.style.background = '#2ecc71';
            if (nextIdx >= correctOrder.length) {
              render();
              setTimeout(() => onComplete({ correct: true, score: 100 }), 800);
              return;
            }
          } else {
            btn.style.background = '#e74c3c';
            setTimeout(() => render(), 500);
            container.querySelector('#as-streak').textContent = `❌ Falsch! ${correctOrder[nextIdx]} wäre als nächstes dran.`;
            return;
          }
          render();
        });
      });
    }
    render();
  }
};
