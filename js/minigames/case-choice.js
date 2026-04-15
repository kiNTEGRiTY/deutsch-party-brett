/**
 * Mini-Game: Case Choice
 * 
 * Is the word uppercase (noun) or lowercase (not a noun)?
 */

export const CaseChoice = {
  id: 'case-choice',
  name_de: 'Groß oder klein?',
  topics: ['gross_klein'],

  setup(container, task, onComplete) {
    const content = task.content;
    const items = content.items;
    
    if (!items || items.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    const selected = [...items].sort(() => Math.random() - 0.5).slice(0, 5);
    let currentIndex = 0;
    let correctCount = 0;

    function renderQuestion() {
      const item = selected[currentIndex];
      // Show the word in a "neutral" form (first letter could go either way)
      const neutralWord = item.word.toLowerCase();

      container.innerHTML = `
        <div class="minigame-body">
          <div style="text-align:center; margin-bottom: var(--space-md);">
            <span class="turn-round">${currentIndex + 1} / ${selected.length}</span>
          </div>
          <p style="text-align:center; font-size: var(--font-size-lg); margin-bottom: var(--space-lg); color: var(--text-primary);">
            Wird dieses Wort <strong>groß</strong> oder <strong>klein</strong> geschrieben?
          </p>
          <div style="text-align:center; margin-bottom: var(--space-xl);">
            <span style="font-family: var(--font-family-display); font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); color: var(--color-primary); letter-spacing: 2px;">
              ${neutralWord}
            </span>
          </div>
          <div class="answer-options" style="max-width: 400px; margin: 0 auto; grid-template-columns: 1fr 1fr;">
            <button class="answer-option" data-answer="gross" style="font-size: var(--font-size-xl);">
              🔠 GROSS
            </button>
            <button class="answer-option" data-answer="klein" style="font-size: var(--font-size-xl);">
              🔡 klein
            </button>
          </div>
          <div id="feedback-area" style="text-align:center; margin-top: var(--space-lg); min-height: 60px;"></div>
        </div>
      `;

      container.querySelectorAll('.answer-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const answer = btn.dataset.answer;
          const correctAnswer = item.isNoun ? 'gross' : 'klein';
          const isCorrect = answer === correctAnswer;
          
          container.querySelectorAll('.answer-option').forEach(b => b.classList.add('disabled'));
          
          const feedback = document.getElementById('feedback-area');
          if (isCorrect) {
            btn.classList.add('correct');
            correctCount++;
            feedback.innerHTML = `
              <span style="color: var(--color-success); font-weight: bold; font-size: var(--font-size-lg);">
                Richtig! ✓ -> ${item.correct}
              </span><br>
              <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${item.explanation}</span>`;
          } else {
            btn.classList.add('wrong');
            const correctBtn = container.querySelector(`[data-answer="${correctAnswer}"]`);
            if (correctBtn) correctBtn.classList.add('correct');
            feedback.innerHTML = `
              <span style="color: var(--color-error); font-weight: bold; font-size: var(--font-size-lg);">
                Leider nein! -> ${item.correct}
              </span><br>
              <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${item.explanation}</span>`;
          }

          setTimeout(() => {
            currentIndex++;
            if (currentIndex < selected.length) {
              renderQuestion();
            } else {
              const score = Math.round((correctCount / selected.length) * 100);
              onComplete({ correct: score >= 80, partial: score >= 50, score });
            }
          }, 2000);
        });
      });
    }

    renderQuestion();
  }
};
