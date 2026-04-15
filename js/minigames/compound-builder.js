/**
 * Mini-Game: Compound Builder (Wort-Baumeister)
 * 
 * Players have to combine two nouns to build a new compound noun.
 */

export const CompoundBuilder = {
  id: 'compound-builder',
  name_de: 'Wort-Baumeister',
  topics: ['zusammengesetzte_nomen', 'nomen', 'wortschatz'],

  setup(container, task, onComplete) {
    const content = task.content; // From COMPOUND_CONTENT via index.js
    let items = [];
    if (content && content.items) {
      items = content.items;
    } else {
        // Fallback or handle different structures
      onComplete({ correct: false, score: 0 });
      return;
    }

    if (!items || items.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    // Pick 3 random tasks
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    const selectedTasks = shuffledItems.slice(0, 3);

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
      
      const options = [currentTask.part2, currentTask.decoy1, currentTask.decoy2].sort(() => Math.random() - 0.5);

      container.innerHTML = `
        <div class="minigame-body animate-slide-up">
          <p style="text-align:center; font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-md);">
            Baue ein neues Nomen! (${currentIndex + 1}/${selectedTasks.length})
          </p>
          <div class="target-sentence" style="font-size: 2rem; text-align: center; margin: var(--space-xl) 0; font-family: 'Fredoka One', cursive; color: var(--color-primary); display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>${currentTask.part1}</span>
            <span>+</span>
            <span class="missing-box" style="display:inline-block; width: 150px; height: 50px; border: 3px dashed var(--color-primary); border-radius: 8px;"></span>
          </div>
          <div class="options-grid" style="display: flex; justify-content: center; gap: var(--space-md); flex-wrap: wrap;">
            ${options.map(opt => `
              <button class="btn btn-secondary word-btn" data-word="${opt}" style="font-size: 1.5rem; padding: 12px 24px; border-radius: 12px;">
                ${opt}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelectorAll('.word-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const selected = btn.dataset.word;
          const isCorrect = selected === currentTask.part2;
          
          if (isCorrect) correctCount++;

          btn.style.background = isCorrect ? 'var(--color-success)' : 'var(--color-error)';
          btn.style.color = '#fff';

          container.querySelectorAll('.word-btn').forEach(b => {
             b.style.pointerEvents = 'none';
             if (!isCorrect && b.dataset.word === currentTask.part2) {
                 b.style.border = '4px solid var(--color-success)';
             }
          });

          // Fill the box visually
          const box = container.querySelector('.missing-box');
          if (box) {
              box.innerHTML = `<span style="display: flex; align-items: center; justify-content: center; height: 100%; color: ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'}; font-weight: bold;">${selected}</span>`;
              box.style.border = 'none';
          }

          setTimeout(() => {
             currentIndex++;
             renderTask();
          }, 1500);
        });
      });
    }

    renderTask();
  }
};
