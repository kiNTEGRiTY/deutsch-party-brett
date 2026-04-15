/**
 * Mini-Game: Adjective Endings (Adjektiv-Endungs-Detektiv)
 * Choose the correct adjective ending for the given context.
 */
export const AdjectiveEndings = {
  id: 'adjective-endings',
  name_de: 'Adjektiv-Endung',
  topics: ['adjektive', 'grammatik'],
  setup(container, task, onComplete) {
    const rounds = [
      { sentence: 'Der groß___ Hund bellt laut.', answer: 'e', options: ['e', 'en', 'er', 'es'], note: 'der Hund -> nominativ maskulin -> -e' },
      { sentence: 'Ich sehe den klein___ Vogel.', answer: 'en', options: ['e', 'en', 'er', 'es'], note: 'den Vogel -> akkusativ maskulin -> -en' },
      { sentence: 'Das schön___ Haus ist alt.', answer: 'e', options: ['e', 'en', 'er', 'es'], note: 'das Haus -> nominativ neutrum -> -e' },
      { sentence: 'Sie hat ein´ rot___ Kleid.', answer: 'es', options: ['e', 'en', 'er', 'es'], note: 'ein Kleid -> neutrum indef. -> -es' },
      { sentence: 'Der Saft ist aus einer reif___ Orange.', answer: 'en', options: ['e', 'en', 'er', 'es'], note: 'einer Orange -> dativ feminin -> -en' }
    ];
    const selected = [...rounds].sort(() => Math.random() - 0.5).slice(0, 3);
    let idx = 0, score = 0;

    function renderRound() {
      const r = selected[idx];
      const highlighted = r.sentence.replace('___', `<span style="background:#f1c40f;color:black;padding:2px 4px;border-radius:4px;font-weight:bold;">___</span>`);
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:15px;">${idx+1}/${selected.length}</div>
          <div style="font-size:1.3rem;font-weight:bold;color:#2c3e50;background:rgba(255,255,255,.8);padding:20px;border-radius:12px;margin-bottom:25px;border-left:5px solid #9b59b6;">
            ${highlighted}
          </div>
          <p style="color:var(--text-secondary);margin-bottom:15px;">Welche Endung fehlt?</p>
          <div style="display:flex;gap:10px;justify-content:center;">
            ${r.options.map(o=>`<button class="ae-btn" data-o="${o}" style="width:65px;height:65px;border-radius:50%;font-size:1.3rem;font-weight:bold;background:#9b59b6;color:white;border:none;box-shadow:0 5px 0 #8e44ad;cursor:pointer;">-${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.ae-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.ae-btn').forEach(b => b.style.pointerEvents='none');
          const correct = btn.dataset.o === r.answer;
          btn.style.background = correct ? '#2ecc71' : '#e74c3c';
          btn.style.boxShadow = 'none';
          if (!correct) { const c=container.querySelector(`.ae-btn[data-o="${r.answer}"]`); if(c)c.style.background='#2ecc71',c.style.boxShadow='none'; }
          if (correct) score++;
          setTimeout(() => { idx++; idx>=selected.length?onComplete({correct:score>0,score:Math.round((score/selected.length)*100)}):renderRound(); }, 1100);
        });
      });
    }
    renderRound();
  }
};
