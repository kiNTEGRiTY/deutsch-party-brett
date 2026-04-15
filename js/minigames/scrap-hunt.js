/**
 * Mini-Game: Schnipsel-Suche (Scrap Hunt)
 * 
 * Players drag and flick cardboard scraps aside to find hidden "treasure" words.
 */

import { CardboardUtils } from '../ui/cardboard-utils.js';

export const ScrapHunt = {
  id: 'scrap-hunt',
  name_de: 'Schnipsel-Suche',
  topics: ['wortschatz', 'lesen'],

  setup(container, task, onComplete) {
    const targets = ['APFEL', 'STERN', 'GLÜCK']; // Hardcoded for now if not in task
    const found = new Set();

    // Create Game Area
    container.innerHTML = `
      <div class="scrap-hunt-container" style="position:relative; width:100%; height:450px; background:#fff; border-radius:12px; overflow:hidden; border:1px solid #ddd; display:flex; align-items:center; justify-content:center;">
        <div class="scrap-heap" style="position:absolute; inset:0;"></div>
        
        <div class="search-panel" style="position:absolute; top:10px; right:10px; width:120px; background:rgba(255,255,255,0.9); padding:10px; border-radius:8px; border:2px solid #eee; z-index:100; font-family:var(--font-handwritten);">
            <div style="font-weight:bold; margin-bottom:5px; font-size:0.9rem;">Gesucht:</div>
            ${targets.map(t => `<div id="find-${t}" style="opacity:0.5; font-size:0.8rem;">⬜ ${t}</div>`).join('')}
        </div>

        <div class="scrap-instructions" style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); font-size:0.9rem; color:#888; z-index:100;">
            Schieb die Pappen beiseite!
        </div>
      </div>
    `;

    const heap = container.querySelector('.scrap-heap');
    
    // 1. Create hidden targets
    targets.forEach(text => {
        const target = CardboardUtils.createCardboardElement('div', 'scrap-target', text);
        target.style.left = `${50 + Math.random() * 300}px`;
        target.style.top = `${100 + Math.random() * 250}px`;
        target.style.backgroundColor = '#ffd700'; // Gold
        target.style.zIndex = '5';
        heap.appendChild(target);

        target.addEventListener('click', () => {
            if (!found.has(text)) {
                found.add(text);
                target.style.transform = 'scale(1.5)';
                target.style.opacity = '0.5';
                container.querySelector(`#find-${text}`).style.opacity = '1';
                container.querySelector(`#find-${text}`).innerHTML = `✅ ${text}`;
                
                if (found.size === targets.length) {
                    setTimeout(() => onComplete({ correct: true, score: 100 }), 1000);
                }
            }
        });
    });

    // 2. Create covering scraps
    const colors = ['#f5a0a0', '#f5d5e0', '#e8d5c0', '#b0c4de', '#d0d0d0', '#e8d8c0'];
    for (let i = 0; i < 25; i++) {
        const type = i % 3 === 0 ? 'paper-star' : i % 3 === 1 ? 'paper-heart' : '';
        const scrap = CardboardUtils.createCardboardElement('div', `scrap-piece ${type}`);
        scrap.style.left = `${Math.random() * 350}px`;
        scrap.style.top = `${Math.random() * 300}px`;
        scrap.style.backgroundColor = colors[Math.random() * colors.length | 0];
        scrap.style.zIndex = `${10 + i}`;
        scrap.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        heap.appendChild(scrap);

        CardboardUtils.makeDraggable(scrap, {
            onStart: (el) => {
                el.style.zIndex = '1000';
            },
            onDrop: (el) => {
                // Optional: check if flicked far enough to remove?
            }
        });
    }

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
