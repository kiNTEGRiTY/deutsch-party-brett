/**
 * Masterpiece: Sentence Architect (Satz-Bauhaus)
 * A construction simulation where you build sentences from word-bricks.
 */
export const SentenceArchitect = {
  id: 'sentence-architect',
  name_de: 'Satz-Bauhaus',
  topics: ['satzbau', 'grammatik'],
  setup(container, task, onComplete) {
    const sentences = [
      { 
        structure: ['Subjekt', 'Verb', 'Objekt'], 
        words: [
          { w: 'Der Hund', type: 'Subjekt' },
          { w: 'frisst', type: 'Verb' },
          { w: 'den Knochen', type: 'Objekt' }
        ]
      }
    ];
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    const bricks = [...s.words].sort(() => Math.random() - 0.5);
    const slots = s.structure.map(type => ({ type, filled: null }));

    function render() {
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:var(--space-md);max-width:600px;margin:0 auto;text-align:center;user-select:none;touch-action:none;';

      wrapper.innerHTML = `
        <div style="font-size:2rem;margin-bottom:10px;">🏗️ Satz-Architekt</div>
        <p style="color:var(--text-secondary);margin-bottom:30px;">Baue den Satz Stein für Stein auf!</p>
        
        <div id="architect-site" style="min-height:200px;background:#ecf0f1;border-radius:16px;padding:20px;border-bottom:10px solid #bdc3c7;margin-bottom:30px;display:flex;justify-content:center;align-items:flex-end;gap:10px;">
          ${slots.map((slot, i) => `
            <div class="architect-slot" data-idx="${i}" style="width:120px;height:60px;border:2px dashed #bdc3c7;background:rgba(255,255,255,0.5);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#bdc3c7;font-weight:bold;font-size:0.8rem;transition:all 0.2s;">
              ${slot.filled ? `
                <div style="width:100%;height:100%;background:#34495e;color:white;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1rem;box-shadow:0 4px 0 #2c3e50;">${slot.filled.w}</div>
              ` : slot.type}
            </div>
          `).join('')}
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;">
          ${bricks.map((word, i) => `
            <div class="architect-brick" data-idx="${i}" style="padding:15px;background:#3498db;color:white;border-radius:8px;font-weight:bold;cursor:grab;box-shadow:0 4px 0 #2980b9;min-width:80px;">${word.w}</div>
          `).join('')}
        </div>

        ${slots.every(s => s.filled) ? `<button id="arch-check" class="btn btn-primary" style="margin-top:40px;width:100%;background:#e67e22;">Abnahme durch den Polier 👷‍♂️</button>` : ''}
      `;

      wrapper.querySelectorAll('.architect-brick').forEach(brick => {
        brick.onpointerdown = (e) => {
          const idx = parseInt(brick.dataset.idx);
          const word = bricks[idx];
          
          // Simplified interaction: tap to place in first empty slot
          const emptySlot = slots.find(s => !s.filled);
          if (emptySlot) {
            emptySlot.filled = word;
            bricks.splice(idx, 1);
            render();
          }
        };
      });

      wrapper.querySelector('#arch-check')?.addEventListener('click', () => {
        const isCorrect = slots.every(s => s.filled.type === s.type);
        if (isCorrect) {
          wrapper.querySelector('#architect-site').style.background = '#d4edda';
          setTimeout(() => onComplete({ correct: true, score: 100 }), 1000);
        } else {
          // Collapse animation simulate
          wrapper.querySelector('#architect-site').style.transform = 'skew(5deg)';
          wrapper.querySelector('#architect-site').style.background = '#f8d7da';
          setTimeout(() => {
            // Return bricks and clear slots
            slots.forEach(sl => { if (sl.filled) bricks.push(sl.filled); sl.filled = null; });
            render();
          }, 1000);
        }
      });

      container.appendChild(wrapper);
    }

    render();
  }
};
