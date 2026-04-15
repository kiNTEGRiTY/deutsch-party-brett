/**
 * Mini-Game: Pappen-Stapler (Sentence Stacker)
 * 
 * Players drag cardboard boxes to build a tower in the correct sentence order.
 */

import { CardboardUtils } from '../ui/cardboard-utils.js';

export const SentenceStacker = {
  id: 'sentence-stacker',
  name_de: 'Pappen-Stapler',
  topics: ['satzbau'],

  setup(container, task, onComplete) {
    const { words, correct } = task.content;
    const targetWords = words || correct || [];
    
    if (targetWords.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    // Shuffle words for the pool
    const shuffledWords = [...targetWords].sort(() => Math.random() - 0.5);
    
    // Create Game Area
    container.innerHTML = `
      <div class="stapler-container">
        <div class="stack-target" style="opacity: 0.5;">Baue den Satz von unten nach oben!</div>
        <div class="word-pool" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; padding:20px; z-index:10;"></div>
        <div class="stapler-base" style="width: 300px; height: 30px; background: #8b6b4a; border-radius: 15px; margin-top: auto; box-shadow: 0 10px 20px rgba(0,0,0,0.2);"></div>
      </div>
    `;

    const pool = container.querySelector('.word-pool');
    const containerDiv = container.querySelector('.stapler-container');
    const boxes = [];

    // Create boxes
    shuffledWords.forEach((word) => {
      const box = CardboardUtils.createCardboardElement('div', 'staple-box', word);
      box.dataset.word = word;
      box.style.position = 'relative'; 
      box.style.transform = `rotate(${Math.random() * 8 - 4}deg)`;
      
      pool.appendChild(box);
      boxes.push(box);

      // Make Draggable
      CardboardUtils.makeDraggable(box, {
        onStart: (el) => {
          el.style.transform = 'scale(1.1) rotate(0deg)';
          el.style.zIndex = '100';
          containerDiv.querySelector('.stack-target').style.opacity = '0.8';
        },
        onDrop: (el) => {
          el.style.transform = `rotate(${Math.random() * 4 - 2}deg)`;
          this.checkStack(boxes, targetWords, onComplete);
        }
      });
    });

    // Ensure CSS
    if (!document.getElementById('cardboard-games-css')) {
      const link = document.createElement('link');
      link.id = 'cardboard-games-css';
      link.rel = 'stylesheet';
      link.href = 'css/cardboard-games.css';
      document.head.appendChild(link);
    }
  },

  checkStack(boxes, correctWords, onComplete) {
    // Sort all boxes by their vertical position (Y), but we want BOTTOM to TOP
    // So higher Y (bottom of screen) comes first in the sentence? 
    // Actually, usually you stack "Bottom to Top" so the first word is at the bottom.
    const sortedBoxes = [...boxes]
        .filter(b => b.parentElement.classList.contains('stapler-container')) // Only those in the stack area
        .sort((a, b) => b.offsetTop - a.offsetTop); // Highest OffsetTop (bottom) first
    
    if (sortedBoxes.length < correctWords.length) return;

    const currentOrder = sortedBoxes.map(b => b.dataset.word);
    
    // Check horizontal alignment (should be roughly centered)
    const containerMid = 350; // Approximated
    const isAligned = sortedBoxes.every(b => {
        const mid = b.offsetLeft + b.offsetWidth / 2;
        return Math.abs(mid - containerMid) < 100;
    });

    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(correctWords);

    if (isAligned && isCorrect) {
      sortedBoxes.forEach((b, i) => {
        b.style.backgroundColor = '#a3de83';
        b.style.transition = 'all 0.5s ease';
        b.style.transform = `rotate(${(i % 2 === 0 ? 1 : -1)}deg)`;
      });

      setTimeout(() => {
        onComplete({ correct: true, score: 100 });
      }, 1000);
    } else if (sortedBoxes.length === correctWords.length) {
        // Full stack but wrong or unaligned
        sortedBoxes.forEach(b => CardboardUtils.wobble(b));
    }
  }
};
