/**
 * Render Setup - Multi-step setup screen with illustrated characters
 */

import { getTopicsForLevel, getTopicsByCategory } from '../learning/topic-registry.js';
import { AXIS_META } from '../learning/difficulty.js';
import { ProfileManager } from '../settings/profiles.js';
import { CHARACTERS, renderCharacterAvatar } from '../ui/characters.js';
import { BOARD_THEME } from '../engine/board-layouts.js';
import {
  iconSeedling, iconStar2, iconBooks, iconRocket, iconTrophy, iconMask,
  iconSave, iconCheck
} from '../ui/icons.js';

const CLASS_LEVELS = [
  { id: 'vorschule', label: 'Vorschule', iconFn: iconSeedling, desc: 'Erste Schritte' },
  { id: 'klasse1', label: 'Klasse 1', iconFn: iconStar2, desc: 'Grundlagen' },
  { id: 'klasse2', label: 'Klasse 2', iconFn: iconBooks, desc: 'Aufbau' },
  { id: 'klasse3', label: 'Klasse 3', iconFn: iconRocket, desc: 'Vertiefung' },
  { id: 'klasse4', label: 'Klasse 4', iconFn: iconTrophy, desc: 'Fortgeschritten' },
  { id: 'frei', label: 'Freier Modus', iconFn: iconMask, desc: 'Alles ist möglich!' }
];

const MAX_PLAYERS = 4;

export class SetupRenderer {
  constructor(containerEl, settings, onComplete) {
    this.container = containerEl;
    this.settings = settings;
    this.onComplete = onComplete;
    this.currentStep = 0;
    this.totalSteps = 5;
    this.players = [
      { name: 'Spieler 1', colorIndex: 0 },
      { name: 'Spieler 2', colorIndex: 1 }
    ];
    this.settings.selectedBoardId = BOARD_THEME.id;
    this.settings.selectedBoardUrl = null;
  }

  render() {
    this.container.innerHTML = '';

    const validationMessage = this._getValidationMessage();
    const wrapper = document.createElement('div');
    wrapper.className = 'setup-premium-shell animate-screen';
    wrapper.style.cssText = `
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--ui-background-premium);
      font-family: var(--font-family);
      overflow: hidden;
      position: relative;
    `;

    wrapper.innerHTML = `
      <div class="setup-progress-rail" style="display:flex; justify-content:center; gap:12px; padding:24px 0 12px;">
        ${Array.from({ length: this.totalSteps }, (_, i) => `
          <div style="
            width: ${i === this.currentStep ? '38px' : '14px'};
            height: 14px;
            border-radius: 999px;
            background: ${i === this.currentStep ? '#ff4f7c' : i < this.currentStep ? '#64c983' : 'rgba(0,0,0,0.14)'};
            transition: all 0.3s ease;
          "></div>
        `).join('')}
      </div>

      <div id="setup-step-content" style="flex:1; overflow-y:auto; padding:0 24px 20px;"></div>

      <div class="setup-bottom-bar" style="
        display:flex;
        justify-content:space-between;
        align-items:flex-end;
        padding:18px 24px 22px;
        background:rgba(255,255,255,0.76);
        border-top:1px solid rgba(0,0,0,0.07);
        backdrop-filter: blur(12px);
        gap:18px;
        box-shadow: 0 -14px 28px rgba(31,107,56,0.08);
      ">
        <div class="setup-validation" style="min-height:24px; font-size:14px; font-weight:700; color:${validationMessage ? '#c23f56' : 'transparent'};">
          ${validationMessage || 'OK'}
        </div>
        <div style="display:flex; gap:16px; align-items:center;">
          <button id="setup-back" class="btn btn-secondary" type="button" style="${this.currentStep === 0 ? 'visibility:hidden;' : ''} width:auto; min-width: 180px;">‹ Zurück</button>
          <button id="setup-next" class="btn btn-primary btn-lg" type="button" ${validationMessage ? 'disabled' : ''} style="min-width: 240px; opacity:${validationMessage ? '0.45' : '1'};">${this.currentStep === this.totalSteps - 1 ? '🎲 Spiel starten!' : 'Weiter ›'}</button>
        </div>
      </div>
    `;

    this.container.appendChild(wrapper);

    const contentEl = document.getElementById('setup-step-content');
    this._renderStep(contentEl);

    document.getElementById('setup-back')?.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep -= 1;
        this.render();
      }
    });

    document.getElementById('setup-next')?.addEventListener('click', () => {
      if (this._getValidationMessage()) {
        return;
      }

      this._saveStepData();
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep += 1;
        this.render();
      } else {
        this.onComplete(this.players, this.settings);
      }
    });
  }

  _renderStep(el) {
    switch (this.currentStep) {
      case 0:
        this._renderPlayers(el);
        break;
      case 1:
        this._renderLevelSelect(el);
        break;
      case 2:
        this._renderTopics(el);
        break;
      case 3:
        this._renderDifficulty(el);
        break;
      case 4:
        this._renderSummary(el);
        break;
      default:
        this._renderPlayers(el);
    }
  }

  _renderPlayers(el) {
    const selectedPlayers = this.players.map((player, index) => `
      <div class="cardboard-chip cardboard-${['blue', 'pink', 'green', 'orange', 'purple', 'yellow'][index % 6]}" style="
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px 14px;
        min-width:150px;
      ">
        ${renderCharacterAvatar(player.colorIndex, 52)}
        <div>
          <div style="font-size:12px; opacity:0.8;">Aktiv</div>
          <div style="font-size:18px; font-weight:800;">${this._getPlayerDisplayName(player, index)}</div>
        </div>
      </div>
    `).join('');

    el.innerHTML = `
      <div style="padding: 8px 0 20px;">
        <div class="setup-hero-card" style="
          background: rgba(255,255,255,0.88);
          border-radius: 28px;
          padding: 24px 28px;
          margin-bottom: 18px;
          box-shadow: var(--shadow-md);
          text-align: center;
        ">
          <h2 style="font-family:var(--font-family-display); font-size:clamp(34px,4vw,56px); color:#ff4f7c; margin:0 0 8px;">Wer spielt mit?</h2>
          <p style="font-size:clamp(18px,2vw,24px); color:#53645a; margin:0;">Wähle 2 bis 4 Figuren und starte auf dem klaren Wortgarten-Pfad.</p>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
          ${selectedPlayers || '<div style="font-weight:700; color:#6b7f73;">Noch kein Spieler ausgewählt.</div>'}
        </div>

        <div class="char-picker-grid" style="
          display:grid;
          grid-template-columns:repeat(auto-fill, minmax(108px, 1fr));
          gap:14px;
          margin-bottom:28px;
        ">
          ${CHARACTERS.map((character, index) => {
            const isSelected = this.players.some((player) => player.colorIndex === index);
            return `
              <button
                class="char-pick-option ${isSelected ? 'selected' : ''}"
                data-char-idx="${index}"
                type="button"
                style="
                  cursor:pointer;
                  position:relative;
                  border:none;
                  border-radius:28px;
                  background:${isSelected ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.52)'};
                  box-shadow:${isSelected ? 'var(--shadow-md)' : '0 10px 24px rgba(0,0,0,0.06)'};
                  padding:10px 8px 12px;
                "
              >
                ${renderCharacterAvatar(index, 84)}
                <span style="display:block; margin-top:6px; font-size:13px; font-weight:800; color:#36453d;">${character.name_de}</span>
                ${isSelected ? '<span style="position:absolute; top:-6px; right:-6px; width:28px; height:28px; border-radius:50%; background:#ffd45a; color:#2d281c; display:flex; align-items:center; justify-content:center; font-weight:900; border:2px solid #fff;">✓</span>' : ''}
              </button>
            `;
          }).join('')}
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:10px; flex-wrap:wrap;">
          <div>
            <h2 style="margin:0; font-family:var(--font-family-display); font-size:clamp(28px,3vw,42px); color:#1f6b38;">Brettlayout</h2>
            <p style="margin:4px 0 0; color:#607d68;">Fester Wortgarten-Pfad mit 36 Feldern, klarer Richtung und zufälliger Feldverteilung pro Partie.</p>
          </div>
          <div class="cardboard-chip cardboard-yellow" style="padding:10px 14px; font-weight:800;">
            ${BOARD_THEME.name}
          </div>
        </div>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));
          gap:12px;
          padding: 8px 0 4px;
        ">
          ${[
            '36 Felder von Start bis Ziel',
            'geschwungener Pfad ohne Schleifen',
            'Nomen, Verben und Adjektive klar lesbar',
            'Portal, Bewegung und Fallen sichtbar markiert'
          ].map((item) => `
            <div class="cardboard-chip cardboard-green" style="padding:12px 14px; font-weight:800;">
              ${item}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    el.querySelectorAll('.char-pick-option').forEach((option) => {
      option.addEventListener('click', () => {
        const characterIndex = Number.parseInt(option.dataset.charIdx, 10);
        const existingIndex = this.players.findIndex((player) => player.colorIndex === characterIndex);

        if (existingIndex >= 0) {
          this.players.splice(existingIndex, 1);
        } else if (this.players.length < MAX_PLAYERS) {
          this.players.push({
            name: `Spieler ${this.players.length + 1}`,
            colorIndex: characterIndex
          });
        }

        this.render();
      });
    });

  }

  _renderLevelSelect(el) {
    const chipColors = ['cardboard-pink', 'cardboard-yellow', 'cardboard-blue', 'cardboard-green', 'cardboard-orange', 'cardboard-purple'];

    el.innerHTML = `
      <div class="setup-step-content active">
        <div class="setup-header">
          <h2>Klassenstufe</h2>
          <p>Wie anspruchsvoll soll das Deutsch-Training sein?</p>
        </div>
        <div class="level-grid">
          ${CLASS_LEVELS.map((level, index) => `
            <button
              class="card card-interactive level-card cardboard-chip ${chipColors[index % chipColors.length]} ${this.settings.classLevel === level.id ? 'selected' : ''}"
              data-level="${level.id}"
              type="button"
              style="border:none; cursor:pointer; text-align:center;"
            >
              <div style="margin-bottom: var(--space-xs);">${level.iconFn(36)}</div>
              <div class="level-name">${level.label}</div>
              <div style="font-size: var(--font-size-xs); color: rgba(0,0,0,0.68);">${level.desc}</div>
              ${this.settings.classLevel === level.id ? '<div style="position:absolute; top:8px; right:10px; font-weight:900; color:#000;">✓</div>' : ''}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    el.querySelectorAll('.level-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.settings.setClassLevel(card.dataset.level);
        this.render();
      });
    });
  }

  _renderTopics(el) {
    const categories = getTopicsByCategory();
    const availableTopics = getTopicsForLevel(this.settings.classLevel);
    const availableIds = availableTopics.map((topic) => topic.id);
    const chipColors = ['cardboard-pink', 'cardboard-yellow', 'cardboard-blue', 'cardboard-green', 'cardboard-orange', 'cardboard-purple', 'cardboard-cyan', 'cardboard-lime'];

    el.innerHTML = `
      <div class="setup-step-content active">
        <div class="setup-header">
          <h2>Themen auswählen</h2>
          <p>Stell die Mischung aus Wortarten, Satzbau und Rechtschreibung passend zusammen.</p>
        </div>

        <div style="display:flex; gap:12px; justify-content:center; margin-bottom: 24px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-secondary" id="topics-all" type="button">Alle an</button>
          <button class="btn btn-sm btn-secondary" id="topics-none" type="button">Alle aus</button>
          <div class="cardboard-chip cardboard-green" style="padding:10px 14px; font-weight:800;">
            ${this.settings.activeTopics.length} aktiv
          </div>
        </div>

        ${Object.entries(categories).map(([categoryName, topics], categoryIndex) => `
          <div style="margin-bottom: var(--space-md);">
            <h4 style="font-size: var(--font-size-sm); color: var(--text-light); margin-bottom: var(--space-xs);">${categoryName}</h4>
            <div class="topic-grid">
              ${topics.map((topic, topicIndex) => {
                const available = availableIds.includes(topic.id);
                const active = available && this.settings.isTopicActive(topic.id);
                const colorClass = chipColors[(categoryIndex + topicIndex) % chipColors.length];

                return `
                  <button
                    class="topic-chip cardboard-chip ${colorClass} ${active ? 'active selected' : ''} ${!available ? 'disabled' : ''}"
                    data-topic="${topic.id}"
                    type="button"
                    style="${!available ? 'opacity:0.38; pointer-events:none;' : 'padding: 8px 12px; cursor:pointer; border:none;'}"
                  >
                    <span>${topic.label_de}</span>
                    ${active ? '<span style="margin-left:6px; font-weight:900;">✓</span>' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    el.querySelectorAll('.topic-chip:not(.disabled)').forEach((chip) => {
      chip.addEventListener('click', () => {
        this.settings.toggleTopic(chip.dataset.topic);
        this.render();
      });
    });

    document.getElementById('topics-all')?.addEventListener('click', () => {
      this.settings.activeTopics = [...availableIds];
      this.render();
    });

    document.getElementById('topics-none')?.addEventListener('click', () => {
      this.settings.disableAllTopics();
      this.render();
    });
  }

  _renderDifficulty(el) {
    const axes = Object.entries(AXIS_META);
    const chipColors = ['cardboard-yellow', 'cardboard-green', 'cardboard-orange', 'cardboard-pink', 'cardboard-blue', 'cardboard-purple'];

    el.innerHTML = `
      <div class="setup-step-content active">
        <div class="setup-header">
          <h2>Schwierigkeit</h2>
          <p>Feineinstellungen für Tempo, Hilfen und Eingabeart.</p>
        </div>

        <div class="difficulty-grid" style="display:grid; gap:15px;">
          ${axes.map(([key, meta], index) => {
            const value = this.settings.difficulty[key] ?? meta.default;
            const label = meta.labels_de[value - meta.min] || value;
            return `
              <div class="slider-group cardboard-chip ${chipColors[index % chipColors.length]}" style="padding:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:10px;">
                  <span style="font-weight:800; font-family:var(--font-family-display);">${meta.label_de}</span>
                  <span id="val-${key}" style="background:rgba(255,255,255,0.45); padding:4px 10px; border-radius:999px; font-weight:800;">${label}</span>
                </div>
                <input
                  type="range"
                  min="${meta.min}"
                  max="${meta.max}"
                  value="${value}"
                  data-axis="${key}"
                  class="difficulty-slider"
                  style="width:100%;"
                >
                <div style="font-size:0.82rem; color:#4b3621; margin-top:8px; font-style:italic;">${meta.description_de}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    el.querySelectorAll('.difficulty-slider').forEach((slider) => {
      slider.addEventListener('input', () => {
        const axis = slider.dataset.axis;
        const value = Number.parseInt(slider.value, 10);
        const meta = AXIS_META[axis];

        this.settings.setDifficultyAxis(axis, value);
        document.getElementById(`val-${axis}`).textContent = meta.labels_de[value - meta.min] || value;
      });
    });
  }

  _renderSummary(el) {
    const levelLabel = CLASS_LEVELS.find((level) => level.id === this.settings.classLevel)?.label || this.settings.classLevel;
    const activeTopicCount = this.settings.activeTopics.length;
    el.innerHTML = `
      <div class="setup-step-content active">
        <div class="setup-header">
          <h2>${iconCheck(24)} Zusammenfassung</h2>
          <p>Ein letzter Blick, dann geht das Brett los.</p>
        </div>

        <div class="summary-grid" style="display:grid; gap:15px;">
          <div class="summary-item cardboard-chip cardboard-blue" style="padding:20px;">
            <div style="font-size:0.8rem; opacity:0.82;">Spieler</div>
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:1.1rem; font-weight:800;">
              ${this.players.map((player) => renderCharacterAvatar(player.colorIndex, 44)).join('')}
              <span>${this.players.length} Spieler</span>
            </div>
          </div>

          <div class="summary-item cardboard-chip cardboard-green" style="padding:20px;">
            <div style="font-size:0.8rem; opacity:0.82;">Klassenstufe</div>
            <div style="font-size:1.2rem; font-weight:800;">${levelLabel}</div>
          </div>

          <div class="summary-item cardboard-chip cardboard-orange" style="padding:20px;">
            <div style="font-size:0.8rem; opacity:0.82;">Themen</div>
            <div style="font-size:1.2rem; font-weight:800;">${activeTopicCount} aktiv</div>
          </div>

          <div class="summary-item cardboard-chip cardboard-purple" style="padding:20px;">
            <div style="font-size:0.8rem; opacity:0.82;">Brett</div>
            <div style="font-size:1.2rem; font-weight:800;">${BOARD_THEME.name}</div>
          </div>
        </div>

        <div class="profile-section">
          <input type="text" id="profile-name" placeholder="Profil speichern als..." maxlength="20">
          <button class="btn btn-sm btn-secondary" id="save-profile" type="button">${iconSave(16)} Speichern</button>
        </div>
      </div>
    `;

    document.getElementById('save-profile')?.addEventListener('click', () => {
      const name = document.getElementById('profile-name')?.value?.trim();
      if (!name) {
        return;
      }

      this.settings.profileName = name;
      ProfileManager.save(name, this.settings.getSnapshot());

      const button = document.getElementById('save-profile');
      button.innerHTML = `${iconCheck(16)} Gespeichert!`;
      button.style.background = 'var(--color-success)';
      button.style.color = 'white';
    });
  }

  _saveStepData() {
    this._normalizePlayers();
    this.settings.setGameMode('local');
  }

  _getValidationMessage() {
    if (this.currentStep === 0) {
      if (this.players.length < 2) {
        return 'Wähle mindestens 2 Figuren aus.';
      }

      if (this.players.length > MAX_PLAYERS) {
        return 'Es sind maximal 4 Figuren erlaubt.';
      }
    }

    if ((this.currentStep === 2 || this.currentStep === 4) && this.settings.activeTopics.length === 0) {
      return 'Mindestens ein Thema muss aktiv sein.';
    }

    return '';
  }
  _getPlayerDisplayName(player, index) {
    return player.name?.trim() || `Spieler ${index + 1}`;
  }

  _normalizePlayers() {
    this.players = this.players.map((player, index) => ({
      ...player,
      name: this._getPlayerDisplayName(player, index)
    }));
  }
}
