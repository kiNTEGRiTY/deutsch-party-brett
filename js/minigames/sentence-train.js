/**
 * Mini-Game: Sentence Train (Satz-Zug)
 * 
 * Players order words to form a correct sentence.
 */

export const SentenceTrain = {
  id: 'sentence-train',
  name_de: 'Satz-Zug',
  topics: ['satzbau'],

  setup(container, task, onComplete) {
    const content = task.content; // from satzbau topic
    let sentences = [];
    if (content.sentenceOrder) {
        sentences = content.sentenceOrder;
    } else {
        sentences = [
            ['Der', 'Hund', 'bellt', 'laut', '.'],
            ['Ich', 'gehe', 'in', 'die', 'Schule', '.']
        ];
    }

    const currentTask = sentences[Math.floor(Math.random() * sentences.length)];
    const words = [...currentTask]; // already split into parts in existing logic
    
    // We shuffle but ensure it's not accidentally correct
    let shuffledWords = [...words].sort(() => Math.random() - 0.5);
    while (JSON.stringify(shuffledWords) === JSON.stringify(words) && words.length > 1) {
        shuffledWords = [...words].sort(() => Math.random() - 0.5);
    }

    let selectedWagons = [];

    container.innerHTML = `
      <div class="train-container" style="padding: var(--space-md); text-align: center; user-select:none;">
        <p style="font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-lg);">
          Belade den Zug in der richtigen Reihenfolge!
        </p>

        <!-- Train Track & Wagons -->
        <div style="background: #ecf0f1; border-bottom: 4px solid #7f8c8d; padding: 20px 10px; min-height: 120px; display: flex; align-items: flex-end; gap: 5px; flex-wrap: wrap; margin-bottom: var(--space-xl); border-radius: 8px;">
            <div style="font-size: 3rem; margin-right: 10px;">🚂</div>
            <div id="train-wagons" style="display: flex; gap: 5px; flex-wrap: wrap; align-items: flex-end;"></div>
        </div>

        <!-- Word Bank (Cargo) -->
        <div id="cargo-area" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: var(--space-xl);">
            ${shuffledWords.map((word, i) => `
                <button class="cargo-btn btn btn-secondary" data-word="${word.replace(/"/g, '&quot;')}" style="font-size: 1.2rem; padding: 10px 20px; border-radius: 8px; box-shadow: 0 4px 0 var(--color-secondary-dark);">
                    📦 ${word}
                </button>
            `).join('')}
        </div>

        <!-- Submit Switch -->
        <button id="train-submit" class="btn btn-primary btn-lg" style="width: 100%; max-width: 300px; display:none;">
            Abfahrt! 🚦
        </button>
      </div>
    `;

    const wagonsContainer = container.querySelector('#train-wagons');
    const cargoArea = container.querySelector('#cargo-area');
    const submitBtn = container.querySelector('#train-submit');

    function renderWagons() {
        wagonsContainer.innerHTML = selectedWagons.map((word, idx) => `
            <div class="wagon-item" data-idx="${idx}" style="background: #3498db; color: white; padding: 10px 15px; border-radius: 4px 4px 0 0; font-weight: bold; border: 2px solid #2980b9; cursor: pointer; position:relative;">
                ${word}
                <div style="position:absolute; bottom: -8px; left: 10px; width:10px; height:10px; background:#333; border-radius:50%;"></div>
                <div style="position:absolute; bottom: -8px; right: 10px; width:10px; height:10px; background:#333; border-radius:50%;"></div>
            </div>
        `).join('');

        // Wagon click to return cargo
        container.querySelectorAll('.wagon-item').forEach(wagon => {
            wagon.addEventListener('click', () => {
                const w = selectedWagons.splice(wagon.dataset.idx, 1)[0];
                const btn = container.querySelector(`.cargo-btn[data-word="${w.replace(/"/g, '\\"')}"]`);
                if(btn) {
                    btn.style.visibility = 'visible';
                }
                renderWagons();
            });
        });

        if (selectedWagons.length === words.length) {
            submitBtn.style.display = 'inline-block';
        } else {
            submitBtn.style.display = 'none';
        }
    }

    container.querySelectorAll('.cargo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedWagons.push(btn.dataset.word);
            btn.style.visibility = 'hidden';
            renderWagons();
        });
    });

    submitBtn.addEventListener('click', () => {
        const isCorrect = JSON.stringify(selectedWagons) === JSON.stringify(words);
        
        if (isCorrect) {
            container.querySelectorAll('.wagon-item').forEach(w => w.style.background = '#2ecc71');
        } else {
            container.querySelectorAll('.wagon-item').forEach(w => w.style.background = '#e74c3c');
        }

        setTimeout(() => {
            onComplete({
                correct: isCorrect,
                score: isCorrect ? 100 : 0
            });
        }, 1500);
    });
  }
};
