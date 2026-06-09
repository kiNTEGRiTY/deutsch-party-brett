import { SoundManager } from '../ui/sound-manager.js?v=content-card-material-50';

const PAIRS = [
  { crewWord: 'Schloss', imposterWord: 'Burg' },
  { crewWord: 'Meer', imposterWord: 'See' },
  { crewWord: 'Pfannkuchen', imposterWord: 'Waffel' },
  { crewWord: 'Camping', imposterWord: 'Picknick' },
  { crewWord: 'Drache', imposterWord: 'Dinosaurier' }
];

export const TaeuschMich = {
  id: 'taeusch-mich',
  name_de: 'Täusch Mich',
  description: 'Verdeckte Rollen, knappe Hinweise und danach ein sauberer Verrats-Vote.',
  topics: ['wortschatz', 'lesen', 'satzbau'],
  supportsDirectPlay: true,
  usesInternalTimer: true,

  setup(container, task, onComplete) {
    const players = Array.isArray(task.players) && task.players.length > 0
      ? task.players.map((player, index) => ({
          id: player.id ?? index,
          name: player.name || `Spieler ${index + 1}`
        }))
      : Array.from({ length: Math.max(task.playerCount || 4, 3) }, (_, index) => ({
          id: index,
          name: `Spieler ${index + 1}`
        }));

    const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    const imposterIndex = Math.floor(Math.random() * players.length);
    let revealIndex = 0;

    function finishRound(correctGuess) {
      const percentage = correctGuess ? 100 : 35;
      onComplete({
        correct: correctGuess,
        partial: !correctGuess,
        score: percentage,
        details: {
          imposter: players[imposterIndex].name,
          crewWord: pair.crewWord,
          imposterWord: pair.imposterWord
        }
      });
    }

    function showVoteScreen() {
      container.innerHTML = `
        <div class="taeusch-shell">
          <div class="showcase-round-card">
            <div class="premium-kicker">Hinweisphase vorbei</div>
            <h3 class="glow-title showcase-title">Wer ist der Täuscher?</h3>
            <p class="showcase-secondary">Tippt auf die Person, die das andere Wort bekommen hat.</p>
          </div>
          <div class="showcase-score-grid">
            ${players.map((player, index) => `
              <button class="showcase-score-button tone-mid taeusch-vote" data-index="${index}" type="button">
                <strong>${player.name}</strong>
                <span>Vote</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelectorAll('.taeusch-vote').forEach((button) => {
        button.addEventListener('click', () => {
          const selectedIndex = Number(button.dataset.index);
          const correctGuess = selectedIndex === imposterIndex;
          button.classList.add(correctGuess ? 'is-correct' : 'is-wrong');
          SoundManager.play(correctGuess ? 'success' : 'error');

          setTimeout(() => {
            finishRound(correctGuess);
          }, 1000);
        });
      });
    }

    function showCluePhase() {
      container.innerHTML = `
        <div class="taeusch-shell">
          <div class="showcase-round-card">
            <div class="premium-kicker">Social Deduction</div>
            <h3 class="glow-title showcase-title">Hinweisrunde</h3>
            <p class="showcase-prompt">Jede Person gibt jetzt einen Hinweis. Keine direkten Synonyme, keine kompletten Sätze aus dem Lehrbuch.</p>
            <p class="showcase-secondary">Crew-Wort: <strong>${pair.crewWord}</strong> | Sonderwort: <strong>${pair.imposterWord}</strong></p>
          </div>
          <div class="showcase-badge-row">
            <span class="showcase-chip">Verdeckte Rollen</span>
            <span class="showcase-chip">Keine direkten Synonyme</span>
            <span class="showcase-chip">Danach Voting</span>
          </div>
          <div class="showcase-controls">
            <button class="btn btn-primary btn-lg" id="taeusch-to-vote" type="button">Hinweise gegeben</button>
          </div>
        </div>
      `;

      container.querySelector('#taeusch-to-vote').addEventListener('click', showVoteScreen);
    }

    function showNextReveal() {
      if (revealIndex >= players.length) {
        showCluePhase();
        return;
      }

      const player = players[revealIndex];
      const secretWord = revealIndex === imposterIndex ? pair.imposterWord : pair.crewWord;

      container.innerHTML = `
        <div class="taeusch-shell">
          <div class="showcase-round-card">
            <div class="premium-kicker">Geheime Rollenanzeige</div>
            <h3 class="glow-title showcase-title">${player.name}</h3>
            <p class="showcase-secondary">Gerät weitergeben. Nur diese Person schaut jetzt hin.</p>
          </div>
          <div class="showcase-controls">
            <button class="btn btn-primary btn-lg" id="taeusch-show-secret" type="button">Rolle zeigen</button>
          </div>
        </div>
      `;

      container.querySelector('#taeusch-show-secret').addEventListener('click', () => {
        container.innerHTML = `
          <div class="taeusch-shell">
            <div class="taeusch-secret-card ${revealIndex === imposterIndex ? 'is-imposter' : 'is-crew'}">
              <span>Geheimes Wort für ${player.name}</span>
              <strong>${secretWord}</strong>
              <p>Gib später nur einen knappen Hinweis. Nicht zu direkt.</p>
            </div>
            <div class="showcase-controls">
              <button class="btn btn-secondary" id="taeusch-hide-secret" type="button">Verstanden</button>
            </div>
          </div>
        `;
        SoundManager.play('launch');
        container.querySelector('#taeusch-hide-secret').addEventListener('click', () => {
          revealIndex += 1;
          showNextReveal();
        });
      });
    }

    container.innerHTML = `
      <div class="taeusch-shell">
        <div class="showcase-round-card">
          <div class="premium-kicker">Production Ready</div>
          <h3 class="glow-title showcase-title">Täusch Mich</h3>
          <p class="showcase-prompt">Alle bekommen ein geheimes Wort. Eine Person bekommt ein anderes. Danach wird geblufft und gevotet.</p>
          <p class="showcase-secondary">${players.length} Personen sind in der Runde.</p>
        </div>
        <div class="showcase-controls">
          <button class="btn btn-primary btn-lg" id="taeusch-start" type="button">Rollen verteilen</button>
        </div>
      </div>
    `;

    container.querySelector('#taeusch-start').addEventListener('click', () => {
      SoundManager.play('launch');
      showNextReveal();
    });
  }
};
