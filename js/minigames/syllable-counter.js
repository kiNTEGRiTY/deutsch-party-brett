/**
 * Mini-Game: Syllable Counter (Silben-Hüpfer)
 * 
 * Players are shown a word and have to tap the correct number of syllables.
 */

export const SyllableCounter = {
  id: 'syllable-counter',
  name_de: 'Silben-Zähler',
  topics: ['silben'],

  setup(container, task, onComplete) {
    const content = task.content;
    const words = content.words;
    
    if (!words || words.length === 0) {
      // Fallback if no words provided
      onComplete({ correct: false, score: 0 });
      return;
    }

    // Pick a random word
    const wordObj = words[Math.floor(Math.random() * words.length)];
    const word = wordObj.word;
    const correctCount = wordObj.syllables.length;

    // Render
    container.innerHTML = `
      <div class="minigame-body">
        <p style="text-align:center; font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-md);">
          Wie viele Silben (Klatscher) hat dieses Wort?
        </p>
        <div class="target-word" style="font-size: 3rem; text-align: center; margin: var(--space-xl) 0; font-family: 'Fredoka One', cursive; color: var(--color-primary);">
          ${word}
        </div>
        <div class="options-grid" style="display: flex; justify-content: center; gap: var(--space-md);">
          ${[1, 2, 3, 4].map(num => `
            <button class="btn btn-secondary syllable-btn" data-num="${num}" style="font-size: 2rem; width: 80px; height: 80px; border-radius: 50%;">
              ${num}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Handlers
    container.querySelectorAll('.syllable-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = parseInt(btn.dataset.num, 10);
        const isCorrect = selected === correctCount;
        
        btn.style.background = isCorrect ? 'var(--color-success)' : 'var(--color-error)';
        btn.style.color = '#fff';

        // Disable all buttons
        container.querySelectorAll('.syllable-btn').forEach(b => {
          b.style.pointerEvents = 'none';
          if (!isCorrect && parseInt(b.dataset.num, 10) === correctCount) {
             // Show correct one if wrong
             b.style.border = '4px solid var(--color-success)';
          }
        });

        setTimeout(() => {
          onComplete({
            correct: isCorrect,
            score: isCorrect ? 100 : 0
          });
        }, 1200);
      });
    });
  }
};
