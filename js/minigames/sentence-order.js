/**
 * Mini-Game: Sentence Order
 *
 * Players build a German sentence by tapping word cards into sentence slots.
 */

const MAX_ATTEMPTS = 2;

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

function shuffleAwayFromOriginal(tokens) {
  if (tokens.length < 2) {
    return tokens;
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const shuffled = shuffle(tokens);
    const stillOriginal = shuffled.every((token, index) => token.originalIndex === index);
    if (!stillOriginal) {
      return shuffled;
    }
  }

  return [tokens[1], tokens[0], ...tokens.slice(2)];
}

function normalizeSentenceItem(item) {
  if (!item || !Array.isArray(item.words) || item.words.length === 0 || !item.correct) {
    return null;
  }

  return {
    words: item.words.map((word) => String(word)),
    correct: String(item.correct)
  };
}

function sentenceTip(words) {
  if (words.length <= 5) {
    return 'Suche zuerst, wer etwas tut. Danach folgt meist das Tun-Wort.';
  }

  return 'Baue erst den Satzanfang und achte dann auf das gebeugte Verb.';
}

function progressLabel(selectedCount, totalCount, attempts) {
  const attemptLabel = attempts === 0 ? 'erster Versuch' : `Versuch ${attempts + 1}`;
  return `${selectedCount}/${totalCount} Wörter · ${attemptLabel}`;
}

export const SentenceOrder = {
  id: 'sentence-order',
  name_de: 'Sätze ordnen',
  topics: ['satzbau'],

  setup(container, task, onComplete) {
    const sentences = Array.isArray(task.content?.sentenceOrder)
      ? task.content.sentenceOrder.map(normalizeSentenceItem).filter(Boolean)
      : [];

    if (sentences.length === 0) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-sentence-order-content',
        topic: task.topic
      });
      return () => {};
    }

    const item = sentences[Math.floor(Math.random() * sentences.length)];
    const tokens = item.words.map((word, index) => ({
      id: `${index}-${word}`,
      word,
      originalIndex: index
    }));
    const bankTokens = shuffleAwayFromOriginal(tokens);
    const selectedIds = [];
    let attempts = 0;
    let locked = false;
    let completionTimeoutId = null;
    let disposed = false;
    let slotStates = [];
    const listeners = [];

    const addListener = (node, eventName, handler) => {
      node.addEventListener(eventName, handler);
      listeners.push(() => node.removeEventListener(eventName, handler));
    };

    const cleanupRenderListeners = () => {
      listeners.forEach((remove) => remove());
      listeners.length = 0;
    };

    const selectedTokens = () => selectedIds
      .map((id) => tokens.find((token) => token.id === id))
      .filter(Boolean);

    const availableTokens = () => bankTokens.filter((token) => !selectedIds.includes(token.id));

    const correctPositions = () => selectedTokens()
      .filter((token, index) => token.word === item.words[index])
      .length;

    const complete = (result, delay = 1050) => {
      completionTimeoutId = setTimeout(() => {
        if (disposed) {
          return;
        }
        onComplete(result);
      }, delay);
    };

    const render = () => {
      cleanupRenderListeners();
      const chosenTokens = selectedTokens();
      const remainingTokens = availableTokens();
      const isReady = selectedIds.length === tokens.length && !locked;
      const progress = selectedIds.length / tokens.length;
      const status = progressLabel(selectedIds.length, tokens.length, attempts);

      container.innerHTML = `
        <div class="sentence-order-game">
          <div class="sentence-order-brief">
            <div class="sentence-order-mark" aria-hidden="true">Satz</div>
            <div class="sentence-order-copy">
              <h3>Satz ordnen</h3>
              <p>${escapeHTML(sentenceTip(item.words))}</p>
            </div>
            <div class="sentence-order-status" aria-live="polite">
              <span>${escapeHTML(status)}</span>
              <div class="sentence-order-progress" aria-hidden="true"><span></span></div>
            </div>
          </div>

          <section class="sentence-order-slots" aria-label="Satzplätze">
            ${item.words.map((_, index) => {
              const token = chosenTokens[index];
              const state = slotStates[index] || '';
              return `
                <button
                  class="sentence-order-slot ${token ? 'is-filled' : ''} ${state ? `is-${state}` : ''}"
                  type="button"
                  data-slot-index="${index}"
                  ${token && !locked ? '' : 'disabled'}
                >
                  <span class="sentence-order-slot-number">${index + 1}</span>
                  <span class="sentence-order-slot-word">${token ? escapeHTML(token.word) : '...'}</span>
                </button>
              `;
            }).join('')}
          </section>

          <section class="sentence-order-bank" aria-label="Wortkarten">
            ${remainingTokens.map((token) => `
              <button class="sentence-order-token" type="button" data-token-id="${escapeHTML(token.id)}" ${locked ? 'disabled' : ''}>
                ${escapeHTML(token.word)}
              </button>
            `).join('')}
          </section>

          <div class="sentence-order-controls">
            <button class="sentence-order-control" type="button" data-action="undo" ${selectedIds.length === 0 || locked ? 'disabled' : ''}>Zurück</button>
            <button class="sentence-order-control" type="button" data-action="clear" ${selectedIds.length === 0 || locked ? 'disabled' : ''}>Leeren</button>
            <button class="sentence-order-control sentence-order-control--primary" type="button" data-action="check" ${isReady ? '' : 'disabled'}>Prüfen</button>
          </div>

          <div class="sentence-order-feedback" id="sentence-order-feedback" aria-live="polite">
            Tippe die Wörter in der Reihenfolge an. Gefüllte Plätze kannst du antippen, um sie wieder zu lösen.
          </div>
        </div>
      `;

      container.querySelector('.sentence-order-progress span')?.style.setProperty('transform', `scaleX(${progress})`);

      container.querySelectorAll('.sentence-order-token').forEach((button) => {
        addListener(button, 'click', () => {
          if (locked) {
            return;
          }
          selectedIds.push(button.dataset.tokenId);
          slotStates = [];
          render();
        });
      });

      container.querySelectorAll('.sentence-order-slot.is-filled').forEach((button) => {
        addListener(button, 'click', () => {
          if (locked) {
            return;
          }
          const slotIndex = Number(button.dataset.slotIndex);
          selectedIds.splice(slotIndex, 1);
          slotStates = [];
          render();
        });
      });

      container.querySelectorAll('.sentence-order-control').forEach((button) => {
        addListener(button, 'click', () => {
          if (locked) {
            return;
          }

          const action = button.dataset.action;
          if (action === 'undo') {
            selectedIds.pop();
            slotStates = [];
            render();
            return;
          }

          if (action === 'clear') {
            selectedIds.length = 0;
            slotStates = [];
            render();
            return;
          }

          if (action === 'check') {
            checkAnswer();
          }
        });
      });
    };

    const updateFeedback = (message, state) => {
      const feedback = container.querySelector('#sentence-order-feedback');
      if (!feedback) {
        return;
      }
      feedback.dataset.state = state;
      feedback.textContent = message;
    };

    const checkAnswer = () => {
      const chosenWords = selectedTokens().map((token) => token.word);
      const isCorrect = chosenWords.every((word, index) => word === item.words[index]);
      const matchingPositions = correctPositions();
      attempts++;
      slotStates = item.words.map((word, index) => chosenWords[index] === word ? 'correct' : 'wrong');

      if (isCorrect) {
        locked = true;
        render();
        updateFeedback(`Richtig: ${item.correct} Der Satz hat eine klare Reihenfolge.`, 'correct');
        complete({
          correct: true,
          partial: false,
          score: 100,
          details: {
            attempts,
            totalWords: item.words.length,
            correctPositions: item.words.length,
            topic: task.topic
          }
        });
        return;
      }

      if (attempts < MAX_ATTEMPTS) {
        render();
        updateFeedback(`${matchingPositions} von ${item.words.length} Positionen stimmen. Löse die roten Wörter und versuche es noch einmal.`, 'wrong');
        return;
      }

      locked = true;
      render();
      const score = Math.round((matchingPositions / item.words.length) * 100);
      updateFeedback(`Die Lösung ist: ${item.correct}`, 'mixed');
      complete({
        correct: false,
        partial: score >= 50,
        score,
        details: {
          attempts,
          totalWords: item.words.length,
          correctPositions: matchingPositions,
          topic: task.topic,
          solution: item.correct
        }
      }, 1400);
    };

    render();

    return () => {
      disposed = true;
      if (completionTimeoutId) {
        clearTimeout(completionTimeoutId);
      }
      cleanupRenderListeners();
    };
  }
};
