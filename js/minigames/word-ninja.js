/**
 * Mini-Game: Word Ninja (Wort-Ninja)
 * 
 * Arcade style slice game. Nouns fly up, players swipe them. Avoid Verbs!
 */

export const WordNinja = {
  id: 'word-ninja',
  name_de: 'Wort-Ninja',
  topics: ['wortarten', 'wortschatz', 'nomen'],

  setup(container, task, onComplete) {
    const content = task.content;
    
    // We need a mixed set to have targets (Nouns) and bombs (Verbs)
    let mixedSet;
    if (content.mixedSets && content.mixedSets.length > 0) {
      mixedSet = content.mixedSets[Math.floor(Math.random() * content.mixedSets.length)];
    } else {
      onComplete({ correct: false, score: 0 });
      return;
    }

    const { nomen, verben } = mixedSet;
    if (!nomen || !verben || nomen.length === 0 || verben.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    let isPlaying = true;
    let score = 0;
    let slicedNouns = 0;
    const targetScore = Math.min(nomen.length, 5); // We spawn exactly targetScore nouns
    let spawnedNouns = 0;
    let lives = 3;

    // Build UI
    container.innerHTML = `
      <div class="ninja-container" style="position: relative; width: 100%; height: 60vh; max-height: 500px; background: #2c3e50; border-radius: 16px; overflow: hidden; touch-action: none; user-select: none;">
        
        <!-- HUD -->
        <div style="position: absolute; top: 10px; left: 10px; color: white; z-index: 10; font-family: 'Fredoka One', cursive; text-shadow: 1px 1px 2px black;">
           <div>Punkte: <span id="ninja-score">0</span>/${targetScore}</div>
           <div style="font-size: 0.8em; color: #ecf0f1;">Schneide NOMEN!</div>
        </div>
        <div style="position: absolute; top: 10px; right: 10px; color: #e74c3c; z-index: 10; font-size: 1.5rem; text-shadow: 1px 1px 2px black;">
           <span id="ninja-lives">❤️❤️❤️</span>
        </div>

        <!-- Overlay -->
        <div id="ninja-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; flex-direction: column;">
            <p style="color: white; font-size: 1.5rem; text-align: center; font-family: 'Fredoka One';">Markiere die NOMEN!<br><span style="font-size: 1rem; color:#e74c3c">Achtung vor den Verben!</span></p>
            <button id="ninja-start-btn" class="btn btn-primary btn-lg mt-3">Start</button>
        </div>

        <div id="ninja-game-area" style="position: absolute; inset: 0; overflow: hidden;"></div>
      </div>
    `;

    const gameArea = container.querySelector('#ninja-game-area');
    const scoreEl = container.querySelector('#ninja-score');
    const livesEl = container.querySelector('#ninja-lives');
    let gameLoopInterval;

    function endGame(won) {
      if (!isPlaying) return;
      isPlaying = false;
      clearInterval(gameLoopInterval);
      
      const overlay = container.querySelector('#ninja-overlay');
      overlay.style.display = 'flex';
      overlay.innerHTML = `<h2 style="color:white">${won ? 'Geschafft! 🎉' : 'Game Over 💥'}</h2>`;

      setTimeout(() => {
        onComplete({
          correct: won,
          partial: !won && score > 0,
          score: Math.round((score / targetScore) * 100),
          details: { lives, score }
        });
      }, 1500);
    }

    function spawnWord() {
      if (!isPlaying) return;

      // Decide if noun (target) or verb (bomb)
      // If we still need to spawn nouns, 60% chance for noun
      const isBomb = (spawnedNouns >= targetScore) || (Math.random() > 0.6);
      
      let wordText = "";
      if (isBomb) {
        wordText = verben[Math.floor(Math.random() * verben.length)];
      } else {
        wordText = nomen[spawnedNouns % nomen.length];
        spawnedNouns++;
      }

      const el = document.createElement('div');
      el.textContent = wordText;
      // Style
      Object.assign(el.style, {
        position: 'absolute',
        bottom: '-50px',
        left: `${10 + Math.random() * 60}%`,
        padding: '10px 20px',
        background: 'white',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        border: '3px solid',
        borderColor: isBomb ? '#e74c3c' : '#3498db',
        cursor: 'crosshair',
        transition: 'transform 0.1s',
        userSelect: 'none'
      });
      
      gameArea.appendChild(el);

      // Simple physics: throw upwards, land
      let posY = -50; // starts below container
      let posX = parseFloat(el.style.left);
      let velocityY = 12 + Math.random() * 4; // jump power
      let velocityX = (Math.random() - 0.5) * 4; // slight horizontal movement

      const gravity = 0.2;
      let sliced = false;

      function update() {
        if (!isPlaying) return;
        velocityY -= gravity;
        posY += velocityY;
        posX += velocityX;

        el.style.bottom = `${posY}px`;
        el.style.left = `${posX}%`;

        // If it falls below screen
        if (posY < -100) {
          el.remove();
          // If a noun was missed, we don't lose lives, but we missed a target.
          // For simplicity, just respawn it later if it was a noun
          if (!isBomb && !sliced && isPlaying) {
             spawnedNouns--; // Have another go at it
          }
          return;
        }

        requestAnimationFrame(update);
      }

      requestAnimationFrame(update);

      // Interaction (mouse over / touch)
      const handleSlice = (e) => {
        if (sliced || !isPlaying) return;
        e.preventDefault();
        sliced = true;

        if (isBomb) {
          // Hit a bomb
          lives--;
          livesEl.textContent = '❤️'.repeat(Math.max(0, lives));
          el.style.background = '#e74c3c';
          el.style.color = 'white';
          
          if (lives <= 0) {
            endGame(false);
          }
        } else {
          // Hit a noun
          score++;
          slicedNouns++;
          scoreEl.textContent = score;
          
          // Sliced animation
          el.style.transform = 'scale(1.2) rotate(15deg)';
          el.style.background = '#2ecc71';
          el.style.color = 'white';
          el.style.opacity = '0';
          el.style.transition = 'all 0.3s ease';

          if (score >= targetScore) {
            endGame(true);
          }
        }
      };

      el.addEventListener('pointerdown', handleSlice);
      el.addEventListener('pointerenter', (e) => {
          // Pointer enter acts like a swipe if mouse is down
          if (e.buttons > 0) handleSlice(e);
      });
    }

    container.querySelector('#ninja-start-btn').addEventListener('click', () => {
      container.querySelector('#ninja-overlay').style.display = 'none';
      // Start spawning
      gameLoopInterval = setInterval(() => {
        if (isPlaying && (Math.random() > 0.3)) {
          spawnWord();
        }
      }, 800);
    });
  }
};
