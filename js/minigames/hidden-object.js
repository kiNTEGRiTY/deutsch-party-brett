/**
 * Mini-Game: Hidden Object (Wimmelbild)
 * 
 * Players find items in an image based on sentences.
 */

export const HiddenObject = {
  id: 'hidden-object',
  name_de: 'Wimmelbild',
  topics: ['lesen', 'wortschatz', 'adjektive'],

  setup(container, task, onComplete) {
    // This will later load real artwork. For now we use abstract geometry representations
    const scenes = [
        {
            image: 'url(#temp)', // placeholder
            items: [
                { id: 'bird', name: 'den kleinen, blauen Vogel', x: 20, y: 30, w: 10, h: 10, color: 'blue', shape: '50%' },
                { id: 'car', name: 'das rote Auto', x: 70, y: 70, w: 20, h: 15, color: 'red', shape: '8px' },
                { id: 'sun', name: 'die gelbe Sonne', x: 80, y: 10, w: 15, h: 15, color: 'yellow', shape: '50%' }
            ]
        }
    ];

    const currentScene = scenes[Math.floor(Math.random() * scenes.length)];
    const targetItem = currentScene.items[Math.floor(Math.random() * currentScene.items.length)];

    let found = false;

    container.innerHTML = `
      <div class="hidden-container" style="padding: var(--space-md); text-align: center; user-select:none;">
        <div style="background: rgba(255,255,255,0.8); padding: 10px 20px; border-radius: 20px; display:inline-block; margin-bottom: 20px; border: 3px solid #3498db; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 1.5rem; font-weight: bold; margin: 0; color: #2c3e50;">
                Finde <b><span style="color:#e74c3c;">${targetItem.name}</span></b>!
            </p>
        </div>

        <div id="ho-scene" style="position: relative; width: 100%; height: 50vh; max-height: 400px; background: #ecf0f1; border-radius: 12px; overflow: hidden; border: 4px solid #7f8c8d; cursor: crosshair;">
            <!-- Dummy rendering of scene objects. Later replaced by one big background-image -->
            ${currentScene.items.map(item => `
                <div class="ho-item" data-id="${item.id}" style="
                    position: absolute; 
                    left: ${item.x}%; 
                    top: ${item.y}%; 
                    width: ${item.w}%; 
                    height: ${item.h}%; 
                    background: ${item.color}; 
                    border-radius: ${item.shape};
                    opacity: 0.8;
                    box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
                "></div>
            `).join('')}
        </div>
      </div>
    `;

    const sceneEl = container.querySelector('#ho-scene');

    // Click anywhere on scene
    sceneEl.addEventListener('click', (e) => {
        if(found) return;

        // Check if clicked an item
        const clickedItem = e.target.closest('.ho-item');
        
        if (clickedItem) {
            const isTarget = clickedItem.dataset.id === targetItem.id;
            if (isTarget) {
                found = true;
                
                // Success highlight circle
                const marker = document.createElement('div');
                Object.assign(marker.style, {
                    position: 'absolute',
                    left: clickedItem.style.left,
                    top: clickedItem.style.top,
                    width: clickedItem.style.width,
                    height: clickedItem.style.height,
                    border: '5px solid #2ecc71',
                    borderRadius: '50%',
                    transform: 'scale(1.5)',
                    animation: 'pulse 1s infinite'
                });
                sceneEl.appendChild(marker);

                setTimeout(() => onComplete({ correct: true, score: 100 }), 1500);
            } else {
                // Wrong item clicked
                sceneEl.style.animation = 'shake 0.3s';
                setTimeout(() => sceneEl.style.animation = '', 300);
            }
        } else {
             // Missed entirely
             const x = e.offsetX;
             const y = e.offsetY;
             const xMark = document.createElement('div');
             xMark.textContent = '❌';
             Object.assign(xMark.style, {
                 position: 'absolute', left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)', fontSize: '2rem', opacity: '0.8'
             });
             sceneEl.appendChild(xMark);
             setTimeout(() => xMark.remove(), 1000);
        }
    });
  }
};
