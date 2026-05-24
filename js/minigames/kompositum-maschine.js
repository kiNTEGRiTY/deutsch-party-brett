import { SoundManager } from '../ui/sound-manager.js?v=game-feel-8';
import { COMPOUND_CONTENT } from '../learning/languages/de/content-zusammengesetzt.js';

const MEANING_BANK = {
  Hundehaus: {
    correct: 'Ein kleines Haus fuer einen Hund.',
    decoys: ['Ein Hund, der ein Haus traegt.', 'Ein Haus voller Knochenmusik.']
  },
  Apfelbaum: {
    correct: 'Ein Baum, an dem Aepfel wachsen.',
    decoys: ['Ein Apfel aus Holz.', 'Ein Baum fuer Saftmaschinen.']
  },
  Schneemann: {
    correct: 'Eine Figur aus Schnee.',
    decoys: ['Ein Mann, der nur im Sommer friert.', 'Eine Schneekanone auf Beinen.']
  },
  Haustuer: {
    correct: 'Die Tuer an einem Haus.',
    decoys: ['Eine Tuer fuer Haustiere.', 'Eine Tuer, die bellen kann.']
  },
  Bilderbuch: {
    correct: 'Ein Buch mit vielen Bildern.',
    decoys: ['Ein Buch fuer Kameras.', 'Ein Bild, das lesen kann.']
  },
  Wasserflasche: {
    correct: 'Eine Flasche fuer Wasser.',
    decoys: ['Wasser in Form einer Flasche.', 'Eine Flasche, die schwimmen lernt.']
  },
  Kindergarten: {
    correct: 'Ein Ort, an dem Kinder betreut werden.',
    decoys: ['Ein Garten nur fuer Schulkinder.', 'Ein Beet mit Spielzeug.']
  },
  Sonnenblume: {
    correct: 'Eine Blume, die wie eine Sonne aussieht.',
    decoys: ['Ein Licht fuer Blumen.', 'Eine Blume aus Sonnenstrahlen.']
  },
  Schuhkarton: {
    correct: 'Eine Kiste fuer Schuhe.',
    decoys: ['Ein Karton, der Schuhe malt.', 'Ein Schuh aus Pappe.']
  },
  Taschenlampe: {
    correct: 'Eine tragbare Lampe fuer die Hand.',
    decoys: ['Eine Tasche, die leuchtet.', 'Eine Lampe fuer Schultaschen.']
  }
};

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function pickRounds() {
  return shuffle(COMPOUND_CONTENT).slice(0, 3).map((item) => {
    const resultWord = item.result || `${item.part1}${item.part2}`;
    const meanings = MEANING_BANK[resultWord];
    return {
      ...item,
      resultWord,
      meanings
    };
  });
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

    function finishGame() {
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
      const options = shuffle([round.meanings.correct, ...round.meanings.decoys]);
      container.querySelector('#kompositum-stage').innerHTML = `
        <div class="kompositum-preview-card success">
          <span>Gebautes Wort</span>
          <strong>${round.resultWord}</strong>
        </div>
        <div class="showcase-round-card">
          <p class="showcase-prompt">Was bedeutet dieses Kompositum am besten?</p>
        </div>
        <div class="showcase-score-grid">
          ${options.map((option) => `
            <button class="showcase-score-button tone-mid kompositum-meaning" data-answer="${option}" type="button">
              <strong>${option}</strong>
            </button>
          `).join('')}
        </div>
      `;

      container.querySelectorAll('.kompositum-meaning').forEach((button) => {
        button.addEventListener('click', () => {
          if (button.dataset.answer === round.meanings.correct) {
            score += 1;
            SoundManager.play('success');
            button.classList.add('is-correct');
          } else {
            SoundManager.play('error');
            button.classList.add('is-wrong');
          }

          setTimeout(() => {
            roundIndex += 1;
            renderRound();
          }, 900);
        });
      });
    }

    function attachTileDrag(tile, slotNodes) {
      let drag = null;

      const onMove = (event) => {
        if (!drag || drag.pointerId !== event.pointerId) {
          return;
        }
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        tile.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 14}deg)`;
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
        tile.releasePointerCapture?.(event.pointerId);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);

        if (slot) {
          const slotIndex = Number(slot.dataset.slot);
          selectedParts[slotIndex] = tile.dataset.part;
          slot.innerHTML = `<strong>${tile.dataset.part}</strong>`;
          tile.classList.add('is-locked');
          tile.style.visibility = 'hidden';
          SoundManager.play('pop');
        } else {
          tile.style.transform = 'translate(0, 0)';
        }

        drag = null;

        if (selectedParts[0] && selectedParts[1]) {
          container.querySelector('#kompositum-check').disabled = false;
        }
      };

      tile.addEventListener('pointerdown', (event) => {
        if (tile.classList.contains('is-locked')) {
          return;
        }

        drag = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY
        };
        tile.classList.add('is-dragging');
        tile.setPointerCapture?.(event.pointerId);
        SoundManager.play('whoosh');
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      });
    }

    function renderRound() {
      if (roundIndex >= rounds.length) {
        finishGame();
        return;
      }

      selectedParts = [null, null];
      const round = rounds[roundIndex];
      const partOptions = shuffle([round.part1, round.part2, round.decoy1 || round.decoy2 || 'Mond']);

      container.innerHTML = `
        <div class="kompositum-shell">
          <div class="kompositum-header">
            <div>
              <div class="premium-kicker">Production Ready</div>
              <h3 class="glow-title showcase-title">Kompositum-Maschine</h3>
              <p class="showcase-secondary">Runde ${roundIndex + 1} / ${rounds.length}</p>
            </div>
            <div class="showcase-status-pill">Score ${score}</div>
          </div>

          <div id="kompositum-stage">
            <div class="showcase-round-card">
              <p class="showcase-prompt">Zieh zwei Wortbausteine in die Maschine und baue ein sinnvolles Kompositum.</p>
              <p class="showcase-secondary">Erst bauen, dann die Bedeutung sauber erklaeren.</p>
            </div>

            <div class="kompositum-slots">
              <div class="kompositum-slot" data-slot="0"><span>Teil 1</span></div>
              <div class="kompositum-slot" data-slot="1"><span>Teil 2</span></div>
            </div>

            <div class="kompositum-tile-row">
              ${partOptions.map((part) => `
                <button class="kompositum-tile" data-part="${part}" type="button">${part}</button>
              `).join('')}
            </div>

            <div class="showcase-controls">
              <button class="btn btn-secondary" id="kompositum-reset" type="button">Neu bauen</button>
              <button class="btn btn-primary" id="kompositum-check" type="button" disabled>Maschine pruefen</button>
            </div>
          </div>
        </div>
      `;

      const slotNodes = Array.from(container.querySelectorAll('.kompositum-slot'));
      container.querySelectorAll('.kompositum-tile').forEach((tile) => {
        attachTileDrag(tile, slotNodes);
      });

      container.querySelector('#kompositum-reset').addEventListener('click', renderRound);

      container.querySelector('#kompositum-check').addEventListener('click', () => {
        const assembled = `${selectedParts[0] || ''}${selectedParts[1] || ''}`;
        const preview = document.createElement('div');
        preview.className = `kompositum-preview-card ${assembled === round.resultWord ? 'success' : 'fail'}`;
        preview.innerHTML = `<span>Maschine</span><strong>${assembled}</strong>`;
        container.querySelector('#kompositum-stage').prepend(preview);

        if (assembled === round.resultWord) {
          score += 1;
          SoundManager.play('success');
          setTimeout(() => renderMeaningStep(round), 650);
          return;
        }

        SoundManager.play('error');
        setTimeout(renderRound, 900);
      });
    }

    renderRound();
  }
};
