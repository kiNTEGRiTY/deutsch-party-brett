/**
 * Mini-Game: Difference Detective (Fehler-Suchbild)
 * 
 * Players spot the difference between two images based on a text.
 */

export const DifferenceDetective = {
  id: 'difference-detective',
  name_de: 'Fehler-Suchbild',
  topics: ['lesen', 'konzentration'],

  setup(container, task, onComplete) {
    container.innerHTML = `
      <div class="diff-container" style="padding: var(--space-md); text-align: center; user-select:none;">
        <div style="font-size: 1.2rem; background: #fff; padding: 15px; border-radius: 8px; border: 2px solid #bdc3c7; margin-bottom: 20px;">
           "Das Auto hat <b>2 gelbe Lichter</b>."
           <br><span style="font-size: 0.9rem; color: #7f8c8d;">Tippe auf den Fehler im UNTEREN Bild!</span>
        </div>

        <div style="display:flex; flex-direction:column; gap: 20px; align-items:center;">
            
            <!-- Original Image (Abstract representation) -->
            <div style="position:relative; width: 300px; height: 150px; background: #34495e; border-radius: 8px; overflow:hidden;">
                <div style="position:absolute; bottom: 20px; left: 100px; width: 100px; height: 40px; background: red; border-radius:10px;"></div>
                <!-- Lights -->
                <div style="position:absolute; bottom: 30px; left: 180px; width: 15px; height: 15px; background: yellow; border-radius:50%;"></div>
                <div style="position:absolute; bottom: 30px; left: 105px; width: 15px; height: 15px; background: yellow; border-radius:50%;"></div>
            </div>

            <!-- Altered Image -->
            <div id="diff-target" style="position:relative; width: 300px; height: 150px; background: #34495e; border-radius: 8px; overflow:hidden; cursor:crosshair;">
                <div style="position:absolute; bottom: 20px; left: 100px; width: 100px; height: 40px; background: red; border-radius:10px;"></div>
                <!-- Lights (one missing) -->
                <div style="position:absolute; bottom: 30px; left: 180px; width: 15px; height: 15px; background: yellow; border-radius:50%;"></div>
                <!-- Clickable error region -->
                <div id="error-spot" style="position:absolute; bottom: 10px; left: 85px; width: 50px; height: 50px; border-radius:50%; z-index: 10;"></div>
            </div>

        </div>
      </div>
    `;

    let found = false;
    const targetImg = container.querySelector('#diff-target');
    const errorSpot = container.querySelector('#error-spot');

    targetImg.addEventListener('click', (e) => {
        if (found) return;

        if (e.target === errorSpot) {
            found = true;
            errorSpot.style.border = '4px solid #2ecc71';
            errorSpot.style.background = 'rgba(46, 204, 113, 0.4)';
            
            setTimeout(() => onComplete({ correct: true, score: 100 }), 1500);
        } else {
            // Wrong click
             const x = e.offsetX;
             const y = e.offsetY;
             const xMark = document.createElement('div');
             xMark.textContent = '❌';
             Object.assign(xMark.style, {
                 position: 'absolute', left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)', fontSize: '2rem', opacity: '0.8', pointerEvents: 'none'
             });
             targetImg.appendChild(xMark);
             setTimeout(() => xMark.remove(), 1000);
        }
    });

  }
};
