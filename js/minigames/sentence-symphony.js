/**
 * High-Fidelity: Sentence Symphony (Satz-Sinfonie)
 * Conduct a word orchestra. Correct syntax creates a melody; errors a clash.
 */
export const SentenceSymphony = {
  id: 'sentence-symphony',
  name_de: 'Satz-Sinfonie',
  topics: ['satzbau', 'grammatik', 'lesen'],
  setup(container, task, onComplete) {
    const sentences = [
      { words: ['Heute', 'gehen', 'wir', 'in', 'den', 'Zoo.'], order: [0,1,2,3,4,5] }
    ];
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    const shuffled = [...s.words].sort(() => Math.random() - 0.5);
    let selected = [];

    function render() {
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:var(--space-md);max-width:600px;margin:0 auto;text-align:center;user-select:none;touch-action:none;position:relative;background:linear-gradient(135deg, #2c3e50, #4b79a1);border-radius:24px;color:white;min-height:60vh;overflow:hidden;';

      wrapper.innerHTML = `
        <style>
          @keyframes music-wave { 0%, 100% { height: 10px; } 50% { height: 40px; } }
          .music-bar { width:4px; margin:0 2px; background:#f1c40f; animation: music-wave 1s infinite alternate; }
          .word-note { cursor:pointer; padding:15px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); border-radius:12px; font-weight:bold; transition:all 0.2s; }
          .word-note:active { transform:scale(0.9); background:#f1c40f; color:#2c3e50; }
        </style>
        
        <div style="font-size:2rem;margin-bottom:10px;">🎶 Die Satz-Sinfonie</div>
        <p style="color:#bdc3c7;margin-bottom:30px;">Tippe die Instrumente (Wörter) in der richtigen Melodie-Pause!</p>
        
        <!-- Score Visualization -->
        <div style="height:80px;background:rgba(0,0,0,0.2);border-radius:15px;margin-bottom:40px;display:flex;align-items:center;justify-content:center;">
          <div style="font-size:1.5rem;font-weight:bold;letter-spacing:2px;color:#f1c40f;">
            ${selected.length > 0 ? selected.join(' ') : '--- --- ---'}
          </div>
          <!-- Animated Music Bars -->
          <div style="display:flex;margin-left:20px;">
            <div class="music-bar" style="animation-delay:0.1s;"></div>
            <div class="music-bar" style="animation-delay:0.3s;"></div>
            <div class="music-bar" style="animation-delay:0.2s;"></div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:15px;">
          ${shuffled.map((w, i) => `
            <div class="word-note" data-w="${w}">${w}</div>
          `).join('')}
        </div>

        ${selected.length === s.words.length ? `
          <button id="ss-finish" class="btn btn-primary" style="margin-top:30px;width:100%;height:60px;font-size:1.3rem;">Applaus abholen 🎻</button>
        ` : ''}
      `;

      wrapper.querySelectorAll('.word-note').forEach(note => {
        note.onclick = () => {
          const w = note.dataset.w;
          selected.push(w);
          shuffled.splice(shuffled.indexOf(w), 1);
          render();
        };
      });

      wrapper.querySelector('#ss-finish')?.addEventListener('click', () => {
        const formed = selected.join(' ');
        const isCorrect = formed === s.words.join(' ');
        if (isCorrect) {
          wrapper.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
          setTimeout(() => onComplete({ correct: true, score: 100 }), 1500);
        } else {
          wrapper.style.animation = 'shake 0.5s';
          wrapper.style.background = 'linear-gradient(135deg, #c0392b, #e74c3c)';
          setTimeout(() => {
            selected = [];
            shuffled.push(...s.words); // Simple reset
            render();
          }, 1000);
        }
      });

      container.appendChild(wrapper);
    }
    render();
  }
};
