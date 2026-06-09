/**
 * Mini-Game: Article Choice (Artikel-Wahl)
 *
 * Players choose the correct article for nouns, with a retained fallback for
 * sentence-type questions that already route through this game.
 */

const ARTICLE_OPTIONS = ['der', 'die', 'das'];
const SENTENCE_TYPE_OPTIONS = ['Aussagesatz', 'Fragesatz', 'Ausrufesatz'];

const ARTICLE_HINTS = [
  { suffix: 'ung', article: 'die', text: 'Wörter mit -ung sind fast immer die.' },
  { suffix: 'schaft', article: 'die', text: 'Wörter mit -schaft sind fast immer die.' },
  { suffix: 'chen', article: 'das', text: 'Wörter mit -chen sind immer das.' },
  { suffix: 'nis', article: 'das', text: 'Viele Wörter mit -nis sind das.' },
  { suffix: 'er', article: 'der', text: 'Viele Wörter mit -er sind der.' }
];

const SENTENCE_TYPE_HINTS = {
  Aussagesatz: 'Ein Aussagesatz erzählt etwas und endet meistens mit einem Punkt.',
  Fragesatz: 'Ein Fragesatz fragt etwas und endet mit einem Fragezeichen.',
  Ausrufesatz: 'Ein Ausrufesatz ruft, warnt oder betont etwas und endet mit einem Ausrufezeichen.'
};

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

function getArticleHint(word, article) {
  const lowerWord = String(word || '').toLocaleLowerCase('de-DE');
  const matchingHint = ARTICLE_HINTS.find((hint) => lowerWord.endsWith(hint.suffix) && hint.article === article);
  if (matchingHint) {
    return matchingHint.text;
  }

  return `Merke dir "${article} ${word}" als feste Wortgruppe.`;
}

function normalizeArticleItem(rawItem) {
  const word = rawItem?.word;
  const correct = rawItem?.article || rawItem?.correct;
  if (!word || !ARTICLE_OPTIONS.includes(correct)) {
    return null;
  }

  return {
    mode: 'article',
    prompt: 'Welcher Artikel passt?',
    label: 'Artikel wählen',
    display: word,
    options: Array.isArray(rawItem.options) && rawItem.options.length ? rawItem.options : ARTICLE_OPTIONS,
    correct,
    solution: `${correct} ${word}`,
    hint: getArticleHint(word, correct)
  };
}

function normalizeSentenceTypeItem(rawItem) {
  const sentence = rawItem?.sentence || rawItem?.word;
  const correct = rawItem?.type || rawItem?.correct;
  if (!sentence || !SENTENCE_TYPE_OPTIONS.includes(correct)) {
    return null;
  }

  return {
    mode: 'sentence-type',
    prompt: 'Welche Satzart ist das?',
    label: 'Satzart erkennen',
    display: sentence,
    options: Array.isArray(rawItem.options) && rawItem.options.length ? rawItem.options : SENTENCE_TYPE_OPTIONS,
    correct,
    solution: correct,
    hint: SENTENCE_TYPE_HINTS[correct] || 'Achte auf Aussage, Fragezeichen oder Ausruf.'
  };
}

function getQuizItems(content = {}) {
  if (Array.isArray(content.questions)) {
    return content.questions
      .map((item) => normalizeArticleItem(item) || normalizeSentenceTypeItem(item))
      .filter(Boolean);
  }

  if (Array.isArray(content.quizSets)) {
    return content.quizSets.map(normalizeArticleItem).filter(Boolean);
  }

  if (content.type === 'satzarten' && Array.isArray(content.sentences)) {
    return content.sentences.map(normalizeSentenceTypeItem).filter(Boolean);
  }

  return [];
}

function getInitialCopy(mode) {
  if (mode === 'sentence-type') {
    return 'Lies den Satz genau und wähle die passende Satzart.';
  }

  return 'Sprich Artikel und Nomen zusammen. Dann klingt die richtige Wahl oft vertrauter.';
}

export const ArticleChoice = {
  id: 'article-choice',
  name_de: 'Artikel-Wahl',
  topics: ['artikel'],

  setup(container, task, onComplete) {
    const quizItems = shuffle(getQuizItems(task.content)).slice(0, 5);
    if (quizItems.length === 0) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-article-choice-content',
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
          mode: quizItems[0]?.mode || 'article'
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
      }, 1050);
    };

    const renderQuestion = () => {
      answered = false;
      listeners.forEach((remove) => remove());
      listeners.length = 0;

      const item = quizItems[currentIndex];
      const options = Array.isArray(item.options) && item.options.length ? item.options : ARTICLE_OPTIONS;
      const progress = currentIndex / quizItems.length;
      const modeLabel = item.mode === 'sentence-type' ? 'Satzart' : 'Artikel';

      container.innerHTML = `
        <div class="article-choice-game" data-mode="${escapeHTML(item.mode)}">
          <div class="article-choice-brief">
            <div class="article-choice-mark" aria-hidden="true">${escapeHTML(modeLabel)}</div>
            <div class="article-choice-copy">
              <h3>${escapeHTML(item.label)}</h3>
              <p>${escapeHTML(getInitialCopy(item.mode))}</p>
            </div>
            <div class="article-choice-status" aria-live="polite">
              <span>${currentIndex + 1}/${quizItems.length}</span>
              <div class="article-choice-progress" aria-hidden="true">
                <span></span>
              </div>
            </div>
          </div>

          <div class="article-choice-board">
            <section class="article-choice-card" aria-label="${escapeHTML(item.prompt)}">
              <span class="article-choice-prompt">${escapeHTML(item.prompt)}</span>
              <strong class="article-choice-target">${escapeHTML(item.display)}</strong>
              <span class="article-choice-ghost">${escapeHTML(item.mode === 'sentence-type' ? 'Aussage, Frage oder Ausruf?' : 'der / die / das + Nomen')}</span>
            </section>

            <section class="article-choice-actions" aria-label="Antworten">
              ${options.map((option, optionIndex) => `
                <button
                  class="article-choice-option"
                  type="button"
                  data-option-index="${optionIndex}"
                  data-option-value="${escapeHTML(option)}"
                >
                  <span>${escapeHTML(option)}</span>
                </button>
              `).join('')}
            </section>
          </div>

          <div class="article-choice-feedback" id="article-choice-feedback" aria-live="polite">
            ${escapeHTML(getInitialCopy(item.mode))}
          </div>
        </div>
      `;

      const feedback = container.querySelector('#article-choice-feedback');
      const progressFill = container.querySelector('.article-choice-progress span');
      const buttons = Array.from(container.querySelectorAll('.article-choice-option'));
      progressFill?.style.setProperty('transform', `scaleX(${progress})`);

      buttons.forEach((button) => {
        addListener(button, 'click', () => {
          if (answered) {
            return;
          }

          answered = true;
          const selected = button.dataset.optionValue;
          const isCorrect = selected === item.correct;
          if (isCorrect) {
            correctCount++;
          }

          buttons.forEach((optionButton) => {
            const optionValue = optionButton.dataset.optionValue;
            optionButton.disabled = true;
            optionButton.classList.toggle('is-correct', optionValue === item.correct);
            optionButton.classList.toggle('is-wrong', optionButton === button && !isCorrect);
          });

          if (feedback) {
            feedback.dataset.state = isCorrect ? 'correct' : 'wrong';
            feedback.textContent = isCorrect
              ? `Richtig: ${item.solution}. ${item.hint}`
              : `Noch nicht: richtig ist ${item.solution}. ${item.hint}`;
          }

          scheduleNext();
        });
      });
    };

    renderQuestion();

    return () => {
      disposed = true;
      if (nextTimeoutId) {
        clearTimeout(nextTimeoutId);
      }
      listeners.forEach((remove) => remove());
      listeners.length = 0;
    };
  }
};
