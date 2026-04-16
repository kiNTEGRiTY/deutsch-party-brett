export const WordChaos = {
  id: 'word-chaos',
  name_de: 'Wort-Chaos Rush',
  topics: ['satzbau', 'lesen', 'action'],
  setup(container, task, onComplete) {
    // Example sentence
    const originalSentence = ["Der", "kleine", "Hund", "bellt", "laut"];
    const shuffled = [...originalSentence].sort(() => Math.random() - 0.5);
    let expectedIndex = 0;
    
    // UI Setup
    container.innerHTML = `
      <div style="text-align: center; width: 100%; height: 300px; position: relative; overflow: hidden; background: #e0f7fa; border-radius: 12px; border: 4px solid #00bcd4;">
        <h3 style="margin-top: 10px; color: #00838f;">Tippe die Wörter in der richtigen Reihenfolge!</h3>
        <div id="chaos-sentence" style="min-height: 40px; margin: 10px; padding: 10px; background: white; border-radius: 8px; font-weight: bold; font-size: 1.5rem;"></div>
        <div id="chaos-arena" style="position: absolute; top: 100px; left: 0; right: 0; bottom: 0;"></div>
      </div>
    `;

    const arena = container.querySelector('#chaos-arena');
    const sentenceBox = container.querySelector('#chaos-sentence');
    
    const words = [];
    
    shuffled.forEach((word) => {
      const el = document.createElement('div');
      el.textContent = word;
      
      // Mario Party bubble styling
      Object.assign(el.style, {
        position: 'absolute',
        padding: '10px 20px',
        background: '#ff4081',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        borderRadius: '30px',
        boxShadow: '0 5px 0 #c2185b',
        cursor: 'pointer',
        userSelect: 'none',
        left: Math.random() * 70 + '%',
        top: Math.random() * 50 + '%',
        transition: 'transform 0.1s'
      });
      
      // Bouncing animation logic
      let dx = (Math.random() - 0.5) * 4;
      let dy = (Math.random() - 0.5) * 4;
      let x = parseFloat(el.style.left);
      let y = parseFloat(el.style.top);
      
      const bounce = setInterval(() => {
        x += dx;
        y += dy;
        
        if(x <= 0 || x >= 80) dx = -dx;
        if(y <= 0 || y >= 80) dy = -dy;
        
        el.style.left = x + '%';
        el.style.top = y + '%';
      }, 50);
      
      el.addEventListener('mousedown', () => {
        el.style.transform = 'scale(0.9)';
      });
      
      el.addEventListener('click', () => {
        if(word === originalSentence[expectedIndex]) {
          // Correct!
          sentenceBox.textContent += word + " ";
          el.remove();
          clearInterval(bounce);
          expectedIndex++;
          
          // Win condition
          if(expectedIndex === originalSentence.length) {
            sentenceBox.style.background = '#c8e6c9';
            sentenceBox.style.color = '#2e7d32';
            setTimeout(() => onComplete({ correct: true, score: 100 }), 1000);
          }
        } else {
          // Wrong! Shake animation
          el.style.background = '#d32f2f';
          el.style.boxShadow = '0 5px 0 #b71c1c';
          setTimeout(() => {
            el.style.background = '#ff4081';
            el.style.boxShadow = '0 5px 0 #c2185b';
          }, 300);
        }
      });
      
      words.push(el);
      arena.appendChild(el);
    });
  }
};
