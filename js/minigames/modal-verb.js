/**
 * Mini-Game: Modal Verb (Modalverb-Meister)
 * Choose the right modal verb for the sentence.
 */
export const ModalVerb = {
  id: 'modal-verb',
  name_de: 'Modalverb-Meister',
  topics: ['verben', 'grammatik', 'zeitformen'],
  setup(container, task, onComplete) {
    const rounds = [
      { sentence: 'Ich ___ heute nicht schlafen.', answer: 'kann', options: ['kann', 'will', 'muss', 'darf'], tip: 'Fähigkeit' },
      { sentence: 'Du ___ hier nicht rauchen!', answer: 'darfst', options: ['kannst', 'willst', 'darfst', 'musst'], tip: 'Erlaubnis' },
      { sentence: 'Wir ___ morgen früh aufstehen.', answer: 'müssen', options: ['dürfen', 'wollen', 'können', 'müssen'], tip: 'Pflicht' },
      { sentence: 'Sie ___ einen Kuchen backen.', answer: 'will', options: ['muss', 'will', 'darf', 'kann'], tip: 'Wunsch/Wille' },
      { sentence: 'Er ___ sehr gut Gitarre spielen.', answer: 'kann', options: ['will', 'muss', 'kann', 'darf'], tip: 'Fähigkeit' }
    ];
    const selected = [...rounds].sort(() => Math.random() - 0.5).slice(0, 3);
    let idx = 0, score = 0;

    function renderRound() {
      const r = selected[idx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:10px;">${idx+1}/${selected.length} · Hinweis: ${r.tip}</div>
          <div style="font-size:1.5rem;font-weight:bold;color:#2c3e50;background:rgba(255,255,255,.8);padding:20px;border-radius:12px;margin-bottom:25px;line-height:2;">
            ${r.sentence.replace('___','<span style="border-bottom:3px solid #e74c3c;color:#e74c3c;padding:0 8px;">___</span>')}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${r.options.map(o=>`<button class="mv-btn" data-o="${o}" style="padding:15px;font-size:1.2rem;border-radius:10px;border:none;cursor:pointer;background:#e67e22;color:white;font-weight:bold;box-shadow:0 4px 0 #d35400;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.mv-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.mv-btn').forEach(b => b.style.pointerEvents='none');
          const correct = btn.dataset.o === r.answer;
          btn.style.background = correct?'#2ecc71':'#e74c3c'; btn.style.boxShadow='none';
          if(!correct){const c=container.querySelector(`.mv-btn[data-o="${r.answer}"]`);if(c)c.style.background='#2ecc71',c.style.boxShadow='none';}
          if(correct)score++;
          setTimeout(()=>{idx++;idx>=selected.length?onComplete({correct:score>0,score:Math.round((score/selected.length)*100)}):renderRound();},1100);
        });
      });
    }
    renderRound();
  }
};
