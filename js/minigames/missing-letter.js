/**
 * Mini-Game: Missing Letter (Vokal-Dieb)
 * A thief stole a letter - which does the word need?
 */

export const MissingLetter = {
  id: 'missing-letter',
  name_de: 'Vokal-Dieb',
  topics: ['rechtschreibung'],

  setup(container, task, onComplete) {
    const words = [
      { word: 'SCHULE', missing: 'U', gaps: [2] },
      { word: 'BLUME', missing: 'U', gaps: [2] },
      { word: 'FENSTER', missing: 'E', gaps: [1] },
      { word: 'HUND', missing: 'U', gaps: [1] },
      { word: 'BAUM', missing: 'A', gaps: [1] },
      { word: 'TISCH', missing: 'I', gaps: [1] }
    ];

    const current = words[Math.floor(Math.random() * words.length)];
    const display = current.word.split('').map((ch, i) => current.gaps.includes(i) ? '_' : ch);
    const options = ['A', 'E', 'I', 'O', 'U'].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div style="padding:var(--space-md); text-align:center; user-select:none; max-width:500px; margin:0 auto;">
        <div style="font-size:3rem; margin-bottom:5px;">🦹‍♂️</div>
        <p style="color:var(--text-secondary); margin-bottom:25px;">Der Vokal-Dieb hat einen Buchstaben gestohlen!</p>
        
        <div style="font-size:3.5rem; font-weight:900; letter-spacing:12px; font-family:'Fredoka One',cursive; margin-bottom:10px; color:#2c3e50;">
          ${display.map(ch => ch === '_'
            ? `<span style="border-bottom:4px solid #e74c3c; color:transparent; display:inline-block; width:40px;">_</span>`
            : `<span>${ch}</span>`
          ).join('')}
        </div>
        
        <p style="color:#7f8c8d; font-size:0.9rem; margin-bottom:30px;">Welcher Buchstabe fehlt?</p>

        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
          ${options.map(opt => `
            <button class="vowel-btn" data-letter="${opt}" style="
              width:60px; height:60px; border-radius:50%; font-size:1.8rem; font-weight:bold;
              background:#9b59b6; color:white; border:none; box-shadow:0 6px 0 #8e44ad; cursor:pointer;">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.vowel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.vowel-btn').forEach(b => b.style.pointerEvents = 'none');
        const isCorrect = btn.dataset.letter === current.missing;
        btn.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
        btn.style.boxShadow = '';

        // Show completed word
        if (!isCorrect) {
          const correct = [...container.querySelectorAll('.vowel-btn')].find(b => b.dataset.letter === current.missing);
          if (correct) { correct.style.background = '#2ecc71'; correct.style.boxShadow = ''; }
        }

        setTimeout(() => onComplete({ correct: isCorrect, score: isCorrect ? 100 : 0 }), 1300);
      });
    });
  }
};
