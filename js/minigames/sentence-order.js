/**
 * Mini-Game: Sentence Order
 * 
 * Players arrange shuffled words into the correct sentence order.
 */

export const SentenceOrder = {
  id: 'sentence-order',
  name_de: 'Sätze ordnen',
  topics: ['satzbau'],

  setup(container, task, onComplete) {
    const content = task.content;
    const sentences = content.sentenceOrder;
    
    if (!sentences || sentences.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    const item = sentences[Math.floor(Math.random() * sentences.length)];
    const shuffledWords = [...item.words].sort(() => Math.random() - 0.5);
    const selectedWords = [];

    function render() {
      container.innerHTML = `
        <div class="minigame-body">
          <div class="drag-zone" id="sentence-target" style="min-height: 60px; margin-bottom: var(--space-xl);">
            ${selectedWords.map((w, i) => `
              <button class="drag-word placed selected-word" data-index="${i}" data-word="${w}">${w}</button>
            `).join('')}
            ${selectedWords.length === 0 ? '<span style="color: var(--text-light);">Tippe die Wörter in der richtigen Reihenfolge an</span>' : ''}
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:var(--space-sm); justify-content:center;">
            ${shuffledWords.map((w, i) => {
              const isUsed = selectedWords.includes(w) && 
                selectedWords.filter(x => x === w).length >= shuffledWords.filter((x, j) => x === w && j <= i).length;
              return `
                <button class="drag-word word-source ${isUsed ? 'used' : ''}" 
                        data-word="${w}" data-sindex="${i}"
                        ${isUsed ? 'disabled style="opacity:0.3; pointer-events:none;"' : ''}>
                  ${w}
                </button>
              `;
            }).join('')}
          </div>
          <div style="display:flex; gap:var(--space-md); justify-content:center; margin-top: var(--space-xl);">
            <button class="btn btn-secondary btn-sm" id="reset-btn">🔄 Nochmal</button>
            <button class="btn btn-primary btn-sm" id="check-btn" ${selectedWords.length !== item.words.length ? 'disabled' : ''}>
              ✓ Prüfen
            </button>
          </div>
          <div id="feedback-area" style="text-align:center; margin-top: var(--space-md); min-height: 40px;"></div>
        </div>
      `;

      // Add word to sentence
      container.querySelectorAll('.word-source:not(.used)').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedWords.push(btn.dataset.word);
          render();
        });
      });

      // Remove word from sentence
      container.querySelectorAll('.selected-word').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedWords.splice(parseInt(btn.dataset.index), 1);
          render();
        });
      });

      // Reset
      const resetBtn = container.querySelector('#reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          selectedWords.length = 0;
          render();
        });
      }

      // Check
      const checkBtn = container.querySelector('#check-btn');
      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          const attempt = selectedWords.join(' ');
          const correctBase = item.correct.replace(/[.!?]$/, '');
          const isCorrect = attempt === item.words.join(' ');
          
          const feedbackArea = document.getElementById('feedback-area');
          if (isCorrect) {
            feedbackArea.innerHTML = `
              <span style="color: var(--color-success); font-weight: bold; font-size: var(--font-size-lg);">
                Richtig! 🎉 "${item.correct}"
              </span>`;
          } else {
            feedbackArea.innerHTML = `
              <span style="color: var(--color-error); font-weight: bold; font-size: var(--font-size-md);">
                Nicht ganz! Die Lösung ist: "${item.correct}"
              </span>`;
          }

          setTimeout(() => {
            onComplete({
              correct: isCorrect,
              partial: false,
              score: isCorrect ? 100 : 0
            });
          }, 2000);
        });
      }
    }

    render();
  }
};
