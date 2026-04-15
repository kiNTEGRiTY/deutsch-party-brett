/**
 * High-Fidelity: Dialogue Duel (Dialog-Duell)
 * A "Choose-Your-Own-Adventure" dialogue with branching logic and character reactions.
 */
export const DialogueDuel = {
  id: 'dialogue-duel',
  name_de: 'Dialog-Duell',
  topics: ['lesen', 'wortschatz', 'pragmatik'],
  setup(container, task, onComplete) {
    const story = {
      start: {
        text: 'Hallo! Hast du heute Zeit für einen Ausflug?',
        npc: '🦊',
        emotion: '😊',
        choices: [
          { text: 'Ja, gerne! Wohin?', next: 'park' },
          { text: 'Nein, ich muss lernen.', next: 'end_sad' }
        ]
      },
      park: {
        text: 'Lass uns in den Park gehen. Was sollen wir mitnehmen?',
        npc: '🦊',
        emotion: '😃',
        choices: [
          { text: 'Ein Picknick-Korb!', next: 'end_happy' },
          { text: 'Einen Regenschirm.', next: 'end_rain' }
        ]
      },
      end_happy: {
        text: 'Toll! Das wird ein super Tag. 🧺🍓',
        npc: '🦊',
        emotion: '🥳',
        isEnd: true,
        correct: true
      },
      end_sad: {
        text: 'Schade. Vielleicht ein anderes Mal. 📚',
        npc: '🦊',
        emotion: '😟',
        isEnd: true,
        correct: false
      },
      end_rain: {
        text: 'Gute Idee! Es sieht bewölkt aus. 🌧️',
        npc: '🦊',
        emotion: '🤔',
        isEnd: true,
        correct: true
      }
    };

    let currentNode = 'start';

    function render() {
      const node = story[currentNode];
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:var(--space-md);max-width:500px;margin:0 auto;text-align:center;user-select:none;touch-action:none;background:#fdfcf0;border-radius:24px;border:4px solid #f1c40f;min-height:65vh;overflow:hidden;position:relative;display:flex;flex-direction:column;justify-content:space-between;';

      wrapper.innerHTML = `
        <div style="font-size:2rem;color:#d35400;margin-bottom:10px;">💬 Gesprächs-Profi</div>
        
        <!-- NPC Area -->
        <div style="flex-grow:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;">
          <div style="font-size:10rem;position:relative;">
            ${node.npc}
            <div style="position:absolute;top:-20px;right:-20px;font-size:3rem;background:white;border-radius:50%;padding:10px;box-shadow:0 4px 10px rgba(0,0,0,0.1);">${node.emotion}</div>
          </div>
          <div style="background:white;padding:20px;border-radius:20px;margin-top:30px;box-shadow:0 4px 15px rgba(0,0,0,0.05);border:2px solid #f1c40f;position:relative;min-width:80%;max-width:90%;">
             <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:20px;height:20px;background:white;border-left:2px solid #f1c40f;border-top:2px solid #f1c40f;transform:rotate(45deg);"></div>
             <p style="font-size:1.2rem;font-weight:bold;color:#2c3e50;">${node.text}</p>
          </div>
        </div>

        <!-- Choice Area -->
        <div style="padding:20px;display:grid;grid-template-columns:1fr;gap:10px;">
           ${node.isEnd ? `
             <button id="dd-finish" class="btn btn-primary" style="padding:20px;font-size:1.3rem;">Dialog beenden -></button>
           ` : node.choices.map((c, i) => `
             <button class="choice-btn" data-next="${c.next}" style="padding:15px;background:white;border:2px solid #f1c40f;border-radius:15px;font-weight:bold;color:#2c3e50;cursor:pointer;font-size:1.1rem;transition:all 0.2s;">
               ${c.text}
             </button>
           `).join('')}
        </div>
      `;

      wrapper.querySelectorAll('.choice-btn').forEach(btn => {
        btn.onclick = () => {
          currentNode = btn.dataset.next;
          render();
        };
      });

      wrapper.querySelector('#dd-finish')?.addEventListener('click', () => {
        onComplete({ correct: node.correct, score: node.correct ? 100 : 50 });
      });

      container.appendChild(wrapper);
    }
    render();
  }
};
