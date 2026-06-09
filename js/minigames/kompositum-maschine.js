import { SoundManager } from '../ui/sound-manager.js?v=field-first-board-37';
import { COMPOUND_CONTENT } from '../learning/languages/de/content-zusammengesetzt.js';

const MEANING_BANK = {
  Hundehaus: {
    correct: 'Ein kleines Haus für einen Hund.',
    decoys: ['Ein Hund, der ein Haus trägt.', 'Ein Haus voller Knochenmusik.']
  },
  Apfelbaum: {
    correct: 'Ein Baum, an dem Äpfel wachsen.',
    decoys: ['Ein Apfel aus Holz.', 'Ein Baum für Saftmaschinen.']
  },
  Schneemann: {
    correct: 'Eine Figur aus Schnee.',
    decoys: ['Ein Mann, der nur im Sommer friert.', 'Eine Schneekanone auf Beinen.']
  },
  Haustuer: {
    correct: 'Die Tür an einem Haus.',
    decoys: ['Eine Tür für Haustiere.', 'Eine Tür, die bellen kann.']
  },
  Bilderbuch: {
    correct: 'Ein Buch mit vielen Bildern.',
    decoys: ['Ein Buch für Kameras.', 'Ein Bild, das lesen kann.']
  },
  Wasserflasche: {
    correct: 'Eine Flasche für Wasser.',
    decoys: ['Wasser in Form einer Flasche.', 'Eine Flasche, die schwimmen lernt.']
  },
  Kindergarten: {
    correct: 'Ein Ort, an dem Kinder betreut werden.',
    decoys: ['Ein Garten nur für Schulkinder.', 'Ein Beet mit Spielzeug.']
  },
  Sonnenblume: {
    correct: 'Eine Blume, die wie eine Sonne aussieht.',
    decoys: ['Ein Licht für Blumen.', 'Eine Blume aus Sonnenstrahlen.']
  },
  Schuhkarton: {
    correct: 'Eine Kiste für Schuhe.',
    decoys: ['Ein Karton, der Schuhe malt.', 'Ein Schuh aus Pappe.']
  },
  Taschenlampe: {
    correct: 'Eine tragbare Lampe für die Hand.',
    decoys: ['Eine Tasche, die leuchtet.', 'Eine Lampe für Schultaschen.']
  }
};

const GERMAN_CHARACTERS = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  Ä: 'ae',
  Ö: 'oe',
  Ü: 'ue',
  ß: 'ss'
};

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeMeaningKey(value) {
  return String(value || '')
    .replace(/[äöüÄÖÜß]/g, (character) => GERMAN_CHARACTERS[character] || character)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
}

const NORMALIZED_MEANING_BANK = Object.entries(MEANING_BANK).reduce((lookup, [word, entry]) => {
  lookup.set(normalizeMeaningKey(word), entry);
  return lookup;
}, new Map());

function buildMeaningEntry(item, resultWord) {
  const directEntry = MEANING_BANK[resultWord];
  const normalizedEntry = NORMALIZED_MEANING_BANK.get(normalizeMeaningKey(resultWord));

  return directEntry || normalizedEntry || {
    correct: `Ein zusammengesetztes Nomen aus ${item.part1} und ${item.part2}.`,
    decoys: [
      `Ein einzelnes Wort ohne Verbindung zu ${item.part1}.`,
      `Zwei Wörter, die in dieser Reihenfolge kein neues Nomen bilden.`
    ]
  };
}

function pickRounds() {
  return shuffle(COMPOUND_CONTENT).slice(0, 3).map((item) => {
    const resultWord = item.result || `${item.part1}${item.part2}`;
    return {
      ...item,
      resultWord,
      meanings: buildMeaningEntry(item, resultWord)
    };
  });
}

function safelySetPointerCapture(node, pointerId) {
  try {
    node.setPointerCapture?.(pointerId);
  } catch {
    // Synthetic test events and some interrupted touches do not have an active pointer.
  }
}

function safelyReleasePointerCapture(node, pointerId) {
  try {
    node.releasePointerCapture?.(pointerId);
  } catch {
    // Ignore missing pointer capture; the drag cleanup below still runs.
  }
}

export const KompositumMaschine = {
  id: 'kompositum-maschine',
  name_de: 'Kompositum-Maschine',
  description: 'Wortbausteine ziehen, Komposita bauen und die passende Bedeutung treffen.',
  topics: ['zusammengesetzte_nomen', 'wortbildung', 'wortschatz'],
  supportsDirectPlay: true,

  setup(container, task, onComplete) {
    const rounds = pickRounds();
    let roundIndex = 0;
    let score = 0;
    let selectedParts = [null, null];
    let selectedTile = null;
    let disposed = false;
    let roundCleanups = [];
    const activeTimeouts = new Set();

    function addRoundCleanup(cleanup) {
      roundCleanups.push(cleanup);
    }

    function cleanupRound() {
      activeTimeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      activeTimeouts.clear();
      roundCleanups.forEach((cleanup) => cleanup());
      roundCleanups = [];
      selectedTile = null;
    }

    function addListener(node, type, handler, options) {
      node.addEventListener(type, handler, options);
      addRoundCleanup(() => node.removeEventListener(type, handler, options));
    }

    function schedule(callback, delay) {
      const timeoutId = window.setTimeout(() => {
        activeTimeouts.delete(timeoutId);
        if (!disposed) {
          callback();
        }
      }, delay);
      activeTimeouts.add(timeoutId);
      return timeoutId;
    }

    function getTileByPart(part) {
      return Array.from(container.querySelectorAll('.kompositum-tile'))
        .find((tile) => tile.dataset.part === part);
    }

    function updateCheckButton() {
      const checkButton = container.querySelector('#kompositum-check');
      if (checkButton) {
        checkButton.disabled = !(selectedParts[0] && selectedParts[1]);
      }
    }

    function updateSlotTargets() {
      container.querySelectorAll('.kompositum-slot').forEach((slot) => {
        slot.classList.toggle('is-target', Boolean(selectedTile));
      });
    }

    function clearSelectedTile() {
      if (selectedTile) {
        selectedTile.classList.remove('is-selected');
        selectedTile.setAttribute('aria-pressed', 'false');
        selectedTile = null;
      }
      updateSlotTargets();
    }

    function selectTile(tile) {
      if (tile.classList.contains('is-locked')) {
        return;
      }

      if (selectedTile === tile) {
        clearSelectedTile();
        return;
      }

      clearSelectedTile();
      selectedTile = tile;
      tile.classList.add('is-selected');
      tile.setAttribute('aria-pressed', 'true');
      updateSlotTargets();
      SoundManager.play('pop');
    }

    function renderSlot(slotIndex) {
      const slot = container.querySelector(`.kompositum-slot[data-slot="${slotIndex}"]`);
      if (!slot) {
        return;
      }

      const part = selectedParts[slotIndex];
      slot.classList.toggle('is-filled', Boolean(part));
      slot.innerHTML = part
        ? `<span>Teil ${slotIndex + 1}</span><strong>${escapeHTML(part)}</strong>`
        : `<span>Teil ${slotIndex + 1}</span>`;
    }

    function returnPartToTile(part) {
      const tile = getTileByPart(part);
      if (!tile) {
        return;
      }

      tile.classList.remove('is-locked');
      tile.style.visibility = '';
      tile.style.transform = '';
      tile.setAttribute('aria-pressed', 'false');
    }

    function placeTileInSlot(tile, slotIndex) {
      if (!tile || tile.classList.contains('is-locked')) {
        return;
      }

      if (selectedTile && selectedTile !== tile) {
        clearSelectedTile();
      }

      const part = tile.dataset.part;
      const previousPart = selectedParts[slotIndex];
      if (previousPart && previousPart !== part) {
        returnPartToTile(previousPart);
      }

      const previousSlotIndex = selectedParts.findIndex((selectedPart) => selectedPart === part);
      if (previousSlotIndex !== -1) {
        selectedParts[previousSlotIndex] = null;
        renderSlot(previousSlotIndex);
      }

      selectedParts[slotIndex] = part;
      renderSlot(slotIndex);
      tile.classList.remove('is-selected');
      tile.classList.add('is-locked');
      tile.style.visibility = 'hidden';
      tile.style.transform = '';
      tile.setAttribute('aria-pressed', 'false');
      selectedTile = null;
      updateSlotTargets();
      updateCheckButton();
      SoundManager.play('pop');
    }

    function clearSlot(slotIndex) {
      const part = selectedParts[slotIndex];
      if (!part) {
        return;
      }

      selectedParts[slotIndex] = null;
      returnPartToTile(part);
      renderSlot(slotIndex);
      updateCheckButton();
      SoundManager.play('pop');
    }

    function finishGame() {
      cleanupRound();
      const percentage = Math.round((score / (rounds.length * 2)) * 100);
      onComplete({
        correct: percentage >= 75,
        partial: percentage >= 45 && percentage < 75,
        score: percentage,
        details: {
          rounds: rounds.length,
          score
        }
      });
    }

    function renderMeaningStep(round) {
      cleanupRound();
      const options = shuffle([round.meanings.correct, ...round.meanings.decoys]);
      container.querySelector('#kompositum-stage').innerHTML = `
        <div class="kompositum-preview-card success">
          <span>Gebautes Wort</span>
          <strong>${escapeHTML(round.resultWord)}</strong>
          <p>${escapeHTML(round.part1)} + ${escapeHTML(round.part2)} wird zu ${escapeHTML(round.resultWord)}.</p>
        </div>
        <div class="showcase-round-card">
          <p class="showcase-prompt">Was bedeutet dieses Kompositum am besten?</p>
        </div>
        <div class="showcase-score-grid">
          ${options.map((option, optionIndex) => `
            <button class="showcase-score-button tone-mid kompositum-meaning" data-answer-index="${optionIndex}" type="button">
              <strong>${escapeHTML(option)}</strong>
            </button>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.kompositum-meaning').forEach((button) => {
        addListener(button, 'click', () => {
          const answer = options[Number(button.dataset.answerIndex)];
          const isCorrect = answer === round.meanings.correct;

          container.querySelectorAll('.kompositum-meaning').forEach((optionButton) => {
            optionButton.disabled = true;
            const optionAnswer = options[Number(optionButton.dataset.answerIndex)];
            optionButton.classList.toggle('is-correct', optionAnswer === round.meanings.correct);
          });

          if (isCorrect) {
            score += 1;
            SoundManager.play('success');
          } else {
            SoundManager.play('error');
            button.classList.add('is-wrong');
          }

          schedule(() => {
            roundIndex += 1;
            renderRound();
          }, 1100);
        });
      });
    }

    function attachTileDrag(tile, slotNodes) {
      let drag = null;
      let removeDragListeners = null;

      const onMove = (event) => {
        if (!drag || drag.pointerId !== event.pointerId) {
          return;
        }
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        tile.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 14}deg)`;
      };

      const stopDragListeners = () => {
        if (!removeDragListeners) {
          return;
        }
        removeDragListeners();
        removeDragListeners = null;
      };

      const onUp = (event) => {
        if (!drag || drag.pointerId !== event.pointerId) {
          return;
        }

        const slot = slotNodes.find((node) => {
          const rect = node.getBoundingClientRect();
          return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        });

        tile.classList.remove('is-dragging');
        safelyReleasePointerCapture(tile, event.pointerId);
        stopDragListeners();

        if (slot) {
          const slotIndex = Number(slot.dataset.slot);
          placeTileInSlot(tile, slotIndex);
        } else {
          tile.style.transform = 'translate(0, 0)';
        }

        drag = null;
      };

      addRoundCleanup(stopDragListeners);

      addListener(tile, 'pointerdown', (event) => {
        if (tile.classList.contains('is-locked')) {
          return;
        }

        drag = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY
        };
        tile.classList.add('is-dragging');
        safelySetPointerCapture(tile, event.pointerId);
        SoundManager.play('whoosh');
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        removeDragListeners = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };
      });
    }

    function renderRound() {
      cleanupRound();

      if (roundIndex >= rounds.length) {
        finishGame();
        return;
      }

      selectedParts = [null, null];
      const round = rounds[roundIndex];
      const decoys = [round.decoy1, round.decoy2].filter(Boolean);
      const partOptions = shuffle([round.part1, round.part2, ...decoys]).slice(0, 4);

      container.innerHTML = `
        <div class="kompositum-shell">
          <div class="kompositum-header">
            <div>
              <div class="premium-kicker">Wortwerkstatt</div>
              <h3 class="glow-title showcase-title">Kompositum-Maschine</h3>
              <p class="showcase-secondary">Runde ${roundIndex + 1} / ${rounds.length}</p>
            </div>
            <div class="showcase-status-pill">Punkte ${score}</div>
          </div>

          <div id="kompositum-stage">
            <div class="showcase-round-card">
              <p class="showcase-prompt">Baue ein sinnvolles Kompositum aus zwei Wortbausteinen.</p>
              <p class="showcase-secondary">Erst entsteht das neue Nomen, dann zählt die passende Bedeutung.</p>
            </div>

            <div class="kompositum-slots">
              <button class="kompositum-slot" data-slot="0" type="button" aria-label="Erster Wortbaustein"><span>Teil 1</span></button>
              <button class="kompositum-slot" data-slot="1" type="button" aria-label="Zweiter Wortbaustein"><span>Teil 2</span></button>
            </div>

            <div class="kompositum-tile-row">
              ${partOptions.map((part) => `
                <button class="kompositum-tile" data-part="${escapeHTML(part)}" type="button" aria-pressed="false">${escapeHTML(part)}</button>
              `).join('')}
            </div>

            <div class="kompositum-feedback" id="kompositum-feedback" aria-live="polite"></div>

            <div class="showcase-controls">
              <button class="btn btn-secondary" id="kompositum-reset" type="button">Neu bauen</button>
              <button class="btn btn-primary" id="kompositum-check" type="button" disabled>Maschine prüfen</button>
            </div>
          </div>
        </div>
      `;

      const slotNodes = Array.from(container.querySelectorAll('.kompositum-slot'));
      container.querySelectorAll('.kompositum-tile').forEach((tile) => {
        attachTileDrag(tile, slotNodes);
        addListener(tile, 'click', () => selectTile(tile));
      });

      slotNodes.forEach((slot) => {
        addListener(slot, 'click', () => {
          const slotIndex = Number(slot.dataset.slot);
          if (selectedTile) {
            placeTileInSlot(selectedTile, slotIndex);
            return;
          }
          clearSlot(slotIndex);
        });
      });

      addListener(container.querySelector('#kompositum-reset'), 'click', renderRound);

      addListener(container.querySelector('#kompositum-check'), 'click', () => {
        const isCorrectBuild = selectedParts[0] === round.part1 && selectedParts[1] === round.part2;
        const checkButton = container.querySelector('#kompositum-check');
        const feedback = container.querySelector('#kompositum-feedback');
        checkButton.disabled = true;

        feedback.className = `kompositum-feedback ${isCorrectBuild ? 'is-success' : 'is-fail'}`;
        feedback.innerHTML = isCorrectBuild
          ? `
            <span>Maschine</span>
            <strong>${escapeHTML(round.resultWord)}</strong>
            <p>${escapeHTML(round.part1)} + ${escapeHTML(round.part2)} wird als Kompositum zu ${escapeHTML(round.resultWord)}.</p>
          `
          : `
            <span>Noch nicht rund</span>
            <strong>${escapeHTML(selectedParts[0])} + ${escapeHTML(selectedParts[1])}</strong>
            <p>Richtig ist ${escapeHTML(round.part1)} + ${escapeHTML(round.part2)} -> ${escapeHTML(round.resultWord)}.</p>
          `;

        if (isCorrectBuild) {
          score += 1;
          SoundManager.play('success');
          schedule(() => renderMeaningStep(round), 850);
          return;
        }

        SoundManager.play('error');
        schedule(renderRound, 1400);
      });
    }

    renderRound();
    return () => {
      disposed = true;
      cleanupRound();
    };
  }
};
