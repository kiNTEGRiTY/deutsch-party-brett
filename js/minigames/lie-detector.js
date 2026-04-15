/**
 * Mini-Game: Lie Detector (Lügen-Detektor)
 * 
 * Players judge if a sentence spelling/grammar is completely correct or a lie.
 */

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
      <div class="liedetector-container" style="padding: var(--space-lg); text-align: center; user-select:none;">
        <div style="font-size: 4rem; margin-bottom: 20px;">📠</div>
        <p style="font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-md);">
          Der Detektor analysiert das Wort... Ist dieses Wort richtig geschrieben?
        </p>

        <div style="background: #2c3e50; color: #2ecc71; font-family: monospace; font-size: 2.5rem; padding: 20px; border-radius: 8px; margin-bottom: var(--space-xl); border: 4px solid #34495e; box-shadow: inset 0 0 10px black;">
            > ${testWord} <
        </div>

        <div style="display: flex; gap: 20px; justify-content: center;">
            <button class="btn truth-btn" data-ans="wahr" style="width:120px; height:120px; border-radius:50%; background:#2ecc71; color:white; font-size:1.5rem; font-weight:bold; border: 5px solid #27ae60; box-shadow: 0 10px 0 #27ae60;">
                WAHR ✅
            </button>
            <button class="btn lie-btn" data-ans="luege" style="width:120px; height:120px; border-radius:50%; background:#e74c3c; color:white; font-size:1.5rem; font-weight:bold; border: 5px solid #c0392b; box-shadow: 0 10px 0 #c0392b;">
                LÜGE ❌
            </button>
        </div>
      </div>
    `;

    container.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const answeredTruth = btn.dataset.ans === 'wahr';
            
            // It is true if isTruth is true and player answered truth.
            const isCorrect = (answeredTruth === isTruth);

            // Animate buttons
            btn.style.transform = 'translateY(10px)';
            btn.style.boxShadow = 'none';

            // Show result
            container.querySelectorAll('.btn').forEach(b => b.style.pointerEvents = 'none');

            const screen = container.querySelector('div[style*="font-family: monospace"]');
            if (isCorrect) {
                screen.style.color = '#2ecc71';
                screen.innerHTML = `> KORREKT! <`;
            } else {
                screen.style.color = '#e74c3c';
                screen.innerHTML = `> FALSCH! <br><span style="font-size:1.2rem;">Richtig: ${testPair.correct || testPair.word}</span>`;
            }

            setTimeout(() => {
                onComplete({
                    correct: isCorrect,
                    score: isCorrect ? 100 : 0
                });
            }, 2000);
        });
    });
  }
};
