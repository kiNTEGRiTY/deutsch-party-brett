/**
 * Render Setup - Multi-step setup screen with illustrated characters
 */

import { TOPICS, getTopicsForLevel, getTopicsByCategory } from '../learning/topic-registry.js';
import { AXIS_META, getDefaultDifficulty } from '../learning/difficulty.js';
import { PRESETS } from '../settings/presets.js';
import { ProfileManager } from '../settings/profiles.js';
import { CHARACTERS, getCharacter, renderCharacterAvatar } from '../ui/characters.js';
import { 
  iconSeedling, iconStar2, iconBooks, iconRocket, iconTrophy, iconMask,
  iconBack, iconNext, iconDice, iconSave, iconCheck
} from '../ui/icons.js';
import { BACKGROUNDS } from '../asset-manifest.js';

const CLASS_LEVELS = [
  { id: 'vorschule', label: 'Vorschule', iconFn: iconSeedling, desc: 'Erste Schritte' },
  { id: 'klasse1', label: 'Klasse 1', iconFn: iconStar2, desc: 'Grundlagen' },
  { id: 'klasse2', label: 'Klasse 2', iconFn: iconBooks, desc: 'Aufbau' },
  { id: 'klasse3', label: 'Klasse 3', iconFn: iconRocket, desc: 'Vertiefung' },
  { id: 'klasse4', label: 'Klasse 4', iconFn: iconTrophy, desc: 'Fortgeschritten' },
  { id: 'frei', label: 'Freier Modus', iconFn: iconMask, desc: 'Alles ist möglich!' },
];

export class SetupRenderer {
  constructor(containerEl, settings, onComplete) {
    this.container = containerEl;
    this.settings = settings;
    this.onComplete = onComplete;
    this.currentStep = 0;
    this.totalSteps = 5;
    this.players = [
      { name: '', colorIndex: 0 },
      { name: '', colorIndex: 1 }
    ];
  }

  render() {
    this.container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'setup-container';
    
    wrapper.innerHTML = `
      <div class="setup-steps">
        ${Array.from({ length: this.totalSteps }, (_, i) => `
          <div class="setup-step-dot ${i === this.currentStep ? 'active' : ''} ${i < this.currentStep ? 'done' : ''}"></div>
        `).join('')}
      </div>
      <div id="setup-step-content"></div>
      <div class="setup-nav">
        <button class="btn btn-secondary btn-sm cardboard-chip" id="setup-back" ${this.currentStep === 0 ? 'style="visibility:hidden"' : ''}>
          ${iconBack(16)} Zurück
        </button>
        <button class="btn btn-sm cardboard-chip ${['cardboard-pink', 'cardboard-yellow', 'cardboard-blue', 'cardboard-green', 'cardboard-orange'][this.currentStep] || 'cardboard-pink'}" id="setup-next">
          ${this.currentStep === this.totalSteps - 1 ? `${iconDice(18)} Spiel starten!` : `Weiter ${iconNext(16)}`}
        </button>
      </div>
    `;
    
    this.container.appendChild(wrapper);
    
    const contentEl = document.getElementById('setup-step-content');
    this._renderStep(contentEl);
    
    document.getElementById('setup-back')?.addEventListener('click', () => {
      if (this.currentStep > 0) { this.currentStep--; this.render(); }
    });
    
    document.getElementById('setup-next')?.addEventListener('click', () => {
      this._saveStepData();
      if (this.currentStep < this.totalSteps - 1) { this.currentStep++; this.render(); }
      else { this.onComplete(this.players, this.settings); }
    });
  }

  _renderStep(el) {
    switch (this.currentStep) {
      case 0: this._renderPlayers(el); break;
      case 1: this._renderLevelSelect(el); break;
      case 2: this._renderTopics(el); break;
      case 3: this._renderDifficulty(el); break;
      case 4: this._renderSummary(el); break;
    }
  }

  _renderPlayers(el) {
    el.innerHTML = `
      <div class="setup-step-content active">
        <div class="setup-header">
          <h2>Wer spielt mit?</h2>
          <p>Tippe einfach auf die Tiere, die mitspielen sollen!</p>
        </div>
        
        <div class="char-picker-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 20px; margin-bottom: 30px;">
          ${CHARACTERS.map((c, i) => {
            const isSelected = this.players.some(p => p.colorIndex === i);
            return `
              <div class="char-pick-option ${isSelected ? 'selected' : ''}" data-char-idx="${i}" style="cursor: pointer; position: relative; border-radius: 40% 60% 50% 50% / 50% 50% 50% 50%; background: rgba(255,255,255,0.4); padding: 5px;">
                ${renderCharacterAvatar(i, 110)}
                <span class="char-pick-name" style="font-size: 13px; font-weight: bold;">${c.name_de}</span>
                ${isSelected ? '<div style="position:absolute; top:-5px; right:-5px; background:var(--color-accent); color:#000; border:2px solid #000; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-weight:bold; z-index:10;">✓</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="setup-header" style="margin-top: 30px; margin-bottom: 10px;">
          <h2>Hintergrund-Landschaft</h2>
        </div>
        <div class="bg-picker-grid" id="bg-picker" style="display:flex; gap:10px; overflow-x: auto; padding-bottom: 10px;">
          ${BACKGROUNDS.map((bg, idx) => `
            <div class="bg-pick-option ${idx === 0 ? 'selected' : ''}" data-bg="${bg.url}" style="cursor:pointer; border: 3px solid ${idx === 0 ? 'var(--color-primary)' : 'transparent'}; border-radius: 45% 55% 65% 35% / 35% 65% 35% 65%; padding: 5px; text-align:center; min-width: 140px; background: rgba(255,255,255,0.4);">
              <div class="bg-preview" style="background-image: url('${bg.url}'); background-size: cover; background-position: center; width: 130px; height: 90px; border-radius: 35% 65% 45% 55%; margin-bottom: 5px;"></div>
              <span style="font-size: 12px; font-weight: bold;">${bg.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Direct Character Selection Logic
    el.querySelectorAll('.char-pick-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const charIdx = parseInt(opt.dataset.charIdx);
        const existingPlayerIdx = this.players.findIndex(p => p.colorIndex === charIdx);
        
        if (existingPlayerIdx >= 0) {
          // Deselect
          this.players.splice(existingPlayerIdx, 1);
        } else {
          // Select (limit to 6)
          if (this.players.length < 6) {
            this.players.push({ name: CHARACTERS[charIdx].name_de, colorIndex: charIdx });
          }
        }
        this.render();
      });
    });

    // Background Picker Logic
    el.querySelectorAll('.bg-pick-option').forEach(opt => {
      opt.addEventListener('click', () => {
        el.querySelectorAll('.bg-pick-option').forEach(o => {
          o.style.borderColor = 'transparent';
          o.classList.remove('selected');
        });
        opt.style.borderColor = 'var(--color-primary)';
        opt.classList.add('selected');
        
        const newBg = opt.dataset.bg;
        // Update CSS variable globally
        document.documentElement.style.setProperty('--game-background-img', `url('../../${newBg}')`);
      });
    });

    // Default to the first background dynamically loaded from the backgrounds folder
    if (BACKGROUNDS && BACKGROUNDS.length > 0) {
      document.documentElement.style.setProperty('--game-background-img', `url('../../${BACKGROUNDS[0].url}')`);
    }
  }

  _renderLevelSelect(el) {
    const chipColors = ['cardboard-pink', 'cardboard-yellow', 'cardboard-blue', 'cardboard-green', 'cardboard-orange', 'cardboard-purple'];
    
    el.innerHTML = `
      <div class="setup-step-content active">
        <div class="setup-header">
          <h2>Klassenstufe</h2>
          <p>Für welche Stufe sollen die Aufgaben sein?</p>
        </div>
        <div class="level-grid">
          ${CLASS_LEVELS.map((level, idx) => `
            <div class="card card-interactive level-card cardboard-chip ${chipColors[idx % chipColors.length]} ${this.settings.classLevel === level.id ? 'selected' : ''}" 
                 data-level="${level.id}">
              <div style="margin-bottom: var(--space-xs);">${level.iconFn(36)}</div>
              <div class="level-name">${level.label}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-light);">${level.desc}</div>
              ${this.settings.classLevel === level.id ? '<div style="position:absolute; top:5px; right:5px; font-weight:bold; color:#000;">✓</div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    el.querySelectorAll('.level-card').forEach(card => {
      card.addEventListener('click', () => {
        el.querySelectorAll('.level-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.settings.setClassLevel(card.dataset.level);
      });
    });
  }

  _renderTopics(el) {
    const categories = getTopicsByCategory();
    const availableTopics = getTopicsForLevel(this.settings.classLevel);
    const availableIds = availableTopics.map(t => t.id);

    const chipColors = ['cardboard-pink', 'cardboard-yellow', 'cardboard-blue', 'cardboard-green', 'cardboard-orange', 'cardboard-purple', 'cardboard-cyan', 'cardboard-lime'];
    
    el.innerHTML = `
      <div class="setup-step-content active">
        <div class="setup-header">
          <h2>Themen auswählen</h2>
          <p>Welche Themen sollen geübt werden?</p>
        </div>
        <div style="display:flex; gap: var(--space-sm); justify-content:center; margin-bottom: var(--space-lg);">
          <button class="btn btn-sm btn-secondary" id="topics-all">Alle an</button>
          <button class="btn btn-sm btn-secondary" id="topics-none">Alle aus</button>
        </div>
        ${Object.entries(categories).map(([cat, topics], catIdx) => `
          <div style="margin-bottom: var(--space-md);">
            <h4 style="font-size: var(--font-size-sm); color: var(--text-light); margin-bottom: var(--space-xs);">${cat}</h4>
            <div class="topic-grid">
              ${topics.map((topic, topicIdx) => {
                const available = availableIds.includes(topic.id);
                const active = this.settings.isTopicActive(topic.id) && available;
                const randomColor = chipColors[(catIdx + topicIdx) % chipColors.length];
                return `
                  <div class="topic-chip cardboard-chip ${randomColor} ${active ? 'active selected' : ''} ${!available ? 'disabled' : ''}" 
                       data-topic="${topic.id}" 
                       style="${!available ? 'opacity:0.4; pointer-events:none;' : 'padding: 8px 12px;'}">
                    <span>${topic.label_de}</span>
                    ${active ? '<span style="margin-left:5px; font-weight:bold;">✓</span>' : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    el.querySelectorAll('.topic-chip:not(.disabled)').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        this.settings.toggleTopic(chip.dataset.topic);
      });
    });

    document.getElementById('topics-all')?.addEventListener('click', () => {
      this.settings.activeTopics = availableIds;
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
          <p>Passe die Schwierigkeit genau an!</p>
        </div>
        <div class="difficulty-grid" style="display: grid; gap: 15px;">
          ${axes.map(([key, meta], idx) => {
            const value = this.settings.difficulty[key] ?? meta.default;
            const labelIdx = value - meta.min;
            const label = meta.labels_de[labelIdx] || value;
            const randomColor = chipColors[idx % chipColors.length];
            return `
              <div class="slider-group cardboard-chip ${randomColor}" style="padding: 15px;">
                <div class="slider-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span class="slider-label" style="font-weight: bold; font-family: var(--font-family-display);">${meta.label_de}</span>
                  <span class="slider-value" id="val-${key}" style="background: rgba(255,255,255,0.4); padding: 2px 8px; border-radius: 4px; font-weight: bold;">${label}</span>
                </div>
                <input type="range" min="${meta.min}" max="${meta.max}" value="${value}" 
                       data-axis="${key}" class="difficulty-slider" style="width: 100%;">
                <div style="font-size: 0.8rem; color: #4b3621; margin-top: 5px; font-style: italic;">${meta.description_de}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    el.querySelectorAll('.difficulty-slider').forEach(slider => {
      slider.addEventListener('input', () => {
        const axis = slider.dataset.axis;
        const value = parseInt(slider.value);
        this.settings.setDifficultyAxis(axis, value);
        const meta = AXIS_META[axis];
        const labelIdx = value - meta.min;
        document.getElementById(`val-${axis}`).textContent = meta.labels_de[labelIdx] || value;
      });
    });
  }

  _renderSummary(el) {
    const levelLabel = CLASS_LEVELS.find(l => l.id === this.settings.classLevel)?.label || '?';
    const activeTopicCount = this.settings.activeTopics.length;

    el.innerHTML = `
      <div class="setup-step-content active">
        <div class="setup-header">
          <h2>${iconCheck(24)} Zusammenfassung</h2>
          <p>Bereit? Dann kann es losgehen!</p>
        </div>
        <div class="summary-grid" style="display: grid; gap: 15px;">
          <div class="summary-item cardboard-chip cardboard-blue" style="padding: 20px; border-radius: 60% 40% 30% 70% / 70% 30% 40% 60% !important;">
            <div class="summary-label" style="font-size: 0.8rem; opacity: 0.8;">Spieler</div>
            <div class="summary-value" style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size: 1.2rem; font-weight: bold;">
              ${this.players.map(p => renderCharacterAvatar(p.colorIndex, 48)).join('')}
              <span>${this.players.length} Spieler</span>
            </div>
          </div>
          <div class="summary-item cardboard-chip cardboard-green" style="padding: 20px; border-radius: 30% 70% 40% 60% / 60% 30% 70% 40% !important;">
            <div class="summary-label" style="font-size: 0.8rem; opacity: 0.8;">Klassenstufe</div>
            <div class="summary-value" style="font-size: 1.2rem; font-weight: bold;">${levelLabel}</div>
          </div>
          <div class="summary-item cardboard-chip cardboard-orange" style="padding: 20px; border-radius: 40% 60% 70% 30% / 30% 70% 30% 70% !important;">
            <div class="summary-label" style="font-size: 0.8rem; opacity: 0.8;">Themen</div>
            <div class="summary-value" style="font-size: 1.2rem; font-weight: bold;">${activeTopicCount} aktiv</div>
          </div>
          <div class="summary-item cardboard-chip cardboard-purple" style="padding: 20px; border-radius: 70% 30% 40% 60% / 40% 60% 30% 70% !important;">
            <div class="summary-label" style="font-size: 0.8rem; opacity: 0.8;">Sprache</div>
            <div class="summary-value" style="font-size: 1.2rem; font-weight: bold;">Deutsch</div>
          </div>
        </div>
        <div class="profile-section">
          <input type="text" id="profile-name" placeholder="Profil speichern als..." maxlength="20">
          <button class="btn btn-sm btn-secondary" id="save-profile">${iconSave(16)} Speichern</button>
        </div>
      </div>
    `;

    document.getElementById('save-profile')?.addEventListener('click', () => {
      const name = document.getElementById('profile-name')?.value?.trim();
      if (name) {
        this.settings.profileName = name;
        ProfileManager.save(name, this.settings.getSnapshot());
        const btn = document.getElementById('save-profile');
        btn.innerHTML = `${iconCheck(16)} Gespeichert!`;
        btn.style.background = 'var(--color-success)';
        btn.style.color = 'white';
      }
    });
  }

  _saveStepData() {
    if (this.currentStep === 0) {
      this.container.querySelectorAll('.player-name-input').forEach(input => {
        const idx = parseInt(input.dataset.index);
        if (this.players[idx]) {
          this.players[idx].name = input.value.trim() || getCharacter(this.players[idx].colorIndex).name_de;
        }
      });
      if (this.players.length === 1) this.settings.setGameMode('single');
    }
  }
}
