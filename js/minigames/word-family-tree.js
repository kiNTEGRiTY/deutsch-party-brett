/**
 * Mini-Game: Word Family Tree (Wort-Familie)
 * Build a word family from a root. Recognise related forms.
 */
export const WordFamilyTree = {
  id: 'word-family-tree',
  name_de: 'Wort-Familie',
  topics: ['wortschatz', 'grammatik', 'verben'],
  setup(container, task, onComplete) {
    const families = [
      { root: 'laufen', members: ['Läufer', 'laufend', 'Lauf', 'gelaufen'], imposters: ['Sprung', 'Schwimmer', 'Flug'] },
      { root: 'schreiben', members: ['Schreiber', 'Schrift', 'geschrieben', 'Schreiben'], imposters: ['Leser', 'Rechner', 'Sprecher'] },
      { root: 'spielen', members: ['Spieler', 'Spiel', 'gespielt', 'Spielzeug'], imposters: ['Läufer', 'Schüler', 'Tänzer'] }
    ];
    const fam = families[Math.floor(Math.random() * families.length)];
    const allWords = [...fam.members.slice(0,4), ...fam.imposters.slice(0,3)].sort(() => Math.random() - 0.5);
    const chosen = new Set();
    let submitted = false;

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:5px;">🌳</div>
          <p style="color:var(--text-secondary);margin-bottom:5px;">Wurzelwort:</p>
          <div style="font-size:2rem;font-weight:900;font-family:'Fredoka One',cursive;color:#27ae60;margin-bottom:20px;">${fam.root}</div>
          <p style="color:var(--text-secondary);margin-bottom:15px;font-size:.9rem;">Welche Wörter gehören zur selben Wort-Familie?</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:20px;">
            ${allWords.map(w=>{
              const sel=chosen.has(w);
              return `<div class="ft-word" data-w="${w}" style="padding:10px 18px;border-radius:20px;font-weight:bold;font-size:1.1rem;cursor:pointer;background:${sel?'#3498db':'#ecf0f1'};color:${sel?'white':'#2c3e50'};border:2px solid ${sel?'#2980b9':'transparent'};transition:all .15s;">${w}</div>`;
            }).join('')}
          </div>
          <button id="ft-check" class="btn btn-primary" style="width:100%;max-width:300px;">Überprüfen ✓</button>
          ${submitted ? `<div id="ft-result" style="margin-top:15px;font-weight:bold;"></div>` : ''}
        </div>`;

      container.querySelectorAll('.ft-word').forEach(el => {
        el.addEventListener('click', () => {
          if (submitted) return;
          chosen.has(el.dataset.w) ? chosen.delete(el.dataset.w) : chosen.add(el.dataset.w);
          render();
        });
      });

      container.querySelector('#ft-check')?.addEventListener('click', () => {
        submitted = true;
        const correctSet = new Set(fam.members.slice(0,4));
        let hits = 0;
        chosen.forEach(w => { if (correctSet.has(w)) hits++; });
        const score = Math.round((hits / correctSet.size) * 100);
        setTimeout(() => onComplete({ correct: score >= 75, score }), 1000);
      });
    }
    render();
  }
};
