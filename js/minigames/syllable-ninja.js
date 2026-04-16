export const SyllableNinja = {
  id: 'syllable-ninja',
  name_de: 'Silben-Ninja',
  topics: ['silben', 'nomen', 'action'],
  setup(container, task, onComplete) {
    const nouns = ['Au-to', 'Ba-na-ne', 'Scho-ko-la-de', 'Hund', 'Ti-ger', 'Com-pu-ter'];
    let targetWordList = nouns.sort(() => Math.random() - 0.5).slice(0, 3);
    
    let currentWordIndex = 0;
    
    container.innerHTML = `
      <div style="text-align: center; width: 100%; height: 350px; background: #2c3e50; border-radius: 12px; position: relative; overflow: hidden; border: 4px solid #f1c40f;">
         <h3 style="color: #ecf0f1; margin-top: 10px;">Zerschneide die Wörter an den Silben! (Wische darüber)</h3>
         <div id="ninja-arena" style="position: absolute; inset: 0;"></div>
      </div>
    `;

    const arena = container.querySelector('#ninja-arena');
    
    let isDrawing = false;
    let oldX = 0, oldY = 0;

    // Draw slice lines
    arena.addEventListener('mousedown', (e) => { isDrawing = true; oldX = e.offsetX; oldY = e.offsetY; });
    arena.addEventListener('mouseup', () => isDrawing = false);
    arena.addEventListener('mouseleave', () => isDrawing = false);
    
    arena.addEventListener('mousemove', (e) => {
      if(!isDrawing) return;
      const slice = document.createElement('div');
      Object.assign(slice.style, {
        position: 'absolute',
        background: 'white',
        height: '4px',
        width: '20px',
        left: e.offsetX + 'px',
        top: e.offsetY + 'px',
        borderRadius: '10px',
        pointerEvents: 'none',
        boxShadow: '0 0 10px #fff',
        opacity: 1,
        transition: 'opacity 0.2s'
      });
      arena.appendChild(slice);
      setTimeout(() => slice.style.opacity = 0, 50);
      setTimeout(() => slice.remove(), 250);
      
      // Check collision
      checkSlice(e.offsetX, e.offsetY);
    });

    function spawnNextWord() {
      if(currentWordIndex >= targetWordList.length) {
         setTimeout(() => onComplete({ correct: true, score: 100 }), 1000);
         return;
      }
      
      const wordObj = targetWordList[currentWordIndex];
      const syllables = wordObj.split('-');
      
      // If it's a 1-syllable word ("Hund"), no cuts needed, it just falls and clears?
      // For this demo, let's keep it simple: just slice the box generally to "cut" the word in half.
      
      const wordBox = document.createElement('div');
      wordBox.textContent = wordObj.replace(/-/g, '');
      Object.assign(wordBox.style, {
        position: 'absolute',
        bottom: '-50px',
        left: (20 + Math.random() * 60) + '%',
        background: '#e74c3c',
        color: 'white',
        padding: '15px 30px',
        fontSize: '2rem',
        fontWeight: 'bold',
        borderRadius: '8px',
        boxShadow: '0 8px 0 #c0392b',
        userSelect: 'none'
      });
      
      arena.appendChild(wordBox);
      
      // Toss up physics
      let y = -50;
      let dy = 15;
      let cut = false;
      
      const toss = setInterval(() => {
        y += dy;
        dy -= 0.5; // gravity
        
        wordBox.style.bottom = y + 'px';
        
        // If sliced!
        if (wordBox.dataset.sliced && !cut) {
           cut = true;
           wordBox.textContent = syllables.join(' - ');
           wordBox.style.background = '#2ecc71';
           wordBox.style.boxShadow = '0 8px 0 #27ae60';
           wordBox.style.transform = 'scale(1.2)';
           
           setTimeout(() => {
             clearInterval(toss);
             wordBox.remove();
             currentWordIndex++;
             spawnNextWord();
           }, 800);
        }
        
        if (y < -100 && !cut) {
           // Missed!
           clearInterval(toss);
           wordBox.remove();
           currentWordIndex++;
           spawnNextWord();
        }
      }, 30);
    }
    
    function checkSlice(x, y) {
      const boxes = arena.querySelectorAll('div');
      boxes.forEach(box => {
        if(box.textContent && !box.dataset.sliced) {
          const rect = box.getBoundingClientRect();
          const arenaRect = arena.getBoundingClientRect();
          const pX = rect.left - arenaRect.left;
          const pY = rect.top - arenaRect.top;
          
          if(x >= pX && x <= pX + rect.width && y >= pY && y <= pY + rect.height) {
            box.dataset.sliced = "true";
          }
        }
      });
    }

    // Start
    setTimeout(spawnNextWord, 1000);
  }
};
