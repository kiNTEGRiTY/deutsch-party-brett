/**
 * Mini-Game: Preposition World (Präpositions-Welt)
 * Select the correct preposition for a sentence.
 */
export const PrepositionWorld = {
  id: 'preposition-world',
  name_de: 'Präpositions-Welt',
  topics: ['grammatik', 'satzbau'],
  setup(container, task, onComplete) {
    const rounds = [
      { sentence: 'Die Katze sitzt ___ dem Sofa.', answer: 'auf', options: ['auf', 'unter', 'hinter', 'vor'] },
      { sentence: 'Das Buch liegt ___ dem Tisch.', answer: 'auf', options: ['in', 'auf', 'neben', 'über'] },
      { sentence: 'Der Ball ist ___ der Kiste.', answer: 'in', options: ['auf', 'neben', 'in', 'vor'] },
      { sentence: 'Er steht ___ der Tür.', answer: 'vor', options: ['hinter', 'unter', 'vor', 'neben'] },
      { sentence: 'Die Lampe hängt ___ dem Tisch.', answer: 'über', options: ['neben', 'über', 'unter', 'in'] }
    ];
    const selected = [...rounds].sort(() => Math.random() - 0.5).slice(0, 3);
    let idx = 0, score = 0;

    function renderRound() {
      const r = selected[idx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:15px;">${idx+1}/${selected.length}</div>
          <p style="font-size:1.6rem;font-weight:bold;color:#2c3e50;margin-bottom:30px;line-height:1.6;">
            ${r.sentence.replace('___', '<span style="border-bottom:3px solid #e74c3c;color:#e74c3c;padding:0 5px;">___</span>')}
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            ${r.options.map(o=>`<button class="prep-btn" data-o="${o}" style="padding:15px;font-size:1.3rem;border-radius:10px;border:none;cursor:pointer;background:#34495e;color:white;font-weight:bold;box-shadow:0 4px 0 #2c3e50;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.prep-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
          container.querySelectorAll('.prep-btn').forEach(b=>b.style.pointerEvents='none');
          const correct = btn.dataset.o===r.answer;
          btn.style.background = correct?'#2ecc71':'#e74c3c';
          btn.style.boxShadow='none';
          if(!correct){const c=container.querySelector(`.prep-btn[data-o="${r.answer}"]`);if(c)c.style.background='#2ecc71',c.style.boxShadow='none';}
          if(correct)score++;
          setTimeout(()=>{idx++;idx>=selected.length?onComplete({correct:score>0,score:Math.round((score/selected.length)*100)}):renderRound();},1100);
        });
      });
    }
    renderRound();
  }
};
