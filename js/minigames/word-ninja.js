/**
 * Mini-Game: Word Ninja (Wort-Ninja)
 *
 * Arcade style slice game. Nouns fly up, players swipe them. Avoid Verbs!
 */

import { SoundManager } from '../ui/sound-manager.js?v=game-feel-cutouts-30';

const MAX_TARGETS = 5;
const FALLBACK_NOUNS = ['Hund', 'Katze', 'Baum', 'Haus', 'Ball'];
const FALLBACK_DECOYS = ['laufen', 'spielen', 'lesen', 'malen', 'groß', 'schnell'];

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function uniqueWords(words) {
  const seen = new Set();
  return words
    .map((word) => String(word ?? '').trim())
    .filter(Boolean)
    .filter((word) => {
      const key = word.toLocaleLowerCase('de-DE');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function buildWordPools(content = {}) {
  const mixedSets = Array.isArray(content.mixedSets) ? content.mixedSets : [];
  const nouns = uniqueWords([
    ...(Array.isArray(content.words) && content.type === 'wortarten' ? content.words : []),
    ...mixedSets.flatMap((set) => Array.isArray(set?.nomen) ? set.nomen : [])
  ]);
  const decoys = uniqueWords([
    ...mixedSets.flatMap((set) => Array.isArray(set?.verben) ? set.verben : []),
    ...mixedSets.flatMap((set) => Array.isArray(set?.adjektive) ? set.adjektive : [])
  ]);

  return {
    nouns: nouns.length ? nouns : FALLBACK_NOUNS,
    decoys: decoys.length ? decoys : FALLBACK_DECOYS
  };
}

export const WordNinja = {
  id: 'word-ninja',
  name_de: 'Wort-Ninja',
  topics: ['wortarten', 'wortschatz', 'nomen'],

  setup(container, task, onComplete) {
    const { nouns, decoys } = buildWordPools(task.content);
    const targetWords = shuffle(nouns).slice(0, Math.min(MAX_TARGETS, nouns.length));

    if (!targetWords.length || !decoys.length) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-word-ninja-content',
        topic: task.topic
      });
      return () => {};
    }

    let isPlaying = false;
    let score = 0;
    const targetScore = targetWords.length;
    let spawnedTargetIndex = 0;
    let lives = 3;
    let disposed = false;
    let spawnIntervalId = null;
    let animationFrameId = null;
    let completionTimeoutId = null;
    const activeWords = [];
    const pendingTimeouts = new Set();

    const scheduleTimeout = (callback, delay) => {
      const timeoutId = window.setTimeout(() => {
        pendingTimeouts.delete(timeoutId);
        callback();
      }, delay);
      pendingTimeouts.add(timeoutId);
      return timeoutId;
    };

    container.innerHTML = `
      <div class="arcade-stage word-ninja-stage">
        <div class="hud-row">
          <div class="hud-chip is-success">
            <span>Punkte</span>
            <strong><span id="ninja-score">0</span> / ${targetScore}</strong>
          </div>
          <div class="hud-chip is-danger">
            <span>Leben</span>
            <strong id="ninja-lives">3 / 3</strong>
          </div>
        </div>

        <div id="ninja-overlay" class="premium-overlay-card">
          <div>
            <div class="premium-kicker">Arcade-Mission</div>
            <div class="glow-title ninja-overlay-title">Schneide nur die Nomen</div>
            <p class="ninja-overlay-copy">
              Wörter fliegen durchs Bild. Nomen bringen Punkte, andere Wörter kosten Leben.
            </p>
            <div class="ninja-overlay-actions">
              <button id="ninja-start-btn" class="btn btn-primary btn-lg" type="button">Los geht's</button>
            </div>
          </div>
        </div>

        <div id="ninja-game-area" class="ninja-game-area"></div>
        <div class="ninja-slice-hint">Mit Maus oder Finger durch die Wörter wischen</div>
      </div>
    `;

    const gameArea = container.querySelector('#ninja-game-area');
    const stageEl = container.querySelector('.word-ninja-stage');
    const scoreEl = container.querySelector('#ninja-score');
    const livesEl = container.querySelector('#ninja-lives');
    const overlay = container.querySelector('#ninja-overlay');
    const startButton = container.querySelector('#ninja-start-btn');

    function clampWordX(word, nextX) {
      const areaWidth = gameArea.clientWidth || 1;
      const halfWidth = ((word?.el?.offsetWidth || 96) / 2) + 8;
      const edgePercent = Math.min(46, (halfWidth / areaWidth) * 100);
      return Math.max(edgePercent, Math.min(100 - edgePercent, nextX));
    }

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
      stageEl.classList.remove('is-running');
      window.clearInterval(spawnIntervalId);
      spawnIntervalId = null;
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;

      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div>
          <div class="premium-kicker">${won ? 'Bonus!' : 'Neue Runde'}</div>
          <div class="glow-title ninja-overlay-title">
            ${won ? 'Geschafft!' : 'Weiterkämpfen!'}
          </div>
          <p class="ninja-overlay-copy">
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

        word.posY += word.speed;
        word.posX = clampWordX(word, word.posX + word.velocityX);
        word.el.style.left = `${word.posX}%`;
        word.el.style.setProperty('--ninja-y', `${-word.posY}px`);

        if (word.posY > gameArea.clientHeight + 110) {
          clearWord(word);
          activeWords.splice(index, 1);

          if (!word.isBomb && !word.sliced && isPlaying) {
            spawnedTargetIndex = Math.max(0, spawnedTargetIndex - 1);
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(animateWords);
    }

    function spawnWord() {
      if (!isPlaying || disposed) {
        return;
      }

      const isBomb = spawnedTargetIndex >= targetScore || Math.random() > 0.62;
      let wordText = '';

      if (isBomb) {
        wordText = decoys[Math.floor(Math.random() * decoys.length)];
      } else {
        wordText = targetWords[spawnedTargetIndex % targetWords.length];
        spawnedTargetIndex += 1;
      }

      const el = document.createElement('div');
      el.className = `ninja-word ${isBomb ? 'bomb' : 'target'}`;
      el.innerHTML = `<span>${escapeHTML(wordText)}</span><small>${isBomb ? 'kein Nomen' : 'Nomen'}</small>`;
      gameArea.appendChild(el);

      const word = {
        el,
        isBomb,
        sliced: false,
        retired: false,
        posY: -70,
        posX: 14 + Math.random() * 72,
        speed: 2.8 + Math.random() * 1.1,
        velocityX: (Math.random() - 0.5) * 0.32,
        handleSlice: null,
        handlePointerEnter: null
      };

      word.posX = clampWordX(word, word.posX);
      el.style.left = `${word.posX}%`;
      el.style.setProperty('--ninja-y', '70px');

      word.handleSlice = (event) => {
        if (word.sliced || !isPlaying || word.retired || disposed) {
          return;
        }

        event.preventDefault();
        word.sliced = true;
        SoundManager.play('whoosh');

        if (word.isBomb) {
          lives -= 1;
          livesEl.textContent = `${Math.max(0, lives)} / 3`;
          el.classList.add('bad-hit');
          SoundManager.play('error');
          scheduleTimeout(() => clearWord(word), 220);

          if (lives <= 0) {
            finish(false);
          }
          return;
        }

        score += 1;
        scoreEl.textContent = score;
        el.classList.add('sliced');
        SoundManager.play('pop');
        scheduleTimeout(() => clearWord(word), 220);

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
      stageEl.classList.add('is-running');
      isPlaying = true;
      SoundManager.play('launch');
      spawnWord();
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
      stageEl.classList.remove('is-running');
      window.clearInterval(spawnIntervalId);
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(completionTimeoutId);
      pendingTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      pendingTimeouts.clear();
      startButton.removeEventListener('click', handleStart);
      activeWords.forEach((word) => clearWord(word));
      activeWords.length = 0;
    };
  }
};
