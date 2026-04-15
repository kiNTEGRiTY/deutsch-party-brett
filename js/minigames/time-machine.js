/**
 * Mini-Game: Time Machine (Zeitmaschinen-Reise)
 * 
 * Players sort verbs into the correct tense (past, present, future).
 */

export const TimeMachine = {
  id: 'time-machine',
  name_de: 'Zeitmaschine',
  topics: ['zeitformen'],

  setup(container, task, onComplete) {
    const content = task.content; // From ZEITFORMEN_CONTENT
    if (!content || !content.content) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    const tenses = content.content; // { praesens: [], praeteritum: [], perfekt: [], futur: [] }
    
    // Build a pool of tasks
    const tasks = [];
    if (tenses.praesens) tenses.praesens.forEach(w => tasks.push({ word: w, category: 'gegenwart' }));
    if (tenses.praeteritum) tenses.praeteritum.forEach(w => tasks.push({ word: w, category: 'vergangenheit' }));
    if (tenses.perfekt) tenses.perfekt.forEach(w => tasks.push({ word: w, category: 'vergangenheit' }));
    if (tenses.futur) tenses.futur.forEach(w => tasks.push({ word: w, category: 'zukunft' }));

    if (tasks.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    // Pick 3 random tasks to solve in a row
    const selectedTasks = [];
    for(let i=0; i<3; i++) {
        selectedTasks.push(tasks[Math.floor(Math.random() * tasks.length)]);
    }

    let currentIndex = 0;
    let correctCount = 0;

    function renderTask() {
      if (currentIndex >= selectedTasks.length) {
        // Done
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

      container.innerHTML = `
        <div class="minigame-body animate-slide-up">
          <p style="text-align:center; font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-md);">
            In welcher Zeit steht dieses Verb? (${currentIndex + 1}/${selectedTasks.length})
          </p>
          <div class="target-word" style="font-size: 2.5rem; text-align: center; margin: var(--space-xl) 0; font-family: 'Fredoka One', cursive; color: var(--color-primary);">
            ${currentTask.word}
          </div>
          <div class="options-grid" style="display: flex; justify-content: center; gap: var(--space-md); flex-wrap: wrap;">
            <button class="btn btn-secondary tense-btn" data-tense="vergangenheit">Vergangenheit 🕰️</button>
            <button class="btn btn-secondary tense-btn" data-tense="gegenwart">Gegenwart ⏳</button>
            <button class="btn btn-secondary tense-btn" data-tense="zukunft">Zukunft 🚀</button>
          </div>
        </div>
      `;

      container.querySelectorAll('.tense-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const selected = btn.dataset.tense;
          const isCorrect = selected === currentTask.category;
          
          if (isCorrect) correctCount++;

          btn.style.background = isCorrect ? 'var(--color-success)' : 'var(--color-error)';
          btn.style.color = '#fff';

          container.querySelectorAll('.tense-btn').forEach(b => {
             b.style.pointerEvents = 'none';
             if (!isCorrect && b.dataset.tense === currentTask.category) {
                 b.style.border = '4px solid var(--color-success)';
             }
          });

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
