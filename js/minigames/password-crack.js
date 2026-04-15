/**
 * Mini-Game: Password Crack (Passwort-Knacker)
 * Guess a hidden word through yes/no clues, Wordle-ish with category hints.
 */
export const PasswordCrack = {
  id: 'password-crack',
  name_de: 'Passwort-Knacker',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const words = [
      { word: 'Hund', clues: ['Es ist ein Tier.', 'Es hat vier Beine.', 'Es bellt.', 'Man hält es als Haustier.'] },
      { word: 'Auto', clues: ['Es ist ein Fahrzeug.', 'Es hat Räder.', 'Man braucht Benzin.', 'Es fährt auf Straßen.'] },
      { word: 'Sonne', clues: ['Es ist am Himmel.', 'Es ist sehr heiß.', 'Es leuchtet.', 'Es geht auf und unter.'] }
    ];
    const selected = words[Math.floor(Math.random() * words.length)];
    let clueIdx = 0;
    const shownClues = [];

    function render() {
      const options = [selected.word, ...['Baum', 'Katze', 'Mond', 'Schiff', 'Berg'].filter(w=>w!==selected.word).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
      
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:3rem;margin-bottom:5px;">🔐</div>
          <p style="color:var(--text-secondary);margin-bottom:15px;">Welches Wort steckt hinter dem Passwort?</p>
          
          <div style="background:rgba(255,255,255,0.6);border-radius:12px;padding:15px;margin-bottom:20px;text-align:left;">
            ${shownClues.length === 0 ? '<p style="color:#7f8c8d;text-align:center;">Noch kein Hinweis...</p>' : ''}
            ${shownClues.map((c,i)=>`<div style="display:flex;gap:8px;align-items:start;margin-bottom:8px;"><span style="background:#3498db;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:bold;flex-shrink:0;">${i+1}</span><p style="margin:0;color:#2c3e50;">${c}</p></div>`).join('')}
          </div>

          ${clueIdx < selected.clues.length 
            ? `<button id="pc-hint" class="btn btn-secondary" style="margin-bottom:15px;width:100%;max-width:250px;">💡 Hinweis #${clueIdx+1} anzeigen</button>` 
            : ''}

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${options.map(o=>`<button class="pc-btn" data-o="${o}" style="padding:14px;font-size:1.1rem;border-radius:10px;border:none;cursor:pointer;background:#ecf0f1;color:#2c3e50;font-weight:bold;box-shadow:0 3px 0 #bdc3c7;">${o}</button>`).join('')}
          </div>
          <p style="font-size:.8rem;color:#7f8c8d;margin-top:10px;">Je früher du rätst, desto mehr Punkte!</p>
        </div>`;

      container.querySelector('#pc-hint')?.addEventListener('click', () => {
        shownClues.push(selected.clues[clueIdx]);
        clueIdx++;
        render();
      });

      container.querySelectorAll('.pc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.pc-btn').forEach(b=>b.style.pointerEvents='none');
          const correct = btn.dataset.o === selected.word;
          btn.style.background = correct?'#2ecc71':'#e74c3c'; btn.style.color='white'; btn.style.boxShadow='none';
          if(!correct){const c=container.querySelector(`.pc-btn[data-o="${selected.word}"]`);if(c)c.style.background='#2ecc71',c.style.color='white',c.style.boxShadow='none';}
          const penalty = shownClues.length * 20;
          const finalScore = Math.max(20, correct ? 100 - penalty : 0);
          setTimeout(()=>onComplete({correct,score:finalScore}),1200);
        });
      });
    }
    render();
  }
};
