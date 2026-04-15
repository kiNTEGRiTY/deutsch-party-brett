/**
 * Mini-Game: Word Chess (Wort-Duell)
 * Two words "battle" - which one fits the category/rule?
 */
export const WordChess = {
  id: 'word-chess',
  name_de: 'Wort-Duell',
  topics: ['wortschatz', 'wortarten', 'grammatik'],
  setup(container, task, onComplete) {
    const battles = [
      { rule: 'Welches Wort ist ein <b style="color:#e74c3c;">NOMEN</b>?', left: 'Wolke', right: 'fliegen', answer: 'left' },
      { rule: 'Welches Wort ist ein <b style="color:#3498db;">VERB</b>?', left: 'Schule', right: 'rennen', answer: 'right' },
      { rule: 'Welches Wort ist <b style="color:#2ecc71;">länger</b>?', left: 'Hund', right: 'Schmetterling', answer: 'right' },
      { rule: 'Welcher Artikel ist <b style="color:#9b59b6;">feminin</b>?', left: 'der', right: 'die', answer: 'right' },
      { rule: 'Welches Wort kommt <b style="color:#e67e22;">alphabetisch zuerst</b>?', left: 'Zebra', right: 'Apfel', answer: 'right' },
      { rule: 'Welches Wort ist ein <b style="color:#1abc9c;">ADJEKTIV</b>?', left: 'schnell', right: 'Buch', answer: 'left' }
    ];
    const selected = [...battles].sort(()=>Math.random()-.5).slice(0,4);
    let idx=0,score=0;

    function renderRound(){
      const b=selected[idx];
      container.innerHTML=`
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:5px;">⚔️</div>
          <div style="font-size:.9rem;color:var(--text-secondary);margin-bottom:15px;">${idx+1}/${selected.length}</div>
          <p style="font-size:1.1rem;font-weight:bold;color:#2c3e50;margin-bottom:25px;">${b.rule}</p>
          <div style="display:flex;gap:20px;justify-content:center;align-items:center;">
            <button id="wc-left" style="flex:1;max-width:160px;height:110px;border-radius:16px;font-size:1.8rem;font-weight:900;font-family:'Fredoka One',cursive;background:#e74c3c;color:white;border:none;box-shadow:0 8px 0 #c0392b;cursor:pointer;">${b.left}</button>
            <span style="font-size:2rem;color:#7f8c8d;">VS</span>
            <button id="wc-right" style="flex:1;max-width:160px;height:110px;border-radius:16px;font-size:1.8rem;font-weight:900;font-family:'Fredoka One',cursive;background:#3498db;color:white;border:none;box-shadow:0 8px 0 #2980b9;cursor:pointer;">${b.right}</button>
          </div>
        </div>`;

      function handle(side){
        document.querySelectorAll('button').forEach(btn=>btn.style.pointerEvents='none');
        const correct=side===b.answer;
        const winner=document.getElementById(side==='left'?'wc-left':'wc-right');
        const loser=document.getElementById(side==='left'?'wc-right':'wc-left');
        winner.style.background='#2ecc71'; winner.style.boxShadow='none';
        loser.style.opacity='.3'; loser.style.boxShadow='none';
        if(correct)score++;
        setTimeout(()=>{idx++;idx>=selected.length?onComplete({correct:score>=2,score:Math.round((score/selected.length)*100)}):renderRound();},1000);
      }
      container.querySelector('#wc-left').addEventListener('click',()=>handle('left'));
      container.querySelector('#wc-right').addEventListener('click',()=>handle('right'));
    }
    renderRound();
  }
};
