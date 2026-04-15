/**
 * Mini-Game: Blitz Quiz (Blitz-Quiz)
 * Ultra-rapid 10-round true/false quiz with shrinking time bar.
 */
export const BlitzQuiz = {
  id: 'blitz-quiz',
  name_de: 'Blitz-Quiz',
  topics: ['wortschatz', 'grammatik', 'lesen'],
  setup(container, task, onComplete) {
    const questions = [
      { q: '"Baum" ist ein Nomen.', answer: true },
      { q: '"laufen" ist ein Adjektiv.', answer: false },
      { q: 'Der Plural von "Haus" ist "Häuser".', answer: true },
      { q: '"Die" Hund ist immer richtig.', answer: false },
      { q: '"schön" ist ein Adjektiv.', answer: true },
      { q: 'Nomen werden immer klein geschrieben.', answer: false },
      { q: '"schnell" kann auch ein Adverb sein.', answer: true },
      { q: '"Ich gehe" ist Vergangenheit.', answer: false },
      { q: '"Katzen" ist der Plural von "Katze".', answer: true },
      { q: 'Verben konjugiert man nach dem Subjekt.', answer: true }
    ];
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 8);
    let idx = 0, score = 0, timeLeft, timerId;

    function renderRound() {
      if (idx >= shuffled.length) { onComplete({ correct: score >= 5, score: Math.round((score/shuffled.length)*100) }); return; }
      const q = shuffled[idx];
      timeLeft = 4;

      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="color:#3498db;font-weight:bold;">${idx+1}/${shuffled.length}</span>
            <span style="color:#e74c3c;font-weight:900;font-size:1.2rem;" id="bq-timer">⚡4</span>
            <span style="color:#2ecc71;font-weight:bold;">✔ ${score}</span>
          </div>
          <div id="bq-bar-wrap" style="height:6px;background:#ecf0f1;border-radius:3px;margin-bottom:20px;overflow:hidden;">
            <div id="bq-bar" style="height:100%;width:100%;background:#3498db;transition:width .2s linear;"></div>
          </div>
          <div style="font-size:1.3rem;font-weight:bold;color:#2c3e50;background:rgba(255,255,255,.8);padding:20px;border-radius:12px;margin-bottom:25px;min-height:80px;display:flex;align-items:center;justify-content:center;">
            ${q.q}
          </div>
          <div style="display:flex;gap:15px;justify-content:center;">
            <button class="bq-btn" data-ans="true" style="flex:1;max-width:140px;height:80px;border-radius:16px;font-size:1.4rem;font-weight:bold;background:#2ecc71;color:white;border:none;box-shadow:0 6px 0 #27ae60;cursor:pointer;">✅ Wahr</button>
            <button class="bq-btn" data-ans="false" style="flex:1;max-width:140px;height:80px;border-radius:16px;font-size:1.4rem;font-weight:bold;background:#e74c3c;color:white;border:none;box-shadow:0 6px 0 #c0392b;cursor:pointer;">❌ Falsch</button>
          </div>
        </div>`;

      const bar = container.querySelector('#bq-bar');
      const timerEl = container.querySelector('#bq-timer');

      timerId = setInterval(() => {
        timeLeft -= 0.1;
        bar.style.width = `${(timeLeft/4)*100}%`;
        bar.style.background = timeLeft > 2 ? '#3498db' : '#e74c3c';
        timerEl.textContent = `⚡${Math.ceil(timeLeft)}`;
        if (timeLeft <= 0) {
          clearInterval(timerId);
          container.querySelectorAll('.bq-btn').forEach(b => b.style.pointerEvents='none');
          idx++;
          setTimeout(renderRound, 500);
        }
      }, 100);

      container.querySelectorAll('.bq-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          clearInterval(timerId);
          container.querySelectorAll('.bq-btn').forEach(b => b.style.pointerEvents='none');
          const answered = btn.dataset.ans === 'true';
          const correct = answered === q.answer;
          btn.style.boxShadow = 'none'; btn.style.transform = 'translateY(6px)';
          if (correct) { score++; btn.style.outline = '4px solid white'; }
          else { btn.style.opacity = '.5'; const rightBtn = container.querySelector(`.bq-btn[data-ans="${q.answer}"]`); if(rightBtn) rightBtn.style.outline='4px solid white'; }
          idx++;
          setTimeout(renderRound, 600);
        });
      });
    }
    renderRound();
  }
};
