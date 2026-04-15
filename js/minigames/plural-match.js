/**
 * Mini-Game: Plural Picker (Plural-Picker)
 * Match singular nouns to their correct plural form.
 */

export const PluralMatch = {
  id: 'plural-match',
  name_de: 'Plural-Picker',
  topics: ['nomen', 'grammatik'],

  setup(container, task, onComplete) {
    const pairs = [
      { singular: 'das Haus', plural: 'die Häuser' },
      { singular: 'der Baum', plural: 'die Bäume' },
      { singular: 'die Katze', plural: 'die Katzen' },
      { singular: 'das Kind', plural: 'die Kinder' },
      { singular: 'der Vogel', plural: 'die Vögel' },
      { singular: 'das Buch', plural: 'die Bücher' }
    ];

    const selected = [...pairs].sort(() => Math.random() - 0.5).slice(0, 4);
    let score = 0;
    let currentIdx = 0;

    function renderRound() {
      const current = selected[currentIdx];
      const wrongOptions = pairs.filter(p => p.singular !== current.singular)
        .sort(() => Math.random() - 0.5).slice(0, 3).map(p => p.plural);
      const options = [current.plural, ...wrongOptions].sort(() => Math.random() - 0.5);

      container.innerHTML = `
        <div style="padding:var(--space-md); text-align:center; user-select:none; max-width:500px; margin:0 auto;">
          <div style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:20px;">Runde ${currentIdx+1}/${selected.length}</div>
          <div style="font-size:2.2rem; font-weight:900; font-family:'Fredoka One',cursive; margin-bottom:10px; color:#2c3e50;">
            ${current.singular}
          </div>
          <p style="color:var(--text-secondary); margin-bottom:25px;">Was ist der Plural?</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${options.map(opt => `
              <button class="plural-btn" data-opt="${opt}" style="
                padding:14px; font-size:1.2rem; border-radius:10px; border:none; cursor:pointer;
                background:#ecf0f1; color:#2c3e50; font-weight:bold;
                box-shadow:0 3px 0 #bdc3c7; transition:all 0.15s;">${opt}</button>
            `).join('')}
          </div>
        </div>`;

      container.querySelectorAll('.plural-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.plural-btn').forEach(b => b.style.pointerEvents = 'none');
          const isCorrect = btn.dataset.opt === current.plural;
          btn.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
          btn.style.color = 'white';
          if (isCorrect) score++;
          else {
            const correctBtn = [...container.querySelectorAll('.plural-btn')].find(b => b.dataset.opt === current.plural);
            if (correctBtn) correctBtn.style.background = '#2ecc71', correctBtn.style.color = 'white';
          }
          setTimeout(() => {
            currentIdx++;
            if (currentIdx >= selected.length) {
              onComplete({ correct: score >= Math.ceil(selected.length * 0.7), score: Math.round((score/selected.length)*100) });
            } else renderRound();
          }, 1200);
        });
      });
    }
    renderRound();
  }
};
