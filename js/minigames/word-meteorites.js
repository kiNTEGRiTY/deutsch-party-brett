/**
 * Mini-Game: Word Meteorites (Wort-Meteoriten)
 *
 * Arcade style typing game. Words fall down, player must type them quickly.
 */

import { SoundManager } from '../ui/sound-manager.js?v=start-field-preview-45';

const MAX_TARGETS = 5;
const FALLBACK_WORDS = ['Haus', 'Baum', 'Katze', 'Auto', 'Blume'];

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
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

function collectWords(content = {}) {
  const mixedSets = Array.isArray(content.mixedSets) ? content.mixedSets : [];
  return uniqueWords([
    ...(Array.isArray(content.words) ? content.words : []),
    ...(Array.isArray(content.pairs)
      ? content.pairs
        .filter((pair) => !pair?.wrong)
        .map((pair) => pair?.correct || pair?.word)
      : []),
    ...mixedSets.flatMap((set) => [
      ...(Array.isArray(set?.words) ? set.words : []),
      ...(Array.isArray(set?.nomen) ? set.nomen : []),
      ...(Array.isArray(set?.verben) ? set.verben : []),
      ...(Array.isArray(set?.adjektive) ? set.adjektive : [])
    ])
  ]);
}

export const WordMeteorites = {
  id: 'word-meteorites',
  name_de: 'Wort-Meteoriten',
  topics: ['rechtschreibung', 'wortschatz', 'lesen'],

  setup(container, task, onComplete) {
    const wordList = collectWords(task.content);
    const targetWords = shuffle(wordList.length ? wordList : FALLBACK_WORDS).slice(0, MAX_TARGETS);
    const passScore = Math.ceil(targetWords.length * 0.8);
    let isPlaying = false;
    let score = 0;
    let currentInput = '';
    let activeMeteors = [];
    let lives = 3;
    let spawnedCount = 0;
    let gameLoopFrame = null;
    let completionTimeoutId = null;
    let disposed = false;
    let gameAreaHeight = 0;
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
      <div class="arcade-stage meteor-stage">
        <div class="hud-row">
          <div class="hud-chip is-warning">
            <span>Gerettet</span>
            <strong><span id="met-score">0</span> / ${targetWords.length}</strong>
          </div>
          <div class="hud-chip is-danger">
            <span>Schutz</span>
            <strong id="met-lives">3 / 3</strong>
          </div>
        </div>

        <div id="met-overlay" class="premium-overlay-card">
          <div>
            <div class="premium-kicker">Himmelwache</div>
            <div class="glow-title meteor-overlay-title">Tippe die Wörter vor dem Einschlag</div>
            <p class="meteor-overlay-copy">
              Beginne mit den Buchstaben eines sichtbaren Wortes. Ein voller Treffer sprengt den Meteoriten.
            </p>
            <div class="meteor-overlay-actions">
              <button id="met-start-btn" class="btn btn-primary btn-lg" type="button">Mission starten</button>
            </div>
          </div>
        </div>

        <div id="met-game-area" class="meteor-game-area"></div>
        <div class="meteor-ground-line"></div>

        <div class="meteor-input-shell premium-console">
          <label for="met-input">Schreibe das nächste fallende Wort</label>
          <input
            type="text"
            id="met-input"
            class="premium-arcade-input meteor-input"
            placeholder="Tippe hier..."
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          >
        </div>
      </div>
    `;

    const stageEl = container.querySelector('.meteor-stage');
    const gameArea = container.querySelector('#met-game-area');
    const inputEl = container.querySelector('#met-input');
    const overlay = container.querySelector('#met-overlay');
    const startButton = container.querySelector('#met-start-btn');
    const scoreEl = container.querySelector('#met-score');
    const livesEl = container.querySelector('#met-lives');

    const refreshBounds = () => {
      gameAreaHeight = gameArea.clientHeight || 0;
    };

    function clampMeteorX(meteor, nextX) {
      const areaWidth = gameArea.clientWidth || 1;
      const halfWidth = ((meteor?.el?.offsetWidth || 110) / 2) + 8;
      const edgePercent = Math.min(46, (halfWidth / areaWidth) * 100);
      return Math.max(edgePercent, Math.min(100 - edgePercent, nextX));
    }

    function removeMeteor(meteor) {
      if (!meteor || meteor.retired) {
        return;
      }
      meteor.retired = true;
      meteor.el.remove();
    }

    function finish(won) {
      if (!isPlaying || disposed) {
        return;
      }

      isPlaying = false;
      stageEl.classList.remove('is-running');
      window.cancelAnimationFrame(gameLoopFrame);
      gameLoopFrame = null;
      inputEl.blur();

      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div>
          <div class="premium-kicker">${won ? 'Stark!' : 'Weiter üben'}</div>
          <div class="glow-title meteor-overlay-title">
            ${won ? 'Himmel gerettet!' : 'Noch ein Versuch!'}
          </div>
          <p class="meteor-overlay-copy">
            ${won ? 'Die Wörter sitzen. Die Himmelswache bleibt stabil.' : 'Ein paar Treffer fehlen noch. Mit dem nächsten Lauf wird es rund.'}
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
          score: Math.round((score / targetWords.length) * 100),
          details: { lives, score }
        });
      }, 1500);
    }

    function spawnMeteor() {
      if (!isPlaying || disposed || spawnedCount >= targetWords.length) {
        return;
      }

      const word = targetWords[spawnedCount];
      spawnedCount += 1;

      const el = document.createElement('div');
      el.className = 'meteor-word';
      el.innerHTML = '<span class="met-typed"></span><span class="met-untyped"></span>';
      gameArea.appendChild(el);

      const typedNode = el.querySelector('.met-typed');
      const untypedNode = el.querySelector('.met-untyped');
      untypedNode.textContent = word;

      const meteor = {
        el,
        word,
        typedNode,
        untypedNode,
        retired: false,
        posY: -40,
        posX: 14 + Math.random() * 72,
        speed: 1.1 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 0.18
      };

      meteor.posX = clampMeteorX(meteor, meteor.posX);
      el.style.left = `${meteor.posX}%`;
      el.style.setProperty('--meteor-y', `${meteor.posY}px`);
      activeMeteors.push(meteor);
    }

    function updateMatchState() {
      if (!currentInput.length) {
        activeMeteors.forEach((meteor) => {
          meteor.el.classList.remove('matching');
          meteor.typedNode.textContent = '';
          meteor.untypedNode.textContent = meteor.word;
        });
        inputEl.classList.remove('invalid');
        return;
      }

      let matchedAny = false;

      for (let index = activeMeteors.length - 1; index >= 0; index -= 1) {
        const meteor = activeMeteors[index];
        const lowerWord = meteor.word.toLowerCase();
        const lowerInput = currentInput.toLowerCase();

        if (lowerWord.startsWith(lowerInput)) {
          matchedAny = true;
          meteor.el.classList.add('matching');
          meteor.typedNode.textContent = meteor.word.substring(0, currentInput.length);
          meteor.untypedNode.textContent = meteor.word.substring(currentInput.length);

          if (lowerInput === lowerWord) {
            score += 1;
            scoreEl.textContent = score;
            meteor.el.classList.add('burst');
            SoundManager.play('pop');
            scheduleTimeout(() => removeMeteor(meteor), 220);
            activeMeteors.splice(index, 1);
            currentInput = '';
            inputEl.value = '';

            if (spawnedCount >= targetWords.length && activeMeteors.length === 0) {
              finish(score >= passScore);
              return;
            }
          }
        } else {
          meteor.el.classList.remove('matching');
          meteor.typedNode.textContent = '';
          meteor.untypedNode.textContent = meteor.word;
        }
      }

      inputEl.classList.toggle('invalid', !matchedAny);
    }

    function update() {
      if (!isPlaying || disposed) {
        return;
      }

      if (activeMeteors.length === 0 || (activeMeteors.length < 2 && Math.random() < 0.01)) {
        spawnMeteor();
      }

      for (let index = activeMeteors.length - 1; index >= 0; index -= 1) {
        const meteor = activeMeteors[index];
        if (meteor.retired) {
          activeMeteors.splice(index, 1);
          continue;
        }

        meteor.posY += meteor.speed;
        meteor.posX = clampMeteorX(meteor, meteor.posX + meteor.drift);
        meteor.el.style.left = `${meteor.posX}%`;
        meteor.el.style.setProperty('--meteor-y', `${meteor.posY}px`);

        if (meteor.posY > gameAreaHeight - meteor.el.offsetHeight - 6) {
          removeMeteor(meteor);
          activeMeteors.splice(index, 1);
          lives -= 1;
          livesEl.textContent = `${Math.max(0, lives)} / 3`;
          gameArea.classList.add('impact');
          SoundManager.play('error');
          scheduleTimeout(() => gameArea.classList.remove('impact'), 220);

          if (lives <= 0) {
            finish(score >= passScore);
            return;
          }

          if (spawnedCount >= targetWords.length && activeMeteors.length === 0) {
            finish(score >= passScore);
            return;
          }
        }
      }

      updateMatchState();
      gameLoopFrame = window.requestAnimationFrame(update);
    }

    const handleInput = (event) => {
      currentInput = event.target.value.trimStart();
    };

    const handleStart = () => {
      if (disposed) {
        return;
      }

      refreshBounds();
      overlay.style.display = 'none';
      stageEl.classList.add('is-running');
      isPlaying = true;
      SoundManager.play('launch');
      inputEl.focus();
      spawnMeteor();
      gameLoopFrame = window.requestAnimationFrame(update);
    };

    const handleGameAreaClick = () => {
      if (isPlaying) {
        inputEl.focus();
      }
    };

    inputEl.addEventListener('input', handleInput);
    startButton.addEventListener('click', handleStart);
    gameArea.addEventListener('click', handleGameAreaClick);
    window.addEventListener('resize', refreshBounds);

    return () => {
      disposed = true;
      isPlaying = false;
      stageEl.classList.remove('is-running');
      window.cancelAnimationFrame(gameLoopFrame);
      window.clearTimeout(completionTimeoutId);
      pendingTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      pendingTimeouts.clear();
      inputEl.removeEventListener('input', handleInput);
      startButton.removeEventListener('click', handleStart);
      gameArea.removeEventListener('click', handleGameAreaClick);
      window.removeEventListener('resize', refreshBounds);
      activeMeteors.forEach((meteor) => removeMeteor(meteor));
      activeMeteors = [];
    };
  }
};
