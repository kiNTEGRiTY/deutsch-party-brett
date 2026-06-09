/**
 * Mini-Game: Syllable Counter (Silben-Zähler)
 *
 * Players count the syllables of German words and see the split after each
 * answer.
 */

const MAX_ROUNDS = 4;
const ADVANCE_DELAY_MS = 1150;

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

function normalizeWord(rawWord) {
  const word = String(rawWord?.word ?? '').trim();
  const syllables = Array.isArray(rawWord?.syllables)
    ? rawWord.syllables.map((part) => String(part ?? '').trim()).filter(Boolean)
    : [];

  if (!word || syllables.length === 0) {
    return null;
  }

  return {
    word,
    syllables,
    count: syllables.length
  };
}

function optionRange(words) {
  const maxCount = Math.max(4, ...words.map((word) => word.count));
  return Array.from({ length: maxCount }, (_, index) => index + 1);
}

function countLabel(count) {
  return count === 1 ? '1 Silbe' : `${count} Silben`;
}

export const SyllableCounter = {
  id: 'syllable-counter',
  name_de: 'Silben-Zähler',
  topics: ['silben'],

  setup(container, task, onComplete) {
    const words = Array.isArray(task.content?.words)
      ? task.content.words.map(normalizeWord).filter(Boolean)
      : [];

    if (words.length === 0) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-syllable-counter-content',
        topic: task.topic
      });
      return () => {};
    }

    const selected = shuffle(words).slice(0, MAX_ROUNDS);
    const options = optionRange(words);
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

    const renderSyllableChips = (item, reveal = false) => {
      if (!reveal) {
        return item.syllables.map(() => '<span aria-hidden="true">...</span>').join('');
      }

      return item.syllables.map((part) => `<span>${escapeHTML(part)}</span>`).join('');
    };

    const renderQuestion = (revealed = false, state = '') => {
      answered = revealed;
      cleanupRenderListeners();

      const item = selected[currentIndex];
      const progress = currentIndex / selected.length;
      const stateAttr = state ? ` data-state="${escapeHTML(state)}"` : '';

      container.innerHTML = `
        <div class="syllable-counter-game">
          <div class="syllable-counter-brief">
            <div class="syllable-counter-mark" aria-hidden="true">Silbe</div>
            <div class="syllable-counter-copy">
              <h3>Silben zählen</h3>
              <p>Sprich das Wort langsam. Jeder Klatscher ist eine Silbe.</p>
            </div>
            <div class="syllable-counter-status" aria-live="polite">
              <span>${currentIndex + 1}/${selected.length}</span>
              <div class="syllable-counter-progress" aria-hidden="true"><span></span></div>
            </div>
          </div>

          <section class="syllable-counter-card" aria-label="Wort">
            <span class="syllable-counter-prompt">Wie viele Klatscher?</span>
            <strong class="syllable-counter-word"${stateAttr}>${escapeHTML(item.word)}</strong>
            <div class="syllable-counter-chips ${revealed ? 'is-revealed' : ''}" aria-label="Silbentrennung">
              ${renderSyllableChips(item, revealed)}
            </div>
          </section>

          <section class="syllable-counter-options" aria-label="Silbenzahl wählen">
            ${options.map((option) => `
              <button class="syllable-counter-option" type="button" data-count="${option}" ${answered ? 'disabled' : ''}>
                <span>${option}</span>
                <small>${escapeHTML(countLabel(option))}</small>
              </button>
            `).join('')}
          </section>

          <div class="syllable-counter-feedback" id="syllable-counter-feedback" aria-live="polite">
            Tippe beim Sprechen mit dem Finger mit: ${escapeHTML(item.word)}.
          </div>
        </div>
      `;

      container.querySelector('.syllable-counter-progress span')?.style.setProperty('transform', `scaleX(${progress})`);

      if (answered) {
        container.querySelectorAll('.syllable-counter-option').forEach((button) => {
          const option = Number(button.dataset.count);
          button.classList.toggle('is-correct', option === item.count);
        });
        return;
      }

      container.querySelectorAll('.syllable-counter-option').forEach((button) => {
        addListener(button, 'click', () => {
          handleAnswer(Number(button.dataset.count));
        });
      });
    };

    const handleAnswer = (selectedCount) => {
      if (answered) {
        return;
      }

      const item = selected[currentIndex];
      const isCorrect = selectedCount === item.count;
      if (isCorrect) {
        correctCount++;
      }

      answered = true;
      renderQuestion(true, isCorrect ? 'correct' : 'wrong');

      const feedback = container.querySelector('#syllable-counter-feedback');
      container.querySelectorAll('.syllable-counter-option').forEach((button) => {
        const option = Number(button.dataset.count);
        button.disabled = true;
        button.classList.toggle('is-correct', option === item.count);
        button.classList.toggle('is-wrong', option === selectedCount && !isCorrect);
      });

      if (feedback) {
        feedback.dataset.state = isCorrect ? 'correct' : 'wrong';
        feedback.textContent = isCorrect
          ? `Richtig: ${item.word} hat ${countLabel(item.count)}.`
          : `Noch nicht: ${item.word} wird ${item.syllables.join(' - ')} geklatscht, also ${countLabel(item.count)}.`;
      }

      scheduleNext();
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
