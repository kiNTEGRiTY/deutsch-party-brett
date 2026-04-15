/**
 * Render Mini-Game - Wrapper for mini-game display and result handling
 * No emojis - all illustrated SVG icons
 */

import { getMinigame } from '../minigames/minigame-registry.js';
import { generateTask } from '../learning/task-generator.js';
import { iconTask, iconChallenge, iconTeam, iconCoin, iconCheck, iconTimer, iconParty } from '../ui/icons.js';

export class MinigameRenderer {
  constructor(containerEl, settings) {
    this.container = containerEl;
    this.settings = settings;
    this.onComplete = null;
    this.timerInterval = null;
  }

  launch(mode, onComplete) {
    this.onComplete = onComplete;
    
    const task = generateTask(
      this.settings.activeTopics,
      this.settings.difficulty,
      mode
    );
    
    const minigame = getMinigame(task.miniGameId);
    if (!minigame) {
      console.warn('Mini-game not found:', task.miniGameId);
      onComplete({ correct: false, score: 0, mode });
      return;
    }

    const modeIcon = mode === 'challenge' ? iconChallenge(22) 
                   : mode === 'team' ? iconTeam(22) 
                   : iconTask(22);

    this.container.innerHTML = `
      <div class="minigame-overlay" id="minigame-overlay">
        <div class="minigame-container">
          <div class="minigame-header">
            <div class="minigame-title">
              <span>${modeIcon}</span>
              <span>${minigame.name_de}</span>
            </div>
            ${task.timerSeconds > 0 ? `
              <div class="minigame-timer-area">
                <div class="timer" id="minigame-timer">
                  ${iconTimer(16)} <span id="timer-value">${task.timerSeconds}</span>s
                </div>
              </div>
            ` : ''}
          </div>
          <div class="minigame-instructions">
            ${task.instructions}
          </div>
          <div id="minigame-game-area"></div>
        </div>
      </div>
    `;

    if (task.timerSeconds > 0) {
      this._startTimer(task.timerSeconds, () => {
        this._showResult({
          correct: false,
          partial: false,
          score: 0,
          timeout: true,
          mode
        });
      });
    }

    const gameArea = document.getElementById('minigame-game-area');
    minigame.setup(gameArea, task, (result) => {
      this._clearTimer();
      result.mode = mode;
      result.miniGameId = task.miniGameId;
      result.topic = task.topic;
      this._showResult(result);
    });
  }

  _showResult(result) {
    const gameArea = document.getElementById('minigame-game-area');
    if (!gameArea) return;

    let icon, title, titleClass;
    if (result.timeout) {
      icon = iconTimer(48);
      title = 'Zeit abgelaufen!';
      titleClass = 'fail';
    } else if (result.correct) {
      icon = iconParty(48);
      title = 'Super gemacht!';
      titleClass = 'success';
    } else if (result.partial) {
      icon = iconCheck(48);
      title = 'Gut gemacht!';
      titleClass = 'partial';
    } else {
      icon = `<svg viewBox="0 0 48 48" width="48" height="48"><path d="M24 8 Q18 18 12 28 Q24 24 36 28 Q30 18 24 8Z" fill="#FFD54F" stroke="#F9A825" stroke-width="2"/><circle cx="24" cy="36" r="6" fill="#FFD54F" stroke="#F9A825" stroke-width="2"/></svg>`;
      title = 'Weiter üben!';
      titleClass = 'fail';
    }

    let coinsEarned = 0;
    if (result.correct) coinsEarned = 3;
    else if (result.partial) coinsEarned = 1;

    gameArea.innerHTML = `
      <div class="minigame-result">
        <div class="cardboard-result-card animate-bounce-in">
          <div class="result-icon">${icon}</div>
          <div class="result-title ${titleClass}" style="margin-top: 15px;">${title}</div>
          ${result.score !== undefined ? `
            <div style="font-size: var(--font-size-lg); font-family: var(--font-handwritten); color: var(--text-secondary); margin-top: 10px;">
              Ergebnis: ${result.score}%
            </div>
          ` : ''}
          ${coinsEarned > 0 ? `
            <div class="result-rewards" style="justify-content: center; margin-top: 20px;">
              <span class="coin animate-pop" style="background: rgba(255,215,0,0.2); padding: 5px 15px; border-radius: 20px; display: flex; align-items:center; gap: 10px;">
                ${iconCoin(24)} +${coinsEarned}
              </span>
            </div>
          ` : ''}
          <div style="margin-top: 30px;">
            <button class="btn btn-primary btn-lg" id="minigame-continue">Weiter</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('minigame-continue')?.addEventListener('click', () => {
      this.container.innerHTML = '';
      if (this.onComplete) {
        this.onComplete(result);
      }
    });
  }

  _startTimer(seconds, onTimeout) {
    let remaining = seconds;
    const timerEl = document.getElementById('timer-value');
    const timerContainer = document.getElementById('minigame-timer');
    
    this.timerInterval = setInterval(() => {
      remaining--;
      if (timerEl) timerEl.textContent = remaining;
      
      if (remaining <= 5 && timerContainer) {
        timerContainer.classList.add('warning');
      }
      if (remaining <= 3 && timerContainer) {
        timerContainer.classList.remove('warning');
        timerContainer.classList.add('danger');
      }
      
      if (remaining <= 0) {
        this._clearTimer();
        onTimeout();
      }
    }, 1000);
  }

  _clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  close() {
    this._clearTimer();
    this.container.innerHTML = '';
  }
}
