/**
 * Mini-Game: Adjective Painter (Adjektiv-Maler)
 * 
 * Players drag colors to elements based on reading instructions.
 */

export const AdjectivePainter = {
  id: 'adjective-painter',
  name_de: 'Adjektiv-Maler',
  topics: ['lesen', 'adjektive'],

  setup(container, task, onComplete) {
    const tasks = [
        { sentence: "Male das Dach rot an.", target: 'dach', color: 'red' },
        { sentence: "Male die Tür blau an.", target: 'tuer', color: 'blue' },
        { sentence: "Male den Himmel gelb an.", target: 'himmel', color: 'yellow' }
    ];
    
    const currentTask = tasks[Math.floor(Math.random() * tasks.length)];
    const colors = ['red', 'blue', 'yellow', 'green', 'purple'].sort(() => Math.random() - 0.5);

    let isFinished = false;

    container.innerHTML = `
      <div class="painter-container" style="padding: var(--space-md); text-align: center; user-select:none;">
        <div style="font-size: 1.5rem; margin-bottom: 20px; font-weight: bold; padding: 15px; background: white; border-radius: 8px; border: 3px solid #34495e;">
            ${currentTask.sentence}
        </div>

        <!-- Canvas Area (Mock SVG for now) -->
        <div style="position:relative; width: 100%; max-width: 400px; height: 300px; margin: 0 auto 30px auto; border: 4px solid #bdc3c7; background: #fff; border-radius: 8px; overflow: hidden;">
            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
                <!-- Himmel -->
                <rect class="paint-target" data-id="himmel" x="0" y="0" width="100" height="50" fill="transparent" stroke="#000" stroke-width="1" />
                <!-- Haus -->
                <rect x="20" y="50" width="60" height="50" fill="transparent" stroke="#000" stroke-width="1" />
                <!-- Tür -->
                <rect class="paint-target" data-id="tuer" x="40" y="65" width="20" height="35" fill="transparent" stroke="#000" stroke-width="1" />
                <!-- Dach -->
                <polygon class="paint-target" data-id="dach" points="10,50 50,20 90,50" fill="transparent" stroke="#000" stroke-width="1" />
            </svg>
        </div>

        <!-- Color Palette -->
        <div style="display: flex; gap: 15px; justify-content: center; align-items:center;">
            ${colors.map(c => `
                <div class="color-drop" data-color="${c}" style="width: 50px; height: 50px; border-radius: 50%; background: ${c}; border: 3px solid #ecf0f1; box-shadow: 0 4px 6px rgba(0,0,0,0.2); cursor: pointer; transition: transform 0.2s;"></div>
            `).join('')}
        </div>
      </div>
    `;

    // Simple click-to-select-color and click-to-paint mechanic (better for mobile than pure drag & drop)
    let selectedColor = null;

    container.querySelectorAll('.color-drop').forEach(drop => {
        drop.addEventListener('click', () => {
             container.querySelectorAll('.color-drop').forEach(d => d.style.transform = 'none');
             drop.style.transform = 'scale(1.3) translateY(-10px)';
             selectedColor = drop.dataset.color;
        });
    });

    container.querySelectorAll('.paint-target').forEach(target => {
        target.addEventListener('click', () => {
             if (isFinished || !selectedColor) return;

             target.setAttribute('fill', selectedColor);

             // Check win condition
             if (target.dataset.id === currentTask.target) {
                 if (selectedColor === currentTask.color) {
                     isFinished = true;
                     setTimeout(() => {
                         onComplete({ correct: true, score: 100 });
                     }, 1500);
                 } else {
                     // wrong color
                     setTimeout(() => {
                         target.setAttribute('fill', 'transparent'); // erase
                     }, 500);
                 }
             } else {
                 // wrong target
                 setTimeout(() => {
                     target.setAttribute('fill', 'transparent'); // erase
                 }, 500);
             }
        });
    });
  }
};
