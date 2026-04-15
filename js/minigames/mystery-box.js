/**
 * High-Fidelity: Mystery Box (Die Rätsel-Box)
 * A mechanical puzzle box with nested linguistic riddles.
 */
export const MysteryBox = {
  id: 'mystery-box',
  name_de: 'Mechanische Rätsel-Box',
  topics: ['lesen', 'wortschatz', 'konzentration'],
  setup(container, task, onComplete) {
    let layer = 0; // 0: Dial, 1: Slider, 2: Key
    let dialPos = 0;
    let sliderPos = 0;
    const targetDial = 2; // "die"
    const targetSlider = 100; // Right side

    function render() {
      container.innerHTML = '';
      const shadow = document.createElement('div');
      shadow.style.cssText = 'padding:var(--space-md);max-width:500px;margin:0 auto;text-align:center;user-select:none;touch-action:none;background:#2c3e50;border-radius:32px;color:white;min-height:70vh;overflow:hidden;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 20px 50px rgba(0,0,0,0.4);border:8px solid #34495e;';

      if (layer === 0) {
        shadow.innerHTML = `
          <div style="font-size:2rem;color:#f1c40f;margin-bottom:20px;">🔒 Ebene 1: Das Artikel-Rad</div>
          <p style="color:#bdc3c7;margin-bottom:40px;">Stelle das Rad auf den richtigen Artikel für <b>"Sonne"</b>!</p>
          
          <div id="mb-dial" style="width:200px;height:200px;background:conic-gradient(#f1c40f, #f39c12, #f1c40f);border-radius:50%;border:10px solid #2c3e50;box-shadow:0 0 20px #f1c40f;display:flex;align-items:center;justify-content:center;position:relative;transition:transform 0.5s;cursor:pointer;">
             ${['der', 'das', 'die', '...'].map((a, i) => `
                <div style="position:absolute;top:10px;left:50%;transform:translateX(-50%) rotate(${i*90}deg);transform-origin:50% 90px;font-weight:bold;font-size:1.5rem;color:#2c3e50;">${a}</div>
             `).join('')}
             <div style="width:10px;height:40px;background:#2c3e50;border-radius:5px;position:absolute;top:0;"></div>
          </div>
          <button id="mb-next" class="btn btn-primary" style="margin-top:50px;width:100%;height:60px;">Rad einrasten ⚙️</button>
        `;
        const dial = shadow.querySelector('#mb-dial');
        dial.onclick = () => { dialPos = (dialPos + 1) % 4; dial.style.transform = `rotate(${dialPos * -90}deg)`; };
        shadow.querySelector('#mb-next').onclick = () => {
          if (dialPos === 2) { layer++; render(); }
          else { shadow.style.animation = 'shake 0.5s'; }
        };
      } 
      else if (layer === 1) {
        shadow.innerHTML = `
          <div style="font-size:2rem;color:#3498db;margin-bottom:20px;">🔒 Ebene 2: Der Wort-Schieber</div>
          <p style="color:#bdc3c7;margin-bottom:40px;">Schiebe den Hebel auf das <b>Verb</b>!</p>
          
          <div style="width:280px;height:60px;background:#34495e;border-radius:30px;position:relative;padding:5px;display:flex;justify-content:space-between;align-items:center;">
             <span style="margin-left:20px;font-weight:bold;">haus</span>
             <span style="margin-right:20px;font-weight:bold;">laufen</span>
             <div id="mb-slider" style="width:50px;height:50px;background:#3498db;border-radius:50%;position:absolute;left:5px;cursor:grab;box-shadow:0 0 15px #3498db;"></div>
          </div>
          <button id="mb-next" class="btn btn-primary" style="margin-top:70px;width:100%;height:60px;">Schieber fixieren 🔧</button>
        `;
        const slider = shadow.querySelector('#mb-slider');
        let isDragging = false;
        slider.onpointerdown = () => isDragging = true;
        window.onpointermove = (e) => {
          if (!isDragging) return;
          const rect = slider.parentElement.getBoundingClientRect();
          let x = e.clientX - rect.left - 25;
          x = Math.max(5, Math.min(x, 225));
          slider.style.left = `${x}px`;
          sliderPos = x;
        };
        window.onpointerup = () => isDragging = false;
        shadow.querySelector('#mb-next').onclick = () => {
          if (sliderPos > 150) { layer++; render(); }
          else { shadow.style.animation = 'shake 0.5s'; }
        };
      }
      else {
        shadow.innerHTML = `
          <div style="font-size:3rem;margin-bottom:20px;">✨ BOX GEKNACKT! ✨</div>
          <div style="font-size:8rem;">🎁</div>
          <p style="font-size:1.5rem;color:#f1c40f;margin-top:20px;font-weight:bold;">Du hast alle Mechanismen gelöst!</p>
          <button id="mb-finish" class="btn btn-primary" style="margin-top:50px;width:100%;height:60px;font-size:1.3rem;">Belohnung nehmen! 🏆</button>
        `;
        shadow.querySelector('#mb-finish').onclick = () => onComplete({ correct: true, score: 100 });
      }

      container.appendChild(shadow);
    }
    render();
  }
};
