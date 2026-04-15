/**
 * Mini-Game: Compound Meaning (Komposita-Bedeutung)
 * What does this unusual compound word actually mean?
 */
export const CompoundMeaning = {
  id: 'compound-meaning',
  name_de: 'Komposita-Bedeutung',
  topics: ['zusammengesetzte_nomen', 'wortschatz'],
  setup(container, task, onComplete) {
    const words = [
      { word: 'Handschuh', meaning: 'Kleidung für die Hand', distractors: ['Ein kleiner Schuh', 'Ein Handtuch aus Leder', 'Socken für oben'] },
      { word: 'Kühlschrank', meaning: 'Ein kalter Schrank für Lebensmittel', distractors: ['Ein sehr alter Schrank', 'Ein Schrank ohne Türen', 'Ein Schrank für Kleidung'] },
      { word: 'Waschmaschine', meaning: 'Eine Maschine, die Wäsche reinigt', distractors: ['Eine Maschine zum Waschen von Autos', 'Ein großes Waschbecken', 'Eine Maschine zum Trocknen'] },
      { word: 'Sonnenbrille', meaning: 'Eine Brille gegen die Sonne', distractors: ['Eine leuchtende Brille', 'Sonnencreme für die Augen', 'Ein Sonnendach für Brillenträger'] }
    ];
    const w = words[Math.floor(Math.random() * words.length)];
    const opts = [w.meaning, ...w.distractors].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:2rem;margin-bottom:5px;">🔬</div>
        <p style="color:var(--text-secondary);margin-bottom:15px;">Was bedeutet dieses Wort <b>wirklich</b>?</p>
        <div style="font-size:2.8rem;font-weight:900;font-family:'Fredoka One',cursive;color:#2c3e50;margin-bottom:25px;">${w.word}</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${opts.map(o=>`<button class="cm-btn" data-o="${o}" style="padding:14px;font-size:1rem;border-radius:10px;border:none;cursor:pointer;background:#ecf0f1;color:#2c3e50;font-weight:bold;text-align:left;box-shadow:0 2px 0 #bdc3c7;">${o}</button>`).join('')}
        </div>
      </div>`;
    container.querySelectorAll('.cm-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.cm-btn').forEach(b=>b.style.pointerEvents='none');
        const correct = btn.dataset.o===w.meaning;
        btn.style.background=correct?'#2ecc71':'#e74c3c'; btn.style.color='white'; btn.style.boxShadow='none';
        if(!correct){const c=[...container.querySelectorAll('.cm-btn')].find(b=>b.dataset.o===w.meaning);if(c)c.style.background='#2ecc71',c.style.color='white',c.style.boxShadow='none';}
        setTimeout(()=>onComplete({correct,score:correct?100:0}),1200);
      });
    });
  }
};
