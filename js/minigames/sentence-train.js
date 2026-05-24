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
      <div class="train-container train-premium-stage">
        <div class="train-premium-header">
          <div class="premium-kicker">Satzbau-Zug</div>
          <p class="train-premium-prompt">Belade den Zug in der richtigen Reihenfolge!</p>
        </div>

        <div class="train-scene">
          <div class="train-track-glow"></div>
          <div class="train-engine">🚂</div>
          <div id="train-wagons" class="train-wagons"></div>
        </div>

        <div id="cargo-area" class="train-cargo-bank">
          ${shuffledWords.map((word) => `
            <button class="cargo-btn btn btn-secondary train-cargo-button" data-word="${word.replace(/"/g, '&quot;')}" type="button">
              <span>📦</span>
              <strong>${word}</strong>
            </button>
          `).join('')}
        </div>

        <button id="train-submit" class="btn btn-primary btn-lg train-submit-button" type="button" style="display:none;">
          Abfahrt
        </button>
      </div>
    `;

    const wagonsContainer = container.querySelector('#train-wagons');
    const cargoArea = container.querySelector('#cargo-area');
    const submitBtn = container.querySelector('#train-submit');

    function renderWagons() {
        const filled = selectedWagons.map((word, idx) => `
            <button class="wagon-item train-wagon-card" data-idx="${idx}" type="button">
              <span class="train-wagon-label">${word}</span>
              <span class="train-wheel left"></span>
              <span class="train-wheel right"></span>
            </button>
        `).join('');
        const emptySlots = Array.from({ length: Math.max(0, words.length - selectedWagons.length) }, () => `
          <div class="train-wagon-slot">Wort einladen</div>
        `).join('');
        wagonsContainer.innerHTML = `${filled}${emptySlots}`;

        // Wagon click to return cargo
        container.querySelectorAll('.wagon-item').forEach(wagon => {
            wagon.addEventListener('click', () => {
                const w = selectedWagons.splice(wagon.dataset.idx, 1)[0];
                const safeWord = CSS.escape(w);
                const btn = container.querySelector(`.cargo-btn[data-word="${safeWord}"]`);
                if(btn) {
                    btn.style.display = '';
                }
                renderWagons();
            });
        });

        if (selectedWagons.length === words.length) {
            submitBtn.style.display = 'inline-flex';
        } else {
            submitBtn.style.display = 'none';
        }
    }

    container.querySelectorAll('.cargo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedWagons.push(btn.dataset.word);
            btn.style.display = 'none';
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
