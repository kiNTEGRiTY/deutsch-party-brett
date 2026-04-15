/**
 * Mini-Game: Punctuation Catcher (Satzzeichen-Fänger)
 * 
 * Players have to select the missing punctuation mark for a sentence.
 */

export const PunctuationCatcher = {
  id: 'punctuation-catcher',
  name_de: 'Satzzeichen-Fänger',
  topics: ['satzzeichen'],

  setup(container, task, onComplete) {
    const content = task.content; // From SATZZEICHEN_CONTENT
    if (!content || !content.content) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    const categories = content.content;
    const tasks = [];
    
    // Flatten tasks
    Object.keys(categories).forEach(key => {
        categories[key].forEach(item => tasks.push(item));
    });

    if (tasks.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    // Pick 3 random tasks
    const selectedTasks = [];
    for(let i=0; i<3; i++) {
        selectedTasks.push(tasks[Math.floor(Math.random() * tasks.length)]);
    }

    let currentIndex = 0;
    let correctCount = 0;

    function renderTask() {
      if (currentIndex >= selectedTasks.length) {
        const score = Math.round((correctCount / selectedTasks.length) * 100);
        onComplete({
            correct: score >= 80,
            partial: score >= 50 && score < 80,
            score,
            details: { correctCount, total: selectedTasks.length }
        });
        return;
      }

      const currentTask = selectedTasks[currentIndex];
      
      // Replace target punctuation with a box if it's in the middle, or just add it at the end
      let displayText = currentTask.text;
      if (displayText.includes('[,]')) {
          displayText = displayText.replace('[,]', '<span class="missing-box" style="display:inline-block; width: 30px; height: 30px; border: 2px dashed var(--color-primary); vertical-align: middle; margin: 0 4px;"></span>');
      } else {
          displayText += '<span class="missing-box" style="display:inline-block; width: 30px; height: 30px; border: 2px dashed var(--color-primary); vertical-align: middle; margin: 0 4px;"></span>';
      }

      container.innerHTML = `
        <div class="minigame-body animate-slide-up">
          <p style="text-align:center; font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-md);">
            Welches Satzzeichen fehlt? (${currentIndex + 1}/${selectedTasks.length})
          </p>
          <div class="target-sentence" style="font-size: 1.5rem; text-align: center; margin: var(--space-xl) 0; font-family: 'Nunito', sans-serif; font-weight: bold; line-height: 1.5;">
            ${displayText}
          </div>
          <div class="options-grid" style="display: flex; justify-content: center; gap: var(--space-md);">
            ${['.', '?', '!', ','].map(punct => `
              <button class="btn btn-secondary punct-btn" data-punct="${punct}" style="font-size: 2rem; width: 70px; height: 70px; border-radius: 50%;">
                ${punct}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelectorAll('.punct-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const selected = btn.dataset.punct;
          const isCorrect = selected === currentTask.missing;
          
          if (isCorrect) correctCount++;

          btn.style.background = isCorrect ? 'var(--color-success)' : 'var(--color-error)';
          btn.style.color = '#fff';

          container.querySelectorAll('.punct-btn').forEach(b => {
             b.style.pointerEvents = 'none';
             if (!isCorrect && b.dataset.punct === currentTask.missing) {
                 b.style.border = '4px solid var(--color-success)';
             }
          });

          // Fill the box visually
          const box = container.querySelector('.missing-box');
          if (box) {
              box.textContent = selected;
              box.style.border = 'none';
              box.style.color = isCorrect ? 'var(--color-success)' : 'var(--color-error)';
          }

          setTimeout(() => {
             currentIndex++;
             renderTask();
          }, 1200);
        });
      });
    }

    renderTask();
  }
};
