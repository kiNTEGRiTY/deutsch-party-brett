/**
 * Masterpiece: Kitchen Chaos (Küchen-Schlacht)
 * A physics/gesture-based cooking simulator where you follow complex German instructions.
 */
export const KitchenChaos = {
  id: 'kitchen-chaos',
  name_de: 'Küchen-Schlacht',
  topics: ['lesen', 'wortschatz', 'verben'],
  setup(container, task, onComplete) {
    const steps = [
      { id: 'cut_onion', text: 'Schneide die Zwiebel!', icon: '🧅', action: 'swipe', result: '🔪' },
      { id: 'dry_apple', text: 'Wasche den Apfel!', icon: '🍎', action: 'tap', result: '💧' },
      { id: 'pour_salt', text: 'Gib das Salz dazu!', icon: '🧂', action: 'drag', target: '🍲', result: '🍲✨' }
    ];
    let currentStep = 0;

    function render() {
      container.innerHTML = '';
      const step = steps[currentStep];
      if (!step) {
        onComplete({ correct: true, score: 100 });
        return;
      }

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:var(--space-md);max-width:500px;margin:0 auto;text-align:center;user-select:none;touch-action:none;position:relative;height:60vh;';
      
      wrapper.innerHTML = `
        <div style="font-size:2rem;margin-bottom:10px;">🍳 Meisterkoch</div>
        <div id="kc-instruction" style="background:#f8f9fa;padding:15px;border-radius:10px;font-size:1.3rem;font-weight:bold;color:#2c3e50;margin-bottom:40px;border-left:5px solid #e67e22;">
          ${step.text}
        </div>
        
        <div style="position:relative;height:300px;display:flex;align-items:center;justify-content:center;">
          <div id="kc-main-item" style="font-size:8rem;cursor:grab;z-index:2;transition:transform 0.2s;">${step.icon}</div>
          ${step.target ? `<div id="kc-target" style="position:absolute;bottom:0;right:20px;font-size:8rem;">${step.target}</div>` : ''}
        </div>
        
        <div style="color:var(--text-secondary);font-size:0.9rem;margin-top:20px;">
          ${step.action === 'swipe' ? '👉 Ziehe schnell über das Objekt zum Schneiden!' : step.action === 'tap' ? '👋 Tippe mehrmals zum Waschen!' : '🎯 Ziehe das Objekt zum Ziel!'}
        </div>
      `;

      const mainItem = wrapper.querySelector('#kc-main-item');
      let startX, startY;

      if (step.action === 'swipe') {
        mainItem.onpointerdown = (e) => { startX = e.clientX; startY = e.clientY; };
        mainItem.onpointerup = (e) => {
          const dx = Math.abs(e.clientX - startX);
          if (dx > 50) nextStep();
        };
      } else if (step.action === 'tap') {
        let taps = 0;
        mainItem.onclick = () => {
          taps++;
          mainItem.style.transform = `scale(${1 + taps * 0.1})`;
          if (taps >= 5) nextStep();
        };
      } else if (step.action === 'drag') {
        let isDragging = false;
        mainItem.onpointerdown = () => { isDragging = true; mainItem.style.cursor = 'grabbing'; };
        window.onpointermove = (e) => {
          if (!isDragging) return;
          const rect = wrapper.getBoundingClientRect();
          mainItem.style.position = 'absolute';
          mainItem.style.left = `${e.clientX - rect.left - 50}px`;
          mainItem.style.top = `${e.clientY - rect.top - 50}px`;
          
          const target = wrapper.querySelector('#kc-target');
          if (target) {
            const tr = target.getBoundingClientRect();
            const mr = mainItem.getBoundingClientRect();
            if (mr.left < tr.right && mr.right > tr.left && mr.top < tr.bottom && mr.bottom > tr.top) {
              isDragging = false;
              nextStep();
            }
          }
        };
        window.onpointerup = () => { isDragging = false; };
      }

      container.appendChild(wrapper);
    }

    function nextStep() {
      const fb = document.createElement('div');
      fb.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:5rem;pointer-events:none;animation:popIn 0.5s forwards;z-index:100;';
      fb.textContent = '✨ Super! ✨';
      container.appendChild(fb);
      
      setTimeout(() => {
        currentStep++;
        render();
      }, 1000);
    }

    render();
  }
};
