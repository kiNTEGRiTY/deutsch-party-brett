/**
 * Mini-Game: Reading Race (Lese-Rennen)
 * Read a short text quickly, then answer comprehension questions.
 */
export const ReadingRace = {
  id: 'reading-race',
  name_de: 'Lese-Rennen',
  topics: ['lesen'],
  setup(container, task, onComplete) {
    const texts = [
      {
        text: 'Anna und ihr Hund Max laufen jeden Morgen durch den parkenden Garten. Max liebt es besonders, Eichhörnchen zu jagen.',
        questions: [
          { q: 'Wie heißt der Hund?', answer: 'Max', options: ['Max', 'Bello', 'Rex', 'Fido'] },
          { q: 'Wann laufen sie?', answer: 'Morgen', options: ['Abend', 'Mittag', 'Morgen', 'Nacht'] }
        ]
      },
      {
        text: 'Morgen ist Maries Geburtstag. Sie wird sieben Jahre alt und bekommt ein rotes Fahrrad als Geschenk.',
        questions: [
          { q: 'Wie alt wird Marie?', answer: 'Sieben', options: ['Fünf', 'Sechs', 'Sieben', 'Acht'] },
          { q: 'Was bekommt sie?', answer: 'Fahrrad', options: ['Puppe', 'Ball', 'Fahrrad', 'Buch'] }
        ]
      }
    ];
    const sel = texts[Math.floor(Math.random() * texts.length)];
    let phase = 'read', qIdx = 0, score = 0, countdown = 8, timer;

    function showReading() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:1.5rem;margin-bottom:10px;">📖</div>
          <p style="color:var(--text-secondary);margin-bottom:10px;font-size:.9rem;">Lies schnell! Du hast <span id="rr-cd" style="font-weight:bold;color:#e74c3c;">${countdown}s</span></p>
          <div style="font-size:1.2rem;color:#2c3e50;background:rgba(255,255,255,.8);padding:20px;border-radius:12px;border-left:5px solid #3498db;text-align:left;line-height:1.8;margin-bottom:15px;">${sel.text}</div>
          <button id="rr-ready" class="btn btn-secondary">Ich bin bereit! -></button>
        </div>`;

      const cdEl = container.querySelector('#rr-cd');
      timer = setInterval(() => {
        countdown--;
        cdEl.textContent = `${countdown}s`;
        if (countdown <= 0) { clearInterval(timer); showQuestion(); }
      }, 1000);

      container.querySelector('#rr-ready').addEventListener('click', () => { clearInterval(timer); showQuestion(); });
    }

    function showQuestion() {
      if (qIdx >= sel.questions.length) {
        onComplete({ correct: score > 0, score: Math.round((score/sel.questions.length)*100) }); return;
      }
      const q = sel.questions[qIdx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:10px;">🤔</div>
          <p style="font-size:1.3rem;font-weight:bold;color:#2c3e50;margin-bottom:25px;">${q.q}</p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${q.options.map(o=>`<button class="rr-btn" data-o="${o}" style="padding:14px;font-size:1.1rem;border-radius:10px;border:none;cursor:pointer;background:#ecf0f1;color:#2c3e50;font-weight:bold;box-shadow:0 2px 0 #bdc3c7;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.rr-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.rr-btn').forEach(b=>b.style.pointerEvents='none');
          const correct = btn.dataset.o===q.answer;
          btn.style.background=correct?'#2ecc71':'#e74c3c'; btn.style.color='white';
          if(!correct){const c=[...container.querySelectorAll('.rr-btn')].find(b=>b.dataset.o===q.answer);if(c)c.style.background='#2ecc71',c.style.color='white';}
          if(correct)score++;
          qIdx++;
          setTimeout(showQuestion,1100);
        });
      });
    }
    showReading();
  }
};
