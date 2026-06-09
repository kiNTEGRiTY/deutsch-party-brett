/**
 * Mini-Game: Word Type Sort (Wortarten-Sortierer)
 *
 * Players classify German words as Nomen, Verben or Adjektive.
 */

const TYPE_ORDER = ['nomen', 'verben', 'adjektive'];

const TYPE_META = {
  nomen: {
    badge: 'N',
    label: 'Nomen',
    answer: 'ein Nomen',
    negative: 'kein Nomen',
    hint: 'Namen für Menschen, Tiere, Dinge oder Orte.',
    rule: 'Nomen schreibst du groß. Oft passt der, die oder das davor.'
  },
  verben: {
    badge: 'V',
    label: 'Verben',
    answer: 'ein Verb',
    negative: 'kein Verb',
    hint: 'Was jemand tut oder was geschieht.',
    rule: 'Verben sagen, was jemand tut oder was passiert.'
  },
  adjektive: {
    badge: 'A',
    label: 'Adjektive',
    answer: 'ein Adjektiv',
    negative: 'kein Adjektiv',
    hint: 'Wie etwas ist oder sich anfühlt.',
    rule: 'Adjektive beschreiben, wie etwas ist.'
  }
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

function pickPlayableSet(mixedSets = []) {
  const playable = mixedSets.filter((set) => {
    if (!set || !Array.isArray(set.words) || set.words.length === 0) {
      return false;
    }

    return TYPE_ORDER.every((type) => Array.isArray(set[type]));
  });

  if (playable.length === 0) {
    return null;
  }

  return playable[Math.floor(Math.random() * playable.length)];
}

function buildWordTypes(set) {
  const wordTypes = new Map();
  TYPE_ORDER.forEach((type) => {
    set[type].forEach((word) => wordTypes.set(word, type));
  });
  return wordTypes;
}

function getFocusType(topic) {
  return TYPE_META[topic] ? topic : null;
}

export const WordTypeSort = {
  id: 'word-type-sort',
  name_de: 'Wortarten-Sortierer',
  topics: ['nomen', 'verben', 'adjektive'],

  setup(container, task, onComplete) {
    const set = pickPlayableSet(task.content?.mixedSets);
    if (!set) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-word-type-content',
        topic: task.topic
      });
      return () => {};
    }

    const wordTypes = buildWordTypes(set);
    const words = shuffle(set.words.filter((word) => wordTypes.has(word)));
    const totalWords = words.length;
    if (totalWords === 0) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'empty-word-type-set',
        topic: task.topic
      });
      return () => {};
    }

    const focusType = getFocusType(task.topic);
    const focusMeta = focusType ? TYPE_META[focusType] : null;

    let selectedCard = null;
    let sortedCount = 0;
    let correctCount = 0;
    let completionTimeoutId = null;
    let disposed = false;
    const listeners = [];
    const microTimeouts = new Set();

    const addListener = (node, eventName, handler) => {
      node.addEventListener(eventName, handler);
      listeners.push(() => node.removeEventListener(eventName, handler));
    };

    const setMicroTimeout = (handler, delay) => {
      const timeoutId = setTimeout(() => {
        microTimeouts.delete(timeoutId);
        handler();
      }, delay);
      microTimeouts.add(timeoutId);
      return timeoutId;
    };

    container.innerHTML = `
      <div class="word-type-sort-game" data-focus-type="${escapeHTML(focusType || 'all')}">
        <div class="word-type-sort-brief">
          <div class="word-type-sort-mark" aria-hidden="true">${escapeHTML(focusMeta?.badge || 'ABC')}</div>
          <div class="word-type-sort-copy">
            <h3>Wortarten sortieren</h3>
            <p>${escapeHTML(focusMeta
              ? `Achte heute besonders auf ${focusMeta.label}. ${focusMeta.hint}`
              : 'Sortiere jede Wortkarte sauber in ihr Feld.')}</p>
          </div>
          <div class="word-type-sort-status" aria-live="polite">
            <span id="word-type-sort-progress-label">0/${totalWords}</span>
            <div class="word-type-sort-progress" aria-hidden="true">
              <span id="word-type-sort-progress-fill"></span>
            </div>
          </div>
        </div>

        <div class="word-type-sort-feedback" id="word-type-sort-feedback" aria-live="polite">
          Wähle eine Wortkarte und tippe dann auf das passende Sortierfeld.
        </div>

        <div class="word-type-sort-workbench">
          <div class="word-type-sort-rack" aria-label="Wortkarten">
            ${words.map((word, index) => `
              <button
                class="word-type-card"
                type="button"
                data-word-index="${index}"
                style="--tilt:${Math.round((Math.random() * 6 - 3) * 10) / 10}deg"
              >${escapeHTML(word)}</button>
            `).join('')}
          </div>

          <div class="word-type-sort-bins" aria-label="Sortierfelder">
            ${TYPE_ORDER.map((type) => {
              const meta = TYPE_META[type];
              return `
                <button class="word-type-bin ${type === focusType ? 'is-focus' : ''}" type="button" data-category="${type}">
                  <span class="word-type-bin-header">
                    <span class="word-type-bin-badge">${escapeHTML(meta.badge)}</span>
                    <span class="word-type-bin-label">${escapeHTML(meta.label)}</span>
                    <span class="word-type-bin-count" data-count-for="${type}">0</span>
                  </span>
                  <span class="word-type-bin-hint">${escapeHTML(meta.hint)}</span>
                  <span class="word-type-bin-stack" data-stack-for="${type}"></span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    const feedback = container.querySelector('#word-type-sort-feedback');
    const progressLabel = container.querySelector('#word-type-sort-progress-label');
    const progressFill = container.querySelector('#word-type-sort-progress-fill');
    const cards = Array.from(container.querySelectorAll('.word-type-card'));
    const bins = Array.from(container.querySelectorAll('.word-type-bin'));

    const setFeedback = (message, state = 'neutral') => {
      if (!feedback) {
        return;
      }
      feedback.textContent = message;
      feedback.dataset.state = state;
    };

    const updateProgress = () => {
      const progress = totalWords > 0 ? sortedCount / totalWords : 0;
      if (progressLabel) {
        progressLabel.textContent = `${sortedCount}/${totalWords}`;
      }
      if (progressFill) {
        progressFill.style.transform = `scaleX(${progress})`;
      }
    };

    const clearSelection = () => {
      selectedCard = null;
      cards.forEach((card) => card.classList.remove('is-selected'));
      bins.forEach((bin) => bin.classList.remove('is-ready'));
    };

    const finishIfComplete = () => {
      if (sortedCount < totalWords || completionTimeoutId || disposed) {
        return;
      }

      const score = Math.round((correctCount / totalWords) * 100);
      const missed = totalWords - correctCount;
      setFeedback(
        missed === 0
          ? 'Alles richtig sortiert. Genau so erkennt man Wortarten.'
          : `${correctCount} von ${totalWords} richtig. Schau dir die markierten Karten noch einmal an.`,
        missed === 0 ? 'correct' : 'mixed'
      );

      completionTimeoutId = setTimeout(() => {
        if (disposed) {
          return;
        }

        onComplete({
          correct: score >= 80,
          partial: score >= 50,
          score,
          details: {
            correctCount,
            totalWords,
            topic: task.topic,
            focusType,
            missed
          }
        });
      }, 950);
    };

    const placeSelectedCard = (bin) => {
      if (!selectedCard || selectedCard.dataset.sorted === 'true') {
        bin.classList.add('is-nudged');
        setFeedback('Wähle zuerst eine Wortkarte aus.', 'hint');
        setMicroTimeout(() => bin.classList.remove('is-nudged'), 360);
        return;
      }

      const wordIndex = Number(selectedCard.dataset.wordIndex);
      const word = words[wordIndex];
      const chosenType = bin.dataset.category;
      const correctType = wordTypes.get(word);
      const isCorrect = chosenType === correctType;
      const correctMeta = TYPE_META[correctType];
      const chosenMeta = TYPE_META[chosenType];
      const stack = bin.querySelector('.word-type-bin-stack');
      const countLabel = bin.querySelector(`[data-count-for="${chosenType}"]`);

      selectedCard.dataset.sorted = 'true';
      selectedCard.dataset.correctType = correctType;
      selectedCard.disabled = true;
      selectedCard.classList.remove('is-selected');
      selectedCard.classList.add('is-sorted', isCorrect ? 'is-correct' : 'is-wrong');
      selectedCard.style.setProperty('--land-tilt', `${Math.round((Math.random() * 4 - 2) * 10) / 10}deg`);

      if (stack) {
        stack.appendChild(selectedCard);
      }

      sortedCount++;
      if (isCorrect) {
        correctCount++;
      }

      const sortedInBin = stack?.querySelectorAll('.word-type-card').length || 0;
      if (countLabel) {
        countLabel.textContent = String(sortedInBin);
      }

      clearSelection();
      bin.classList.add(isCorrect ? 'is-good-drop' : 'is-bad-drop');
      setMicroTimeout(() => bin.classList.remove('is-good-drop', 'is-bad-drop'), 520);

      if (isCorrect) {
        setFeedback(`Treffer: "${word}" ist ${correctMeta.answer}. ${correctMeta.rule}`, 'correct');
      } else {
        setFeedback(`Noch nicht: "${word}" ist ${correctMeta.answer} und ${chosenMeta.negative}. ${correctMeta.rule}`, 'wrong');
      }

      updateProgress();
      finishIfComplete();
    };

    cards.forEach((card) => {
      addListener(card, 'click', () => {
        if (card.dataset.sorted === 'true') {
          return;
        }

        cards.forEach((otherCard) => otherCard.classList.remove('is-selected'));
        selectedCard = card;
        card.classList.add('is-selected');
        bins.forEach((bin) => bin.classList.add('is-ready'));
        setFeedback(`"${card.textContent.trim()}" liegt bereit. Tippe jetzt auf Nomen, Verben oder Adjektive.`, 'hint');
      });
    });

    bins.forEach((bin) => {
      addListener(bin, 'click', () => placeSelectedCard(bin));
    });

    updateProgress();

    return () => {
      disposed = true;
      if (completionTimeoutId) {
        clearTimeout(completionTimeoutId);
      }
      microTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      microTimeouts.clear();
      listeners.forEach((remove) => remove());
      listeners.length = 0;
    };
  }
};
