/**
 * Mini-Game: Word Meteorites (Wort-Meteoriten)
 * 
 * Arcade style typing game. Words fall down, player must type them quickly.
 */

export const WordMeteorites = {
  id: 'word-meteorites',
  name_de: 'Wort-Meteoriten',
  topics: ['rechtschreibung', 'wortschatz', 'lesen'],

  setup(container, task, onComplete) {
    const content = task.content;
    
    // We need a list of words. Depends on the topic mapped
    let wordList = [];
    if (content.pairs) { // If spelling topic
        wordList = content.pairs.filter(p => !p.wrong).map(p => p.correct || p.word).filter(Boolean);
    } else if (content.words) {
        wordList = content.words;
    } else if (content.mixedSets) {
        wordList = content.mixedSets[0]?.words || [];
    }

    if (!wordList || wordList.length === 0) {
      // Fallback
      wordList = ['Haus', 'Baum', 'Katze', 'Auto', 'Blume'];
    }

    const targetWords = [...wordList].sort(() => Math.random() - 0.5).slice(0, 5); // 5 meteorites
    let isPlaying = false;
    let score = 0;
    let currentInput = "";
    let activeMeteors = [];
    let lives = 3;

    container.innerHTML = `
      <div class="meteor-container" style="position: relative; width: 100%; height: 60vh; max-height: 500px; background: #000; border-radius: 16px; overflow: hidden; touch-action: none;">
        
        <!-- Stars Background -->
        <div style="position:absolute; inset:0; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 20px 20px; opacity: 0.3;"></div>

        <!-- HUD -->
        <div style="position: absolute; top: 10px; left: 10px; color: white; z-index: 10; font-family: 'Fredoka One', cursive;">
           <div>Punkte: <span id="met-score">0</span>/${targetWords.length}</div>
        </div>
        <div style="position: absolute; top: 10px; right: 10px; color: #e74c3c; z-index: 10; font-size: 1.5rem;">
           <span id="met-lives">❤️❤️❤️</span>
        </div>

        <!-- Overlay -->
        <div id="met-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.8); z-index: 50; display: flex; align-items: center; justify-content: center; flex-direction: column;">
            <p style="color: white; font-size: 1.5rem; text-align: center; font-family: 'Fredoka One';">Tippe die Wörter ab, <br>bevor sie einschlagen!</p>
            <button id="met-start-btn" class="btn btn-primary btn-lg mt-3">Start</button>
        </div>

        <div id="met-game-area" style="position: absolute; top: 0; left: 0; right: 0; bottom: 80px; overflow: hidden;"></div>

        <!-- Ground/City -->
        <div style="position:absolute; bottom: 80px; width: 100%; height: 4px; background: #2ecc71;"></div>

        <!-- Input Area -->
        <div style="position: absolute; bottom: 0; width: 100%; height: 80px; background: #222; display:flex; align-items:center; justify-content:center; padding: 0 10px;">
            <input type="text" id="met-input" placeholder="Tippe hier..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" 
                style="width: 100%; max-width: 300px; padding: 10px; border-radius: 8px; border: 2px solid #3498db; font-size: 1.5rem; text-align:center;">
        </div>
      </div>
    `;

    const gameArea = container.querySelector('#met-game-area');
    const inputEl = container.querySelector('#met-input');
    const scoreEl = container.querySelector('#met-score');
    const livesEl = container.querySelector('#met-lives');
    let spawnedCount = 0;
    let gameLoopFrame;

    function endGame(won) {
      if (!isPlaying) return;
      isPlaying = false;
      cancelAnimationFrame(gameLoopFrame);
      inputEl.blur();
      
      const overlay = container.querySelector('#met-overlay');
      overlay.style.display = 'flex';
      overlay.innerHTML = `<h2 style="color:white">${won ? 'Erde gerettet! 🌍' : 'Game Over 💥'}</h2>`;

      setTimeout(() => {
        onComplete({
          correct: won || score >= targetWords.length * 0.8,
          partial: !won && score > 0,
          score: Math.round((score / targetWords.length) * 100),
          details: { lives, score }
        });
      }, 1500);
    }

    function spawnMeteor() {
      if (!isPlaying || spawnedCount >= targetWords.length) return;

      const word = targetWords[spawnedCount];
      spawnedCount++;

      const el = document.createElement('div');
      el.innerHTML = `<span class="met-typed" style="color: #f1c40f;"></span><span class="met-untyped" style="color: white;">${word}</span>`;
      
      // Starting position
      const startX = 10 + Math.random() * 60;
      Object.assign(el.style, {
        position: 'absolute',
        top: '-40px',
        left: `${startX}%`,
        padding: '5px 15px',
        background: '#e74c3c', // fiery red
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        boxShadow: '0 4px 15px #e74c3c',
        transition: 'none'
      });
      
      gameArea.appendChild(el);

      activeMeteors.push({ el, word, posY: -40, speed: 0.5 + Math.random() * 0.5 });
    }

    function update() {
      if (!isPlaying) return;

      // Spawn mechanic - simple interval check based on active count
      if (activeMeteors.length === 0 || (activeMeteors.length < 2 && Math.random() < 0.01)) {
         spawnMeteor();
      }

      // Move meteors
      for (let i = activeMeteors.length - 1; i >= 0; i--) {
        const met = activeMeteors[i];
        met.posY += met.speed;
        met.el.style.top = `${met.posY}px`;

        // Check if hit ground
        const bottomY = gameArea.clientHeight;
        if (met.posY > bottomY - 30) {
            // Earth takes damage
            met.el.remove();
            activeMeteors.splice(i, 1);
            lives--;
            livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
            
            // flash container red
            gameArea.style.background = 'rgba(231, 76, 60, 0.3)';
            setTimeout(() => gameArea.style.background = 'transparent', 200);

            if (lives <= 0) {
                endGame(false);
                return;
            } else if (spawnedCount >= targetWords.length && activeMeteors.length === 0) {
                endGame(score > 0);
            }
        }
      }

      // Update typing highlighting (find meteor that starts with currentInput)
      if (currentInput.length > 0) {
         let matchedAny = false;
         activeMeteors.forEach(met => {
             // Case insensitive comparison
             if (met.word.toLowerCase().startsWith(currentInput.toLowerCase())) {
                 matchedAny = true;
                 met.el.querySelector('.met-typed').textContent = met.word.substring(0, currentInput.length);
                 met.el.querySelector('.met-untyped').textContent = met.word.substring(currentInput.length);
                 
                 // If fully typed -> destroy
                 if (currentInput.toLowerCase() === met.word.toLowerCase()) {
                     score++;
                     scoreEl.textContent = score;
                     
                     // Explosion effect
                     met.el.style.background = 'white';
                     met.el.style.boxShadow = '0 0 20px white';
                     met.el.style.transform = 'scale(1.5)';
                     met.el.style.opacity = '0';
                     
                     setTimeout(() => met.el.remove(), 200);
                     activeMeteors = activeMeteors.filter(m => m !== met);
                     currentInput = "";
                     inputEl.value = "";
                     
                     if (spawnedCount >= targetWords.length && activeMeteors.length === 0) {
                         endGame(true);
                     }
                 }
             } else {
                 met.el.querySelector('.met-typed').textContent = "";
                 met.el.querySelector('.met-untyped').textContent = met.word;
             }
         });
         
         // If we typed something wrong, turn input red
         if (!matchedAny) {
             inputEl.style.borderColor = '#e74c3c';
         } else {
             inputEl.style.borderColor = '#3498db';
         }
      } else {
         activeMeteors.forEach(met => {
             met.el.querySelector('.met-typed').textContent = "";
             met.el.querySelector('.met-untyped').textContent = met.word;
         });
         inputEl.style.borderColor = '#3498db';
      }

      gameLoopFrame = requestAnimationFrame(update);
    }

    inputEl.addEventListener('input', (e) => {
        currentInput = e.target.value.trim();
    });

    container.querySelector('#met-start-btn').addEventListener('click', () => {
      container.querySelector('#met-overlay').style.display = 'none';
      isPlaying = true;
      inputEl.focus();
      update();
    });
    
    // Auto-focus input on click anywhere in game area
    gameArea.addEventListener('click', () => {
        if(isPlaying) inputEl.focus();
    });
  }
};
