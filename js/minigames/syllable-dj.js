/**
 * Mini-Game: Syllable DJ (Silben-DJ)
 * 
 * Players construct a word from syllables.
 */

export const SyllableDj = {
  id: 'syllable-dj',
  name_de: 'Silben-DJ',
  topics: ['silben', 'wortschatz'],

  setup(container, task, onComplete) {
    const wordList = [
      { word: 'Katze', syllables: ['Kat', 'ze'] },
      { word: 'Auto', syllables: ['Au', 'to'] },
      { word: 'Schule', syllables: ['Schu', 'le'] },
      { word: 'Garten', syllables: ['Gar', 'ten'] }
    ];
    
    const target = wordList[Math.floor(Math.random() * wordList.length)];
    // Distractors
    const allSyl1 = wordList.map(w => w.syllables[0]).sort(() => Math.random() - 0.5);
    const allSyl2 = wordList.map(w => w.syllables[1]).sort(() => Math.random() - 0.5);

    let idx1 = allSyl1.indexOf(target.syllables[0]);
    let idx2 = allSyl2.indexOf(target.syllables[1]);

    container.innerHTML = `
      <div class="dj-container" style="padding: var(--space-md); text-align: center; user-select:none; max-width: 600px; margin: 0 auto;">
        <div style="font-size: 3rem; margin-bottom: 10px;">🎧💿</div>
        <p style="font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-lg);">
          Drehe die Platten, um ein Wort zu mischen!
        </p>

        <div style="display:flex; justify-content:center; gap: 20px; align-items:center; margin-bottom: 30px;">
            <!-- Turntable 1 -->
            <div style="display:flex; flex-direction:column; align-items:center;">
                <button id="up1" class="btn btn-secondary" style="margin-bottom:10px;">▲</button>
                <div style="width: 120px; height: 120px; border-radius:50%; background:#2c3e50; border: 5px solid #34495e; display:flex; align-items:center; justify-content:center; color:white; font-size:2rem; font-weight:bold; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                    <span id="syl1">${allSyl1[idx1]}</span>
                </div>
                <button id="down1" class="btn btn-secondary" style="margin-top:10px;">▼</button>
            </div>
            
            <div style="font-size: 2rem; color: #7f8c8d;">+</div>

            <!-- Turntable 2 -->
            <div style="display:flex; flex-direction:column; align-items:center;">
                <button id="up2" class="btn btn-secondary" style="margin-bottom:10px;">▲</button>
                <div style="width: 120px; height: 120px; border-radius:50%; background:#e74c3c; border: 5px solid #c0392b; display:flex; align-items:center; justify-content:center; color:white; font-size:2rem; font-weight:bold; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                    <span id="syl2">${allSyl2[idx2]}</span>
                </div>
                <button id="down2" class="btn btn-secondary" style="margin-top:10px;">▼</button>
            </div>
        </div>

        <button id="dj-play" class="btn btn-primary btn-lg" style="width:200px;">Play! ▶️</button>
      </div>
    `;

    const el1 = container.querySelector('#syl1');
    const el2 = container.querySelector('#syl2');

    container.querySelector('#up1').addEventListener('click', () => {
        idx1 = (idx1 + 1) % allSyl1.length;
        el1.textContent = allSyl1[idx1];
    });
    container.querySelector('#down1').addEventListener('click', () => {
        idx1 = (idx1 - 1 + allSyl1.length) % allSyl1.length;
        el1.textContent = allSyl1[idx1];
    });

    container.querySelector('#up2').addEventListener('click', () => {
        idx2 = (idx2 + 1) % allSyl2.length;
        el2.textContent = allSyl2[idx2];
    });
    container.querySelector('#down2').addEventListener('click', () => {
        idx2 = (idx2 - 1 + allSyl2.length) % allSyl2.length;
        el2.textContent = allSyl2[idx2];
    });

    container.querySelector('#dj-play').addEventListener('click', () => {
        // Valid word created?
        const currentMishmash = el1.textContent + el2.textContent;
        const validMatch = wordList.find(w => w.word === currentMishmash);

        if (validMatch) {
            container.querySelector('#dj-play').style.background = '#2ecc71';
            container.querySelector('#dj-play').textContent = 'Hit! 🎶';
            setTimeout(() => onComplete({ correct: true, score: 100 }), 1500);
        } else {
            container.querySelector('#dj-play').style.background = '#e74c3c';
            container.querySelector('#dj-play').textContent = 'Aua! 💥';
            setTimeout(() => {
                container.querySelector('#dj-play').style.background = '';
                container.querySelector('#dj-play').textContent = 'Play! ▶️';
                onComplete({ correct: false, score: 0 }); // or give another try depending on difficulty
            }, 1000);
        }
    });
  }
};
