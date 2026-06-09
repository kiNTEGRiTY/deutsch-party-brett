import { getTopicsForLevel } from '../learning/topic-registry.js';
import { AXIS_META } from '../learning/difficulty.js';
import { CHARACTERS, renderCharacterAvatar } from './characters.js?v=field-route-fullscreen-31';

const MAX_PLAYERS = 4;

const CLASS_LEVELS = [
  { id: 'vorschule', label: 'Vorschule', short: 'V', detail: 'Laute, Reime, erste Wörter' },
  { id: 'klasse1', label: 'Klasse 1', short: '1', detail: 'Kurze Muster und schnelle Erfolge' },
  { id: 'klasse2', label: 'Klasse 2', short: '2', detail: 'Ausgewogene Party-Runde' },
  { id: 'klasse3', label: 'Klasse 3', short: '3', detail: 'Mehr Satzarbeit und Tempo' },
  { id: 'klasse4', label: 'Klasse 4', short: '4', detail: 'Längere Texte und Regeln' },
  { id: 'frei', label: 'Frei', short: '*', detail: 'Eigene Mischung ohne Klassenlogik' }
];

const STEP_META = [
  { label: 'Art', title: 'Welche Runde entsteht?', kicker: 'Spielmodus' },
  { label: 'Figuren', title: 'Wer steht am Start?', kicker: 'Spieler' },
  { label: 'Stufe', title: 'Wie schwer wird der Pfad?', kicker: 'Niveau' },
  { label: 'Themen', title: 'Welche Aufgabenfarben kommen rein?', kicker: 'Inhalt' },
  { label: 'Tempo', title: 'Wie lebendig darf es werden?', kicker: 'Dynamik' },
  { label: 'Start', title: 'Der Spieltisch ist gedeckt.', kicker: 'Kontrolle' }
];

const GAME_MODES = [
  { id: 'partyreise', title: 'Partyreise', detail: 'Ausgewogen: Solo-Aufgaben, Duelle, Joker und kurze Teamrufe.', tone: 'Sage' },
  { id: 'teamruf', title: 'Teamruf', detail: 'Mehr gemeinsame Momente und schnelle Zurufe am Tisch.', tone: 'Blau' },
  { id: 'risikopfad', title: 'Risikopfad', detail: 'Mehr Bonus, Falle, Portal und knappe Entscheidungen.', tone: 'Terracotta' }
];

const DURATION_OPTIONS = [
  { id: 'kurz', title: 'Kurz', detail: '15 Minuten', fields: 24 },
  { id: 'standard', title: 'Standard', detail: '25 Minuten', fields: 36 },
  { id: 'abend', title: 'Lang', detail: '40 Minuten', fields: 48 }
];

const MOMENT_OPTIONS = [
  { id: 'duell', label: 'Duellfelder', detail: 'Zwei Figuren lösen gleichzeitig.' },
  { id: 'joker', label: 'Jokerkarten', detail: 'Einmal retten, tauschen oder verdoppeln.' },
  { id: 'team', label: 'Teamruf', detail: 'Alle dürfen einen Hinweis geben.' },
  { id: 'risiko', label: 'Risiko', detail: 'Mehr Punkte oder Rückzug.' }
];

const TOPIC_ACCENTS = ['#b95b42', '#6e825d', '#31546a', '#d29b36', '#82516c', '#4f7c78'];

export class SetupRenderer {
  constructor(containerEl, settings, onComplete) {
    this.container = containerEl;
    this.settings = settings;
    this.onComplete = onComplete;
    this.currentStep = 0;
    this.activePlayerIndex = 0;
    this.selectedMode = 'partyreise';
    this.duration = 'standard';
    this.activeMoments = new Set(['duell', 'joker', 'team']);
    this.players = [
      { name: 'Spieler 1', colorIndex: 0 },
      { name: 'Spieler 2', colorIndex: 1 }
    ];
  }

  render() {
    const step = STEP_META[this.currentStep];
    const validation = this._getValidationMessage();
    const validationText = validation || '<span class="setup-validation-full">Bereit für den nächsten Schritt</span><span class="setup-validation-short">Bereit</span>';

    this.container.innerHTML = `
      <div class="setup-shell animate-screen">
        <div class="setup-art" aria-hidden="true"></div>
        <header class="setup-topbar">
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

        <main class="setup-stage">
          <section class="setup-panel" aria-labelledby="setup-step-title">
            <p class="setup-kicker">${step.kicker}</p>
            <h2 id="setup-step-title">${step.title}</h2>
            <p class="setup-copy">${this._getStepCopy()}</p>
            <div id="setup-step-panel" class="setup-step-panel"></div>
          </section>

          <aside class="setup-brief" aria-label="Partie">
            <div class="setup-brief-card setup-brief-card--party">
              <span>Partie</span>
              <strong>${this._modeTitle()} · ${this._durationTitle()}</strong>
              <p>${this._modeDetail()}</p>
            </div>
            <div class="setup-party-strip">
              ${this.players.map((player, index) => `
                <button class="setup-party-token ${index === this.activePlayerIndex ? 'is-active' : ''}" data-party-player="${index}" type="button">
                  ${renderCharacterAvatar(player.colorIndex, 48)}
                  <span>${this._playerName(player, index)}</span>
                </button>
              `).join('')}
            </div>
            <div class="setup-brief-grid">
              <div><span>Stufe</span><strong>${this._levelLabel()}</strong></div>
              <div><span>Themen</span><strong>${this._activeTopicCount()}</strong></div>
              <div><span>Momente</span><strong>${this.activeMoments.size}</strong></div>
              <div><span>Tempo</span><strong>${this._difficultyLabel()}</strong></div>
            </div>
          </aside>
        </main>

        <footer class="setup-footer">
          <div class="setup-validation ${validation ? 'is-visible' : ''}">${validationText}</div>
          <div class="setup-footer-actions">
            <button id="setup-back" class="setup-button setup-button--ghost" type="button" ${this.currentStep === 0 ? 'disabled' : ''}>Zurück</button>
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
      if (window.app?._showStart) {
        window.app._showStart();
        return;
      }
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
        this.currentStep = 1;
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
    if (this.currentStep === 0) this._renderMode(el);
    if (this.currentStep === 1) this._renderPlayers(el);
    if (this.currentStep === 2) this._renderLevels(el);
    if (this.currentStep === 3) this._renderTopics(el);
    if (this.currentStep === 4) this._renderDynamics(el);
    if (this.currentStep === 5) this._renderSummary(el);
  }

  _renderMode(el) {
    el.innerHTML = `
      <div class="setup-mode-grid">
        ${GAME_MODES.map((mode) => `
          <button class="setup-mode ${this.selectedMode === mode.id ? 'is-selected' : ''}" data-mode="${mode.id}" type="button">
            <span>${mode.tone}</span>
            <strong>${mode.title}</strong>
            <small>${mode.detail}</small>
          </button>
        `).join('')}
      </div>
      <div class="setup-duration-row" aria-label="Spieldauer">
        ${DURATION_OPTIONS.map((option) => `
          <button class="setup-duration ${this.duration === option.id ? 'is-selected' : ''}" data-duration="${option.id}" type="button">
            <strong>${option.title}</strong>
            <span>${option.detail}</span>
            <small>${option.fields} Felder</small>
          </button>
        `).join('')}
      </div>
    `;

    el.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        this.selectedMode = button.dataset.mode;
        this.render();
      });
    });

    el.querySelectorAll('[data-duration]').forEach((button) => {
      button.addEventListener('click', () => {
        this.duration = button.dataset.duration;
        this.render();
      });
    });
  }

  _renderPlayers(el) {
    el.innerHTML = `
      <div class="setup-players-layout">
        <div class="setup-player-list">
          ${this.players.map((player, index) => `
            <article class="setup-player-row ${index === this.activePlayerIndex ? 'is-active' : ''}" data-player-row="${index}">
              <button class="setup-player-avatar" data-select-player="${index}" type="button" aria-label="Figur ${index + 1} bearbeiten">${renderCharacterAvatar(player.colorIndex, 66)}</button>
              <label>
                <span>Figur ${index + 1}</span>
                <input class="setup-input player-name-input" data-player="${index}" value="${this._escape(player.name)}" maxlength="18">
              </label>
              <button class="setup-remove-player" data-remove-player="${index}" type="button" ${this.players.length <= 2 ? 'disabled' : ''}>Entfernen</button>
            </article>
          `).join('')}
          <button class="setup-add-player" id="add-player" type="button" ${this.players.length >= MAX_PLAYERS ? 'disabled' : ''}>Weitere Figur an den Tisch</button>
        </div>

        <div class="setup-character-bank" aria-label="Figurenwahl">
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
        <strong>${this._activeTopicCount()} Aufgabenfarben aktiv</strong>
        <span>${topics.length} im Topf</span>
      </div>
      <div class="setup-topic-grid">
        ${topics.map((topic, index) => `
          <button class="setup-topic ${this.settings.isTopicActive(topic.id) ? 'is-selected' : ''}" data-topic="${topic.id}" type="button" style="--topic-accent:${TOPIC_ACCENTS[index % TOPIC_ACCENTS.length]}">
            <i></i>
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

  _renderDynamics(el) {
    const axes = Object.entries(AXIS_META).filter(([axis]) => axis in this.settings.difficulty);
    el.innerHTML = `
      <div class="setup-moment-grid">
        ${MOMENT_OPTIONS.map((moment) => `
          <button class="setup-moment ${this.activeMoments.has(moment.id) ? 'is-selected' : ''}" data-moment="${moment.id}" type="button">
            <strong>${moment.label}</strong>
            <span>${moment.detail}</span>
          </button>
        `).join('')}
      </div>
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

    el.querySelectorAll('[data-moment]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.moment;
        if (this.activeMoments.has(id)) {
          if (this.activeMoments.size > 1) this.activeMoments.delete(id);
        } else {
          this.activeMoments.add(id);
        }
        this.render();
      });
    });

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

    const moments = MOMENT_OPTIONS
      .filter((moment) => this.activeMoments.has(moment.id))
      .map((moment) => moment.label);

    el.innerHTML = `
      <div class="setup-summary">
        <section class="setup-ready-panel">
          <span>Bereit</span>
          <strong>${this.players.length} Figuren stehen am Start</strong>
          <p>${this.players.map((player, index) => this._playerName(player, index)).join(', ')}</p>
        </section>
        <div class="setup-ready-list">
          <article><small>Modus</small><strong>${this._modeTitle()}</strong><p>${this._modeDetail()}</p></article>
          <article><small>Dauer</small><strong>${this._durationTitle()}</strong><p>${this._durationFields()} Felder als Zielrahmen.</p></article>
          <article><small>Themen</small><strong>${topics.length}</strong><p>${topics.join(', ')}</p></article>
          <article><small>Spielmomente</small><strong>${moments.length}</strong><p>${moments.join(', ')}</p></article>
        </div>
      </div>
    `;
  }

  _getStepCopy() {
    return [
      'Wähle zuerst das Gefühl der Partie. Das Setup wirkt wie ein Spieltisch, nicht wie ein Formular.',
      'Namen eintragen, Figur antippen und die passende Spielfarbe für jede Person festlegen.',
      'Die Stufe bestimmt, welche Aufgaben später auf dem Brett auftauchen.',
      'Mische Deutschbereiche so, dass die Runde abwechslungsreich bleibt und trotzdem klar lesbar ist.',
      'Aktiviere besondere Spielmomente und stelle ein, wie viel Druck, Hinweis und Länge passt.',
      'Prüfe die Runde. Danach geht es direkt auf das gemalte Brett.'
    ][this.currentStep];
  }

  _getValidationMessage() {
    if (this.players.length < 2) return 'Mindestens zwei Spieler wählen.';
    if (this.players.some((player) => !String(player.name || '').trim())) return 'Alle Spieler brauchen einen Namen.';
    if (this._activeTopicCount() === 0) return 'Mindestens ein Thema aktivieren.';
    return '';
  }

  _playerName(player, index) {
    return String(player.name || '').trim() || `Spieler ${index + 1}`;
  }

  _levelLabel() {
    return CLASS_LEVELS.find((level) => level.id === this.settings.classLevel)?.label || 'Klasse 2';
  }

  _modeTitle() {
    return GAME_MODES.find((mode) => mode.id === this.selectedMode)?.title || 'Partyreise';
  }

  _modeDetail() {
    return GAME_MODES.find((mode) => mode.id === this.selectedMode)?.detail || GAME_MODES[0].detail;
  }

  _durationTitle() {
    return DURATION_OPTIONS.find((option) => option.id === this.duration)?.title || 'Standard';
  }

  _durationFields() {
    return DURATION_OPTIONS.find((option) => option.id === this.duration)?.fields || 36;
  }

  _activeTopicCount() {
    return Array.isArray(this.settings.activeTopics) ? this.settings.activeTopics.length : 0;
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
