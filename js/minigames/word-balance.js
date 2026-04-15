/**
 * Mini-Game: Word Balance (Wort-Waage)
 * 
 * Players match opposite words.
 */

export const WordBalance = {
  id: 'word-balance',
  name_de: 'Wort-Waage',
  topics: ['wortschatz', 'adjektive'],

  setup(container, task, onComplete) {
    const dataset = [
        { word: 'heiß', opposite: 'kalt', distractors: ['gelb', 'laut', 'groß'] },
        { word: 'schnell', opposite: 'langsam', distractors: ['traurig', 'klein', 'böse'] },
        { word: 'hell', opposite: 'dunkel', distractors: ['süß', 'hart', 'schön'] },
        { word: 'gut', opposite: 'böse', distractors: ['neu', 'weich', 'kalt'] },
        { word: 'groß', opposite: 'klein', distractors: ['hell', 'schnell', 'sauer'] }
    ];

    const currentTask = dataset[Math.floor(Math.random() * dataset.length)];
    const options = [currentTask.opposite, ...currentTask.distractors].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="balance-container" style="padding: var(--space-md); text-align: center; user-select:none;">
        <p style="font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-lg);">
          Bringe die Waage mit dem exakten <b>Gegenteil</b> ins Gleichgewicht!
        </p>

        <!-- Balance Scale Visual -->
        <div style="display:flex; justify-content: space-around; margin-bottom: 10px; align-items:flex-end; height: 100px;">
            <div style="background:#e74c3c; color:white; padding: 20px; border-radius: 50%; width: 100px; height: 100px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.5rem; transform: translateY(20px);">
                ${currentTask.word}
            </div>
            <div id="target-scale" style="background:rgba(0,0,0,0.1); border: 2px dashed #95a5a6; color:#7f8c8d; padding: 20px; border-radius: 50%; width: 100px; height: 100px; display:flex; align-items:center; justify-content:center; font-size:2rem; transform: translateY(-20px);">
                ?
            </div>
        </div>
        
        <div style="width:100%; max-width:300px; height:4px; background:#7f8c8d; margin: 0 auto 40px auto; transform: rotate(10deg);"></div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            ${options.map(opt => `
                <button class="btn bal-btn" data-word="${opt}" style="font-size:1.2rem; padding:12px 24px; border-radius:8px; background:#3498db; color:white; border:none; box-shadow: 0 4px 0 #2980b9;">
                    ${opt}
                </button>
            `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.bal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isCorrect = btn.dataset.word === currentTask.opposite;
            const target = container.querySelector('#target-scale');

            target.textContent = btn.dataset.word;
            target.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
            target.style.color = 'white';
            target.style.border = 'none';

            // "Balance" animation
            const bar = container.querySelector('div[style*="rotate(10deg)"]');
            if(isCorrect) {
                 bar.style.transform = 'rotate(0deg)';
                 bar.style.transition = 'transform 0.5s ease';
                 target.style.transform = 'translateY(20px)';
                 target.style.transition = 'transform 0.5s ease';
            }

            container.querySelectorAll('.bal-btn').forEach(b => b.style.pointerEvents = 'none');

            setTimeout(() => {
                onComplete({
                    correct: isCorrect,
                    score: isCorrect ? 100 : 0
                });
            }, 1800);
        });
    });
  }
};
