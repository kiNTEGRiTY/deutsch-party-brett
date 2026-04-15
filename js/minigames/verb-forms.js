/**
 * Mini-Game: Verb Forms (Unregelmäßige Verben)
 * Match irregular verb forms across tenses.
 */
export const VerbForms = {
  id: 'verb-forms',
  name_de: 'Unregelmäßige Verben',
  topics: ['verben', 'zeitformen'],
  setup(container, task, onComplete) {
    const verbs = [
      { inf: 'gehen', past: 'ging', perfect: 'gegangen' },
      { inf: 'kommen', past: 'kam', perfect: 'gekommen' },
      { inf: 'sehen', past: 'sah', perfect: 'gesehen' },
      { inf: 'fahren', past: 'fuhr', perfect: 'gefahren' },
      { inf: 'schreiben', past: 'schrieb', perfect: 'geschrieben' }
    ];
    const selected = [...verbs].sort(() => Math.random() - 0.5).slice(0, 3);
    let idx = 0, score = 0;

    function renderRound() {
      const v = selected[idx];
      const showPastOrPerfect = Math.random() > 0.5;
      const answer = showPastOrPerfect ? v.past : v.perfect;
      const label = showPastOrPerfect ? 'Präteritum (ich ___...)' : 'Perfekt (ich habe ___...)';
      const wrongPool = verbs.filter(vb=>vb.inf!==v.inf).flatMap(vb=>[vb.past,vb.perfect]).filter(Boolean);
      const options = [answer, ...wrongPool.sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:10px;">${idx+1}/${selected.length}</div>
          <p style="color:var(--text-secondary);margin-bottom:10px;">${label}</p>
          <div style="font-size:3rem;font-weight:900;font-family:'Fredoka One',cursive;color:#2c3e50;margin:20px 0;">${v.inf}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${options.map(o=>`<button class="vf-btn" data-o="${o}" style="padding:14px;font-size:1.2rem;border-radius:10px;border:none;cursor:pointer;background:#1abc9c;color:white;font-weight:bold;box-shadow:0 4px 0 #16a085;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.vf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.vf-btn').forEach(b=>b.style.pointerEvents='none');
          const correct = btn.dataset.o===answer;
          btn.style.background=correct?'#2ecc71':'#e74c3c'; btn.style.boxShadow='none';
          if(!correct){const c=container.querySelector(`.vf-btn[data-o="${answer}"]`);if(c)c.style.background='#2ecc71',c.style.boxShadow='none';}
          if(correct)score++;
          setTimeout(()=>{idx++;idx>=selected.length?onComplete({correct:score>0,score:Math.round((score/selected.length)*100)}):renderRound();},1100);
        });
      });
    }
    renderRound();
  }
};
