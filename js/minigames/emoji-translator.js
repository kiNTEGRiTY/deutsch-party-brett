/**
 * Mini-Game: Emoji Translator (Emoji-Übersetzer)
 * Decode an emoji sequence to find the German word/phrase it represents.
 */
export const EmojiTranslator = {
  id: 'emoji-translator',
  name_de: 'Emoji-Übersetzer',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const puzzles = [
      { sequence: '☀️🌧️', answer: 'Regenwetter', options: ['Regenwetter', 'Schneesturm', 'Sonnenschein', 'Gewitterblitz'] },
      { sequence: '🐄🥛', answer: 'Milch', options: ['Butter', 'Milch', 'Joghurt', 'Käse'] },
      { sequence: '🌊🏄', answer: 'Surfen', options: ['Schwimmen', 'Tauchen', 'Surfen', 'Segeln'] },
      { sequence: '📚✏️', answer: 'Lernen', options: ['Schreiben', 'Malen', 'Lernen', 'Rechnen'] },
      { sequence: '🌙⭐🌟', answer: 'Nacht', options: ['Abend', 'Nacht', 'Morgen', 'Mittag'] },
      { sequence: '🎂🕯️🎉', answer: 'Geburtstag', options: ['Weihnachten', 'Geburtstag', 'Ostern', 'Silvester'] },
      { sequence: '🚗💨', answer: 'Fahren', options: ['Bremsen', 'Fahren', 'Parken', 'Tanken'] }
    ];
    const p = puzzles[Math.floor(Math.random() * puzzles.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <p style="color:var(--text-secondary);margin-bottom:15px;">Was bedeutet diese Emoji-Botschaft?</p>
        <div style="font-size:4rem;letter-spacing:8px;background:rgba(255,255,255,0.7);padding:20px;border-radius:16px;margin-bottom:30px;border:3px solid #f1c40f;">
          ${p.sequence}
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${p.options.map(o=>`<button class="em-btn" data-o="${o}" style="padding:15px;font-size:1.2rem;border-radius:10px;border:none;cursor:pointer;background:#ecf0f1;color:#2c3e50;font-weight:bold;box-shadow:0 3px 0 #bdc3c7;">${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.em-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.em-btn').forEach(b => b.style.pointerEvents='none');
        const correct = btn.dataset.o === p.answer;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c';
        btn.style.color='white';
        if (!correct) { const c=container.querySelector(`.em-btn[data-o="${p.answer}"]`); if(c)c.style.background='#2ecc71',c.style.color='white'; }
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 1200);
      });
    });
  }
};
