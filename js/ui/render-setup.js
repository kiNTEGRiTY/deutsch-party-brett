import { getTopicsForLevel } from '../learning/topic-registry.js';
import { AXIS_META } from '../learning/difficulty.js';
import { CHARACTERS, renderCharacterAvatar } from './characters.js';

const MAX_PLAYERS = 4;

const CLASS_LEVELS = [
  { id: 'vorschule', label: 'Vorschule', short: 'V', detail: 'Buchstaben, Laute, erste Woerter' },
  { id: 'klasse1', label: 'Klasse 1', short: '1', detail: 'Grundlagen und kurze Aufgaben' },
  { id: 'klasse2', label: 'Klasse 2', short: '2', detail: 'Ausgewogene Standardpartie' },
  { id: 'klasse3', label: 'Klasse 3', short: '3', detail: 'Mehr Satzarbeit und Tempo' },
  { id: 'klasse4', label: 'Klasse 4', short: '4', detail: 'Komplexer, schneller, freier' },
  { id: 'frei', label: 'Frei', short: '*', detail: 'Eigene Mischung der Themen' }
];

const STEP_META = [
  { label: 'Gruppe', title: 'Wer spielt mit?', kicker: 'Figuren und Namen' },
  { label: 'Stufe', title: 'Welche Klasse passt?', kicker: 'Lernniveau' },
  { label: 'Themen', title: 'Welche Inhalte kommen aufs Brett?', kicker: 'Deutsch-Fokus' },
  { label: 'Feinheit', title: 'Wie hart soll die Runde sein?', kicker: 'Spielhaerte' },
  { label: 'Startklar', title: 'Partie pruefen', kicker: 'Zusammenfassung' }
];

export class SetupRenderer {
  constructor(containerEl, settings, onComplete) {
    this.container = containerEl;
    this.settings = settings;
    this.onComplete = onComplete;
    this.currentStep = 0;
    this.activePlayerIndex = 0;
    this.players = [
      { name: 'Spieler 1', colorIndex: 0 },
      { name: 'Spieler 2', colorIndex: 1 }
    ];
  }

  render() {
    const step = STEP_META[this.currentStep];
    const validation = this._getValidationMessage();

    this.container.innerHTML = `
      <div class="setup-shell animate-screen">
        <header class="setup-header">
          <button class="setup-home" id="setup-home" type="button">Start</button>
          <nav class="setup-stepper" aria-label="Setup Schritte">
            ${STEP_META.map((item, index) => `
              <button class="setup-step ${index === this.currentStep ? 'is-active' : ''} ${index < this.currentStep ? 'is-done' : ''}" data-step="${index}" type="button" ${index > this.currentStep ? 'disabled' : ''}>
                <span>${index + 1}</span>
                <strong>${item.label}</strong>
              </button>
            `).join('')}
          </nav>
        </header>

        <main class="setup-main">
          <section class="setup-decision" aria-labelledby="setup-step-title">
            <p class="setup-kicker">${step.kicker}</p>
            <h2 id="setup-step-title">${step.title}</h2>
            <p class="setup-copy">${this._getStepCopy()}</p>
            <div id="setup-step-panel" class="setup-step-panel"></div>
          </section>

          <aside class="setup-live" aria-label="Partie">
            <div class="setup-live-head">
              <span>Partie</span>
              <strong>${this.players.length} Spieler</strong>
            </div>
            <div class="setup-party">
              ${this.players.map((player, index) => `
                <button class="setup-party-token ${index === this.activePlayerIndex ? 'is-active' : ''}" data-party-player="${index}" type="button">
                  ${renderCharacterAvatar(player.colorIndex, 46)}
                  <span>${this._playerName(player, index)}</span>
                </button>
              `).join('')}
            </div>
            <dl class="setup-recap">
              <div><dt>Stufe</dt><dd>${this._levelLabel()}</dd></div>
              <div><dt>Themen</dt><dd>${this.settings.activeTopics.length}</dd></div>
              <div><dt>Haerte</dt><dd>${this._difficultyLabel()}</dd></div>
            </dl>
          </aside>
        </main>

        <footer class="setup-footer">
          <div class="setup-validation ${validation ? 'is-visible' : ''}">${validation || 'Bereit'}</div>
          <div class="setup-footer-actions">
            <button id="setup-back" class="setup-button setup-button--ghost" type="button" ${this.currentStep === 0 ? 'disabled' : ''}>Zurueck</button>
            <button id="setup-next" class="setup-button setup-button--primary" type="button" ${validation ? 'disabled' : ''}>
              ${this.currentStep === STEP_META.length - 1 ? 'Spiel starten' : 'Weiter'}
            </button>
          </div>
        </footer>
      </div>
    `;

    this._renderStep(document.getElementById('setup-step-panel'));
    this._bindShell();
  }

  _bindShell() {
    document.getElementById('setup-home')?.addEventListener('click', () => {
      window.app?.screenManager?.show('start');
    });

    document.querySelectorAll('.setup-step').forEach((button) => {
      button.addEventListener('click', () => {
        const target = Number(button.dataset.step);
        if (Number.isFinite(target) && target <= this.currentStep) {
          this.currentStep = target;
          this.render();
        }
      });
    });

    document.querySelectorAll('[data-party-player]').forEach((button) => {
      button.addEventListener('click', () => {
        this.activePlayerIndex = Number(button.dataset.partyPlayer);
        this.render();
      });
    });

    document.getElementById('setup-back')?.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep -= 1;
        this.render();
      }
    });

    document.getElementById('setup-next')?.addEventListener('click', () => {
      if (this._getValidationMessage()) return;
      if (this.currentStep < STEP_META.length - 1) {
        this.currentStep += 1;
        this.render();
        return;
      }
      this.onComplete(this.players.map((player, index) => ({
        name: this._playerName(player, index),
        colorIndex: player.colorIndex
      })), this.settings);
    });
  }

  _renderStep(el) {
    if (this.currentStep === 0) this._renderPlayers(el);
    if (this.currentStep === 1) this._renderLevels(el);
    if (this.currentStep === 2) this._renderTopics(el);
    if (this.currentStep === 3) this._renderDifficulty(el);
    if (this.currentStep === 4) this._renderSummary(el);
  }

  _renderPlayers(el) {
    el.innerHTML = `
      <div class="setup-players-layout">
        <div class="setup-player-list">
          ${this.players.map((player, index) => `
            <article class="setup-player-row ${index === this.activePlayerIndex ? 'is-active' : ''}" data-player-row="${index}">
              <button class="setup-player-avatar" data-select-player="${index}" type="button" aria-label="Spieler ${index + 1} bearbeiten">${renderCharacterAvatar(player.colorIndex, 64)}</button>
              <label>
                <span>Spieler ${index + 1}</span>
                <input class="setup-input player-name-input" data-player="${index}" value="${this._escape(player.name)}" maxlength="18">
              </label>
              <button class="setup-remove-player" data-remove-player="${index}" type="button" ${this.players.length <= 2 ? 'disabled' : ''}>-</button>
            </article>
          `).join('')}
          <button class="setup-add-player" id="add-player" type="button" ${this.players.length >= MAX_PLAYERS ? 'disabled' : ''}>Spieler hinzufuegen</button>
        </div>

        <div class="setup-character-bank">
          ${CHARACTERS.map((character, index) => {
            const selectedBy = this.players.findIndex((player) => player.colorIndex === index);
            return `
              <button class="setup-character ${selectedBy >= 0 ? 'is-selected' : ''} ${selectedBy === this.activePlayerIndex ? 'is-active' : ''}" data-character="${index}" type="button">
                ${renderCharacterAvatar(index, 58)}
                <span>${character.name_de}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    el.querySelectorAll('[data-player-row], [data-select-player]').forEach((target) => {
      target.addEventListener('click', () => {
        const index = Number(target.dataset.playerRow ?? target.dataset.selectPlayer);
        if (Number.isFinite(index)) {
          this.activePlayerIndex = index;
          this.render();
        }
      });
    });

    el.querySelectorAll('.player-name-input').forEach((input) => {
      input.addEventListener('click', (event) => event.stopPropagation());
      input.addEventListener('input', () => {
        const index = Number(input.dataset.player);
        this.players[index].name = input.value;
      });
    });

    el.querySelectorAll('[data-remove-player]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const index = Number(button.dataset.removePlayer);
        if (this.players.length > 2) {
          this.players.splice(index, 1);
          this.activePlayerIndex = Math.max(0, Math.min(this.activePlayerIndex, this.players.length - 1));
          this.render();
        }
      });
    });

    el.querySelector('#add-player')?.addEventListener('click', () => {
      if (this.players.length >= MAX_PLAYERS) return;
      const nextColor = CHARACTERS.findIndex((_, index) => !this.players.some((player) => player.colorIndex === index));
      this.players.push({
        name: `Spieler ${this.players.length + 1}`,
        colorIndex: nextColor >= 0 ? nextColor : this.players.length
      });
      this.activePlayerIndex = this.players.length - 1;
      this.render();
    });

    el.querySelectorAll('[data-character]').forEach((button) => {
      button.addEventListener('click', () => {
        const colorIndex = Number(button.dataset.character);
        const activePlayer = this.players[this.activePlayerIndex];
        const previousColor = activePlayer.colorIndex;
        const selectedBy = this.players.findIndex((player) => player.colorIndex === colorIndex);
        if (selectedBy >= 0 && selectedBy !== this.activePlayerIndex) {
          this.players[selectedBy].colorIndex = previousColor;
        }
        activePlayer.colorIndex = colorIndex;
        this.render();
      });
    });
  }

  _renderLevels(el) {
    el.innerHTML = `
      <div class="setup-level-grid">
        ${CLASS_LEVELS.map((level) => `
          <button class="setup-choice ${this.settings.classLevel === level.id ? 'is-selected' : ''}" data-level="${level.id}" type="button">
            <span class="setup-choice-mark">${level.short}</span>
            <strong>${level.label}</strong>
            <small>${level.detail}</small>
          </button>
        `).join('')}
      </div>
    `;

    el.querySelectorAll('[data-level]').forEach((button) => {
      button.addEventListener('click', () => {
        this.settings.setClassLevel(button.dataset.level);
        this.render();
      });
    });
  }

  _renderTopics(el) {
    const topics = getTopicsForLevel(this.settings.classLevel);
    el.innerHTML = `
      <div class="setup-topic-toolbar">
        <strong>${this.settings.activeTopics.length} aktiv</strong>
        <span>${topics.length} verfuegbar</span>
      </div>
      <div class="setup-topic-grid">
        ${topics.map((topic) => `
          <button class="setup-topic ${this.settings.isTopicActive(topic.id) ? 'is-selected' : ''}" data-topic="${topic.id}" type="button">
            <strong>${topic.name || topic.label || topic.id}</strong>
            <span>${topic.description || 'Deutsch-Aufgabe'}</span>
          </button>
        `).join('')}
      </div>
    `;

    el.querySelectorAll('[data-topic]').forEach((button) => {
      button.addEventListener('click', () => {
        this.settings.toggleTopic(button.dataset.topic);
        this.render();
      });
    });
  }

  _renderDifficulty(el) {
    const axes = Object.entries(AXIS_META).filter(([axis]) => axis in this.settings.difficulty);
    el.innerHTML = `
      <div class="setup-difficulty-list">
        ${axes.map(([axis, meta]) => `
          <label class="setup-slider-row">
            <span>
              <strong>${meta.label}</strong>
              <small>${meta.description || ''}</small>
            </span>
            <input type="range" min="${meta.min ?? 0}" max="${meta.max ?? 5}" value="${this.settings.difficulty[axis]}" data-axis="${axis}">
            <b>${this.settings.difficulty[axis]}</b>
          </label>
        `).join('')}
      </div>
    `;

    el.querySelectorAll('[data-axis]').forEach((input) => {
      input.addEventListener('input', () => {
        this.settings.setDifficultyAxis(input.dataset.axis, input.value);
        input.closest('.setup-slider-row')?.querySelector('b')?.replaceChildren(document.createTextNode(input.value));
      });
    });
  }

  _renderSummary(el) {
    const topics = getTopicsForLevel(this.settings.classLevel)
      .filter((topic) => this.settings.activeTopics.includes(topic.id))
      .map((topic) => topic.name || topic.label || topic.id);

    el.innerHTML = `
      <div class="setup-summary">
        <section class="setup-ready-panel">
          <span>Start</span>
          <strong>${this.players.length} Figuren stehen bereit</strong>
          <p>${this.players.map((player, index) => this._playerName(player, index)).join(', ')}</p>
        </section>
        <div class="setup-ready-list">
          <article><small>Klasse</small><strong>${this._levelLabel()}</strong></article>
          <article><small>Themen</small><strong>${topics.length}</strong><p>${topics.join(', ')}</p></article>
          <article><small>Brett</small><strong>36 Felder</strong><p>Start, Lernfelder, Aktionen und Ziel.</p></article>
          <article><small>Haerte</small><strong>${this._difficultyLabel()}</strong><p>Aus den aktuellen Reglern.</p></article>
        </div>
      </div>
    `;
  }

  _getStepCopy() {
    return [
      'Namen kurz halten, Figur anklicken, Farbe wechseln. Zwei Spieler sind Pflicht.',
      'Die Stufe setzt die Vorauswahl fuer Themen und Schwierigkeit.',
      'Wenige aktive Themen machen die Runde klarer. Mindestens eines bleibt an.',
      'Zeitdruck, Hinweise und Aufgabenlaenge werden hier fein eingestellt.',
      'Diese Werte werden fuer die neue Partie uebernommen.'
    ][this.currentStep];
  }

  _getValidationMessage() {
    if (this.players.length < 2) return 'Mindestens zwei Spieler waehlen.';
    if (this.players.some((player) => !String(player.name || '').trim())) return 'Alle Spieler brauchen einen Namen.';
    if (this.settings.activeTopics.length === 0) return 'Mindestens ein Thema aktivieren.';
    return '';
  }

  _playerName(player, index) {
    return String(player.name || '').trim() || `Spieler ${index + 1}`;
  }

  _levelLabel() {
    return CLASS_LEVELS.find((level) => level.id === this.settings.classLevel)?.label || 'Klasse 2';
  }

  _difficultyLabel() {
    const values = Object.values(this.settings.difficulty).filter((value) => Number.isFinite(Number(value)));
    if (values.length === 0) return 'Normal';
    const average = values.reduce((sum, value) => sum + Number(value), 0) / values.length;
    if (average < 1.6) return 'Sanft';
    if (average < 2.8) return 'Normal';
    if (average < 3.8) return 'Fordernd';
    return 'Hart';
  }

  _escape(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }
}
