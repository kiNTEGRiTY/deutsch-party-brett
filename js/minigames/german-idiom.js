/**
 * Mini-Game: German Idiom (Redewendungs-Rätsler)
 * Match the German idiom to its actual meaning.
 */
export const GermanIdiom = {
  id: 'german-idiom',
  name_de: 'Redewendungs-Rätsler',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const idioms = [
      { idiom: 'Das ist nicht mein Bier.', meaning: 'Das geht mich nichts an.', distractors: ['Ich mag kein Bier.', 'Das schmeckt nicht gut.', 'Das ist zu teuer.'] },
      { idiom: 'Ich drücke dir die Daumen!', meaning: 'Ich wünsche dir viel Glück!', distractors: ['Ich schreibe dir eine Nachricht.', 'Ich zeige dir etwas.', 'Ich halte dich fest.'] },
      { idiom: 'Das ist ein Katzensprung.', meaning: 'Es ist nicht weit weg.', distractors: ['Die Katze springt hoch.', 'Das ist schwer zu lernen.', 'Das dauert sehr lange.'] },
      { idiom: 'Ich verstehe nur Bahnhof.', meaning: 'Ich verstehe gar nichts.', distractors: ['Ich mag Bahnhöfe sehr.', 'Ich fahre gerne Bahn.', 'Ich bin Student.'] },
      { idiom: 'Das geht wie Öl.', meaning: 'Das läuft sehr reibungslos.', distractors: ['Das ist sehr schwierig.', 'Das ist sehr teuer.', 'Das schmeckt fettig.'] }
    ];
    const selected = [...idioms].sort(() => Math.random() - 0.5).slice(0, 3);
    let idx = 0, score = 0;

    function renderRound() {
      const id = selected[idx];
      const opts = [id.meaning, ...id.distractors].sort(() => Math.random() - 0.5);
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:5px;">🤌</div>
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:10px;">${idx+1}/${selected.length}</div>
          <div style="font-size:1.4rem;font-style:italic;font-weight:bold;color:#e67e22;background:rgba(255,255,255,.8);padding:20px;border-radius:12px;margin-bottom:5px;border:2px solid #e67e22;">
            „${id.idiom}"
          </div>
          <p style="color:var(--text-secondary);margin-bottom:20px;font-size:.9rem;">Was bedeutet das wirklich?</p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${opts.map(o=>`<button class="gi-btn" data-o="${o}" style="padding:13px;font-size:1rem;border-radius:10px;border:none;cursor:pointer;background:#ecf0f1;color:#2c3e50;font-weight:bold;text-align:left;box-shadow:0 2px 0 #bdc3c7;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.gi-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.gi-btn').forEach(b => b.style.pointerEvents='none');
          const correct = btn.dataset.o === id.meaning;
          btn.style.background = correct?'#2ecc71':'#e74c3c'; btn.style.color='white'; btn.style.boxShadow='none';
          if(!correct){const c=[...container.querySelectorAll('.gi-btn')].find(b=>b.dataset.o===id.meaning);if(c)c.style.background='#2ecc71',c.style.color='white',c.style.boxShadow='none';}
          if (correct) score++;
          setTimeout(()=>{idx++;idx>=selected.length?onComplete({correct:score>0,score:Math.round((score/selected.length)*100)}):renderRound();},1100);
        });
      });
    }
    renderRound();
  }
};
