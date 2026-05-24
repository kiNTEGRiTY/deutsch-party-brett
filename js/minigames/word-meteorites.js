/**
 * Mini-Game: Word Meteorites (Wort-Meteoriten)
 *
 * Arcade style typing game. Words fall down, player must type them quickly.
 */

import { SoundManager } from '../ui/sound-manager.js?v=game-feel-8';

export const WordMeteorites = {
  id: 'word-meteorites',
  name_de: 'Wort-Meteoriten',
  topics: ['rechtschreibung', 'wortschatz', 'lesen'],

  setup(container, task, onComplete) {
    const content = task.content;

    let wordList = [];
    if (content.pairs) {
      wordList = content.pairs
        .filter((pair) => !pair.wrong)
        .map((pair) => pair.correct || pair.word)
        .filter(Boolean);
    } else if (content.words) {
      wordList = content.words;
    } else if (content.mixedSets) {
      wordList = content.mixedSets[0]?.words || [];
    }

    if (!wordList || wordList.length === 0) {
      wordList = ['Haus', 'Baum', 'Katze', 'Auto', 'Blume'];
    }

    const targetWords = [...wordList].sort(() => Math.random() - 0.5).slice(0, 5);
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

    container.innerHTML = `
      <div class="arcade-stage meteor-stage">
        <div class="hud-row">
          <div class="hud-chip is-warning">
            <span>Gerettet</span>
            <strong><span id="met-score">0</span> / ${targetWords.length}</strong>
          </div>
          <div class="hud-chip is-danger">
            <span>Schutz</span>
            <strong id="met-lives">❤ ❤ ❤</strong>
          </div>
        </div>

        <div id="met-overlay" class="premium-overlay-card">
          <div>
            <div class="premium-kicker">Himmelwache</div>
            <div class="glow-title" style="font-size:clamp(2rem,5vw,3rem); margin-top:12px;">Tippe die Wörter vor dem Einschlag</div>
            <p style="margin:12px 0 0; font-size:1rem; font-weight:800; color:var(--text-secondary);">
              Jeder korrekte Treffer sprengt einen Meteoriten. Falsche Eingaben kosten Zeit.
            </p>
            <div style="margin-top:24px; display:flex; justify-content:center;">
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

    const gameArea = container.querySelector('#met-game-area');
    const inputEl = container.querySelector('#met-input');
    const overlay = container.querySelector('#met-overlay');
    const startButton = container.querySelector('#met-start-btn');
    const scoreEl = container.querySelector('#met-score');
    const livesEl = container.querySelector('#met-lives');

    const refreshBounds = () => {
      gameAreaHeight = gameArea.clientHeight || 0;
    };

    function removeMeteor(meteor) {
      meteor.el.remove();
    }

    function finish(won) {
      if (!isPlaying || disposed) {
        return;
      }

      isPlaying = false;
      window.cancelAnimationFrame(gameLoopFrame);
      gameLoopFrame = null;
      inputEl.blur();

      overlay.style.display = 'flex';
      overlay.innerHTML = `
        <div>
          <div class="premium-kicker">${won ? 'Stark!' : 'Nochmal'}</div>
          <div class="glow-title" style="font-size:clamp(2rem,5vw,3rem); margin-top:12px;">
            ${won ? 'Himmel gerettet!' : 'Noch ein Versuch!'}
          </div>
          <p style="margin:12px 0 0; font-size:1rem; font-weight:800; color:var(--text-secondary);">
            ${won ? 'Die Wörter sitzen. Kein Meteorit ist durchgekommen.' : 'Ein paar Treffer fehlen noch. Mit dem nächsten Lauf wird es rund.'}
          </p>
        </div>
      `;

      completionTimeoutId = window.setTimeout(() => {
        if (disposed) {
          return;
        }
        onComplete({
          correct: won || score >= targetWords.length * 0.8,
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
      el.style.left = `${10 + Math.random() * 60}%`;
      gameArea.appendChild(el);

      const typedNode = el.querySelector('.met-typed');
      const untypedNode = el.querySelector('.met-untyped');
      untypedNode.textContent = word;

      activeMeteors.push({
        el,
        word,
        typedNode,
        untypedNode,
        posY: -40,
        speed: 0.5 + Math.random() * 0.5
      });
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
            window.setTimeout(() => removeMeteor(meteor), 220);
            activeMeteors.splice(index, 1);
            currentInput = '';
            inputEl.value = '';

            if (spawnedCount >= targetWords.length && activeMeteors.length === 0) {
              finish(true);
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
        meteor.posY += meteor.speed;
        meteor.el.style.transform = `translateY(${meteor.posY}px)`;

        if (meteor.posY > gameAreaHeight - 30) {
          removeMeteor(meteor);
          activeMeteors.splice(index, 1);
          lives -= 1;
          livesEl.textContent = '❤ '.repeat(Math.max(0, lives)).trim();
          gameArea.classList.add('impact');
          SoundManager.play('error');
          window.setTimeout(() => gameArea.classList.remove('impact'), 220);

          if (lives <= 0) {
            finish(false);
            return;
          }

          if (spawnedCount >= targetWords.length && activeMeteors.length === 0) {
            finish(score > 0);
            return;
          }
        }
      }

      updateMatchState();
      gameLoopFrame = window.requestAnimationFrame(update);
    }

    const handleInput = (event) => {
      currentInput = event.target.value.trim();
    };

    const handleStart = () => {
      if (disposed) {
        return;
      }

      refreshBounds();
      overlay.style.display = 'none';
      isPlaying = true;
      SoundManager.play('launch');
      inputEl.focus();
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
      window.cancelAnimationFrame(gameLoopFrame);
      window.clearTimeout(completionTimeoutId);
      inputEl.removeEventListener('input', handleInput);
      startButton.removeEventListener('click', handleStart);
      gameArea.removeEventListener('click', handleGameAreaClick);
      window.removeEventListener('resize', refreshBounds);
      activeMeteors.forEach((meteor) => removeMeteor(meteor));
      activeMeteors = [];
    };
  }
};
