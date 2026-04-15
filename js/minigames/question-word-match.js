/**
 * Mini-Game: Question Word Match (Fragewort-Polizei)
 * Match a situation photo/emoji with the right question word.
 */
export const QuestionWordMatch = {
  id: 'question-word-match',
  name_de: 'Fragewort-Polizei',
  topics: ['grammatik', 'satzbau'],
  setup(container, task, onComplete) {
    const questions = [
      { scene: '🏠 Es ist ein Haus.', answer: 'Was', question: '_______ ist das?', options: ['Was', 'Wer', 'Wo', 'Wann'] },
      { scene: '👧 Es ist Maria.', answer: 'Wer', question: '_______ ist das?', options: ['Was', 'Wer', 'Wie', 'Wohin'] },
      { scene: '🏫 Es ist in der Schule.', answer: 'Wo', question: '_______ ist er?', options: ['Wann', 'Wo', 'Warum', 'Wie'] },
      { scene: '⏰ Es ist um 8 Uhr.', answer: 'Wann', question: '_______ beginnt die Schule?', options: ['Wo', 'Wie', 'Wann', 'Wer'] },
      { scene: '🚗💨 Er fährt sehr schnell.', answer: 'Wie', question: '_______ fährt er?', options: ['Warum', 'Wie', 'Wer', 'Wann'] }
    ];
    const selected = [...questions].sort(()=>Math.random()-.5).slice(0, 3);
    let idx = 0, score = 0;

    function renderRound() {
      const q = selected[idx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:10px;">${idx+1}/${selected.length}</div>
          <div style="font-size:2.5rem;margin-bottom:5px;">${q.scene}</div>
          <div style="font-size:1.3rem;font-weight:bold;color:#2c3e50;margin-bottom:25px;">${q.question}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${q.options.map(o=>`<button class="qw-btn" data-o="${o}" style="padding:15px;font-size:1.3rem;border-radius:10px;border:none;cursor:pointer;background:#3498db;color:white;font-weight:bold;box-shadow:0 4px 0 #2980b9;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.qw-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.qw-btn').forEach(b=>b.style.pointerEvents='none');
          const correct = btn.dataset.o === q.answer;
          btn.style.background = correct?'#2ecc71':'#e74c3c'; btn.style.boxShadow='none';
          if(!correct){const c=container.querySelector(`.qw-btn[data-o="${q.answer}"]`);if(c)c.style.background='#2ecc71',c.style.boxShadow='none';}
          if(correct)score++;
          setTimeout(()=>{idx++;idx>=selected.length?onComplete({correct:score>0,score:Math.round((score/selected.length)*100)}):renderRound();},1000);
        });
      });
    }
    renderRound();
  }
};
