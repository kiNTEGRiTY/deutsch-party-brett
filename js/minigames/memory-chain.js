/**
 * Mini-Game: Memory Chain (Koffer packen)
 * 
 * "Ich packe meinen Koffer..." style memory sequence game.
 */

export const MemoryChain = {
  id: 'memory-chain',
  name_de: 'Koffer packen',
  topics: ['wortschatz', 'konzentration'],

  setup(container, task, onComplete) {
    const wordPool = ['Apfel', 'Banane', 'Brille', 'Buch', 'Hund', 'Katze', 'Ball', 'Schuh', 'Tisch', 'Stuhl', 'Sonne', 'Mond'];
    // Randomly select 6 words for the pool 
    const pool = [...wordPool].sort(() => Math.random() - 0.5).slice(0, 6);
    
    let sequence = [];
    let playerSequence = [];
    let currentRound = 1;
    const maxRounds = 4;
    let isShowingSequence = false;

    container.innerHTML = `
      <div class="mem-container" style="padding: var(--space-md); text-align: center; user-select:none; max-width: 600px; margin: 0 auto;">
        <div style="font-size: 3rem; margin-bottom: 10px;">🧳</div>
        <p id="mem-status" style="font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-lg); font-weight: bold;">
          Merke dir die Reihenfolge!
        </p>

        <div id="mem-display" style="height: 100px; display:flex; align-items:center; justify-content:center; font-size: 2.5rem; font-weight:bold; color: #2980b9; background:#ecf0f1; border-radius:12px; margin-bottom: 20px;">
            ...
        </div>

        <div id="mem-buttons" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; opacity: 0.5; pointer-events: none;">
            ${pool.map(word => `
                <button class="mem-btn" data-word="${word}" style="padding: 15px 5px; font-size: 1.1rem; border-radius: 8px; background: #34495e; color: white; border: none; box-shadow: 0 4px 0 #2c3e50; transition: transform 0.1s;">
                    ${word}
                </button>
            `).join('')}
        </div>
      </div>
    `;

    const display = container.querySelector('#mem-display');
    const buttonsGrid = container.querySelector('#mem-buttons');
    const status = container.querySelector('#mem-status');

    function startRound() {
        // Add one more to sequence
        sequence.push(pool[Math.floor(Math.random() * pool.length)]);
        playerSequence = [];
        isShowingSequence = true;
        buttonsGrid.style.opacity = '0.5';
        buttonsGrid.style.pointerEvents = 'none';
        status.textContent = 'Merken...';
        
        let step = 0;
        display.textContent = '...';

        const showInterval = setInterval(() => {
            if (step >= sequence.length) {
                clearInterval(showInterval);
                display.textContent = '?';
                isShowingSequence = false;
                buttonsGrid.style.opacity = '1';
                buttonsGrid.style.pointerEvents = 'auto';
                status.textContent = 'Jetzt du! (1/' + sequence.length + ')';
                return;
            }

            // Blink effect
            display.textContent = '';
            setTimeout(() => {
                display.textContent = sequence[step];
                step++;
            }, 200);
        }, 1200);
    }

    container.querySelectorAll('.mem-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (isShowingSequence) return;
            
            // Interaction visual
            btn.style.transform = 'translateY(4px)';
            btn.style.boxShadow = 'none';
            setTimeout(() => {
                btn.style.transform = 'none';
                btn.style.boxShadow = '0 4px 0 #2c3e50';
            }, 100);

            const clickedWord = btn.dataset.word;
            playerSequence.push(clickedWord);

            // Check correctness
            const currentIndex = playerSequence.length - 1;
            if (sequence[currentIndex] !== clickedWord) {
                // Wrong!
                status.textContent = 'FALSCH!';
                status.style.color = '#e74c3c';
                display.textContent = '💥';
                buttonsGrid.style.pointerEvents = 'none';
                setTimeout(() => {
                    onComplete({ correct: false, score: (currentRound/maxRounds)*100 });
                }, 1500);
                return;
            }

            status.textContent = 'Jetzt du! (' + playerSequence.length + '/' + sequence.length + ')';

            // If sequence complete
            if (playerSequence.length === sequence.length) {
                status.textContent = 'Richtig! Nächste Runde...';
                status.style.color = '#2ecc71';
                display.textContent = '✅';
                buttonsGrid.style.pointerEvents = 'none';
                buttonsGrid.style.opacity = '0.5';

                setTimeout(() => {
                    if (currentRound >= maxRounds) {
                        onComplete({ correct: true, score: 100 });
                    } else {
                        currentRound++;
                        status.style.color = 'var(--text-secondary)';
                        startRound();
                    }
                }, 1500);
            }
        });
    });

    // Start after map intro delay
    setTimeout(startRound, 1000);
  }
};
