/**
 * Mini-Game: Case Choice
 *
 * Decide whether a German word or word group should be written uppercase or
 * lowercase.
 */

const MAX_ROUNDS = 5;
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

function normalizeCaseItem(rawItem) {
  const source = String(rawItem?.word ?? '').trim();
  const correct = String(rawItem?.correct ?? '').trim();
  if (!source || !correct || typeof rawItem?.isNoun !== 'boolean') {
    return null;
  }

  const answer = rawItem.isNoun ? 'gross' : 'klein';
  return {
    display: source.toLocaleLowerCase('de-DE'),
    correct,
    answer,
    label: rawItem.isNoun ? 'Nomen oder nominalisiert' : 'kein Nomen',
    explanation: String(rawItem?.explanation ?? '').trim() || (
      rawItem.isNoun
        ? 'Nomen und nominalisierte Wörter werden großgeschrieben.'
        : 'Verben, Adjektive und viele Zeitwörter werden kleingeschrieben.'
    )
  };
}

const ANSWERS = [
  {
    id: 'gross',
    title: 'Groß schreiben',
    examples: 'Hund, Schule, das Lesen'
  },
  {
    id: 'klein',
    title: 'klein schreiben',
    examples: 'spielen, schnell, heute'
  }
];

export const CaseChoice = {
  id: 'case-choice',
  name_de: 'Groß oder klein?',
  topics: ['gross_klein'],

  setup(container, task, onComplete) {
    const items = Array.isArray(task.content?.items)
      ? task.content.items.map(normalizeCaseItem).filter(Boolean)
      : [];

    if (items.length === 0) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-case-choice-content',
        topic: task.topic
      });
      return () => {};
    }

    const selected = shuffle(items).slice(0, MAX_ROUNDS);
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

      const item = selected[currentIndex];
      const progress = currentIndex / selected.length;

      container.innerHTML = `
        <div class="case-choice-game">
          <div class="case-choice-brief">
            <div class="case-choice-mark" aria-hidden="true">Aa</div>
            <div class="case-choice-copy">
              <h3>Groß oder klein?</h3>
              <p>Entscheide, ob das Wort als Nomen großgeschrieben wird.</p>
            </div>
            <div class="case-choice-status" aria-live="polite">
              <span>${currentIndex + 1}/${selected.length}</span>
              <div class="case-choice-progress" aria-hidden="true"><span></span></div>
            </div>
          </div>

          <section class="case-choice-card" aria-label="Wortprobe">
            <span class="case-choice-prompt">Wortprobe</span>
            <strong class="case-choice-word" id="case-choice-word">${escapeHTML(item.display)}</strong>
            <span class="case-choice-ghost">Welche Schreibweise wäre im Heft richtig?</span>
          </section>

          <section class="case-choice-options" aria-label="Schreibweise wählen">
            ${ANSWERS.map((answer) => `
              <button class="case-choice-option" type="button" data-answer="${answer.id}">
                <span>${escapeHTML(answer.title)}</span>
                <small>${escapeHTML(answer.examples)}</small>
              </button>
            `).join('')}
          </section>

          <div class="case-choice-solution" id="case-choice-solution" aria-live="polite">
            <span class="case-choice-solution-label">Lösung</span>
            <strong>...</strong>
            <span>Die Regel erscheint nach deiner Wahl.</span>
          </div>

          <div class="case-choice-feedback" id="case-choice-feedback" aria-live="polite">
            Achte darauf, ob ein Artikel davorsteht oder ob das Wort ein Nomen ist.
          </div>
        </div>
      `;

      container.querySelector('.case-choice-progress span')?.style.setProperty('transform', `scaleX(${progress})`);

      const word = container.querySelector('#case-choice-word');
      const solution = container.querySelector('#case-choice-solution');
      const feedback = container.querySelector('#case-choice-feedback');
      const buttons = Array.from(container.querySelectorAll('.case-choice-option'));

      buttons.forEach((button) => {
        addListener(button, 'click', () => {
          if (answered) {
            return;
          }

          answered = true;
          const selectedAnswer = button.dataset.answer;
          const isCorrect = selectedAnswer === item.answer;
          if (isCorrect) {
            correctCount++;
          }

          buttons.forEach((optionButton) => {
            const answer = optionButton.dataset.answer;
            optionButton.disabled = true;
            optionButton.classList.toggle('is-correct', answer === item.answer);
            optionButton.classList.toggle('is-wrong', optionButton === button && !isCorrect);
          });

          if (word) {
            word.dataset.state = isCorrect ? 'correct' : 'wrong';
            word.textContent = item.correct;
          }

          if (solution) {
            solution.dataset.state = isCorrect ? 'correct' : 'wrong';
            solution.innerHTML = `
              <span class="case-choice-solution-label">Lösung</span>
              <strong>${escapeHTML(item.correct)}</strong>
              <span>${escapeHTML(item.label)}: ${escapeHTML(item.explanation)}</span>
            `;
          }

          if (feedback) {
            feedback.dataset.state = isCorrect ? 'correct' : 'wrong';
            feedback.textContent = isCorrect
              ? `Richtig: ${item.correct}. ${item.explanation}`
              : `Noch nicht: richtig ist "${item.correct}". ${item.explanation}`;
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
