/**
 * Mini-Game: Word Ninja (Wort-Ninja)
 *
 * Arcade style slice game. Nouns fly up, players swipe them. Avoid Verbs!
 */

import { SoundManager } from '../ui/sound-manager.js?v=game-feel-8';

export const WordNinja = {
  id: 'word-ninja',
  name_de: 'Wort-Ninja',
  topics: ['wortarten', 'wortschatz', 'nomen'],

  setup(container, task, onComplete) {
    const content = task.content;

    let mixedSet;
    if (content.mixedSets && content.mixedSets.length > 0) {
      mixedSet = content.mixedSets[Math.floor(Math.random() * content.mixedSets.length)];
    } else {
      onComplete({ correct: false, score: 0 });
      return () => {};
    }

    const { nomen, verben } = mixedSet;
    if (!nomen || !verben || nomen.length === 0 || verben.length === 0) {
      onComplete({ correct: false, score: 0 });
      return () => {};
    }

    let isPlaying = false;
    let score = 0;
    const targetScore = Math.min(nomen.length, 5);
    let spawnedNouns = 0;
    let lives = 3;
    let disposed = false;
    let spawnIntervalId = null;
    let animationFrameId = null;
    let completionTimeoutId = null;
    const activeWords = [];

    container.innerHTML = `
      <div class="arcade-stage word-ninja-stage">
        <div class="hud-row">
          <div class="hud-chip is-success">
            <span>Punkte</span>
            <strong><span id="ninja-score">0</span> / ${targetScore}</strong>
          </div>
          <div class="hud-chip is-danger">
            <span>Leben</span>
            <strong id="ninja-lives">❤ ❤ ❤</strong>
          </div>
        </div>

        <div id="ninja-overlay" class="premium-overlay-card">
          <div>
            <div class="premium-kicker">Arcade-Mission</div>
            <div class="glow-title" style="font-size:clamp(2rem,5vw,3rem); margin-top:12px;">Schneide nur die Nomen</div>
            <p style="margin:12px 0 0; font-size:1rem; font-weight:800; color:var(--text-secondary);">
              Wörter fliegen durchs Bild. Nomen bringen Punkte, Verben kosten Herzen.
            </p>
            <div style="margin-top:24px; display:flex; justify-content:center;">
              <button id="ninja-start-btn" class="btn btn-primary btn-lg" type="button">Los geht's</button>
            </div>
          </div>
        </div>

        <div id="ninja-game-area" class="ninja-game-area"></div>
        <div class="ninja-slice-hint">Mit Maus oder Finger durch die Wörter wischen</div>
      </div>
    `;

    const gameArea = container.querySelector('#ninja-game-area');
    const scoreEl = container.querySelector('#ninja-score');
    const livesEl = container.querySelector('#ninja-lives');
    const overlay = container.querySelector('#ninja-overlay');
    const startButton = container.querySelector('#ninja-start-btn');

    function clearWord(word) {
      if (!word || word.retired) {
        return;
      }

      word.retired = true;
      word.el.removeEventListener('pointerdown', word.handleSlice);
      word.el.removeEventListener('pointerenter', word.handlePointerEnter);
      word.el.remove();
    }

    function finish(won) {
      if (!isPlaying || disposed) {
        return;
      }

      isPlaying = false;
      window.clearInterval(spawnIntervalId);
      spawnIntervalId = null;
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;

      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div>
          <div class="premium-kicker">${won ? 'Bonus!' : 'Neue Runde'}</div>
          <div class="glow-title" style="font-size:clamp(2rem,5vw,3rem); margin-top:12px;">
            ${won ? 'Geschafft!' : 'Weiterkämpfen!'}
          </div>
          <p style="margin:12px 0 0; font-size:1rem; font-weight:800; color:var(--text-secondary);">
            ${won ? 'Alle Ziele erwischt. Sauber gespielt.' : 'Ein paar Wörter fehlen noch. Die nächste Runde sitzt.'}
          </p>
        </div>
      `;

      completionTimeoutId = window.setTimeout(() => {
        if (disposed) {
          return;
        }
        onComplete({
          correct: won,
          partial: !won && score > 0,
          score: Math.round((score / targetScore) * 100),
          details: { lives, score }
        });
      }, 1500);
    }

    function animateWords() {
      if (!isPlaying || disposed) {
        return;
      }

      for (let index = activeWords.length - 1; index >= 0; index -= 1) {
        const word = activeWords[index];
        if (word.retired) {
          activeWords.splice(index, 1);
          continue;
        }

        word.velocityY -= word.gravity;
        word.posY += word.velocityY;
        word.posX += word.velocityX;
        word.el.style.transform = `translate(${word.posX}%, ${-word.posY}px)`;

        if (word.posY < -100) {
          clearWord(word);
          activeWords.splice(index, 1);

          if (!word.isBomb && !word.sliced && isPlaying) {
            spawnedNouns = Math.max(0, spawnedNouns - 1);
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(animateWords);
    }

    function spawnWord() {
      if (!isPlaying || disposed) {
        return;
      }

      const isBomb = spawnedNouns >= targetScore || Math.random() > 0.6;
      let wordText = '';

      if (isBomb) {
        wordText = verben[Math.floor(Math.random() * verben.length)];
      } else {
        wordText = nomen[spawnedNouns % nomen.length];
        spawnedNouns += 1;
      }

      const el = document.createElement('div');
      el.className = `ninja-word ${isBomb ? 'bomb' : 'target'}`;
      el.textContent = wordText;
      gameArea.appendChild(el);

      const word = {
        el,
        isBomb,
        sliced: false,
        retired: false,
        posY: -50,
        posX: 10 + Math.random() * 60,
        velocityY: 12 + Math.random() * 4,
        velocityX: (Math.random() - 0.5) * 4,
        gravity: 0.2,
        handleSlice: null,
        handlePointerEnter: null
      };

      el.style.transform = `translate(${word.posX}%, 50px)`;

      word.handleSlice = (event) => {
        if (word.sliced || !isPlaying || word.retired || disposed) {
          return;
        }

        event.preventDefault();
        word.sliced = true;
        SoundManager.play('whoosh');

        if (word.isBomb) {
          lives -= 1;
          livesEl.textContent = '❤ '.repeat(Math.max(0, lives)).trim();
          el.classList.add('bad-hit');
          SoundManager.play('error');
          window.setTimeout(() => clearWord(word), 220);

          if (lives <= 0) {
            finish(false);
          }
          return;
        }

        score += 1;
        scoreEl.textContent = score;
        el.classList.add('sliced');
        SoundManager.play('pop');
        window.setTimeout(() => clearWord(word), 220);

        if (score >= targetScore) {
          finish(true);
        }
      };

      word.handlePointerEnter = (event) => {
        if (event.buttons > 0) {
          word.handleSlice(event);
        }
      };

      el.addEventListener('pointerdown', word.handleSlice);
      el.addEventListener('pointerenter', word.handlePointerEnter);
      activeWords.push(word);
    }

    const handleStart = () => {
      if (disposed) {
        return;
      }

      overlay.style.display = 'none';
      isPlaying = true;
      SoundManager.play('launch');
      spawnIntervalId = window.setInterval(() => {
        if (isPlaying && Math.random() > 0.3) {
          spawnWord();
        }
      }, 800);
      animationFrameId = window.requestAnimationFrame(animateWords);
    };

    startButton.addEventListener('click', handleStart);

    return () => {
      disposed = true;
      isPlaying = false;
      window.clearInterval(spawnIntervalId);
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(completionTimeoutId);
      startButton.removeEventListener('click', handleStart);
      activeWords.forEach((word) => clearWord(word));
      activeWords.length = 0;
    };
  }
};
