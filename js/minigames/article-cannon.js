/**
 * Mini-Game: Article Cannon (Artikel-Kanone)
 * 
 * Arcade style shooter. Nouns hover, player shoots the correct article.
 */

export const ArticleCannon = {
  id: 'article-cannon',
  name_de: 'Artikel-Kanone',
  topics: ['artikel'],

  setup(container, task, onComplete) {
    const content = task.content || {};
    
    let words = [];
    if (content.quizSets) {
        const set = content.quizSets;
        if (Array.isArray(set) && set[0] && set[0].questions) {
            words = set[0].questions;
        } else if (Array.isArray(set)) {
            words = set;
        }
    }

    if (!words || words.length === 0) {
      words = [
          { word: 'Haus', correct: 'das' },
          { word: 'Baum', correct: 'der' },
          { word: 'Katze', correct: 'die' }
      ];
    }

    const targetWords = [...words].sort(() => Math.random() - 0.5).slice(0, 5);
    
    let isPlaying = false;
    let score = 0;
    let currentIndex = 0;
    let activeTarget = null;
    let activeBullet = null;
    let gameLoopFrame = 0;
    let cleanupDone = false;
    let resizeObserver = null;
    let areaWidth = 0;
    let areaHeight = 0;
    let cannonOriginX = 0;
    let cannonOriginY = 0;
    const pendingTimeouts = new Set();
    const listeners = new AbortController();
    const { signal } = listeners;

    container.innerHTML = `
      <div class="cannon-container" style="position: relative; width: 100%; height: 60vh; max-height: 500px; background: #87CEEB; border-radius: 16px; overflow: hidden; touch-action: none; user-select: none;">
        
        <!-- Score -->
        <div style="position: absolute; top: 10px; left: 10px; color: #2c3e50; z-index: 10; font-family: 'Fredoka One', cursive; text-shadow: 1px 1px 0px white;">
           <div>Treffer: <span id="can-score">0</span>/${targetWords.length}</div>
        </div>

        <!-- Overlay -->
        <div id="can-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.6); z-index: 50; display: flex; align-items: center; justify-content: center; flex-direction: column;">
            <p style="color: white; font-size: 1.5rem; text-align: center; font-family: 'Fredoka One';">Feuere den richtigen<br>Artikel ab!</p>
            <button id="can-start-btn" class="btn btn-primary btn-lg mt-3">Start</button>
        </div>

        <div id="can-game-area" style="position: absolute; inset: 0; overflow: hidden;"></div>

        <!-- Cannon Base structure -->
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 100px; background: #34495e; display: flex; justify-content: center; align-items: flex-end; padding-bottom: 20px;">
           <div style="width: 150px; height: 60px; background: #2c3e50; border-radius: 30px 30px 0 0; position: relative;">
              <!-- Cannon barrel -->
              <div id="can-barrel" style="width: 20px; height: 50px; background: #7f8c8d; position: absolute; top: -30px; left: 65px; transform-origin: bottom center; border-radius: 10px;"></div>
           </div>
        </div>

        <!-- Firing Buttons -->
        <div style="position: absolute; bottom: 15px; left: 0; width: 100%; display: flex; justify-content: center; gap: 20px;">
           <button class="fire-btn" data-art="der" style="width:60px; height:60px; border-radius:50%; font-weight:bold; font-size:1.2rem; background:#3498db; color:white; border:3px solid #2980b9;">der</button>
           <button class="fire-btn" data-art="die" style="width:60px; height:60px; border-radius:50%; font-weight:bold; font-size:1.2rem; background:#e74c3c; color:white; border:3px solid #c0392b;">die</button>
           <button class="fire-btn" data-art="das" style="width:60px; height:60px; border-radius:50%; font-weight:bold; font-size:1.2rem; background:#2ecc71; color:white; border:3px solid #27ae60;">das</button>
        </div>
      </div>
    `;

    const gameArea = container.querySelector('#can-game-area');
    const barrel = container.querySelector('#can-barrel');
    const scoreEl = container.querySelector('#can-score');
    const overlay = container.querySelector('#can-overlay');

    function scheduleTimeout(callback, delay) {
      const timeoutId = window.setTimeout(() => {
        pendingTimeouts.delete(timeoutId);
        callback();
      }, delay);
      pendingTimeouts.add(timeoutId);
      return timeoutId;
    }

    function measureArea() {
      areaWidth = gameArea.clientWidth || 800;
      areaHeight = gameArea.clientHeight || 500;
      cannonOriginX = areaWidth / 2 - 20;
      cannonOriginY = areaHeight - 80;
    }

    function cleanup() {
      if (cleanupDone) return;
      cleanupDone = true;
      isPlaying = false;
      cancelAnimationFrame(gameLoopFrame);
      gameLoopFrame = 0;
      pendingTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      pendingTimeouts.clear();
      listeners.abort();
      resizeObserver?.disconnect();
      resizeObserver = null;
      activeTarget?.el?.remove();
      activeBullet?.el?.remove();
      activeTarget = null;
      activeBullet = null;

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

    function endGame() {
      isPlaying = false;
      cancelAnimationFrame(gameLoopFrame);
      gameLoopFrame = 0;
      const percentage = (score / targetWords.length) * 100;
      
      overlay.style.display = 'flex';
      overlay.innerHTML = '<h2 style="color:white">Fertig! [Ziel getroffen]</h2>';

      finalize({
        correct: percentage >= 80,
        partial: percentage >= 50 && percentage < 80,
        score: Math.round(percentage),
        details: { score, total: targetWords.length }
      }, 1500);
    }

    function spawnNextTarget() {
        if (cleanupDone) return;
        if (currentIndex >= targetWords.length) {
            endGame();
            return;
        }

        const data = targetWords[currentIndex];
        
        const targetEl = document.createElement('div');
        targetEl.textContent = data.word;
        targetEl.dataset.correct = data.correct;
        
        Object.assign(targetEl.style, {
            position: 'absolute',
            top: '40px',
            left: '0',
            padding: '10px 20px',
            background: '#f39c12',
            color: 'white',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
            willChange: 'transform'
        });
        
        gameArea.appendChild(targetEl);

        const width = targetEl.offsetWidth;
        const height = targetEl.offsetHeight;

        activeTarget = {
          el: targetEl,
          word: data.word,
          correct: data.correct,
          x: -width,
          y: 40,
          width,
          height,
          speed: 1.5 + Math.random(),
          direction: 1
        };

        targetEl.style.transform = `translate3d(${activeTarget.x}px, ${activeTarget.y}px, 0)`;
        barrel.style.transform = 'rotate(0deg)';
    }

    function update() {
        if (!isPlaying || cleanupDone) return;

        if (activeTarget) {
            activeTarget.x += activeTarget.speed * activeTarget.direction;

            if (activeTarget.x > areaWidth - activeTarget.width) {
                activeTarget.x = areaWidth - activeTarget.width;
                activeTarget.direction = -1;
            } else if (activeTarget.x < 0 && activeTarget.direction === -1) {
                activeTarget.x = 0;
                activeTarget.direction = 1;
            }

            activeTarget.el.style.transform = `translate3d(${activeTarget.x}px, ${activeTarget.y}px, 0)`;

            const targetCenterX = activeTarget.x + activeTarget.width / 2;
            const deltaX = targetCenterX - (cannonOriginX + 20);
            const deltaY = cannonOriginY - activeTarget.y;
            const angle = Math.atan2(deltaX, deltaY) * (180 / Math.PI);
            barrel.style.transform = `rotate(${angle}deg)`;

            if (activeBullet) {
                activeBullet.y -= activeBullet.speed;
                activeBullet.x += activeBullet.vx;
                activeBullet.el.style.transform = `translate3d(${activeBullet.x}px, ${activeBullet.y}px, 0)`;

                const bx = activeBullet.x + 20;
                const by = activeBullet.y + 20;
                const tx = activeTarget.x;
                const ty = activeTarget.y;
                const tw = activeTarget.width;
                const th = activeTarget.height;

                if (bx > tx && bx < tx + tw && by > ty && by < ty + th) {
                    const isCorrect = activeBullet.article === activeTarget.correct;
                    
                    if (isCorrect) {
                        score++;
                        scoreEl.textContent = score;
                        activeTarget.el.style.background = '#2ecc71';
                    } else {
                        activeTarget.el.style.background = '#e74c3c';
                    }
                    
                    activeTarget.el.textContent = `${activeTarget.correct} ${activeTarget.word}`;
                    
                    activeBullet.el.remove();
                    activeBullet = null;

                    const previousTarget = activeTarget;
                    activeTarget = null;
                    currentIndex++;
                    
                    scheduleTimeout(() => {
                        previousTarget.el.remove();
                        spawnNextTarget();
                    }, 1000);
                } else if (by < -50) {
                    activeBullet.el.remove();
                    activeBullet = null;
                }
            }
        }

        gameLoopFrame = requestAnimationFrame(update);
    }

    container.querySelectorAll('.fire-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!isPlaying || cleanupDone || !activeTarget || activeBullet) return;

            const article = btn.dataset.art;
            const barrelAngleStr = barrel.style.transform;
            let angleDeg = 0;
            if (barrelAngleStr.includes('rotate(')) {
                angleDeg = parseFloat(barrelAngleStr.split('rotate(')[1]) || 0;
            }
            const angleRad = angleDeg * (Math.PI / 180);

            const bulletEl = document.createElement('div');
            bulletEl.textContent = article;
            Object.assign(bulletEl.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '40px',
                height: '40px',
                background: btn.style.background,
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                zIndex: 20,
                willChange: 'transform'
            });
            gameArea.appendChild(bulletEl);

            activeBullet = {
                el: bulletEl,
                article,
                x: cannonOriginX,
                y: cannonOriginY,
                speed: 10,
                vx: Math.sin(angleRad) * 10
            };
            bulletEl.style.transform = `translate3d(${activeBullet.x}px, ${activeBullet.y}px, 0)`;
        }, { signal });
    });

    container.querySelector('#can-start-btn').addEventListener('click', () => {
      overlay.style.display = 'none';
      measureArea();
      isPlaying = true;
      spawnNextTarget();
      update();
    }, { signal });

    return {
      destroy: cleanup,
      cleanup
    };
  }
};
