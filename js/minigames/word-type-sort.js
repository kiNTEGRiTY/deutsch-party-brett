/**
 * Mini-Game: Word Type Sort (Wortarten-Sortierer)
 * 
 * Players sort cardboard word-scraps into cardboard bins (Nomen/Verben/Adjektive).
 */

import { CardboardUtils } from '../ui/cardboard-utils.js';

export const WordTypeSort = {
  id: 'word-type-sort',
  name_de: 'Wortarten-Sortierer',
  topics: ['nomen', 'verben', 'adjektive'],

  setup(container, task, onComplete) {
    const { mixedSets } = task.content;
    if (!mixedSets || mixedSets.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    const set = mixedSets[Math.floor(Math.random() * mixedSets.length)];
    const words = [...set.words].sort(() => Math.random() - 0.5);
    
    const categories = {
      nomen: { label: 'Nomen', correct: set.nomen },
      verben: { label: 'Verben', correct: set.verben },
      adjektive: { label: 'Adjektive', correct: set.adjektive }
    };

    let sortedCount = 0;
    let correctCount = 0;
    const totalWords = words.length;

    // Render
    container.innerHTML = `
      <div class="stapler-container">
        <div class="word-pool" style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; padding:20px; min-height:120px; z-index:10;"></div>
        
        <div class="sort-columns" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 15px; width:100%; padding:10px;">
          ${Object.entries(categories).map(([key, cat]) => `
            <button class="sorting-bin" type="button" data-category="${key}">
              <div class="sorting-bin-label">${cat.label}</div>
              <div class="bin-content" style="display:flex; flex-direction:column; gap:5px; align-items:center;"></div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const pool = container.querySelector('.word-pool');
    const bins = container.querySelectorAll('.sorting-bin');
    let selectedScrap = null;

    const finishIfComplete = () => {
      if (sortedCount < totalWords) {
        return;
      }

      const score = Math.round((correctCount / totalWords) * 100);
      setTimeout(() => onComplete({ correct: score >= 80, partial: score >= 50, score }), 1000);
    };

    const placeScrapInBin = (el, droppedInBin) => {
      if (!el || !droppedInBin || el.dataset.sorted === 'true') {
        return;
      }

      const word = el.dataset.word;
      const category = droppedInBin.dataset.category;
      const isCorrect = categories[category].correct.includes(word);
      const binContent = droppedInBin.querySelector('.bin-content');

      el.dataset.sorted = 'true';
      el.classList.remove('is-selected');
      selectedScrap = null;
      el.style.position = 'relative';
      el.style.left = '0';
      el.style.top = '0';
      el.style.zIndex = 'auto';
      el.style.transform = `rotate(${Math.random() * 4 - 2}deg) scale(0.9)`;
      binContent.appendChild(el);

      if (isCorrect) {
        correctCount++;
        el.style.backgroundColor = '#a3de83';
      } else {
        el.style.backgroundColor = '#ff8a5c';
        CardboardUtils.wobble(el);
      }

      el.style.pointerEvents = 'none';
      el.disabled = true;
      sortedCount++;
      finishIfComplete();
    };

    words.forEach((word) => {
      const scrap = CardboardUtils.createCardboardElement('button', 'word-scrap', word);
      scrap.type = 'button';
      scrap.dataset.word = word;
      scrap.style.position = 'relative'; // Let layout handle initial pos in pool
      scrap.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
      pool.appendChild(scrap);

      scrap.addEventListener('click', () => {
        if (scrap.dataset.sorted === 'true') {
          return;
        }

        pool.querySelectorAll('.word-scrap.is-selected').forEach((node) => node.classList.remove('is-selected'));
        selectedScrap = scrap;
        scrap.classList.add('is-selected');
      });

      // Tap-first control: select a word, then tap the category. The old drag layer
      // positioned all scraps absolutely and made the game look broken in the shell.
    });

    bins.forEach((bin) => {
      bin.addEventListener('click', () => {
        if (!selectedScrap) {
          CardboardUtils.wobble(bin);
          return;
        }

        placeScrapInBin(selectedScrap, bin);
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
  }
};
