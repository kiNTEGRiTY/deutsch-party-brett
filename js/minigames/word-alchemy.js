/**
 * High-Fidelity: Word Alchemy (Wort-Alchemie)
 * Mix syllables/prefixes in a bubbling cauldron to create "Golden Words".
 */
export const WordAlchemy = {
  id: 'word-alchemy',
  name_de: 'Wort-Alchemie',
  topics: ['wortbildung', 'wortschatz', 'rechtschreibung'],
  setup(container, task, onComplete) {
    const goals = [
      { base: 'stellen', options: ['vor', 'be', 'ge', 'ent'], answer: 'vor', full: 'vorstellen' },
      { base: 'laufen', options: ['hin', 'weg', 'mit', 'aus'], answer: 'hin', full: 'hinlaufen' }
    ];
    const g = goals[Math.floor(Math.random() * goals.length)];
    let score = 0;

    function render() {
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:var(--space-md);max-width:500px;margin:0 auto;text-align:center;user-select:none;touch-action:none;position:relative;background:linear-gradient(to bottom, #2c3e50, #000);border-radius:20px;color:white;overflow:hidden;height:65vh;';

      wrapper.innerHTML = `
        <style>
          @keyframes bubble { 0% { transform: translateY(0) scale(1); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: translateY(-100px) scale(0.5); opacity: 0; } }
          .bubble { position:absolute; bottom:60px; width:15px; height:15px; background:rgba(255,215,0,0.6); border-radius:50%; animation: bubble 3s infinite ease-out; }
          .wa-ingredient { cursor:grab; padding:15px 25px; border-radius:30px; font-weight:bold; font-size:1.2rem; box-shadow:0 0 15px rgba(255,255,255,0.2); }
        </style>
        <div style="font-size:2rem;color:#f1c40f;margin-bottom:10px;">🧪 Die Alchemie-Küche</div>
        <p style="color:#bdc3c7;font-size:0.9rem;margin-bottom:30px;">Mische ein Präfix zu <b>"${g.base}"</b>!</p>
        
        <!-- The Cauldron -->
        <div id="wa-cauldron" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:280px;height:120px;background:#34495e;border-radius:100px 100px 20px 20px;border-top:8px solid #2c3e50;box-shadow:inset 0 10px 30px rgba(0,0,0,0.5), 0 10px 0 #1a252f;">
          <div style="position:absolute;top:-10px;left:20px;right:20px;height:20px;background:#8e44ad;border-radius:50%;opacity:0.6;filter:blur(5px);"></div>
          <!-- Bubbles -->
          ${Array.from({ length: 8 }).map((_, i) => `<div class="bubble" style="left:${20 + Math.random() * 240}px; animation-delay:${Math.random() * 3}s;"></div>`).join('')}
        </div>

        <div id="wa-shelf" style="display:flex;flex-wrap:wrap;gap:15px;justify-content:center;">
          ${g.options.map((opt, i) => `
            <div class="wa-ingredient" data-opt="${opt}" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.3);">${opt}-</div>
          `).join('')}
        </div>
        
        <div id="wa-feedback" style="position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);font-size:3rem;font-weight:900;text-shadow:0 0 20px #f1c40f;pointer-events:none;display:none;"></div>
      `;

      const ingredients = wrapper.querySelectorAll('.wa-ingredient');
      const cauldron = wrapper.querySelector('#wa-cauldron');
      const fb = wrapper.querySelector('#wa-feedback');

      ingredients.forEach(ing => {
        let isDragging = false;
        let startX, startY;
        
        ing.onpointerdown = (e) => {
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          ing.style.zIndex = 100;
        };

        window.onpointermove = (e) => {
          if (!isDragging) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          ing.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx/10}deg)`;
          
          // Collision check with cauldron
          const cr = cauldron.getBoundingClientRect();
          const ir = ing.getBoundingClientRect();
          if (ir.left < cr.right && ir.right > cr.left && ir.top < cr.bottom && ir.bottom > cr.top) {
            cauldron.style.background = '#8e44ad'; // Change color on hover
          } else {
            cauldron.style.background = '#34495e';
          }
        };

        window.onpointerup = (e) => {
          if (!isDragging) return;
          isDragging = false;
          const cr = cauldron.getBoundingClientRect();
          const ir = ing.getBoundingClientRect();

          if (ir.left < cr.right && ir.right > cr.left && ir.top < cr.bottom && ir.bottom > cr.top) {
            const opt = ing.dataset.opt;
            if (opt === g.answer) {
              ing.style.display = 'none';
              fb.style.display = 'block';
              fb.innerHTML = `<span style="color:#f1c40f;">GOLD!</span><br><small style="font-size:1.5rem;">"${g.full}"</small>`;
              cauldron.style.background = '#f1c40f'; // Success!
              setTimeout(() => onComplete({ correct: true, score: 100 }), 1500);
            } else {
              // Fail animation (puff logic)
              ing.style.transform = 'translate(0,0)';
              cauldron.style.background = '#e74c3c';
              setTimeout(() => cauldron.style.background = '#34495e', 500);
            }
          } else {
            ing.style.transform = 'translate(0,0)';
          }
        };
      });

      container.appendChild(wrapper);
    }
    render();
  }
};
