/**
 * Mini-Game: Rhyme Match
 *
 * Match pairs of German words that rhyme.
 */

const MAX_PAIRS = 4;
const MISMATCH_DELAY_MS = 620;
const COMPLETE_DELAY_MS = 900;

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
  if (!Array.isArray(pair) || pair.length < 2) {
    return null;
  }

  const first = String(pair[0] ?? '').trim();
  const second = String(pair[1] ?? '').trim();
  if (!first || !second || first === second) {
    return null;
  }

  return [first, second];
}

function rhymeEnding(word) {
  const cleaned = String(word || '').toLocaleLowerCase('de-DE').replace(/[^a-zäöüß]/g, '');
  if (cleaned.length <= 3) {
    return cleaned;
  }

  return cleaned.slice(-3);
}

function pairHint(first, second) {
  const ending = rhymeEnding(first);
  if (!ending) {
    return `Sprich "${first}" und "${second}" laut nacheinander.`;
  }

  return `Beide Wörter haben am Ende einen ähnlichen Klang: ${ending}.`;
}

export const RhymeMatch = {
  id: 'rhyme-match',
  name_de: 'Reimpaare finden',
  topics: ['reime'],

  setup(container, task, onComplete) {
    const pairs = Array.isArray(task.content?.pairs)
      ? task.content.pairs.map(normalizePair).filter(Boolean)
      : [];

    if (pairs.length === 0) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-rhyme-match-content',
        topic: task.topic
      });
      return () => {};
    }

    const selectedPairs = shuffle(pairs).slice(0, MAX_PAIRS);
    const cards = shuffle(selectedPairs.flatMap(([first, second], pairIndex) => [
      { id: `${pairIndex}-a`, word: first, pairIndex },
      { id: `${pairIndex}-b`, word: second, pairIndex }
    ]));

    const matchedCardIds = new Set();
    const matchedPairIndexes = new Set();
    let selectedCardId = null;
    let locked = false;
    let wrongCardIds = [];
    let mistakes = 0;
    let feedback = 'Tippe zwei Karten an. Wenn die Wörter gleich klingen, bleibt das Paar liegen.';
    let feedbackState = '';
    let disposed = false;
    let mismatchTimeoutId = null;
    let completeTimeoutId = null;
    const listeners = [];

    const addListener = (node, eventName, handler) => {
      node.addEventListener(eventName, handler);
      listeners.push(() => node.removeEventListener(eventName, handler));
    };

    const cleanupRenderListeners = () => {
      listeners.forEach((remove) => remove());
      listeners.length = 0;
    };

    const findCard = (cardId) => cards.find((card) => card.id === cardId);

    const complete = () => {
      const score = Math.max(50, 100 - (mistakes * 12));
      completeTimeoutId = setTimeout(() => {
        if (disposed) {
          return;
        }

        onComplete({
          correct: score >= 80,
          partial: score >= 50,
          score,
          details: {
            matchedPairs: matchedPairIndexes.size,
            totalPairs: selectedPairs.length,
            mistakes,
            topic: task.topic
          }
        });
      }, COMPLETE_DELAY_MS);
    };

    const renderPairList = () => selectedPairs.map(([first, second], pairIndex) => {
      const isMatched = matchedPairIndexes.has(pairIndex);
      return `
        <li class="${isMatched ? 'is-matched' : ''}">
          <span>${isMatched ? escapeHTML(first) : '...'}</span>
          <span>${isMatched ? escapeHTML(second) : '...'}</span>
        </li>
      `;
    }).join('');

    const render = () => {
      cleanupRenderListeners();

      const progress = matchedPairIndexes.size / selectedPairs.length;

      container.innerHTML = `
        <div class="rhyme-match-game">
          <div class="rhyme-match-brief">
            <div class="rhyme-match-mark" aria-hidden="true">Reim</div>
            <div class="rhyme-match-copy">
              <h3>Reimpaare finden</h3>
              <p>Sprich die Wörter leise mit. Gleicher Endklang bildet ein Paar.</p>
            </div>
            <div class="rhyme-match-status" aria-live="polite">
              <span>${matchedPairIndexes.size}/${selectedPairs.length} Paare</span>
              <div class="rhyme-match-progress" aria-hidden="true"><span></span></div>
            </div>
          </div>

          <section class="rhyme-match-board" aria-label="Wortkarten">
            ${cards.map((card) => {
              const isMatched = matchedCardIds.has(card.id);
              const isSelected = selectedCardId === card.id;
              const isWrong = wrongCardIds.includes(card.id);
              return `
                <button
                  class="rhyme-match-card ${isMatched ? 'is-matched' : ''} ${isSelected ? 'is-selected' : ''} ${isWrong ? 'is-wrong' : ''}"
                  type="button"
                  data-card-id="${escapeHTML(card.id)}"
                  ${locked || isMatched ? 'disabled' : ''}
                  aria-pressed="${isSelected ? 'true' : 'false'}"
                >
                  <span>${escapeHTML(card.word)}</span>
                </button>
              `;
            }).join('')}
          </section>

          <section class="rhyme-match-pairs" aria-label="Gefundene Reimpaare">
            <h4>Gefundene Paare</h4>
            <ol>${renderPairList()}</ol>
          </section>

          <div class="rhyme-match-feedback" id="rhyme-match-feedback" data-state="${escapeHTML(feedbackState)}" aria-live="polite">
            ${escapeHTML(feedback)}
          </div>
        </div>
      `;

      container.querySelector('.rhyme-match-progress span')?.style.setProperty('transform', `scaleX(${progress})`);

      container.querySelectorAll('.rhyme-match-card').forEach((button) => {
        addListener(button, 'click', () => {
          handleCardClick(button.dataset.cardId);
        });
      });
    };

    const handleCardClick = (cardId) => {
      if (locked || matchedCardIds.has(cardId)) {
        return;
      }

      const card = findCard(cardId);
      if (!card) {
        return;
      }

      if (!selectedCardId) {
        selectedCardId = cardId;
        feedback = `"${card.word}" ist ausgewählt. Suche jetzt den Reimpartner.`;
        feedbackState = 'selected';
        render();
        return;
      }

      if (selectedCardId === cardId) {
        selectedCardId = null;
        feedback = 'Auswahl gelöst. Tippe zwei Karten an, die sich reimen.';
        feedbackState = '';
        render();
        return;
      }

      const selectedCard = findCard(selectedCardId);
      if (!selectedCard) {
        selectedCardId = cardId;
        render();
        return;
      }

      const isMatch = selectedCard.pairIndex === card.pairIndex;
      if (isMatch) {
        matchedCardIds.add(selectedCard.id);
        matchedCardIds.add(card.id);
        matchedPairIndexes.add(card.pairIndex);
        feedback = `"${selectedCard.word}" und "${card.word}" reimen sich. ${pairHint(selectedCard.word, card.word)}`;
        feedbackState = 'correct';
        selectedCardId = null;
        wrongCardIds = [];
        render();

        if (matchedPairIndexes.size >= selectedPairs.length) {
          locked = true;
          complete();
        }
        return;
      }

      mistakes++;
      locked = true;
      wrongCardIds = [selectedCard.id, card.id];
      selectedCardId = null;
      feedback = `"${selectedCard.word}" und "${card.word}" klingen am Ende nicht gleich. Versuch ein anderes Paar.`;
      feedbackState = 'wrong';
      render();

      mismatchTimeoutId = setTimeout(() => {
        mismatchTimeoutId = null;
        if (disposed) {
          return;
        }

        locked = false;
        selectedCardId = null;
        wrongCardIds = [];
        feedback = 'Tippe zwei Karten an. Achte besonders auf den letzten Klang.';
        feedbackState = '';
        render();
      }, MISMATCH_DELAY_MS);
    };

    render();
    return () => {
      disposed = true;
      cleanupRenderListeners();
      if (mismatchTimeoutId) {
        clearTimeout(mismatchTimeoutId);
      }
      if (completeTimeoutId) {
        clearTimeout(completeTimeoutId);
      }
    };
  }
};
