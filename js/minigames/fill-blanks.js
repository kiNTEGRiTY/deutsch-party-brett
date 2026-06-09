/**
 * Mini-Game: Fill in the Blanks
 *
 * Complete sentences or answer reading-comprehension questions by choosing
 * the best option.
 */

const MAX_ROUNDS = 3;
const ADVANCE_DELAY_MS = 1100;

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

function uniqueOptions(options, correct) {
  const values = Array.isArray(options) ? options : [];
  const normalized = [correct, ...values]
    .map((option) => String(option ?? '').trim())
    .filter(Boolean);

  return [...new Set(normalized)];
}

function fillHint(sentence, answer) {
  const answerText = String(answer || '');
  const lowerAnswer = answerText.toLocaleLowerCase('de-DE');

  if (/en$|st$|t$/.test(lowerAnswer)) {
    return `"${answerText}" ist hier das passende Tun-Wort im Satz.`;
  }

  if (/^[A-ZÄÖÜ]/.test(answerText)) {
    return `"${answerText}" ist hier das gesuchte Namenwort.`;
  }

  if (String(sentence || '').includes('___')) {
    return `Lies den Satz mit "${answerText}" noch einmal ganz.`;
  }

  return `Die passende Antwort ist "${answerText}".`;
}

function normalizeFillItem(rawItem) {
  const sentence = String(rawItem?.sentence ?? '').trim();
  const correct = String(rawItem?.blank ?? rawItem?.correct ?? '').trim();
  const options = uniqueOptions(rawItem?.options, correct);

  if (!sentence || !correct || options.length < 2) {
    return null;
  }

  return {
    mode: 'fill',
    mark: 'Lücke',
    title: 'Lücke füllen',
    prompt: 'Setze das passende Wort ein.',
    sentence,
    correct,
    options,
    hint: rawItem?.hint || fillHint(sentence, correct)
  };
}

function normalizeReadingQuestion(question, text) {
  const prompt = String(question?.question ?? '').trim();
  const correct = String(question?.correct ?? '').trim();
  const options = uniqueOptions(question?.options, correct);

  if (!prompt || !correct || options.length < 2) {
    return null;
  }

  return {
    mode: 'reading',
    mark: 'Lesen',
    title: 'Textfrage',
    prompt,
    correct,
    options,
    contextTitle: String(text?.title ?? 'Lesetext').trim(),
    contextText: String(text?.text ?? '').trim(),
    hint: `Die Antwort steht im Text: "${correct}".`
  };
}

function getQuizItems(content = {}) {
  if (content.type === 'fillBlanks' && Array.isArray(content.items)) {
    return content.items.map(normalizeFillItem).filter(Boolean);
  }

  if (content.type === 'lesen' && Array.isArray(content.texts) && content.texts.length > 0) {
    const text = content.texts[Math.floor(Math.random() * content.texts.length)];
    if (!Array.isArray(text?.questions)) {
      return [];
    }

    return text.questions.map((question) => normalizeReadingQuestion(question, text)).filter(Boolean);
  }

  return [];
}

function initialCopy(mode) {
  if (mode === 'reading') {
    return 'Lies den Text und tippe die Antwort, die wirklich darin vorkommt.';
  }

  return 'Lies den ganzen Satz. Die Karte muss inhaltlich und grammatisch passen.';
}

function renderSentence(sentence, revealedAnswer = '', state = '') {
  if (!String(sentence).includes('___')) {
    return `<span>${escapeHTML(sentence)}</span>`;
  }

  const [before, ...afterParts] = String(sentence).split('___');
  const after = afterParts.join('___');
  const stateClass = state ? ` is-${state}` : '';
  const blankText = revealedAnswer || '...';

  return `
    <span>${escapeHTML(before)}</span>
    <span class="fill-blanks-blank${stateClass}">${escapeHTML(blankText)}</span>
    <span>${escapeHTML(after)}</span>
  `;
}

export const FillBlanks = {
  id: 'fill-blanks',
  name_de: 'Lückentext',
  topics: ['lueckentexte', 'lesen'],

  setup(container, task, onComplete) {
    const quizItems = shuffle(getQuizItems(task.content)).slice(0, MAX_ROUNDS);
    if (quizItems.length === 0) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-fill-blanks-content',
        topic: task.topic
      });
      return () => {};
    }

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
      const score = Math.round((correctCount / quizItems.length) * 100);
      onComplete({
        correct: score >= 80,
        partial: score >= 50,
        score,
        details: {
          correctCount,
          totalQuestions: quizItems.length,
          topic: task.topic,
          mode: quizItems[0]?.mode || 'fill'
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
        if (currentIndex < quizItems.length) {
          renderQuestion();
          return;
        }

        finish();
      }, ADVANCE_DELAY_MS);
    };

    const renderContext = (item) => {
      if (item.mode !== 'reading') {
        return '';
      }

      return `
        <section class="fill-blanks-context" aria-label="Lesetext">
          <h4>${escapeHTML(item.contextTitle)}</h4>
          <p>${escapeHTML(item.contextText)}</p>
        </section>
      `;
    };

    const renderPromptCard = (item) => {
      if (item.mode === 'reading') {
        return `
          <section class="fill-blanks-card" aria-label="Frage">
            <span class="fill-blanks-prompt">Beantworte die Frage.</span>
            <strong class="fill-blanks-question">${escapeHTML(item.prompt)}</strong>
            <span class="fill-blanks-ghost">Suche die Stelle im Text und wähle die genaue Antwort.</span>
          </section>
        `;
      }

      return `
        <section class="fill-blanks-card" aria-label="${escapeHTML(item.prompt)}">
          <span class="fill-blanks-prompt">${escapeHTML(item.prompt)}</span>
          <p class="fill-blanks-sentence">${renderSentence(item.sentence)}</p>
          <span class="fill-blanks-ghost">Der Satz soll sich am Ende vollständig und natürlich lesen.</span>
        </section>
      `;
    };

    const renderQuestion = () => {
      answered = false;
      cleanupRenderListeners();

      const item = quizItems[currentIndex];
      const options = shuffle(item.options);
      const progress = currentIndex / quizItems.length;

      container.innerHTML = `
        <div class="fill-blanks-game" data-mode="${escapeHTML(item.mode)}">
          <div class="fill-blanks-brief">
            <div class="fill-blanks-mark" aria-hidden="true">${escapeHTML(item.mark)}</div>
            <div class="fill-blanks-copy">
              <h3>${escapeHTML(item.title)}</h3>
              <p>${escapeHTML(initialCopy(item.mode))}</p>
            </div>
            <div class="fill-blanks-status" aria-live="polite">
              <span>${currentIndex + 1}/${quizItems.length}</span>
              <div class="fill-blanks-progress" aria-hidden="true"><span></span></div>
            </div>
          </div>

          ${renderContext(item)}
          ${renderPromptCard(item)}

          <section class="fill-blanks-options" aria-label="Antworten">
            ${options.map((option, optionIndex) => `
              <button class="fill-blanks-option" type="button" data-option-index="${optionIndex}">
                <span>${escapeHTML(option)}</span>
              </button>
            `).join('')}
          </section>

          <div class="fill-blanks-feedback" id="fill-blanks-feedback" aria-live="polite">
            ${escapeHTML(initialCopy(item.mode))}
          </div>
        </div>
      `;

      container.querySelector('.fill-blanks-progress span')?.style.setProperty('transform', `scaleX(${progress})`);

      const feedback = container.querySelector('#fill-blanks-feedback');
      const sentence = container.querySelector('.fill-blanks-sentence');
      const buttons = Array.from(container.querySelectorAll('.fill-blanks-option'));

      buttons.forEach((button) => {
        addListener(button, 'click', () => {
          if (answered) {
            return;
          }

          answered = true;
          const selected = options[Number(button.dataset.optionIndex)];
          const isCorrect = selected === item.correct;
          if (isCorrect) {
            correctCount++;
          }

          buttons.forEach((optionButton) => {
            const option = options[Number(optionButton.dataset.optionIndex)];
            optionButton.disabled = true;
            optionButton.classList.toggle('is-correct', option === item.correct);
            optionButton.classList.toggle('is-wrong', optionButton === button && !isCorrect);
          });

          if (sentence && item.mode === 'fill') {
            sentence.innerHTML = renderSentence(item.sentence, item.correct, isCorrect ? 'correct' : 'wrong');
          }

          if (feedback) {
            feedback.dataset.state = isCorrect ? 'correct' : 'wrong';
            if (item.mode === 'reading') {
              feedback.textContent = isCorrect
                ? `Richtig: ${item.correct}.`
                : `Noch nicht: richtig ist "${item.correct}". Lies die passende Textstelle noch einmal.`;
            } else {
              feedback.textContent = isCorrect
                ? `Richtig: ${item.hint}`
                : `Noch nicht: ${item.hint}`;
            }
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
