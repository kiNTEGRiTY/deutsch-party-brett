/**
 * Mini-Game: Spelling Detective
 *
 * Find the misspelled word among a group of words.
 */

const MAX_ROUNDS = 3;
const OPTION_COUNT = 4;
const ADVANCE_DELAY_MS = 1350;

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

function normalizePair(pair) {
  const correct = String(pair?.correct ?? '').trim();
  const wrong = String(pair?.wrong ?? '').trim();
  if (!correct || !wrong || correct === wrong) {
    return null;
  }

  return {
    correct,
    wrong,
    rule: String(pair?.rule ?? '').trim() || 'Vergleiche die Buchstaben genau.'
  };
}

function buildOptions(targetPair, allPairs) {
  const decoys = shuffle(allPairs)
    .filter((pair) => pair.correct !== targetPair.correct)
    .map((pair) => pair.correct);

  const uniqueOptions = [targetPair.wrong, ...decoys]
    .filter(Boolean)
    .filter((word, index, words) => words.indexOf(word) === index)
    .slice(0, OPTION_COUNT);

  return shuffle(uniqueOptions);
}

export const SpellingDetective = {
  id: 'spelling-detective',
  name_de: 'Rechtschreib-Detektiv',
  topics: ['rechtschreibung', 'fehlerkorrektur'],

  setup(container, task, onComplete) {
    const pairs = Array.isArray(task.content?.pairs)
      ? task.content.pairs.map(normalizePair).filter(Boolean)
      : [];

    if (pairs.length === 0) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-spelling-detective-content',
        topic: task.topic
      });
      return () => {};
    }

    const selected = shuffle(pairs).slice(0, MAX_ROUNDS);
    let currentIndex = 0;
    let correctCount = 0;
    let answered = false;
    let disposed = false;
    let nextTimeoutId = null;
    const listeners = [];

    const addListener = (node, eventName, handler) => {
      node.addEventListener(eventName, handler);
      listeners.push(() => node.removeEventListener(eventName, handler));
    };

    const cleanupRenderListeners = () => {
      listeners.forEach((remove) => remove());
      listeners.length = 0;
    };

    const finish = () => {
      const score = Math.round((correctCount / selected.length) * 100);
      onComplete({
        correct: score >= 80,
        partial: score >= 50,
        score,
        details: {
          correctCount,
          totalQuestions: selected.length,
          topic: task.topic
        }
      });
    };

    const scheduleNext = () => {
      nextTimeoutId = setTimeout(() => {
        nextTimeoutId = null;
        if (disposed) {
          return;
        }

        currentIndex++;
        if (currentIndex < selected.length) {
          renderQuestion();
          return;
        }

        finish();
      }, ADVANCE_DELAY_MS);
    };

    const renderQuestion = () => {
      answered = false;
      cleanupRenderListeners();

      const pair = selected[currentIndex];
      const options = buildOptions(pair, pairs);
      const progress = currentIndex / selected.length;

      container.innerHTML = `
        <div class="spelling-detective-game">
          <div class="spelling-detective-brief">
            <div class="spelling-detective-mark" aria-hidden="true">Fehler</div>
            <div class="spelling-detective-copy">
              <h3>Fehler finden</h3>
              <p>Eine Karte ist falsch geschrieben. Vergleiche die Buchstaben genau.</p>
            </div>
            <div class="spelling-detective-status" aria-live="polite">
              <span>${currentIndex + 1}/${selected.length}</span>
              <div class="spelling-detective-progress" aria-hidden="true"><span></span></div>
            </div>
          </div>

          <section class="spelling-detective-case" aria-label="Suchauftrag">
            <span class="spelling-detective-prompt">Welches Wort ist falsch geschrieben?</span>
            <strong>Finde die Fehlerkarte.</strong>
            <span>Tippe nur das Wort an, das so nicht richtig im Heft stehen dürfte.</span>
          </section>

          <section class="spelling-detective-options" aria-label="Wortkarten">
            ${options.map((word, optionIndex) => `
              <button class="spelling-detective-option" type="button" data-option-index="${optionIndex}">
                <span>${escapeHTML(word)}</span>
              </button>
            `).join('')}
          </section>

          <div class="spelling-detective-correction" id="spelling-detective-correction" aria-live="polite">
            <span class="spelling-detective-correction-label">Korrektur</span>
            <strong>...</strong>
            <span>Die Regel erscheint nach deiner Wahl.</span>
          </div>

          <div class="spelling-detective-feedback" id="spelling-detective-feedback" aria-live="polite">
            Suche das Wort, bei dem ein Buchstabe fehlt, zu viel ist oder anders klingen müsste.
          </div>
        </div>
      `;

      container.querySelector('.spelling-detective-progress span')?.style.setProperty('transform', `scaleX(${progress})`);

      const feedback = container.querySelector('#spelling-detective-feedback');
      const correction = container.querySelector('#spelling-detective-correction');
      const buttons = Array.from(container.querySelectorAll('.spelling-detective-option'));

      buttons.forEach((button) => {
        addListener(button, 'click', () => {
          if (answered) {
            return;
          }

          answered = true;
          const selectedWord = options[Number(button.dataset.optionIndex)];
          const isCorrect = selectedWord === pair.wrong;
          if (isCorrect) {
            correctCount++;
          }

          buttons.forEach((optionButton) => {
            const option = options[Number(optionButton.dataset.optionIndex)];
            optionButton.disabled = true;
            optionButton.classList.toggle('is-error-word', option === pair.wrong);
            optionButton.classList.toggle('is-wrong-pick', optionButton === button && !isCorrect);
          });

          if (correction) {
            correction.dataset.state = isCorrect ? 'correct' : 'wrong';
            correction.innerHTML = `
              <span class="spelling-detective-correction-label">Korrektur</span>
              <strong><span>${escapeHTML(pair.wrong)}</span><span aria-hidden="true"> -> </span>${escapeHTML(pair.correct)}</strong>
              <span>${escapeHTML(pair.rule)}</span>
            `;
          }

          if (feedback) {
            feedback.dataset.state = isCorrect ? 'correct' : 'wrong';
            feedback.textContent = isCorrect
              ? `Gefunden: "${pair.wrong}" ist die Fehlerkarte. Richtig ist "${pair.correct}".`
              : `Noch nicht: "${selectedWord}" ist korrekt geschrieben. Die Fehlerkarte ist "${pair.wrong}".`;
          }

          scheduleNext();
        });
      });
    };

    renderQuestion();
    return () => {
      disposed = true;
      cleanupRenderListeners();
      if (nextTimeoutId) {
        clearTimeout(nextTimeoutId);
      }
    };
  }
};
