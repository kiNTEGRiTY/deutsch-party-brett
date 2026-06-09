/**
 * Mini-Game: Lie Detector (Lügen-Detektor)
 *
 * Players judge if a sentence spelling/grammar is completely correct or a lie.
 */

import { SoundManager } from '../ui/sound-manager.js?v=content-card-material-50';

export const LieDetector = {
  id: 'lie-detector',
  name_de: 'Lügen-Detektor',
  topics: ['fehlerkorrektur', 'rechtschreibung'],

  setup(container, task, onComplete) {
    const content = task.content;
    let pairs = [];

    if (content.pairs) {
      pairs = content.pairs;
    } else {
      pairs = [
        { correct: 'Fahrrad', wrong: 'Farad' },
        { correct: 'Katze', wrong: 'Kaze' }
      ];
    }

    const testPair = pairs[Math.floor(Math.random() * pairs.length)];
    const isTruth = Math.random() > 0.5;
    const testWord = isTruth ? (testPair.correct || testPair.word) : testPair.wrong;

    container.innerHTML = `
      <div class="lie-detector-shell">
        <div class="lie-detector-panel premium-panel">
          <div class="detector-badge">SENSOR AKTIV</div>
          <h3>Lügen-Detektor</h3>
          <p>Der Scanner prüft das Wort. Ist es wirklich korrekt geschrieben oder steckt ein Fehler darin?</p>

          <div class="premium-console">
            <div class="premium-console-screen lie-word-screen" id="lie-screen">
              <div class="lie-word-value">${testWord}</div>
            </div>
          </div>

          <div class="lie-choice-grid">
            <button class="premium-choice-button truth" data-ans="wahr" type="button">
              <strong>WAHR</strong>
              <span>Das Wort ist korrekt.</span>
            </button>
            <button class="premium-choice-button lie" data-ans="luege" type="button">
              <strong>LÜGE</strong>
              <span>Hier steckt ein Fehler drin.</span>
            </button>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll('.premium-choice-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const answeredTruth = btn.dataset.ans === 'wahr';
        const isCorrect = answeredTruth === isTruth;
        const screen = container.querySelector('#lie-screen');

        btn.style.transform = 'translateY(8px)';
        btn.style.boxShadow = '0 8px 12px rgba(31,107,56,0.08)';
        container.querySelectorAll('.premium-choice-button').forEach((button) => {
          button.style.pointerEvents = 'none';
          button.style.opacity = button === btn ? '1' : '0.6';
        });

        if (isCorrect) {
          screen.classList.add('success');
          screen.innerHTML = `
            <div class="lie-word-value">KORREKT</div>
            <span class="lie-result-subtext">Sauber erkannt.</span>
          `;
          SoundManager.play('success');
        } else {
          screen.classList.add('fail');
          screen.innerHTML = `
            <div class="lie-word-value">FALSCH</div>
            <span class="lie-result-subtext">Richtig wäre: ${testPair.correct || testPair.word}</span>
          `;
          SoundManager.play('error');
        }

        setTimeout(() => {
          onComplete({
            correct: isCorrect,
            score: isCorrect ? 100 : 0
          });
        }, 1600);
      });
    });
  }
};
