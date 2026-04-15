/**
 * Mini-Game: Mirror Word (Spiegel-Wörter)
 * Words are displayed backwards. Read them correctly.
 */
export const MirrorWord = {
  id: 'mirror-word',
  name_de: 'Spiegel-Wörter',
  topics: ['rechtschreibung', 'lesen', 'konzentration'],
  setup(container, task, onComplete) {
    const words = ['HUND', 'BAUM', 'TISCH', 'KATZE', 'AUTO', 'HAUS', 'BUCH', 'KIND'];
    const selected = [...words].sort(()=>Math.random()-.5).slice(0,4);
    let idx = 0, score = 0;

    function renderRound() {
      const word = selected[idx];
      const reversed = word.split('').reverse().join('');
      const distractors = words.filter(w=>w!==word).sort(()=>Math.random()-.5).slice(0,3);
      const opts = [word, ...distractors].sort(()=>Math.random()-.5);
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:5px;">🪞</div>
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:20px;">${idx+1}/${selected.length} - Lies das Wort rückwärts!</div>
          <div style="font-size:4rem;font-weight:900;font-family:'Fredoka One',cursive;color:#9b59b6;transform:scaleX(-1);display:inline-block;margin-bottom:25px;letter-spacing:4px;">${word}</div>
          <p style="color:var(--text-secondary);margin-bottom:20px;">Welches Wort siehst du?</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${opts.map(o=>`<button class="mw-btn" data-o="${o}" style="padding:14px;font-size:1.1rem;border-radius:10px;border:none;cursor:pointer;background:#ecf0f1;color:#2c3e50;font-weight:bold;box-shadow:0 3px 0 #bdc3c7;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.mw-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
          container.querySelectorAll('.mw-btn').forEach(b=>b.style.pointerEvents='none');
          const correct=btn.dataset.o===word;
          btn.style.background=correct?'#2ecc71':'#e74c3c'; btn.style.color='white'; btn.style.boxShadow='none';
          if(!correct){const c=container.querySelector(`.mw-btn[data-o="${word}"]`);if(c)c.style.background='#2ecc71',c.style.color='white',c.style.boxShadow='none';}
          if(correct)score++;
          setTimeout(()=>{idx++;idx>=selected.length?onComplete({correct:score>=2,score:Math.round((score/selected.length)*100)}):renderRound();},1100);
        });
      });
    }
    renderRound();
  }
};
