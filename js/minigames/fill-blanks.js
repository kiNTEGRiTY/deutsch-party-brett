/**
 * Mini-Game: Fill in the Blanks
 * 
 * Complete sentences by choosing the correct missing word.
 */

export const FillBlanks = {
  id: 'fill-blanks',
  name_de: 'Lückentext',
  topics: ['lueckentexte', 'lesen'],

  setup(container, task, onComplete) {
    const content = task.content;
    let items;
    
    if (content.type === 'fillBlanks' && content.items) {
      items = content.items;
    } else if (content.type === 'lesen' && content.texts) {
      // Convert reading comprehension to fill-blank format
      const text = content.texts[Math.floor(Math.random() * content.texts.length)];
      if (text && text.questions) {
        items = text.questions.map(q => ({
          sentence: q.question,
          blank: q.correct,
          options: q.options
        }));
      }
    }
    
    if (!items || items.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    const selected = items.sort(() => Math.random() - 0.5).slice(0, 3);
    let currentIndex = 0;
    let correctCount = 0;

    function renderQuestion() {
      const item = selected[currentIndex];
      const options = [...item.options].sort(() => Math.random() - 0.5);
      const displaySentence = item.sentence.replace('___', '<span class="fill-blank">___</span>');

      container.innerHTML = `
        <div class="minigame-body">
          <div style="text-align:center; margin-bottom: var(--space-md);">
            <span class="turn-round">${currentIndex + 1} / ${selected.length}</span>
          </div>
          <div class="fill-sentence" style="margin-bottom: var(--space-xl);">
            ${displaySentence}
          </div>
          <div class="answer-options" style="max-width: 500px; margin: 0 auto;">
            ${options.map(opt => `
              <button class="answer-option" data-answer="${opt}">${opt}</button>
            `).join('')}
          </div>
          <div id="feedback-area" style="text-align:center; margin-top: var(--space-lg); min-height: 40px;"></div>
        </div>
      `;

      container.querySelectorAll('.answer-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const answer = btn.dataset.answer;
          const isCorrect = answer === item.blank;
          
          container.querySelectorAll('.answer-option').forEach(b => {
            b.classList.add('disabled');
            if (b.dataset.answer === item.blank) b.classList.add('correct');
          });
          
          if (isCorrect) {
            btn.classList.add('correct');
            correctCount++;
            // Show word in blank
            const blankEl = container.querySelector('.fill-blank');
            if (blankEl) {
              blankEl.textContent = item.blank;
              blankEl.style.color = 'var(--color-success)';
            }
            document.getElementById('feedback-area').innerHTML = 
              '<span style="color: var(--color-success); font-weight: bold;">Richtig! ✓</span>';
          } else {
            btn.classList.add('wrong');
            const blankEl = container.querySelector('.fill-blank');
            if (blankEl) {
              blankEl.textContent = item.blank;
              blankEl.style.color = 'var(--color-error)';
            }
            document.getElementById('feedback-area').innerHTML = 
              `<span style="color: var(--color-error); font-weight: bold;">Die Antwort ist: "${item.blank}"</span>`;
          }

          setTimeout(() => {
            currentIndex++;
            if (currentIndex < selected.length) {
              renderQuestion();
            } else {
              const score = Math.round((correctCount / selected.length) * 100);
              onComplete({ correct: score >= 80, partial: score >= 50, score });
            }
          }, 1500);
        });
      });
    }

    renderQuestion();
  }
};
