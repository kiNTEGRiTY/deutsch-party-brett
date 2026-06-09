/**
 * Mini-Game: Noun Hunter (Nomen-Jäger)
 *
 * Players mark every noun in a compact word strip and get a visual review of
 * found, missed, and incorrect picks.
 */

const MAX_TARGET_NOUNS = 5;
const RESULT_DELAY_MS = 1700;

const FALLBACK_NOUNS = ['Hund', 'Katze', 'Baum', 'Haus', 'Ball', 'Blume'];
const FALLBACK_VERBS = ['laufen', 'spielen', 'lesen', 'malen', 'springen'];
const FALLBACK_ADJECTIVES = ['groß', 'klein', 'schnell', 'schön', 'warm'];
const FUNCTION_WORDS = ['heute', 'gerne', 'mit', 'und', 'auf', 'im', 'sehr'];

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

function uniqueWords(words) {
  const seen = new Set();
  return words
    .map((word) => String(word ?? '').trim())
    .filter(Boolean)
    .filter((word) => {
      const key = word.toLocaleLowerCase('de-DE');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function collectWordSources(content = {}) {
  const mixedSets = Array.isArray(content.mixedSets) ? content.mixedSets : [];
  return {
    nouns: uniqueWords([
      ...(Array.isArray(content.words) ? content.words : []),
      ...mixedSets.flatMap((set) => Array.isArray(set?.nomen) ? set.nomen : [])
    ]),
    verbs: uniqueWords(mixedSets.flatMap((set) => Array.isArray(set?.verben) ? set.verben : [])),
    adjectives: uniqueWords(mixedSets.flatMap((set) => Array.isArray(set?.adjektive) ? set.adjektive : []))
  };
}

function targetCountFor(task, nounCount) {
  const level = Number(task.difficulty?.languageComplexity ?? 2);
  const desired = level <= 2 ? 4 : MAX_TARGET_NOUNS;
  return Math.max(1, Math.min(nounCount, desired));
}

function buildWordStrip(task) {
  const sources = collectWordSources(task.content);
  const nounPool = sources.nouns.length ? sources.nouns : FALLBACK_NOUNS;
  const verbPool = sources.verbs.length ? sources.verbs : FALLBACK_VERBS;
  const adjectivePool = sources.adjectives.length ? sources.adjectives : FALLBACK_ADJECTIVES;
  const targetCount = targetCountFor(task, nounPool.length);
  const targets = shuffle(nounPool).slice(0, targetCount);

  const decoys = shuffle([
    ...verbPool.map((word) => ({ word, type: 'Verb' })),
    ...adjectivePool.map((word) => ({ word, type: 'Adjektiv' })),
    ...FUNCTION_WORDS.map((word) => ({ word, type: 'Begleiter' }))
  ]).slice(0, targetCount + 4);

  return shuffle([
    ...targets.map((word) => ({ word, isNoun: true, type: 'Nomen' })),
    ...decoys.map((entry) => ({ ...entry, isNoun: false }))
  ]).map((entry, index) => ({ ...entry, index }));
}

function summarizeSelection(entries, selectedIndices) {
  let found = 0;
  let wrong = 0;

  entries.forEach((entry) => {
    const selected = selectedIndices.has(entry.index);
    if (entry.isNoun && selected) {
      found++;
    } else if (!entry.isNoun && selected) {
      wrong++;
    }
  });

  const total = entries.filter((entry) => entry.isNoun).length;
  return {
    found,
    missed: total - found,
    wrong,
    total,
    score: Math.max(0, Math.round(((found - wrong * 0.5) / total) * 100))
  };
}

function feedbackFor(summary, checked = false) {
  if (checked) {
    if (summary.score >= 80) {
      return 'Stark: Die Nomen sind sicher markiert.';
    }
    if (summary.found > 0) {
      return `${summary.found} Nomen gefunden. Prüfe die roten Karten und achte auf Namenwörter.`;
    }
    return 'Noch keine sicheren Nomen. Suche Wörter für Dinge, Tiere, Menschen oder Orte.';
  }

  if (summary.wrong > 0) {
    return 'Achte auf Verben und Adjektive: Nicht jedes wichtige Wort ist ein Nomen.';
  }
  if (summary.found > 0) {
    return `${summary.found} von ${summary.total} Nomen markiert.`;
  }
  return 'Tippe alle Wörter an, die Dinge, Tiere, Menschen oder Orte benennen.';
}

export const NounHunter = {
  id: 'noun-hunter',
  name_de: 'Nomen-Jäger',
  topics: ['nomen'],

  setup(container, task, onComplete) {
    const entries = buildWordStrip(task);
    const totalNouns = entries.filter((entry) => entry.isNoun).length;

    if (!entries.length || totalNouns === 0) {
      onComplete({
        correct: false,
        partial: false,
        score: 0,
        reason: 'missing-noun-hunter-content',
        topic: task.topic
      });
      return () => {};
    }

    const selectedIndices = new Set();
    const listeners = new AbortController();
    const { signal } = listeners;
    let checked = false;
    let disposed = false;
    let completionTimeoutId = null;

    container.innerHTML = `
      <div class="noun-hunter-game">
        <div class="noun-hunter-brief">
          <div class="noun-hunter-mark" aria-hidden="true">Nomen</div>
          <div class="noun-hunter-copy">
            <h3>Nomen markieren</h3>
            <p>Namenwörter benennen Dinge, Tiere, Menschen oder Orte. Markiere alle Treffer im Streifen.</p>
          </div>
          <div class="noun-hunter-status" aria-live="polite">
            <span id="noun-hunter-count">0/${totalNouns}</span>
            <div class="noun-hunter-progress" aria-hidden="true"><span></span></div>
          </div>
        </div>

        <section class="noun-hunter-card" aria-label="Wortstreifen">
          <div class="noun-hunter-targets" aria-hidden="true">
            <span>Dinge</span>
            <span>Tiere</span>
            <span>Menschen</span>
            <span>Orte</span>
          </div>
          <div class="noun-hunter-strip">
            ${entries.map((entry) => `
              <button class="noun-hunter-word" type="button" data-index="${entry.index}" aria-pressed="false">
                <span>${escapeHTML(entry.word)}</span>
                <small>${escapeHTML(entry.type)}</small>
              </button>
            `).join('')}
          </div>
        </section>

        <div class="noun-hunter-controls">
          <div class="noun-hunter-feedback" id="noun-hunter-feedback" aria-live="polite">
            ${feedbackFor({ found: 0, wrong: 0, total: totalNouns, score: 0 })}
          </div>
          <button class="noun-hunter-check" id="noun-hunter-check" type="button" disabled>Prüfen</button>
        </div>
      </div>
    `;

    const countEl = container.querySelector('#noun-hunter-count');
    const progressEl = container.querySelector('.noun-hunter-progress span');
    const feedbackEl = container.querySelector('#noun-hunter-feedback');
    const checkButton = container.querySelector('#noun-hunter-check');
    const wordButtons = [...container.querySelectorAll('.noun-hunter-word')];

    const updateState = () => {
      const summary = summarizeSelection(entries, selectedIndices);
      countEl.textContent = `${summary.found}/${summary.total}`;
      progressEl.style.setProperty('transform', `scaleX(${summary.found / summary.total})`);
      feedbackEl.textContent = feedbackFor(summary);
      checkButton.disabled = selectedIndices.size === 0;

      wordButtons.forEach((button) => {
        const index = Number(button.dataset.index);
        const selected = selectedIndices.has(index);
        button.classList.toggle('is-selected', selected);
        button.setAttribute('aria-pressed', String(selected));
      });
    };

    const revealResults = (summary) => {
      checked = true;
      wordButtons.forEach((button) => {
        const index = Number(button.dataset.index);
        const entry = entries.find((candidate) => candidate.index === index);
        const selected = selectedIndices.has(index);

        button.disabled = true;
        button.classList.toggle('is-correct', entry.isNoun && selected);
        button.classList.toggle('is-missed', entry.isNoun && !selected);
        button.classList.toggle('is-wrong', !entry.isNoun && selected);
      });

      feedbackEl.textContent = feedbackFor(summary, true);
      checkButton.disabled = true;
      checkButton.textContent = summary.score >= 80 ? 'Sauber' : 'Gesehen';
    };

    wordButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (checked) {
          return;
        }

        const index = Number(button.dataset.index);
        if (selectedIndices.has(index)) {
          selectedIndices.delete(index);
        } else {
          selectedIndices.add(index);
        }
        updateState();
      }, { signal });
    });

    checkButton.addEventListener('click', () => {
      if (checked || disposed) {
        return;
      }

      const summary = summarizeSelection(entries, selectedIndices);
      revealResults(summary);

      completionTimeoutId = window.setTimeout(() => {
        if (disposed) {
          return;
        }
        onComplete({
          correct: summary.score >= 80,
          partial: summary.score >= 50,
          score: summary.score,
          details: {
            found: summary.found,
            missed: summary.missed,
            wrongPicks: summary.wrong,
            totalNouns: summary.total,
            topic: task.topic
          }
        });
      }, RESULT_DELAY_MS);
    }, { signal });

    updateState();

    return () => {
      disposed = true;
      window.clearTimeout(completionTimeoutId);
      listeners.abort();
    };
  }
};
