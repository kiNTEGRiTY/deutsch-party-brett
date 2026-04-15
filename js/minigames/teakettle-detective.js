/**
 * Mini-Game: Teakettle Detective (Teekesselchen)
 * 
 * Players figure out the homonym based on two clues.
 */

export const TeakettleDetective = {
  id: 'teakettle-detective',
  name_de: 'Teekesselchen',
  topics: ['wortschatz'],

  setup(container, task, onComplete) {
    // Hardcoded dataset for "Teekesselchen"
    const dataset = [
        { word: 'Bank', clue1: 'Man kann sich darauf setzen.', clue2: 'Man holt dort Geld ab.', distractors: ['Stuhl', 'Kasse', 'Bett'] },
        { word: 'Schloss', clue1: 'Eine Prinzessin wohnt darin.', clue2: 'Man schließt damit eine Tür ab.', distractors: ['Schlüssel', 'Märchen', 'Haus'] },
        { word: 'Maus', clue1: 'Ein kleines Tier mit langem Schwanz.', clue2: 'Ein Gerät für den Computer.', distractors: ['Ratte', 'Tastatur', 'Kabel'] },
        { word: 'Schlange', clue1: 'Ein langes, kriechendes Tier.', clue2: 'Menschen stehen dort an der Kasse.', distractors: ['Seil', 'Wurm', 'Reihe'] }
    ];

    const currentTask = dataset[Math.floor(Math.random() * dataset.length)];
    const options = [currentTask.word, ...currentTask.distractors].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="teakettle-container" style="padding: var(--space-md); text-align: center; user-select:none;">
        <div style="font-size: 3rem; margin-bottom: 10px;">🕵️‍♂️ ☕</div>
        <p style="font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-xl);">
          Mein Teekesselchen ist...
        </p>

        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom: 30px;">
            <div style="background:#f1c40f; padding: 15px; border-radius:8px; font-weight:bold; font-size:1.2rem; color:#d35400;">1. ${currentTask.clue1}</div>
            <div style="background:#e67e22; padding: 15px; border-radius:8px; font-weight:bold; font-size:1.2rem; color:#fff;">2. ${currentTask.clue2}</div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            ${options.map(opt => `
                <button class="btn tk-btn" data-word="${opt}" style="font-size:1.2rem; padding:15px 30px; border-radius:20px; background:#34495e; color:white; border:none; box-shadow: 0 4px 0 #2c3e50;">
                    ${opt}
                </button>
            `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.tk-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isCorrect = btn.dataset.word === currentTask.word;
            
            btn.style.transform = 'translateY(4px)';
            btn.style.boxShadow = 'none';

            if (isCorrect) {
                btn.style.background = '#2ecc71';
            } else {
                btn.style.background = '#e74c3c';
                const correctBtn = container.querySelector(`.tk-btn[data-word="${currentTask.word}"]`);
                if(correctBtn) correctBtn.style.border = '3px solid #2ecc71';
            }

            container.querySelectorAll('.tk-btn').forEach(b => b.style.pointerEvents = 'none');

            setTimeout(() => {
                onComplete({
                    correct: isCorrect,
                    score: isCorrect ? 100 : 0
                });
            }, 1500);
        });
    });
  }
};
