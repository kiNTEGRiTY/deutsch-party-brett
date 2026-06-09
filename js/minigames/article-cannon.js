/**
 * Mini-Game: Article Cannon (Artikel-Kanone)
 *
 * Players fire the correct German article at each noun and receive immediate
 * feedback before the next target appears.
 */

const MAX_ROUNDS = 5;
const ADVANCE_DELAY_MS = 1150;
const ARTICLES = ['der', 'die', 'das'];

const FALLBACK_WORDS = [
  { word: 'Haus', correct: 'das' },
  { word: 'Baum', correct: 'der' },
  { word: 'Katze', correct: 'die' },
  { word: 'Sonne', correct: 'die' },
  { word: 'Buch', correct: 'das' }
];

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

function normalizeQuestion(rawQuestion) {
  const word = String(rawQuestion?.word ?? rawQuestion?.noun ?? '').trim();
  const correct = String(rawQuestion?.correct ?? rawQuestion?.article ?? '').trim().toLowerCase();

  if (!word || !ARTICLES.includes(correct)) {
    return null;
  }

  return { word, correct };
}

function collectQuestions(content = {}) {
  const quizSets = Array.isArray(content.quizSets) ? content.quizSets : [];
  const questions = quizSets.flatMap((set) => (
    Array.isArray(set?.questions) ? set.questions : [set]
  ));
  const normalized = questions.map(normalizeQuestion).filter(Boolean);
  return normalized.length ? normalized : FALLBACK_WORDS;
}

function articleName(article) {
  return {
    der: 'maskulin',
    die: 'feminin',
    das: 'neutral'
  }[article] || 'Artikel';
}

function ruleHintFor(word, correct, rules = []) {
  const normalized = word.toLocaleLowerCase('de-DE');
  const suffixHints = [
    { suffix: 'ung', text: 'Endung -ung: fast immer die.' },
    { suffix: 'schaft', text: 'Endung -schaft: immer die.' },
    { suffix: 'chen', text: 'Endung -chen: immer das.' },
    { suffix: 'nis', text: 'Endung -nis: meistens das.' },
    { suffix: 'er', text: 'Endung -er: oft der.' }
  ];

  const suffixHint = suffixHints.find((hint) => normalized.endsWith(hint.suffix));
  if (suffixHint) {
    return suffixHint.text;
  }

  const matchingRule = Array.isArray(rules)
    ? rules.find((rule) => Array.isArray(rule.examples) && rule.examples.includes(word))
    : null;

  if (matchingRule?.rule) {
    return matchingRule.rule;
  }

  return `Sprich laut: ${correct} ${word}.`;
}

function feedbackText(item, selectedArticle, state, rules = []) {
  if (!selectedArticle) {
    return `Wähle den Artikel für ${item.word}.`;
  }

  const hint = ruleHintFor(item.word, item.correct, rules);
  if (state === 'correct') {
    return `Treffer: ${item.correct} ${item.word}. ${hint}`;
  }

  return `Knapp vorbei: richtig ist ${item.correct} ${item.word}. ${hint}`;
}

export const ArticleCannon = {
  id: 'article-cannon',
  name_de: 'Artikel-Kanone',
  topics: ['artikel'],

  setup(container, task, onComplete) {
    const content = task.content || {};
    const questions = shuffle(collectQuestions(content)).slice(0, MAX_ROUNDS);

    if (!questions.length) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-article-cannon-content',
        topic: task.topic
      });
      return () => {};
    }

    let currentIndex = 0;
    let score = 0;
    let answered = false;
    let disposed = false;
    let selectedArticle = null;
    let nextTimeoutId = null;
    const listeners = new AbortController();
    const { signal } = listeners;

    const finish = () => {
      const percentage = Math.round((score / questions.length) * 100);
      onComplete({
        correct: percentage >= 80,
        partial: percentage >= 50,
        score: percentage,
        details: {
          score,
          total: questions.length,
          topic: task.topic
        }
      });
    };

    const scheduleNext = () => {
      nextTimeoutId = window.setTimeout(() => {
        nextTimeoutId = null;
        if (disposed) {
          return;
        }

        currentIndex++;
        selectedArticle = null;
        answered = false;

        if (currentIndex < questions.length) {
          renderRound();
          return;
        }

        finish();
      }, ADVANCE_DELAY_MS);
    };

    const renderRound = (state = '') => {
      const item = questions[currentIndex];
      const progress = (currentIndex + (answered ? 1 : 0)) / questions.length;
      const shotClass = selectedArticle ? ' is-fired' : '';
      const stateAttr = state ? ` data-state="${escapeHTML(state)}"` : '';

      container.innerHTML = `
        <div class="article-cannon-game"${stateAttr}>
          <div class="article-cannon-hud">
            <div class="article-cannon-mark" aria-hidden="true">Artikel</div>
            <div class="article-cannon-copy">
              <h3>Artikel treffen</h3>
              <p>Feuere den passenden Begleiter auf das Wort. Jeder Treffer macht den Artikel sicherer.</p>
            </div>
            <div class="article-cannon-status" aria-live="polite">
              <span>${currentIndex + 1}/${questions.length}</span>
              <strong>${score} Treffer</strong>
              <div class="article-cannon-progress" aria-hidden="true"><span></span></div>
            </div>
          </div>

          <section class="article-cannon-range" aria-label="Artikel-Kanone">
            <div class="article-cannon-target"${stateAttr}>
              <span>Nomen</span>
              <strong>${escapeHTML(item.word)}</strong>
              <small>${selectedArticle ? `${escapeHTML(item.correct)} ${escapeHTML(item.word)}` : 'der, die oder das?'}</small>
            </div>
            <div class="article-cannon-shot${shotClass}" data-article="${escapeHTML(selectedArticle || '')}" aria-hidden="true">
              ${escapeHTML(selectedArticle || '')}
            </div>
            <div class="article-cannon-aim-line" aria-hidden="true"></div>
            <div class="article-cannon-base" aria-hidden="true">
              <div class="article-cannon-barrel"></div>
              <div class="article-cannon-wheel article-cannon-wheel--left"></div>
              <div class="article-cannon-body">Kanone</div>
              <div class="article-cannon-wheel article-cannon-wheel--right"></div>
            </div>
          </section>

          <section class="article-cannon-controls" aria-label="Artikel wählen">
            ${ARTICLES.map((article) => `
              <button class="article-cannon-button" type="button" data-article="${article}" ${answered ? 'disabled' : ''}>
                <span>${article}</span>
                <small>${articleName(article)}</small>
              </button>
            `).join('')}
          </section>

          <div class="article-cannon-feedback" id="article-cannon-feedback" aria-live="polite">
            ${escapeHTML(feedbackText(item, selectedArticle, state, content.rules))}
          </div>
        </div>
      `;

      container.querySelector('.article-cannon-progress span')?.style.setProperty('transform', `scaleX(${progress})`);

      const buttons = [...container.querySelectorAll('.article-cannon-button')];
      if (answered) {
        buttons.forEach((button) => {
          const article = button.dataset.article;
          button.classList.toggle('is-correct', article === item.correct);
          button.classList.toggle('is-wrong', article === selectedArticle && article !== item.correct);
        });
        return;
      }

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          handleAnswer(button.dataset.article);
        }, { signal });
      });
    };

    const handleAnswer = (article) => {
      if (answered || disposed || !ARTICLES.includes(article)) {
        return;
      }

      const item = questions[currentIndex];
      const isCorrect = article === item.correct;
      selectedArticle = article;
      answered = true;

      if (isCorrect) {
        score++;
      }

      renderRound(isCorrect ? 'correct' : 'wrong');
      scheduleNext();
    };

    renderRound();

    return () => {
      disposed = true;
      window.clearTimeout(nextTimeoutId);
      listeners.abort();
    };
  }
};
