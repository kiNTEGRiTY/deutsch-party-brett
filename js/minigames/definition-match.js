/**
 * Mini-Game: Definition Match (Wörterbuch-Detektiv)
 * Read a definition and find the matching German word.
 */
export const DefinitionMatch = {
  id: 'definition-match',
  name_de: 'Wörterbuch-Detektiv',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const definitions = [
      { word: 'Bibliothek', def: 'Ein Gebäude, in dem man Bücher ausleihen kann.', distractors: ['Museum', 'Supermarkt', 'Bahnhof'] },
      { word: 'Schmetterling', def: 'Ein Insekt mit bunten Flügeln, das aus einer Raupe entsteht.', distractors: ['Biene', 'Käfer', 'Libelle'] },
      { word: 'Fahrstuhl', def: 'Eine Maschine, die Menschen zwischen Etagen transportiert.', distractors: ['Treppe', 'Rolltreppe', 'Aufzug'] },
      { word: 'Thermometer', def: 'Ein Gerät, das die Temperatur misst.', distractors: ['Barometer', 'Kompass', 'Lineal'] },
      { word: 'Insel', def: 'Ein Stück Land, das von Wasser umgeben ist.', distractors: ['Halbinsel', 'Kontinent', 'Fjord'] }
    ];
    const selected = [...definitions].sort(() => Math.random() - 0.5).slice(0, 3);
    let idx = 0, score = 0;

    function renderRound() {
      const d = selected[idx];
      const opts = [d.word, ...d.distractors].sort(() => Math.random() - 0.5);
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:5px;">📖</div>
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:15px;">${idx+1}/${selected.length}</div>
          <div style="font-size:1.2rem;color:#2c3e50;background:rgba(255,255,255,0.8);padding:20px;border-radius:12px;border-left:5px solid #3498db;margin-bottom:25px;text-align:left;line-height:1.6;">
            "${d.def}"
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${opts.map(o=>`<button class="dm-btn" data-o="${o}" style="padding:14px;font-size:1.1rem;border-radius:10px;border:none;cursor:pointer;background:#ecf0f1;color:#2c3e50;font-weight:bold;box-shadow:0 3px 0 #bdc3c7;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.dm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.dm-btn').forEach(b => b.style.pointerEvents='none');
          const correct = btn.dataset.o === d.word;
          btn.style.background = correct ? '#2ecc71' : '#e74c3c';
          btn.style.color = 'white';
          if (!correct) { const c = container.querySelector(`.dm-btn[data-o="${d.word}"]`); if(c) c.style.background='#2ecc71',c.style.color='white'; }
          if (correct) score++;
          setTimeout(() => { idx++; idx>=selected.length ? onComplete({correct:score>0,score:Math.round((score/selected.length)*100)}) : renderRound(); }, 1200);
        });
      });
    }
    renderRound();
  }
};
