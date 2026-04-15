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
    const content = task.content;
    
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
    let gameLoopFrame;

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

    function endGame() {
      isPlaying = false;
      cancelAnimationFrame(gameLoopFrame);
      
      const overlay = container.querySelector('#can-overlay');
      overlay.style.display = 'flex';
      overlay.innerHTML = '<h2 style="color:white">Fertig! [Ziel getroffen]</h2>';

      setTimeout(() => {
        const percentage = (score / targetWords.length) * 100;
        onComplete({
          correct: percentage >= 80,
          partial: percentage >= 50 && percentage < 80,
          score: Math.round(percentage),
          details: { score, total: targetWords.length }
        });
      }, 1500);
    }

    function spawnNextTarget() {
        if (currentIndex >= targetWords.length) {
            endGame();
            return;
        }

        const data = targetWords[currentIndex];
        
        activeTarget = document.createElement('div');
        activeTarget.textContent = data.word; // e.g., "Haus"
        activeTarget.dataset.correct = data.correct; // "das"
        
        Object.assign(activeTarget.style, {
            position: 'absolute',
            top: '40px',
            left: '-100px', // start offscreen
            padding: '10px 20px',
            background: '#f39c12',
            color: 'white',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap'
        });
        
        gameArea.appendChild(activeTarget);
        
        // Target state
        activeTarget.x = -100;
        activeTarget.speed = 1.5 + Math.random(); // Move speed
        activeTarget.direction = 1;

        // Reset barrel direction
        barrel.style.transform = 'rotate(0deg)';
    }

    function update() {
        if (!isPlaying) return;

        // Move target
        if (activeTarget) {
            activeTarget.x += activeTarget.speed * activeTarget.direction;
            activeTarget.style.left = activeTarget.x + 'px';

            // Bounce off walls
            const areaWidth = gameArea.clientWidth;
            const targetWidth = activeTarget.clientWidth;
            if (activeTarget.x > areaWidth - targetWidth) {
                activeTarget.direction = -1;
            } else if (activeTarget.x < 0 && activeTarget.direction === -1) {
                activeTarget.direction = 1;
            }

            // Aim barrel at target
            const targetCenterX = activeTarget.x + targetWidth / 2;
            const barrelCenterX = areaWidth / 2;
            const deltaX = targetCenterX - barrelCenterX;
            const deltaY = gameArea.clientHeight - parseFloat(activeTarget.style.top); // approximate
            const angle = Math.atan2(deltaX, deltaY) * (180 / Math.PI);
            barrel.style.transform = 'rotate(' + angle + 'deg)';

            // Move Bullet
            if (activeBullet) {
                activeBullet.y -= activeBullet.speed;
                activeBullet.x += activeBullet.vx;
                activeBullet.el.style.top = activeBullet.y + 'px';
                activeBullet.el.style.left = activeBullet.x + 'px';

                // Collision detection
                const bx = activeBullet.x;
                const by = activeBullet.y;
                const tx = activeTarget.x;
                const ty = parseFloat(activeTarget.style.top);
                const tw = targetWidth;
                const th = activeTarget.clientHeight;

                if (bx > tx && bx < tx + tw && by > ty && by < ty + th) {
                    // HIT!
                    const isCorrect = activeBullet.el.textContent === activeTarget.dataset.correct;
                    
                    if (isCorrect) {
                        score++;
                        scoreEl.textContent = score;
                        activeTarget.style.background = '#2ecc71';
                    } else {
                        activeTarget.style.background = '#e74c3c';
                    }
                    
                    // Show correct article
                    activeTarget.textContent = activeTarget.dataset.correct + ' ' + activeTarget.textContent;
                    
                    // Destroy bullet
                    activeBullet.el.remove();
                    activeBullet = null;

                    const t = activeTarget;
                    activeTarget = null;
                    currentIndex++;
                    
                    setTimeout(() => {
                        t.remove();
                        spawnNextTarget();
                    }, 1000);
                }
                
                // Missed (went off screen)
                else if (by < -50) {
                    activeBullet.el.remove();
                    activeBullet = null;
                }
            }
        }

        gameLoopFrame = requestAnimationFrame(update);
    }

    container.querySelectorAll('.fire-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isPlaying || !activeTarget || activeBullet) return;

            const article = btn.dataset.art;
            
            // Create bullet
            const b = document.createElement('div');
            b.textContent = article;
            Object.assign(b.style, {
                position: 'absolute',
                top: (gameArea.clientHeight - 80) + 'px',
                left: (gameArea.clientWidth / 2 - 20) + 'px',
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
                zIndex: 20
            });
            gameArea.appendChild(b);

            // Bullet trajectories
            const barrelAngleStr = barrel.style.transform;
            let angleDeg = 0;
            if (barrelAngleStr.includes('rotate(')) {
                angleDeg = parseFloat(barrelAngleStr.split('rotate(')[1]);
            }
            const angleRad = angleDeg * (Math.PI / 180);

            activeBullet = {
                el: b,
                x: gameArea.clientWidth / 2 - 20,
                y: gameArea.clientHeight - 80,
                speed: 10,
                vx: Math.sin(angleRad) * 10
            };
        });
    });

    container.querySelector('#can-start-btn').addEventListener('click', () => {
      container.querySelector('#can-overlay').style.display = 'none';
      isPlaying = true;
      spawnNextTarget();
      update();
    });
  }
};
