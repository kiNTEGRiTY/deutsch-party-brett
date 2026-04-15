/**
 * Mini-Game: Capital Detective (Groß-Schreibungs-Detektor)
 * Read a sentence and tap every word that should be capitalized.
 */
export const CapitalDetective = {
  id: 'capital-detective',
  name_de: 'Groß-Detektor',
  topics: ['gross_klein', 'rechtschreibung'],
  setup(container, task, onComplete) {
    const sentences = [
      { words: ['der', 'hund', 'läuft', 'im', 'garten', 'des', 'hauses'], nouns: [1, 4, 6] },
      { words: ['meine', 'katze', 'schläft', 'auf', 'dem', 'sofa'], nouns: [1, 5] },
      { words: ['das', 'kind', 'liest', 'ein', 'buch', 'über', 'tiere'], nouns: [1, 4, 6] },
      { words: ['im', 'sommer', 'spielen', 'die', 'kinder', 'im', 'park'], nouns: [1, 4, 6] }
    ];
    const ex = sentences[Math.floor(Math.random() * sentences.length)];
    const selected = new Set();

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:5px;">🕵️</div>
          <p style="color:var(--text-secondary);margin-bottom:20px;font-size:.9rem;">Tippe auf alle Wörter, die <b>groß</b> geschrieben werden müssen!</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:60px;margin-bottom:25px;background:rgba(255,255,255,.6);border-radius:12px;padding:15px;align-items:center;">
            ${ex.words.map((w,i)=>`
              <div class="cd-word" data-idx="${i}" style="padding:8px 14px;border-radius:8px;font-size:1.2rem;font-weight:bold;cursor:pointer;background:${selected.has(i)?'#3498db':'#ecf0f1'};color:${selected.has(i)?'white':'#2c3e50'};border:2px solid ${selected.has(i)?'#2980b9':'transparent'};transition:all .15s;">${w}</div>
            `).join('')}
          </div>
          <button id="cd-check" class="btn btn-primary" style="width:100%;max-width:280px;">Überprüfen ✓</button>
        </div>`;
      container.querySelectorAll('.cd-word').forEach(el => {
        el.addEventListener('click', () => {
          const i = parseInt(el.dataset.idx);
          selected.has(i) ? selected.delete(i) : selected.add(i);
          render();
        });
      });
      container.querySelector('#cd-check').addEventListener('click', () => {
        container.querySelectorAll('.cd-word').forEach(el => el.style.pointerEvents = 'none');
        const correct = new Set(ex.nouns);
        let hits = 0;
        container.querySelectorAll('.cd-word').forEach(el => {
          const i = parseInt(el.dataset.idx);
          const isNoun = correct.has(i);
          const wasTapped = selected.has(i);
          if (isNoun && wasTapped) { el.style.background='#2ecc71'; el.style.color='white'; hits++; }
          else if (!isNoun && wasTapped) { el.style.background='#e74c3c'; el.style.color='white'; }
          else if (isNoun && !wasTapped) { el.style.background='#f39c12'; el.style.color='white'; }
        });
        const score = Math.round((hits / ex.nouns.length) * 100);
        setTimeout(() => onComplete({ correct: score >= 75, score }), 1500);
      });
    }
    render();
  }
};
