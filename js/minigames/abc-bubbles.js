/**
 * Mini-Game: ABC Bubbles (ABC-Blasen)
 * 
 * Float up bubbles containing letters. Player must pop them in alphabetical order.
 */

export const AbcBubbles = {
  id: 'abc-bubbles',
  name_de: 'ABC-Blasen',
  topics: ['alphabet', 'konzentration'],

  setup(container, task, onComplete) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const startIndex = Math.floor(Math.random() * (alphabet.length - 5));
    const targetSequence = alphabet.slice(startIndex, startIndex + 5);
    
    let currentIdx = 0;
    let isPlaying = false;
    let animationFrame = 0;
    let gameHeight = 0;
    let cleanupDone = false;
    let resizeObserver = null;
    let bubbles = [];
    const pendingTimeouts = new Set();
    const listeners = new AbortController();
    const { signal } = listeners;

    container.innerHTML = `
      <div class="bubbles-container" style="position: relative; width: 100%; height: 60vh; max-height: 500px; background: linear-gradient(to top, #3498db, #ecf0f1); border-radius: 16px; overflow: hidden; touch-action: none;">
        
        <!-- Target tracker -->
        <div style="position: absolute; top: 10px; width:100%; text-align:center; z-index: 10; font-family: 'Fredoka One', cursive;">
            <div style="background: rgba(255,255,255,0.7); display:inline-block; padding: 5px 15px; border-radius: 20px;">
                Nächster Buchstabe: <span id="bbl-target" style="font-size: 1.5rem; color: #e74c3c;">${targetSequence[currentIdx]}</span>
            </div>
        </div>

        <!-- Overlay -->
        <div id="bbl-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 50; display: flex; align-items: center; justify-content: center; flex-direction: column;">
            <p style="color: white; font-size: 1.5rem; text-align: center; font-family: 'Fredoka One';">Zerplatze die Blasen<br>im ABC!</p>
            <p style="color: yellow; text-align:center; margin-bottom: 20px;">${targetSequence.join(' ➔ ')}</p>
            <button id="bbl-start-btn" class="btn btn-primary btn-lg">Start</button>
        </div>

        <div id="bbl-game-area" style="position: absolute; inset: 0; overflow: hidden;"></div>
      </div>
    `;

    const gameArea = container.querySelector('#bbl-game-area');
    const targetEl = container.querySelector('#bbl-target');

    function scheduleTimeout(callback, delay) {
      const timeoutId = window.setTimeout(() => {
        pendingTimeouts.delete(timeoutId);
        callback();
      }, delay);
      pendingTimeouts.add(timeoutId);
      return timeoutId;
    }

    function measureArea() {
      gameHeight = gameArea.clientHeight || container.clientHeight || 500;
    }

    function cleanup() {
      if (cleanupDone) return;
      cleanupDone = true;
      isPlaying = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      pendingTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      pendingTimeouts.clear();
      listeners.abort();
      resizeObserver?.disconnect();
      resizeObserver = null;
      bubbles.forEach((bubble) => bubble.el.remove());
      bubbles = [];

      if (container.__minigameCleanup === cleanup) {
        delete container.__minigameCleanup;
      }
    }

    function finalize(result, delay = 0) {
      const run = () => {
        cleanup();
        onComplete(result);
      };

      if (delay > 0) {
        scheduleTimeout(run, delay);
      } else {
        run();
      }
    }

    container.__minigameCleanup = cleanup;

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(measureArea);
      resizeObserver.observe(gameArea);
    }
    measureArea();

    function spawnBubble(letter, isCorrect) {
        if (!isPlaying || cleanupDone) return;

        const b = document.createElement('div');
        b.textContent = letter;
        
        const size = 60 + Math.random() * 20;
        const startX = 10 + Math.random() * 70;
        
        Object.assign(b.style, {
            position: 'absolute',
            bottom: '-100px',
            left: `${startX}%`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.4)',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: 'inset -5px -5px 15px rgba(255,255,255,0.5), 0 0 10px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            cursor: 'pointer',
            userSelect: 'none',
            willChange: 'transform, opacity'
        });

        gameArea.appendChild(b);

        const speed = 1 + Math.random() * 1.5;
        const wobble = Math.random() * 2;
        let y = -100;
        let life = 0;

        const obj = { el: b, y, speed, letter, wobble, life, isCorrect };
        bubbles.push(obj);

        b.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (!isPlaying || cleanupDone) return;

            if (letter === targetSequence[currentIdx]) {
                currentIdx++;
                
                b.style.transform = 'scale(1.5)';
                b.style.opacity = '0';
                b.style.transition = 'all 0.2s';
                
                scheduleTimeout(() => b.remove(), 200);
                bubbles = bubbles.filter(item => item !== obj);

                if (currentIdx >= targetSequence.length) {
                    isPlaying = false;
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                        animationFrame = 0;
                    }
                    targetEl.textContent = '🎉';
                    finalize({ correct: true, score: 100 }, 1000);
                } else {
                    targetEl.textContent = targetSequence[currentIdx];
                }
            } else {
                b.style.background = 'rgba(231, 76, 60, 0.6)';
                scheduleTimeout(() => {
                    if (b.parentNode) b.style.background = 'rgba(255, 255, 255, 0.4)';
                }, 300);
            }
        }, { signal });
    }

    function gameLoop() {
        if (!isPlaying || cleanupDone) return;

        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];
            b.y += b.speed;
            b.life += 0.05;
            
            const wobbleX = Math.sin(b.life * b.wobble) * 10;
            
            b.el.style.transform = `translate(${wobbleX}px, ${-b.y}px)`;

            if (b.y > gameHeight + 150) {
                b.el.remove();
                bubbles.splice(i, 1);
                
                if (b.letter === targetSequence[currentIdx]) {
                    isPlaying = false;
                    finalize({ correct: false, score: 0 }, 500);
                    return;
                }
            }
        }

        if (Math.random() < 0.02 && bubbles.length < 5) {
            const hasTarget = bubbles.some(b => b.letter === targetSequence[currentIdx]);
            if (!hasTarget) {
                spawnBubble(targetSequence[currentIdx], true);
            } else {
                const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
                spawnBubble(randomLetter, false);
            }
        }

        animationFrame = requestAnimationFrame(gameLoop);
    }

    container.querySelector('#bbl-start-btn').addEventListener('click', () => {
        container.querySelector('#bbl-overlay').style.display = 'none';
        isPlaying = true;
        measureArea();
        gameLoop();
    }, { signal });

    return {
      destroy: cleanup,
      cleanup
    };
  }
};
