/**
 * Mini-Game: Spelling Detective
 * 
 * Find the misspelled word among a group of words.
 */

export const SpellingDetective = {
  id: 'spelling-detective',
  name_de: 'Rechtschreib-Detektiv',
  topics: ['rechtschreibung', 'fehlerkorrektur'],

  setup(container, task, onComplete) {
    const content = task.content;
    const pairs = content.pairs;
    
    if (!pairs || pairs.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    const selected = [...pairs].sort(() => Math.random() - 0.5).slice(0, 3);
    let currentIndex = 0;
    let correctCount = 0;

    function renderQuestion() {
      const pair = selected[currentIndex];
      
      // Create a set of words: some correct, one wrong
      const correctWords = pairs
        .filter(p => p.correct !== pair.correct)
        .slice(0, 2)
        .map(p => p.correct);
      
      const allWords = [...correctWords, pair.wrong].sort(() => Math.random() - 0.5);

      container.innerHTML = `
        <div class="minigame-body">
          <div style="text-align:center; margin-bottom: var(--space-md);">
            <span class="turn-round">${currentIndex + 1} / ${selected.length}</span>
          </div>
          <p style="text-align:center; font-size: var(--font-size-lg); margin-bottom: var(--space-xl); color: var(--text-primary);">
            🔍 Welches Wort ist <strong>falsch</strong> geschrieben?
          </p>
          <div class="answer-options" style="max-width: 500px; margin: 0 auto;">
            ${allWords.map(word => `
              <button class="answer-option" data-word="${word}" style="font-size: var(--font-size-xl);">
                ${word}
              </button>
            `).join('')}
          </div>
          <div id="feedback-area" style="text-align:center; margin-top: var(--space-lg); min-height: 60px;"></div>
        </div>
      `;

      container.querySelectorAll('.answer-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const word = btn.dataset.word;
          const isCorrect = word === pair.wrong;
          
          container.querySelectorAll('.answer-option').forEach(b => {
            b.classList.add('disabled');
            if (b.dataset.word === pair.wrong) {
              b.classList.add('wrong');
              b.style.textDecoration = 'line-through';
            }
          });
          
          const feedback = document.getElementById('feedback-area');
          if (isCorrect) {
            correctCount++;
            feedback.innerHTML = `
              <span style="color: var(--color-success); font-weight: bold; font-size: var(--font-size-lg);">
                Richtig! ✓
              </span><br>
              <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                Richtig geschrieben: <strong>${pair.correct}</strong> - ${pair.rule}
              </span>`;
          } else {
            feedback.innerHTML = `
              <span style="color: var(--color-error); font-weight: bold; font-size: var(--font-size-lg);">
                Nicht ganz! ✗
              </span><br>
              <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                "${pair.wrong}" ist falsch -> Richtig: <strong>${pair.correct}</strong> - ${pair.rule}
              </span>`;
          }

          setTimeout(() => {
            currentIndex++;
            if (currentIndex < selected.length) {
              renderQuestion();
            } else {
              const score = Math.round((correctCount / selected.length) * 100);
              onComplete({ correct: score >= 80, partial: score >= 50, score });
            }
          }, 2500);
        });
      });
    }

    renderQuestion();
  }
};
