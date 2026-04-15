/**
 * Mini-Game: Prefix / Postfix (Vorsilben-Meister)
 * Add the right prefix or suffix to form a real German word.
 */
export const PrefixPostfix = {
  id: 'prefix-postfix',
  name_de: 'Vorsilben-Meister',
  topics: ['rechtschreibung', 'grammatik', 'wortschatz'],
  setup(container, task, onComplete) {
    const challenges = [
      { type: 'prefix', root: 'kommen', answer: 'an', options: ['an', 'aus', 'ge', 'zu'], result: 'ankommen', meaning: 'hier ankommen' },
      { type: 'prefix', root: 'fahren', answer: 'ab', options: ['ab', 'be', 're', 'ver'], result: 'abfahren', meaning: 'den Zug (abfahren)' },
      { type: 'suffix', root: 'Kind', answer: 'heit', options: ['heit', 'ung', 'lich', 'los'], result: 'Kindheit', meaning: 'die Zeit als ich klein war -> ___' },
      { type: 'prefix', root: 'schreiben', answer: 'auf', options: ['auf', 'ein', 'be', 'ge'], result: 'aufschreiben', meaning: 'Notizen machen' },
      { type: 'suffix', root: 'freund', answer: 'lich', options: ['lich', 'heit', 'ung', 'bar'], result: 'freundlich', meaning: 'nett und offen sein, = ___' }
    ];
    const selected = [...challenges].sort(() => Math.random() - 0.5).slice(0, 3);
    let idx = 0, score = 0;

    function renderRound() {
      const c = selected[idx];
      const isPrefix = c.type === 'prefix';
      const display = isPrefix ? `<span style="border-bottom:3px solid #e74c3c;color:#e74c3c;padding:0 5px;">${c.answer}</span>${c.root}` : `${c.root}<span style="border-bottom:3px solid #e74c3c;color:#e74c3c;padding:0 5px;">${c.answer}</span>`;
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:10px;">${idx+1}/${selected.length}</div>
          <p style="color:var(--text-secondary);margin-bottom:10px;">${c.meaning}</p>
          <div style="font-size:2rem;font-weight:bold;font-family:'Fredoka One',cursive;margin-bottom:25px;color:#2c3e50;">
            ${isPrefix ? `<span style="color:#7f8c8d;border-bottom:2px dashed #7f8c8d;">___</span>${c.root}` : `${c.root}<span style="color:#7f8c8d;border-bottom:2px dashed #7f8c8d;">___</span>`}
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            ${c.options.map(o=>`<button class="pp-btn" data-o="${o}" style="padding:12px 20px;font-size:1.2rem;border-radius:20px;border:none;cursor:pointer;background:#e67e22;color:white;font-weight:bold;box-shadow:0 4px 0 #d35400;">-${!isPrefix&&o!=='an'&&o!=='auf'&&o!=='ab'?'':o}${isPrefix?'':'-'}</button>`).join('')}
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:10px;">
            ${c.options.map(o=>`<button class="pp-btn2" data-o="${o}" style="padding:12px 20px;font-size:1.2rem;border-radius:20px;border:none;cursor:pointer;background:#e67e22;color:white;font-weight:bold;box-shadow:0 4px 0 #d35400;">${o}</button>`).join('')}
          </div>
        </div>`;
      // Consolidate buttons
      container.querySelector('.pp-btn')?.closest('div')?.remove?.();
      // Re-render simpler
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:10px;">${idx+1}/${selected.length}</div>
          <p style="color:var(--text-secondary);margin-bottom:15px;">${c.meaning}</p>
          <div style="font-size:2rem;font-weight:bold;margin:20px 0;color:#2c3e50;">
            ${isPrefix ? `<span style="color:#e74c3c;border-bottom:2px dashed #e74c3c;margin-right:2px;">___</span>${c.root}` : `${c.root}<span style="color:#e74c3c;border-bottom:2px dashed #e74c3c;margin-left:2px;">___</span>`}
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            ${c.options.map(o=>`<button class="pp-btn" data-o="${o}" style="padding:12px 22px;font-size:1.2rem;border-radius:20px;border:none;cursor:pointer;background:#e67e22;color:white;font-weight:bold;box-shadow:0 4px 0 #d35400;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.pp-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.pp-btn').forEach(b=>b.style.pointerEvents='none');
          const correct = btn.dataset.o===c.answer;
          btn.style.background=correct?'#2ecc71':'#e74c3c'; btn.style.boxShadow='none';
          if(!correct){const cb=container.querySelector(`.pp-btn[data-o="${c.answer}"]`);if(cb)cb.style.background='#2ecc71',cb.style.boxShadow='none';}
          if(correct)score++;
          setTimeout(()=>{idx++;idx>=selected.length?onComplete({correct:score>0,score:Math.round((score/selected.length)*100)}):renderRound();},1100);
        });
      });
    }
    renderRound();
  }
};
